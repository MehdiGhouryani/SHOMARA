package com.mathlearning.core.designsystem.lessontemplates

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S2 · stage5 §T03 «انگشت‌های دیجیتال» — the finger template.
 *
 * Two REAL hands (left/right, never mirrored), five fingers each, each finger a ≥56dp touch
 * target (stage5 rule). The composable renders [T03Hands]: open fingers filled, closed
 * fingers outlined; the total is shown as the big number (and is the only thing evaluated).
 * 4+3 and 5+2 for a target of 7 are BOTH valid because the logic only compares the total.
 */
@Composable
fun TemplateT03(
    hands: T03Hands,
    state: LessonTemplateState,
    onFingerTap: (hand: T03Hand, fingerIndex: Int) -> Unit,
    onTransfer: (from: T03Hand, to: T03Hand) -> Unit,
    modifier: Modifier = Modifier,
    showTotal: Boolean = true,
    hintLevel: Int = 0,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space24, Alignment.CenterHorizontally),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // RIGHT hand on the start side of the RTL layout? No: the stage5 rule is REAL
            // left/right, so the LEFT hand renders on the reading-start side only in RTL.
            // The template keeps the anatomically correct order (left hand, then right hand)
            // and lets the RTL layout mirror only the READING order of surrounding chrome.
            ShomaraT03Hand(
                hand = T03Hand.Left,
                fingers = hands.left,
                enabled = state !is LessonTemplateState.Correct,
                hintCount = if (hintLevel >= 1 && hintLevel <= 3) hands.openLeft() else 0,
                onFingerTap = { index -> onFingerTap(T03Hand.Left, index) },
            )
            ShomaraT03Hand(
                hand = T03Hand.Right,
                fingers = hands.right,
                enabled = state !is LessonTemplateState.Correct,
                hintCount = if (hintLevel >= 1 && hintLevel <= 3) hands.openRight() else 0,
                onFingerTap = { index -> onFingerTap(T03Hand.Right, index) },
            )
        }
        // Transfer control: move one open finger across hands (total invariant).
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        ) {
            ShomaraT03TransferChip(
                label = "چپ ← راست",
                enabled = hands.openLeft() > 0 && hands.openRight() < T03Hands.FINGERS_PER_HAND,
                onClick = { onTransfer(T03Hand.Left, T03Hand.Right) },
            )
            ShomaraT03TransferChip(
                label = "راست ← چپ",
                enabled = hands.openRight() > 0 && hands.openLeft() < T03Hands.FINGERS_PER_HAND,
                onClick = { onTransfer(T03Hand.Right, T03Hand.Left) },
            )
        }
        if (showTotal) {
            Text(
                text = ShomaraDigits.toFa(hands.total()),
                style = ShomaraTypography.BigNum,
                color = ShomaraTokens.ColorPrimary,
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics(mergeDescendants = true) { contentDescription = "عدد " + ShomaraDigits.toFa(hands.total()) },
            )
        }
    }
}

@Composable
private fun ShomaraT03Hand(
    hand: T03Hand,
    fingers: List<Boolean>,
    enabled: Boolean,
    hintCount: Int,
    onFingerTap: (Int) -> Unit,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        Text(
            text = if (hand == T03Hand.Left) "دست چپ" else "دست راست",
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorInk2,
            modifier = Modifier.semantics { contentDescription = if (hand == T03Hand.Left) "دست چپ" else "دست راست" },
        )
        Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
            fingers.forEachIndexed { index, open ->
                val interactionSource = androidx.compose.runtime.remember { MutableInteractionSource() }
                Box(
                    modifier = Modifier
                        .size(ShomaraTokens.ComponentManipulativeMin / 2 + ShomaraTokens.Space8)
                        .background(
                            if (open) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface,
                            RoundedCornerShape(ShomaraTokens.Space8),
                        )
                        .border(
                            width = if (open) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                            color = if (open) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                            shape = RoundedCornerShape(ShomaraTokens.Space8),
                        )
                        .semantics(mergeDescendants = true) {
                            role = Role.Button
                            contentDescription = "انگشت " + ShomaraDigits.toFa(index + 1)
                            stateDescription = if (open) "باز" else "بسته"
                        }
                        .clickable(
                            interactionSource = interactionSource,
                            indication = null,
                            enabled = enabled,
                            role = Role.Button,
                            onClick = { onFingerTap(index) },
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Canvas(modifier = Modifier.size(ShomaraTokens.Space16)) {
                        drawCircle(
                            color = if (open) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk2,
                            radius = size.minDimension / 2f - ShomaraTokens.Space4.toPx(),
                            style = Stroke(ShomaraTokens.Space4.toPx()),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ShomaraT03TransferChip(label: String, enabled: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .background(
                if (enabled) ShomaraTokens.ColorSurfaceAlt else ShomaraTokens.ColorSurface,
                RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .border(
                width = ShomaraTokens.ClaySoftBorderWidth,
                color = if (enabled) ShomaraTokens.ColorLine2 else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics { role = Role.Button; contentDescription = label }
            .clickable(
                interactionSource = androidx.compose.runtime.remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onClick,
            ),
    ) {
        Text(
            text = label,
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorInk2,
            modifier = Modifier.padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8),
        )
    }
}
