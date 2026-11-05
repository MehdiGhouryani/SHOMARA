package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** B5 — hint ladder (stage5 §5.2): the requested level, never content, never a «helped» mark. */
class ShomaraHintLadderTest {

    @Test
    fun `ladder maps attempts to levels`() {
        assertEquals(ShomaraHintLevel.Retry, ShomaraHintLadder.levelFor(1))
        assertEquals(ShomaraHintLevel.H1, ShomaraHintLadder.levelFor(2))
        assertEquals(ShomaraHintLevel.H2, ShomaraHintLadder.levelFor(3))
        assertEquals(ShomaraHintLevel.H3, ShomaraHintLadder.levelFor(4))
        assertEquals(ShomaraHintLevel.H3, ShomaraHintLadder.levelFor(9))
    }

    @Test
    fun `first attempt never produces a hint`() {
        assertNull(ShomaraHintLadder.hintFor(1, setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3)))
    }

    @Test
    fun `a level with no content returns null - the item is not marked helped`() {
        // No content exists for h1 today: the ladder asks for h1 and gets nothing.
        assertNull(ShomaraHintLadder.hintFor(2, emptySet()))
        assertFalse(ShomaraHintLadder.slotVisible(2, emptySet()))
    }

    @Test
    fun `a level with content is returned`() {
        assertEquals(
            ShomaraHintLevel.H2,
            ShomaraHintLadder.hintFor(3, setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2)),
        )
        assertTrue(ShomaraHintLadder.slotVisible(3, setOf(ShomaraHintLevel.H2)))
    }

    @Test
    fun `P4 and P5 have no hint slot at all`() {
        assertFalse(ShomaraHintLadder.slotAllowed(MacroStage.P4_ASSESSMENT))
        assertFalse(ShomaraHintLadder.slotAllowed(MacroStage.P5_TRANSFER))
        assertTrue(ShomaraHintLadder.slotAllowed(MacroStage.P2_GUIDED))
        assertTrue(ShomaraHintLadder.slotAllowed(MacroStage.P3_GAME))
    }

    @Test
    fun `hint events are recorded only when a real hint shows`() {
        assertFalse(ShomaraHintLadder.shouldRecordHintEvent(null))
        assertTrue(ShomaraHintLadder.shouldRecordHintEvent(ShomaraHintLevel.H1))
    }
}
