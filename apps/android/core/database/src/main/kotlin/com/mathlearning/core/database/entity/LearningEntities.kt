package com.mathlearning.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Room schema v1 (O4-approved, ADR-0042). Five registries with REAL producers/consumers today:
 * station packages (manifest activation), server-verified progress projections, outbox
 * operations, audio-asset metadata, migration history. Tables with no producer yet (profiles —
 * O5; mastery — O1/CONTENT-014; lesson sessions/encounters/attempts — the local learning loop)
 * are deliberately NOT created: they arrive as versioned migrations when their owner decisions
 * land, never as speculative empty tables.
 *
 * Foreign keys are deliberately ABSENT in v1: these are independent registries keyed by
 * EXTERNAL identifiers (stationIds arrive from the content pipeline, audioIds from the CMS,
 * outbox keys from the lesson loop) whose referenced rows can legitimately exist before/without
 * the referencing row (draft audio metadata precedes any package; progress may be server-verified
 * for a station whose package is not locally cached). Forcing FKs would couple arrival order, not
 * integrity. Transactions — not FKs — keep multi-row progression updates consistent.
 */

@Entity(
    tableName = "station_packages",
    primaryKeys = ["stationId", "version"],
    indices = [Index(value = ["stationId", "isActive"])],
)
data class StationPackageEntity(
    val stationId: String,
    val version: Int,
    val sha256: String,
    val isActive: Boolean,
    /** Small structured payload (validated by ForbiddenFieldGuard before insert). */
    val payloadJson: String,
)

@Entity(
    tableName = "progress_projections",
    primaryKeys = ["learningIdentityId", "stationId"],
)
data class ProgressProjectionEntity(
    val learningIdentityId: String,
    val stationId: String,
    val chapter: Int,
    val status: String,
    val verifiedAtMs: Long,
)

@Entity(tableName = "outbox_operations")
data class OutboxOperationEntity(
    @PrimaryKey val idempotencyKey: String,
    val kind: String,
    val payloadJson: String,
    val attemptCount: Int,
    val backoffUntilEpochMs: Long,
    val status: String, // PENDING | QUARANTINED
)

@Entity(
    tableName = "audio_assets",
    indices = [Index(value = ["publishState"])],
)
data class AudioAssetEntity(
    @PrimaryKey val audioId: String,
    val localFileRef: String?,
    val sha256: String?,
    val publishState: String,
    val voiceProfileId: String,
)

@Entity(tableName = "migration_metadata")
data class MigrationMetadataEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fromVersion: Int,
    val toVersion: Int,
    val appliedAtEpochMs: Long,
)
