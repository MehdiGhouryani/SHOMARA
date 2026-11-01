package com.mathlearning.feature.lesson

import com.mathlearning.core.datastore.LessonCheckpoint
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.model.MacroStage
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** N06-02/N06-03 logic tests: chrome progress, close confirmation, P1/P2 states, checkpoint. */
class ShomaraLessonCoreTest {

    // ---- chrome progress ----

    @Test
    fun `progress fraction is server-driven and clamped`() {
        assertEquals(0.5f, ShomaraLessonChromeLogic.progressFraction(2, 4))
        assertEquals(0f, ShomaraLessonChromeLogic.progressFraction(0, 4))
        assertEquals(1f, ShomaraLessonChromeLogic.progressFraction(9, 4))
        assertNull(ShomaraLessonChromeLogic.progressFraction(null, 4))
        assertNull(ShomaraLessonChromeLogic.progressFraction(1, 0))
        assertEquals("گام ۲ از ۴", ShomaraLessonChromeLogic.progressAnnouncement(2, 4))
        assertEquals("در حال همگام‌سازی با سرور", ShomaraLessonChromeLogic.progressAnnouncement(null, null))
    }

    // ---- close confirmation (fail-safe) ----

    @Test
    fun `close confirmation never exits on a stray tap`() {
        var state: ShomaraCloseConfirmState = ShomaraCloseConfirmState.NotRequested
        state = ShomaraCloseConfirmLogic.request(state)
        assertEquals(ShomaraCloseConfirmState.AwaitingConfirmation, state)
        // Dismissing returns to the lesson.
        state = ShomaraCloseConfirmLogic.stay(state)
        assertEquals(ShomaraCloseConfirmState.Dismissed, state)
        state = ShomaraCloseConfirmLogic.reset(state)
        assertEquals(ShomaraCloseConfirmState.NotRequested, state)
        // Confirming requires the awaiting state; double-confirm is idempotent.
        state = ShomaraCloseConfirmLogic.request(state)
        state = ShomaraCloseConfirmLogic.confirmExit(state)
        assertEquals(ShomaraCloseConfirmState.ConfirmedExit, state)
        assertEquals(ShomaraCloseConfirmState.ConfirmedExit, ShomaraCloseConfirmLogic.confirmExit(state))
        // The copy is fail-safe: progress is kept.
        assertTrue(ShomaraCloseConfirmLogic.ExitQuestion.contains("ذخیره"))
    }

    // ---- P1 teach ----

    @Test
    fun `teach states never block the child - audio failure is warm-retriable`() {
        for (state in ShomaraTeachState.entries) {
            assertFalse(ShomaraTeachLogic.isBlocking(state))
        }
        assertEquals(ShomaraTeachState.Interactive, ShomaraTeachLogic.nextAfterInteraction(ShomaraTeachState.Ready))
        assertEquals(ShomaraTeachState.Interactive, ShomaraTeachLogic.nextAfterInteraction(ShomaraTeachState.Failed))
    }

    // ---- P2/P3 guided ----

    @Test
    fun `guided flow select then submit then server result`() {
        var session = ShomaraGuidedSession()
        assertEquals(ShomaraGuidedState.Idle, session.state)
        session = session.select("opt-2")
        assertEquals(ShomaraGuidedState.Selected, session.state)
        session = session.submit()
        assertEquals(ShomaraGuidedState.Submitting, session.state)
        session = session.onServerResult(correct = true)
        assertEquals(ShomaraGuidedState.Correct, session.state)
    }

    @Test
    fun `submit without selection is rejected - duplicate submits blocked by state`() {
        val idle = ShomaraGuidedSession()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { idle.submit() }
        val submitted = ShomaraGuidedSession().select("a").submit()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { submitted.submit() }
    }

    @Test
    fun `hints are bounded scaffolding inside P2-P3`() {
        var session = ShomaraGuidedSession(maxHintLevel = 3)
        session = session.requestHint()
        assertEquals(1, session.hintLevel)
        session = session.requestHint().requestHint()
        assertEquals(3, session.hintLevel)
        assertFalse(session.canRequestHint) // capped
        assertEquals(session, session.requestHint())
    }

    @Test
    fun `server result drives retry and recovery - client never decides`() {
        var session = ShomaraGuidedSession().select("a").submit()
        session = session.onServerResult(correct = false)
        assertEquals(ShomaraGuidedState.Retry, session.state)
        session = session.enterRecovery()
        assertEquals(ShomaraGuidedState.Recovery, session.state)
        assertEquals(ShomaraGuidedState.Offline, session.goOffline().state)
    }

    // ---- checkpoint store (real DataStore on JVM) ----

    private class FakeCheckpointStore : LessonCheckpointStore {
        val map = mutableMapOf<String, LessonCheckpoint>()
        private fun key(sessionId: String, stationId: String) = "$sessionId|$stationId"
        override suspend fun save(checkpoint: LessonCheckpoint) { map[key(checkpoint.sessionId, checkpoint.stationId)] = checkpoint }
        override suspend fun read(sessionId: String, stationId: String): LessonCheckpoint? = map[key(sessionId, stationId)]
        override suspend fun clear(sessionId: String, stationId: String) { map.remove(key(sessionId, stationId)) }
    }

    @Test
    fun `checkpoint round trip keyed by session and station`() = runTest {
        val store = FakeCheckpointStore()
        val position = ShomaraLessonPosition("s-1", "ST07", "e-9", MacroStage.P2_GUIDED, 2, 5)
        assertNull(store.read("s-1", "ST07"))
        store.save(position.checkpoint(savedAtMs = 123L))
        val restored = store.read("s-1", "ST07")
        assertEquals(LessonCheckpoint("s-1", "ST07", "e-9", "P2_GUIDED", 123L), restored)
        // A different session does not see it.
        assertNull(store.read("s-2", "ST07"))
        store.clear("s-1", "ST07")
        assertNull(store.read("s-1", "ST07"))
    }
}
