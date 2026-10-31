package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

@Composable
fun ShomaraProfileScreen(
    draft: ShomaraProfileDraft,
    onDraftChange: (ShomaraProfileDraft) -> Unit,
    saveState: ShomaraProfileSaveState,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Text(text = ShomaraProfileStrings.PlacementTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        ShomaraTextField(
            value = draft.name,
            onValueChange = { onDraftChange(draft.copy(name = it)) },
            label = ShomaraProfileStrings.NameLabel,
            hint = ShomaraProfileStrings.NameHint,
            errorText = ShomaraProfileDraft.nameValidationError(draft.name),
        )
        // Grade is canonical and read-only in V1 (grade 1 curriculum only).
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(text = ShomaraProfileStrings.GradeLabel, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
            Text(text = ShomaraProfileDraft.gradeLabel(draft.gradeId), style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
        }
        if (saveState.failureMessage != null) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry, text = saveState.failureMessage)
        }
        ShomaraButton(
            text = ShomaraProfileStrings.Save,
            onClick = onSave,
            enabled = saveState.canSubmit,
            loading = saveState.inFlight,
            variant = ShomaraButtonVariant.Primary,
        )
    }
}

@Composable
fun ShomaraPlacementScreen(
    state: ShomaraPlacementState,
    onSkip: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text = ShomaraProfileStrings.PlacementTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        when {
            state.serverDecision != null -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = state.serverDecision!!)
            state.isSkipped -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraProfileStrings.GradeOne)
            else -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraProfileStrings.PlacementPending)
        }
        ShomaraButton(
            text = ShomaraProfileStrings.PlacementSkip,
            onClick = onSkip,
            variant = ShomaraButtonVariant.Ghost,
        )
    }
}
