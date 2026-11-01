package com.mathlearning.sync

import com.mathlearning.core.database.LocalLearningDatabase
import com.mathlearning.core.database.LocalProgressProjectionEntity
import com.mathlearning.core.database.OutboxSyncOperationEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-02 idempotent sync queue + Server-Wins conflict policy tests. */
class OutboxSyncEngineTest {

    class RecordingTransport(
        val script: MutableList<SyncTransportResult>,
        val receivedKeys: MutableList<String> = mutableListOf(),
    ) : SyncTransport {
        override fun send(operation: OutboxSyncOperationEntity, idempotencyKey: String): SyncTransportResult {
            receivedKeys += idempotencyKey
            return script.removeAt(0)
        }
    }

    private fun db(): LocalLearningDatabase = LocalLearningDatabase()

    @Test
    fun `fifo drain accepts in order and removes accepted operations`() {
        val db = db()
        val transport = RecordingTransport(
            mutableListOf(
                SyncTransportResult.Accepted(mapOf("learningIdentityId" to "c1", "stationId" to "ST01", "status" to "COMPLETED")),
                SyncTransportResult.Accepted(emptyMap()),
            ),
        )
        val engine = OutboxSyncEngine(db, transport, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", mapOf("stationId" to "ST01"))
        engine.enqueue("CHECKPOINT", "op-2", emptyMap())
        assertEquals(2, engine.pendingCount())
        assertEquals(2, engine.drain())
        assertEquals(0, engine.pendingCount())
        assertEquals(listOf("op-1", "op-2"), transport.receivedKeys)
    }

    @Test
    fun `retriable failure applies exponential backoff with jitter and preserves the key`() {
        val db = db()
        val transport = RecordingTransport(mutableListOf(SyncTransportResult.Retriable("503")))
        var now = 0L
        val engine = OutboxSyncEngine(db, transport, jitter = { 100L }, nowMs = { now })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        assertEquals(0, engine.drain())
        val afterFirst = db.outboxOperations.first()
        assertEquals(1, afterFirst.attemptCount)
        assertEquals("op-1", afterFirst.idempotencyKey)
        // 750 * 2^1 + 100 = 1600
        assertEquals(now + 1600L, afterFirst.backoffUntilEpochMs)
        // Backoff not elapsed yet: drain skips it.
        now = afterFirst.backoffUntilEpochMs - 1
        assertEquals(0, engine.drain())
        // Backoff elapsed: retry preserves the SAME key.
        now = afterFirst.backoffUntilEpochMs + 1
        transport.script += SyncTransportResult.Accepted(emptyMap())
        engine.drain()
        assertEquals(listOf("op-1", "op-1"), transport.receivedKeys)
    }

    @Test
    fun `repeated failures quarantine after max attempts`() {
        val db = db()
        val transport = RecordingTransport(mutableListOf())
        val engine = OutboxSyncEngine(db, transport, maxAttempts = 3, backoffBaseMs = 0L, jitter = { 0L }, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        repeat(3) {
            transport.script += SyncTransportResult.Retriable("offline")
            engine.drain()
        }
        assertEquals(1, engine.quarantinedCount())
        assertEquals(0, engine.pendingCount())
    }

    @Test
    fun `rejected 4xx quarantines immediately - never retried`() {
        val db = db()
        val transport = RecordingTransport(mutableListOf(SyncTransportResult.Rejected("schema rejection 400")))
        val engine = OutboxSyncEngine(db, transport, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        assertEquals(0, engine.drain())
        assertEquals(1, engine.quarantinedCount())
        assertEquals(1, transport.receivedKeys.size) // exactly one attempt, no retry
    }

    @Test
    fun `server-wins - accepted sync reconciles local progress to server truth`() {
        val db = db()
        // Local optimistic progress says CURRENT (child guessed ahead while offline).
        db.upsertProgress(LocalProgressProjectionEntity("c1", "ST03", 1, "CURRENT_LOCAL_OPTIMISTIC", 1L))
        val transport = RecordingTransport(
            mutableListOf(
                SyncTransportResult.Accepted(
                    mapOf("learningIdentityId" to "c1", "stationId" to "ST03", "chapter" to "1", "status" to "COMPLETED"),
                ),
            ),
        )
        val engine = OutboxSyncEngine(db, transport, nowMs = { 42L })
        engine.enqueue("ATTEMPT", "op-1", mapOf("stationId" to "ST03"))
        engine.drain()
        // Local cache reconciled to SERVER truth — local optimistic status overwritten.
        val reconciled = db.verifiedProgress("c1").first { it.stationId == "ST03" }
        assertEquals("COMPLETED", reconciled.status)
        assertEquals(42L, reconciled.verifiedAtMs)
    }

    @Test
    fun `backoff with zero jitter is deterministic exponential capped`() {
        val engine = OutboxSyncEngine(db(), { _, _ -> SyncTransportResult.Retriable("x") }, jitter = { 0L })
        assertEquals(1500L, engine.backoffMsFor(1))
        assertEquals(3000L, engine.backoffMsFor(2))
        assertEquals(300_000L, engine.backoffMsFor(20))
    }
}
