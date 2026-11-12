package com.mathlearning.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.mathlearning.core.database.dao.AudioAssetDao
import com.mathlearning.core.database.dao.MigrationMetadataDao
import com.mathlearning.core.database.dao.OutboxOperationDao
import com.mathlearning.core.database.dao.ProgressProjectionDao
import com.mathlearning.core.database.dao.StationPackageDao
import com.mathlearning.core.database.entity.AudioAssetEntity
import com.mathlearning.core.database.entity.MigrationMetadataEntity
import com.mathlearning.core.database.entity.OutboxOperationEntity
import com.mathlearning.core.database.entity.ProgressProjectionEntity
import com.mathlearning.core.database.entity.StationPackageEntity

/**
 * The REAL, durable learning database (O4-approved, ADR-0042) — replaces the in-memory
 * `LocalLearningDatabase` (deleted with consumer-proof in the same phase).
 *
 * Fail-closed policy (carried over from the N07-01 design, now on real SQLite):
 *  - NO `fallbackToDestructiveMigration`: a missing migration path must never destroy data —
 *    the open FAILS and the app surfaces the honest recovery path (no silent reset);
 *  - downgrades are rejected by Room's version check (tested);
 *  - a corrupt file fails the open (never silently recreated — tested);
 *  - every future schema version ships with its migration + exported schema JSON in `schemas/`.
 */
@Database(
    version = 1,
    exportSchema = true,
    entities = [
        StationPackageEntity::class,
        ProgressProjectionEntity::class,
        OutboxOperationEntity::class,
        AudioAssetEntity::class,
        MigrationMetadataEntity::class,
    ],
)
abstract class ShomaraLearningDatabase : RoomDatabase() {
    abstract fun stationPackageDao(): StationPackageDao
    abstract fun progressProjectionDao(): ProgressProjectionDao
    abstract fun outboxOperationDao(): OutboxOperationDao
    abstract fun audioAssetDao(): AudioAssetDao
    abstract fun migrationMetadataDao(): MigrationMetadataDao

    companion object {
        const val DATABASE_NAME: String = "shomara_learning.db"

        /**
         * Builds the durable database. Production keeps Room's default WAL journal mode;
         * tests may pass TRUNCATE because Robolectric's native SQLite on Windows fails the
         * second-connection WAL open (code 14) — a test-platform quirk orthogonal to the
         * schema/migration/transaction contracts being proven.
         */
        fun build(
            context: Context,
            fileName: String = DATABASE_NAME,
            journalMode: androidx.room.RoomDatabase.JournalMode? = null,
        ): ShomaraLearningDatabase {
            val builder = Room.databaseBuilder(context.applicationContext, ShomaraLearningDatabase::class.java, fileName)
            journalMode?.let { builder.setJournalMode(it) }
            return builder.build()
        }
    }
}
