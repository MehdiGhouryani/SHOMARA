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
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.ui.unit.Dp
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3a · stage5 §T07 «قرینه‌ساز» — the symmetry template with the `fold` verification moment.
 *
 * The grid renders the given cells and the child's coloured cells. The symmetry axis is drawn
 * as an OVERLAY at the true centre of the grid — never as an extra row/column element, which
 * would shift one half and quietly break the very symmetry the child is asked to complete
 * (the bug this replaced). «تا زدن» plays the fold: the trailing half rotates onto the axis
 * (400ms); under reduced motion the same halves cross-fade. Both modes show the same check.
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
        if (ms > 0) foldProgress.animateTo(1f, tween(ms)) else foldProgress.snapTo(1f)
        kotlinx.coroutines.delay(ShomaraFoldLogic.holdMs(reducedMotion).toLong())
        foldProgress.snapTo(0f)
        folding = false
    }
    val cell = LessonTemplateSizing.cellDp(logic.width)
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .semantics(mergeDescendants = true) { contentDescription = "جدول قرینه، " + logic.axis.label() },
            contentAlignment = Alignment.Center,
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
                repeat(logic.height) { row ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        repeat(logic.width) { col ->
                            val here = row to col
                            val isGiven = here in given
                            val isColored = here in colored
                            Box(
                                modifier = Modifier
                                    .size(cell)
                                    .graphicsLayer {
                                        if (mode == T07FoldMode.Fold) {
                                            // The trailing half folds toward the axis: the origin
                                            // is its inner edge, not the cell centre.
                                            if (isTrailing(col, logic.width)) {
                                                transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0f, 0.5f)
                                                rotationY = -90f * foldProgress.value
                                            }
                                        } else {
                                            // Reduced motion: the halves cross-fade, no travel.
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
            // The explicit axis: an overlay at the exact centre, so both halves stay equal.
            if (logic.axis != T07Axis.Both) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics { contentDescription = "خط تقارن" },
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = (if (logic.axis == T07Axis.Vertical) {
                            Modifier.width(ShomaraTokens.ClayAnswerTileBorderWidth).height(cell * logic.height)
                        } else {
                            Modifier.height(ShomaraTokens.ClayAnswerTileBorderWidth)
                                .width(cell * logic.width)
                        }).background(ShomaraTokens.ColorAmber),
                    )
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

/** The trailing half in reading order: the half that folds onto the axis. */
private fun isTrailing(index: Int, size: Int): Boolean = index >= size / 2

private fun T07Axis.label(): String = when (this) {
    T07Axis.Vertical -> "محور عمودی"
    T07Axis.Horizontal -> "محور افقی"
    T07Axis.Both -> "هر دو محور"
}
