package com.mathlearning.feature.practice

import com.mathlearning.core.model.StationId

/**
 * B10 — practice-set structure (S14): a set of items from an abstract pool + the spiral rule.
 *
 * `size` is configurable; 6 is the pilot draft value, NOT approved. `poolRef` names the pool
 * the set draws from (a station id) — the pool itself arrives only with O1/O2 + human
 * approval. The spiral rule («≥1 item from threads ST01–ST06») is a structure rule, not
 * content: [build] takes at least one item from each thread first, then fills round-robin.
 *
 * No item is ever fabricated: when the pools hold fewer items than [size], the set is
 * shorter — a short honest set, never padding.
 */
data class ShomaraPracticeSet(
    val size: Int = DEFAULT_SIZE,
    val poolRef: StationId,
    val spiralRule: String = SPIRAL_RULE,
) {
    init {
        require(size > 0) { "practice set needs at least one item" }
    }

    companion object {
        /** Pilot draft size — configurable, not approved. */
        const val DEFAULT_SIZE: Int = 6

        /** The spiral rule, as quoted: at least one item from each of the ST01–ST06 threads. */
        const val SPIRAL_RULE: String = "≥1 item from threads ST01–ST06"

        /**
         * Builds a set from thread pools (thread id → item ids). Deterministic: one item per
         * thread in pool order first (the spiral), then round-robin fill until [size].
         * Items are abstract ids; no correctness, no mastery, no content is decided here.
         */
        fun build(threadPools: Map<String, List<String>>, size: Int = DEFAULT_SIZE): List<String> {
            require(size > 0) { "practice set needs at least one item" }
            val picked = mutableListOf<String>()
            val remaining = threadPools.mapValues { it.value.toMutableList() }
            // Spiral pass: at least one item from each thread.
            for ((_, items) in remaining) {
                if (picked.size >= size) break
                if (items.isNotEmpty()) picked += items.removeAt(0)
            }
            // Fill pass: round-robin over what is left, until the set is full.
            while (picked.size < size) {
                var added = false
                for ((_, items) in remaining) {
                    if (picked.size >= size) break
                    if (items.isNotEmpty()) {
                        picked += items.removeAt(0)
                        added = true
                    }
                }
                if (!added) break
            }
            return picked
        }
    }
}
