package com.mathlearning.core.database

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-01 local schema, migration policy, and fail-closed persistence tests. */
class LocalLearningDatabaseTest {

    @Test
    fun `station packages keyed by stationId version sha256 with single active version`() {
        val db = LocalLearningDatabase()
        db.upsertStationPackage(LocalStationPackageEntity("ST07", 1, "aaa", isActive = true, payload = mapOf("prompt" to "p1")))
        db.upsertStationPackage(LocalStationPackageEntity("ST07", 2, "bbb", isActive = true, payload = mapOf("prompt" to "p2")))
        // Old version retained but demoted; exactly one active.
        assertEquals(2, db.stationPackages.size)
        assertEquals(1, db.stationPackages.count { it.isActive })
        assertEquals("p2", db.activeStationPackage("ST07")?.payload?.get("prompt"))
        assertEquals("bbb", db.activeStationPackage("ST07")?.sha256)
        assertNull(db.activeStationPackage("ST01"))
    }

    @Test
    fun `offline-first read returns the last server-verified progress`() {
        val db = LocalLearningDatabase()
        db.upsertProgress(LocalProgressProjectionEntity("child-1", "ST01", 1, "COMPLETED", 100L))
        db.upsertProgress(LocalProgressProjectionEntity("child-1", "ST02", 1, "CURRENT", 200L))
        db.upsertProgress(LocalProgressProjectionEntity("child-2", "ST01", 1, "COMPLETED", 300L))
        assertEquals(2, db.verifiedProgress("child-1").size)
        assertEquals("CURRENT", db.verifiedProgress("child-1").first { it.stationId == "ST02" }.status)
    }

    @Test
    fun `outbox operations deduplicate on idempotency key`() {
        val db = LocalLearningDatabase()
        db.enqueueOutbox(OutboxSyncOperationEntity("op-1", "ATTEMPT", mapOf("choiceId" to "opt-1")))
        db.enqueueOutbox(OutboxSyncOperationEntity("op-1", "ATTEMPT", mapOf("choiceId" to "opt-1")))
        assertEquals(1, db.outboxOperations.size)
        db.updateOutbox(db.outboxOperations.first().copy(attemptCount = 1, backoffUntilEpochMs = 999L))
        assertEquals(1, db.outboxOperations.first().attemptCount)
        assertEquals(999L, db.outboxOperations.first().backoffUntilEpochMs)
        assertThrows(IllegalArgumentException::class.java) {
            db.updateOutbox(OutboxSyncOperationEntity("unknown", "ATTEMPT", emptyMap()))
        }
    }

    @Test
    fun `migration v1 to v2 preserves rows - downgrade and corrupt fail closed`() {
        val db = LocalLearningDatabase(initialVersion = 1)
        db.upsertStationPackage(LocalStationPackageEntity("ST01", 1, "sha", isActive = true, payload = mapOf("prompt" to "p")))
        db.upsertProgress(LocalProgressProjectionEntity("child-1", "ST01", 1, "COMPLETED", 1L))
        db.enqueueOutbox(OutboxSyncOperationEntity("op-1", "ATTEMPT", emptyMap()))
        db.migrateTo(2)
        assertEquals(2, db.schemaVersion)
        assertEquals(1, db.stationPackages.size)
        assertEquals(1, db.progressProjections.size)
        assertEquals(1, db.outboxOperations.size)
        // Reopen same version: no-op.
        db.migrateTo(2)
        // Downgrade rejected.
        assertThrows(DowngradeRejectedException::class.java) { db.migrateTo(1) }
        // Unknown future version rejected.
        assertThrows(DowngradeRejectedException::class.java) { db.migrateTo(3) }
        // Corrupt (unreadable) database rejected, never silently recreated.
        val corrupt = LocalLearningDatabase(initialVersion = 0)
        corrupt.markCorrupt()
        assertThrows(CorruptDatabaseException::class.java) { corrupt.migrateTo(2) }
        assertThrows(CorruptDatabaseException::class.java) { corrupt.upsertProgress(LocalProgressProjectionEntity("c", "ST01", 1, "COMPLETED", 1L)) }
    }

    @Test
    fun `forbidden answer-key fields rejected before persistence (CONTENT-008)`() {
        val db = LocalLearningDatabase()
        assertThrows(ForbiddenFieldException::class.java) {
            db.upsertStationPackage(LocalStationPackageEntity("ST01", 1, "sha", true, mapOf("evaluatorConfig" to "{}")))
        }
        assertThrows(ForbiddenFieldException::class.java) {
            db.upsertStationPackage(LocalStationPackageEntity("ST01", 1, "sha", true, mapOf("answerKey" to "[2]")))
        }
        assertThrows(ForbiddenFieldException::class.java) {
            db.enqueueOutbox(OutboxSyncOperationEntity("op", "ATTEMPT", mapOf("pass_threshold" to "3/4")))
        }
        // Nothing was persisted from the rejected writes.
        assertTrue(db.stationPackages.isEmpty())
        assertTrue(db.outboxOperations.isEmpty())
        // Case-insensitive guard.
        assertThrows(ForbiddenFieldException::class.java) {
            db.upsertStationPackage(LocalStationPackageEntity("ST01", 1, "sha", true, mapOf("ANSWERKEY" to "x")))
        }
    }

    @Test
    fun `audio assets keyed by audioId with publish state and voice profile`() {
        val db = LocalLearningDatabase()
        db.upsertAudioAsset(LocalAudioAssetEntity("ST07.P1.s01.a", localFileRef = null, sha256 = null, publishState = "UNPUBLISHED_NO_BINARY", voiceProfileId = "vp-fa-01"))
        assertNotNull(db.audioAsset("ST07.P1.s01.a"))
        assertNull(db.audioAsset("ST07.P1.s01.a")?.localFileRef) // no binary exists
        db.upsertAudioAsset(LocalAudioAssetEntity("ST07.P1.s01.a", localFileRef = "cache/a.ogg", sha256 = LocalSchema.sha256Hex("x".toByteArray()), publishState = "PUBLISHED", voiceProfileId = "vp-fa-01"))
        assertEquals("cache/a.ogg", db.audioAsset("ST07.P1.s01.a")?.localFileRef)
    }
}
