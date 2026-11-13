package com.mathlearning.app.preview

import com.mathlearning.core.model.repository.LessonRecordRepository
import com.mathlearning.core.model.repository.LessonSessionRecord
import com.mathlearning.core.model.repository.RecordedAttempt
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

/**
 * LessonAttemptRecorder (P14) — bridges the guided-stage evaluator outcomes into the durable
 * Room v3 store. The DEBUG preview wires this so the real interactive flow persists attempts
 * exactly as the production engine will: every «بررسی» tap becomes an idempotent, IDs-only
 * Room row (CONTENT-018).
 */
class LessonAttemptRecorder(
    private val scope: CoroutineScope,
    private val repository: LessonRecordRepository,
    private val sessionId: String,
    private val stationId: String,
    private val engineRuleVersion: String = "learning-engine:v1",
    private val contentPackageVersion: Int = 1,
) {
    fun recordOutcome(
        encounterId: String,
        stage: String,
        attemptIndex: Int,
        interactionId: String,
        outcome: String,
        evaluatorVersion: String,
    ) {
        scope.launch {
            val attemptKey = "attempt|$sessionId|$encounterId|$attemptIndex|$interactionId"
            repository.recordAttempt(
                LessonSessionRecord(
                    sessionId = sessionId,
                    stationId = stationId,
                    stageCursor = 0,
                    lifecycle = "ACTIVE",
                    engineRuleVersion = engineRuleVersion,
                    contentPackageVersion = contentPackageVersion,
                    startedAtMs = System.currentTimeMillis(),
                    updatedAtMs = System.currentTimeMillis(),
                ),
                RecordedAttempt(
                    sessionId = sessionId,
                    encounterId = encounterId,
                    stage = stage,
                    attemptKey = attemptKey,
                    interactionId = interactionId,
                    outcome = outcome,
                    evaluatorVersion = evaluatorVersion,
                    recordedAtMs = System.currentTimeMillis(),
                ),
            )
        }
    }
}
