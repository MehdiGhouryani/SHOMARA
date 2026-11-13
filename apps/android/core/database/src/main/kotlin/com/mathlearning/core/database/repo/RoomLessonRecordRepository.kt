package com.mathlearning.core.database.repo

import androidx.room.withTransaction
import com.mathlearning.core.database.ShomaraLearningDatabase
import com.mathlearning.core.database.entity.LessonAttemptEntity
import com.mathlearning.core.database.entity.LessonSessionEntity
import com.mathlearning.core.model.repository.LessonRecordRepository
import com.mathlearning.core.model.repository.LessonSessionRecord
import com.mathlearning.core.model.repository.RecordedAttempt

class RoomLessonRecordRepository(private val db: ShomaraLearningDatabase) : LessonRecordRepository {
    private val sessionDao = db.lessonSessionDao()
    private val attemptDao = db.lessonAttemptDao()

    /**
     * Session upsert-if-absent + attempt insert in ONE transaction (owner P6 mission).
     * Idempotent by attemptKey: a replayed key inserts nothing and returns false.
     */
    override suspend fun recordAttempt(session: LessonSessionRecord, attempt: RecordedAttempt): Boolean {
        val alreadyRecorded = db.withTransaction {
            if (sessionDao.byId(session.sessionId) == null) {
                sessionDao.upsert(
                    LessonSessionEntity(
                        sessionId = session.sessionId,
                        stationId = session.stationId,
                        stageCursor = session.stageCursor,
                        lifecycle = session.lifecycle,
                        engineRuleVersion = session.engineRuleVersion,
                        contentPackageVersion = session.contentPackageVersion,
                        startedAtMs = session.startedAtMs,
                        updatedAtMs = session.updatedAtMs,
                    ),
                )
            } else {
                sessionDao.setLifecycle(session.sessionId, session.lifecycle, session.updatedAtMs)
            }
            attemptDao.byAttemptKey(attempt.attemptKey) != null
        }
        if (alreadyRecorded) return false
        db.withTransaction {
            attemptDao.insert(
                LessonAttemptEntity(
                    sessionId = attempt.sessionId,
                    encounterId = attempt.encounterId,
                    stage = attempt.stage,
                    attemptKey = attempt.attemptKey,
                    interactionId = attempt.interactionId,
                    outcome = attempt.outcome,
                    evaluatorVersion = attempt.evaluatorVersion,
                    recordedAtMs = attempt.recordedAtMs,
                ),
            )
        }
        return true
    }

    override suspend fun session(sessionId: String): LessonSessionRecord? = sessionDao.byId(sessionId)?.toDomain()

    override suspend fun attemptsFor(sessionId: String): List<RecordedAttempt> =
        attemptDao.forSession(sessionId).map { it.toDomain() }

    private fun LessonSessionEntity.toDomain(): LessonSessionRecord = LessonSessionRecord(
        sessionId = sessionId,
        stationId = stationId,
        stageCursor = stageCursor,
        lifecycle = lifecycle,
        engineRuleVersion = engineRuleVersion,
        contentPackageVersion = contentPackageVersion,
        startedAtMs = startedAtMs,
        updatedAtMs = updatedAtMs,
    )

    private fun LessonAttemptEntity.toDomain(): RecordedAttempt = RecordedAttempt(
        sessionId = sessionId,
        encounterId = encounterId,
        stage = stage,
        attemptKey = attemptKey,
        interactionId = interactionId,
        outcome = outcome,
        evaluatorVersion = evaluatorVersion,
        recordedAtMs = recordedAtMs,
    )
}
