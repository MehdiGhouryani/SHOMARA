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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3a · stage5 §T05 «الگوساز» — the pattern template.
 *
 * Renders the row the LAW prescribes with the requested blanks, plus a tray of elements.
 * The child taps an element in the tray, then a blank; the placement map is reported up and
 * [T05PatternLogic.acceptsContinue] decides acceptance — a blank is checked against the law,
 * not against one memorised answer. In `findUnit` mode the row shows the unit frame and the
 * child selects a window; in `build` mode there is no wrong answer at all.
 */
@Composable
fun TemplateT05(
    logic: T05PatternLogic,
    fillings: Map<Int, String>,
    blankIndexes: List<Int>,
    tray: List<String>,
    state: LessonTemplateState,
    onBlankTap: (index: Int) -> Unit,
    onElementTap: (element: String) -> Unit,
    modifier: Modifier = Modifier,
    selectedElement: String? = null,
    mode: T05Mode = T05Mode.Continue,
    cells: Int = logic.unit.size * logic.repeats,
) {
    val law = logic.lawRow(cells)
    val unitFrame = mode == T05Mode.FindUnit
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // The row: every cell shows its law element; blanks show the child's filling or a hole.
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .semantics(mergeDescendants = true) { contentDescription = "ردیف الگو" },
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8, Alignment.CenterHorizontally),
        ) {
            law.indices.forEach { index ->
                val isBlank = index in blankIndexes
                val filled = fillings[index]
                val inUnitFrame = unitFrame && index % logic.unit.size == 0
                ShomaraT05Cell(
                    element = filled ?: if (isBlank) null else law[index],
                    isBlank = isBlank,
                    inUnitFrame = inUnitFrame,
                    enabled = isBlank && state !is LessonTemplateState.Correct,
                    onTap = { onBlankTap(index) },
                )
            }
        }
        if (unitFrame) {
            Text(
                text = "واحد تکرار را پیدا کن",
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
                modifier = Modifier.semantics { contentDescription = "واحد تکرار را پیدا کن" },
            )
        }
        // The tray: one element type per button (build mode never has a wrong answer).
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        ) {
            tray.forEach { element ->
                ShomaraT05TrayElement(
                    element = element,
                    selected = element == selectedElement,
                    enabled = state !is LessonTemplateState.Correct,
                    onTap = { onElementTap(element) },
                )
            }
        }
    }
}

enum class T05Mode { Continue, FindUnit, Build }

@Composable
private fun ShomaraT05Cell(
    element: String?,
    isBlank: Boolean,
    inUnitFrame: Boolean,
    enabled: Boolean,
    onTap: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMin)
            .background(
                when {
                    element == null -> ShomaraTokens.ColorSurfaceAlt
                    else -> ShomaraTokens.ColorPrimarySoft
                },
                RoundedCornerShape(ShomaraTokens.Space8),
            )
            .border(
                width = if (inUnitFrame) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = when {
                    inUnitFrame -> ShomaraTokens.ColorAmber
                    element == null -> ShomaraTokens.ColorLine2
                    else -> ShomaraTokens.ColorPrimary
                },
                shape = RoundedCornerShape(ShomaraTokens.Space8),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = element ?: "جای خالی"
            }
            .clickable(
                interactionSource = androidx.compose.runtime.remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled && isBlank,
                role = Role.Button,
                onClick = onTap,
            ),
        contentAlignment = Alignment.Center,
    ) {
        if (element != null) {
            Text(text = element, style = ShomaraTypography.BigNum, color = ShomaraTokens.ColorInk)
        } else {
            Text(text = "؟", style = ShomaraTypography.BigNum, color = ShomaraTokens.ColorMuted)
        }
    }
}

@Composable
private fun ShomaraT05TrayElement(
    element: String,
    selected: Boolean,
    enabled: Boolean,
    onTap: () -> Unit,
) {
    // One shared tile primitive: the surface, selected border, button role and the Persian
    // state description used to be re-written here (and in three other templates).
    LessonTemplateTile(
        label = element,
        onClick = onTap,
        selected = selected,
        enabled = enabled,
        size = ShomaraTokens.ComponentManipulativeMin,
    )
}
