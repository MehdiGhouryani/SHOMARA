package com.mathlearning.feature.lesson

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraClayDepth.Featured
import com.mathlearning.core.designsystem.ShomaraClayDepth.Soft
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraPressScale

/**
 * N08R-08 — the child-safe DISCOVER projection (family 08, Teach/Discover).
 *
 * These models are the CHILD PROJECTION of the ST07 pilot's P1 discover steps (ADR-0039 §2
 * boundary): prompt/audio/asset identifiers and interaction config ONLY — no answer, no
 * correctness, no pass threshold, no next-step decision ever enters this file. Evaluation
 * stays in the (future, O1-gated) local evaluator layer; this projection can never judge.
 *
 * The draft pilot (content-library/originals/shomara-stage7-pilot-ST07.md §2) defines:
 * s01 = three single objects (sun/house/tree) revealing «۱»; s02 = three PAIRS
 * (eyes/shoes/wheels) revealing «۲». `countPerCard` is that spec fact, not a guess.
 */
data class ShomaraDiscoverCard(
    val assetId: String,
    val labelAudioId: String,
)

data class ShomaraDiscoverStep(
    val stepId: String,
    val cards: List<ShomaraDiscoverCard>,
    /** How many objects each card shows (1 for singles, 2 for pairs in the ST07 pilot). */
    val countPerCard: Int,
    val revealGlyphAssetId: String,
    val promptAudioId: String,
    val doneAudioId: String,
)

/** Pure discover flow: touch progression, reveal gate, step advance. No evaluation here. */
object ShomaraDiscoverLogic {
    fun isTouched(touched: Set<Int>, index: Int): Boolean = index in touched

    /** Touching is idempotent — a double tap never counts the same card twice. */
    fun onCardTouched(touched: Set<Int>, index: Int): Set<Int> = touched + index

    fun allTouched(step: ShomaraDiscoverStep, touched: Set<Int>): Boolean =
        touched.size >= step.cards.size

    fun nextStepIndex(stepCount: Int, current: Int): Int? =
        (current + 1).takeIf { current + 1 < stepCount }
}

/**
 * The Teach/Discover stage (N08R-08): big tappable object tiles the child counts by
 * touching, each touch showing the card's count mark — the ANIMATION IS THE CONCEPT
 * (touching groups objects into a countable set); when every card is touched, the numeral
 * reveals in the chapter-featured spot. Honest limits: the OBJ/GLYPH/audio assets are NOT
 * delivered (CONTENT-009/006), so tiles render neutral geometric placeholders and the
 * reveal uses the token typography — the write-in glyph animation awaits GLYPH.1/2.
 * Reduced motion: the reveal is a static state change, never a tween.
 */
@Composable
fun ShomaraDiscoverStage(
    steps: List<ShomaraDiscoverStep>,
    onAllStepsComplete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    require(steps.isNotEmpty()) { "discover stage needs steps; empty content stays on the skeleton" }
    var stepIndex by remember { mutableIntStateOf(0) }
    var touched by remember { mutableStateOf(setOf<Int>()) }
    val reducedMotion = LocalShomaraReducedMotion.current
    val step = steps[stepIndex]
    val revealed = ShomaraDiscoverLogic.allTouched(step, touched)

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterHorizontally),
        ) {
            step.cards.forEachIndexed { index, _ ->
                ShomaraDiscoverCardTile(
                    index = index,
                    ordinal = index + 1,
                    countPerCard = step.countPerCard,
                    touched = ShomaraDiscoverLogic.isTouched(touched, index),
                    reducedMotion = reducedMotion,
                    onTouch = { touched = ShomaraDiscoverLogic.onCardTouched(touched, index) },
                )
            }
        }
        if (revealed) {
            ShomaraDiscoverReveal(
                count = step.countPerCard,
                reducedMotion = reducedMotion,
                modifier = Modifier.fillMaxWidth(),
            )
            val next = ShomaraDiscoverLogic.nextStepIndex(steps.size, stepIndex)
            if (next != null) {
                ShomaraButton(
                    modifier = Modifier.fillMaxWidth(),
                    text = "ادامه",
                    onClick = {
                        stepIndex = next
                        touched = setOf()
                    },
                    variant = ShomaraButtonVariant.Primary,
                )
            } else {
                // Last step done: the preview/loop ends honestly — mastery and stage
                // advance belong to the evaluator layer (O1/Phase 1), never to this UI.
                Text(
                    text = "این پیش‌نمایش همین‌جا تمام می‌شود؛ ادامهٔ درس به‌زودی فعال می‌شود.",
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorMuted,
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { liveRegion = LiveRegionMode.Polite },
                )
                LaunchedEffect(Unit) { onAllStepsComplete() }
            }
        }
    }
}

/**
 * One tappable object tile (72dp manipulative floor): neutral geometric placeholder
 * (the OBJ.* art is not delivered), Soft clay with a 3D lip; on touch the tile wakes —
 * accent border + the card's count mark (the concept made visible), never colour alone.
 */
@Composable
private fun ShomaraDiscoverCardTile(
    index: Int,
    ordinal: Int,
    countPerCard: Int,
    touched: Boolean,
    reducedMotion: Boolean,
    onTouch: () -> Unit,
) {
    val accent = ShomaraTokens.ColorPrimary
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMax)
            .shomaraPressScale(pressed = pressed, reducedMotion = reducedMotion)
            .drawBehind {
                val edge = ShomaraTokens.ComponentEdge.toPx()
                drawRoundRect(
                    color = if (touched) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurfaceAlt,
                    topLeft = Offset(0f, edge),
                    size = size,
                    cornerRadius = CornerRadius(ShomaraTokens.RadiusMd.toPx()),
                )
            }
            .shadow(ShomaraClay.specFor(Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(if (touched) ShomaraTokens.ColorSurface else ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(
                width = if (touched) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (touched) accent else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = "شیء شمارش ${ShomaraDigits.toFa(ordinal)}"
                stateDescription = if (touched) "شمرده شد" else "لمس نکرده"
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.Button,
            ) { onTouch() },
        contentAlignment = Alignment.Center,
    ) {
        // Neutral geometric placeholder (deterministic, token-drawn) — NOT the object art.
        Canvas(modifier = Modifier.size(ShomaraTokens.Space32)) {
            val stroke = ShomaraTokens.Space4.toPx()
            val paint = if (touched) accent else ShomaraTokens.ColorInk2
            when (index % 3) {
                0 -> drawCircle(color = paint, radius = size.minDimension / 2f - stroke, style = Stroke(stroke))
                1 -> drawRoundRect(
                    color = paint,
                    cornerRadius = CornerRadius(ShomaraTokens.Space4.toPx()),
                    style = Stroke(stroke),
                )
                else -> {
                    val p = androidx.compose.ui.graphics.Path().apply {
                        moveTo(size.width / 2f, 0f)
                        lineTo(size.width, size.height)
                        lineTo(0f, size.height)
                        close()
                    }
                    drawPath(p, color = paint, style = Stroke(stroke, join = androidx.compose.ui.graphics.StrokeJoin.Round))
                }
            }
        }
        if (touched) {
            // The concept, made visible: the touched card carries its count mark.
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = ShomaraTokens.Space8, y = -ShomaraTokens.Space8)
                    .size(ShomaraTokens.Space24)
                    .background(accent, CircleShape)
                    .clearAndSetSemantics {},
                contentAlignment = Alignment.Center,
            ) {
                Text(text = ShomaraDigits.toFa(countPerCard), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorWhite)
            }
        }
    }
}

/**
 * The reveal: the numeral this step teaches, in the one Featured spot, with a soft
 * scale-in (spring-free, single tween; reduced motion = static appearance). The dotted
 * write-in glyph (GLYPH.1/2) is PENDING_OWNER — until those assets arrive the token
 * typography stands in, and the write-in animation stays a recorded gap.
 */
@Composable
private fun ShomaraDiscoverReveal(count: Int, reducedMotion: Boolean, modifier: Modifier = Modifier) {
    val appear = remember { Animatable(if (reducedMotion) 1f else 0f) }
    LaunchedEffect(count) {
        if (!reducedMotion) appear.animateTo(1f, animationSpec = tween(durationMillis = ShomaraTokens.MotionDurationBase))
        else appear.snapTo(1f)
    }
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Box(
            modifier = Modifier
                .size(ShomaraTokens.ComponentNodeCurrent + ShomaraTokens.Space12)
                .scale(appear.value)
                .drawBehind {
                    val edge = ShomaraTokens.ComponentEdge.toPx()
                    drawCircle(color = ShomaraTokens.ColorAmber, radius = size.minDimension / 2f, center = Offset(center.x, center.y + edge))
                    drawCircle(color = ShomaraTokens.ColorAmberSoft)
                }
                .shadow(ShomaraClay.specFor(Featured).elevation, CircleShape)
                .background(ShomaraTokens.ColorAmberSoft, CircleShape)
                .border(ShomaraTokens.ClayFeaturedBorderWidth, ShomaraTokens.ColorAmber, CircleShape)
                .semantics(mergeDescendants = true) {
                    liveRegion = LiveRegionMode.Polite
                    contentDescription = ShomaraDigits.toFa(count)
                },
            contentAlignment = Alignment.Center,
        ) {
            Text(text = ShomaraDigits.toFa(count), style = ShomaraTypography.BigNum, color = ShomaraTokens.ColorAmberInk)
        }
    }
}
