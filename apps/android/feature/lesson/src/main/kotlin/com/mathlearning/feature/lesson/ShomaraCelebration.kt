package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage

/**
 * S5 — the end-of-station moment and the stage intro card (STATION_BUILD_PHASES.md S5,
 * stage5 §4.1/§4.3/§4.4).
 *
 * Three rules are encoded here as pure data, because all three are invisible to a screenshot:
 *
 *  1. **One owner.** A celebration is a moment with one owner: it cannot start while the intro
 *     card is still up, and a second celebration cannot start on top of a running one. Two
 *     overlapping celebrations are the classic way a "reward" turns into noise.
 *  2. **The clock is the source's.** Round celebration ≤ 1.6s, station celebration ≤ 2.2s,
 *     intro card ≤ 1.5s. They are the stage5 numbers, not tuning knobs.
 *  3. **A station celebrates once.** A repeated request for the station-end celebration is
 *     rejected — re-showing it on every recomposition would reward nothing.
 */
enum class ShomaraCelebrationKind { None, RoundEnd, StationEnd }

data class ShomaraIntroCard(val stage: MacroStage, val shownAtMs: Long)

data class ShomaraCelebrationState(
    val intro: ShomaraIntroCard? = null,
    val kind: ShomaraCelebrationKind = ShomaraCelebrationKind.None,
    val startedAtMs: Long = 0L,
    val stationCelebrationShown: Boolean = false,
) {
    val isBusy: Boolean
        get() = intro != null || kind != ShomaraCelebrationKind.None
}

object ShomaraCelebrationGate {
    /** Stage5 §4.1: the stage intro card never outlives 1.5s. */
    const val INTRO_MAX_MS: Long = 1_500

    /** Stage5 §4.1: round celebration ≤ 1.6s. */
    const val ROUND_MAX_MS: Long = 1_600

    /** Stage5 §4.1: station celebration ≤ 2.2s. */
    const val STATION_MAX_MS: Long = 2_200

    fun durationMs(kind: ShomaraCelebrationKind): Long = when (kind) {
        ShomaraCelebrationKind.None -> 0L
        ShomaraCelebrationKind.RoundEnd -> ROUND_MAX_MS
        ShomaraCelebrationKind.StationEnd -> STATION_MAX_MS
    }

    /** A celebration may start only when nothing else owns the moment. */
    fun canCelebrate(state: ShomaraCelebrationState): Boolean = !state.isBusy

    /**
     * Start a celebration. Rejected — state returned unchanged, no exception, no queue — when
     * another moment owns the screen, or when the station has already celebrated its end.
     */
    fun celebrate(
        state: ShomaraCelebrationState,
        kind: ShomaraCelebrationKind,
        nowMs: Long,
    ): ShomaraCelebrationState {
        if (kind == ShomaraCelebrationKind.None) return state
        if (state.isBusy) return state
        if (kind == ShomaraCelebrationKind.StationEnd && state.stationCelebrationShown) return state
        return state.copy(
            kind = kind,
            startedAtMs = nowMs,
            stationCelebrationShown = state.stationCelebrationShown ||
                kind == ShomaraCelebrationKind.StationEnd,
        )
    }

    /** Show the stage intro card — again only when the moment is free. */
    fun showIntro(
        state: ShomaraCelebrationState,
        stage: MacroStage,
        nowMs: Long,
    ): ShomaraCelebrationState =
        if (state.isBusy) state else state.copy(intro = ShomaraIntroCard(stage, nowMs))

    /** Tapping the intro card dismisses it early; it can never dismiss a celebration. */
    fun dismissIntro(state: ShomaraCelebrationState): ShomaraCelebrationState =
        if (state.intro == null) state else state.copy(intro = null)

    /** Advance the clock: the intro card and the celebration expire on their own durations. */
    fun tick(state: ShomaraCelebrationState, nowMs: Long): ShomaraCelebrationState {
        var next = state
        val intro = next.intro
        if (intro != null && nowMs - intro.shownAtMs >= INTRO_MAX_MS) {
            next = next.copy(intro = null)
        }
        if (next.kind != ShomaraCelebrationKind.None &&
            nowMs - next.startedAtMs >= durationMs(next.kind)
        ) {
            next = next.copy(kind = ShomaraCelebrationKind.None)
        }
        return next
    }
}

/**
 * S5 — the particle budget (stage5 §4.1).
 *
 * The shape set is an enum of TWO members on purpose: the reward-economy iconography a child
 * product must never use is not representable in this type at all, so this layer cannot draw it
 * even by accident. Confetti is lines and dots, at most 24, alive at most 1.2s.
 */
enum class ShomaraParticleShape { Line, Dot }

data class ShomaraParticle(
    val index: Int,
    /** Horizontal position in 0..1 of the scene width (RTL-agnostic: it is a fraction). */
    val xFraction: Float,
    val yFraction: Float,
    val shape: ShomaraParticleShape,
)

object ShomaraParticleBudget {
    const val MAX_PARTICLES: Int = 24
    const val LIFE_MS: Long = 1_200

    /** How many particles this celebration uses (never more than the cap, never in reduced motion). */
    fun count(kind: ShomaraCelebrationKind, reducedMotion: Boolean): Int = when {
        reducedMotion -> 0
        kind == ShomaraCelebrationKind.RoundEnd -> 16
        kind == ShomaraCelebrationKind.StationEnd -> MAX_PARTICLES
        else -> 0
    }

    /**
     * Deterministic particle set: the same celebration always looks the same, so the motion can
     * be replayed in a test and a screenshot. Symmetric around the centre (mirror pairs), which
     * is the «ذرات تقارن‌دار» the phase plan asks for.
     */
    fun particles(kind: ShomaraCelebrationKind, reducedMotion: Boolean): List<ShomaraParticle> {
        val total = count(kind, reducedMotion)
        if (total == 0) return emptyList()
        val half = total / 2
        return (0 until total).map { index ->
            val mirror = index >= half
            val seed = (index % half) * 37 + 11
            val x = ((seed % 41) + 5) / 50f
            val y = ((seed * 7 % 23) + 4) / 30f
            ShomaraParticle(
                index = index,
                xFraction = if (mirror) 1f - x else x,
                yFraction = y,
                shape = if (index % 2 == 0) ShomaraParticleShape.Line else ShomaraParticleShape.Dot,
            )
        }
    }
}

/**
 * S5 — the celebration copy (stage5 §3 «جشن», the only approved sentences).
 *
 * Four win lines and two pre-assessment lines, taken verbatim from the shared reference. The
 * list is CLOSED: praise cannot drift into a reward economy because there is no other sentence
 * to select from, and the native design guard scans these sources for that vocabulary anyway.
 */
object ShomaraCelebrationCopy {
    val Win: List<String> = listOf(
        "آفرین، این مرحله تمام شد.",
        "این بخش را کامل کردی.",
        "خوب کار کردی.",
        "تمام شد؛ آفرین.",
    )

    /** Before an assessment there is NO celebration — only a calm hand-over. */
    val PreAssessment: List<String> = listOf(
        "حالا خودت امتحان کن.",
        "این بار بدون کمک.",
    )

    fun winLine(stationSeed: Int): String = Win[stationSeed.mod(Win.size)]

    fun preAssessmentLine(attempt: Int): String = PreAssessment[attempt.mod(PreAssessment.size)]

    /** Guard used by tests: only the approved sentences may ever reach the card. */
    fun isApprovedWinLine(text: String): Boolean = text in Win

    fun isApprovedPreAssessmentLine(text: String): Boolean = text in PreAssessment
}
