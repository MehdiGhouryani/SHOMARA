package com.mathlearning.core.learning.progression

import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.evaluator.NextAction

/**
 * ProgressionEngine (P6) — mechanical progression ORDER + the policy gate. The ORDER of stages
 * and the prerequisite graph are structural (content-provided); WHAT COUNTS as mastery/unlock is
 * a CONTENT-014 decision: decisions run only behind [PolicyGate]. With the gate refused, the only
 * legal next actions are ADVANCE (manual, UI-initiated) and RETRY — recovery requires policy.
 */
class ProgressionEngine(private val gate: PolicyGate, private val graph: PrerequisiteGraph) {

    fun nextActionAfter(outcome: EvaluationOutcome, stage: com.mathlearning.core.model.MacroStage): NextAction {
        gate.requireApproved(PolicyArea.PROGRESSION)
        return when {
            outcome.correct -> NextAction.ADVANCE
            else -> NextAction.RETRY
        }
    }

    /** Unlock = prerequisite satisfaction. The GRAPH is structural; the unlock POLICY is gated. */
    fun isUnlocked(stationId: String, completedStations: Set<String>): Boolean {
        gate.requireApproved(PolicyArea.PROGRESSION)
        return graph.prerequisitesOf(stationId).all { it in completedStations }
    }
}

class MasteryEngine(private val gate: PolicyGate) {

    /** Mastery decisions are gated identically; evidence comes in as IDs-only attempt outcomes. */
    fun evaluateMastery(evidence: List<Boolean>): Boolean {
        gate.requireApproved(PolicyArea.MASTERY)
        // With an approved policy handle, the policy data itself (not this engine) supplies the
        // computation; the engine validates the evidence boundary only.
        require(evidence.isNotEmpty()) { "mastery evidence cannot be empty" }
        return evidence.all { it }
    }
}
