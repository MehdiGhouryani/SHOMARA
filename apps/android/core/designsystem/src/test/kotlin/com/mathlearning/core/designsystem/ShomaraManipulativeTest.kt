package com.mathlearning.core.designsystem

import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** N03-08 manipulative sizing, tap-alternative, math-direction and tolerance tests. */
class ShomaraManipulativeTest {

    private val rule: (String, String) -> Boolean = { selected, target -> selected == "t1" && target == "t2" }

    @Test
    fun `manipulative band is 72-80dp from canonical tokens and enforced`() {
        assertEquals(72.dp, ShomaraManipulativeRules.ManipulativeTarget)
        assertEquals(72.dp, ShomaraTokens.ComponentManipulativeMin)
        assertEquals(80.dp, ShomaraTokens.ComponentManipulativeMax)
        assertTrue(ShomaraManipulativeRules.isPreferredBand(72.dp))
        assertTrue(ShomaraManipulativeRules.isPreferredBand(80.dp))
        assertFalse(ShomaraManipulativeRules.isPreferredBand(84.dp))
        assertFalse(ShomaraManipulativeRules.isPreferredBand(48.dp))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraManipulativeRules.requireBand(64.dp) }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraManipulativeRules.requireBand(84.dp) }
    }

    @Test
    fun `general touch floor stays 48dp for beads and taps`() {
        assertEquals(48.dp, ShomaraManipulativeRules.GeneralTouchTarget)
        assertEquals(ShomaraTokens.ComponentTouchMin, ShomaraTokens.ComponentTrayBead)
    }

    @Test
    fun `tap alternative full flow - select then place`() {
        var session = ShomaraManipulativeSession(tileIds = listOf("t1", "t2", "t3"))
        session = session.onTap("t1", placementRule = rule)
        assertEquals(ShomaraManipulativeState.Active, session.stateOf("t1"))
        assertEquals("t1", session.selectedId)
        session = session.onTap("t2", placementRule = rule)
        assertEquals(ShomaraManipulativeState.Accepted, session.stateOf("t1"))
        assertEquals(ShomaraManipulativeState.Accepted, session.stateOf("t2"))
        assertEquals(setOf("t2"), session.placedIds)
    }

    @Test
    fun `failed placement yields warm retry state and tap deselect clears`() {
        var session = ShomaraManipulativeSession(tileIds = listOf("t1", "t2"))
        session = session.onTap("t1", placementRule = rule).onTap("t2", placementRule = rule)
        // rule rejects t1->t2? rule requires selected=="t1" && target=="t2" => accepted here; force a reject:
        val rejecting = ShomaraManipulativeSession(tileIds = listOf("a", "b")).onTap("a", placementRule = { _, _ -> false }).onTap("b", placementRule = { _, _ -> false })
        assertEquals(ShomaraManipulativeState.Retry, rejecting.stateOf("a"))
        assertEquals(ShomaraManipulativeState.Idle, rejecting.stateOf("b"))
        assertEquals(emptySet<String>(), rejecting.placedIds)
        // Tap the selected tile again -> deselect to Idle.
        var s = ShomaraManipulativeSession(tileIds = listOf("t1", "t2")).onTap("t1", placementRule = rule)
        s = s.onTap("t1", placementRule = rule)
        assertEquals(ShomaraManipulativeState.Idle, s.stateOf("t1"))
        assertEquals(null, s.selectedId)
    }

    @Test
    fun `drag flow is equivalent to tap flow`() {
        var session = ShomaraManipulativeSession(tileIds = listOf("t1", "t2", "t3"))
        session = session.onDragStart("t1")
        assertEquals(ShomaraManipulativeState.Dragging, session.stateOf("t1"))
        assertEquals("t1", session.selectedId)
        session = session.onDragEnd("t2", placementRule = rule)
        assertEquals(ShomaraManipulativeState.Accepted, session.stateOf("t1"))
        assertEquals(ShomaraManipulativeState.Accepted, session.stateOf("t2"))
        assertEquals(setOf("t2"), session.placedIds)
    }

    @Test
    fun `locked tiles ignore taps and drags`() {
        val locked = setOf("t3")
        var session = ShomaraManipulativeSession(tileIds = listOf("t1", "t3"))
        session = session.onTap("t3", locked = locked, placementRule = rule)
        assertEquals(ShomaraManipulativeState.Idle, session.stateOf("t3"))
        assertEquals(null, session.selectedId)
        session = session.onDragStart("t3", locked = locked)
        assertEquals(ShomaraManipulativeState.Idle, session.stateOf("t3"))
    }

    @Test
    fun `clearTransient resets retry and drag but keeps accepted`() {
        var session = ShomaraManipulativeSession(tileIds = listOf("t1", "t2"))
        session = session.onTap("t1", placementRule = { _, _ -> false }).onTap("t2", placementRule = { _, _ -> false })
        assertEquals(ShomaraManipulativeState.Retry, session.stateOf("t1"))
        session = session.clearTransient()
        assertEquals(ShomaraManipulativeState.Idle, session.stateOf("t1"))
        var accepted = ShomaraManipulativeSession(tileIds = listOf("t1", "t2")).onTap("t1", placementRule = rule).onTap("t2", placementRule = rule)
        accepted = accepted.clearTransient()
        assertEquals(ShomaraManipulativeState.Accepted, accepted.stateOf("t2"))
    }

    @Test
    fun `math direction is LTR independent of the interface direction`() {
        assertEquals(LayoutDirection.Ltr, ShomaraManipulativeRules.mathDirection(LayoutDirection.Rtl))
        assertEquals(LayoutDirection.Ltr, ShomaraManipulativeRules.mathDirection(LayoutDirection.Ltr))
        assertEquals(ShomaraDirections.DefaultMathDirection, ShomaraManipulativeRules.mathDirection(ShomaraDirections.DefaultInterfaceDirection))
    }

    @Test
    fun `tolerances are configurable with token-derived defaults`() {
        val defaults = ShomaraManipulativeTolerance()
        assertEquals(ShomaraTokens.MotionDurationSlow.toLong(), defaults.selectionTimeoutMs)
        assertEquals(ShomaraTokens.MotionDurationBase.toLong(), defaults.retryClearDelayMs)
        assertEquals(ShomaraTokens.ComponentEdge, defaults.dragThresholdDp)
        val custom = ShomaraManipulativeTolerance(selectionTimeoutMs = 999, retryClearDelayMs = 1, dragThresholdDp = 8.dp)
        assertNotEquals(defaults, custom)
        assertEquals(999L, custom.selectionTimeoutMs)
    }

    @Test
    fun `every manipulative state carries a non-color label`() {
        for (state in ShomaraManipulativeState.entries) {
            if (state == ShomaraManipulativeState.Idle) continue
            assertTrue("state $state lacks a label", state.stateLabel().isNotEmpty())
        }
    }
}
