package com.mathlearning.sync

import com.mathlearning.core.database.LocalLearningDatabase
import com.mathlearning.core.database.OutboxSyncOperationEntity
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
 */
fun interface SyncTransport {
    fun send(operation: OutboxSyncOperationEntity, idempotencyKey: String): SyncTransportResult
}

/**
 * N07-02 — idempotent outbox sync engine.
 *
 * Semantics (mirroring packages/offline-sync):
 *  - FIFO ordering per session/station, idempotency key PRESERVED across retries and restarts;
 *  - exponential backoff + jitter on Retriable failures;
 *  - immediate stop + QUARANTINE on Rejected (4xx schema/auth);
 *  - Server-Wins conflict policy: a successful send reconciles the local progress projection to
 *    the server response — local optimistic values never override server-authoritative state.
 */
class OutboxSyncEngine(
    private val db: LocalLearningDatabase,
    private val transport: SyncTransport,
    private val backoffBaseMs: Long = 750L,
    private val backoffMaxMs: Long = 300_000L,
    private val maxAttempts: Int = 8,
    private val jitter: (Long) -> Long = { seed -> Random(seed).nextLong(0, 250) },
    private val nowMs: () -> Long = { 0L },
) {

    fun enqueue(kind: String, idempotencyKey: String, payload: Map<String, String>) {
        db.enqueueOutbox(OutboxSyncOperationEntity(idempotencyKey, kind, payload))
    }

    fun pendingCount(): Int = db.outboxOperations.count { it.status == "PENDING" }

    fun backoffMsFor(attemptCount: Int): Long {
        val exponent = attemptCount.coerceIn(0, 9)
        return (backoffBaseMs * (1L shl exponent)).coerceAtMost(backoffMaxMs) + jitter(attemptCount.toLong())
    }

    /** Drains due operations FIFO; returns how many were accepted. */
    fun drain(): Int {
        var accepted = 0
        val now = nowMs()
        for (operation in db.outboxOperations.filter { it.status == "PENDING" }.sortedBy { it.backoffUntilEpochMs }) {
            if (operation.backoffUntilEpochMs > now) continue
            when (val result = transport.send(operation, operation.idempotencyKey)) {
                is SyncTransportResult.Accepted -> {
                    accepted += 1
                    db.updateOutbox(operation.copy(status = "PENDING"))
                    reconcileServerProgress(operation, result.serverProgress)
                    // Accepted operations leave the outbox.
                    db.outboxOperations.removeIf { it.idempotencyKey == operation.idempotencyKey }
                }
                is SyncTransportResult.Retriable -> {
                    val attempts = operation.attemptCount + 1
                    if (attempts >= maxAttempts) {
                        db.updateOutbox(operation.copy(attemptCount = attempts, status = "QUARANTINED"))
                    } else {
                        db.updateOutbox(
                            operation.copy(
                                attemptCount = attempts,
                                backoffUntilEpochMs = nowMs() + backoffMsFor(attempts),
                            ),
                        )
                    }
                    return accepted // stop the drain on first retriable failure (network lost again)
                }
                is SyncTransportResult.Rejected -> {
                    db.updateOutbox(operation.copy(status = "QUARANTINED", attemptCount = operation.attemptCount + 1))
                }
            }
        }
        return accepted
    }

    fun quarantinedCount(): Int = db.outboxOperations.count { it.status == "QUARANTINED" }

    /**
     * Server-Wins: only SERVER-VERIFIED values enter the local progress projection. Local
     * optimistic rows are replaced (never merged over) by the server response after reconnection.
     */
    private fun reconcileServerProgress(operation: OutboxSyncOperationEntity, serverProgress: Map<String, String>) {
        val identity = serverProgress["learningIdentityId"] ?: return
        val stationId = serverProgress["stationId"] ?: operation.payload["stationId"] ?: return
        val chapter = serverProgress["chapter"]?.toIntOrNull() ?: 0
        val status = serverProgress["status"] ?: "SERVER_VERIFIED"
        db.upsertProgress(
            com.mathlearning.core.database.LocalProgressProjectionEntity(
                learningIdentityId = identity,
                stationId = stationId,
                chapter = chapter,
                status = status,
                verifiedAtMs = nowMs(),
            ),
        )
    }
}
