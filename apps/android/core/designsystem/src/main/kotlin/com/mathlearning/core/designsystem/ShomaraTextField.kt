package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDirection

/** TextField/OTP state matrix: empty/focused/filled/invalid/disabled/loading (COMPONENT_READINESS). */
enum class ShomaraFieldState { Empty, Focused, Filled, Invalid, Disabled, Loading }

/**
 * Pure field-state mapping — deterministic and JVM-testable. Priority: Disabled > Loading >
 * Invalid > Focused > Filled/Empty. The invalid state always pairs with a caller-supplied
 * actionable error text (status is never conveyed by color alone).
 */
object ShomaraFieldLogic {
    fun stateFor(value: String, focused: Boolean, hasError: Boolean, enabled: Boolean, busy: Boolean): ShomaraFieldState = when {
        !enabled -> ShomaraFieldState.Disabled
        busy -> ShomaraFieldState.Loading
        hasError -> ShomaraFieldState.Invalid
        focused -> ShomaraFieldState.Focused
        value.isEmpty() -> ShomaraFieldState.Empty
        else -> ShomaraFieldState.Filled
    }

    fun borderFor(state: ShomaraFieldState): Color = when (state) {
        ShomaraFieldState.Focused -> ShomaraTokens.ColorPrimary
        ShomaraFieldState.Invalid -> ShomaraTokens.ColorDanger
        ShomaraFieldState.Disabled, ShomaraFieldState.Loading -> ShomaraTokens.ColorLine2
        else -> ShomaraTokens.ColorLine
    }

    fun borderWidthFor(state: ShomaraFieldState): androidx.compose.ui.unit.Dp = when (state) {
        ShomaraFieldState.Focused, ShomaraFieldState.Invalid -> ShomaraTokens.ClayFeaturedBorderWidth
        else -> ShomaraTokens.ClaySoftBorderWidth
    }

    fun labelFor(state: ShomaraFieldState): Color = when (state) {
        ShomaraFieldState.Focused -> ShomaraTokens.ColorPrimary
        ShomaraFieldState.Invalid -> ShomaraTokens.ColorDanger
        ShomaraFieldState.Disabled, ShomaraFieldState.Loading -> ShomaraTokens.ColorMuted
        else -> ShomaraTokens.ColorInk2
    }

    /** Persian text stays RTL; numeric/phone content is pinned LTR for correct digit order. */
    fun textDirectionFor(numericLtr: Boolean): TextDirection =
        if (numericLtr) TextDirection.Ltr else TextDirection.Rtl

    fun textStyleFor(numericLtr: Boolean, state: ShomaraFieldState): TextStyle = TextStyle(
        fontFamily = ShomaraTypography.Family,
        fontWeight = ShomaraTokens.TypeBodyWeight,
        fontSize = ShomaraTokens.TypeBodyFontSize,
        lineHeight = ShomaraTokens.TypeBodyLineHeight,
        color = when (state) {
            ShomaraFieldState.Disabled, ShomaraFieldState.Loading -> ShomaraTokens.ColorMuted
            else -> ShomaraTokens.ColorInk
        },
        textDirection = textDirectionFor(numericLtr),
    )
}

@Composable
fun ShomaraTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    enabled: Boolean = true,
    busy: Boolean = false,
    numericLtr: Boolean = false,
    keyboardType: KeyboardType = if (numericLtr) KeyboardType.Number else KeyboardType.Text,
    hint: String = "",
) {
    // F-13: focus is the field's own state — the caller never passes it in (the old `focused`
    // parameter was only ever set to `true` in the catalog preview, and a caller-passed focus
    // can never be true at first paint anyway). The field state re-evaluates on recomposition.
    var focused by remember { mutableStateOf(false) }
    val state = ShomaraFieldLogic.stateFor(value, focused, errorText != null, enabled, busy)
    val borderColor = ShomaraFieldLogic.borderFor(state)
    Column(modifier = modifier.fillMaxWidth()) {
        // Persistent label: rendered in every state so the layout never jumps.
        Text(
            text = label,
            style = ShomaraTypography.Caption,
            color = ShomaraFieldLogic.labelFor(state),
        )
        val fieldModifier = Modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH)
            // Batch 2 (ADR-0040 R1): the field is the tactile input surface,
            // so it renders Soft clay depth when interactive and stays Flat
            // in its quiet states (disabled/loading).
            .shadow(ShomaraClay.specFor(if (state == ShomaraFieldState.Disabled || state == ShomaraFieldState.Loading) ShomaraClayDepth.Flat else ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusSm))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusSm))
            .border(
                width = ShomaraFieldLogic.borderWidthFor(state),
                color = borderColor,
                shape = RoundedCornerShape(ShomaraTokens.RadiusSm),
            )
            .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8)
        if (state == ShomaraFieldState.Disabled || state == ShomaraFieldState.Loading) {
            Box(modifier = fieldModifier, contentAlignment = Alignment.CenterStart) {
                if (state == ShomaraFieldState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterEnd), color = ShomaraTokens.ColorMuted)
                }
                Text(
                    text = if (value.isEmpty()) hint else value,
                    style = ShomaraFieldLogic.textStyleFor(numericLtr, state),
                )
            }
        } else {
            // The field owns its editing state (state-owning TextFieldState API); every text
            // change is reported through onValueChange. Quiet states (disabled/loading) render
            // the plain read-only branch above, so this branch is always interactive.
            val editableState = rememberTextFieldState(initialText = value)
            // F-34: an external reset (e.g. the caller clearing the value) is synced back
            // into the owned editing state — without this the field keeps showing the old
            // text after the caller has cleared it.
            LaunchedEffect(value) {
                if (editableState.text.toString() != value) editableState.setTextAndPlaceCursorAtEnd(value)
            }
            LaunchedEffect(editableState.text) {
                val text = editableState.text.toString()
                if (text != value) onValueChange(text)
            }
            BasicTextField(
                state = editableState,
                modifier = fieldModifier.semantics(mergeDescendants = true) {
                    if (state == ShomaraFieldState.Invalid && errorText != null) error(errorText)
                }.onFocusChanged { focused = it.isFocused },
                textStyle = ShomaraFieldLogic.textStyleFor(numericLtr, state),
                keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
                cursorBrush = SolidColor(ShomaraTokens.ColorPrimary),
                decorator = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (editableState.text.isEmpty()) {
                            Text(text = hint, style = ShomaraFieldLogic.textStyleFor(numericLtr, state), color = ShomaraTokens.ColorMuted)
                        }
                        inner()
                    }
                },
            )
        }
        // Actionable text error — the non-color status carrier for the Invalid state.
        if (state == ShomaraFieldState.Invalid && errorText != null) {
            Row(modifier = Modifier.padding(top = ShomaraTokens.Space4)) {
                Text(
                    text = errorText,
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorDanger,
                )
            }
        }
    }
}
