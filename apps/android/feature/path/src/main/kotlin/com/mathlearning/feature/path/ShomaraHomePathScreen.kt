package com.mathlearning.feature.path

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraPathConnector
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * HomePathScreen (P14, handoff v3) — the Home/Path screen using the handoff design.
 *
 * This is the structural Home in the Duolingo model: the child sees the path, the current
 * station, and the chapter progress. The visual design is the approved handoff v3 (violet/
 * lavender palette) and is intentionally distinct from the green progress markers used in
 * lesson content.
 *
 * Visual: BLOCKED until the final Home handoff is confirmed — but the data/interaction/state
 * contract is implemented NOW using the handoff v3 spec.
 *
 * This is a DRAFT implementation using the typed ST07 artifact; release keeps the existing
 * path screen until APPROVED content is available.
 */
@Composable
fun ShomaraHomePathScreen(
    state: ShomaraHomePathUiState,
    onStationSelected: (String) -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxSize(),
        color = ShomaraHomeUiTokens.Canvas,
    ) {
        when (state.loadState) {
            ShomaraHomeLoadState.Loading -> HomeLoading()
            ShomaraHomeLoadState.Ready -> HomeReady(state, onStationSelected, onOpenSettings)
            ShomaraHomeLoadState.Empty -> HomeEmpty()
            ShomaraHomeLoadState.ContentUnavailable -> HomeContentUnavailable()
            ShomaraHomeLoadState.Error -> HomeError()
        }
    }
}

@Composable
private fun HomeLoading() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("در حال بارگذاری مسیر…", style = ShomaraTypography.Body, color = ShomaraHomeUiTokens.Muted)
    }
}

@Composable
private fun HomeEmpty() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("هنوز مسیری برای تو ساخته نشده.", style = ShomaraTypography.Body, color = ShomaraHomeUiTokens.Muted)
    }
}

@Composable
private fun HomeContentUnavailable() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("محتوای این بخش فعلاً در دسترس نیست.", style = ShomaraTypography.Body, color = ShomaraHomeUiTokens.Muted)
    }
}

@Composable
private fun HomeError() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("خطا در بارگذاری مسیر.", style = ShomaraTypography.Body, color = ShomaraHomeUiTokens.Muted)
    }
}

@Composable
private fun HomeReady(
    state: ShomaraHomePathUiState,
    onStationSelected: (String) -> Unit,
    onOpenSettings: () -> Unit,
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .background(ShomaraHomeUiTokens.Canvas)
            .padding(horizontal = ShomaraHomeUiTokens.ScreenInset),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // A. Home header
        ShomaraHomeHeader(
            title = "مسیر یادگیری",
            subtitle = "قدم‌به‌قدم جلو می‌ریم",
            onSettings = onOpenSettings,
            characterSlot = {
                ShomaraCharacterImage(
                    character = ShomaraCharacter.Main,
                    poseId = 1,
                    slot = ShomaraCharacterSlot.Inline,
                )
            },
        )

        // B. Chapter progress card
        state.progress?.let { progress ->
            ShomaraChapterProgressCard(
                gradeLabel = state.gradeLabel ?: "",
                chapterTitle = state.chapterTitle ?: "",
                progress = progress,
            )
        }

        // C. Continue/current station card
        state.continueStation?.let { continueStation ->
            ShomaraContinueStationCard(
                eyebrow = if (continueStation.isResume) "از آخرین نقطه ادامه بده" else "شروع کن",
                title = continueStation.title,
                supportingText = continueStation.description,
                actionLabel = continueStation.actionLabel,
                onContinue = { onStationSelected(continueStation.stationId) },
                leadingContent = {
                    Image(
                        painter = painterResource(R.drawable.shomara_ui_play),
                        contentDescription = null,
                        modifier = Modifier.size(40.dp),
                    )
                },
            )
        }

        // D. Path heading
        Text(
            text = "مسیر تو",
            style = ShomaraTypography.Title,
            color = ShomaraHomeUiTokens.Ink,
        )

        // E. Path nodes with connectors
        state.nodes.forEachIndexed { index, node ->
            if (index > 0) {
                ShomaraPathConnector()
            }
            ShomaraHomeNodeLabelCard(
                title = node.title,
                description = node.description,
                state = node.state,
                lockedReason = node.lockedReason,
            )
        }
    }
}
