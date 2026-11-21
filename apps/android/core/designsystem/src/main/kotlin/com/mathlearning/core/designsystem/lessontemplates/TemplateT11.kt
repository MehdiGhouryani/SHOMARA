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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3b · stage5 §T11 «صحنهٔ مسئله» — the story template.
 *
 * The narration is always available as AUDIO (the child may listen again without any penalty,
 * stage5) and as short text from ST19. The scene shows the objects; the answer is a sentence
 * the child completes, and an insufficient story offers «نمی‌شود حل کرد» instead of a number.
 * The template never computes: [T11Story] holds the steps and the acceptance.
 */
@Composable
fun TemplateT11(
    story: T11Story,
    state: LessonTemplateState,
    storyText: String,
    onNarrate: () -> Unit,
    onAnswerTap: (answer: Int) -> Unit,
    onCannotSolve: () -> Unit,
    modifier: Modifier = Modifier,
    answerOptions: List<Int> = emptyList(),
    selectedAnswer: Int? = null,
    sceneObjects: List<String> = emptyList(),
    showAnswerSentence: Boolean = false,
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // Narration: always replayable, never scored.
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .height(ShomaraTokens.Space40)
                    .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
                    .border(
                        width = ShomaraTokens.ClaySoftBorderWidth,
                        color = ShomaraTokens.ColorLine,
                        shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                    )
                    .semantics { role = Role.Button; contentDescription = "دوباره بشنو" }
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        role = Role.Button,
                        onClick = onNarrate,
                    )
                    .padding(horizontal = ShomaraTokens.Space16),
                contentAlignment = Alignment.Center,
            ) {
                Text(text = "دوباره بشنو", style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
            }
        }
        Text(
            text = storyText,
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk,
            modifier = Modifier
                .fillMaxWidth()
                .semantics(mergeDescendants = true) {
                    liveRegion = LiveRegionMode.Polite
                    contentDescription = storyText
                },
        )
        if (sceneObjects.isNotEmpty()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8, Alignment.CenterHorizontally),
            ) {
                sceneObjects.take(10).forEach { id ->
                    // The scene object is a SQUARE token-size chip: height alone left it with
                    // zero width, i.e. invisible (a real layout bug fixed here).
                    Box(
                        modifier = Modifier
                            .size(ShomaraTokens.Space40)
                            .background(ShomaraTokens.ColorPrimarySoft, RoundedCornerShape(ShomaraTokens.Space8))
                            .semantics(mergeDescendants = true) { contentDescription = id },
                    )
                }
            }
        }
        if (showAnswerSentence) {
            Text(
                text = "پاسخ: " + (selectedAnswer?.let { ShomaraDigits.toFa(it) } ?: "…"),
                style = ShomaraTypography.BigNum,
                color = ShomaraTokens.ColorPrimary,
            )
        }
        // The choices: numeric cards for a solvable story, the single «cannot be solved» card
        // for an insufficient one (the story decides which set is legal).
        if (story.insufficient) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(ShomaraTokens.ComponentManipulativeMin)
                    .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
                    .border(
                        width = ShomaraTokens.ClaySoftBorderWidth,
                        color = ShomaraTokens.ColorLine,
                        shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                    )
                    .semantics { role = Role.Button; contentDescription = "نمی‌شود حل کرد" }
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        enabled = state !is LessonTemplateState.Correct,
                        role = Role.Button,
                        onClick = onCannotSolve,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(text = "نمی‌شود حل کرد", style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
            }
        } else {
            // The answer cards are the shared tile in its text form: the number is shown in
            // Persian digits, and a selected card is one border-weight step stronger.
            LessonTemplateTray(modifier = Modifier.fillMaxWidth(), spacing = ShomaraTokens.Space16) {
                answerOptions.forEach { option ->
                    LessonTemplateTile(
                        label = ShomaraDigits.toFa(option),
                        onClick = { onAnswerTap(option) },
                        selected = option == selectedAnswer,
                        enabled = state !is LessonTemplateState.Correct,
                        selectedStateText = "انتخاب شد",
                        idleStateText = "انتخاب نشده",
                    )
                }
            }
        }
    }
}
