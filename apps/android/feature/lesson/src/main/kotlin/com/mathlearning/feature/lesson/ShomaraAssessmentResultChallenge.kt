package com.mathlearning.feature.lesson

import com.mathlearning.core.model.AttemptTelemetry
import com.mathlearning.core.model.MacroStage

/**
 * N06-04 independent assessment (P4/P5): zero hints, duplicate-tap blocking via the submitting
 * lock, deterministic idempotency key per (sessionId, encounterId, attemptIndex).
 */
enum class ShomaraAssessmentState { Idle, Selected, Submitting, Result, Disconnect, Resume, Expired }

data class ShomaraAssessmentSession(
    val state: ShomaraAssessmentState = ShomaraAssessmentState.Idle,
    val sessionId: String,
    val encounterId: String,
    val macroStage: MacroStage = MacroStage.P4_ASSESSMENT,
    val attemptIndex: Int = 1,
    val selectedOptionId: String? = null,
    val serverNextAction: String? = null,
) {
    init {
        require(macroStage in setOf(MacroStage.P4_ASSESSMENT, MacroStage.P5_TRANSFER)) {
            "independent assessment is P4/P5 only — hints are banned here"
        }
        require(attemptIndex >= 1) { "attempt index starts at 1" }
    }

    val zeroHints: Boolean
        get() = true

    val telemetry: AttemptTelemetry
        get() = AttemptTelemetry(sessionId, encounterId, "${macroStage.name}_SELECT", selectedOptionId, macroStage)

    fun select(optionId: String): ShomaraAssessmentSession =
        if (state == ShomaraAssessmentState.Submitting) this else copy(state = ShomaraAssessmentState.Selected, selectedOptionId = optionId)

    fun startSubmit(): ShomaraAssessmentSession {
        require(state == ShomaraAssessmentState.Selected && selectedOptionId != null) { "submit requires a selection" }
        return copy(state = ShomaraAssessmentState.Submitting)
    }

    /** Duplicate-tap guard: calls while submitting return the SAME session unchanged. */
    fun guardDuplicateTap(): ShomaraAssessmentSession = if (state == ShomaraAssessmentState.Submitting) this else this

    fun onDisconnect(): ShomaraAssessmentSession = if (state == ShomaraAssessmentState.Submitting) copy(state = ShomaraAssessmentState.Disconnect) else this

    /** Resume after disconnect: the SAME attemptIndex replays with the SAME idempotency key. */
    fun resumeForRetry(): ShomaraAssessmentSession = when (state) {
        ShomaraAssessmentState.Disconnect -> copy(state = ShomaraAssessmentState.Resume)
        else -> this
    }

    fun onServerResult(nextAction: String, correct: Boolean?): ShomaraAssessmentSession =
        copy(state = ShomaraAssessmentState.Result, serverNextAction = nextAction)

    fun onExpired(): ShomaraAssessmentSession = copy(state = ShomaraAssessmentState.Expired)
}

/**
 * N06-05 recovery/result: next-step transitions are 100% server-owned. The client maps the
 * server's nextAction onto a surface; it never calculates mastery or unlocks stations.
 */
enum class ShomaraResultSurface { Advance, Retry, RecoverGuided, CompletePass, CompleteNeedsPractice, Unknown }

object ShomaraResultLogic {
    private val known = setOf("ADVANCE", "RETRY", "RECOVER_GUIDED", "COMPLETE_PASS", "COMPLETE_NEEDS_PRACTICE")

    fun surfaceFor(nextAction: String): ShomaraResultSurface = when (nextAction) {
        "ADVANCE" -> ShomaraResultSurface.Advance
        "RETRY" -> ShomaraResultSurface.Retry
        "RECOVER_GUIDED" -> ShomaraResultSurface.RecoverGuided
        "COMPLETE_PASS" -> ShomaraResultSurface.CompletePass
        "COMPLETE_NEEDS_PRACTICE" -> ShomaraResultSurface.CompleteNeedsPractice
        else -> ShomaraResultSurface.Unknown
    }

    /** Warm, non-punitive copy per surface (AGENTS rule 9); wrong answers never shame. */
    fun headlineFor(surface: ShomaraResultSurface): String = when (surface) {
        ShomaraResultSurface.Advance -> "آفرین! ادامه بده."
        ShomaraResultSurface.Retry -> "ایراد نداره؛ یک بار دیگه تلاش کن."
        ShomaraResultSurface.RecoverGuided -> "بیا با هم نگاهش کنیم."
        ShomaraResultSurface.CompletePass -> "این ایستگاه رو کامل کردی!"
        ShomaraResultSurface.CompleteNeedsPractice -> "خوب پیش رفتی؛ با یه تمرین دیگه محکم‌ترش می‌کنیم."
        ShomaraResultSurface.Unknown -> "در حال بررسی پاسخ سرور…"
    }

    fun isServerKnown(nextAction: String): Boolean = nextAction in known
}

/**
 * N06-06 challenge player: STRICTLY separated from station mastery. Round timers are
 * non-punitive (respecting reducedMotion), completion grants no reward-economy items, and a
 * challenge result never changes station unlock state.
 */
enum class ShomaraChallengeState { Unavailable, Intro, Round, Submitting, Retry, Result, Offline }

data class ShomaraChallengeSession(
    val state: ShomaraChallengeState = ShomaraChallengeState.Unavailable,
    val round: Int = 0,
    val totalRounds: Int = 0,
    val remainingMs: Long = 0L,
    val reducedMotion: Boolean = false,
) {
    init {
        require(round >= 0 && totalRounds >= 0) { "round counters are non-negative" }
    }

    val timerVisible: Boolean
        get() = state == ShomaraChallengeState.Round && !reducedMotion

    /** Non-punitive timer: expiring never shames — it simply ends the round warmly. */
    fun onTimerExpire(): ShomaraChallengeSession = copy(state = ShomaraChallengeState.Result, remainingMs = 0)

    fun startIntro(totalRounds: Int): ShomaraChallengeSession {
        require(totalRounds > 0) { "challenge needs rounds" }
        return copy(state = ShomaraChallengeState.Intro, round = 0, totalRounds = totalRounds)
    }

    fun startRound(remainingMs: Long): ShomaraChallengeSession {
        require(state == ShomaraChallengeState.Intro || state == ShomaraChallengeState.Submitting || state == ShomaraChallengeState.Round) {
            "rounds start from intro"
        }
        return copy(state = ShomaraChallengeState.Round, round = (round + 1).coerceAtMost(totalRounds), remainingMs = remainingMs)
    }

    fun submit(): ShomaraChallengeSession = copy(state = ShomaraChallengeState.Submitting)

    fun onRoundResult(): ShomaraChallengeSession = copy(state = ShomaraChallengeState.Result)

    fun goOffline(): ShomaraChallengeSession = copy(state = ShomaraChallengeState.Offline)

    /** Challenge NEVER mutates station mastery: no unlock/complete API exists on this type. */
    val affectsStationMastery: Boolean
        get() = false
}
