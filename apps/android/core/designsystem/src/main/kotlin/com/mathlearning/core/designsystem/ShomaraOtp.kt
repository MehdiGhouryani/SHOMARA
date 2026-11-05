package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
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
    val expired: Boolean = false,
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
        return copy(digits = next, focusIndex = nextFocus, invalid = false, expired = false)
    }

    /** Backspace clears the current cell, or the previous cell when the current one is empty. */
    fun backspace(): ShomaraOtpState {
        val next = digits.toMutableList()
        val target = if (next[focusIndex] != null) focusIndex else focusIndex - 1
        if (target < 0) return copy(invalid = false)
        next[target] = null
        return copy(digits = next, focusIndex = target, invalid = false, expired = false)
    }

    fun markInvalid(): ShomaraOtpState = copy(invalid = true)
    fun markExpired(): ShomaraOtpState = copy(expired = true)
    fun reset(): ShomaraOtpState = ShomaraOtpState(length)

    /**
     * Paste support: a pasted code fills the cells from the leftmost LTR cell in order; extra
     * digits beyond the length are ignored and the focus lands on the last filled cell.
     */
    fun fillFromCode(code: String): ShomaraOtpState {
        val digits = code.mapNotNull { it.digitToIntOrNull() }.take(length)
        if (digits.isEmpty()) return this
        val next: MutableList<Int?> = digits.map { it as Int? }.toMutableList()
        while (next.size < length) next.add(null)
        return copy(digits = next, focusIndex = (digits.size - 1).coerceAtLeast(0), invalid = false, expired = false)
    }

    companion object {
        fun empty(length: Int): ShomaraOtpState = ShomaraOtpState(length)
    }
}

enum class ShomaraOtpFieldState { Empty, Focused, Filled, Invalid, Expired, Disabled, Loading }

object ShomaraOtpLogic {
    fun stateFor(state: ShomaraOtpState, focused: Boolean, enabled: Boolean, busy: Boolean): ShomaraOtpFieldState = when {
        !enabled -> ShomaraOtpFieldState.Disabled
        busy -> ShomaraOtpFieldState.Loading
        state.expired -> ShomaraOtpFieldState.Expired
        state.invalid -> ShomaraOtpFieldState.Invalid
        focused -> ShomaraOtpFieldState.Focused
        state.isComplete -> ShomaraOtpFieldState.Filled
        else -> ShomaraOtpFieldState.Empty
    }

    fun expiredLabel(): String = "کد منقضی شد؛ کد جدید بفرست."

    fun cellBorderFor(fieldState: ShomaraOtpFieldState, isFocusCell: Boolean): Color = when {
        fieldState == ShomaraOtpFieldState.Invalid -> ShomaraTokens.ColorDanger
        fieldState == ShomaraOtpFieldState.Focused && isFocusCell -> ShomaraTokens.ColorPrimary
        else -> ShomaraTokens.ColorLine
    }

    fun cellLabel(index: Int, length: Int): String = "رقم ${ShomaraDigits.toFa(index + 1)} از ${ShomaraDigits.toFa(length)}"
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
    // The row fills the available width so the four cells share it evenly — a digit scaled to
    // 200% grows in height (min height is a floor, not a cap) yet can never push the row past
    // the screen edge into horizontal overflow.
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            modifier = modifier.fillMaxWidth(),
        ) {
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
    // N08-03: the 48dp bead is the MINIMUM target, not a fixed box. A 40sp digit becomes 80sp at
    // 200% font scale and a fixed .size() would clip it; weight(1f) also guarantees the four cells
    // share the row width so a scaled digit can never push the row into horizontal overflow.
    val cellModifier = Modifier
        .weight(1f)
        .defaultMinSize(minWidth = ShomaraTokens.ComponentTrayBead, minHeight = ShomaraTokens.ComponentTrayBead)
        // Batch 2 (ADR-0040 R1): OTP cells are tappable (tap moves focus),
        // so they render Soft clay depth when enabled, Flat when disabled.
        .shadow(ShomaraClay.specFor(if (enabled) ShomaraClayDepth.Soft else ShomaraClayDepth.Flat).elevation, RoundedCornerShape(ShomaraTokens.RadiusSm))
        .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusSm))
        .border(
            width = if (fieldState == ShomaraOtpFieldState.Invalid || (fieldState == ShomaraOtpFieldState.Focused && isFocusCell)) ShomaraTokens.ClayFeaturedBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
            color = ShomaraOtpLogic.cellBorderFor(fieldState, isFocusCell),
            shape = RoundedCornerShape(ShomaraTokens.RadiusSm),
        )
        .padding(vertical = ShomaraTokens.Space8)
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
                textAlign = TextAlign.Center,
                maxLines = 1,
            )
        }
    }
}
