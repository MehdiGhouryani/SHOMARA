package com.mathlearning.core.learning.progression

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
