package com.mathlearning.core.learning.recovery

import com.mathlearning.core.learning.engine.LessonSessionState
import com.mathlearning.core.model.MacroStage

/**
 * RecoverySelector (P6) — mistake-review mechanics per the ADR-0039 §6 APPROVED behaviour
 * ("mistake repetition at the end of the lesson"): collect the ENCOUNTER IDS answered wrongly,
 * in original order — the replay queue is a selection of IDs only. WHAT triggers a recovery
 * session (policy) stays behind the CONTENT-014 gate; selection of already-recorded mistakes is
 * mechanical.
 */
class RecoverySelector {

    fun mistakeEncounters(state: LessonSessionState): List<String> = state.mistakes

    /** Recovery replay excludes the assessment stages (assessment stays the quietest family). */
    fun replayQueue(state: LessonSessionState, stagesByEncounter: Map<String, MacroStage>): List<String> =
        state.mistakes.filter { encounterId ->
            stagesByEncounter[encounterId]?.let { it !in com.mathlearning.core.model.ShomaraMacroStages.HINT_BANNED } ?: true
        }.distinct()
}
