package com.mathlearning.core.model

/**
 * B13 — calibration values as ONE versioned local config point (CONTENT-011).
 *
 * Every value below is an INITIAL value quoted from the pilot and the authoring contracts,
 * NOT an approved value: device, child and educator evidence is required before any of them
 * may be called approved (AUTHORING_CONTRACT_GAPS.md §4: versioned config token, safe
 * fallback, approval by evidence). Nothing in this file is a hardcode the UI depends on for
 * correctness — the values are defaults a caller may override, and the adapters still read
 * [ServerLearningConfig.DEFAULT] today; the swap to this local config happens after O2
 * settles the package schema.
 */
data class ShomaraLocalCalibration(
    /** Config version: bump when any value changes, so a stale bundle is detectable. */
    val version: Int = 1,
    /** Idle replay delay for guide audio, seconds (pilot `idle_replay_s: 8`). */
    val idleReplaySeconds: Int = 8,
    /** Trace tolerance for T13, dp (pilot `tolerance_dp: 28`; CONTENT-001 direction is separate). */
    val traceToleranceDp: Int = 28,
    /** The three timing slots quoted as 250/350/450ms (authoring contract §4). Their roles
     * are unnamed in the source — the slots are preserved as-is, never relabelled as approved. */
    val timingSlotsMs: List<Long> = listOf(250L, 350L, 450L),
    /** Narrator speech rate, percent (pilot `rate: -15%`). */
    val narratorRatePercent: Int = -15,
    /** Assessment pass threshold, of the pool (pilot «۳ از ۴»). */
    val assessmentPassThreshold: Int = 3,
    /** Assessment pool size the threshold is read against. */
    val assessmentPoolSize: Int = 4,
    /** The three audio budgets quoted as 30/12/3 (authoring contract §4: LUFS/ducking).
     * Their roles are unnamed in the source — preserved as-is, never relabelled as approved. */
    val audioBudgets: List<Int> = listOf(30, 12, 3),
    /** Jump question counts, mirrored from [ServerLearningConfig.DEFAULT] (CONTENT-002/014):
     * station-jump 1 and chapter-jump 5 are BOTH draft and in conflict (C9) — neither is the
     * approved number, and [ShomaraJumpAssessment] takes the count as a parameter instead. */
    val stationJumpQuestionCount: Int = 1,
    val chapterJumpQuestionCount: Int = 5,
    /** Maximum simultaneous sound effects (stage5 §6.3). Initial value only — NOT approved
     * (CONTENT-011). Read by the audio manager's maxSimultaneousEffects getter; the manager
     * used to hardcode this number while claiming it was configurable (R-07). */
    val maxSimultaneousEffects: Int = 3,
    /** Narrator ducking in dB while the narrator speaks (stage5 §6.3). Initial value only —
     * NOT approved (CONTENT-011). Read by the audio manager's narratorDuckingDb getter. */
    val narratorDuckingDb: Int = 12,
) {
    init {
        require(version >= 1) { "calibration version must be positive" }
        require(idleReplaySeconds >= 0) { "idle replay must not be negative" }
        require(traceToleranceDp >= 0) { "trace tolerance must not be negative" }
        require(timingSlotsMs.size == 3) { "exactly three timing slots are quoted" }
        require(assessmentPassThreshold in 0..assessmentPoolSize) { "pass threshold outside the pool" }
        require(audioBudgets.size == 3) { "exactly three audio budgets are quoted" }
        require(stationJumpQuestionCount > 0 && chapterJumpQuestionCount > 0) { "jump counts must be positive" }
        require(maxSimultaneousEffects > 0) { "at most one simultaneous effect is required" }
        require(narratorDuckingDb >= 0) { "narrator ducking must not be negative" }
    }

    companion object {
        /** The single default instance — the initial values, not approved values. */
        val Default: ShomaraLocalCalibration = ShomaraLocalCalibration()
    }
}
