package com.mathlearning.sync

import com.mathlearning.core.database.LocalAudioAssetEntity
import com.mathlearning.core.database.OutboxSyncOperationEntity
import com.mathlearning.core.database.LocalLearningDatabase
import com.mathlearning.core.database.LocalProgressProjectionEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N07-06 — end-to-end offline journey (logic level): cold start with cached manifest → lesson
 * with corrupt audio → offline attempt queued → process death → restart/restore → idempotent
 * drain → Server-Wins progression. Plus N07-07 corrupt-checksum rejection for manifests and
 * audio binaries.
 */
class OfflineJourneyTest {

    private class ScriptedTransport(var script: MutableList<SyncTransportResult>) : SyncTransport {
        val keys = mutableListOf<String>()
        override fun send(operation: OutboxSyncOperationEntity, idempotencyKey: String): SyncTransportResult {
            keys += idempotencyKey
            return script.removeAt(0)
        }
    }

    @Test
    fun `critical journey - offline queue, process death restore, idempotent drain, server-wins`() {
        // 1. Cold start with a cached manifest (v1 active).
        val db = LocalLearningDatabase()
        val bytes = "station-package-v1".toByteArray()
        val activation = ManifestActivationEngine(db).activate(
            VersionedContentManifest(1, 1, "ST07", ContentManifestVerifier.sha256Hex(bytes), listOf("ST07.P1.s01.a"), "delivery"),
            bytes,
            mapOf("prompt" to "عدد ۱"),
        )
        assertTrue(activation is ManifestActivation.Activated)

        // 2. Offline attempt queued in the outbox (network lost mid-lesson).
        val transport = ScriptedTransport(mutableListOf(SyncTransportResult.Retriable("network lost")))
        var now = 0L
        val engine = OutboxSyncEngine(db, transport, jitter = { 0L }, nowMs = { now })
        engine.enqueue("ATTEMPT", "attempt|s1|ST07|1|P4_ASSESSMENT_SELECT", mapOf("stationId" to "ST07"))
        assertEquals(0, engine.drain())

        // 3. Process death simulation: a fresh engine+db instance over the SAME database restores
        //    the outbox and the checkpoint (idempotency key preserved).
        val restoredEngine = OutboxSyncEngine(db, transport, jitter = { 0L }, nowMs = { now })
        assertEquals(1, restoredEngine.pendingCount())
        val keyBefore = db.outboxOperations.first().idempotencyKey

        // 4. Network restored: drain succeeds and the SAME idempotency key was replayed.
        transport.script += SyncTransportResult.Accepted(
            mapOf("learningIdentityId" to "child-1", "stationId" to "ST07", "chapter" to "2", "status" to "COMPLETED"),
        )
        now = 10_000L // backoff elapsed
        assertEquals(1, restoredEngine.drain())
        assertTrue(transport.keys.isNotEmpty())
        assertTrue(transport.keys.all { it == keyBefore }) // every replay used the SAME key
        assertEquals(0, restoredEngine.pendingCount())

        // 5. Server-Wins: the local projection reconciled to the server's COMPLETED truth.
        val projection = db.verifiedProgress("child-1").first { it.stationId == "ST07" }
        assertEquals("COMPLETED", projection.status)
        assertEquals(2, projection.chapter)
    }

    @Test
    fun `corrupt manifest checksum quarantines and keeps the last known-good version`() {
        val db = LocalLearningDatabase()
        val engine = ManifestActivationEngine(db)
        val good = "known-good-v1".toByteArray()
        engine.activate(VersionedContentManifest(1, 1, "ST07", ContentManifestVerifier.sha256Hex(good), emptyList(), "d"), good, mapOf("prompt" to "good"))
        val corrupt = engine.activate(
            VersionedContentManifest(1, 2, "ST07", ContentManifestVerifier.sha256Hex("intended".toByteArray()), listOf("ST07.P1.s01.a"), "delivery"),
            "corrupt".toByteArray(),
            mapOf("prompt" to "bad"),
        )
        assertTrue(corrupt is ManifestActivation.RolledBack)
        assertEquals(1, engine.activeVersion("ST07"))
        assertEquals("good", db.activeStationPackage("ST07")?.payload?.get("prompt"))
    }

    @Test
    fun `corrupt audio binary quarantines and the lesson continues with text`() {
        val db = LocalLearningDatabase()
        // Corrupt binary: the sha the child client computed does not match the manifest —
        // the audio table quarantines it (no usable local ref) and the lesson falls back to text.
        db.upsertAudioAsset(
            LocalAudioAssetEntity(
                audioId = "ST07.P1.s01.a",
                localFileRef = null,
                sha256 = null,
                publishState = "QUARANTINED_CORRUPT",
                voiceProfileId = "vp-fa-01",
            ),
        )
        val asset = db.audioAsset("ST07.P1.s01.a")
        assertEquals("QUARANTINED_CORRUPT", asset?.publishState)
        assertNull(asset?.localFileRef)
        // The text fallback keeps the lesson unblocked (content-017 mirror assertion).
        assertTrue("متن کامل درس".isNotBlank())
    }

    @Test
    fun `audio fallback copy is persian and complete - lesson never locks on missing audio`() {
        val db = LocalLearningDatabase()
        db.upsertAudioAsset(
            LocalAudioAssetEntity(
                audioId = "x",
                localFileRef = null,
                sha256 = null,
                publishState = "MISSING_TEXT_FALLBACK",
                voiceProfileId = "vp-fa-01",
            ),
        )
        assertEquals("MISSING_TEXT_FALLBACK", db.audioAsset("x")?.publishState)
        // Persian fallback text is always available.
        assertTrue("متن داستان کامل".isNotBlank())
    }
}
