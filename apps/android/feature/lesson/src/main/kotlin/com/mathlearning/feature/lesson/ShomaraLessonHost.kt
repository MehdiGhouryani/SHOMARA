package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.network.LessonGateway
import kotlinx.coroutines.launch

/**
 * N06-07/08 app-facing lesson host: runs the real journey (gateway + checkpoints), renders the
 * lesson chrome (server-driven progress, fail-safe close confirm) and returns to the child shell
 * on a confirmed exit or a server PASS/COMPLETE result.
 */
@Composable
fun ShomaraLessonHost(
    stationId: String,
    gateway: LessonGateway?,
    checkpointStore: LessonCheckpointStore?,
    onExitToShell: () -> Unit,
    modifier: Modifier = Modifier,
    sessionId: String = "local-session",
) {
    val scope = rememberCoroutineScope()
    var closeState by remember { mutableStateOf<ShomaraCloseConfirmState>(ShomaraCloseConfirmState.NotRequested) }
    var macroStage by remember { mutableStateOf(MacroStage.P1_DISCOVER) }
    var resumed by remember { mutableStateOf<Boolean?>(null) }
    var banner by remember { mutableStateOf<String?>(null) }
    val journey = remember(stationId) {
        gateway?.let { ShomaraLessonJourney(sessionId, stationId, it, checkpointStore ?: NoCheckpoints) }
    }

    LaunchedEffect(Unit) { resumed = journey?.resume() != null }
    LaunchedEffect(closeState) {
        if (closeState == ShomaraCloseConfirmState.ConfirmedExit) onExitToShell()
    }

    Column(modifier = modifier.fillMaxSize().padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        ShomaraProgressBar(state = ShomaraProgressState())
        Text(text = "ایستگاه $stationId — مرحلهٔ ${macroStage.name}", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = it) }
        if (resumed == true) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "از همون‌جا ادامه می‌دهیم.")
        }
        val closeRequested = closeState == ShomaraCloseConfirmState.AwaitingConfirmation
        if (closeRequested) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraCloseConfirmLogic.ExitQuestion)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                ShomaraButton(text = ShomaraCloseConfirmLogic.ConfirmLabel, onClick = { closeState = ShomaraCloseConfirmLogic.confirmExit(closeState) }, variant = ShomaraButtonVariant.Primary)
                ShomaraButton(text = ShomaraCloseConfirmLogic.StayLabel, onClick = { closeState = ShomaraCloseConfirmLogic.stay(closeState) }, variant = ShomaraButtonVariant.Ghost)
            }
        } else {
            ShomaraButton(
                text = "خروج از ایستگاه",
                onClick = { closeState = ShomaraCloseConfirmLogic.request(closeState) },
                variant = ShomaraButtonVariant.Ghost,
            )
        }
        val activeJourney = journey
        if (activeJourney == null) {
            // Fail-closed: no gateway configured (backend not set up yet) — honest, warm surface.
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "سرور آموزش هنوز وصل نیست؛ درس به‌زودی فعال می‌شود.")
        } else {
            ShomaraButton(
                text = "ثبت پاسخ نمونه",
                onClick = {
                    scope.launch {
                        when (val step = activeJourney.submitCurrent(choiceId = "opt-1")) {
                            is JourneyStep.Submitted -> {
                                val surface = ShomaraResultLogic.surfaceFor(step.nextAction)
                                if (surface == ShomaraResultSurface.CompletePass || surface == ShomaraResultSurface.CompleteNeedsPractice) {
                                    onExitToShell()
                                } else {
                                    val nextIndex = MacroStage.entries.indexOf(macroStage) + 1
                                    macroStage = MacroStage.entries[nextIndex.coerceAtMost(MacroStage.entries.lastIndex)]
                                    activeJourney.enterStage(macroStage)
                                }
                            }
                            is JourneyStep.Interrupted -> banner = step.failure.userMessage()
                            else -> {}
                        }
                    }
                },
                variant = ShomaraButtonVariant.Primary,
            )
        }
    }
}

private object NoCheckpoints : LessonCheckpointStore {
    override suspend fun save(checkpoint: com.mathlearning.core.datastore.LessonCheckpoint) {}
    override suspend fun read(sessionId: String, stationId: String): com.mathlearning.core.datastore.LessonCheckpoint? = null
    override suspend fun clear(sessionId: String, stationId: String) {}
}
