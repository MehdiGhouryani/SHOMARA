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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.Dp
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3b · stage5 §T08 «مربع شگفت‌انگیز» — the grid template.
 *
 * Renders the given cells, the child's placements and the symbol tray. A placement that would
 * duplicate a symbol in its row/column/block does not happen at all: the renderer asks the
 * LOGIC ([T08GridLogic.wouldRecord]) before reporting the tap, and the conflicting cells pulse
 * softly — a conflict is information, never an error mark (stage5).
 */
@Composable
fun TemplateT08(
    logic: T08GridLogic,
    board: Map<Pair<Int, Int>, String>,
    given: Map<Pair<Int, Int>, String>,
    symbols: List<String>,
    state: LessonTemplateState,
    onCellTap: (row: Int, col: Int) -> Unit,
    onSymbolTap: (symbol: String) -> Unit,
    conflictCells: Set<Pair<Int, Int>> = emptySet(),
    modifier: Modifier = Modifier,
    selectedSymbol: String? = null,
    highlightCell: Pair<Int, Int>? = null,
) {
    val cell: Dp = gridCell(logic.size)
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
                repeat(logic.size) { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
                        repeat(logic.size) { col ->
                            val here = row to col
                            val value = board[here]
                            val isGiven = here in given.keys
                            val isConflict = here in conflictCells
                            val isHighlighted = highlightCell != null &&
                                (here.first == highlightCell.first || here.second == highlightCell.second)
                            Box(
                                modifier = Modifier
                                    .size(cell)
                                    .background(
                                        when {
                                            isConflict -> ShomaraTokens.ColorAmberSoft
                                            isGiven -> ShomaraTokens.ColorSurfaceAlt
                                            isHighlighted -> ShomaraTokens.ColorPrimarySoft
                                            else -> ShomaraTokens.ColorSurface
                                        },
                                        RoundedCornerShape(ShomaraTokens.Space4),
                                    )
                                    .border(
                                        width = if (isConflict) {
                                            ShomaraTokens.ClayAnswerTileBorderWidth
                                        } else {
                                            ShomaraTokens.ClaySoftBorderWidth
                                        },
                                        color = if (isConflict) ShomaraTokens.ColorAmber else ShomaraTokens.ColorLine,
                                        shape = RoundedCornerShape(ShomaraTokens.Space4),
                                    )
                                    .semantics(mergeDescendants = true) {
                                        role = Role.Button
                                        contentDescription = "خانهٔ " + (row + 1) + "، " + (col + 1) +
                                            (value?.let { "، " + it } ?: "")
                                        stateDescription = if (isGiven) "داده‌شده" else if (value != null) "پر" else "خالی"
                                    }
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null,
                                        enabled = !isGiven && state !is LessonTemplateState.Correct,
                                        role = Role.Button,
                                        onClick = { onCellTap(row, col) },
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (value != null) {
                                    Text(text = value, style = ShomaraTypography.BigNum, color = ShomaraTokens.ColorInk)
                                }
                            }
                        }
                    }
                }
            }
        }
        // The symbol tray: what may be placed (each symbol once per row/column/block).
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        ) {
            symbols.forEach { symbol ->
                val selected = symbol == selectedSymbol
                Box(
                    modifier = Modifier
                        .size(cell)
                        .background(
                            if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurfaceAlt,
                            RoundedCornerShape(ShomaraTokens.Space4),
                        )
                        .border(
                            width = if (selected) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                            color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                            shape = RoundedCornerShape(ShomaraTokens.Space4),
                        )
                        .semantics(mergeDescendants = true) {
                            role = Role.Button
                            contentDescription = "نماد " + symbol
                            stateDescription = if (selected) "انتخاب شد" else "انتخاب نشده"
                        }
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            role = Role.Button,
                            onClick = { onSymbolTap(symbol) },
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(text = symbol, style = ShomaraTypography.BigNum, color = ShomaraTokens.ColorInk)
                }
            }
        }
    }
}

/** Cell size from the canonical spacing scale so a 9×9 still fits a 360dp phone. */
private fun gridCell(size: Int): Dp = when {
    size <= 4 -> ShomaraTokens.Space40
    size <= 6 -> ShomaraTokens.Space32
    else -> ShomaraTokens.Space24
}
