package com.mathlearning.core.designsystem

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign

/**
 * Branded Compose splash (N08-15) — rendered ONLY while the launch state is
 * `ShomaraLaunchState.Resolving`.
 *
 * Contract (PAGE_UIUX_BLUEPRINT row 01, `pages/01_WELCOME_LAUNCH.md`):
 *  - one warm hero — the owner-supplied artwork rendered untouched, with NUMBER as the focal object;
 *  - the SHOMARA wordmark as live Compose text (never baked into the image);
 *  - one subtle determinate progress treatment with an honest ceiling that never claims completion;
 *  - no artificial waiting: the caller dismisses this surface the moment resolution completes;
 *  - reduced motion freezes the bar (the information stays, the movement does not);
 *  - insets respected, scrollable instead of overflowing at large font scales / short windows.
 *
 * The artwork is drawn with [ContentScale.Fit] inside a box that reserves its real aspect ratio
 * (941 × 1672), so it is never cropped: the picture is the delivered composition, and cropping it
 * would cut the characters the splash is built around.
 *
 * Accessibility: the surface is one merged node announcing "در حال آماده‌سازی شومارا"; the brand
 * line is a heading and the artwork carries a real description, so a screen-reader user is never
 * left with a silent picture.
 */
@Composable
fun ShomaraSplashScreen(
    modifier: Modifier = Modifier,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
    advancing: Boolean = true,
) {
    val fraction = remember { Animatable(ShomaraSplashSpec.AdvanceStart) }
    LaunchedEffect(advancing, reducedMotion) {
        if (reducedMotion) {
            // Reduced motion: a static, honest fixed band. No tween runs at all.
            fraction.snapTo(ShomaraSplashSpec.AdvanceStart)
            return@LaunchedEffect
        }
        if (!advancing) return@LaunchedEffect
        fraction.animateTo(
            targetValue = ShomaraSplashSpec.AdvanceCeiling,
            animationSpec = tween(
                durationMillis = ShomaraTokens.MotionDurationSlow * ShomaraSplashSpec.AdvanceSteps,
                easing = LinearEasing,
            ),
        )
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorSplashCream)
            .semantics(mergeDescendants = true) {
                contentDescription = ShomaraSplashSpec.Announcement
            },
    ) {
        // Compact windows (and large font scales) narrow the hero further instead of shrinking the
        // wordmark or clipping the picture.
        val heroMaxWidth = if (maxWidth < ShomaraTokens.ComponentCharacterCompactWidth) {
            maxWidth
        } else {
            ShomaraTokens.ComponentSplashHeroMaxWidth
        }
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = ShomaraTokens.Space24, vertical = ShomaraTokens.Space24),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Box(
                modifier = Modifier
                    .widthIn(max = heroMaxWidth)
                    .fillMaxWidth()
                    .aspectRatio(ShomaraSplashSpec.ArtworkAspectRatio),
                contentAlignment = Alignment.Center,
            ) {
                Image(
                    painter = painterResource(ShomaraSplashDrawables.Artwork),
                    contentDescription = ShomaraSplashSpec.ArtworkDescription,
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            Spacer(modifier = Modifier.height(ShomaraTokens.Space16))
            Text(
                text = ShomaraSplashSpec.BrandName,
                style = ShomaraTypography.Display,
                color = ShomaraTokens.ColorInk,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { heading() },
            )
            Spacer(modifier = Modifier.height(ShomaraTokens.Space8))
            Text(
                text = ShomaraSplashSpec.LoadingLine,
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
                textAlign = TextAlign.Center,
            )
            Spacer(modifier = Modifier.height(ShomaraTokens.Space24))
            ShomaraProgressBar(
                state = ShomaraProgressState(fraction = fraction.value),
                modifier = Modifier.widthIn(max = ShomaraTokens.ComponentSplashProgressMaxWidth),
                reducedMotion = reducedMotion,
            )
        }
    }
}