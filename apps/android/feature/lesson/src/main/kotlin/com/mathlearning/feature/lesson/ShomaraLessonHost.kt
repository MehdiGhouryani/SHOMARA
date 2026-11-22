package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
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
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.ShomaraBackHandler
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.network.LessonGateway
import kotlinx.coroutines.delay
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
    // P14/P6: the real Room-backed recorder is injected at the app root. Release has no draft guided items/evaluator, so this preview callback remains unreachable there.
    lessonRecords: com.mathlearning.core.model.repository.LessonRecordRepository? = null,
    // N08R-09: TRUE only in the debug preview (no evaluator can advance stages there), so
    // finishing discover walks to the guided preview. With the Phase-1 local evaluator this
    // stays false — the EVALUATOR owns stage advance, never the UI.
    previewAdvanceToNextStage: Boolean = false,
) {
    val scope = rememberCoroutineScope()
    var closeState by remember { mutableStateOf<ShomaraCloseConfirmState>(ShomaraCloseConfirmState.NotRequested) }
    // S1 (blueprint §3): the stage cursor moved into the flow machine — the ONLY legal source
    // of a stage change is an evaluator-approved ShomaraStageAdvance; the machine rejects
    // skipping, mid-transition advances and advances that don't start from the current stage.
    var stationFlow by remember { mutableStateOf(ShomaraStationFlowMachine(currentStage = MacroStage.P1_DISCOVER)) }
    var resumed by remember { mutableStateOf<Boolean?>(null) }
    var banner by remember { mutableStateOf<String?>(null) }
    var gate by remember { mutableStateOf(ShomaraSubmitGateState()) }
    var awaitingServerStage by remember { mutableStateOf(false) }
    var resultSurface by remember { mutableStateOf<ShomaraResultSurface?>(null) }
    // S5 (blueprint S5 / stage5 §4.1): the stage-entry card and the celebration are ONE state
    // object behind ONE gate. Before this wiring the gate, the card and the overlay were
    // tested components that nothing rendered — real logic, dead in production.
    var celebration by remember { mutableStateOf(ShomaraCelebrationState()) }
    // S4: the narration queue. Nothing plays yet (TTS/audio assets land in the asset phase),
    // but the cut-on-exit rule must be LIVE: a narrator still talking after the child left the
    // station is precisely the defect this seam exists to prevent.
    var audioQueue by remember { mutableStateOf(ShomaraAudioQueue()) }
    // S1: every stage read/write goes through the flow machine — one owner, no drift. The
    // historical `macroStage` var is now a derived read so all existing references keep
    // compiling against the machine's current stage.
    val macroStage: MacroStage = stationFlow.currentStage
    // DT-55: the session's start time is captured ONCE. It used to be read inline for every attempt, so
    // each recorded attempt carried a later `startedAtMs` than the previous one and the session appeared
    // to restart on every check — any duration computed from it was wrong. `updatedAtMs` stays live,
    // because that one is supposed to move.
    val sessionStartedAtMs = remember { System.currentTimeMillis() }

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
                // S1: a recovered checkpoint lands in the flow machine (same owner as advances).
                stationFlow = ShomaraStationFlowMachine(currentStage = resumedStep.macroStage)
            } else {
                resumed = false
            }
        }
    }
    LaunchedEffect(closeState) {
        if (closeState == ShomaraCloseConfirmState.ConfirmedExit) {
            // S4: leaving the station silences the narrator at once (cutNow, not a fade tail).
            audioQueue = audioQueue.cutNow()
            onExitToShell()
        }
    }

    // S5: the intro card appears once per stage entry — and only when no celebration is on
    // screen, because the gate refuses to overlap the two. Keying on the celebration kind too
    // means the card is retried the moment a celebration ends, so a stage that follows a round
    // celebration still gets its card instead of silently losing it.
    LaunchedEffect(macroStage, celebration.kind) {
        if (celebration.kind == ShomaraCelebrationKind.None && celebration.intro == null) {
            celebration = ShomaraCelebrationGate.showIntro(
                celebration,
                macroStage,
                System.currentTimeMillis(),
            )
        }
    }
    // S5: ONE ticker, and only while something is actually on screen — no idle polling loop
    // running for the whole lesson.
    LaunchedEffect(celebration.isBusy) {
        while (celebration.isBusy) {
            delay(ShomaraLessonHostTickMs)
            celebration = ShomaraCelebrationGate.tick(celebration, System.currentTimeMillis())
        }
    }

    // S1 §3: the SceneCanvas is the ONE clock for the exit→enter pair. It calls back at the
    // exit→enter boundary; that is where the flow machine commits the new stage, so the exit
    // animates the outgoing scene and the enter animates the incoming one. There is no second
    // timer here on purpose: two clocks desynchronise the pair (the bug this replaced).
    val sceneStageKey: MacroStage = stationFlow.enteringStage ?: stationFlow.currentStage
    val commitSceneSwap: () -> Unit = {
        if (stationFlow.isTransitioning) stationFlow = stationFlow.finishTransition()
    }

    // N08-05: back must ask before throwing away the child's place. Consuming the gesture while the
    // question is open means a stray second back cannot exit either.
    ShomaraBackHandler(enabled = journey != null) {
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
    // S1 (blueprint §2): the lesson body is now the V3 frame — TopBar / SceneCanvas (NO scroll,
    // invariant 3) / FeedbackSlot + BottomCtaSlot (pinned). The old inner `verticalScroll`
    // column is gone: scroll belonged to parent dialogs, and a scene the child must never
    // lose sight of was previously a scroll target. In-stage items that genuinely need more
    // room than the canvas gives are a stage-content contract (S2 templates size to fit).
    // S5: the celebration paints OVER the lesson frame (never inside a slot), so showing it can
    // never reflow or shift the scene the child is looking at.
    Box(modifier = modifier.fillMaxSize()) {
    Column(
        modifier = Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        // S0 (STATION_EXPERIENCE_BLUEPRINT §2): the exit affordance is a 48dp icon pinned
        // OUTSIDE the scene, and the stage chips replace the removed progress bar
        // (F-05) with a position sentence — no fraction, no percentage. The full-width exit
        // text button and its in-flow banner confirmation are gone (audit A1/A2): a secondary
        // action no longer competes with the single primary CTA, and confirmation became the
        // modal sheet below, over the game instead of reflowing the lesson.
        ShomaraStationTopBar(
            macroStage = macroStage,
            onExitRequest = { closeState = ShomaraCloseConfirmLogic.request(closeState) },
        )
        // F-05: the indeterminate progress bar is gone. It never had a fraction (the
        // server gives no total yet), so it rendered motion without meaning — a bar
        // that fills nothing teaches the child nothing. The top-bar chips above now
        // carry the position; a «مرحلهٔ N از ۵» bar remains an open owner decision.
        // S1: the stage header rides INSIDE the scene canvas so it participates in the
        // stageEnter/stageExit moments (§4.1) instead of flickering outside them.
        ShomaraSceneCanvas(
            // The key is the INCOMING stage, so the moment starts the instant the evaluator's
            // advance is accepted; the content below still renders the OUTGOING stage until
            // the canvas reports the swap boundary and the machine commits.
            stageKey = sceneStageKey,
            onSceneSwapped = commitSceneSwap,
            modifier = Modifier.weight(1f).fillMaxWidth(),
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
            ) {
                // S5 (§4.1 stage entry): the intro card names the stage the child is entering
                // and leaves on its own after ≤1.5s; a tap dismisses it early. It renders as the
                // first thing inside the scene, so it belongs to the stage it announces.
                celebration.intro?.let { _ ->
                    ShomaraStationIntroCard(
                        stageIndex = ShomaraStationChromeLogic.stageOrder.indexOf(macroStage)
                            .coerceAtLeast(0),
                        stageLabel = ShomaraLessonStageLabels.labelFor(macroStage),
                        onDismiss = {
                            celebration = ShomaraCelebrationGate.dismissIntro(celebration)
                        },
                    )
                }
                ShomaraLessonStageHeader(macroStage = macroStage, stationId = stationId)
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
                    // P14/P6: the recorder is durable Room storage; only the debug-gated pilot evaluator can call this preview callback.
                    onAttemptEvaluated = lessonRecords?.let { repo ->
                        { encounterId: String, attemptIndex: Int, outcome: String ->
                            scope.launch {
                                repo.recordAttempt(
                                    com.mathlearning.core.model.repository.LessonSessionRecord(
                                        sessionId = "preview-st07", stationId = "ST07",
                                        stageCursor = 0, lifecycle = "ACTIVE",
                                        engineRuleVersion = "learning-engine:v1",
                                        contentPackageVersion = 1,
                                        startedAtMs = sessionStartedAtMs,
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
                        if (previewAdvanceToNextStage) {
                            // S1: the debug preview hook also advances THROUGH the machine —
                            // no caller may mutate the stage cursor behind its back.
                            val next = ShomaraLessonStageWalk.next(macroStage)
                            if (next != null) {
                                stationFlow = stationFlow.advance(
                                    ShomaraStageAdvance(from = macroStage, to = next),
                                )
                            }
                        }
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
        }
        // S1 §2: the pinned FeedbackSlot + BottomCtaSlot. E-04/R-04 unchanged in intent: the
        // banners live ABOVE the CTA and never scroll away (there is no scroll anymore); the
        // close-confirm question stays in the modal exit sheet (S0), not this slot.
        ShomaraStationBottomSlots(
            feedback = {
                if (activeJourney == null) {
                    // Fail-closed: no gateway configured (backend not set up yet) — honest, warm surface.
                    ShomaraFeedbackBanner(
                        kind = ShomaraFeedbackKind.Recovery,
                        text = ShomaraLessonStrings.GatewayMissing,
                    )
                } else if (awaitingServerStage) {
                    // The child finished every macro stage the client can walk. Mastery and the next
                    // station belong to the server, so this is an honest wait, not a fabricated completion.
                    ShomaraFeedbackBanner(
                        kind = ShomaraFeedbackKind.Recovery,
                        text = ShomaraLessonStrings.AwaitingServer,
                    )
                }
                banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = it) }
                if (resumed == true) {
                    ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraLessonStrings.Resumed)
                }
            },
            cta = {
                // Pinned bottom slot: the one primary CTA, only when a real option exists to
                // submit. Every other state leaves the slot empty — no inert button, no fake
                // action — and the result surface keeps its own single CTA above (acceptance ⑤).
                if (resultSurface == null && activeJourney != null && !awaitingServerStage && choiceId != null) {
            ShomaraButton(
                text = ShomaraLessonStrings.SubmitAnswer,
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
                                        // S5: only a PASS is celebrated. A needs-practice
                                        // result is a recovery surface — celebrating it would
                                        // tell the child they succeeded when the evaluator just
                                        // said they did not (the gate also allows it once).
                                        if (surface == ShomaraResultSurface.CompletePass) {
                                            celebration = ShomaraCelebrationGate.celebrate(
                                                celebration,
                                                ShomaraCelebrationKind.StationEnd,
                                                System.currentTimeMillis(),
                                            )
                                        }
                                    } else {
                                        val next = ShomaraLessonStageWalk.next(macroStage)
                                        if (next == null) {
                                            awaitingServerStage = true
                                        } else {
                                            // S1 §3: the stage change goes through the flow
                                            // machine as an evaluator-approved advance — the
                                            // server PASS here IS that verdict; the machine
                                            // plays the exit→enter scene pair, then settles.
                                            stationFlow = stationFlow.advance(
                                                ShomaraStageAdvance(from = macroStage, to = next),
                                            )
                                            activeJourney.enterStage(next)
                                            // S5: a finished round gets the short round
                                            // celebration (≤1.6s), not the station one — the
                                            // two are different moments and the gate allows the
                                            // station moment only once per station.
                                            celebration = ShomaraCelebrationGate.celebrate(
                                                celebration,
                                                ShomaraCelebrationKind.RoundEnd,
                                                System.currentTimeMillis(),
                                            )
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
        },
        )
        // S5: rendered last so it paints over the frame; the gate guarantees at most one kind
        // and at most one station-end moment per station.
        if (celebration.kind != ShomaraCelebrationKind.None) {
            ShomaraCelebrationOverlay(
                kind = celebration.kind,
                copyLine = when (celebration.kind) {
                    ShomaraCelebrationKind.StationEnd ->
                        ShomaraCelebrationCopy.winLine(stationId.hashCode())
                    ShomaraCelebrationKind.RoundEnd ->
                        ShomaraCelebrationCopy.winLine(stationId.hashCode() + celebration.kind.ordinal)
                    ShomaraCelebrationKind.None -> ""
                },
                // The overlay owns only its animation; the GATE owns the state, so closing the
                // card is a tick — never an ad-hoc null write that could skip the once-per-
                // station rule.
                onDone = {
                    celebration = ShomaraCelebrationGate.tick(celebration, Long.MAX_VALUE)
                },
            )
        }
    }
    }
    // S0: the modal exit sheet renders only while the (unchanged, unit-tested) close state is
    // AwaitingConfirmation. Dismiss (scrim/drag) and the primary button both mean «می‌مانم»;
    // only the secondary reaches confirmExit. The assessment warning appears only in P4.
    if (closeState == ShomaraCloseConfirmState.AwaitingConfirmation) {
        ShomaraStationExitSheet(
            onStay = { closeState = ShomaraCloseConfirmLogic.stay(closeState) },
            onExit = { closeState = ShomaraCloseConfirmLogic.confirmExit(closeState) },
            assessmentStage = macroStage == MacroStage.P4_ASSESSMENT,
        )
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
    const val UnavailableMessage: String = ShomaraLessonStrings.OptionsUnavailable

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

/**
 * S5 tick interval for the celebration clock. 50ms is well below the shortest moment a child can
 * perceive (the intro card's 1.5s), and the loop existst only while something is on screen, so it
 * is a bounded 20 wake-ups per second during a celebration — never an idle timer.
 */
private const val ShomaraLessonHostTickMs = 50L

private object NoCheckpoints : LessonCheckpointStore {
    override suspend fun save(checkpoint: com.mathlearning.core.datastore.LessonCheckpoint) {}
    override suspend fun read(sessionId: String, stationId: String): com.mathlearning.core.datastore.LessonCheckpoint? = null
    override suspend fun clear(sessionId: String, stationId: String) {}
}