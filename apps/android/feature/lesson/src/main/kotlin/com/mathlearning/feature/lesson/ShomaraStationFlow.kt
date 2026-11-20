package com.mathlearning.feature.lesson

import com.mathlearning.core.designsystem.ShomaraMotionLogic
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.model.MacroStage

/**
 * S1 · STATION_EXPERIENCE_BLUEPRINT §2/§3 — the station FLOW state machine.
 *
 * Ownership (blueprint §3 table): the item cycle stays with [ShomaraLessonItemMachine], the
 * hint ladder with [ShomaraHintLadder], the celebration with the design-system gate — this
 * machine owns ONE thing: the stage CURSOR and the transition intent between macro stages.
 *
 * The blueprint's non-negotiable invariant 1 lives here: **the UI never judges.** A stage
 * change can only be REQUESTED with a [StageAdvance] signal that represents the evaluator's
 * verdict (today: the debug preview hook + the server journey's PASS; tomorrow: the local
 * versioned evaluator, ADR-0039). No UI event — a tap, a scroll, a back — is a legal source.
 *
 * Transition contract (§3): `advance` moves the machine into `Transitioning(to)`; the
 * SceneCanvas plays `stageExit` on the old stage and `stageEnter` on the new one; `finish()`
 * ends the transition. In reduced motion the host renders both moments as an instant cut —
 * the machine's states are IDENTICAL (state changes carry the information; movement is
 * optional decoration that reduced motion removes, never the other way around).
 *
 * Pure JVM state: unit-testable without a device (S1 acceptance ①②).
 */
enum class ShomaraStationFlowState {
    /** The lesson is showing the current stage's scene. */
    Showing,

    /** An evaluator-approved advance is in flight; the scene plays exit→enter. */
    Transitioning,
}

/** The ONLY legal reason a stage changes — the evaluator's verdict, never a UI event. */
data class ShomaraStageAdvance(
    /** The stage the child is leaving (sanity anchor: must equal the machine's current stage). */
    val from: MacroStage,
    /** The stage the child is entering. */
    val to: MacroStage,
) {
    init {
        require(from != to) { "a stage advance must actually change the stage" }
    }
}

data class ShomaraStationFlowMachine(
    val state: ShomaraStationFlowState = ShomaraStationFlowState.Showing,
    val currentStage: MacroStage = MacroStage.P1_DISCOVER,
    /** Set only while Transitioning — the stage the scene is entering. */
    val enteringStage: MacroStage? = null,
) {
    /** True while the scene should play the exit→enter pair (§3 transition contract). */
    val isTransitioning: Boolean
        get() = state == ShomaraStationFlowState.Transitioning

    /**
     * The evaluator approved a stage advance. Only legal from Showing; the walk target must be
     * the immediate next stage (no skipping: each stage is its own learning segment). A second
     * advance while Transitioning is REJECTED — two concurrent narrative moments on one surface
     * are a blueprint §4 bug, and the celebration-gate rule generalizes to stage transitions.
     */
    fun advance(signal: ShomaraStageAdvance): ShomaraStationFlowMachine {
        require(state == ShomaraStationFlowState.Showing) { "advance needs Showing; a running transition must finish first" }
        require(signal.from == currentStage) { "the advance must start from the machine's current stage" }
        require(ShomaraLessonStageWalk.next(currentStage) == signal.to) {
            "the evaluator may only advance to the immediate next stage"
        }
        return copy(state = ShomaraStationFlowState.Transitioning, enteringStage = signal.to)
    }

    /** The scene finished exit→enter; the machine settles on the new stage. */
    fun finishTransition(): ShomaraStationFlowMachine {
        require(state == ShomaraStationFlowState.Transitioning) { "finish needs Transitioning" }
        val target = requireNotNull(enteringStage) { "a transition always knows its target" }
        return copy(state = ShomaraStationFlowState.Showing, currentStage = target, enteringStage = null)
    }
}

/**
 * S1 §4 — the two narrative stage moments, resolved ONCE per transition from the canonical
 * tokens. Durations are token reads (no raw ms in call sites); reduced motion collapses both
 * to 0 = an instant cut (S1 acceptance ②): the stage FACTS (old gone, new here) survive, the
 * movement does not. The enter direction comes from the layout direction at the render site
 * (§4.2), never from a hardcoded LTR/RTL choice here.
 */
object ShomaraStageMotionLogic {
    /** `stageExit`: fade-out + 0.98 scale. Token-fast (§4.1 table: 120ms). */
    fun exitMs(reducedMotion: Boolean): Int = ShomaraMotionLogic.fastMs(reducedMotion)

    /** `stageEnter`: slide+fade in. Token-base (§4.1 table: 120→240ms band, we use the base). */
    fun enterMs(reducedMotion: Boolean): Int = ShomaraMotionLogic.transitionMs(reducedMotion)

    /** The §4.1 exit scale — a barely-there settle, from the press-scale token (0.96 band). */
    fun exitScale(): Float = ShomaraTokens.MotionPressScale.toFloat()

    /** True when the moment may run at all; reduced motion = state cut, never a tween. */
    fun mayAnimate(reducedMotion: Boolean): Boolean = ShomaraMotionLogic.shouldAnimate(reducedMotion)
}
