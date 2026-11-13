package com.mathlearning.core.learning.config

import com.mathlearning.core.learning.progression.LearningConfigRepository
import com.mathlearning.core.learning.progression.PolicyArea
import com.mathlearning.core.learning.progression.RecordedRuleVersions

/**
 * VersionedLearningConfigRepository (P6) — the engine's policy-handle store. Default wiring:
 * rule versions = the RECORDED versions (server-era drafts), all UNAPPROVED (CONTENT-014 gate).
 * Approval flips ONLY with evidence (owner decision) — engine decisions stay refused until then.
 */
class DefaultLearningConfigRepository(
    private val ruleVersions: Map<PolicyArea, String> = mapOf(
        PolicyArea.PROGRESSION to RecordedRuleVersions.RUNTIME_POLICY,
        PolicyArea.MASTERY to RecordedRuleVersions.RUNTIME_POLICY,
        PolicyArea.STATION_PASS to RecordedRuleVersions.STATION_PASS,
        PolicyArea.HINT_POLICY to "hint-policy:v1-assessment-ban",
    ),
    private val approvedAreas: Set<PolicyArea> = emptySet(),
) : LearningConfigRepository {

    override fun isApproved(policyArea: PolicyArea, ruleVersion: String): Boolean =
        policyArea in approvedAreas && ruleVersions[policyArea] == ruleVersion

    override fun ruleVersionFor(policyArea: PolicyArea): String? = ruleVersions[policyArea]
}
