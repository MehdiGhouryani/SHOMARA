package com.mathlearning.sync

import com.mathlearning.core.common.error.ForbiddenFieldGuard
import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository
import com.mathlearning.core.model.repository.OutboxOperation
import com.mathlearning.core.model.repository.OutboxRepository
import com.mathlearning.core.model.repository.ProgressProjection
import com.mathlearning.core.model.repository.ProgressRepository
import com.mathlearning.core.model.repository.StationPackageRepository
import com.mathlearning.core.model.repository.StoredStationPackage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

/**
 * In-memory repository fakes for :sync UNIT tests ONLY (single-threaded semantics; the real
 * implementation is Room in :core:database, proven there by Robolectric integration tests).
 * Fakes never substitute for the persistence proof — they model contracts deterministically.
 */
class InMemoryOutboxRepository(private val progress: ProgressRepository = InMemoryProgressRepository()) : OutboxRepository {
    val rows = LinkedHashMap<String, OutboxOperation>()
    val completedKeys = mutableListOf<String>()

    override suspend fun enqueue(operation: OutboxOperation) {
        rows[operation.idempotencyKey] = operation
    }

    override suspend fun update(operation: OutboxOperation) {
        rows[operation.idempotencyKey] = operation
    }

    override suspend fun pending(): List<OutboxOperation> =
        rows.values.filter { it.status == "PENDING" }.sortedWith(compareBy({ it.backoffUntilEpochMs }, { it.idempotencyKey }))

    override suspend fun pendingCount(): Int = rows.values.count { it.status == "PENDING" }
    override suspend fun quarantinedCount(): Int = rows.values.count { it.status == "QUARANTINED" }

    override suspend fun completeAccepted(projection: ProgressProjection?, idempotencyKey: String) {
        // Faithful to the contract: the Server-Wins epilogue writes the projection AND removes
        // the operation. Tests assert both effects.
        projection?.let { progress.upsertProjection(it) }
        completedKeys += idempotencyKey
        rows.remove(idempotencyKey)
    }
}

class InMemoryProgressRepository : ProgressRepository {
    val rows = LinkedHashMap<Pair<String, String>, ProgressProjection>()
    private val revision = MutableStateFlow(0)

    override suspend fun upsertProjection(projection: ProgressProjection) {
        rows[projection.learningIdentityId to projection.stationId] = projection
        revision.value += 1
    }

    override suspend fun verifiedProgress(learningIdentityId: String): List<ProgressProjection> =
        rows.entries.filter { it.key.first == learningIdentityId }.map { it.value }.sortedBy { it.stationId }

    override fun verifiedProgressFlow(learningIdentityId: String): Flow<List<ProgressProjection>> =
        revision.asStateFlow().map { verifiedProgressInternal(learningIdentityId) }

    private fun verifiedProgressInternal(identityId: String): List<ProgressProjection> =
        rows.entries.filter { it.key.first == identityId }.map { it.value }.sortedBy { it.stationId }
}

class InMemoryStationPackageRepository : StationPackageRepository {
    val rows = LinkedHashMap<Pair<String, Int>, StoredStationPackage>()

    override suspend fun activatePackage(stationId: String, version: Int, sha256: String, payload: Map<String, String>) {
        ForbiddenFieldGuard.reject(payload) // same CONTENT-008 contract as the Room implementation
        rows.keys.filter { it.first == stationId }.forEach { key -> rows[key] = rows[key]!!.copy(isActive = false) }
        rows[stationId to version] = StoredStationPackage(stationId, version, sha256, true, payload)
    }

    override suspend fun activeStationPackage(stationId: String): StoredStationPackage? =
        rows.values.lastOrNull { it.stationId == stationId && it.isActive }

    override suspend fun activeVersion(stationId: String): Int? = activeStationPackage(stationId)?.version
}

class InMemoryAudioAssetRepository : AudioAssetRepository {
    val rows = LinkedHashMap<String, AudioAssetRecord>()

    override suspend fun upsert(record: AudioAssetRecord) {
        rows[record.audioId] = record
    }

    override suspend fun byId(audioId: String): AudioAssetRecord? = rows[audioId]

    override fun allFlow(): Flow<List<AudioAssetRecord>> = MutableStateFlow(rows.values.toList()).asStateFlow()
}
