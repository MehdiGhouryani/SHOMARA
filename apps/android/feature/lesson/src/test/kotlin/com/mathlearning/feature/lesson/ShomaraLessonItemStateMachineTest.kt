package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** B3 — lesson-item state machine: the full cycle and every guard, with synthetic inputs. */
class ShomaraLessonItemStateMachineTest {

    @Test
    fun `full cycle walks intro to round end`() {
        val machine = ShomaraLessonItemMachine()
            .toPrompt()
            .toInteract()
            .select()
            .check()
            .toFeedback()
            .next()
            .endRound()
        assertEquals(ShomaraLessonItemState.RoundEnd, machine.state)
    }

    @Test
    fun `check parks in awaiting evaluator - never a verdict`() {
        val machine = ShomaraLessonItemMachine()
            .toPrompt()
            .toInteract()
            .select()
            .check()
        assertTrue(machine.isAwaitingEvaluator)
        assertEquals(ShomaraLessonItemState.Check, machine.state)
    }

    @Test
    fun `check without a selection is refused`() {
        val machine = ShomaraLessonItemMachine().toPrompt().toInteract()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            machine.check()
        }
    }

    @Test
    fun `retry returns to interact with a fresh selection and a higher attempt count`() {
        val machine = ShomaraLessonItemMachine()
            .toPrompt()
            .toInteract()
            .select()
            .check()
            .toFeedback()
            .retry()
        assertEquals(ShomaraLessonItemState.Interact, machine.state)
        assertFalse(machine.hasSelection)
        assertEquals(1, machine.attemptCount)
    }

    @Test
    fun `out-of-order transitions are rejected`() {
        val fresh = ShomaraLessonItemMachine()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.toInteract() }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.check() }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.toFeedback() }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.retry() }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.next() }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { fresh.endRound() }
    }

    @Test
    fun `select records the touch without submitting`() {
        val machine = ShomaraLessonItemMachine().toPrompt().toInteract().select()
        assertTrue(machine.hasSelection)
        assertEquals(ShomaraLessonItemState.Interact, machine.state)
        assertFalse(machine.isAwaitingEvaluator)
    }
}
