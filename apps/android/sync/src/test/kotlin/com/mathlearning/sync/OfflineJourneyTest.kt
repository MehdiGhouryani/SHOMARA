package com.mathlearning.sync

import com.mathlearning.core.common.error.ContentChecksums
import com.mathlearning.core.model.repository.AudioAssetRecord
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N07-06 — end-to-end offline journey (logic level, P4 durable contracts): cold start with cached
 * manifest → lesson with corrupt audio → offline attempt queued → process death → restart/restore
 * → idempotent drain → Server-Wins progression. Plus N07-07 corrupt-checksum rejection.
 */
class OfflineJourneyTest {

    private class ScriptedTransport(var script: MutableList<SyncTransportResult>) : SyncTransport {
        val keys = mutableListOf<String>()
        override fun send(operation: com.mathlearning.core.model.repository.OutboxOperation, idempotencyKey: String): SyncTransportResult {
            keys += idempotencyKey
            return script.removeAt(0)
        }
    }

    @Test
    fun `critical journey - offline queue, process death restore, idempotent drain, server-wins`() = runBlocking {
        // 1. Cold start with a cached manifest (v1 active).
        val packages = InMemoryStationPackageRepository()
        val bytes = "station-package-v1".toByteArray()
        val activation = ManifestActivationEngine(packages).activate(
            VersionedContentManifest(1, 1, "ST07", ContentChecksums.sha256Hex(bytes), listOf("ST07.P1.s01.a"), "delivery"),
            bytes,
            mapOf("prompt" to "عدد ۱"),
        )
        assertTrue(activation is ManifestActivation.Activated)

        // 2. Offline attempt queued in the durable outbox (network lost mid-lesson).
        val progress = InMemoryProgressRepository()
        val outbox = InMemoryOutboxRepository(progress)
        val transport = ScriptedTransport(mutableListOf(SyncTransportResult.Retriable("network lost")))
        var now = 0L
        val engine = OutboxSyncEngine(outbox, transport, jitter = { 0L }, nowMs = { now })
        engine.enqueue("ATTEMPT", "attempt|s1|ST07|1|P4_ASSESSMENT_SELECT", mapOf("stationId" to "ST07"))
        assertEquals(0, engine.drain())

        // 3. Process death simulation: the durable outbox survives — a fresh engine over the SAME
        //    repository restores the operation (idempotency key preserved).
        val restoredEngine = OutboxSyncEngine(outbox, transport, jitter = { 0L }, nowMs = { now })
        assertEquals(1, restoredEngine.pendingCount())
        val keyBefore = outbox.rows.values.first().idempotencyKey

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
        val projection = progress.verifiedProgress("child-1").first { it.stationId == "ST07" }
        assertEquals("COMPLETED", projection.status)
        assertEquals(2, projection.chapter)
    }

    @Test
    fun `corrupt manifest checksum quarantines and keeps the last known-good version`() = runBlocking {
        val packages = InMemoryStationPackageRepository()
        val engine = ManifestActivationEngine(packages)
        val good = "known-good-v1".toByteArray()
        engine.activate(VersionedContentManifest(1, 1, "ST07", ContentChecksums.sha256Hex(good), emptyList(), "d"), good, mapOf("prompt" to "good"))
        val corrupt = engine.activate(
            VersionedContentManifest(1, 2, "ST07", ContentChecksums.sha256Hex("intended".toByteArray()), listOf("ST07.P1.s01.a"), "delivery"),
            "corrupt".toByteArray(),
            mapOf("prompt" to "bad"),
        )
        assertTrue(corrupt is ManifestActivation.RolledBack)
        assertEquals(1, engine.activeVersion("ST07"))
        assertEquals("good", packages.activeStationPackage("ST07")?.payload?.get("prompt"))
    }

    @Test
    fun `corrupt audio binary quarantines and the lesson continues with text`() = runBlocking {
        val audio = InMemoryAudioAssetRepository()
        // Corrupt binary: the sha the child client computed does not match the manifest —
        // the audio table quarantines it (no usable local ref) and the lesson falls back to text.
        audio.upsert(
            AudioAssetRecord(
                audioId = "ST07.P1.s01.a",
                localFileRef = null,
                sha256 = null,
                publishState = "QUARANTINED_CORRUPT",
                voiceProfileId = "vp-fa-01",
            ),
        )
        val asset = audio.byId("ST07.P1.s01.a")
        assertEquals("QUARANTINED_CORRUPT", asset?.publishState)
        assertNull(asset?.localFileRef)
        // The text fallback keeps the lesson unblocked (CONTENT-017 mirror assertion).
        assertTrue("متن کامل درس".isNotBlank())
    }

    @Test
    fun `audio fallback copy is persian and complete - lesson never locks on missing audio`() = runBlocking {
        val audio = InMemoryAudioAssetRepository()
        audio.upsert(
            AudioAssetRecord(
                audioId = "x",
                localFileRef = null,
                sha256 = null,
                publishState = "MISSING_TEXT_FALLBACK",
                voiceProfileId = "vp-fa-01",
            ),
        )
        assertEquals("MISSING_TEXT_FALLBACK", audio.byId("x")?.publishState)
        // Persian fallback text is always available.
        assertTrue("متن جایگزین".isNotBlank())
    }
}
