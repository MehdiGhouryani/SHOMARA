package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** B6 — assessment draw over synthetic family/item ids (never the 26 pilot ids). */
class ShomaraAssessmentDrawTest {

    private val pool = mapOf(
        "F1" to listOf("F1/a", "F1/b"),
        "F2" to listOf("F2/a", "F2/b"),
        "F3" to listOf("F3/a"),
        "F4" to listOf("F4/a", "F4/b"),
    )

    @Test
    fun `draw returns exactly one item per family`() {
        val result = ShomaraAssessmentDraw.draw(pool, seenLastAttempt = emptySet())
        assertTrue(result is ShomaraAssessmentDraw.DrawResult.Drawn)
        assertEquals(listOf("F1/a", "F2/a", "F3/a", "F4/a"), (result as ShomaraAssessmentDraw.DrawResult.Drawn).items)
    }

    @Test
    fun `draw skips items seen in the last attempt`() {
        val result = ShomaraAssessmentDraw.draw(pool, seenLastAttempt = setOf("F1/a", "F2/a"))
        assertEquals(
            listOf("F1/b", "F2/b", "F3/a", "F4/a"),
            (result as ShomaraAssessmentDraw.DrawResult.Drawn).items,
        )
    }

    @Test
    fun `draw honours the count limit`() {
        val result = ShomaraAssessmentDraw.draw(pool, seenLastAttempt = emptySet(), count = 2)
        assertEquals(
            listOf("F1/a", "F2/a"),
            (result as ShomaraAssessmentDraw.DrawResult.Drawn).items,
        )
    }

    @Test
    fun `a family with no fresh item returns an honest error - never a hidden repeat`() {
        val result = ShomaraAssessmentDraw.draw(pool, seenLastAttempt = setOf("F3/a"))
        assertEquals(
            ShomaraAssessmentDraw.DrawResult.MissingFreshItem("F3"),
            result,
        )
    }

    @Test
    fun `zero count is refused`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraAssessmentDraw.draw(pool, seenLastAttempt = emptySet(), count = 0)
        }
    }
}
