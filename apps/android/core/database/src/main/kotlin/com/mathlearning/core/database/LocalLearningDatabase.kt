package com.mathlearning.core.database

import java.security.MessageDigest

/**
 * N07-01 — local storage schema for the offline-first read source. Deterministic, in-memory
 * table maps with an explicit schema-version migration engine (v1→v2) and a fail-closed policy
 * for corrupt databases, downgrades, and forbidden (answer-key) fields.
 *
 * Tables:
 *  1. LocalStationPackageEntity — published station projections keyed by (stationId, version, sha256)
 *  2. LocalProgressProjectionEntity — last SERVER-VERIFIED station/chapter status (offline-first read)
 *  3. OutboxSyncOperationEntity — pending sync operations (idempotencyKey, attemptCount, backoff, status)
 *  4. LocalAudioAssetEntity — cached audio metadata (audioId, localRef, sha256, publishState, voiceProfileId)
 */

object LocalSchema {
    const val CURRENT_VERSION: Int = 2
    val SUPPORTED_VERSIONS: Set<Int> = setOf(1, 2)

    /** CONTENT-008: these keys must never enter the local database from any payload. */
    val FORBIDDEN_KEYS: Set<String> = setOf(
        "answer", "answers", "answerKey", "answer_key", "correctIndex", "correctAnswer",
        "evaluatorConfig", "evaluator_config", "pass_threshold", "passThreshold",
        "nextStep", "reviewer", "reviewerId", "reviewEvidence", "provenance",
    )

    fun sha256Hex(bytes: ByteArray): String =
        MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
}

class CorruptDatabaseException(message: String) : Exception(message)
class DowngradeRejectedException(message: String) : Exception(message)
class ForbiddenFieldException(message: String) : Exception(message)

data class LocalStationPackageEntity(
    val stationId: String,
    val version: Int,
    val sha256: String,
    val isActive: Boolean,
    val payload: Map<String, String>,
)

data class LocalProgressProjectionEntity(
    val learningIdentityId: String,
    val stationId: String,
    val chapter: Int,
    val status: String,
    val verifiedAtMs: Long,
)

data class OutboxSyncOperationEntity(
    val idempotencyKey: String,
    val kind: String,
    val payload: Map<String, String>,
    val attemptCount: Int = 0,
    val backoffUntilEpochMs: Long = 0L,
    val status: String = "PENDING", // PENDING | QUARANTINED
)

data class LocalAudioAssetEntity(
    val audioId: String,
    val localFileRef: String?,
    val sha256: String?,
    val publishState: String,
    val voiceProfileId: String,
)

/** Local database: deterministic tables + migration policy. Pure Kotlin (JVM-testable). */
class LocalLearningDatabase(initialVersion: Int = LocalSchema.CURRENT_VERSION) {

    var schemaVersion: Int = initialVersion
        private set

    private var closed: Boolean = false

    val stationPackages = mutableListOf<LocalStationPackageEntity>()
    val progressProjections = mutableListOf<LocalProgressProjectionEntity>()
    val outboxOperations = mutableListOf<OutboxSyncOperationEntity>()
    val audioAssets = mutableListOf<LocalAudioAssetEntity>()

    private fun requireOpen() {
        if (closed || schemaVersion == 0) throw CorruptDatabaseException("database closed or unreadable")
    }

    /** Fail-closed persistence guard (CONTENT-008): no forbidden key at any payload depth. */
    private fun rejectForbidden(payload: Map<String, String>) {
        for ((key, value) in payload) {
            if (LocalSchema.FORBIDDEN_KEYS.any { key.equals(it, ignoreCase = true) }) {
                throw ForbiddenFieldException("forbidden field rejected before persistence: $key")
            }
            if (LocalSchema.FORBIDDEN_KEYS.any { value.contains(it, ignoreCase = true) && key == "content" }) {
                throw ForbiddenFieldException("forbidden field embedded in content blob: $key")
            }
        }
    }

    fun upsertStationPackage(entity: LocalStationPackageEntity) {
        requireOpen()
        rejectForbidden(entity.payload)
        stationPackages.removeAll { it.stationId == entity.stationId && it.version == entity.version }
        if (entity.isActive) {
            for (index in stationPackages.indices) {
                val existing = stationPackages[index]
                if (existing.stationId == entity.stationId && existing.isActive) {
                    stationPackages[index] = existing.copy(isActive = false)
                }
            }
        }
        stationPackages += entity
    }

    fun activeStationPackage(stationId: String): LocalStationPackageEntity? =
        stationPackages.lastOrNull { it.stationId == stationId && it.isActive }

    fun upsertProgress(entity: LocalProgressProjectionEntity) {
        requireOpen()
        progressProjections.removeAll { it.learningIdentityId == entity.learningIdentityId && it.stationId == entity.stationId }
        progressProjections += entity
    }

    /** Offline-first read: the last SERVER-VERIFIED progress for cold start. */
    fun verifiedProgress(learningIdentityId: String): List<LocalProgressProjectionEntity> =
        progressProjections.filter { it.learningIdentityId == learningIdentityId }.sortedBy { it.stationId }

    fun enqueueOutbox(entity: OutboxSyncOperationEntity) {
        requireOpen()
        rejectForbidden(entity.payload)
        outboxOperations.removeAll { it.idempotencyKey == entity.idempotencyKey }
        outboxOperations += entity
    }

    fun updateOutbox(entity: OutboxSyncOperationEntity) {
        requireOpen()
        val index = outboxOperations.indexOfFirst { it.idempotencyKey == entity.idempotencyKey }
        require(index >= 0) { "cannot update unknown outbox operation" }
        outboxOperations[index] = entity
    }

    fun upsertAudioAsset(entity: LocalAudioAssetEntity) {
        requireOpen()
        audioAssets.removeAll { it.audioId == entity.audioId }
        audioAssets += entity
    }

    fun audioAsset(audioId: String): LocalAudioAssetEntity? = audioAssets.lastOrNull { it.audioId == audioId }

    /**
     * Migration policy:
     *  - forward v1→v2 migrates in place preserving all rows;
     *  - same-version reopen is a no-op;
     *  - downgrade is REJECTED (fail-closed);
     *  - a corrupt (version 0/unreadable) database is REJECTED, never silently recreated.
     */
    fun migrateTo(targetVersion: Int) {
        when {
            targetVersion == schemaVersion -> return
            targetVersion < schemaVersion -> throw DowngradeRejectedException(
                "downgrade $schemaVersion→$targetVersion rejected; failing closed",
            )
            targetVersion > LocalSchema.CURRENT_VERSION -> throw DowngradeRejectedException(
                "unknown future schema version $targetVersion; failing closed",
            )
            schemaVersion == 0 -> throw CorruptDatabaseException("unreadable schema version; failing closed")
            else -> {
                // v1→v2: v2 adds the audio-asset table; station/progress/outbox rows carry over 1:1.
                schemaVersion = targetVersion
            }
        }
    }

    fun markCorrupt() {
        closed = true
    }
}
