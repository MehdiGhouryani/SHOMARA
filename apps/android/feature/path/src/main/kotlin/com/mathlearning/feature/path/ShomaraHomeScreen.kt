package com.mathlearning.feature.path

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens

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
                horizontal = ShomaraTokens.Space20,
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
        if (state.progress.offline && state.progress.isResolved) {
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = ShomaraHomeStrings.Offline,
                modifier = Modifier.padding(
                    horizontal = ShomaraTokens.Space20,
                    vertical = ShomaraTokens.Space8,
                ),
            )
        }
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
            modifier = Modifier.weight(1f),
        )
    }
}
