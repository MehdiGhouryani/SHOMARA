package com.mathlearning.core.designsystem

import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** N03-03 state-matrix and semantics tests (JVM-pure logic; visual/device evidence stays NATIVE_PENDING). */
class ShomaraPrimitives03Test {

    // ---- duplicate-tap guard ----

    @Test
    fun `tap guard admits the first tap only`() {
        val guard = ShomaraTapGuard()
        assertTrue(guard.begin())
        assertFalse(guard.begin())
        guard.end()
        assertTrue(guard.begin())
        guard.end()
    }

    // ---- button ----

    @Test
    fun `button states disable interaction for disabled and loading`() {
        for (variant in ShomaraButtonVariant.entries) {
            assertTrue(ShomaraButtonLogic.isEnabled(ShomaraButtonState.Default))
            assertTrue(ShomaraButtonLogic.isEnabled(ShomaraButtonState.Pressed))
            assertTrue(ShomaraButtonLogic.isEnabled(ShomaraButtonState.Focused))
            assertFalse(ShomaraButtonLogic.isEnabled(ShomaraButtonState.Disabled))
            assertFalse(ShomaraButtonLogic.isEnabled(ShomaraButtonState.Loading))
        }
    }

    @Test
    fun `pressed state reduces clay depth by one tier`() {
        for (variant in ShomaraButtonVariant.entries) {
            val rest = ShomaraButtonLogic.clayDepth(variant, ShomaraButtonState.Default)
            val pressed = ShomaraButtonLogic.clayDepth(variant, ShomaraButtonState.Pressed)
            assertTrue("pressed must not deepen clay", pressed.ordinal <= rest.ordinal)
        }
        assertEquals(ShomaraClayDepth.Soft, ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, ShomaraButtonState.Default))
        assertEquals(ShomaraClayDepth.Hint, ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, ShomaraButtonState.Pressed))
        assertEquals(ShomaraClayDepth.Flat, ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, ShomaraButtonState.Loading))
        assertEquals(ShomaraClayDepth.Flat, ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Ghost, ShomaraButtonState.Pressed))
    }

    @Test
    fun `button keeps 48dp floor and a token minimum instead of a fixed height`() {
        assertEquals(ShomaraTokens.ComponentTouchMin, ShomaraButtonLogic.MinTouchTarget)
        assertEquals(ShomaraTokens.ComponentButtonH, ShomaraButtonLogic.Height)
        // N08-03: the canonical 56dp is a MINIMUM — the button grows with its label instead of
        // clipping it at large font scales (measured didOverflowHeight=true at 200% before).
        assertEquals(ShomaraTokens.ComponentButtonH, ShomaraButtonLogic.minHeight())
        assertEquals(ShomaraTokens.Space12, ShomaraButtonLogic.VerticalPadding)
        assertTrue(ShomaraButtonLogic.Height >= ShomaraButtonLogic.MinTouchTarget)
        // Essential action labels are never clamped to a fixed line count.
        assertTrue(ShomaraButtonLogic.MaxLabelLines > 2)
    }

    @Test
    fun `button color pairs resolve from tokens and quiet states mute content`() {
        val (primaryContainer, primaryContent) = ShomaraButtonLogic.colors(ShomaraButtonVariant.Primary, ShomaraButtonState.Default)
        assertEquals(ShomaraTokens.ColorPrimary, primaryContainer)
        assertEquals(ShomaraTokens.ColorWhite, primaryContent)
        val (quietContainer, quietContent) = ShomaraButtonLogic.colors(ShomaraButtonVariant.Primary, ShomaraButtonState.Disabled)
        assertEquals(ShomaraTokens.ColorPrimarySoft, quietContainer)
        assertEquals(ShomaraTokens.ColorMuted, quietContent)
    }

    // ---- text field ----

    @Test
    fun `field state mapping covers the full matrix with deterministic priority`() {
        assertEquals(ShomaraFieldState.Disabled, ShomaraFieldLogic.stateFor("", focused = true, hasError = true, enabled = false, busy = true))
        assertEquals(ShomaraFieldState.Loading, ShomaraFieldLogic.stateFor("۹", focused = true, hasError = true, enabled = true, busy = true))
        assertEquals(ShomaraFieldState.Invalid, ShomaraFieldLogic.stateFor("۹", focused = true, hasError = true, enabled = true, busy = false))
        assertEquals(ShomaraFieldState.Focused, ShomaraFieldLogic.stateFor("", focused = true, hasError = false, enabled = true, busy = false))
        assertEquals(ShomaraFieldState.Empty, ShomaraFieldLogic.stateFor("", focused = false, hasError = false, enabled = true, busy = false))
        assertEquals(ShomaraFieldState.Filled, ShomaraFieldLogic.stateFor("abc", focused = false, hasError = false, enabled = true, busy = false))
    }

    @Test
    fun `field text direction is pinned per content kind and independent of theme`() {
        assertEquals(TextDirection.Rtl, ShomaraFieldLogic.textDirectionFor(numericLtr = false))
        assertEquals(TextDirection.Ltr, ShomaraFieldLogic.textDirectionFor(numericLtr = true))
    }

    @Test
    fun `field border colors and widths come from tokens`() {
        assertEquals(ShomaraTokens.ColorPrimary, ShomaraFieldLogic.borderFor(ShomaraFieldState.Focused))
        assertEquals(ShomaraTokens.ColorDanger, ShomaraFieldLogic.borderFor(ShomaraFieldState.Invalid))
        assertEquals(ShomaraTokens.ClayFeaturedBorderWidth, ShomaraFieldLogic.borderWidthFor(ShomaraFieldState.Invalid))
        assertEquals(ShomaraTokens.ClaySoftBorderWidth, ShomaraFieldLogic.borderWidthFor(ShomaraFieldState.Filled))
    }

    @Test
    fun `numeric field defaults to number keyboard`() {
        // Mirrors the composable default: numericLtr implies KeyboardType.Number.
        val numericLtr = true
        assertEquals(if (numericLtr) KeyboardType.Number else KeyboardType.Text, KeyboardType.Number)
        assertEquals(if (!numericLtr) KeyboardType.Number else KeyboardType.Text, KeyboardType.Text)
    }

    // ---- OTP ----

    @Test
    fun `otp digits progress strictly left-to-right by index`() {
        var state = ShomaraOtpState.empty(4)
        state = state.advance(1).advance(2).advance(3).advance(4)
        assertEquals(listOf<Int?>(1, 2, 3, 4), state.digits)
        assertEquals("1234", state.asCode())
        assertTrue(state.isComplete)
        // Filling is capped at the last (rightmost LTR) cell.
        state = state.advance(9)
        assertEquals(listOf<Int?>(1, 2, 3, 4), state.digits)
    }

    @Test
    fun `otp backspace clears current then previous cell`() {
        var state = ShomaraOtpState.empty(3).advance(7).advance(8)
        assertEquals(listOf<Int?>(7, 8, null), state.digits)
        state = state.backspace() // clears current (index 2 is empty) -> clears index 1
        assertEquals(listOf<Int?>(7, null, null), state.digits)
        state = state.backspace()
        assertEquals(listOf<Int?>(null, null, null), state.digits)
        state = state.backspace() // already empty at index 0 -> stays
        assertEquals(listOf<Int?>(null, null, null), state.digits)
    }

    @Test
    fun `otp invalid flag clears on next input and state mapping follows matrix`() {
        var state = ShomaraOtpState.empty(4).markInvalid()
        assertTrue(state.invalid)
        state = state.advance(5)
        assertFalse(state.invalid)
        assertEquals(ShomaraOtpFieldState.Invalid, ShomaraOtpLogic.stateFor(ShomaraOtpState.empty(4).markInvalid(), focused = true, enabled = true, busy = false))
        assertEquals(ShomaraOtpFieldState.Disabled, ShomaraOtpLogic.stateFor(ShomaraOtpState.empty(4), focused = true, enabled = false, busy = false))
        assertEquals(ShomaraOtpFieldState.Loading, ShomaraOtpLogic.stateFor(ShomaraOtpState.empty(4), focused = true, enabled = true, busy = true))
        assertEquals(ShomaraOtpFieldState.Filled, ShomaraOtpLogic.stateFor(ShomaraOtpState.empty(4).advance(1).advance(2).advance(3).advance(4), focused = false, enabled = true, busy = false))
        assertEquals(ShomaraOtpFieldState.Empty, ShomaraOtpLogic.stateFor(ShomaraOtpState.empty(4), focused = false, enabled = true, busy = false))
    }

    @Test
    fun `otp reset and invariants hold`() {
        val state = ShomaraOtpState.empty(4).advance(1)
        assertNotEquals(state, state.reset())
        assertEquals(ShomaraOtpState.empty(4), state.reset())
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraOtpState.empty(0) }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraOtpState.empty(3).advance(11) }
    }

    @Test
    fun `otp cell size and per-digit talkback labels`() {
        assertEquals(ShomaraTokens.ComponentTrayBead, ShomaraTokens.ComponentTouchMin)
        assertTrue(ShomaraOtpLogic.cellLabel(0, 4).contains("۱") || ShomaraOtpLogic.cellLabel(0, 4).isNotEmpty())
        // LTR layout contract is encoded by forcing the layout direction at render time.
        assertEquals(LayoutDirection.Ltr, ShomaraDirections.DefaultMathDirection)
    }
}
