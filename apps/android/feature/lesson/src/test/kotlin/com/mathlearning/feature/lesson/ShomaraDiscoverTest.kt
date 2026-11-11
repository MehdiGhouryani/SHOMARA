package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08R-08 discover flow tests: pure touch/reveal/advance logic plus the CHILD-PROJECTION
 * boundary — the discover models must never carry answer, correctness or threshold fields
 * (CONTENT-008 / ADR-0039 §2), because evaluation belongs to the separate evaluator layer.
 */
class ShomaraDiscoverTest {

    private val step = ShomaraDiscoverStep(
        stepId = "ST07.P1.s01",
        cards = listOf(
            ShomaraDiscoverCard("OBJ.sun", "ST07.P1.s01.a"),
            ShomaraDiscoverCard("OBJ.house", "ST07.P1.s01.b"),
            ShomaraDiscoverCard("OBJ.tree", "ST07.P1.s01.c"),
        ),
        countPerCard = 1,
        revealGlyphAssetId = "GLYPH.1",
        promptAudioId = "ST07.P1.s01.pr",
        doneAudioId = "ST07.P1.s01.done",
    )

    @Test
    fun `reveal only opens when every card is touched`() {
        assertFalse(ShomaraDiscoverLogic.allTouched(step, setOf(0)))
        assertFalse(ShomaraDiscoverLogic.allTouched(step, setOf(0, 1)))
        assertTrue(ShomaraDiscoverLogic.allTouched(step, setOf(0, 1, 2)))
        // Extra indices (impossible from the UI) do not break the gate either.
        assertTrue(ShomaraDiscoverLogic.allTouched(step, setOf(0, 1, 2, 3)))
    }

    @Test
    fun `touching is idempotent - a double tap never counts twice`() {
        val once = ShomaraDiscoverLogic.onCardTouched(emptySet(), 0)
        val twice = ShomaraDiscoverLogic.onCardTouched(once, 0)
        assertEquals(once, twice)
        assertEquals(setOf(0), twice)
    }

    @Test
    fun `step advance stays inside the list and ends honestly`() {
        assertEquals(1, ShomaraDiscoverLogic.nextStepIndex(2, 0))
        assertNull(ShomaraDiscoverLogic.nextStepIndex(2, 1))
        assertNull(ShomaraDiscoverLogic.nextStepIndex(0, 0))
    }

    @Test
    fun `projection carries identifiers and interaction config only - no evaluation fields`() {
        val forbidden = setOf("answer", "correct", "correctCount", "correctDots", "passThreshold", "nextAction", "mastery")
        val names = ShomaraDiscoverStep::class.java.declaredFields.map { it.name }.toSet() +
            ShomaraDiscoverCard::class.java.declaredFields.map { it.name }.toSet()
        val offenders = names.filter { it.lowercase() in forbidden.map { f -> f.lowercase() } }
        assertTrue("child projection must stay evaluation-free, found: $offenders", offenders.isEmpty())
        // The projection facts that DO exist (spec-derived, not judged).
        assertTrue(names.containsAll(listOf("cards", "countPerCard", "revealGlyphAssetId", "promptAudioId", "doneAudioId")))
    }

    @Test
    fun `count per card comes from the draft spec facts`() {
        val pairs = step.copy(countPerCard = 2)
        assertEquals(1, step.countPerCard)
        assertEquals(2, pairs.countPerCard)
    }
}
