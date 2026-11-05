package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
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
 *
 * Deep review (F-14): a plain in-flight latch re-admits a tap the instant the previous action
 * settles, so a fast double tap can still fire twice. [beginLatched] adds a short cooldown
 * after [end] (300 ms) for surfaces the child can hammer — buttons and cards. [begin]/[end]
 * are untouched: the existing «tap guard admits the first tap only» test still holds.
 */
class ShomaraTapGuard(
    private val nowMs: () -> Long = { System.currentTimeMillis() },
) {
    private var inFlight: Boolean = false
    private var lastEndMs: Long? = null

    fun begin(): Boolean {
        if (inFlight) return false
        inFlight = true
        return true
    }

    fun end() {
        inFlight = false
        lastEndMs = nowMs()
    }

    /**
     * Latched begin: like [begin], but a tap inside [LATCH_COOLDOWN_MS] after the previous
     * action settled is refused — the child must lift and re-tap deliberately. The clock is
     * injectable so the cooldown is JVM-testable without sleeping.
     */
    fun beginLatched(): Boolean {
        if (inFlight) return false
        val last = lastEndMs
        if (last != null && nowMs() - last < LATCH_COOLDOWN_MS) return false
        inFlight = true
        return true
    }

    companion object {
        /** Cooldown after an action settles before the same guard admits another tap. */
        const val LATCH_COOLDOWN_MS: Long = 300L
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
    // F-33: under reduced motion the loading spinner renders as a static dot — a spinning
    // indicator is motion the child asked to reduce. Defaults to the composition-wide flag
    // so a caller cannot forget to pass it.
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
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
    // ADR-0040: the computed clay depth is rendered, never logic-only. The token
    // shadow is the 3D bottom edge the Duolingo evidence shows on every primary
    // button (Soft by default, Hint when pressed, Flat — 0 elevation, no shadow —
    // when disabled/loading, and Flat for Ghost by design). The elevation comes
    // only from the clay spec, so no raw size ever enters this file.
    val depthElevation = ShomaraClay.specFor(depth).elevation
    Box(
        modifier = modifier
            .defaultMinSize(minWidth = ShomaraButtonLogic.MinTouchTarget, minHeight = ShomaraButtonLogic.minHeight())
            .shadow(depthElevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            // E-03: a Ghost button is flat by design, but flat must not mean edgeless — it
            // carries a hairline border in the line token so the touchable area stays visible
            // against the canvas. The depth stays Flat (ADR-0040 R1).
            .then(
                if (variant == ShomaraButtonVariant.Ghost) {
                    Modifier.border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
                } else Modifier
            )
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
                        // F-14: the latched guard refuses a tap inside the cooldown after the
                        // previous action settled — a fast double tap cannot fire twice.
                        if (tapGuard.beginLatched()) {
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
                if (reducedMotion) {
                    // F-33: static loading mark — same size and colour as the spinner, no rotation.
                    Box(
                        modifier = Modifier.size(ShomaraTokens.Space16).background(content, CircleShape),
                    )
                } else {
                    CircularProgressIndicator(
                        modifier = Modifier.size(ShomaraTokens.Space16),
                        color = content,
                        strokeWidth = ShomaraTokens.Space4,
                    )
                }
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
