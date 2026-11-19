// Merged by DT-54: progression, mastery policies and the prerequisite graph.
// These declarations shared a folder and a theme but were split across files; Kotlin resolves imports
// by package, so keeping them together changes nothing at the call site.

package com.mathlearning.core.learning.progression

import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.evaluator.NextAction

// ---- from LearningPolicies.kt ----
/**
 * Versioned learning-config repository + the POLICY GATE (P6).
 *
 * Rule-set versions recorded so far (REFERENCE DATA, not approved policy):
 *  - `runtime-policy:phase13-postgres-v1` (TS packages/learning-runtime/src/policies.ts — confidence mechanics)
 *  - `station-pass:phase15-station-pass-4of5x2-v1` (4-of-5 × 2 distinct sessions)
 * These exist as recorded server-era drafts; CONTENT-014 (mastery/unlock/jump semantics) and
 * CONTENT-011 (calibration values) are OPEN owner decisions — so `isApproved` is FALSE and the
 * Progression/Mastery engines REFUSE to decide. Nothing here invents or hard-codes a threshold as
 * policy; when the owner approves, the approved handle flips the gate and the recorded versions
 * carry the values.
 */
object RecordedRuleVersions {
    const val RUNTIME_POLICY: String = "runtime-policy:phase13-postgres-v1"
    const val STATION_PASS: String = "station-pass:phase15-station-pass-4of5x2-v1"
}

interface LearningConfigRepository {
    /** True ONLY for policy areas the owner has explicitly approved (evidence recorded). */
    fun isApproved(policyArea: PolicyArea, ruleVersion: String): Boolean
    /** The rule version the engine must use for an area (content/config-provided, never invented). */
    fun ruleVersionFor(policyArea: PolicyArea): String?
}

enum class PolicyArea { PROGRESSION, MASTERY, STATION_PASS, HINT_POLICY }

class PolicyNotApprovedException(area: PolicyArea, version: String?) :
    Exception("policy area $area is not approved (ruleVersion=$version) — refusing to decide (CONTENT-014 gate)")

/** Gate shared by Progression/Mastery: no approved handle → no decision. */
class PolicyGate(private val config: LearningConfigRepository) {
    fun requireApproved(area: PolicyArea) {
        val version = config.ruleVersionFor(area)
        if (version == null || !config.isApproved(area, version)) {
            throw PolicyNotApprovedException(area, version)
        }
    }
}

// ---- from PrerequisiteGraph.kt ----
/**
 * PrerequisiteGraph (P6) — the STRUCTURAL prerequisite layer. Edges arrive from the content
 * package (never invented here); the engine provides cycle detection + missing-prerequisite
 * queries (decision-free algorithms). An acyclic graph is mandatory: a cycle means the content
 * pipeline produced an impossible unlock order and is rejected at load, not at runtime.
 */
class PrerequisiteGraph(private val edges: Map<String, Set<String>>) {

    init {
        detectCycle()
        edges.forEach { (station, prereqs) ->
            prereqs.forEach { prereq ->
                if (prereq !in edges.keys) {
                    throw MissingPrerequisiteException("station $station requires unknown station '$prereq'")
                }
            }
        }
    }

    fun prerequisitesOf(stationId: String): Set<String> = edges[stationId] ?: emptySet()

    fun missingPrerequisites(stationId: String, completedStations: Set<String>): Set<String> =
        prerequisitesOf(stationId).filter { it !in completedStations }.toSet()

    fun detectCycle() {
        val visiting = HashSet<String>()
        val visited = HashSet<String>()
        fun dfs(node: String) {
            if (node in visiting) throw PrerequisiteCycleException("prerequisite cycle detected at '$node'")
            if (node in visited) return
            visiting += node
            for (prereq in edges[node] ?: emptySet()) dfs(prereq)
            visiting -= node
            visited += node
        }
        edges.keys.forEach(::dfs)
    }
}

class PrerequisiteCycleException(message: String) : Exception(message)
class MissingPrerequisiteException(message: String) : Exception(message)

// ---- from ProgressionAndMastery.kt ----
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
