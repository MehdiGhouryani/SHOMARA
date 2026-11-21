package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraMacroStages

/**
 * S4 — the hint slot as a STAGE rule (STATION_BUILD_PHASES.md S4 + stage5 §5.2).
 *
 * The ladder itself lives in [ShomaraHintLadder] (attempt → level). This file adds the two
 * things S4 asks for and keeps them pure:
 *
 *  1. **Which levels may be offered in this stage.** Hints exist in P2 (guided) and P3
 *     (discover). P4/P5 are `HINT_BANNED` in [ShomaraMacroStages] — the ban is structural, so
 *     the answer there is an EMPTY set, not "hide the button".
 *  2. **When the button appears.** Only when the stage allows it AND the package actually
 *     carries content for the level the attempt asks for. No fabricated hint text.
 *
 * Open item (flagged, not decided): the S4 line in `STATION_BUILD_PHASES.md` also mentions
 * «فقط h1 در P4». That contradicts stage5 §5.2 and `ShomaraMacroStages.HINT_BANNED` (P4/P5 have
 * no hint slot at all), so this file follows the approved blueprint; if the owner wants h1 in
 * P4, HINT_BANNED must be changed first — one rule, one place, never two.
 */
object ShomaraHintGate {
    /**
     * The levels a stage may ever offer, regardless of content.
     *
     * P2 (guided) and P3 (game) carry the ladder — the S4 line «h1–h3 در P2/P3». P1 is
     * discovery: the child explores BEFORE any attempt, so a hint there would answer a question
     * nobody asked yet. P4/P5 are `HINT_BANNED` in [ShomaraMacroStages] — structural, not a
     * content gap.
     */
    fun allowedLevels(stage: MacroStage): Set<ShomaraHintLevel> = when (stage) {
        MacroStage.P2_GUIDED, MacroStage.P3_GAME ->
            setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3)
        MacroStage.P1_DISCOVER,
        MacroStage.P4_ASSESSMENT,
        MacroStage.P5_TRANSFER,
        -> emptySet()
    }

    /** The level this attempt may show in this stage, or null when nothing is legal/available. */
    fun levelFor(
        attempt: Int,
        stage: MacroStage,
        availableLevels: Set<ShomaraHintLevel>,
    ): ShomaraHintLevel? {
        val allowed = allowedLevels(stage)
        if (allowed.isEmpty()) return null
        return ShomaraHintLadder.hintFor(attempt, availableLevels intersect allowed)
    }

    /** The hint control is visible only when a real level is legal and available. */
    fun showsButton(
        attempt: Int,
        stage: MacroStage,
        availableLevels: Set<ShomaraHintLevel>,
    ): Boolean = levelFor(attempt, stage, availableLevels) != null

    /**
     * The ladder never goes backwards: a child who has reached h2 on this item keeps h2 even
     * after a wrong answer (attempt 3 → h2, attempt 4 → h3, never h1 again).
     */
    fun isMonotonic(levels: List<ShomaraHintLevel?>): Boolean {
        val ranks = levels.map { rank(it) }
        return ranks.zipWithNext().all { (a, b) -> b >= a }
    }

    private fun rank(level: ShomaraHintLevel?): Int = when (level) {
        null, ShomaraHintLevel.Retry -> 0
        ShomaraHintLevel.H1 -> 1
        ShomaraHintLevel.H2 -> 2
        ShomaraHintLevel.H3 -> 3
    }
}

/**
 * S4 — «دوباره بشنو» (replay narration).
 *
 * Replay is a hearing aid, never a mistake: it is available in every state (including during
 * feedback), it is not counted as an attempt, it never marks the item «helped», and it cannot
 * exhaust — a child who needs to hear the question five times must be able to hear it five
 * times.
 */
data class ShomaraNarrationReplay(
    val lastKey: String? = null,
    val replayCount: Int = 0,
) {
    /** A replay is possible only when something has been narrated (no empty button). */
    val canReplay: Boolean
        get() = lastKey != null

    /** Remember what is being narrated; does not touch the replay counter. */
    fun remember(utteranceKey: String): ShomaraNarrationReplay = copy(lastKey = utteranceKey)

    /**
     * Replay the last utterance. Returns the queue request key (never a penalty) — the counter
     * exists for diagnostics only and is never read by the evaluator.
     */
    fun replay(nowMs: Long, queue: ShomaraAudioQueue): Pair<ShomaraNarrationReplay, ShomaraAudioQueue> {
        val key = lastKey ?: return this to queue
        return copy(replayCount = replayCount + 1) to queue.request(key, nowMs)
    }
}
