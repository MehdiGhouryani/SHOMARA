package com.mathlearning.feature.lesson

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S5 — the stage intro card: the child learns which stage is starting, in ≤1.5s, then the card
 * gets out of the way. It is a card, not an overlay with animation debt: in reduced motion the
 * same card appears with no movement at all, so the INFORMATION is identical in both modes.
 */
@Composable
fun ShomaraStationIntroCard(
    stageIndex: Int,
    stageLabel: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val announcement = remember(stageIndex, stageLabel) {
        ShomaraLessonStrings.stageChipsAnnouncement(stageIndex, stageLabel)
    }
    val shape = RoundedCornerShape(ShomaraTokens.RadiusLg)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ShomaraTokens.ColorSurfaceAlt, shape)
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine2, shape)
            .semantics(mergeDescendants = true) {
                liveRegion = LiveRegionMode.Polite
                contentDescription = announcement
            }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                role = Role.Button,
                onClick = onDismiss,
            )
            .padding(horizontal = ShomaraTokens.Space24, vertical = ShomaraTokens.Space16),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        Text(
            text = stageLabel,
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
        )
        Text(
            text = ShomaraLessonStrings.IntroCardHint,
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
            textAlign = TextAlign.Center,
        )
    }
}

/**
 * S5 — the end-of-station moment.
 *
 * Exactly one owner shows this (see [ShomaraCelebrationGate]); the composable itself draws either
 * the celebratory particle field or — with reduced motion — a still card with the check mark and
 * the guide's poster slot. The particle layer can only ever draw [ShomaraParticleShape], so the
 * reward iconography of a game economy is not representable here.
 *
 * The guide's full-body presence (stage5 §4.3) is a SLOT until the asset phase: an empty,
 * documented placeholder is drawn instead of an invented character.
 */
@Composable
fun ShomaraCelebrationOverlay(
    kind: ShomaraCelebrationKind,
    copyLine: String,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (kind == ShomaraCelebrationKind.None) return
    val reducedMotion = LocalShomaraReducedMotion.current
    val particles = remember(kind, reducedMotion) {
        ShomaraParticleBudget.particles(kind, reducedMotion)
    }
    val progress = remember(kind) { Animatable(0f) }
    val durationMs = ShomaraParticleBudget.LIFE_MS.toInt()

    // One finite run per celebration: no infinite loop ever runs while the child is solving.
    LaunchedEffect(kind) {
        if (reducedMotion) {
            progress.snapTo(1f)
            onDone()
        } else {
            progress.animateTo(1f, tween(durationMs, easing = LinearEasing))
            onDone()
        }
    }

    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        if (particles.isNotEmpty()) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val t = progress.value
                particles.forEach { particle ->
                    val x = particle.xFraction * size.width
                    val y = (particle.yFraction + t * 0.35f) * size.height
                    val alpha = (1f - t).coerceIn(0f, 1f)
                    when (particle.shape) {
                        ShomaraParticleShape.Line -> drawLine(
                            color = ShomaraTokens.ColorAmber.copy(alpha = alpha),
                            start = Offset(x, y),
                            end = Offset(x, y + ShomaraTokens.Space12.toPx()),
                            strokeWidth = ShomaraTokens.Space4.toPx(),
                        )
                        ShomaraParticleShape.Dot -> drawCircle(
                            color = ShomaraTokens.ColorAmber.copy(alpha = alpha),
                            radius = ShomaraTokens.Space4.toPx(),
                            center = Offset(x, y),
                        )
                    }
                }
            }
        }
        ShomaraCelebrationCard(copyLine = copyLine)
    }
}

@Composable
private fun ShomaraCelebrationCard(copyLine: String) {
    val shape = RoundedCornerShape(ShomaraTokens.RadiusLg)
    Column(
        modifier = Modifier
            .background(ShomaraTokens.ColorSurface, shape)
            .border(ShomaraTokens.ClayAnswerTileBorderWidth, ShomaraTokens.ColorPrimary, shape)
            .semantics(mergeDescendants = true) {
                liveRegion = LiveRegionMode.Polite
                contentDescription = ShomaraLessonStrings.CelebrationMark + " " + copyLine
            }
            .padding(horizontal = ShomaraTokens.Space24, vertical = ShomaraTokens.Space16),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        // The mark is a glyph, not an award icon: stage5 allows the check mark and the retry
        Text(
            text = ShomaraLessonStrings.CelebrationMark,
            style = ShomaraTypography.Display,
            color = ShomaraTokens.ColorPrimary,
        )
        Text(
            text = copyLine,
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
        )
    }
}
