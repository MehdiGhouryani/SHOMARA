package com.mathlearning.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraCardLogic
import com.mathlearning.core.designsystem.ShomaraCardState
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.rememberShomaraTapGuard
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraGradeCatalog
import com.mathlearning.core.model.ShomaraGradeOption

/**
 * The grade grid: 2 columns x 3 rows, RTL order (G1/G2, G3/G4, G5/G6).
 *
 * The grid is the second section of the step, so it is exposed as a heading with the canonical
 * section title. The declared TalkBack traversal contract (OnboardingA11y) lists that heading,
 * and the rendered screen had no such heading before this.
 */
@Composable
internal fun ShomaraProfileGradeGrid(
    draft: ShomaraProfileDraft,
    onDraftChange: (ShomaraProfileDraft) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics {
                contentDescription = ShomaraProfileStrings.GradeSectionTitle
                heading()
            },
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        // The first child of each Row is on the right in RTL, so chunking
        // G1..G6 in pairs gives the sample's order.
        for (pair in ShomaraGradeCatalog.Options.chunked(2)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            ) {
                for (grade in pair) {
                    ShomaraProfileGradeCard(
                        grade = grade,
                        selected = draft.gradeId == grade.id,
                        onSelect = { onDraftChange(draft.copy(gradeId = grade.id)) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

/**
 * One grade card: title only, centred. The selected card carries the pale
 * green background and the green border (owner: no check mark). Selection
 * is never colour alone for TalkBack: the card announces it through the
 * card's own label («انتخاب‌شده») + selected=true, the same pattern as
 * [ShomaraChoiceTile].
 *
 * This is a page-local card, not [ShomaraCard]: the shared card renders a
 * white background in its Selected state, and the sample's selected card is
 * pale green. Everything else (depth, border widths, radii, tap guard,
 * state label) is the shared component's.
 */
@Composable
private fun ShomaraProfileGradeCard(
    grade: ShomaraGradeOption,
    selected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tapGuard = rememberShomaraTapGuard()
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val depth = if (pressed) ShomaraClayDepth.Hint else ShomaraClayDepth.Soft
    Box(
        modifier = modifier
            // Owner: the grade cards run ~22% smaller than the shared row
            // height so the whole grid + CTA fit without scrolling (>=48dp
            // touch target preserved).
            .defaultMinSize(minHeight = ShomaraTokens.ComponentGradeCardH)
            .shadow(ShomaraClay.specFor(depth).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(
                if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface,
                RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .border(
                width = if (selected) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .semantics(mergeDescendants = true) {
                role = Role.RadioButton
                if (selected) {
                    stateDescription = ShomaraCardLogic.stateLabelFor(ShomaraCardState.Selected)
                    this.selected = true
                }
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.RadioButton,
            ) {
                if (tapGuard.beginLatched()) {
                    try {
                        onSelect()
                    } finally {
                        tapGuard.end()
                    }
                }
            }
            .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8),
        contentAlignment = Alignment.Center,
    ) {
        // Owner: the cards show the short grade name («پایه اول») — the
        // shared «ابتدایی» suffix is dropped on THIS card only, so all six
        // cards read uniform; the catalog title stays canonical elsewhere.
        Text(
            text = grade.title.removeSuffix("ابتدایی").trim(),
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
            maxLines = 2,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
