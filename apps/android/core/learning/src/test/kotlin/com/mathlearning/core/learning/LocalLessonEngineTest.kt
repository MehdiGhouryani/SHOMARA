package com.mathlearning.core.learning

import com.mathlearning.core.learning.checkpoint.CheckpointNotFoundException
import com.mathlearning.core.learning.checkpoint.CheckpointVersionMismatchException
import com.mathlearning.core.learning.checkpoint.InMemoryCheckpointStore
import com.mathlearning.core.learning.checkpoint.SessionCheckpointManager
import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.evaluator.NextAction
import com.mathlearning.core.learning.engine.AttemptResult
import com.mathlearning.core.learning.engine.LessonSessionState
import com.mathlearning.core.learning.engine.LocalLessonEngine
import com.mathlearning.core.learning.evaluator.EvaluationRequest
import com.mathlearning.core.learning.evaluator.LearnerResponse
import com.mathlearning.core.learning.evaluator.LocalLessonEvaluator
import com.mathlearning.core.learning.evaluator.UnconfiguredEvaluator
import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Scripted evaluator: TEST-ONLY decisions from an explicit table (never shipped policy data). */
class ScriptedEvaluator(private val correctFor: Set<String>) : LocalLessonEvaluator {
    val evaluatedKeys = mutableListOf<String>()
    override fun evaluate(request: EvaluationRequest): EvaluationOutcome {
        evaluatedKeys += request.response.interactionId
        val correct = request.response.interactionId in correctFor
        return EvaluationOutcome(correct, if (correct) NextAction.ADVANCE else NextAction.RETRY, "scripted-test-v1")
    }
}

class LocalLessonEngineTest {

    private val stageOrder = listOf(MacroStage.P1_DISCOVER, MacroStage.P2_GUIDED, MacroStage.P3_GAME, MacroStage.P4_ASSESSMENT, MacroStage.P5_TRANSFER)
    private val correct = setOf("e1", "e3")

    private fun engine(): LocalLessonEngine = LocalLessonEngine(ScriptedEvaluator(correct))

    private fun start(engine: LocalLessonEngine): LessonSessionState =
        engine.createSession(com.mathlearning.core.learning.engine.StartSessionCommand("s1", "ST07", stageOrder))

    private fun present(engine: LocalLessonEngine, state: LessonSessionState, encounterId: String, stage: MacroStage) =
        engine.presentEncounter(state, encounterId, stage)

    private fun submit(engine: LocalLessonEngine, presented: com.mathlearning.core.learning.engine.PresentedEncounter, interactionId: String): AttemptResult =
        engine.submitAttempt(presented, attemptKey = interactionId, response = LearnerResponse(interactionId, "opt-1", null))

    @Test
    fun `golden replay - the same interaction script produces the identical outcome log twice`() {
        val outcomes = mutableListOf<List<String>>()
        repeat(2) {
            val engine = engine()
            var state = start(engine)
            val log = mutableListOf<String>()
            val stageByEncounter = mapOf("e1" to MacroStage.P1_DISCOVER, "e2" to MacroStage.P2_GUIDED, "e3" to MacroStage.P3_GAME)
            for ((encounterId, stage) in stageByEncounter) {
                val presented = present(engine, state, encounterId, stage)
                val result = submit(engine, presented, encounterId)
                log += "${result.outcome!!.correct}:${result.outcome.nextAction}"
                state = result.state
            }
            outcomes += log
        }
        assertEquals(outcomes[0], outcomes[1])
        assertEquals(listOf("true:ADVANCE", "false:RETRY", "true:ADVANCE"), outcomes[0])
    }

    @Test
    fun `duplicate submission is a no-op - same key never evaluates twice`() {
        val engine = engine()
        var state = start(engine)
        val presented = present(engine, state, "e1", MacroStage.P1_DISCOVER)
        val first = submit(engine, presented, "i1")
        assertFalse(first.duplicate)
        // Re-present from the UPDATED state (as the UI would after the first attempt).
        val rePresented = present(engine, first.state, "e1", MacroStage.P1_DISCOVER)
        val second = submit(engine, rePresented, "i1")
        assertTrue(second.duplicate)
        assertEquals(null, second.outcome)
        // The scripted evaluator recorded exactly ONE evaluation for that interaction.
        assertEquals(1, (engine.evaluator as ScriptedEvaluator).evaluatedKeys.count { it == "i1" })
    }

    @Test
    fun `boundary - invalid transitions are refused`() {
        val engine = engine()
        val state = start(engine)
        // Manual progression only: advancing from a non-current stage is refused.
        assertThrowsIllegal { engine.advanceStage(state, MacroStage.P2_GUIDED) }
        // Walking backwards past the cursor is refused.
        val advanced = engine.advanceStage(state, MacroStage.P1_DISCOVER)
        assertThrowsIllegal { present(engine, advanced, "eBack", MacroStage.P1_DISCOVER) }
        // Empty IDs are refused at creation.
        assertThrowsIllegal {
            engine.createSession(com.mathlearning.core.learning.engine.StartSessionCommand("  ", "ST07", stageOrder))
        }
    }

    @Test
    fun `assessment stages keep their quiet contract - no auto-advance without manual progression`() {
        val engine = engine()
        var state = start(engine)
        state = engine.advanceStage(state, MacroStage.P1_DISCOVER)
        state = engine.advanceStage(state, MacroStage.P2_GUIDED)
        state = engine.advanceStage(state, MacroStage.P3_GAME)
        state = engine.advanceStage(state, MacroStage.P4_ASSESSMENT)
        state = engine.advanceStage(state, MacroStage.P5_TRANSFER)
        assertEquals(com.mathlearning.core.learning.engine.SessionLifecycle.COMPLETED, state.lifecycle)
    }

    @Test
    fun `unconfigured evaluator fails closed - no invented correctness exists`() {
        val engine = LocalLessonEngine(UnconfiguredEvaluator)
        var state = start(engine)
        val presented = present(engine, state, "e1", MacroStage.P1_DISCOVER)
        val thrown = runCatching { submit(engine, presented, "i1") }.exceptionOrNull()
        assertNotNull(thrown)
        assertTrue(thrown!!.message!!.contains("fail-closed"))
    }

    @Test
    fun `process death - checkpoint round-trip restores the exact position and mistakes`() {
        val store = InMemoryCheckpointStore()
        val manager = SessionCheckpointManager(store, engineRuleVersion = "learning-engine:v1")
        val engine = engine()
        var state = start(engine)
        val presented = present(engine, state, "e1", MacroStage.P1_DISCOVER)
        val result = submit(engine, presented, "i2") // wrong → mistake recorded
        state = result.state
        state = engine.advanceStage(state, MacroStage.P1_DISCOVER)
        manager.suspendSession(state, encounterId = "e2", nowMs = 99L)

        val resumed = manager.resumeSession("s1", expectedRuleVersion = "learning-engine:v1")
        assertEquals("e2", resumed.encounterId)
        assertEquals(MacroStage.P2_GUIDED, resumed.stage)
        assertEquals(1, resumed.stageCursor)
        assertEquals(listOf("e1"), resumed.mistakes)
    }

    @Test
    fun `resume with a mismatched engine rule version is refused - content or evaluator change cannot silently continue`() {
        val store = InMemoryCheckpointStore()
        val manager = SessionCheckpointManager(store, engineRuleVersion = "learning-engine:v1")
        var state = start(engine())
        manager.suspendSession(state, "e1", nowMs = 1L)
        val thrown = runCatching { manager.resumeSession("s1", expectedRuleVersion = "learning-engine:v2") }.exceptionOrNull()
        assertTrue(thrown is CheckpointVersionMismatchException)
    }

    @Test
    fun `resume without any checkpoint is refused honestly`() {
        val manager = SessionCheckpointManager(InMemoryCheckpointStore(), engineRuleVersion = "v1")
        assertTrue(runCatching { manager.resumeSession("missing", expectedRuleVersion = "v1") }.exceptionOrNull() is CheckpointNotFoundException)
    }

    private fun assertThrowsIllegal(block: () -> Unit) {
        val thrown = runCatching(block).exceptionOrNull()
        assertTrue("expected an IllegalArgumentException, got $thrown", thrown is IllegalArgumentException)
    }
}
