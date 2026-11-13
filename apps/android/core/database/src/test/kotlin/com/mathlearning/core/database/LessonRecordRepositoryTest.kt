package com.mathlearning.core.database

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.mathlearning.core.database.repo.RoomLessonRecordRepository
import com.mathlearning.core.model.repository.LessonSessionRecord
import com.mathlearning.core.model.repository.RecordedAttempt
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/** P6 persistence integration: attempt+session in ONE transaction, idempotent, process-death safe. */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LessonRecordRepositoryTest {

    private val context: Context = ApplicationProvider.getApplicationContext()

    private fun build(name: String) = ShomaraLearningDatabase.build(context, name, androidx.room.RoomDatabase.JournalMode.TRUNCATE)

    private fun session(name: String, version: Int = 1) = LessonSessionRecord(
        sessionId = name, stationId = "ST07", stageCursor = 0, lifecycle = "ACTIVE",
        engineRuleVersion = "learning-engine:v1", contentPackageVersion = version,
        startedAtMs = 10L, updatedAtMs = 10L,
    )

    private fun attempt(key: String, outcome: String = "INCORRECT") = RecordedAttempt(
        // The key's second segment IS the sessionId (attempt|<sessionId>|<encounter>|<idx>|<interaction>).
        sessionId = key.split('|').getOrNull(1) ?: key, encounterId = "e1", stage = "P2_GUIDED", attemptKey = key,
        interactionId = "i1", outcome = outcome, evaluatorVersion = "scripted-test-v1", recordedAtMs = 20L,
    )

    @Test
    fun `session and attempt land in one transaction - readable afterwards`() = runBlocking {
        val db = build("lesson-tx.db")
        val repo = RoomLessonRecordRepository(db)
        assertTrue(repo.recordAttempt(session("s-k1"), attempt("attempt|s-k1|e1|1|i1")))
        assertEquals(1, repo.attemptsFor("s-k1").size)
        val stored = repo.session("s-k1")
        assertNotNull(stored)
        assertEquals("ACTIVE", stored!!.lifecycle)
        assertEquals("INCORRECT", repo.attemptsFor("s-k1").single().outcome)
        db.close()
    }

    @Test
    fun `duplicate attemptKey is an idempotent no-op - the attempt is never double-counted`() = runBlocking {
        val db = build("lesson-idem.db")
        val repo = RoomLessonRecordRepository(db)
        val key = "attempt|s-idem|e1|1|i1"
        assertTrue(repo.recordAttempt(session("s-idem"), attempt(key, outcome = "CORRECT")))
        assertFalse("a replayed key must record nothing", repo.recordAttempt(session("s-idem"), attempt(key, outcome = "CORRECT")))
        assertEquals(1, repo.attemptsFor("s-idem").size)
        db.close()
    }

    @Test
    fun `process death - sessions and attempts survive a full close and reopen`() = runBlocking {
        val first = build("lesson-death.db")
        val repo = RoomLessonRecordRepository(first)
        repo.recordAttempt(session("s-death"), attempt("attempt|s-death|e2|2|i3", outcome = "CORRECT"))
        repo.recordAttempt(session("s-death"), attempt("attempt|s-death|e2|2|i4", outcome = "INCORRECT"))
        first.close()

        val second = build("lesson-death.db")
        val reopened = RoomLessonRecordRepository(second)
        assertEquals(2, reopened.attemptsFor("s-death").size)
        assertEquals("ACTIVE", reopened.session("s-death")!!.lifecycle)
        second.close()
    }

    @Test
    fun `content-018 - stored rows carry identifiers and outcome only`() = runBlocking {
        val db = build("lesson-privacy.db")
        val repo = RoomLessonRecordRepository(db)
        repo.recordAttempt(session("s-p"), attempt("attempt|s-p|e1|1|i1"))
        val attempts = repo.attemptsFor("s-p")
        val forbidden = listOf("answer", "answerKey", "evaluatorConfig", "choiceText")
        forbidden.forEach { key ->
            assertTrue(attempts.single().toString().contains(key, ignoreCase = true).not())
        }
        db.close()
    }
}
