package com.mathlearning.sync

import com.mathlearning.core.model.repository.OutboxOperation
import com.mathlearning.core.model.repository.ProgressProjection
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-02 idempotent sync queue + Server-Wins conflict policy tests (P4: durable contracts). */
class OutboxSyncEngineTest {

    class RecordingTransport(
        val script: MutableList<SyncTransportResult>,
        val receivedKeys: MutableList<String> = mutableListOf(),
    ) : SyncTransport {
        override fun send(operation: OutboxOperation, idempotencyKey: String): SyncTransportResult {
            receivedKeys += idempotencyKey
            return script.removeAt(0)
        }
    }

    @Test
    fun `fifo drain accepts in order and removes accepted operations`() = runBlocking {
        val outbox = InMemoryOutboxRepository()
        val transport = RecordingTransport(
            mutableListOf(
                SyncTransportResult.Accepted(mapOf("learningIdentityId" to "c1", "stationId" to "ST01", "status" to "COMPLETED")),
                SyncTransportResult.Accepted(emptyMap()),
            ),
        )
        val engine = OutboxSyncEngine(outbox, transport, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", mapOf("stationId" to "ST01"))
        engine.enqueue("CHECKPOINT", "op-2", emptyMap())
        assertEquals(2, engine.pendingCount())
        assertEquals(2, engine.drain())
        assertEquals(0, engine.pendingCount())
        assertEquals(listOf("op-1", "op-2"), transport.receivedKeys)
    }

    @Test
    fun `retriable failure applies exponential backoff with jitter and preserves the key`() = runBlocking {
        val outbox = InMemoryOutboxRepository()
        val transport = RecordingTransport(mutableListOf(SyncTransportResult.Retriable("503")))
        var now = 0L
        val engine = OutboxSyncEngine(outbox, transport, jitter = { 100L }, nowMs = { now })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        assertEquals(0, engine.drain())
        val afterFirst = outbox.rows.values.first()
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
    fun `repeated failures quarantine after max attempts`() = runBlocking {
        val outbox = InMemoryOutboxRepository()
        val transport = RecordingTransport(mutableListOf())
        val engine = OutboxSyncEngine(outbox, transport, maxAttempts = 3, backoffBaseMs = 0L, jitter = { 0L }, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        repeat(3) {
            transport.script += SyncTransportResult.Retriable("offline")
            engine.drain()
        }
        assertEquals(1, engine.quarantinedCount())
        assertEquals(0, engine.pendingCount())
    }

    @Test
    fun `rejected 4xx quarantines immediately - never retried`() = runBlocking {
        val outbox = InMemoryOutboxRepository()
        val transport = RecordingTransport(mutableListOf(SyncTransportResult.Rejected("schema rejection 400")))
        val engine = OutboxSyncEngine(outbox, transport, nowMs = { 0L })
        engine.enqueue("ATTEMPT", "op-1", emptyMap())
        assertEquals(0, engine.drain())
        assertEquals(1, engine.quarantinedCount())
        assertEquals(1, transport.receivedKeys.size) // exactly one attempt, no retry
    }

    @Test
    fun `server-wins - accepted sync reconciles local progress to server truth`() = runBlocking {
        val progress = InMemoryProgressRepository()
        val outbox = InMemoryOutboxRepository(progress)
        // Local optimistic progress says CURRENT (child guessed ahead while offline).
        progress.upsertProjection(ProgressProjection("c1", "ST03", 1, "CURRENT_LOCAL_OPTIMISTIC", 1L))
        val transport = RecordingTransport(
            mutableListOf(
                SyncTransportResult.Accepted(
                    mapOf("learningIdentityId" to "c1", "stationId" to "ST03", "chapter" to "1", "status" to "COMPLETED"),
                ),
            ),
        )
        val engine = OutboxSyncEngine(outbox, transport, nowMs = { 42L })
        engine.enqueue("ATTEMPT", "op-1", mapOf("stationId" to "ST03"))
        engine.drain()
        // Local cache reconciled to SERVER truth — optimistic status overwritten, in ONE
        // transaction with the accepted-send epilogue.
        val reconciled = progress.verifiedProgress("c1").first { it.stationId == "ST03" }
        assertEquals("COMPLETED", reconciled.status)
        assertEquals(42L, reconciled.verifiedAtMs)
        assertEquals(0, outbox.pendingCount())
        assertTrue(outbox.completedKeys.contains("op-1"))
    }

    @Test
    fun `backoff with zero jitter is deterministic exponential capped`() {
        val engine = OutboxSyncEngine(InMemoryOutboxRepository(), { _, _ -> SyncTransportResult.Retriable("x") }, jitter = { 0L })
        assertEquals(1500L, engine.backoffMsFor(1))
        assertEquals(3000L, engine.backoffMsFor(2))
        assertEquals(300_000L, engine.backoffMsFor(20))
    }
}
