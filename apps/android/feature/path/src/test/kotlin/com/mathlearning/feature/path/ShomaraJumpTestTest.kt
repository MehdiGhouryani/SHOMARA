package com.mathlearning.feature.path

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** B11 — jump-assessment shell: configurable count, one attempt, no mid-test feedback. */
class ShomaraJumpAssessmentTest {

    @Test
    fun `question count is a parameter - neither hardcoded 1 nor 5`() {
        assertEquals(3, ShomaraJumpAssessment(questionCount = 3).questionCount)
        assertEquals(7, ShomaraJumpAssessment(questionCount = 7).questionCount)
    }

    @Test
    fun `one attempt covers the whole test`() {
        val test = ShomaraJumpAssessment(questionCount = 3)
        assertEquals(1, test.attemptsLeft)
        assertFalse(test.finished)
        val done = test.answer().answer().answer()
        assertTrue(done.finished)
        assertEquals(0, done.attemptsLeft)
    }

    @Test
    fun `a second attempt after finishing is refused`() {
        val done = ShomaraJumpAssessment(questionCount = 1).answer()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            done.answer()
        }
    }

    @Test
    fun `progress line counts in Persian from counts only`() {
        assertEquals("سؤال ۱ از ۳", ShomaraJumpAssessment(questionCount = 3).progressLine())
        assertEquals("سؤال ۲ از ۳", ShomaraJumpAssessment(questionCount = 3).answer().progressLine())
        assertEquals("سؤال ۳ از ۳", ShomaraJumpAssessment(questionCount = 3).answer().answer().answer().progressLine())
    }

    @Test
    fun `zero questions is refused`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraJumpAssessment(questionCount = 0)
        }
    }
}
