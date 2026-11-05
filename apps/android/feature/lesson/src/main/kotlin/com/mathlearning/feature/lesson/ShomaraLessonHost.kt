package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraBackHandler
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.network.LessonGateway
import kotlinx.coroutines.launch

/**
 * N06-07/08 app-facing lesson host: runs the real journey (gateway + checkpoints), renders the
 * lesson chrome (server-driven progress, fail-safe close confirm) and returns to the child shell
 * on a confirmed exit or a server PASS/COMPLETE result.
 *
 * N08-05 robustness added here:
 *  - system BACK is captured (it previously popped the screen silently while the on-screen exit
 *    button asked for confirmation);
 *  - submissions are single-flight, so a fast double tap cannot send two answers;
 *  - the stage walk no longer clamps at the final stage (which repeated it forever);
 *  - a stale interruption banner is cleared once a later attempt succeeds.
 *
 * Stage 3 display-only (families 08-11): Persian stage labels via
 * ShomaraLessonStageChrome (the raw Latin enum name was shown before),
 * a small static Number guide only in P1 discovery, no character in
 * guided practice or assessment (assessment stays the quietest family),
 * and a restrained result surface for server Complete results instead
 * of a silent exit to the shell. No adapter, journey, or submit logic
 * changed; no hint button was invented, because no server hint content
 * exists to render, and no template content was invented, because the
 * server options for every stage are still empty (see
 * ShomaraLessonOptions) — the honest unavailable banner stays.
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
    var gate by remember { mutableStateOf(ShomaraSubmitGateState()) }
    var awaitingServerStage by remember { mutableStateOf(false) }
    var resultSurface by remember { mutableStateOf<ShomaraResultSurface?>(null) }

    val journey = remember(stationId) {
        gateway?.let { ShomaraLessonJourney(sessionId, stationId, it, checkpointStore ?: NoCheckpoints) }
    }

    LaunchedEffect(Unit) { resumed = journey?.resume() != null }
    LaunchedEffect(closeState) {
        if (closeState == ShomaraCloseConfirmState.ConfirmedExit) onExitToShell()
    }

    // N08-05: back must ask before throwing away the child's place. Consuming the gesture while the
    // question is open means a stray second back cannot exit either.
    shomaraBackHandler(enabled = journey != null) {
        closeState = ShomaraLessonBackLogic.onBack(closeState)
    }

    // Stage 5: screen inset unified with Stage 4 language (24dp / 16dp).
    Column(
        modifier = modifier.fillMaxSize().padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        ShomaraProgressBar(state = ShomaraProgressState())
        ShomaraLessonStageHeader(macroStage = macroStage, stationId = stationId)
        banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = it) }
        if (resumed == true) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "از همون‌جا ادامه می‌دهیم.")
        }
        val closeRequested = closeState == ShomaraCloseConfirmState.AwaitingConfirmation
        if (closeRequested) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraCloseConfirmLogic.ExitQuestion)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            ) {
                ShomaraButton(
                    text = ShomaraCloseConfirmLogic.ConfirmLabel,
                    onClick = { closeState = ShomaraCloseConfirmLogic.confirmExit(closeState) },
                    variant = ShomaraButtonVariant.Primary,
                )
                ShomaraButton(
                    text = ShomaraCloseConfirmLogic.StayLabel,
                    onClick = { closeState = ShomaraCloseConfirmLogic.stay(closeState) },
                    variant = ShomaraButtonVariant.Ghost,
                )
            }
        } else if (resultSurface == null) {
            ShomaraButton(
                text = "خروج از ایستگاه",
                onClick = { closeState = ShomaraCloseConfirmLogic.request(closeState) },
                variant = ShomaraButtonVariant.Ghost,
            )
        }
        val activeJourney = journey
        if (resultSurface != null) {
            ShomaraLessonResultSurface(
                surface = resultSurface!!,
                onExitToShell = onExitToShell,
            )
        } else if (activeJourney == null) {
            // Fail-closed: no gateway configured (backend not set up yet) — honest, warm surface.
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = "سرور آموزش هنوز وصل نیست؛ درس به‌زودی فعال می‌شود.",
            )
        } else if (awaitingServerStage) {
            // The child finished every macro stage the client can walk. Mastery and the next
            // station belong to the server, so this is an honest wait, not a fabricated completion.
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = "منتظر تأیید سرور هستیم؛ همین‌جا می‌مانیم.",
            )
        } else {
            // N08-05: the answer id must come from a real rendered option. It used to be a
            // hardcoded "opt-1" placeholder, which submitted an answer the child never chose.
            val choiceId = ShomaraLessonOptions.firstOptionId(macroStage)
            if (choiceId == null) {
                // No option to render means there is nothing honest to submit. Showing an inert
                // button would be a dead end, and inventing an id would be a fake success, so the
                // surface states the real dependency instead. The exit path above still works, so
                // the child is never trapped.
                ShomaraFeedbackBanner(
                    kind = ShomaraFeedbackKind.Recovery,
                    text = ShomaraLessonOptions.UnavailableMessage,
                )
            } else {
                ShomaraButton(
                    text = "ثبت پاسخ",
                    onClick = {
                        // The gate is checked again inside the coroutine because a fast double tap
                        // can queue two lambdas before recomposition disables the button.
                        if (ShomaraLessonSubmitGate.canSubmit(gate, choiceId)) {
                            gate = ShomaraLessonSubmitGate.begin(gate, choiceId)
                            scope.launch {
                                when (val step = activeJourney.submitCurrent(choiceId = choiceId)) {
                                    is JourneyStep.Submitted -> {
                                        gate = ShomaraLessonSubmitGate.succeed(gate)
                                        banner = ShomaraLessonBannerPolicy.afterSuccess(banner)
                                        val surface = ShomaraResultLogic.surfaceFor(step.nextAction)
                                        if (surface == ShomaraResultSurface.CompletePass ||
                                            surface == ShomaraResultSurface.CompleteNeedsPractice
                                        ) {
                                            // Family 11: show the restrained result surface
                                            // (one static character, server headline, one CTA)
                                            // instead of exiting silently. The CTA and the
                                            // existing close-confirm path both return to shell.
                                            resultSurface = surface
                                        } else {
                                            val next = ShomaraLessonStageWalk.next(macroStage)
                                            if (next == null) {
                                                awaitingServerStage = true
                                            } else {
                                                macroStage = next
                                                activeJourney.enterStage(next)
                                            }
                                        }
                                    }
                                    is JourneyStep.Interrupted -> {
                                        gate = ShomaraLessonSubmitGate.fail(gate)
                                        banner = ShomaraLessonBannerPolicy.afterFailure(step.failure.userMessage())
                                    }
                                    else -> gate = ShomaraLessonSubmitGate.fail(gate)
                                }
                            }
                        }
                    },
                    variant = ShomaraButtonVariant.Primary,
                    enabled = !gate.inFlight,
                    loading = gate.inFlight,
                )
            }
        }
    }
}

/**
 * The option ids the lesson surface can actually render for a stage.
 *
 * HONEST STATE: production lesson options come from the server projection, which this local build
 * does not have. Rather than invent an id (the previous code always sent "opt-1" — an answer the
 * child never chose) or render an inert button (a dead end), the surface reports the real
 * dependency. The confirmed-exit path stays available above, so the child is never trapped.
 */
object ShomaraLessonOptions {
    const val UnavailableMessage: String =
        "گزینه‌های این تمرین هنوز از سرور نیامده‌اند؛ به‌زودی فعال می‌شود."

    private val known = mapOf<MacroStage, List<String>>(
        MacroStage.P1_DISCOVER to emptyList(),
        MacroStage.P2_GUIDED to emptyList(),
        MacroStage.P3_GAME to emptyList(),
        MacroStage.P4_ASSESSMENT to emptyList(),
        MacroStage.P5_TRANSFER to emptyList(),
    )

    /** First real option id for the stage, or null when the surface has none to offer. */
    fun firstOptionId(stage: MacroStage): String? = known[stage]?.firstOrNull()
}

private object NoCheckpoints : LessonCheckpointStore {
    override suspend fun save(checkpoint: com.mathlearning.core.datastore.LessonCheckpoint) {}
    override suspend fun read(sessionId: String, stationId: String): com.mathlearning.core.datastore.LessonCheckpoint? = null
    override suspend fun clear(sessionId: String, stationId: String) {}
}