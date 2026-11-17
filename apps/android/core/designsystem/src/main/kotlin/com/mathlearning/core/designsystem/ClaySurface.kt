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
import androidx.compose.ui.semantics.contentDescription
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
 * elevation and highlight all resolve through the single ShomaraClay token resolver (never raw values here).
 * Press feedback: scale + sink + shadow transition from the shared spring spec; reduced-motion
 * collapses the animation (values jump, never animate).
 *
 * Rule: text NEVER carries a shadow — shadows apply to the surface layer only (mission).
 * One Featured surface per decision viewport (max-1 is enforced by the callers, ADR-0040).
 */
/**
 * @param depth clay tier (Flat/Hint/Soft/Featured)
 * @param pressed tactile press state (scale + sink + shadow transition)
 * @param reducedMotion collapses all animation (token spring spec unused)
 * @param shape corner radius (token-provided by caller; never a raw magic value)
 */
fun Modifier.shomaraClay(
    depth: ShomaraClayDepth,
    shape: RoundedCornerShape,
    containerColor: Color,
    borderColor: Color,
    pressScale: Float,
    sink: Dp,
): Modifier {
    val spec = ShomaraClay.specFor(depth)
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
    depth: ShomaraClayDepth,
    shape: RoundedCornerShape,
    pressed: Boolean = false,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
    containerColor: Color,
    borderColor: Color,
): Modifier {
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
    return this.shomaraClay(depth, shape, containerColor, borderColor, pressScale, sink)
}

/** The reusable container: a ClaySurface box with optional semantics label. */
@Composable
fun ClaySurface(
    depth: ShomaraClayDepth,
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
    depth: ShomaraClayDepth = ShomaraClayDepth.Soft,
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
