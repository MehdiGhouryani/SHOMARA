package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraMacroStages

/**
 * B5 — hint ladder + hint slot (stage5 §5.2), without any hint text.
 *
 * Ladder: attempt 1 → retry (no hint); 2 → h1; 3 → h2; 4 → h3. The ladder produces only the
 * REQUESTED hint level: when that level has no content, [hintFor] returns null and the item
 * is NOT marked «helped». A hint event is recorded only when a real hint is shown
 * (stage5 §6.4) — see [shouldRecordHintEvent].
 *
 * The slot rule: in P2/P3 the slot exists but is invisible and inactive while no hint content
 * exists (no fabricated text); in P4/P5 there is NO hint slot at all (HINT_BANNED —
 * [ShomaraMacroStages.HINT_BANNED]).
 *
 * No hint text is written here: the `ST07.S.*` texts enter the package only after human
 * approval + O2. This file only names levels.
 */
enum class ShomaraHintLevel { Retry, H1, H2, H3 }

object ShomaraHintLadder {
    /** The level an attempt asks for — a request, not content. */
    fun levelFor(attempt: Int): ShomaraHintLevel = when {
        attempt <= 1 -> ShomaraHintLevel.Retry
        attempt == 2 -> ShomaraHintLevel.H1
        attempt == 3 -> ShomaraHintLevel.H2
        else -> ShomaraHintLevel.H3
    }

    /**
     * The level to show, or null when it has no content. `availableLevels` is the set of
     * levels the package actually carries for this item — today that set is empty, so this
     * returns null and the slot stays invisible.
     */
    fun hintFor(attempt: Int, availableLevels: Set<ShomaraHintLevel>): ShomaraHintLevel? {
        val level = levelFor(attempt)
        if (level == ShomaraHintLevel.Retry) return null
        return if (level in availableLevels) level else null
    }

    /** The slot is visible only when a real hint level is available for this attempt. */
    fun slotVisible(attempt: Int, availableLevels: Set<ShomaraHintLevel>): Boolean =
        hintFor(attempt, availableLevels) != null

    /** P4/P5 have no hint slot at all — the ban is structural, not a content gap. */
    fun slotAllowed(stage: MacroStage): Boolean = stage !in ShomaraMacroStages.HINT_BANNED

    /** A hint event is recorded only when a real hint was shown. */
    fun shouldRecordHintEvent(shownLevel: ShomaraHintLevel?): Boolean = shownLevel != null
}
