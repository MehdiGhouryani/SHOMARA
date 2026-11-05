package com.mathlearning.feature.lesson

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.PathEffect
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.MacroStage

/**
 * B2 — template skeletons with honest empty data (no judgement, no content).
 *
 * The host renders [ShomaraTemplateSkeletonForStage] instead of the bare «unavailable» banner
 * when a stage has no options to render: the child sees the SHAPE of the task (cards, slots,
 * tray, tracing path) with empty data, plus the existing status line that says the options
 * have not arrived. Nothing here is a real item, hint, sound or asset.
 *
 * Stage → template (study §13, B2): P1 → T01 discover, P2 → T15, P3 → T05 (with the B4
 * round structure), P4 → T15, P5 → T13 (hideNumeral — the numeral itself is never shown,
 * only the tracing path).
 *
 * The «بررسی» check button is disabled while no selection exists — a selection can only come
 * from real options (Phase 1). Once a selection exists, its action enters the evaluator-wait
 * state (the host wires [onCheck] to the existing «منتظر تأیید سرور» banner via the B3
 * machine's CHECK state). Today no selection can exist, so the check stays disabled and
 * [onCheck] cannot fire yet — it is the Phase 1 hook, not a live path. No option is ever
 * marked correct here: `correct` lives only in the evaluator (O1).
 */
@Composable
fun ShomaraTemplateSkeletonForStage(
    macroStage: MacroStage,
    onCheck: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        when (macroStage) {
            MacroStage.P1_DISCOVER -> ShomaraT01DiscoverSkeleton()
            MacroStage.P2_GUIDED -> ShomaraT15Skeleton()
            MacroStage.P3_GAME -> ShomaraT05GameSkeleton()
            MacroStage.P4_ASSESSMENT -> ShomaraT15Skeleton()
            MacroStage.P5_TRANSFER -> ShomaraT13Skeleton()
        }
        // The honest status line (existing text, never a new sentence): the options have
        // not arrived, so the skeleton is the surface — not a dead end, not a fake task.
        Text(
            text = ShomaraLessonOptions.UnavailableMessage,
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk2,
        )
        // B5: the hint slot exists in P2/P3 only, and stays invisible and inactive while no
        // hint content exists. P4/P5 have no hint slot at all (HINT_BANNED).
        if (ShomaraHintLadder.slotAllowed(macroStage)) {
            ShomaraHintSlot(hintText = null)
        }
        ShomaraButton(
            text = "بررسی",
            onClick = onCheck,
            // No selection can exist yet (no real options), so the check stays disabled —
            // an enabled check with nothing chosen would submit an answer never given.
            enabled = false,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

/**
 * B5 hint slot: renders the hint when content exists, otherwise renders nothing — invisible
 * and inactive, never fabricated text. A hint event is recorded only when a real hint shows
 * (see [ShomaraHintLadder.shouldRecordHintEvent]); this slot has no content today.
 */
@Composable
private fun ShomaraHintSlot(hintText: String?) {
    if (hintText != null) {
        ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = hintText)
    }
}

/** One empty skeleton slot: a bordered box with no content, no label, no image. */
@Composable
private fun SkeletonSlot(
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd)),
    )
}

/** T01 discover: three touchable object cards (72dp band) + one empty reveal slot. */
@Composable
private fun ShomaraT01DiscoverSkeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            repeat(3) {
                SkeletonSlot(
                    modifier = Modifier.size(ShomaraTokens.ComponentNodeSize),
                )
            }
        }
        SkeletonSlot(
            modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = ShomaraTokens.ComponentTouchMin),
        )
    }
}

/** T15 (P2 and P4): two-to-three large option cards (72dp minimum), empty, unmarked. */
@Composable
private fun ShomaraT15Skeleton(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        repeat(3) {
            SkeletonSlot(
                modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = ShomaraTokens.ComponentNodeSize),
            )
        }
    }
}

/**
 * T05 game (P3): the pattern row with exactly the first round's blank count, the tray with
 * exactly its tray size, and the round indicator — counts from [ShomaraGameRoundStructure],
 * never round content.
 */
@Composable
private fun ShomaraT05GameSkeleton(modifier: Modifier = Modifier) {
    val round = ShomaraGameRoundStructure.pilotStructure().first()
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Text(
            text = round.roundLabel(),
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk,
        )
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            repeat(round.blankCount) {
                SkeletonSlot(modifier = Modifier.size(ShomaraTokens.ComponentNodeSize))
            }
        }
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            repeat(round.traySize) {
                SkeletonSlot(modifier = Modifier.size(ShomaraTokens.ComponentNodeSize))
            }
        }
    }
}

/**
 * T13 (P5, hideNumeral): dotted reference path + baseline, drawn with Compose primitives —
 * never an image, never a glyph. No start dot, no direction arrow: CONTENT-001 (stroke
 * direction and start point for ۱) is unresolved — stage5 §7 and the pilot §9 disagree —
 * so the skeleton draws the path shape only and claims no direction. The writing area is at
 * least 240dp tall (stage5 §7), expressed from tokens (Space40 × 6), never a raw literal.
 *
 * B8 data side lives in [T13TraceAdapter.recordRawTouch]: raw touch points are recorded
 * without any judgement about correctness — tolerance and direction stay with the evaluator.
 */
@Composable
private fun ShomaraT13Skeleton(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.Space40 * 6)
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd)),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokePx = ShomaraTokens.Space4.toPx()
            val dashPx = ShomaraTokens.Space12.toPx()
            val gapPx = ShomaraTokens.Space8.toPx()
            val centerX = size.width / 2f
            val topY = ShomaraTokens.Space24.toPx()
            val bottomY = size.height - ShomaraTokens.Space24.toPx()
            // Dotted reference path, no direction: CONTENT-001 (stroke direction and start
            // point for ۱) is unresolved, so the skeleton draws the path shape only — no
            // start dot, no direction arrow — and claims no direction.
            drawLine(
                color = ShomaraTokens.ColorLine2,
                start = Offset(centerX, topY),
                end = Offset(centerX, bottomY),
                strokeWidth = strokePx,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(dashPx, gapPx), 0f),
            )
            // Baseline under the path.
            drawLine(
                color = ShomaraTokens.ColorLine2,
                start = Offset(ShomaraTokens.Space16.toPx(), bottomY + ShomaraTokens.Space8.toPx()),
                end = Offset(size.width - ShomaraTokens.Space16.toPx(), bottomY + ShomaraTokens.Space8.toPx()),
                strokeWidth = strokePx,
            )
        }
    }
}
