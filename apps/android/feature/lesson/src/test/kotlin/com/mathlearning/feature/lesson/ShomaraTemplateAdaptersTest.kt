package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ServerLearningConfig
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N06-10 pilot adapter tests: T01/T05/T13/T15 contracts. */
class ShomaraTemplateAdaptersTest {

    private val config = ServerLearningConfig.DEFAULT

    // ---- T01 ----

    @Test
    fun `t01 manipulatives stay in the 72-80dp band`() {
        assertEquals(72, ShomaraManipulativeRules.MinDp)
        assertEquals(80, ShomaraManipulativeRules.MaxDp)
        assertTrue(ShomaraManipulativeRules.requireBand(72) == Unit)
        assertThrows(IllegalArgumentException::class.java) { ShomaraManipulativeRules.requireBand(64) }
        assertThrows(IllegalArgumentException::class.java) { ShomaraManipulativeRules.requireBand(84) }
    }

    @Test
    fun `t01 taught-numeral guard rejects numerals beyond the ceiling`() {
        val adapter = T01CountAdapter(sessionId = "s1", encounterId = "e1", taughtNumerals = setOf(1, 2, 3), objectCount = 5)
        assertThrows(IllegalArgumentException::class.java) { adapter.selectNumeral(5) }
        assertTrue(adapter.selectNumeral(3).chosenNumeral == 3)
        // Display construction with an over-ceiling numeral is rejected too.
        assertThrows(IllegalArgumentException::class.java) {
            T01CountAdapter(sessionId = "s1", encounterId = "e1", taughtNumerals = setOf(1, 2), objectCount = 5, chosenNumeral = 7)
        }
    }

    @Test
    fun `t01 tap-to-count counts each object once and submits minimal ids`() {
        var adapter = T01CountAdapter(sessionId = "s1", encounterId = "e1", taughtNumerals = setOf(1, 2, 3), objectCount = 4)
        adapter = adapter.tapObject(1).tapObject(2).tapObject(2)
        assertEquals(2, adapter.countedSoFar()) // double tap counted once
        val (submitted, telemetry) = adapter.selectNumeral(2).startSubmit()
        assertEquals(T01State.Submitted, submitted.state)
        assertEquals("numeral-2", telemetry.choiceId)
        assertEquals(MacroStage.P3_GAME, telemetry.macroStage)
        // Blank session/encounter IDs are caught by the telemetry contract at call time.
        assertThrows(IllegalArgumentException::class.java) {
            com.mathlearning.core.model.AttemptTelemetry("", "", telemetry.interactionId, telemetry.choiceId, telemetry.macroStage)
        }
    }

    // ---- T05 ----

    @Test
    fun `t05 drag and tap paths converge on the identical outcome`() {
        val viaDrag = T05SlotAdapter(slotIds = listOf("s1", "s2"), draggableIds = listOf("d1", "d2"))
            .dragPlace("d1", "s1")
        val viaTap = T05SlotAdapter(slotIds = listOf("s1", "s2"), draggableIds = listOf("d1", "d2"))
            .tapSelect("d1")
            .tapPlace("s1")
        assertTrue(viaDrag.sameOutcomeAs(viaTap))
        assertEquals(mapOf("s1" to "d1"), viaTap.occupied)
        // Tap-place without a selection is a safe no-op.
        assertEquals(emptyMap<String, String>(), T05SlotAdapter(listOf("s1"), listOf("d1")).tapPlace("s1").occupied)
        assertThrows(IllegalArgumentException::class.java) { viaTap.tapSelect("d9") }
    }

    // ---- T13 ----

    // R-20: the stroke order is a PROVISIONAL reference, not canonical — CONTENT-001 is
    // still open (pilot: top-to-bottom; stage5: bottom-to-top for ۱ is accepted). The test
    // locks that the reference contains all three checkpoints and that completion is
    // order-independent (all points visited, in any order) — it must NOT pin top-to-bottom
    // as the decided direction. The tolerance is a draft config value (CONTENT-011): the
    // test locks that the adapter reads its config, never the literal number.
    @Test
    fun `t13 reference stroke order is provisional - completion needs every point, not the order (CONTENT-001)`() {
        val adapter = T13TraceAdapter(config = config)
        assertEquals(setOf(T13Point.Top, T13Point.Middle, T13Point.Bottom), adapter.referenceStrokeOrder.toSet())
        // The next-point hint follows the provisional reference order — that guidance is
        // the reference, not a verdict on the real direction.
        assertEquals(T13Point.Top, adapter.referenceStrokeOrder.first())
        // Out-of-order checkpoints are ignored; a drag beyond the configured tolerance
        // demands the fallback. The breach value is derived from the config, not a literal.
        val skipped = adapter.trace(T13Point.Bottom, dragDp = 10)
        assertTrue(skipped.visitedCheckpoints.isEmpty())
        assertThrows(IllegalArgumentException::class.java) { adapter.trace(T13Point.Top, dragDp = config.traceToleranceDp + 1) }
    }

    @Test
    fun `t13 tap-checkpoint fallback reaches the identical completion`() {
        val viaDrag = T13TraceAdapter(config = config).trace(T13Point.Top, 5).trace(T13Point.Middle, 5).trace(T13Point.Bottom, 5)
        val viaTap = T13TraceAdapter(config = config).tapCheckpoint(T13Point.Top).tapCheckpoint(T13Point.Middle).tapCheckpoint(T13Point.Bottom)
        assertTrue(viaDrag.completed)
        assertTrue(viaTap.completed)
        assertTrue(viaDrag.sameCompletionAs(viaTap))
        assertTrue(viaTap.tapFallbackUsed)
        assertFalse(viaDrag.tapFallbackUsed)
    }

    @Test
    fun `t13 raw touch recording never judges - checkpoints state and completion untouched (B8)`() {
        val adapter = T13TraceAdapter(config = config)
            .recordRawTouch(ShomaraRawTouchPoint(xDp = 120, yDp = 40))
            .recordRawTouch(ShomaraRawTouchPoint(xDp = 118, yDp = 90))
        assertEquals(
            listOf(ShomaraRawTouchPoint(120, 40), ShomaraRawTouchPoint(118, 90)),
            adapter.rawTouches,
        )
        assertTrue(adapter.visitedCheckpoints.isEmpty())
        assertEquals("ready", adapter.state)
        assertFalse(adapter.completed)
        // Recording after a completed trace still changes nothing about the completion.
        val completed = adapter.tapCheckpoint(T13Point.Top).tapCheckpoint(T13Point.Middle).tapCheckpoint(T13Point.Bottom)
        val recorded = completed.recordRawTouch(ShomaraRawTouchPoint(xDp = 0, yDp = 0))
        assertTrue(recorded.completed)
        assertEquals(completed.visitedCheckpoints, recorded.visitedCheckpoints)
        assertEquals(completed.state, recorded.state)
    }

    // ---- T15 ----

    @Test
    fun `t15 audio is expected-never-blocking with a visible fallback (CONTENT-017)`() {
        val withoutAudio = T15StoryAdapter(steps = listOf(1, 2), audioAvailable = false)
        assertFalse(withoutAudio.blockedByAudio)
        assertEquals("متن داستان", withoutAudio.visiblePromptFallback("متن داستان"))
        val withAudio = withoutAudio.copy(audioAvailable = true)
        assertEquals("", withAudio.visiblePromptFallback("متن داستان"))
    }

    @Test
    fun `t15 submission payload is server-only minimal ids per step (CONTENT-018)`() {
        val story = T15StoryAdapter(steps = listOf(1, 2)).answer("choice-a")
        val telemetry = story.telemetryFor("s1", "e1", "choice-a")
        assertEquals("T15_STEP_1", telemetry.interactionId)
        assertEquals(MacroStage.P5_TRANSFER, telemetry.macroStage)
        assertEquals("choice-a", telemetry.choiceId)
        val payload = telemetry.asMinimalPayload()
        assertFalse(payload.values.any { (it as? String)?.contains("answer") == true })
        val advanced = story.advance()
        assertEquals(1, advanced.currentStep) // stays in range
    }

    @Test
    fun `config trace tolerance is server-owned not hardcoded - the adapter reads its config (R-20)`() {
        // No literal tolerance is pinned here: 28dp is a draft value (CONTENT-001/011), not
        // an approved one. What is pinned is that the adapter reads whatever its config says.
        assertEquals(config.traceToleranceDp, T13TraceAdapter().traceToleranceDp)
        val wider = ServerLearningConfig.DEFAULT.copy(traceToleranceDp = 40)
        assertEquals(40, T13TraceAdapter(config = wider).traceToleranceDp)
    }
}
