package com.mathlearning.feature.lesson

/**
 * B6 — pure P4 assessment draw over abstract ids.
 *
 * `draw` returns exactly one item per family, never repeats an item from the last attempt,
 * and returns an honest error when a family has no fresh item — never a hidden repeat.
 * Families and items are abstract ids (tests use «F1/a»); binding to the real 26-item P4
 * pool needs O2 + human approval + the CONTENT-003 fix.
 *
 * A pool with fewer families than `count` is a caller error, not a shorter draw: the pool
 * is refused loudly instead of silently returning fewer items than the caller asked for.
 *
 * The draw is deterministic (first fresh item per family, in pool order): shuffling is the
 * evaluator's job when it owns the draw, not this pure function's.
 */
object ShomaraAssessmentDraw {
    sealed class DrawResult {
        data class Drawn(val items: List<String>) : DrawResult()
        /** A family with no fresh item left — the caller must say so, not repeat silently. */
        data class MissingFreshItem(val family: String) : DrawResult()
    }

    fun draw(
        pool: Map<String, List<String>>,
        seenLastAttempt: Set<String>,
        count: Int = 4,
    ): DrawResult {
        require(count > 0) { "draw count must be positive" }
        require(pool.size >= count) { "draw needs at least $count families, pool has ${pool.size}" }
        val drawn = mutableListOf<String>()
        for ((family, items) in pool.entries.take(count)) {
            val fresh = items.firstOrNull { it !in seenLastAttempt }
                ?: return DrawResult.MissingFreshItem(family)
            drawn += fresh
        }
        return DrawResult.Drawn(drawn)
    }
}
