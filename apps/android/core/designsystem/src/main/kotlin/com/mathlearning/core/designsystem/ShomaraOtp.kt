package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.LayoutDirection

/**
 * OTP state: digits progress strictly left-to-right by INDEX regardless of the surrounding RTL
 * screen (COMPONENT_READINESS TextField/OTP + MASTER §6). The composable forces LTR layout so
 * cell 0 renders leftmost; TalkBack gets a per-digit description.
 */
data class ShomaraOtpState(
    val length: Int,
    val digits: List<Int?> = List(length) { null },
    val focusIndex: Int = 0,
    val invalid: Boolean = false,
) {
    init {
        require(length > 0) { "otp length must be positive" }
        require(digits.size == length) { "digits size must equal length" }
        require(focusIndex in 0 until length) { "focusIndex out of range" }
    }

    val isComplete: Boolean get() = digits.all { it != null }

    fun asCode(): String = digits.joinToString("") { it?.toString() ?: "-" }

    /** Digit entry fills the current focus cell then advances one LTR cell (capped at the end). */
    fun advance(digit: Int): ShomaraOtpState {
        require(digit in 0..9) { "digit out of range" }
        // A complete code is never silently overwritten; editing goes through backspace.
        if (focusIndex == length - 1 && digits[focusIndex] != null) return copy(invalid = false)
        val next = digits.toMutableList()
        next[focusIndex] = digit
        val nextFocus = if (focusIndex < length - 1) focusIndex + 1 else focusIndex
        return copy(digits = next, focusIndex = nextFocus, invalid = false)
    }

    /** Backspace clears the current cell, or the previous cell when the current one is empty. */
    fun backspace(): ShomaraOtpState {
        val next = digits.toMutableList()
        val target = if (next[focusIndex] != null) focusIndex else focusIndex - 1
        if (target < 0) return copy(invalid = false)
        next[target] = null
        return copy(digits = next, focusIndex = target, invalid = false)
    }

    fun markInvalid(): ShomaraOtpState = copy(invalid = true)
    fun reset(): ShomaraOtpState = ShomaraOtpState(length)

    companion object {
        fun empty(length: Int): ShomaraOtpState = ShomaraOtpState(length)
    }
}

enum class ShomaraOtpFieldState { Empty, Focused, Filled, Invalid, Disabled, Loading }

object ShomaraOtpLogic {
    fun stateFor(state: ShomaraOtpState, focused: Boolean, enabled: Boolean, busy: Boolean): ShomaraOtpFieldState = when {
        !enabled -> ShomaraOtpFieldState.Disabled
        busy -> ShomaraOtpFieldState.Loading
        state.invalid -> ShomaraOtpFieldState.Invalid
        focused -> ShomaraOtpFieldState.Focused
        state.isComplete -> ShomaraOtpFieldState.Filled
        else -> ShomaraOtpFieldState.Empty
    }

    fun cellBorderFor(fieldState: ShomaraOtpFieldState, isFocusCell: Boolean): Color = when {
        fieldState == ShomaraOtpFieldState.Invalid -> ShomaraTokens.ColorDanger
        fieldState == ShomaraOtpFieldState.Focused && isFocusCell -> ShomaraTokens.ColorPrimary
        else -> ShomaraTokens.ColorLine
    }

    fun cellLabel(index: Int, length: Int): String = "رقم ${index + 1} از $length"
}

@Composable
fun ShomaraOtpInput(
    state: ShomaraOtpState,
    onStateChange: (ShomaraOtpState) -> Unit,
    modifier: Modifier = Modifier,
    fieldState: ShomaraOtpFieldState = ShomaraOtpLogic.stateFor(state, focused = true, enabled = true, busy = false),
    enabled: Boolean = true,
) {
    // Strict LTR progression: the row direction is forced LTR even inside an RTL screen.
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8), modifier = modifier) {
            repeat(state.length) { index -> OtpCell(state, index, onStateChange, fieldState, enabled) }
        }
    }
}

@Composable
private fun RowScope.OtpCell(
    state: ShomaraOtpState,
    index: Int,
    onStateChange: (ShomaraOtpState) -> Unit,
    fieldState: ShomaraOtpFieldState,
    enabled: Boolean,
) {
    val digit = state.digits[index]
    val isFocusCell = index == state.focusIndex
    val cellModifier = Modifier
        .size(ShomaraTokens.ComponentTrayBead)
        .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusSm))
        .border(
            width = if (fieldState == ShomaraOtpFieldState.Invalid || (fieldState == ShomaraOtpFieldState.Focused && isFocusCell)) ShomaraTokens.ClayFeaturedBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
            color = ShomaraOtpLogic.cellBorderFor(fieldState, isFocusCell),
            shape = RoundedCornerShape(ShomaraTokens.RadiusSm),
        )
        .semantics {
            contentDescription = ShomaraOtpLogic.cellLabel(index, state.length)
        }
    Box(
        modifier = if (enabled) {
            cellModifier.clickable {
                onStateChange(state.copy(focusIndex = index, invalid = false))
            }
        } else {
            cellModifier
        },
        contentAlignment = Alignment.Center,
    ) {
        if (digit != null) {
            Text(
                text = digit.toString(),
                style = ShomaraTypography.BigNum,
                color = ShomaraTokens.ColorInk,
            )
        }
    }
}
