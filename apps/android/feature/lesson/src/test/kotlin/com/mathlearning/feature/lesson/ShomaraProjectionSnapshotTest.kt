package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraProjectionGuards
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * B1 — snapshot tests of the projection boundary (feature/lesson, not core/model: the
 * boundary is where lesson content meets the server projection).
 *
 * These pin the EXACT violation lists the guards produce for fixed payloads, so any drift in
 * what may cross into the child (answer keys, evaluator config, thresholds, hints in P4/P5)
 * fails loudly here instead of silently reaching the lesson surface. The lists below are the
 * snapshots — update them only with a deliberate boundary decision, never to make a red
 * test green.
 */
class ShomaraProjectionSnapshotTest {

    @Test
    fun `clean payload crosses with no violations`() {
        val clean = mapOf("prompt" to "عدد ۱ را پیدا کن.", "options" to listOf("۱", "۲"))
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(clean))
    }

    @Test
    fun `answer key nested at any depth is a violation`() {
        val payload = mapOf<String, Any?>("item" to mapOf("answer" to "۱"))
        assertEquals(
            listOf("\$.item.answer"),
            ShomaraProjectionGuards.projectionViolations(payload),
        )
    }

    @Test
    fun `contaminated payload snapshot for P4 - exact violation list`() {
        val contaminated = mapOf<String, Any?>(
            "prompt" to "p",
            "evaluatorConfig" to mapOf("expectedAnswers" to listOf(1)),
            "pass_threshold" to "3/4",
            "interaction" to mapOf("hints" to listOf("اولی")),
        )
        assertEquals(
            listOf(
                "\$.evaluatorConfig",
                "\$.pass_threshold",
                "\$.interaction.hints",
                "hint-in-P4/P5:\$.interaction.hints",
            ),
            ShomaraProjectionGuards.projectionViolations(contaminated, setOf(MacroStage.P4_ASSESSMENT)),
        )
    }

    @Test
    fun `same payload outside P4-P5 has no hint-in-P4-P5 entry`() {
        val contaminated = mapOf<String, Any?>(
            "prompt" to "p",
            "evaluatorConfig" to mapOf("expectedAnswers" to listOf(1)),
            "pass_threshold" to "3/4",
            "interaction" to mapOf("hints" to listOf("اولی")),
        )
        assertEquals(
            listOf(
                "\$.evaluatorConfig",
                "\$.pass_threshold",
                "\$.interaction.hints",
            ),
            ShomaraProjectionGuards.projectionViolations(contaminated, setOf(MacroStage.P2_GUIDED)),
        )
    }

    @Test
    fun `pilot macro stages are exactly P1 to P5 in order`() {
        assertEquals(
            listOf(
                MacroStage.P1_DISCOVER,
                MacroStage.P2_GUIDED,
                MacroStage.P3_GAME,
                MacroStage.P4_ASSESSMENT,
                MacroStage.P5_TRANSFER,
            ),
            MacroStage.entries.toList(),
        )
    }
}
