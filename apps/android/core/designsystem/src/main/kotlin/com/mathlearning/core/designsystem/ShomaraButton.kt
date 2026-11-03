package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp

/**
 * Duplicate-action policy (COMPONENT_READINESS «duplicate-action policy»): a single in-flight
 * latch shared by buttons, tab targets and dialog confirms. begin() admits only the first tap;
 * the caller MUST call end() when the action settles.
 */
class ShomaraTapGuard {
    private var inFlight: Boolean = false

    fun begin(): Boolean {
        if (inFlight) return false
        inFlight = true
        return true
    }

    fun end() {
        inFlight = false
    }
}

/** Button state matrix: default/pressed/focused/disabled/loading (COMPONENT_READINESS Button row). */
enum class ShomaraButtonState { Default, Pressed, Focused, Disabled, Loading }

enum class ShomaraButtonVariant { Primary, Secondary, Ghost }

/** Pure button logic — JVM-testable; the composable is a thin renderer of this contract. */
object ShomaraButtonLogic {
    val MinTouchTarget: Dp = ShomaraTokens.ComponentTouchMin
    val Height: Dp = ShomaraTokens.ComponentButtonH

    fun isEnabled(state: ShomaraButtonState): Boolean = state != ShomaraButtonState.Disabled && state != ShomaraButtonState.Loading

    /**
     * Pressed state reduces clay depth by one tier and never increases it (COMPONENT_READINESS
     * depth contract). Ghost renders flat by design; disabled/loading are quiet and non-affordant.
     */
    fun clayDepth(variant: ShomaraButtonVariant, state: ShomaraButtonState): ShomaraClayDepth = when (state) {
        ShomaraButtonState.Disabled, ShomaraButtonState.Loading -> ShomaraClayDepth.Flat
        ShomaraButtonState.Pressed -> if (variant == ShomaraButtonVariant.Ghost) ShomaraClayDepth.Flat else ShomaraClayDepth.Hint
        else -> if (variant == ShomaraButtonVariant.Ghost) ShomaraClayDepth.Flat else ShomaraClayDepth.Soft
    }

    /** (container, content) pairs resolve only through generated tokens. */
    fun colors(variant: ShomaraButtonVariant, state: ShomaraButtonState): Pair<Color, Color> {
        val quiet = state == ShomaraButtonState.Disabled || state == ShomaraButtonState.Loading
        return when (variant) {
            ShomaraButtonVariant.Primary ->
                if (quiet) ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorMuted
                else ShomaraTokens.ColorPrimary to ShomaraTokens.ColorWhite
            ShomaraButtonVariant.Secondary ->
                if (quiet) ShomaraTokens.ColorSurfaceAlt to ShomaraTokens.ColorMuted
                else ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorPrimaryDark
            ShomaraButtonVariant.Ghost ->
                if (quiet) ShomaraTokens.ColorSurface to ShomaraTokens.ColorMuted
                else ShomaraTokens.ColorSurface to ShomaraTokens.ColorPrimary
        }
    }

    /**
     * N08-03: the canonical 56dp is a MINIMUM, never a fixed height. A button whose label grows at
     * 200% font scale must grow with it — a fixed `.height(...)` plus `maxLines = 1` measured
     * `didOverflowHeight = true` at font scale 2.0 (line bottom 155px inside a 56dp box).
     */
    fun minHeight(): Dp = Height

    /** Vertical breathing room inside the pill; the token-driven source of the extra height. */
    val VerticalPadding: Dp = ShomaraTokens.Space12

    /**
     * Essential action labels are NEVER truncated (no `maxLines`, no ellipsis): clamping an action
     * label hides what the child is agreeing to. A pathologically long label is a content defect
     * caught by the string audit, not something the component silently hides from the child.
     */
    val MaxLabelLines: Int = Int.MAX_VALUE
}

@Composable
fun rememberShomaraTapGuard(): ShomaraTapGuard = remember { ShomaraTapGuard() }

@Composable
fun ShomaraButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ShomaraButtonVariant = ShomaraButtonVariant.Primary,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingStateLabel: String = "در حال انجام",
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
) {
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()
    val state = when {
        !enabled -> ShomaraButtonState.Disabled
        loading -> ShomaraButtonState.Loading
        pressed -> ShomaraButtonState.Pressed
        focused -> ShomaraButtonState.Focused
        else -> ShomaraButtonState.Default
    }
    val (container, content) = ShomaraButtonLogic.colors(variant, state)
    val depth = ShomaraButtonLogic.clayDepth(variant, state)
    val semanticsLabel = when (state) {
        ShomaraButtonState.Disabled -> "غیرفعال"
        ShomaraButtonState.Loading -> loadingStateLabel
        ShomaraButtonState.Pressed -> "فشرده"
        else -> ""
    }
    // Disabled/Loading buttons must not expose an OnClick action to a11y
    // services: Compose's clickable keeps advertising OnClick even when
    // enabled=false, so quiet states skip the clickable modifier entirely
    // (found by the instrumented N08-02 semantics tests).
    val interactive = ShomaraButtonLogic.isEnabled(state)
    Box(
        modifier = modifier
            .defaultMinSize(minWidth = ShomaraButtonLogic.MinTouchTarget, minHeight = ShomaraButtonLogic.minHeight())
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .semantics(mergeDescendants = true) {
                role = Role.Button
                if (state == ShomaraButtonState.Disabled) disabled()
                if (semanticsLabel.isNotEmpty()) stateDescription = semanticsLabel
            }
            .let {
                if (interactive) {
                    it.clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        enabled = true,
                        role = Role.Button,
                    ) {
                        if (tapGuard.begin()) {
                            try { onClick() } finally { tapGuard.end() }
                        }
                    }
                } else it
            }
            .padding(
                horizontal = ShomaraTokens.Space16,
                vertical = ShomaraButtonLogic.VerticalPadding,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8), verticalAlignment = Alignment.CenterVertically) {
            if (state == ShomaraButtonState.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(ShomaraTokens.Space16),
                    color = content,
                    strokeWidth = ShomaraTokens.Space4,
                )
            }
            Text(
                text = text,
                style = ShomaraTypography.Title,
                color = content,
                textAlign = TextAlign.Center,
                maxLines = ShomaraButtonLogic.MaxLabelLines,
            )
        }
    }
}
