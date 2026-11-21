package com.mathlearning.feature.lesson

/**
 * S4 — the narration queue (STATION_BUILD_PHASES.md S4, stage5 §6.3).
 *
 * The problem this solves: a five-year-old taps fast. Without a rule, five taps in 900ms queue
 * five narrations and the child hears stale text for the next four seconds while the screen has
 * already moved on. The rule (S4 acceptance, «برش ≤۴۵۰ms»):
 *
 *  - a narration that has been speaking for at least [MAX_BREAK_MS] is cut IMMEDIATELY when a
 *    newer request arrives;
 *  - a narration younger than that is given at most [MAX_BREAK_MS] of air, then cut;
 *  - rapid requests COLLAPSE: only the newest request survives, so the queue can never grow
 *    into a backlog of stale speech;
 *  - on suspend/exit everything is cut at once ([cutNow]) — no audio outlives the station.
 *
 * Pure data: no player, no coroutine, no Android API, so the timing rule is provable in JVM
 * tests (a device cannot prove it deterministically).
 */
data class ShomaraNarration(
    /** Content key of the utterance (the package key, never the text). */
    val utteranceKey: String,
    val startedAtMs: Long,
) {
    fun spokenFor(nowMs: Long): Long = (nowMs - startedAtMs).coerceAtLeast(0L)
}

data class ShomaraAudioQueue(
    val speaking: ShomaraNarration? = null,
    /** The single pending request (the newest one) — the queue is capped at one by design. */
    val pending: String? = null,
    /** Timestamp at which the speaking narration must be cut, or null when it plays to its end. */
    val cutAtMs: Long? = null,
) {
    /** Nothing is speaking and nothing is waiting. */
    val isIdle: Boolean
        get() = speaking == null && pending == null

    /**
     * Ask to narrate [utteranceKey] now.
     *
     * Returns the queue whose `speaking` is the newest request whenever it may start at once, or
     * whose `pending` holds it until [tick] cuts the current narration at the 450ms floor.
     */
    fun request(utteranceKey: String, nowMs: Long): ShomaraAudioQueue = when (val current = speaking) {
        null -> copy(speaking = ShomaraNarration(utteranceKey, nowMs), pending = null, cutAtMs = null)
        else -> if (current.spokenFor(nowMs) >= MAX_BREAK_MS) {
            // It has had its floor: cut now, start the new one.
            copy(speaking = ShomaraNarration(utteranceKey, nowMs), pending = null, cutAtMs = null)
        } else {
            // Give it up to the floor, then swap. A newer request replaces the pending one —
            // this is the collapse that keeps fast taps coherent.
            copy(pending = utteranceKey, cutAtMs = current.startedAtMs + MAX_BREAK_MS)
        }
    }

    /**
     * Advance the clock. Applies the scheduled cut: the pending request takes over exactly at
     * the floor, never later.
     */
    fun tick(nowMs: Long): ShomaraAudioQueue {
        val cut = cutAtMs ?: return this
        if (nowMs < cut) return this
        val next = pending ?: return copy(cutAtMs = null)
        return copy(speaking = ShomaraNarration(next, cut), pending = null, cutAtMs = null)
    }

    /** The narration reached its natural end: free the channel (a pending request may start). */
    fun finished(nowMs: Long): ShomaraAudioQueue {
        val next = pending
        return if (next == null) {
            copy(speaking = null, cutAtMs = null)
        } else {
            copy(speaking = ShomaraNarration(next, nowMs), pending = null, cutAtMs = null)
        }
    }

    /**
     * Suspend/exit: everything stops at once. The station must never keep talking after the
     * child has left it (S4 acceptance: «قطع TTS تعلیق/خروج»).
     */
    fun cutNow(): ShomaraAudioQueue = copy(speaking = null, pending = null, cutAtMs = null)

    companion object {
        /**
         * The announcement is allowed to stay 450ms past a newer request. This is the S4
         * acceptance number, not a tuning knob.
         */
        const val MAX_BREAK_MS: Long = 450
    }
}

/**
 * The effect channel budget (stage5 §6.3): at most three simultaneous effects, and the narrator
 * ducks them by [ShomaraAudioManager.narratorDuckingDb]. The fourth effect is dropped — it is
 * never queued, because a delayed tap sound is worse than no tap sound.
 */
object ShomaraEffectBudget {
    fun accepts(simultaneousEffects: Int, maxEffects: Int = ShomaraAudioManager.MAX_SIMULTANEOUS_EFFECTS): Boolean =
        simultaneousEffects < maxEffects

    /** The narrator is speaking: effects duck (they are never silenced). */
    fun shouldDuck(queue: ShomaraAudioQueue): Boolean = queue.speaking != null
}

/**
 * The feedback-sound policy per station. `STATION_BUILD_PHASES.md` S4 requires one station to
 * run silent («سکوت S13»): the tracing station gives feedback with the ring and the trail, not
 * with a sound. The table is data so the evaluator/UI never decides it.
 *
 * NOTE — open item: ST13's own spec is not authored yet, so this entry follows the S4 line as
 * written and must be cross-checked against `ST13.md` when that spec lands (recorded in the
 * WORKLOG, not silently resolved).
 */
object ShomaraFeedbackSound {
    private val silentStations: Set<String> = setOf("ST13")

    fun playsSound(stationId: String): Boolean = stationId !in silentStations

    fun silentStations(): Set<String> = silentStations.toSet()
}
