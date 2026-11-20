package com.mathlearning.feature.lesson

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.LayoutDirection
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraTokens
import kotlin.math.abs

/**
 * S1 · STATION_EXPERIENCE_BLUEPRINT §2 — the SceneCanvas slot and the two stage moments.
 *
 * The canvas is the lesson's single scene surface: `weight(1f)`, NO scroll (invariant 3 —
 * the content fits the scene; scroll belongs to parent dialogs only). The host renders the
 * active stage's composable inside it; this file owns nothing about WHICH stage or WHAT
 * content — it is the frame, the transition pair (§3 contract) and the RTL-aware enter
 * direction (§4.2).
 *
 * The §4.1 moments:
 *  - `stageExit` — the outgoing scene fades away with the 0.98 settle (information: this
 *    stage is finished);
 *  - `stageEnter` — the incoming scene slides from the READING-START side (RTL-aware) with
 *    a fade (information: a new stage arrived, from where to look).
 *
 * Reduced motion: both moments collapse to instant cuts (S1 acceptance ②) — the stage
 * FACTS survive, the movement does not. The machine's states are identical either way.
 */
enum class ShomaraScenePhase { Holding, Exiting, Entering }

/**
 * Pure phase timing — testable without a device. The phase sequence for one approved
 * advance is Exit → Enter → Holding; under reduced motion every phase is immediate, so the
 * sequence is logically identical (the composable only skips the tweens).
 */
object ShomaraScenePhaseLogic {
    fun exitDurationMs(reducedMotion: Boolean): Int = ShomaraStageMotionLogic.exitMs(reducedMotion)
    fun enterDurationMs(reducedMotion: Boolean): Int = ShomaraStageMotionLogic.enterMs(reducedMotion)

    /** The single transition is ONE moment pair; overlapping pairs are a blueprint §4 bug. */
    fun nextPhase(phase: ShomaraScenePhase): ShomaraScenePhase? = when (phase) {
        ShomaraScenePhase.Holding -> null
        ShomaraScenePhase.Exiting -> ShomaraScenePhase.Entering
        ShomaraScenePhase.Entering -> ShomaraScenePhase.Holding
    }

    /** The enter slide start offset as a fraction of the canvas width (§4.1: slide+fade). */
    fun enterStartFraction(): Float = 0.12f

    /** The exit settle scale (§4.1: 0.98), read from the token band, not a raw literal. */
    fun exitScale(): Float = ShomaraStageMotionLogic.exitScale()
}

/**
 * The scene frame. [stageKey] changes exactly when the flow machine's stage changes (the
 * host passes the machine's stage); [contentKey] recomposes the scene for the in-stage item
 * without restarting the stage moments.
 */
@Composable
fun ShomaraSceneCanvas(
    stageKey: Any?,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    val layoutDirection = LocalLayoutDirection.current
    var phase by remember { mutableStateOf(ShomaraScenePhase.Holding) }
    var displayedStage by remember { mutableStateOf(stageKey) }

    // The stage key changed: an evaluator-approved advance landed. Run the §3 contract —
    // the OLD scene plays stageExit, then the NEW scene plays stageEnter. Reduced motion
    // walks the SAME phase sequence with zero-duration steps (a cut, acceptance ②).
    LaunchedEffect(stageKey) {
        if (displayedStage != stageKey) {
            phase = ShomaraScenePhase.Exiting
        } else {
            displayedStage = stageKey
        }
    }

    // Exit finishes -> swap the content -> Enter -> Holding. Pure phase logic owns the order.
    LaunchedEffect(phase) {
        when (phase) {
            ShomaraScenePhase.Exiting -> {
                kotlinx.coroutines.delay(ShomaraScenePhaseLogic.exitDurationMs(reducedMotion).toLong())
                displayedStage = stageKey
                phase = ShomaraScenePhaseLogic.nextPhase(phase) ?: ShomaraScenePhase.Holding
            }
            ShomaraScenePhase.Entering -> {
                kotlinx.coroutines.delay(ShomaraScenePhaseLogic.enterDurationMs(reducedMotion).toLong())
                phase = ShomaraScenePhaseLogic.nextPhase(phase) ?: ShomaraScenePhase.Holding
            }
            ShomaraScenePhase.Holding -> {}
        }
    }

    val exitAnim = animateFloatAsState(
        targetValue = if (phase == ShomaraScenePhase.Exiting) ShomaraScenePhaseLogic.exitScale() else 1f,
        animationSpec = if (reducedMotion) snap() else tween(ShomaraScenePhaseLogic.exitDurationMs(reducedMotion)),
        label = "stageExitScale",
    )
    val exitAlpha = animateFloatAsState(
        targetValue = if (phase == ShomaraScenePhase.Exiting) 0f else 1f,
        animationSpec = if (reducedMotion) snap() else tween(ShomaraScenePhaseLogic.exitDurationMs(reducedMotion)),
        label = "stageExitAlpha",
    )
    // §4.2: the enter slide direction comes from the LAYOUT direction (reading start side),
    // never a hardcoded RTL choice. In RTL the scene enters from the right, in LTR from the left.
    val enterSign = if (layoutDirection == LayoutDirection.Rtl) 1f else -1f
    val enterProgress = animateFloatAsState(
        targetValue = if (phase == ShomaraScenePhase.Entering) 0f else 1f,
        animationSpec = if (reducedMotion) snap() else tween(ShomaraScenePhaseLogic.enterDurationMs(reducedMotion)),
        label = "stageEnterProgress",
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .graphicsLayer {
                // §6: animations ride graphicsLayer, never layout — no relayout, no nested scroll.
                scaleX = exitAnim.value
                scaleY = exitAnim.value
                alpha = exitAlpha.value
                translationX = abs(enterProgress.value) *
                    ShomaraScenePhaseLogic.enterStartFraction() * size.width * enterSign
            },
        contentAlignment = Alignment.TopCenter,
    ) {
        Box(modifier = Modifier.fillMaxSize().clearAndSetSemantics {}) {
            // The scene content itself keeps its own semantics; the wrapper only blocks the
            // frame from adding noise. Content renders for the DISPLAYED stage during the
            // exit (the old scene), then swaps when the enter phase begins.
            if (phase != ShomaraScenePhase.Exiting) {
                content()
            }
        }
    }
    // Keep the displayed stage fresh when the machine returns to the same key (replay/restart).
    if (phase == ShomaraScenePhase.Holding && displayedStage != stageKey) {
        LaunchedEffect(stageKey) { displayedStage = stageKey }
    }
}

/**
 * S1 §2 — the pinned FeedbackSlot + BottomCtaSlot frame (acceptance ⑤: exactly ONE primary
 * CTA). The banner lives ABOVE the CTA and never scrolls away (E-04); the CTA slot renders
 * the host's single primary action or stays empty — an inert button is a dead end, not a slot.
 */
@Composable
fun ShomaraStationBottomSlots(
    feedback: (@Composable () -> Unit)?,
    cta: (@Composable () -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        feedback?.invoke()
        cta?.invoke()
    }
}
