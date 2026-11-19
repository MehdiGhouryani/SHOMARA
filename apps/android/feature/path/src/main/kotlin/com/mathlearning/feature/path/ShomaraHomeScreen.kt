package com.mathlearning.feature.path

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.model.ShomaraStationCatalog

/**
 * Stateless Home route: one shell heading, one learning path and one action per projected state.
 * Navigation, station sheets, retries and identity/progress loading remain with the caller.
 */
@Composable
fun ShomaraHomeScreen(
    state: ShomaraHomeUiState,
    onAction: (ShomaraHomeAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorHomeCanvas),
    ) {
        ShomaraHomeHeader(
            title = ShomaraHomeStrings.Title,
            subtitle = ShomaraHomeStrings.Subtitle,
            onSettings = { onAction(ShomaraHomeAction.OpenSettings) },
            settingsContentDescription = ShomaraHomeStrings.Settings,
            modifier = Modifier.padding(
                horizontal = ShomaraTokens.Space24,
                vertical = ShomaraTokens.Space12,
            ),
            characterSlot = {
                ShomaraCharacterImage(
                    character = ShomaraCharacter.Main,
                    poseId = 1,
                    slot = ShomaraCharacterSlot.Inline,
                    decorative = true,
                )
            },
        )
        // The offline fact reaches this renderer through two channels: the resolved progress
        // snapshot (`progress.offline`) and the caller's entry state (`entryState = Offline`).
        // Keying the banner on the snapshot alone silently dropped the second one, so a caller that
        // only knew "the network is down" left the child looking at a normal path. Either signal is
        // now enough — the message is the same canonical line either way.
        val offline = state.progress.isResolved &&
            (state.progress.offline || state.entryState == ShomaraEntryState.Offline)
        if (offline) {
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = ShomaraHomeStrings.Offline,
                modifier = Modifier.padding(
                    horizontal = ShomaraTokens.Space24,
                    vertical = ShomaraTokens.Space8,
                ),
            )
        }
        // DT-40 (handoff C04 + C05): when the caller holds a resolved snapshot, Home shows the
        // chapter the child is really in and the station they really continue from, before the path.
        // An unresolved snapshot renders neither: an unresolved Home has no chapter and no current
        // station, and inventing either is not allowed (O5 / ADR-0039).
        // DT-76 (handoff C05 fresh state): a RESOLVED fresh learner has no current station yet, but
        // the domain names the first ready station (freshStationId) — the featured card shows THAT
        // station with the fresh eyebrow, so the first-ever action is a card CTA, not a node hunt.
        val currentStationId = state.progress.currentStationId
        val featuredStationId = currentStationId
            ?: ShomaraPathGraphLogic.freshStationId(state.progress)
        val isResume = currentStationId != null
        val hasPathCards = state.progress.isResolved && featuredStationId != null
        ShomaraPathScreen(
            progress = state.progress,
            entryState = state.entryState,
            savedChapter = state.savedChapter,
            onRetry = if (state.retryAvailable) {
                { onAction(ShomaraHomeAction.Retry) }
            } else {
                null
            },
            onStationTap = { onAction(ShomaraHomeAction.OpenStation(it)) },
            canvasColor = ShomaraTokens.ColorHomeCanvas,
            showPathHeading = false,
            // The Continue card is Home's single primary action (handoff C05) - but only when it is
            // actually rendered. With an unresolved snapshot there is no current station, so the
            // Current node keeps the claim and Home still has exactly one primary action.
            currentNodeClaimsPrimaryCta = !hasPathCards,
            // DT-78 (a11y contract): the orientation strip stays visible whenever progress is
            // resolved — pinned above the list, it carries facts the cards do NOT duplicate: the
            // next-step pointer and the remaining-station count across the whole path. Hiding it
            // for card states broke both the pinned-strip test and the fresh-state readability
            // sweep at 200% font.
            showOrientationStrip = state.progress.isResolved,
            header = if (hasPathCards) {
                {
                    Column(
                        modifier = Modifier.padding(
                            horizontal = ShomaraTokens.Space24,
                            vertical = ShomaraTokens.Space8,
                        ),
                        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    ) {
                        ShomaraChapterProgressCard(
                            chapter = ShomaraStationCatalog.station(featuredStationId!!).chapter,
                            progress = state.progress,
                        )
                        ShomaraContinueStationCard(
                            stationId = featuredStationId,
                            onContinue = { onAction(ShomaraHomeAction.OpenStation(featuredStationId)) },
                            isResume = isResume,
                        )
                    }
                }
            } else {
                null
            },
            modifier = Modifier.weight(1f),
        )
    }
}
