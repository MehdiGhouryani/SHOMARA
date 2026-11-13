package com.mathlearning.core.model.repository

import kotlinx.coroutines.flow.Flow

/**
 * Persistent learning-store contracts (O4-approved, Phase P4, ADR-0042).
 *
 * These are the DOMAIN contracts the UI/features/sync program against. The ONLY implementation
 * is the Room-backed one in `:core:database`; composables never see DAOs or entities, and the
 * forbidden-field guard (CONTENT-008 — no answer/evaluator fields ever persisted) lives inside
 * the implementation boundary.
 *
 * Storage split per the approved decision:
 *  - Room/SQLite: these structured learning tables (packages, progress, outbox, asset metadata,
 *    migration history);
 *  - DataStore: light settings/checkpoints (stays as-is, already durable);
 *  - media binaries: app-private files, referenced here by `localFileRef`, never copied into the DB.
 */

/** Published station projection keyed by (stationId, version, sha256) — one ACTIVE row per station. */
data class StoredStationPackage(
    val stationId: String,
    val version: Int,
    val sha256: String,
    val isActive: Boolean,
    val payload: Map<String, String>,
)

/** Last SERVER-VERIFIED station/chapter status (offline-first read source for the path). */
data class ProgressProjection(
    val learningIdentityId: String,
    val stationId: String,
    val chapter: Int,
    val status: String,
    val verifiedAtMs: Long,
)

/** Pending sync operation, keyed by the deterministic idempotency key. */
data class OutboxOperation(
    val idempotencyKey: String,
    val kind: String,
    val payload: Map<String, String>,
    val attemptCount: Int,
    val backoffUntilEpochMs: Long,
    val status: String,
)

/** Audio asset registry row — binaries live in app-private files, the DB holds metadata only. */
data class AudioAssetRecord(
    val audioId: String,
    val localFileRef: String?,
    val sha256: String?,
    val publishState: String,
    val voiceProfileId: String,
)

interface StationPackageRepository {
    /**
     * Atomically activates a package version: deactivates the previously active version of the
     * same station and inserts the new row in ONE transaction, so a crash can never leave two
     * active versions (or zero).
     */
    suspend fun activatePackage(
        stationId: String,
        version: Int,
        sha256: String,
        payload: Map<String, String>,
    )

    suspend fun activeStationPackage(stationId: String): StoredStationPackage?
    suspend fun activeVersion(stationId: String): Int?
}

interface ProgressRepository {
    suspend fun upsertProjection(projection: ProgressProjection)
    suspend fun verifiedProgress(learningIdentityId: String): List<ProgressProjection>
    fun verifiedProgressFlow(learningIdentityId: String): Flow<List<ProgressProjection>>
}

interface OutboxRepository {
    suspend fun enqueue(operation: OutboxOperation)
    suspend fun update(operation: OutboxOperation)
    suspend fun pending(): List<OutboxOperation>
    suspend fun pendingCount(): Int
    suspend fun quarantinedCount(): Int

    /**
     * Accepted-send epilogue in ONE transaction: upsert the SERVER-VERIFIED progress projection
     * (Server-Wins) and remove the completed outbox operation — a crash between the two must be
     * impossible. `projection == null` (no identity in the response) still removes the operation.
     */
    suspend fun completeAccepted(projection: ProgressProjection?, idempotencyKey: String)
}

interface AudioAssetRepository {
    suspend fun upsert(record: AudioAssetRecord)
    suspend fun byId(audioId: String): AudioAssetRecord?
    fun allFlow(): Flow<List<AudioAssetRecord>>
}

/** Installed content package registry row (P5 engine; engine plumbing pending O2-final fields). */
data class InstalledContentPackage(
    val packageId: String,
    val version: Int,
    val schemaVersion: Int,
    val minAppVersion: String,
    val manifestSha256: String,
    val state: String, // ACTIVE | ROLLED_BACK | FAILED
    val activatedAtMs: Long,
)

interface ContentPackageRegistryRepository {
    /** Atomic: previous ACTIVE package (if any) -> ROLLED_BACK, new package -> ACTIVE. */
    suspend fun commitActivation(active: InstalledContentPackage, previousPackageId: String?)
    suspend fun setState(packageId: String, state: String)
    suspend fun activePackage(): InstalledContentPackage?
    suspend fun byId(packageId: String): InstalledContentPackage?
}

/** Recorded attempt (P6): IDs + outcome only — CONTENT-018. */
data class RecordedAttempt(
    val sessionId: String,
    val encounterId: String,
    val stage: String,
    val attemptKey: String,
    val interactionId: String,
    val outcome: String, // CORRECT | INCORRECT | UNSET
    val evaluatorVersion: String,
    val recordedAtMs: Long,
)

data class LessonSessionRecord(
    val sessionId: String,
    val stationId: String,
    val stageCursor: Int,
    val lifecycle: String,
    val engineRuleVersion: String,
    val contentPackageVersion: Int,
    val startedAtMs: Long,
    val updatedAtMs: Long,
)

interface LessonRecordRepository {
    /**
     * Records session (upsert-if-absent) + attempt in ONE transaction (owner P6 mission).
     * Idempotent by attemptKey: a replayed key is a no-op and returns false.
     */
    suspend fun recordAttempt(session: LessonSessionRecord, attempt: RecordedAttempt): Boolean
    suspend fun session(sessionId: String): LessonSessionRecord?
    suspend fun attemptsFor(sessionId: String): List<RecordedAttempt>
}
