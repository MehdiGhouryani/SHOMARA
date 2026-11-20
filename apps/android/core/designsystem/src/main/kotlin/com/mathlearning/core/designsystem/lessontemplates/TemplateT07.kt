package com.mathlearning.core.designsystem.lessontemplates

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3a · stage5 §T07 «قرینه‌ساز» — the symmetry template with the `fold` verification moment.
 *
 * The grid renders the given cells and the child's coloured cells, with the symmetry axis
 * drawn EXPLICITLY as a line (the interface must never imply the axis by mirroring itself).
 * «تا زدن» plays the fold: the half rotates onto the axis (400ms); under reduced motion the
 * same comparison CROSS-FADES. Both modes show the same check, only the presentation differs.
 */
@Composable
fun TemplateT07(
    logic: T07SymmetryLogic,
    colored: Set<Pair<Int, Int>>,
    given: Set<Pair<Int, Int>>,
    state: LessonTemplateState,
    onCellTap: (row: Int, col: Int) -> Unit,
    modifier: Modifier = Modifier,
    showFoldAction: Boolean = true,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    var folding by remember { mutableStateOf(false) }
    val foldProgress = remember { Animatable(0f) }
    val mode = ShomaraFoldLogic.mode(reducedMotion)
    LaunchedEffect(folding) {
        if (!folding) return@LaunchedEffect
        foldProgress.snapTo(0f)
        val ms = ShomaraFoldLogic.foldMs(reducedMotion)
        if (ms > 0) {
            foldProgress.animateTo(1f, tween(ms))
        } else {
            foldProgress.snapTo(1f)
        }
        // The verified state is HELD long enough to read in both modes, then released.
        kotlinx.coroutines.delay(ShomaraFoldLogic.holdMs(reducedMotion).toLong())
        foldProgress.snapTo(0f)
        folding = false
    }
    val cellSize = gridCellSize(logic.width)
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .semantics(mergeDescendants = true) {
                    contentDescription = "جدول قرینه، " + logic.axis.label()
                },
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
        ) {
            repeat(logic.height) { row ->
                // Horizontal axis: an explicit divider between the two halves.
                if (logic.axis != T07Axis.Vertical && isAfterAxis(row, logic.height)) {
                    AxisLine(horizontal = true, widthDp = gridWidthDp(logic.width, cellSize))
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4, Alignment.CenterHorizontally),
                ) {
                    repeat(logic.width) { col ->
                        // Vertical axis: an explicit divider between the two halves.
                        if (logic.axis != T07Axis.Horizontal && isAfterAxis(col, logic.width)) {
                            AxisLine(horizontal = false, heightDp = cellSize)
                        }
                        val cell = row to col
                        val isGiven = cell in given
                        val isColored = cell in colored
                        Box(
                            modifier = Modifier
                                .size(cellSize)
                                .graphicsLayer {
                                    if (mode == T07FoldMode.Fold) {
                                        // The trailing half rotates onto the axis.
                                        if (isAfterAxis(col, logic.width)) {
                                            rotationY = -90f * foldProgress.value
                                        }
                                    } else {
                                        // Reduced motion: the same halves cross-fade.
                                        alpha = 1f - 0.35f * foldProgress.value
                                    }
                                }
                                .background(
                                    when {
                                        isColored -> ShomaraTokens.ColorPrimarySoft
                                        isGiven -> ShomaraTokens.ColorAmberSoft
                                        else -> ShomaraTokens.ColorSurface
                                    },
                                    RoundedCornerShape(ShomaraTokens.Space4),
                                )
                                .border(
                                    width = ShomaraTokens.ClaySoftBorderWidth,
                                    color = ShomaraTokens.ColorLine,
                                    shape = RoundedCornerShape(ShomaraTokens.Space4),
                                )
                                .semantics(mergeDescendants = true) {
                                    role = Role.Button
                                    contentDescription = "خانهٔ " + (row + 1) + "، " + (col + 1)
                                }
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = null,
                                    enabled = !isGiven && !folding && state !is LessonTemplateState.Correct,
                                    role = Role.Button,
                                    onClick = { onCellTap(row, col) },
                                ),
                        )
                    }
                }
            }
        }
        if (showFoldAction) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(ShomaraTokens.Space40)
                    .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
                    .border(
                        width = ShomaraTokens.ClaySoftBorderWidth,
                        color = ShomaraTokens.ColorLine,
                        shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                    )
                    .semantics { role = Role.Button; contentDescription = "تا زدن" }
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        enabled = !folding,
                        role = Role.Button,
                        onClick = { folding = true },
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = if (mode == T07FoldMode.CrossFade) "بررسی" else "تا زدن",
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorInk2,
                )
            }
        }
    }
}

/** The explicit symmetry-axis divider — behaviour, not decoration: the axis is never implied. */
@Composable
private fun AxisLine(horizontal: Boolean, widthDp: androidx.compose.ui.unit.Dp = ShomaraTokens.Space24, heightDp: androidx.compose.ui.unit.Dp = ShomaraTokens.Space24) {
    Box(
        modifier = (if (horizontal) Modifier.width(widthDp).height(ShomaraTokens.ClayAnswerTileBorderWidth)
        else Modifier.width(ShomaraTokens.ClayAnswerTileBorderWidth).height(heightDp))
            .background(ShomaraTokens.ColorAmber)
            .semantics { contentDescription = "خط تقارن" },
    )
}

/**
 * The axis sits BETWEEN two cells, so the trailing half starts at the first index whose
 * distance to the start edge exceeds half the grid. Even and odd widths both land on a
 * real boundary (odd widths get the centre cell on the left side of the divider).
 */
private fun isAfterAxis(index: Int, size: Int): Boolean = index == size / 2 && size % 2 == 0

private fun gridCellSize(width: Int): androidx.compose.ui.unit.Dp =
    when {
        width <= 4 -> ShomaraTokens.Space40
        width <= 6 -> ShomaraTokens.Space40
        else -> ShomaraTokens.Space32
    }

private fun gridWidthDp(width: Int, cell: androidx.compose.ui.unit.Dp): androidx.compose.ui.unit.Dp =
    cell * width + ShomaraTokens.Space4 * (width - 1)

private fun T07Axis.label(): String = when (this) {
    T07Axis.Vertical -> "محور عمودی"
    T07Axis.Horizontal -> "محور افقی"
    T07Axis.Both -> "هر دو محور"
}
