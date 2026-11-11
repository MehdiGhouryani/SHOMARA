package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08R-09 guided loop tests: single-select + submit gate, the B5 hint ladder integration,
 * the child-projection boundary (no evaluation fields), and honest item advance.
 */
class ShomaraGuidedTest {

    private val item = ShomaraGuidedItem(
        itemId = "ST07.P2.i01",
        promptText = "چند توپ می‌بینی؟ جواب را انتخاب کن.",
        stimulusObjectKind = "OBJ.ball",
        stimulusCount = 1,
        options = listOf(
            ShomaraGuidedOption("i01.opt1", ShomaraGuidedOptionDisplay.Numeral(1)),
            ShomaraGuidedOption("i01.opt2", ShomaraGuidedOptionDisplay.Numeral(2)),
        ),
        hintTexts = listOf("h1", "h2", "h3"),
        okText = "همین‌طور است؛ یک توپ.",
        retryText = "یک بار دیگر امتحان کنیم.",
    )

    @Test
    fun `submit gate opens only with a real selection`() {
        assertFalse(ShomaraGuidedLogic.canSubmit(null))
        assertTrue(ShomaraGuidedLogic.canSubmit("i01.opt2"))
    }

    @Test
    fun `selection is single and idempotent`() {
        assertEquals("i01.opt2", ShomaraGuidedLogic.onSelect(null, "i01.opt2"))
        assertEquals("i01.opt2", ShomaraGuidedLogic.onSelect("i01.opt2", "i01.opt2"))
        assertTrue(ShomaraGuidedLogic.isSelected("i01.opt2", "i01.opt2"))
        assertFalse(ShomaraGuidedLogic.isSelected("i01.opt1", "i01.opt2"))
    }

    @Test
    fun `hint ladder asks retry first then h1 h2 h3 and never beyond the item slots`() {
        // Attempt 1 = retry: no hint, the child just tries again.
        assertNull(ShomaraGuidedLogic.hintFor(1, item))
        assertEquals(0, ShomaraGuidedLogic.hintFor(2, item))
        assertEquals(1, ShomaraGuidedLogic.hintFor(3, item))
        assertEquals(2, ShomaraGuidedLogic.hintFor(4, item))
        assertEquals(2, ShomaraGuidedLogic.hintFor(9, item))
        // An item whose package carries no hint slots never shows one — no fabrication.
        val bare = item.copy(hintTexts = emptyList())
        assertNull(ShomaraGuidedLogic.hintFor(2, bare))
        assertNull(ShomaraGuidedLogic.hintFor(4, bare))
    }

    @Test
    fun `projection carries display config only - no evaluation fields`() {
        val forbidden = setOf("answer", "correct", "correctOption", "correctCount", "passThreshold", "nextAction", "mastery", "score")
        val names = ShomaraGuidedItem::class.java.declaredFields.map { it.name }.toSet() +
            ShomaraGuidedOption::class.java.declaredFields.map { it.name }.toSet() +
            ShomaraGuidedOptionDisplay.Numeral::class.java.declaredFields.map { it.name }.toSet() +
            ShomaraGuidedOptionDisplay.Pictures::class.java.declaredFields.map { it.name }.toSet()
        val offenders = names.filter { it.lowercase() in forbidden.map { f -> f.lowercase() } }
        assertTrue("child projection must stay evaluation-free, found: $offenders", offenders.isEmpty())
    }

    @Test
    fun `item advance stays inside the list and ends honestly`() {
        assertEquals(1, ShomaraGuidedLogic.nextItemIndex(2, 0))
        assertNull(ShomaraGuidedLogic.nextItemIndex(2, 1))
        assertNull(ShomaraGuidedLogic.nextItemIndex(0, 0))
    }
}
