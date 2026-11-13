package com.mathlearning.core.designsystem

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * ClaySurface (P13, ADR-0049) — the reusable Clay container over the canonical four depth tiers.
 *
 * Depth contract (token-driven, ADR-0040): Flat / Hint / Soft / Featured — border, shadow,
 * elevation and highlight all resolve through ShomaraTokens (never raw values here).
 * Press feedback: scale + sink + shadow transition from the shared spring spec; reduced-motion
 * collapses the animation (values jump, never animate).
 *
 * Rule: text NEVER carries a shadow — shadows apply to the surface layer only (mission).
 * One Featured surface per decision viewport (max-1 is enforced by the callers, ADR-0040).
 */
enum class ClayDepth { FLAT, HINT, SOFT, FEATURED }

data class ClaySpec(
    val borderWidth: Dp,
    val shadowOpacity: Float,
    val shadowRadius: Dp,
    val shadowOffsetY: Dp,
    val highlightOpacity: Float,
    val highlightThickness: Dp,
    val elevation: Dp,
)

object ClaySpecResolver {
    fun specFor(depth: ClayDepth): ClaySpec = when (depth) {
        ClayDepth.FLAT -> ClaySpec(ShomaraTokens.ClayFlatBorderWidth, ShomaraTokens.ClayFlatShadowOpacity.toFloat(), ShomaraTokens.ClayFlatShadowRadius, ShomaraTokens.ClayFlatShadowOffsetY, ShomaraTokens.ClayFlatHighlightOpacity.toFloat(), ShomaraTokens.ClayFlatHighlightThickness, ShomaraTokens.ClayFlatElevation)
        ClayDepth.HINT -> ClaySpec(ShomaraTokens.ClayHintBorderWidth, ShomaraTokens.ClayHintShadowOpacity.toFloat(), ShomaraTokens.ClayHintShadowRadius, ShomaraTokens.ClayHintShadowOffsetY, ShomaraTokens.ClayHintHighlightOpacity.toFloat(), ShomaraTokens.ClayHintHighlightThickness, ShomaraTokens.ClayHintElevation)
        ClayDepth.SOFT -> ClaySpec(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ClaySoftShadowOpacity.toFloat(), ShomaraTokens.ClaySoftShadowRadius, ShomaraTokens.ClaySoftShadowOffsetY, ShomaraTokens.ClaySoftHighlightOpacity.toFloat(), ShomaraTokens.ClaySoftHighlightThickness, ShomaraTokens.ClaySoftElevation)
        ClayDepth.FEATURED -> ClaySpec(ShomaraTokens.ClayFeaturedBorderWidth, ShomaraTokens.ClayFeaturedShadowOpacity.toFloat(), ShomaraTokens.ClayFeaturedShadowRadius, ShomaraTokens.ClayFeaturedShadowOffsetY, ShomaraTokens.ClayFeaturedHighlightOpacity.toFloat(), ShomaraTokens.ClayFeaturedHighlightThickness, ShomaraTokens.ClayFeaturedElevation)
    }
}

/**
 * @param depth clay tier (Flat/Hint/Soft/Featured)
 * @param pressed tactile press state (scale + sink + shadow transition)
 * @param reducedMotion collapses all animation (token spring spec unused)
 * @param radius corner radius (token-provided by caller; never a raw magic value)
 */
fun Modifier.shomaraClay(
    depth: ClayDepth,
    shape: RoundedCornerShape,
    pressed: Boolean,
    reducedMotion: Boolean,
    containerColor: Color,
    borderColor: Color,
    pressScale: Float,
    sink: Dp,
): Modifier {
    val spec = ClaySpecResolver.specFor(depth)
    val shadowOpacity = if (pressed) spec.shadowOpacity * 0.6f else spec.shadowOpacity
    return this
        .graphicsLayer {
            scaleX = pressScale
            scaleY = pressScale
            translationY = sink.toPx()
        }
        .shadow(elevation = spec.elevation, shape = shape, clip = false)
        .background(containerColor, shape)
        .border(spec.borderWidth, borderColor, shape)
        .padding(spec.highlightThickness)
}

/** Composable entry: computes the animated press values from the shared spring spec, then applies the static clay modifier. */
@Composable
fun Modifier.shomaraClayAnimated(
    depth: ClayDepth,
    shape: RoundedCornerShape,
    pressed: Boolean = false,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
    containerColor: Color,
    borderColor: Color,
): Modifier {
    val spec = ClaySpecResolver.specFor(depth)
    val pressScale by animateFloatAsState(
        targetValue = if (pressed) ShomaraPressFeedbackLogic.pressedScale() else 1f,
        animationSpec = if (reducedMotion) snap() else spring(
            dampingRatio = ShomaraPressFeedbackLogic.dampingRatio(),
            stiffness = ShomaraPressFeedbackLogic.stiffness(),
        ),
        label = "clay-press-scale",
    )
    val sink by animateDpAsState(
        targetValue = if (pressed) ShomaraPressFeedbackLogic.pressedSink() else 0.dp,
        animationSpec = if (reducedMotion) snap() else spring(
            dampingRatio = ShomaraPressFeedbackLogic.dampingRatio(),
            stiffness = ShomaraPressFeedbackLogic.stiffness(),
        ),
        label = "clay-press-sink",
    )
    return this.shomaraClay(depth, shape, pressed, reducedMotion, containerColor, borderColor, pressScale, sink)
}

/** The reusable container: a ClaySurface box with optional semantics label. */
@Composable
fun ClaySurface(
    depth: ClayDepth,
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(ShomaraTokens.RadiusLg),
    pressed: Boolean = false,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
    containerColor: Color = ShomaraTokens.ColorSurface,
    borderColor: Color = ShomaraTokens.ColorLine,
    content: @Composable () -> Unit,
) {
    Box(modifier = modifier.shomaraClayAnimated(depth, shape, pressed, reducedMotion, containerColor, borderColor)) {
        content()
    }
}

/** ShomaraIconButton (P13): icon-only button, 48dp minimum touch, clay depth per state. */
@Composable
fun ShomaraIconButton(
    iconText: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
    depth: ClayDepth = ClayDepth.SOFT,
    enabled: Boolean = true,
    onClick: () -> Unit = {},
) {
    Box(
        modifier = modifier
            .size(ShomaraTokens.ComponentTouchMin)
            .shomaraClayAnimated(depth, CircleShape, pressed = false, containerColor = ShomaraTokens.ColorPrimary, borderColor = ShomaraTokens.ColorPrimaryDark)
            .semantics { this.contentDescription = contentDescription }
            .then(if (enabled) Modifier.clickable(onClick = onClick) else Modifier),
        contentAlignment = Alignment.Center,
    ) {
        Text(iconText, color = ShomaraTokens.ColorInk)
    }
}
