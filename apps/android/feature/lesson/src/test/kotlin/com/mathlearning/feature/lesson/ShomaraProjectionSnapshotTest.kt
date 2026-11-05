package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraMacroStages
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

    // ---- R-22 (B1, per-adapter) ----
    //
    // The guard-only snapshots above never touched a real adapter output. Each adapter now
    // has a toProjection() that emits exactly what its renderer needs — and the snapshots
    // below pin the exact maps and run them through the guard under the STRICTEST scan
    // (the P4/P5 hint-banned stages), so a future leak of an answer key, an evaluator
    // config, a threshold or a hint into any adapter's projection fails here.

    @Test
    fun `t01 projection snapshot - render data only, chosen numeral never crosses`() {
        val adapter = T01CountAdapter(sessionId = "s1", encounterId = "e1", taughtNumerals = setOf(1, 2, 3), objectCount = 4)
            .tapObject(2)
            .selectNumeral(2)
        assertEquals(
            mapOf<String, Any?>(
                "template" to "T01",
                "objectCount" to 4,
                "taughtNumerals" to listOf(1, 2, 3),
                "tappedObjectOrdinals" to listOf(2),
                "state" to "Selected",
            ),
            adapter.toProjection(),
        )
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(adapter.toProjection(), ShomaraMacroStages.HINT_BANNED))
    }

    @Test
    fun `t05 projection snapshot - slots and draggables only, placements never cross`() {
        val adapter = T05SlotAdapter(slotIds = listOf("s1", "s2"), draggableIds = listOf("d1", "d2"))
            .dragPlace("d1", "s1")
        assertEquals(
            mapOf<String, Any?>(
                "template" to "T05",
                "slotIds" to listOf("s1", "s2"),
                "draggableIds" to listOf("d1", "d2"),
                "state" to "submitted",
            ),
            adapter.toProjection(),
        )
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(adapter.toProjection(), ShomaraMacroStages.HINT_BANNED))
    }

    @Test
    fun `t13 projection snapshot - numeral and visited checkpoints only, no direction or tolerance`() {
        val adapter = T13TraceAdapter().tapCheckpoint(T13Point.Top)
        assertEquals(
            mapOf<String, Any?>(
                "template" to "T13",
                "numeral" to 1,
                "visitedCheckpoints" to listOf("Top"),
                "state" to "tracing",
            ),
            adapter.toProjection(),
        )
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(adapter.toProjection(), ShomaraMacroStages.HINT_BANNED))
    }

    @Test
    fun `t15 projection snapshot - steps only, no choice id crosses`() {
        val adapter = T15StoryAdapter(steps = listOf(1, 2)).answer("choice-a")
        assertEquals(
            mapOf<String, Any?>(
                "template" to "T15",
                "steps" to listOf(1, 2),
                "currentStep" to 0,
                "state" to "answered",
            ),
            adapter.toProjection(),
        )
        assertEquals(emptyList<String>(), ShomaraProjectionGuards.projectionViolations(adapter.toProjection(), ShomaraMacroStages.HINT_BANNED))
    }
}
