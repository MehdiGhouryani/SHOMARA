package com.mathlearning.feature.onboarding

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.semantics.clearAndSetSemantics
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraTokens

/** The owner's handoff samples draw every onboarding CTA as a pill; the app-wide default is RadiusMd. */
internal val OnboardingCtaShape: Shape = RoundedCornerShape(ShomaraTokens.RadiusPill)

/**
 * The single onboarding CTA surface.
 *
 * Before this, `WelcomePhone` and `ProfileScreens` each carried a hand-rolled copy of the button's
 * press/focus state machine, colour and clay-depth lookup, disabled semantics, tap guard, padding
 * and label — four implementations of [ShomaraButton], kept in sync by hand. Only two things are
 * genuinely page-local: the drawn arrow artwork and the owner's decision that the phone/profile
 * CTAs stay dark while their field is still empty. Those are the only parameters here.
 */
@Composable
internal fun OnboardingCta(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    darkWhenDisabled: Boolean = false,
    // F-33: under reduced motion the loading spinner renders as a static dot.
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
    arrow: (@Composable (Color) -> Unit)? = null,
) {
    ShomaraButton(
        text = text,
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        loading = loading,
        reducedMotion = reducedMotion,
        shape = OnboardingCtaShape,
        // Page-local disabled colour only for the pages the owner called out; null keeps the
        // shared quiet mapping that every other button in the app uses.
        disabledContainer = if (darkWhenDisabled) ShomaraTokens.ColorPrimaryDark else null,
        disabledContent = if (darkWhenDisabled) ShomaraTokens.ColorWhite else null,
        leading = arrow,
    )
}

/**
 * The owner's `16-icon-arrow`, drawn at the button's resolved content colour so the mark can never
 * drift from its label. Physical right = `Alignment.CenterStart` in RTL, where the samples put it.
 */
@Composable
internal fun OnboardingArrow(color: Color) {
    Canvas(
        modifier = Modifier
            .size(ShomaraTokens.Space24)
            .clearAndSetSemantics {},
    ) {
        drawPath(
            path = ShomaraProfileShapes.iconArrowPath(size.width, size.height),
            color = color,
            style = Stroke(width = ShomaraTokens.Space4.toPx(), cap = StrokeCap.Round),
        )
    }
}
