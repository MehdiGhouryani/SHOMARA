package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage

/**
 * N06-02 lesson chrome logic: deterministic server-driven progress, fail-safe close
 * confirmation, and audio policy. The chrome never guesses mastery — [stepIndex]/[totalSteps]
 * arrive from the server response verbatim.
 */
object ShomaraLessonChromeLogic {
    /** Fraction for the top progress bar; clamped 0..1; null when the server gave no total yet. */
    fun progressFraction(stepIndex: Int?, totalSteps: Int?): Float? {
        if (stepIndex == null || totalSteps == null || totalSteps <= 0) return null
        return (stepIndex.coerceIn(0, totalSteps) / totalSteps.toFloat()).coerceIn(0f, 1f)
    }

    fun progressAnnouncement(stepIndex: Int?, totalSteps: Int?): String {
        val fraction = progressFraction(stepIndex, totalSteps)
        return if (fraction == null) {
            "در حال همگام‌سازی با سرور"
        } else {
            "گام ${com.mathlearning.core.designsystem.ShomaraDigits.toFa(stepIndex ?: 0)} از ${com.mathlearning.core.designsystem.ShomaraDigits.toFa(totalSteps ?: 0)}"
        }
    }
}

/** Close-confirmation state machine (fail-safe): an accidental Back tap never loses the place. */
sealed class ShomaraCloseConfirmState {
    data object NotRequested : ShomaraCloseConfirmState()
    data object AwaitingConfirmation : ShomaraCloseConfirmState()
    data object ConfirmedExit : ShomaraCloseConfirmState()
    data object Dismissed : ShomaraCloseConfirmState()
}

object ShomaraCloseConfirmLogic {
    const val ExitQuestion: String = "آیا می‌خواهی از ایستگاه خارج شوی؟ پیشرفتت ذخیره می‌ماند"
    const val ConfirmLabel: String = "خروج"
    const val StayLabel: String = "می‌مانم"

    fun request(current: ShomaraCloseConfirmState): ShomaraCloseConfirmState =
        if (current == ShomaraCloseConfirmState.ConfirmedExit) current else ShomaraCloseConfirmState.AwaitingConfirmation

    fun confirmExit(current: ShomaraCloseConfirmState): ShomaraCloseConfirmState =
        if (current == ShomaraCloseConfirmState.AwaitingConfirmation) ShomaraCloseConfirmState.ConfirmedExit else current

    fun stay(current: ShomaraCloseConfirmState): ShomaraCloseConfirmState =
        if (current == ShomaraCloseConfirmState.AwaitingConfirmation) ShomaraCloseConfirmState.Dismissed else current

    fun reset(current: ShomaraCloseConfirmState): ShomaraCloseConfirmState =
        if (current == ShomaraCloseConfirmState.Dismissed) ShomaraCloseConfirmState.NotRequested else current
}

/** Lesson-session state holder logic: macro-stage walking stays server-driven. */
data class ShomaraLessonPosition(
    val sessionId: String,
    val stationId: String,
    val encounterId: String,
    val macroStage: MacroStage,
    val stepIndex: Int?,
    val totalSteps: Int?,
) {
    init {
        require(sessionId.isNotBlank() && stationId.isNotBlank() && encounterId.isNotBlank()) { "lesson position requires IDs" }
    }

    fun checkpoint(savedAtMs: Long): com.mathlearning.core.datastore.LessonCheckpoint =
        com.mathlearning.core.datastore.LessonCheckpoint(sessionId, stationId, encounterId, macroStage.name, savedAtMs)
}

/** N06-03 — P1 Teach/Discover states: zero grading pressure. */
enum class ShomaraTeachState { Ready, Interactive, AudioUnavailable, Loading, Playing, Failed, ReducedMotion }

object ShomaraTeachLogic {
    /** Audio unavailability NEVER blocks discovery — the visual prompt carries the step (CONTENT-017). */
    fun isBlocking(state: ShomaraTeachState): Boolean = false

    fun nextAfterInteraction(state: ShomaraTeachState): ShomaraTeachState = when (state) {
        ShomaraTeachState.Ready -> ShomaraTeachState.Interactive
        ShomaraTeachState.Failed -> ShomaraTeachState.Interactive // warm retry, never a dead end
        else -> state
    }
}

/** N06-03 — P2/P3 guided-practice states with scaffolding hints (allowed here, banned in P4/P5). */
enum class ShomaraGuidedState { Idle, Selected, Submitting, Correct, Retry, Recovery, Offline, Error }

data class ShomaraGuidedSession(
    val state: ShomaraGuidedState = ShomaraGuidedState.Idle,
    val selectedOptionId: String? = null,
    val hintLevel: Int = 0,
    val maxHintLevel: Int = 3,
) {
    init {
        require(hintLevel in 0..maxHintLevel) { "hint level out of range" }
    }

    val canRequestHint: Boolean
        get() = hintLevel < maxHintLevel && state != ShomaraGuidedState.Submitting

    fun select(optionId: String): ShomaraGuidedSession =
        copy(state = ShomaraGuidedState.Selected, selectedOptionId = optionId)

    fun submit(): ShomaraGuidedSession {
        require(state == ShomaraGuidedState.Selected) { "submit requires a selection" }
        return copy(state = ShomaraGuidedState.Submitting)
    }

    /** Correctness arrives from the server; the reducer only renders the given outcome. */
    fun onServerResult(correct: Boolean): ShomaraGuidedSession = when {
        correct -> copy(state = ShomaraGuidedState.Correct, selectedOptionId = selectedOptionId)
        else -> copy(state = ShomaraGuidedState.Retry)
    }

    fun requestHint(): ShomaraGuidedSession =
        if (canRequestHint) copy(hintLevel = hintLevel + 1) else this

    fun enterRecovery(): ShomaraGuidedSession = copy(state = ShomaraGuidedState.Recovery)
    fun goOffline(): ShomaraGuidedSession = copy(state = ShomaraGuidedState.Offline)
    fun fail(message: String): ShomaraGuidedSession = copy(state = ShomaraGuidedState.Error)
}
