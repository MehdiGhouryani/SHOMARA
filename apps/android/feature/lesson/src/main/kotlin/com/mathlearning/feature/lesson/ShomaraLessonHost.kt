package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
    // R-08: a replay entry starts the station over from P1 — the host clears the leftover
    // checkpoint instead of resuming it, so «تمرین دوباره» is a fresh run, not a resume.
    replay: Boolean = false,
    // N08R-08: the child-safe DISCOVER projection (ST07 pilot P1 structure) — empty in
    // release until the local content package exists (Phase 1, O1/O2-gated). The debug
    // build wires the DRAFT-pilot structure for design review; the renderer never judges.
    discoverSteps: List<ShomaraDiscoverStep> = emptyList(),
    // N08R-09: the guided-practice projection + the debug-only evaluator. Release keeps
    // both empty/null (fail-closed skeleton); correctness never enters the projection.
    guidedItems: List<ShomaraGuidedItem> = emptyList(),
    guidedEvaluator: ShomaraGuidedEvaluator? = null,
    // P14: the durable attempt recorder (null in release = fail-closed no-persist)
    lessonRecords: com.mathlearning.core.model.repository.LessonRecordRepository? = null,
    // N08R-09: TRUE only in the debug preview (no evaluator can advance stages there), so
    // finishing discover walks to the guided preview. With the Phase-1 local evaluator this
    // stays false — the EVALUATOR owns stage advance, never the UI.
    previewAdvanceToNextStage: Boolean = false,
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

    // F-04: resume() returns the recovered step — the host used to throw it away and
    // restart at P1 while still showing «از همون‌جا ادامه می‌دهیم». The recovered macro
    // stage now actually becomes the current stage.
    // R-08: a replay entry never resumes — the checkpoint is cleared first and the run
    // starts at P1 with no resume banner.
    LaunchedEffect(Unit) {
        if (replay) {
            journey?.restart()
            resumed = false
        } else {
            val resumedStep = journey?.resume()
            if (resumedStep != null) {
                resumed = true
                macroStage = resumedStep.macroStage
            } else {
                resumed = false
            }
        }
    }
    LaunchedEffect(closeState) {
        if (closeState == ShomaraCloseConfirmState.ConfirmedExit) onExitToShell()
    }

    // N08-05: back must ask before throwing away the child's place. Consuming the gesture while the
    // question is open means a stray second back cannot exit either.
    shomaraBackHandler(enabled = journey != null) {
        closeState = ShomaraLessonBackLogic.onBack(closeState)
    }

    // N08-05: the answer id must come from a real rendered option. It used to be a
    // hardcoded "opt-1" placeholder, which submitted an answer the child never chose.
    // Checklist component 2 (sticky primary CTA): the submit action lives in a
    // pinned bottom slot — full-width, fixed — while the lesson content above it
    // scrolls. The CTA never scrolls away, never collides with gesture navigation
    // (navigationBarsPadding) and grows with 200% font instead of clipping
    // (ShomaraButton min-height). The hoisted choiceId is the same pure lookup
    // the inline branch used before; no option, label or submit rule changed.
    val activeJourney = journey
    val choiceId = if (activeJourney != null && resultSurface == null && !awaitingServerStage) {
        ShomaraLessonOptions.firstOptionId(macroStage)
    } else {
        null
    }

    // Stage 5: screen inset unified with Stage 4 language (24dp / 16dp).
    Column(
        modifier = modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // F-05: the indeterminate progress bar is gone. It never had a fraction (the
            // server gives no total yet), so it rendered motion without meaning — a bar
            // that fills nothing teaches the child nothing. The stage header below already
            // names the current stage in words; a «مرحلهٔ N از ۵» bar is option ب and
            // stays an open owner decision, not an invented fraction.
            ShomaraLessonStageHeader(macroStage = macroStage, stationId = stationId)
            val closeRequested = closeState == ShomaraCloseConfirmState.AwaitingConfirmation
            if (closeRequested) {
                ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraCloseConfirmLogic.ExitQuestion)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                ) {
                    // Batch 2: at 200% font the two confirm buttons share the
                    // row equally instead of overflowing a 360dp screen —
                    // each grows in height with its label, never clips it.
                    ShomaraButton(
                        text = ShomaraCloseConfirmLogic.ConfirmLabel,
                        onClick = { closeState = ShomaraCloseConfirmLogic.confirmExit(closeState) },
                        variant = ShomaraButtonVariant.Primary,
                        modifier = Modifier.weight(1f),
                    )
                    ShomaraButton(
                        text = ShomaraCloseConfirmLogic.StayLabel,
                        onClick = { closeState = ShomaraCloseConfirmLogic.stay(closeState) },
                        variant = ShomaraButtonVariant.Ghost,
                        modifier = Modifier.weight(1f),
                    )
                }
            } else if (resultSurface == null) {
                ShomaraButton(
                    text = "خروج از ایستگاه",
                    onClick = { closeState = ShomaraCloseConfirmLogic.request(closeState) },
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (resultSurface != null) {
                ShomaraLessonResultSurface(
                    surface = resultSurface!!,
                    onExitToShell = onExitToShell,
                )
            } else if (macroStage == MacroStage.P2_GUIDED && guidedItems.isNotEmpty() && guidedEvaluator != null) {
                // N08R-09: the guided loop renders its real projected items; the evaluator
                // layer (debug draft / future local evaluator) judges, never this UI.
                ShomaraGuidedStage(
                    items = guidedItems,
                    evaluator = guidedEvaluator,
                    onAllItemsComplete = { /* evaluator wiring lands with the local package (Phase 1) */ },
                    // P14: the durable attempt recorder — null in release (fail-closed no-persist).
                    onAttemptEvaluated = lessonRecords?.let { repo ->
                        { encounterId: String, attemptIndex: Int, outcome: String ->
                            scope.launch {
                                repo.recordAttempt(
                                    com.mathlearning.core.model.repository.LessonSessionRecord(
                                        sessionId = "preview-st07", stationId = "ST07",
                                        stageCursor = 0, lifecycle = "ACTIVE",
                                        engineRuleVersion = "learning-engine:v1",
                                        contentPackageVersion = 1,
                                        startedAtMs = System.currentTimeMillis(),
                                        updatedAtMs = System.currentTimeMillis(),
                                    ),
                                    com.mathlearning.core.model.repository.RecordedAttempt(
                                        sessionId = "preview-st07", encounterId = encounterId,
                                        stage = "P2_GUIDED",
                                        attemptKey = "attempt|preview-st07|" + encounterId + "|" + attemptIndex + "|guided",
                                        interactionId = encounterId, outcome = outcome,
                                        evaluatorVersion = "debug-draft-v1",
                                        recordedAtMs = System.currentTimeMillis(),
                                    ),
                                )
                            }
                        }
                    },
                )
            } else if (macroStage == MacroStage.P1_DISCOVER && discoverSteps.isNotEmpty()) {
                // N08R-08: the discover stage renders its real (projected) steps — the
                // concept animation IS the lesson; no answer/evaluator fields exist here.
                ShomaraDiscoverStage(
                    steps = discoverSteps,
                    onAllStepsComplete = {
                        if (previewAdvanceToNextStage) macroStage = MacroStage.P2_GUIDED
                    },
                )
            } else if (activeJourney != null && !awaitingServerStage && choiceId == null) {
                // B2: no option to render means the honest surface is the current stage's
                // template skeleton — the shape of the task with honest empty data — not a
                // bare banner. The existing UnavailableMessage stays as the skeleton's
                // status line; the exit path above still works, so the child is never
                // trapped. The skeleton's check action enters the evaluator-wait state
                // (the existing «منتظر تأیید سرور» banner) once a real selection exists —
                // today the skeleton's check is disabled, so this lambda cannot fire yet;
                // it is the Phase 1 hook, not a live path.
                // R-04: the gateway-missing and awaiting-server banners used to live here
                // in the scrolling column; they now live in the fixed slot below, so the
                // skeleton renders only for a live journey that is not awaiting the server.
                ShomaraTemplateSkeletonForStage(
                    macroStage = macroStage,
                    onCheck = { awaitingServerStage = true },
                )
            }
        }
        // E-04: feedback banners live in a fixed slot above the pinned CTA — the child
        // always sees the feedback, even scrolled to the bottom, and the banner never
        // scrolls away with the content. The close-confirm question, the result surface
        // and the exit button stay in the scrolling column above.
        // R-04: the gateway-missing and awaiting-server banners join this fixed slot —
        // they used to scroll away with the content (E-04 was incomplete for them).
        if (activeJourney == null) {
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
        }
        banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = it) }
        if (resumed == true) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "از همون‌جا ادامه می‌دهیم.")
        }
        // Pinned bottom slot: the one primary CTA, only when a real option exists to
        // submit. Every other state leaves the slot empty — no inert button, no fake
        // action — and the result surface keeps its own single CTA above.
        if (resultSurface == null && activeJourney != null && !awaitingServerStage && choiceId != null) {
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
                modifier = Modifier.fillMaxWidth(),
            )
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