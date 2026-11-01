package com.mathlearning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N06-01/09/11 Kotlin-side guard tests (mirror of the contracts Vitest suite). */
class ContentProjectionTest {

    private val evidence = listOf(
        ReviewEvidence(ReviewRole.CURRICULUM, "rev-1", "2026-10-28"),
        ReviewEvidence(ReviewRole.PERSIAN_PRONUNCIATION, "rev-2", "2026-10-28"),
        ReviewEvidence(ReviewRole.ACCESSIBILITY, "rev-3", "2026-10-28"),
        ReviewEvidence(ReviewRole.RIGHTS_MODERATION, "rev-4", "2026-10-28"),
    )

    @Test
    fun `canonical lifecycles have seven stages and four review roles`() {
        assertEquals(7, ContentLifecycleStage.entries.size)
        assertEquals(7, AudioLifecycleStage.entries.size)
        assertEquals(4, ReviewRole.entries.size)
        assertEquals(5, MacroStage.entries.size)
        assertEquals("P4_ASSESSMENT", MacroStage.P4_ASSESSMENT.name)
    }

    @Test
    fun `review-role validator demands all four distinct roles`() {
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.reviewRoleViolations(evidence))
        val missing = ShomaraProjectionGuards.reviewRoleViolations(evidence.take(3))
        assertTrue(missing.contains("missing review role: rights_moderation"))
    }

    @Test
    fun `prerequisite validator detects unknown refs self-edges and cycles`() {
        val known = setOf("ST06", "ST07")
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.prerequisiteViolations(listOf(PrerequisiteEdge("ST06", "ST07")), known))
        val unknown = ShomaraProjectionGuards.prerequisiteViolations(listOf(PrerequisiteEdge("ST99", "ST07")), known)
        assertTrue(unknown.contains("unknown prerequisite source: ST99"))
        val self = ShomaraProjectionGuards.prerequisiteViolations(listOf(PrerequisiteEdge("ST07", "ST07")), known)
        assertTrue(self.contains("self-edge: ST07"))
        val cycle = ShomaraProjectionGuards.prerequisiteViolations(
            listOf(PrerequisiteEdge("ST01", "ST02"), PrerequisiteEdge("ST02", "ST03"), PrerequisiteEdge("ST03", "ST01")),
            setOf("ST01", "ST02", "ST03"),
        )
        assertTrue(cycle.joinToString(" ").contains("cycle"))
    }

    @Test
    fun `projection guard rejects answer evaluator threshold reviewer and hint keys at any depth`() {
        val clean = mapOf("prompt" to "عدد ۱ را پیدا کن.", "options" to listOf("۱", "۲"))
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(clean))
        val contaminated = mapOf(
            "prompt" to "p",
            "evaluatorConfig" to mapOf("expectedAnswers" to listOf(1)),
            "pass_threshold" to "3/4",
            "interaction" to mapOf("hints" to listOf("اولی")),
        )
        val violations = ShomaraProjectionGuards.projectionViolations(contaminated, setOf(MacroStage.P4_ASSESSMENT))
        assertTrue(violations.any { it.contains("evaluatorConfig") })
        assertTrue(violations.any { it.contains("pass_threshold") })
        assertTrue(violations.any { it.contains("hint-in-P4/P5") })
        // Hint keys are tolerated OUTSIDE P4/P5 (P1..P3 scaffolding).
        val scaffold = ShomaraProjectionGuards.projectionViolations(contaminated, setOf(MacroStage.P2_GUIDED))
        assertFalse(scaffold.any { it.contains("hint-in-P4/P5") })
        assertTrue(scaffold.any { it.contains("evaluatorConfig") })
    }

    @Test
    fun `server learning config owns the resolved values (CONTENT-001-002-014)`() {
        assertEquals(1, ServerLearningConfig.DEFAULT.stationJumpQuestionCount)
        assertEquals(5, ServerLearningConfig.DEFAULT.chapterJumpQuestionCount)
        assertEquals("3/4", ServerLearningConfig.DEFAULT.masteryPassThreshold)
        assertEquals(28, ServerLearningConfig.DEFAULT.traceToleranceDp)
    }

    @Test
    fun `telemetry payload is minimal and refuses blank ids (CONTENT-018)`() {
        val telemetry = AttemptTelemetry("s1", "e1", "P4_ASSESSMENT_SELECT", "opt-1", MacroStage.P4_ASSESSMENT)
        val payload = telemetry.asMinimalPayload()
        assertEquals(setOf("sessionId", "encounterId", "interactionId", "choiceId", "macroStage"), payload.keys)
        assertTrue(payload.values.none { (it as? String)?.contains("correct") == true })
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            AttemptTelemetry("", "e1", "i", null, MacroStage.P1_DISCOVER)
        }
    }
}
