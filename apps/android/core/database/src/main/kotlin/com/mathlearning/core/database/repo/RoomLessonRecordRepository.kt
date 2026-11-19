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
     * Session upsert-if-absent + attempt insert in ONE transaction.
     * Idempotent by attemptKey: a replayed key is a no-op and returns false.
     */
    override suspend fun recordAttempt(session: LessonSessionRecord, attempt: RecordedAttempt): Boolean {
        require(session.sessionId == attempt.sessionId) {
            "attempt sessionId must match the session being recorded"
        }

        return db.withTransaction {
            val existing = attemptDao.byAttemptKey(attempt.attemptKey)
            if (existing != null) {
                check(existing.sessionId == attempt.sessionId) {
                    "attemptKey is already owned by a different lesson session"
                }
                return@withTransaction false
            }

            val insertedId = attemptDao.insert(
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

            // INSERT OR IGNORE is the final guard if another writer won the unique-key race
            // between the read and insert. Re-read and validate ownership before treating it
            // as an idempotent replay.
            if (insertedId == -1L) {
                val raced = checkNotNull(attemptDao.byAttemptKey(attempt.attemptKey)) {
                    "attempt insert was ignored without a matching idempotency row"
                }
                check(raced.sessionId == attempt.sessionId) {
                    "attemptKey is already owned by a different lesson session"
                }
                return@withTransaction false
            }

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
            true
        }
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
