package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraCardState
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraChoiceTile
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraGradeCatalog
import com.mathlearning.core.model.ShomaraGradeOption

/** Seed copy for the Step-2 profile surface additions (canonical-source overrides arrive with CMS). */
private object ShomaraProfileUiStrings {
    const val Subtitle: String = "چند چیز کوچک از کودک بگو تا مسیر یادگیری‌اش را بسازیم."
    const val AvatarSectionTitle: String = "انتخاب نشان کودک"
    const val LockedBadge: String = "به‌زودی"
}

@Composable
fun ShomaraProfileScreen(
    draft: ShomaraProfileDraft,
    onDraftChange: (ShomaraProfileDraft) -> Unit,
    saveState: ShomaraProfileSaveState,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Tapping a LOCKED grade explains warmly and never mutates draft.gradeId — the draft's
    // constructor rejects unavailable grades by construction (ProfileContract), so the UI must
    // not even attempt it. The message renders in a warm Recovery banner, not a punishment.
    var lockedGradeMessage by remember { mutableStateOf<String?>(null) }
    val (availableGrades, lockedGrades) = ShomaraGradeCatalog.Options.partition { it.available }
    // Duolingo-inspired skeleton (principles ONLY, per design/INSPIRATION_GUARDRAILS): the long
    // form breathes and scrolls; the single primary CTA and its warm error banner stay anchored
    // at the bottom, always visible without scrolling.
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // Family 04 (Stage 1): the guide is the smallest slot (72dp) so it
            // never overwhelms the form. It is a guide, not an avatar option:
            // avatar options stay the abstract preset catalog (default sun).
            ShomaraCharacterImage(
                character = ShomaraCharacter.Main,
                poseId = 1,
                slot = ShomaraCharacterSlot.Inline,
                decorative = true,
            )
            Text(
                text = ShomaraProfileStrings.PlacementTitle,
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = ShomaraProfileUiStrings.Subtitle,
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
                textAlign = TextAlign.Center,
            )
            // Child name section: the field owns its persistent label; the card frames the section.
            ShomaraCard {
                ShomaraTextField(
                    value = draft.name,
                    onValueChange = { onDraftChange(draft.copy(name = it)) },
                    label = ShomaraProfileStrings.NameLabel,
                    hint = ShomaraProfileStrings.NameHint,
                    errorText = ShomaraProfileDraft.nameValidationError(draft.name),
                )
            }
            // Avatar presets from the canonical catalog as full-width selectable
            // rows (Duolingo list evidence, ADR-0040): one option per row, label
            // plus a visible ✓ mark when selected (via ShomaraChoiceTile) — the
            // selection is never colour alone, and TalkBack reads "انتخاب‌شده".
            // Selection is draft-only until save.
            Text(
                text = ShomaraProfileUiStrings.AvatarSectionTitle,
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier.fillMaxWidth().semantics { heading() },
            )
            ShomaraAvatarCatalog.Options.forEach { option ->
                ShomaraChoiceTile(
                    label = option.label,
                    selectedId = draft.avatarId,
                    id = option.id,
                    onSelected = { onDraftChange(draft.withAvatar(it)) },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            // Grade section: the available grade is highlighted and read-only; locked grades are
            // explained warmly on tap (AGENTS rule 9) and are never selectable.
            Text(
                text = ShomaraProfileStrings.GradeLabel,
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier.fillMaxWidth().semantics { heading() },
            )
            availableGrades.forEach { grade ->
                ShomaraCard(state = ShomaraCardState.Selected) {
                    Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
                        Text(text = grade.title, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
                        Text(text = grade.subtitle, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
                    }
                }
            }
            lockedGrades.forEach { grade ->
                ShomaraCard(
                    state = ShomaraCardState.Default,
                    onClick = { lockedGradeMessage = ShomaraGradeCatalog.lockedReason(grade.id) },
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
                        Text(text = grade.title, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
                        Text(text = ShomaraProfileUiStrings.LockedBadge, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
                    }
                }
            }
            lockedGradeMessage?.let { message ->
                ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = message)
            }
        }
        // Bottom zone: the save CTA and its error banner never scroll away.
        if (saveState.failureMessage != null) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry, text = saveState.failureMessage)
        }
        ShomaraButton(
            text = ShomaraProfileStrings.Save,
            onClick = onSave,
            enabled = saveState.canSubmit,
            loading = saveState.inFlight,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
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
            .fillMaxSize()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // Family 05 (Stage 1): no character here by contract.
            // Batch 2: the placement title is a TalkBack heading.
            Text(text = ShomaraProfileStrings.PlacementTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            ShomaraCard {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    // F-29: the placement status is plain text, not a Recovery banner inside a
                    // card — a banner implies an action or a problem, and placement has neither
                    // yet. The server decision (when it exists) is the main line; the pending
                    // note is a caption.
                    when {
                        state.serverDecision != null -> Text(text = state.serverDecision, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, textAlign = TextAlign.Center)
                        state.isSkipped -> Text(text = ShomaraProfileStrings.GradeOne, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, textAlign = TextAlign.Center)
                        else -> Text(text = ShomaraProfileStrings.PlacementPending, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted, textAlign = TextAlign.Center)
                    }
                }
            }
        }
        ShomaraButton(
            text = ShomaraProfileStrings.PlacementSkip,
            onClick = onSkip,
            variant = ShomaraButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
