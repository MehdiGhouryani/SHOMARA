package com.mathlearning.core.learning.hints

import com.mathlearning.core.learning.progression.PolicyArea
import com.mathlearning.core.learning.progression.PolicyGate
import com.mathlearning.core.model.MacroStage

/**
 * HintPolicyEngine (P6) — enforces the RECORDED hint contract, nothing invented:
 *  - hints are FORBIDDEN in the assessment stages (P4/P5) — recorded in the content contract
 *    (stage6 §5 / N06-03) and restated by the owner P6 mission ("ممنوعیت Hint در stageهای خاص");
 *  - in other stages, hint availability follows the content-provided ladder (ShomaraHintLadder
 *    levels come from content) — this engine only validates the ban + that a requested hint
 *    index exists in the content-provided ladder depth.
 * Rule version: `hint-policy:v1-assessment-ban` (recorded; CONTENT-003's open questions stay open).
 */
class HintPolicyEngine(private val gate: PolicyGate) {

    fun hintsAllowed(stage: MacroStage): Boolean {
        gate.requireApproved(PolicyArea.HINT_POLICY)
        return stage !in com.mathlearning.core.model.ShomaraMacroStages.HINT_BANNED
    }

    /** A hint request outside the content-provided ladder is invalid — never invented at runtime. */
    fun validHintIndex(stage: MacroStage, hintIndex: Int, contentLadderDepth: Int): Boolean {
        if (!hintsAllowed(stage)) return false
        return hintIndex in 0 until contentLadderDepth
    }
}
