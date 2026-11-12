package com.mathlearning.core.database.repo

import androidx.room.withTransaction
import com.mathlearning.core.common.error.ForbiddenFieldException
import com.mathlearning.core.common.error.ForbiddenFieldGuard
import com.mathlearning.core.common.json.ShomaraPayloadJson
import com.mathlearning.core.database.ShomaraLearningDatabase
import com.mathlearning.core.database.dao.AudioAssetDao
import com.mathlearning.core.database.dao.OutboxOperationDao
import com.mathlearning.core.database.dao.ProgressProjectionDao
import com.mathlearning.core.database.dao.StationPackageDao
import com.mathlearning.core.database.entity.AudioAssetEntity
import com.mathlearning.core.database.entity.OutboxOperationEntity
import com.mathlearning.core.database.entity.ProgressProjectionEntity
import com.mathlearning.core.database.entity.StationPackageEntity
import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository
import com.mathlearning.core.model.repository.OutboxOperation
import com.mathlearning.core.model.repository.OutboxRepository
import com.mathlearning.core.model.repository.ProgressProjection
import com.mathlearning.core.model.repository.ProgressRepository
import com.mathlearning.core.model.repository.StationPackageRepository
import com.mathlearning.core.model.repository.StoredStationPackage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class RoomStationPackageRepository(private val db: ShomaraLearningDatabase) : StationPackageRepository {
    private val dao: StationPackageDao = db.stationPackageDao()

    override suspend fun activatePackage(
        stationId: String,
        version: Int,
        sha256: String,
        payload: Map<String, String>,
    ) {
        ForbiddenFieldGuard.reject(payload)
        db.withTransaction {
            // One transaction: deactivate-previous + insert-new — a crash can never leave zero
            // or two active versions of a station.
            dao.deactivateActive(stationId)
            dao.upsert(
                StationPackageEntity(
                    stationId = stationId,
                    version = version,
                    sha256 = sha256,
                    isActive = true,
                    payloadJson = ShomaraPayloadJson.encode(payload),
                ),
            )
        }
    }

    override suspend fun activeStationPackage(stationId: String): StoredStationPackage? =
        dao.activeStationPackage(stationId)?.toDomain()

    override suspend fun activeVersion(stationId: String): Int? =
        dao.activeStationPackage(stationId)?.version

    private fun StationPackageEntity.toDomain(): StoredStationPackage = StoredStationPackage(
        stationId = stationId,
        version = version,
        sha256 = sha256,
        isActive = isActive,
        payload = ShomaraPayloadJson.decode(payloadJson),
    )
}

class RoomProgressRepository(private val db: ShomaraLearningDatabase) : ProgressRepository {
    private val dao: ProgressProjectionDao = db.progressProjectionDao()

    override suspend fun upsertProjection(projection: ProgressProjection) {
        dao.upsert(projection.toEntity())
    }

    override suspend fun verifiedProgress(learningIdentityId: String): List<ProgressProjection> =
        dao.verifiedProgress(learningIdentityId).map { it.toDomain() }

    override fun verifiedProgressFlow(learningIdentityId: String): Flow<List<ProgressProjection>> =
        dao.verifiedProgressFlow(learningIdentityId).map { rows -> rows.map { it.toDomain() } }

    private fun ProgressProjection.toEntity(): ProgressProjectionEntity = ProgressProjectionEntity(
        learningIdentityId = learningIdentityId,
        stationId = stationId,
        chapter = chapter,
        status = status,
        verifiedAtMs = verifiedAtMs,
    )

    private fun ProgressProjectionEntity.toDomain(): ProgressProjection = ProgressProjection(
        learningIdentityId = learningIdentityId,
        stationId = stationId,
        chapter = chapter,
        status = status,
        verifiedAtMs = verifiedAtMs,
    )
}

class RoomOutboxRepository(private val db: ShomaraLearningDatabase) : OutboxRepository {
    private val dao: OutboxOperationDao = db.outboxOperationDao()

    override suspend fun enqueue(operation: OutboxOperation) {
        ForbiddenFieldGuard.reject(operation.payload)
        dao.upsert(operation.toEntity())
    }

    override suspend fun update(operation: OutboxOperation) {
        ForbiddenFieldGuard.reject(operation.payload)
        dao.upsert(operation.toEntity())
    }

    override suspend fun pending(): List<OutboxOperation> =
        dao.pendingOrdered().map { it.toDomain() }

    override suspend fun pendingCount(): Int = dao.pendingCount()
    override suspend fun quarantinedCount(): Int = dao.quarantinedCount()

    override suspend fun completeAccepted(projection: ProgressProjection?, idempotencyKey: String) {
        db.withTransaction {
            if (projection != null) {
                db.progressProjectionDao().upsert(
                    ProgressProjectionEntity(
                        learningIdentityId = projection.learningIdentityId,
                        stationId = projection.stationId,
                        chapter = projection.chapter,
                        status = projection.status,
                        verifiedAtMs = projection.verifiedAtMs,
                    ),
                )
            }
            // Server-Wins epilogue is atomic with the projection write: a crash between them is
            // impossible, so an accepted send can never be re-drained nor lose its progress row.
            db.outboxOperationDao().deleteByIdempotencyKey(idempotencyKey)
        }
    }

    private fun OutboxOperation.toEntity(): OutboxOperationEntity = OutboxOperationEntity(
        idempotencyKey = idempotencyKey,
        kind = kind,
        payloadJson = ShomaraPayloadJson.encode(payload),
        attemptCount = attemptCount,
        backoffUntilEpochMs = backoffUntilEpochMs,
        status = status,
    )

    private fun OutboxOperationEntity.toDomain(): OutboxOperation = OutboxOperation(
        idempotencyKey = idempotencyKey,
        kind = kind,
        payload = ShomaraPayloadJson.decode(payloadJson),
        attemptCount = attemptCount,
        backoffUntilEpochMs = backoffUntilEpochMs,
        status = status,
    )
}

class RoomAudioAssetRepository(db: ShomaraLearningDatabase) : AudioAssetRepository {
    private val dao: AudioAssetDao = db.audioAssetDao()

    override suspend fun upsert(record: AudioAssetRecord) {
        dao.upsert(
            AudioAssetEntity(
                audioId = record.audioId,
                localFileRef = record.localFileRef,
                sha256 = record.sha256,
                publishState = record.publishState,
                voiceProfileId = record.voiceProfileId,
            ),
        )
    }

    override suspend fun byId(audioId: String): AudioAssetRecord? = dao.byId(audioId)?.toDomain()

    override fun allFlow(): Flow<List<AudioAssetRecord>> =
        dao.allFlow().map { rows -> rows.map { it.toDomain() } }

    private fun AudioAssetEntity.toDomain(): AudioAssetRecord = AudioAssetRecord(
        audioId = audioId,
        localFileRef = localFileRef,
        sha256 = sha256,
        publishState = publishState,
        voiceProfileId = voiceProfileId,
    )
}
