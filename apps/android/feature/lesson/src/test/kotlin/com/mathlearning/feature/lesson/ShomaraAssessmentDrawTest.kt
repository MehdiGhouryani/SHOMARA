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

    @Test
    fun `a pool with fewer families than the count is refused - never a silent short draw`() {
        val shortPool = mapOf(
            "F1" to listOf("F1/a"),
            "F2" to listOf("F2/a"),
        )
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraAssessmentDraw.draw(shortPool, seenLastAttempt = emptySet(), count = 4)
        }
    }

    @Test
    fun `draw order never depends on map iteration order (R-17)`() {
        // The same entries inserted in the opposite order must draw identically — the
        // families are sorted before the draw, so a HashMap and a LinkedHashMap agree.
        val shuffled = linkedMapOf(
            "F4" to listOf("F4/a", "F4/b"),
            "F3" to listOf("F3/a"),
            "F2" to listOf("F2/a", "F2/b"),
            "F1" to listOf("F1/a", "F1/b"),
        )
        val result = ShomaraAssessmentDraw.draw(shuffled, seenLastAttempt = emptySet())
        assertTrue(result is ShomaraAssessmentDraw.DrawResult.Drawn)
        assertEquals(listOf("F1/a", "F2/a", "F3/a", "F4/a"), (result as ShomaraAssessmentDraw.DrawResult.Drawn).items)
        // With more families than the count, the first `count` in sorted order are drawn.
        val five = linkedMapOf(
            "F5" to listOf("F5/a"),
            "F4" to listOf("F4/a"),
            "F3" to listOf("F3/a"),
            "F2" to listOf("F2/a"),
            "F1" to listOf("F1/a"),
        )
        assertEquals(
            listOf("F1/a", "F2/a"),
            (ShomaraAssessmentDraw.draw(five, seenLastAttempt = emptySet(), count = 2) as ShomaraAssessmentDraw.DrawResult.Drawn).items,
        )
    }
}
