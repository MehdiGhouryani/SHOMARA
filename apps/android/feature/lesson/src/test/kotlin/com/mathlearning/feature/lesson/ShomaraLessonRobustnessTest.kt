package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08-05 robustness matrix (JVM): fast taps, offline recovery, no dead ends.
 *
 * Every assertion here maps to a defect that existed in the real lesson host — these are not
 * hypothetical rules.
 */
class ShomaraLessonRobustnessTest {

    // ---- fast taps: single-flight submission ----

    @Test
    fun `a submission with no rendered option is never sent`() {
        // The old host always sent the literal "opt-1": an answer the child never chose.
        val gate = ShomaraSubmitGateState()
        assertFalse(ShomaraLessonSubmitGate.canSubmit(gate, null))
        assertFalse(ShomaraLessonSubmitGate.canSubmit(gate, ""))
        assertFalse(ShomaraLessonSubmitGate.canSubmit(gate, "   "))
        assertTrue(ShomaraLessonSubmitGate.canSubmit(gate, "opt-2"))
    }

    @Test
    fun `a second tap while one submission is in flight is ignored`() {
        var gate = ShomaraSubmitGateState()
        gate = ShomaraLessonSubmitGate.begin(gate, "opt-2")
        assertTrue(gate.inFlight)
        // Rapid double tap: the second begin must not change anything.
        val second = ShomaraLessonSubmitGate.begin(gate, "opt-2")
        assertEquals(gate, second)
        assertFalse("still in flight after a duplicate tap", !second.inFlight)
        // Exactly one submission is counted when it completes.
        val done = ShomaraLessonSubmitGate.succeed(second)
        assertFalse(done.inFlight)
        assertEquals(1, done.submissions)
    }

    @Test
    fun `failure releases the lock so the child can retry`() {
        var gate = ShomaraLessonSubmitGate.begin(ShomaraSubmitGateState(), "opt-2")
        assertFalse(ShomaraLessonSubmitGate.canSubmit(gate, "opt-2"))
        gate = ShomaraLessonSubmitGate.fail(gate)
        assertFalse(gate.inFlight)
        // A failed attempt is NOT a submission: the count stays honest.
        assertEquals(0, gate.submissions)
        assertTrue(ShomaraLessonSubmitGate.canSubmit(gate, "opt-2"))
    }

    @Test
    fun `many rapid taps produce exactly one counted submission`() {
        var gate = ShomaraSubmitGateState()
        var counted = 0
        repeat(25) {
            if (ShomaraLessonSubmitGate.canSubmit(gate, "opt-2")) {
                gate = ShomaraLessonSubmitGate.begin(gate, "opt-2")
                gate = ShomaraLessonSubmitGate.succeed(gate)
                counted += 1
            }
        }
        // Sequential taps legitimately each submit; the point is the guard never double-books ONE
        // in-flight request. Verify the invariant with an interleaved pattern instead.
        assertEquals(25, counted)
        var interleaved = ShomaraSubmitGateState()
        var sent = 0
        repeat(25) {
            // simulate 25 taps queued before recomposition disables the button
            if (ShomaraLessonSubmitGate.canSubmit(interleaved, "opt-2")) {
                interleaved = ShomaraLessonSubmitGate.begin(interleaved, "opt-2")
                sent += 1
            }
        }
        assertEquals("only one submission may be in flight at a time", 1, sent)
    }

    // ---- back gesture: never lose the child's place ----

    @Test
    fun `first back asks instead of exiting`() {
        val next = ShomaraLessonBackLogic.onBack(ShomaraCloseConfirmState.NotRequested)
        assertEquals(ShomaraCloseConfirmState.AwaitingConfirmation, next)
        assertTrue(ShomaraLessonBackLogic.consumesBack(next))
    }

    @Test
    fun `second back dismisses the question and stays in the lesson`() {
        var state = ShomaraLessonBackLogic.onBack(ShomaraCloseConfirmState.NotRequested)
        state = ShomaraLessonBackLogic.onBack(state)
        // Dismissing must NOT be ConfirmedExit — back never exits without an explicit choice.
        assertEquals(ShomaraCloseConfirmState.NotRequested, state)
        assertTrue(ShomaraLessonBackLogic.consumesBack(state))
    }

    @Test
    fun `back after a confirmed exit does not re-ask`() {
        val state = ShomaraLessonBackLogic.onBack(ShomaraCloseConfirmState.ConfirmedExit)
        assertEquals(ShomaraCloseConfirmState.ConfirmedExit, state)
        assertFalse(ShomaraLessonBackLogic.consumesBack(state))
    }

    @Test
    fun `repeated back presses never reach a confirmed exit`() {
        var state: ShomaraCloseConfirmState = ShomaraCloseConfirmState.NotRequested
        repeat(20) { state = ShomaraLessonBackLogic.onBack(state) }
        assertFalse(
            "back alone must never exit the lesson",
            state == ShomaraCloseConfirmState.ConfirmedExit,
        )
    }

    // ---- stage walk: no dead end at the final stage ----

    @Test
    fun `the stage walk progresses through every macro stage exactly once`() {
        val visited = mutableListOf(MacroStage.P1_DISCOVER)
        var current: MacroStage? = MacroStage.P1_DISCOVER
        while (true) {
            current = ShomaraLessonStageWalk.next(current!!) ?: break
            visited += current
        }
        assertEquals(MacroStage.entries.toList(), visited)
        // No duplicates: the old clamping made the last stage repeat forever.
        assertEquals(visited.size, visited.toSet().size)
    }

    @Test
    fun `past the final stage the walk returns null instead of repeating it`() {
        val last = MacroStage.entries.last()
        assertTrue(ShomaraLessonStageWalk.isFinal(last))
        assertNull(
            "the final stage must not clamp onto itself (that was an infinite loop)",
            ShomaraLessonStageWalk.next(last),
        )
    }

    @Test
    fun `only the final stage reports itself as final`() {
        for (stage in MacroStage.entries.dropLast(1)) {
            assertFalse("$stage must have a successor", ShomaraLessonStageWalk.isFinal(stage))
        }
    }

    // ---- stale banner: a recovered child must not keep seeing the error ----

    @Test
    fun `a stale interruption is cleared after a later success`() {
        val stale = ShomaraLessonBannerPolicy.afterFailure("اتصال قطع شد.")
        assertEquals("اتصال قطع شد.", stale)
        assertNull(
            "a recovered attempt must clear the old error banner",
            ShomaraLessonBannerPolicy.afterSuccess(stale),
        )
    }

    @Test
    fun `a failure banner carries the network message verbatim`() {
        val message = "اینترنت وصل نیست؛ دوباره تلاش کن."
        assertEquals(message, ShomaraLessonBannerPolicy.afterFailure(message))
    }
}