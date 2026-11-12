package com.mathlearning.sync

import com.mathlearning.core.model.repository.OutboxOperation
import com.mathlearning.core.model.repository.OutboxRepository
import com.mathlearning.core.model.repository.ProgressProjection
import kotlin.random.Random

/** Submission outcome handed back by the transport adapter. */
sealed class SyncTransportResult {
    data class Accepted(val serverProgress: Map<String, String>) : SyncTransportResult()
    data class Retriable(val detail: String) : SyncTransportResult() // 5xx / timeout / offline
    data class Rejected(val detail: String) : SyncTransportResult() // 4xx schema/auth — quarantine
}

/**
 * Transport adapter contract: the app wires the real HTTP client; tests use fakes.
 * The adapter receives the DETERMINISTIC idempotency key so the server can deduplicate retries.
 * P4: operations live in the durable outbox (Room) — not an in-memory store.
 */
fun interface SyncTransport {
    fun send(operation: OutboxOperation, idempotencyKey: String): SyncTransportResult
}

/**
 * N07-02 — idempotent outbox sync engine (P4: now over the durable repository contracts).
 *
 * Semantics (mirroring packages/offline-sync):
 *  - FIFO ordering per session/station, idempotency key PRESERVED across retries and restarts;
 *  - exponential backoff + jitter on Retriable failures;
 *  - immediate stop + QUARANTINE on Rejected (4xx schema/auth);
 *  - Server-Wins conflict policy: a successful send reconciles the local progress projection to
 *    the server response — local optimistic values never override server-authoritative state.
 *  - the accepted-send epilogue (progress upsert + operation removal) is ONE transaction in the
 *    repository, so a crash can never re-drain an accepted send or lose its progress row.
 */
class OutboxSyncEngine(
    private val outbox: OutboxRepository,
    private val transport: SyncTransport,
    private val backoffBaseMs: Long = 750L,
    private val backoffMaxMs: Long = 300_000L,
    private val maxAttempts: Int = 8,
    private val jitter: (Long) -> Long = { seed -> Random(seed).nextLong(0, 250) },
    private val nowMs: () -> Long = { 0L },
) {

    suspend fun enqueue(kind: String, idempotencyKey: String, payload: Map<String, String>) {
        outbox.enqueue(OutboxOperation(idempotencyKey, kind, payload, 0, 0L, "PENDING"))
    }

    suspend fun pendingCount(): Int = outbox.pendingCount()

    suspend fun quarantinedCount(): Int = outbox.quarantinedCount()

    fun backoffMsFor(attemptCount: Int): Long {
        val exponent = attemptCount.coerceIn(0, 9)
        return (backoffBaseMs * (1L shl exponent)).coerceAtMost(backoffMaxMs) + jitter(attemptCount.toLong())
    }

    /** Drains due operations FIFO; returns how many were accepted. */
    suspend fun drain(): Int {
        var accepted = 0
        val now = nowMs()
        for (operation in outbox.pending()) {
            if (operation.backoffUntilEpochMs > now) continue
            when (val result = transport.send(operation, operation.idempotencyKey)) {
                is SyncTransportResult.Accepted -> {
                    accepted += 1
                    outbox.completeAccepted(reconcileProjection(operation, result.serverProgress), operation.idempotencyKey)
                }
                is SyncTransportResult.Retriable -> {
                    val attempts = operation.attemptCount + 1
                    if (attempts >= maxAttempts) {
                        outbox.update(operation.copy(attemptCount = attempts, status = "QUARANTINED"))
                    } else {
                        outbox.update(
                            operation.copy(
                                attemptCount = attempts,
                                backoffUntilEpochMs = nowMs() + backoffMsFor(attempts),
                            ),
                        )
                    }
                    return accepted // stop the drain on first retriable failure (network lost again)
                }
                is SyncTransportResult.Rejected -> {
                    outbox.update(operation.copy(attemptCount = operation.attemptCount + 1, status = "QUARANTINED"))
                }
            }
        }
        return accepted
    }

    /**
     * Server-Wins: only SERVER-VERIFIED values enter the local progress projection. Local
     * optimistic rows are replaced (never merged over) by the server response after reconnection.
     */
    private fun reconcileProjection(operation: OutboxOperation, serverProgress: Map<String, String>): ProgressProjection? {
        val identity = serverProgress["learningIdentityId"] ?: return null
        val stationId = serverProgress["stationId"] ?: operation.payload["stationId"] ?: return null
        val chapter = serverProgress["chapter"]?.toIntOrNull() ?: 0
        val status = serverProgress["status"] ?: "SERVER_VERIFIED"
        return ProgressProjection(
            learningIdentityId = identity,
            stationId = stationId,
            chapter = chapter,
            status = status,
            verifiedAtMs = nowMs(),
        )
    }
}
