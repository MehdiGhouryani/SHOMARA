package com.mathlearning.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.migration.Migration
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.mathlearning.core.database.dao.AudioAssetDao
import com.mathlearning.core.database.dao.MigrationMetadataDao
import com.mathlearning.core.database.dao.OutboxOperationDao
import com.mathlearning.core.database.dao.ProgressProjectionDao
import com.mathlearning.core.database.dao.StationPackageDao
import com.mathlearning.core.database.entity.AudioAssetEntity
import com.mathlearning.core.database.dao.ContentPackageDao
import com.mathlearning.core.database.entity.ContentPackageEntity
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
/** First REAL schema migration: adds the content-package registry (P5 engine). Row-preserving. */
object ShomaraMigrations {
    val MIGRATION_1_2: Migration = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                "CREATE TABLE IF NOT EXISTS `content_packages` (`packageId` TEXT NOT NULL, " +
                    "`version` INTEGER NOT NULL, `schemaVersion` INTEGER NOT NULL, `minAppVersion` TEXT NOT NULL, " +
                    "`manifestSha256` TEXT NOT NULL, `state` TEXT NOT NULL, `activatedAtMs` INTEGER NOT NULL, " +
                    "PRIMARY KEY(`packageId`))",
            )
            db.execSQL("CREATE INDEX IF NOT EXISTS index_content_packages_state ON content_packages (state)")
        }
    }

    val ALL: Array<Migration> = arrayOf(MIGRATION_1_2)
}

@Database(
    version = 2,
    exportSchema = true,
    entities = [
        StationPackageEntity::class,
        ProgressProjectionEntity::class,
        OutboxOperationEntity::class,
        AudioAssetEntity::class,
        MigrationMetadataEntity::class,
        ContentPackageEntity::class,
    ],
)
abstract class ShomaraLearningDatabase : RoomDatabase() {
    abstract fun stationPackageDao(): StationPackageDao
    abstract fun progressProjectionDao(): ProgressProjectionDao
    abstract fun outboxOperationDao(): OutboxOperationDao
    abstract fun audioAssetDao(): AudioAssetDao
    abstract fun migrationMetadataDao(): MigrationMetadataDao
    abstract fun contentPackageDao(): ContentPackageDao

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
                .addMigrations(*ShomaraMigrations.ALL)
            journalMode?.let { builder.setJournalMode(it) }
            return builder.build()
        }
    }
}
