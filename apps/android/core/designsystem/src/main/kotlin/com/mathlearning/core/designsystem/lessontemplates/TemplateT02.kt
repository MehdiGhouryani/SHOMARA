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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S2 · stage5 §T02 «چوب‌خط‌ساز» — the tally template.
 *
 * Renders [T02TallyLogic]'s groups: vertical strokes at the manipulative floor height
 * (≥ 40dp per stage5), the FIFTH stroke drawn DIAGONALLY over the four (acceptance), a
 * closed five-group in its own soft ring, an optional numeral, and the «برگرد» action that
 * removes exactly the last stroke. It never decides whether the tally is right.
 */
@Composable
fun TemplateT02(
    objectIds: List<String>,
    strokes: List<String>,
    state: LessonTemplateState,
    onObjectTap: (objectId: String) -> Unit,
    onUndo: () -> Unit,
    modifier: Modifier = Modifier,
    showNumeral: Boolean = false,
    trayObjects: List<String> = objectIds,
) {
    // One set for the whole tray: `id in strokes` per object was O(n) for every recomposition.
    val strokeSet = remember(strokes) { strokes.toSet() }
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // Tray: the uncounted objects to tap (one stroke each).
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        ) {
            trayObjects.forEach { id ->
                val counted = id in strokeSet
                ShomaraT02TrayObject(
                    objectId = id,
                    counted = counted,
                    enabled = !counted && state !is LessonTemplateState.Correct,
                    onTap = { onObjectTap(id) },
                )
            }
        }
        // The tally lane: groups of five, the fifth diagonal.
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .semantics(mergeDescendants = true) {
                    contentDescription = "چوب خط‌ها"
                },
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterHorizontally),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ShomaraTallyLane(strokes = strokes)
            if (showNumeral && strokes.isNotEmpty()) {
                Text(
                    text = ShomaraDigits.toFa(strokes.size),
                    style = ShomaraTypography.BigNum,
                    color = ShomaraTokens.ColorPrimary,
                )
            }
        }
        // Undo: the last stroke only (acceptance). Disabled when there is nothing to undo.
        Box(
            modifier = Modifier
                .width(ShomaraTokens.ComponentManipulativeMin)
                .height(ShomaraTokens.Space40)
                .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .border(
                    width = ShomaraTokens.ClaySoftBorderWidth,
                    color = ShomaraTokens.ColorLine,
                    shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                )
                .semantics { role = Role.Button; contentDescription = "برگرد" }
                .clickable(
                    interactionSource = androidx.compose.runtime.remember { MutableInteractionSource() },
                    indication = null,
                    enabled = strokes.isNotEmpty(),
                    role = Role.Button,
                    onClick = onUndo,
                ),
            contentAlignment = Alignment.Center,
        ) {
            Text(text = "برگرد", style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
        }
    }
}

@Composable
private fun ShomaraT02TrayObject(
    objectId: String,
    counted: Boolean,
    enabled: Boolean,
    onTap: () -> Unit,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMin)
            .background(
                if (counted) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurfaceAlt,
                CircleShape,
            )
            .border(
                width = if (counted) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (counted) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                shape = CircleShape,
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = objectId
            }
            .clickable(
                interactionSource = androidx.compose.runtime.remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onTap,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.size(ShomaraTokens.Space24)) {
            val stroke = ShomaraTokens.Space4.toPx()
            drawCircle(
                color = if (counted) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk2,
                radius = size.minDimension / 2f - stroke,
                style = androidx.compose.ui.graphics.drawscope.Stroke(stroke),
            )
        }
    }
}

/**
 * The tally lane: every stroke ≥ 40dp tall; the fifth of each group is a diagonal line from
 * the bottom-start to the top-end over the four verticals; a closed group gets a soft ring.
 */
@Composable
private fun ShomaraTallyLane(strokes: List<String>) {
    // The lane cells are derived ONCE per stroke list, outside the draw scope: the draw lambda
    // runs on every frame and must not re-run the grouping logic.
    val cells = remember(strokes) { T02TallyLogic(strokes).laneCells(strokes) }
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(ShomaraTokens.Space40)
            .padding(vertical = ShomaraTokens.Space4),
    ) {
        if (cells.isEmpty()) return@Canvas
        val strokeColor = ShomaraTokens.ColorInk
        val width = ShomaraTokens.Space4.toPx()
        val gap = ShomaraTokens.Space8.toPx()
        val laneHeight = size.height
        val groupWidth = 5 * (width + gap)
        val groupGap = ShomaraTokens.Space16.toPx()
        // Every stroke in the list is drawn, including the ones past the first five-group.
        cells.forEach { cell ->
            val cellX = cell.groupIndex * (groupWidth + groupGap) + cell.slotInGroup * (width + gap)
            if (!cell.isDiagonal) {
                drawLine(
                    color = strokeColor,
                    start = Offset(cellX, laneHeight),
                    end = Offset(cellX, 0f),
                    strokeWidth = width,
                )
            } else {
                // The diagonal fifth: bottom of the group's first cell to the top of this one.
                drawLine(
                    color = strokeColor,
                    start = Offset(cellX - 4 * (width + gap), laneHeight),
                    end = Offset(cellX + width, 0f),
                    strokeWidth = width,
                )
            }
        }
    }
}
