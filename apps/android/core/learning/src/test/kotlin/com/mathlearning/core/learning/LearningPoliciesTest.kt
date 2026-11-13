package com.mathlearning.core.learning

import com.mathlearning.core.learning.config.DefaultLearningConfigRepository
import com.mathlearning.core.learning.evaluator.NextAction
import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.hints.HintPolicyEngine
import com.mathlearning.core.learning.progression.MasteryEngine
import com.mathlearning.core.learning.progression.MissingPrerequisiteException
import com.mathlearning.core.learning.progression.PolicyArea
import com.mathlearning.core.learning.progression.PolicyGate
import com.mathlearning.core.learning.progression.PolicyNotApprovedException
import com.mathlearning.core.learning.progression.PrerequisiteCycleException
import com.mathlearning.core.learning.progression.PrerequisiteGraph
import com.mathlearning.core.learning.progression.ProgressionEngine
import com.mathlearning.core.learning.progression.RecordedRuleVersions
import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Policy-gate tests (P6): with the recorded DRAFT rule versions and NO owner approval, every
 * learning decision REFUSES (CONTENT-014 gate). Mechanics prove out only with a TEST-approved
 * handle — test data, never shipped policy.
 */
class LearningPoliciesTest {

    private class TestApprovedConfig(private val approved: Set<PolicyArea>) : com.mathlearning.core.learning.progression.LearningConfigRepository {
        private val versions = mapOf(
            PolicyArea.PROGRESSION to "test-policy-v1",
            PolicyArea.MASTERY to "test-policy-v1",
            PolicyArea.STATION_PASS to "test-station-pass-v1",
            PolicyArea.HINT_POLICY to "hint-policy:v1-assessment-ban",
        )
        override fun isApproved(policyArea: PolicyArea, ruleVersion: String): Boolean =
            policyArea in approved && versions[policyArea] == ruleVersion
        override fun ruleVersionFor(policyArea: PolicyArea): String? = versions[policyArea]
    }

    private val graph = PrerequisiteGraph(
        mapOf(
            "ST01" to emptySet(),
            "ST02" to setOf("ST01"),
            "ST03" to setOf("ST02"),
        ),
    )

    @Test
    fun `default config records the server-era draft versions and approves NOTHING`() {
        val config = DefaultLearningConfigRepository()
        assertEquals(RecordedRuleVersions.RUNTIME_POLICY, config.ruleVersionFor(PolicyArea.PROGRESSION))
        assertEquals(RecordedRuleVersions.STATION_PASS, config.ruleVersionFor(PolicyArea.STATION_PASS))
        for (area in PolicyArea.values()) {
            assertFalse(config.isApproved(area, config.ruleVersionFor(area)!!))
        }
    }

    @Test
    fun `progression and mastery refuse to decide while CONTENT-014 is unapproved`() {
        val config = DefaultLearningConfigRepository()
        val gate = PolicyGate(config)
        val progression = ProgressionEngine(gate, graph)
        val mastery = MasteryEngine(gate)
        val outcome = EvaluationOutcome(correct = true, nextAction = NextAction.ADVANCE, evaluatorVersion = "test")
        val thrown = assertThrows(PolicyNotApprovedException::class.java) { progression.nextActionAfter(outcome, MacroStage.P1_DISCOVER) }
        assertTrue(thrown.message!!.contains("CONTENT-014"))
        assertThrows(PolicyNotApprovedException::class.java) { progression.isUnlocked("ST02", completedStations = setOf("ST01")) }
        assertThrows(PolicyNotApprovedException::class.java) { mastery.evaluateMastery(listOf(true, true)) }
    }

    @Test
    fun `with a test-approved handle the mechanics behave - and the gate version must match`() {
        val config = TestApprovedConfig(approved = setOf(PolicyArea.PROGRESSION, PolicyArea.MASTERY, PolicyArea.HINT_POLICY))
        val progression = ProgressionEngine(PolicyGate(config), graph)
        val correct = EvaluationOutcome(correct = true, nextAction = NextAction.ADVANCE, evaluatorVersion = "test")
        val wrong = EvaluationOutcome(correct = false, nextAction = NextAction.RETRY, evaluatorVersion = "test")
        assertEquals(NextAction.ADVANCE, progression.nextActionAfter(correct, MacroStage.P2_GUIDED))
        assertEquals(NextAction.RETRY, progression.nextActionAfter(wrong, MacroStage.P2_GUIDED))
        assertTrue(progression.isUnlocked("ST02", completedStations = setOf("ST01")))
        assertFalse(progression.isUnlocked("ST03", completedStations = setOf("ST01")))

        val mastery = MasteryEngine(PolicyGate(config))
        assertTrue(mastery.evaluateMastery(listOf(true, true, true)))
        assertFalse(mastery.evaluateMastery(listOf(true, false)))
    }

    @Test
    fun `prerequisite graph - cycles and unknown prerequisites are construction-time failures`() {
        assertThrows(PrerequisiteCycleException::class.java) {
            PrerequisiteGraph(mapOf("ST01" to setOf("ST03"), "ST02" to setOf("ST01"), "ST03" to setOf("ST02")))
        }
        assertThrows(MissingPrerequisiteException::class.java) {
            PrerequisiteGraph(mapOf("ST01" to setOf("ST99")))
        }
    }

    @Test
    fun `hint policy - the recorded assessment ban is enforced and ladder depth is content-owned`() {
        val config = TestApprovedConfig(approved = setOf(PolicyArea.HINT_POLICY))
        val hints = HintPolicyEngine(PolicyGate(config))
        assertFalse(hints.hintsAllowed(MacroStage.P4_ASSESSMENT))
        assertFalse(hints.hintsAllowed(MacroStage.P5_TRANSFER))
        assertTrue(hints.hintsAllowed(MacroStage.P2_GUIDED))
        assertTrue(hints.validHintIndex(MacroStage.P2_GUIDED, hintIndex = 2, contentLadderDepth = 3))
        assertFalse(hints.validHintIndex(MacroStage.P4_ASSESSMENT, hintIndex = 0, contentLadderDepth = 3))
        assertFalse(hints.validHintIndex(MacroStage.P2_GUIDED, hintIndex = 5, contentLadderDepth = 3))
        // Unapproved hint policy: even the ban query refuses (all decisions behind the gate).
        val unapproved = HintPolicyEngine(PolicyGate(DefaultLearningConfigRepository()))
        assertThrows(PolicyNotApprovedException::class.java) { unapproved.hintsAllowed(MacroStage.P4_ASSESSMENT) }
    }

    @Test
    fun `recovery selection is mechanical - mistakes in order, assessment excluded`() {
        val selector = com.mathlearning.core.learning.recovery.RecoverySelector()
        val state = com.mathlearning.core.learning.engine.LessonSessionState(
            sessionId = "s1", stationId = "ST07",
            stageOrder = listOf(MacroStage.P1_DISCOVER, MacroStage.P2_GUIDED, MacroStage.P4_ASSESSMENT),
            stageCursor = 0, lifecycle = com.mathlearning.core.learning.engine.SessionLifecycle.COMPLETED,
            completedEncounterIds = setOf("a", "b", "c"),
            submittedAttemptKeys = emptySet(),
            mistakes = listOf("a", "b", "c", "a"),
        )
        val stagesByEncounter = mapOf("a" to MacroStage.P1_DISCOVER, "b" to MacroStage.P2_GUIDED, "c" to MacroStage.P4_ASSESSMENT)
        assertEquals(listOf("a", "b"), selector.replayQueue(state, stagesByEncounter))
        assertEquals(listOf("a", "b", "c", "a"), selector.mistakeEncounters(state))
    }
}
