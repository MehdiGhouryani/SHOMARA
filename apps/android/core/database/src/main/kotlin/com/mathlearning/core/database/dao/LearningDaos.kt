package com.mathlearning.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Upsert
import com.mathlearning.core.database.entity.AudioAssetEntity
import com.mathlearning.core.database.entity.ContentPackageEntity
import com.mathlearning.core.database.entity.LessonAttemptEntity
import com.mathlearning.core.database.entity.LessonSessionEntity
import com.mathlearning.core.database.entity.MigrationMetadataEntity
import com.mathlearning.core.database.entity.OutboxOperationEntity
import com.mathlearning.core.database.entity.ProgressProjectionEntity
import com.mathlearning.core.database.entity.StationPackageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StationPackageDao {
    @Query("UPDATE station_packages SET isActive = 0 WHERE stationId = :stationId AND isActive = 1")
    suspend fun deactivateActive(stationId: String)

    @Upsert
    suspend fun upsert(entity: StationPackageEntity)

    @Query("SELECT * FROM station_packages WHERE stationId = :stationId AND isActive = 1 LIMIT 1")
    suspend fun activeStationPackage(stationId: String): StationPackageEntity?

    @Query("SELECT COUNT(*) FROM station_packages WHERE stationId = :stationId AND isActive = 1")
    suspend fun activeCount(stationId: String): Int

    @Transaction
    suspend fun activate(entity: StationPackageEntity) {
        deactivateActive(entity.stationId)
        upsert(entity)
    }
}

@Dao
interface ProgressProjectionDao {
    @Upsert
    suspend fun upsert(entity: ProgressProjectionEntity)

    @Query("SELECT * FROM progress_projections WHERE learningIdentityId = :identityId ORDER BY stationId ASC")
    suspend fun verifiedProgress(identityId: String): List<ProgressProjectionEntity>

    @Query("SELECT * FROM progress_projections WHERE learningIdentityId = :identityId ORDER BY stationId ASC")
    fun verifiedProgressFlow(identityId: String): Flow<List<ProgressProjectionEntity>>
}

@Dao
interface OutboxOperationDao {
    @Upsert
    suspend fun upsert(entity: OutboxOperationEntity)

    @Query("SELECT * FROM outbox_operations WHERE status = 'PENDING' ORDER BY backoffUntilEpochMs ASC, idempotencyKey ASC")
    suspend fun pendingOrdered(): List<OutboxOperationEntity>

    @Query("SELECT COUNT(*) FROM outbox_operations WHERE status = 'PENDING'")
    suspend fun pendingCount(): Int

    @Query("SELECT COUNT(*) FROM outbox_operations WHERE status = 'QUARANTINED'")
    suspend fun quarantinedCount(): Int

    @Query("DELETE FROM outbox_operations WHERE idempotencyKey = :idempotencyKey")
    suspend fun deleteByIdempotencyKey(idempotencyKey: String)
}

@Dao
interface AudioAssetDao {
    @Upsert
    suspend fun upsert(entity: AudioAssetEntity)

    @Query("SELECT * FROM audio_assets WHERE audioId = :audioId LIMIT 1")
    suspend fun byId(audioId: String): AudioAssetEntity?

    @Query("SELECT * FROM audio_assets ORDER BY audioId ASC")
    fun allFlow(): Flow<List<AudioAssetEntity>>
}

@Dao
interface MigrationMetadataDao {
    @Upsert
    suspend fun record(entity: MigrationMetadataEntity)

    @Query("SELECT * FROM migration_metadata ORDER BY appliedAtEpochMs ASC")
    suspend fun history(): List<MigrationMetadataEntity>
}

@Dao
interface ContentPackageDao {
    @Upsert
    suspend fun upsert(entity: ContentPackageEntity)

    @Query("SELECT * FROM content_packages WHERE state = 'ACTIVE' LIMIT 1")
    suspend fun activePackage(): ContentPackageEntity?

    @Query("SELECT * FROM content_packages WHERE packageId = :packageId LIMIT 1")
    suspend fun byId(packageId: String): ContentPackageEntity?

    @Query("UPDATE content_packages SET state = :state WHERE packageId = :packageId")
    suspend fun setState(packageId: String, state: String)
}

@Dao
interface LessonSessionDao {
    @Upsert
    suspend fun upsert(entity: LessonSessionEntity)

    @Query(StringQueries.LESSON_SESSION_BY_ID)
    suspend fun byId(sessionId: String): LessonSessionEntity?

    @Query(StringQueries.LESSON_SESSION_SET_LIFECYCLE)
    suspend fun setLifecycle(sessionId: String, lifecycle: String, updatedAtMs: Long)
}

@Dao
interface LessonAttemptDao {
    @Query(StringQueries.LESSON_ATTEMPT_BY_KEY)
    suspend fun byAttemptKey(attemptKey: String): LessonAttemptEntity?

    @Insert
    suspend fun insert(entity: LessonAttemptEntity): Long

    @Query(StringQueries.LESSON_ATTEMPTS_FOR_SESSION)
    suspend fun forSession(sessionId: String): List<LessonAttemptEntity>
}
