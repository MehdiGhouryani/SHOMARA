package com.mathlearning.core.designsystem.lessontemplates

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3a · stage5 §T04 «چینه‌ساز» — the rod template.
 *
 * Renders rods HORIZONTALLY in one snapped row: each rod is a coloured block whose width is
 * `units × unitDp`, with the unit DERIVED from the measured lane width (≥32dp rule) rather
 * than hardcoded. The target guide (h1) is a thin line at the target length. The template
 * never judges: it renders [placed] and reports taps.
 */
@Composable
fun TemplateT04(
    trayRods: List<T04Rod>,
    placed: List<T04Rod>,
    state: LessonTemplateState,
    onRodTap: (rodId: String) -> Unit,
    onPlacedTap: (rodId: String) -> Unit,
    modifier: Modifier = Modifier,
    target: Int? = null,
    goal: T04Goal = T04Goal.Build,
    showNumbers: Boolean = false,
) {
    var laneWidthPx by remember { mutableIntStateOf(0) }
    val density = LocalDensity.current
    val laneWidthDp = with(density) { laneWidthPx.toDp().value }.toInt()
    val unitDp = if (laneWidthDp > 0) T04RodLogic.unitDp(laneWidthDp) else T04RodLogic.MIN_UNIT_DP
    val total = T04RodLogic.totalUnits(placed)
    // h1: the target guide line appears only from hint level 1.
    val showGuide = target != null && (state as? LessonTemplateState.Hint)?.level != null

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // The lane: a fixed-height row where rods snap edge to edge.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(ShomaraTokens.Space40 + ShomaraTokens.Space16)
                .onSizeChanged { laneWidthPx = it.width }
                .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .border(
                    width = ShomaraTokens.ClaySoftBorderWidth,
                    color = ShomaraTokens.ColorLine,
                    shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                )
                .semantics(mergeDescendants = true) {
                    contentDescription = "ردیف چینه‌ها"
                },
        ) {
            Row(
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .padding(horizontal = ShomaraTokens.Space8),
                horizontalArrangement = Arrangement.spacedBy(0.dp),
            ) {
                placed.forEachIndexed { index, rod ->
                    Box(
                        modifier = Modifier
                            .width((unitDp * rod.units).dp)
                            .height(ShomaraTokens.Space40)
                            .padding(end = if (index == placed.lastIndex) 0.dp else ShomaraTokens.Space4)
                            .background(ShomaraTokens.ColorPrimarySoft, RoundedCornerShape(ShomaraTokens.Space8))
                            .border(
                                width = ShomaraTokens.ClayAnswerTileBorderWidth,
                                color = ShomaraTokens.ColorPrimary,
                                shape = RoundedCornerShape(ShomaraTokens.Space8),
                            )
                            .semantics(mergeDescendants = true) {
                                role = Role.Button
                                contentDescription = "چینهٔ " + ShomaraDigits.toFa(rod.units)
                            }
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null,
                                enabled = state !is LessonTemplateState.Correct,
                                role = Role.Button,
                                onClick = { onPlacedTap(rod.rodId) },
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (showNumbers) {
                            Text(
                                text = ShomaraDigits.toFa(rod.units),
                                style = ShomaraTypography.Caption,
                                color = ShomaraTokens.ColorPrimary,
                            )
                        }
                    }
                }
            }
            // The h1 guide: where the target length ends.
            if (showGuide) {
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .padding(end = ShomaraTokens.Space8)
                        .width(ShomaraTokens.ClayAnswerTileBorderWidth)
                        .height(ShomaraTokens.Space40 + ShomaraTokens.Space8)
                        .background(ShomaraTokens.ColorAmber),
                )
            }
        }
        if (showNumbers && placed.isNotEmpty()) {
            Text(
                text = ShomaraDigits.toFa(total),
                style = ShomaraTypography.BigNum,
                color = ShomaraTokens.ColorPrimary,
                modifier = Modifier.semantics(mergeDescendants = true) {
                    contentDescription = "طول ساخته‌شده " + ShomaraDigits.toFa(total)
                },
            )
        }
        // The tray: available rods, one tap each.
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8, Alignment.CenterHorizontally),
        ) {
            trayRods.forEach { rod ->
                val used = placed.any { it.rodId == rod.rodId }
                Box(
                    modifier = Modifier
                        .width((unitDp * rod.units).dp)
                        .height(ShomaraTokens.Space32)
                        .background(
                            if (used) ShomaraTokens.ColorSurface else ShomaraTokens.ColorSurfaceAlt,
                            RoundedCornerShape(ShomaraTokens.Space8),
                        )
                        .border(
                            width = ShomaraTokens.ClaySoftBorderWidth,
                            color = if (used) ShomaraTokens.ColorLine else ShomaraTokens.ColorLine2,
                            shape = RoundedCornerShape(ShomaraTokens.Space8),
                        )
                        .semantics(mergeDescendants = true) {
                            role = Role.Button
                            contentDescription = "چینهٔ " + ShomaraDigits.toFa(rod.units)
                        }
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            enabled = !used && state !is LessonTemplateState.Correct,
                            role = Role.Button,
                            onClick = { onRodTap(rod.rodId) },
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = ShomaraDigits.toFa(rod.units),
                        style = ShomaraTypography.Caption,
                        color = if (used) ShomaraTokens.ColorMuted else ShomaraTokens.ColorInk,
                    )
                }
            }
        }
    }
}

enum class T04Goal { Build, Compare, Sum, Diff }
