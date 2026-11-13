package com.mathlearning.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Local lesson sessions/attempts (P6 engine persistence). CONTENT-018 boundary: identifiers and
 * the evaluation OUTCOME only — never answer content, evaluator config, choice texts, or child
 * PII. attemptKey is the deterministic idempotency key (unique — duplicate submissions are
 * no-ops at the repository edge).
 */
@Entity(tableName = "lesson_sessions", indices = [Index(value = ["stationId"])])
data class LessonSessionEntity(
    @PrimaryKey val sessionId: String,
    val stationId: String,
    val stageCursor: Int,
    val lifecycle: String, // ACTIVE | INTERRUPTED | COMPLETED | ABANDONED
    val engineRuleVersion: String,
    val contentPackageVersion: Int,
    val startedAtMs: Long,
    val updatedAtMs: Long,
)

@Entity(
    tableName = "lesson_attempts",
    indices = [Index(value = ["sessionId"]), Index(value = ["attemptKey"], unique = true)],
)
data class LessonAttemptEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sessionId: String,
    val encounterId: String,
    val stage: String,
    val attemptKey: String,
    val interactionId: String,
    val outcome: String, // CORRECT | INCORRECT | UNSET
    val evaluatorVersion: String,
    val recordedAtMs: Long,
)
