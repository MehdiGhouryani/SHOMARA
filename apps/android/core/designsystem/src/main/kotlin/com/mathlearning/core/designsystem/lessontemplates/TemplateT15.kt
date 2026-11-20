package com.mathlearning.core.designsystem.lessontemplates

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraPressScale

/**
 * S2 · stage5 §T15 «انتخاب پاسخ» — the answer-card template.
 *
 * The parent passes the ALREADY-PLACED options ([T15Placement] from [T15PlacementLogic.place]):
 * this composable never shuffles, never judges, never knows which is correct — it only knows
 * the id to report on tap. That keeps the answer key out of the render layer (CONTENT-008).
 *
 * h1 support: [eliminatedIndex] renders that wrong card faded + disabled (stage5 «حذف یک
 * گزینهٔ غلط»); the parent supplies it from the hint ladder.
 */
@Composable
fun TemplateT15(
    options: List<T15OptionRender>,
    state: LessonTemplateState,
    onOptionTap: (optionId: String) -> Unit,
    modifier: Modifier = Modifier,
    selectedOptionId: String? = null,
    eliminatedIndex: Int? = null,
    showFeedback: Boolean = true,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        options.forEachIndexed { index, option ->
            ShomaraT15Card(
                option = option,
                selected = option.optionId == selectedOptionId,
                eliminated = index == eliminatedIndex,
                // In an assessment (quiet) state the cards never change shape per feedback.
                feedback = if (showFeedback) state else LessonTemplateState.Active,
                enabled = index != eliminatedIndex && state !is LessonTemplateState.Correct,
                reducedMotion = reducedMotion,
                onTap = { onOptionTap(option.optionId) },
            )
        }
    }
}

/** What the render layer needs: an id, its display, and nothing about correctness. */
data class T15OptionRender(
    val optionId: String,
    /** Display text for numeral cards, or a picture/dots key the parent resolves. */
    val display: String,
)

@Composable
private fun ShomaraT15Card(
    option: T15OptionRender,
    selected: Boolean,
    eliminated: Boolean,
    feedback: LessonTemplateState,
    enabled: Boolean,
    reducedMotion: Boolean,
    onTap: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val okFlash = feedback is LessonTemplateState.Correct
    val retryFlash = feedback is LessonTemplateState.Retry
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMax + ShomaraTokens.Space8)
            .shomaraPressScale(pressed = pressed, reducedMotion = reducedMotion)
            .background(
                when {
                    eliminated -> ShomaraTokens.ColorSurface
                    selected -> ShomaraTokens.ColorPrimarySoft
                    okFlash && selected -> ShomaraTokens.ColorPrimarySoft
                    retryFlash && selected -> ShomaraTokens.ColorAmberSoft
                    else -> ShomaraTokens.ColorSurface
                },
                RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .border(
                width = if (selected || okFlash) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = when {
                    eliminated -> ShomaraTokens.ColorLine
                    selected -> ShomaraTokens.ColorPrimary
                    okFlash && selected -> ShomaraTokens.ColorPrimary
                    retryFlash && selected -> ShomaraTokens.ColorAmber
                    else -> ShomaraTokens.ColorLine
                },
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = option.display
                stateDescription = when {
                    eliminated -> "حذف شد"
                    selected -> "انتخاب شد"
                    else -> "انتخاب نشده"
                }
                if (selected && okFlash) liveRegion = LiveRegionMode.Polite
            }
            .then(
                if (enabled) {
                    Modifier.clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        role = Role.Button,
                        onClick = onTap,
                    )
                } else Modifier,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = option.display,
            style = ShomaraTypography.BigNum,
            color = when {
                eliminated -> ShomaraTokens.ColorMuted
                selected -> ShomaraTokens.ColorPrimary
                else -> ShomaraTokens.ColorInk
            },
        )
    }
}
