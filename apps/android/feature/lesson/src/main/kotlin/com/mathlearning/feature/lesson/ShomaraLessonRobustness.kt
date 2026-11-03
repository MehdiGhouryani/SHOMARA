package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage

/**
 * N08-05 robustness (acceptance: fast taps / offline / process death; no dead end).
 *
 * These are PURE decision objects so the rules are testable on the JVM and the composable layer can
 * only render them. Each one closes a defect found by reading the real lesson host, not a
 * hypothetical:
 *
 *  1. [ShomaraLessonSubmitGate] — the submit button had no in-flight guard. `submitCurrent` is a
 *     suspend call, so the window between tap and response is real: a child can tap twice and send
 *     two submissions for one encounter. Only ONE may be in flight, and a blank choice (no option
 *     rendered yet) must never be submitted as a placeholder.
 *  2. [ShomaraLessonBackLogic] — the app registered NO BackHandler at all. System back during a
 *     lesson popped the navigation stack and destroyed the child's place with no confirmation, while
 *     the on-screen exit button DID confirm. Back now always asks first, and a second back dismisses
 *     the question (stays in the lesson) — it never silently exits.
 *  3. [ShomaraLessonStageWalk] — the host advanced with
 *     `MacroStage.entries[(index + 1).coerceAtMost(lastIndex)]`, which at the LAST stage silently
 *     re-entered the same stage forever (a dead end disguised as progress). The walk now returns
 *     null past the final stage so the host can show an honest terminal state.
 *  4. [ShomaraLessonBannerPolicy] — an interruption banner was set on failure and never cleared on
 *     the next success, so a recovered child kept seeing a stale error.
 */

/** In-flight bookkeeping for a single lesson screen. */
data class ShomaraSubmitGateState(
    val inFlight: Boolean = false,
    val submissions: Int = 0,
) {
    init {
        require(submissions >= 0) { "submission count is non-negative" }
    }
}

object ShomaraLessonSubmitGate {
    /**
     * A submission is allowed only when nothing is already in flight AND there is a real choice.
     * Passing null/blank is the "no option rendered yet" case — submitting it would fabricate an
     * answer the child never gave.
     */
    fun canSubmit(state: ShomaraSubmitGateState, choiceId: String?): Boolean =
        !state.inFlight && !choiceId.isNullOrBlank()

    /** Marks the single in-flight submission. A second call while in flight is a no-op by design. */
    fun begin(state: ShomaraSubmitGateState, choiceId: String?): ShomaraSubmitGateState =
        if (!canSubmit(state, choiceId)) state else state.copy(inFlight = true)

    /** A completed submission clears the lock and counts exactly once. */
    fun succeed(state: ShomaraSubmitGateState): ShomaraSubmitGateState =
        if (!state.inFlight) state else ShomaraSubmitGateState(inFlight = false, submissions = state.submissions + 1)

    /** A failed/offline submission clears the lock so the child can retry (never a dead end). */
    fun fail(state: ShomaraSubmitGateState): ShomaraSubmitGateState =
        if (!state.inFlight) state else state.copy(inFlight = false)
}

object ShomaraLessonBackLogic {
    /**
     * System-back handling. The child must never lose their place by accident:
     *  - first back  -> ask the same question the exit button asks
     *  - second back -> dismiss the question (stay in the lesson; there is no "yes" side effect)
     *  - confirmed   -> already leaving; do not re-ask
     */
    fun onBack(current: ShomaraCloseConfirmState): ShomaraCloseConfirmState = when (current) {
        ShomaraCloseConfirmState.NotRequested -> ShomaraCloseConfirmState.AwaitingConfirmation
        ShomaraCloseConfirmState.Dismissed -> ShomaraCloseConfirmState.AwaitingConfirmation
        ShomaraCloseConfirmState.AwaitingConfirmation -> ShomaraCloseConfirmState.NotRequested
        ShomaraCloseConfirmState.ConfirmedExit -> ShomaraCloseConfirmState.ConfirmedExit
    }

    /** True while the lesson still owns the back gesture (the app must not pop the screen). */
    fun consumesBack(current: ShomaraCloseConfirmState): Boolean =
        current != ShomaraCloseConfirmState.ConfirmedExit
}

object ShomaraLessonStageWalk {
    /**
     * Next macro stage, or null when the child is past the final stage.
     *
     * Returning null instead of clamping is the whole point: clamping made the final stage repeat
     * forever, which reads to a child as "the lesson is stuck". A null here becomes an explicit
     * "waiting for the server" state in the host instead of an infinite loop.
     */
    fun next(current: MacroStage): MacroStage? {
        val index = MacroStage.entries.indexOf(current)
        check(index >= 0) { "unknown macro stage" }
        return MacroStage.entries.getOrNull(index + 1)
    }

    fun isFinal(current: MacroStage): Boolean = next(current) == null
}

object ShomaraLessonBannerPolicy {
    /** A new attempt starts clean; a stale interruption must not follow a recovered child. */
    fun afterSuccess(previous: String?): String? = null

    /** An interruption is shown verbatim (warm, actionable copy supplied by the network layer). */
    fun afterFailure(message: String): String? = message
}