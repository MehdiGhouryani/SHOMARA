package com.mathlearning.feature.lesson

import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S1 · STATION_EXPERIENCE_BLUEPRINT §2/§3/§4 — pure logic proof for the station flow machine
 * and the stage motion tokens (no device, no Compose).
 *
 * The invariants pinned here are the blueprint's non-negotiables:
 *  1. the UI never judges — a stage change is only legal with a ShomaraStageAdvance signal
 *     (the evaluator's verdict), never from a tap/scroll/back event;
 *  2. no skipping — the walk is exactly one stage at a time;
 *  3. two concurrent narrative moments on one surface are a bug — a second advance is
 *     rejected while Transitioning;
 *  4. reduced motion = state cut, never a tween (acceptance ②) — the phase SEQUENCE is
 *     identical, only the movement collapses to zero.
 */
class ShomaraStationFlowTest {

    // ---- the machine's happy path ----

    @Test
    fun `advance from Showing to the next stage enters Transitioning with the target`() {
        val machine = ShomaraStationFlowMachine()
        assertTrue(machine.currentStage == MacroStage.P1_DISCOVER)
        val advanced = machine.advance(
            ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P2_GUIDED),
        )
        assertEquals(ShomaraStationFlowState.Transitioning, advanced.state)
        assertEquals(MacroStage.P2_GUIDED, advanced.enteringStage)
        assertTrue(advanced.isTransitioning)
    }

    @Test
    fun `finishTransition settles on the entered stage and clears the target`() {
        val machine = ShomaraStationFlowMachine()
            .advance(ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P2_GUIDED))
            .finishTransition()
        assertEquals(ShomaraStationFlowState.Showing, machine.state)
        assertEquals(MacroStage.P2_GUIDED, machine.currentStage)
        assertNull(machine.enteringStage)
        assertFalse(machine.isTransitioning)
    }

    @Test
    fun `a full P1 to P5 walk visits every stage exactly once`() {
        var machine = ShomaraStationFlowMachine()
        val visited = mutableListOf(machine.currentStage)
        while (ShomaraLessonStageWalk.next(machine.currentStage) != null) {
            val next = ShomaraLessonStageWalk.next(machine.currentStage)!!
            machine = machine
                .advance(ShomaraStageAdvance(from = machine.currentStage, to = next))
                .finishTransition()
            visited.add(machine.currentStage)
        }
        assertEquals(MacroStage.entries.toList(), visited)
        assertEquals(5, visited.size)
    }

    // ---- the UI never judges (acceptance ①'s logic half) ----

    @Test(expected = IllegalArgumentException::class)
    fun `an advance not starting from the current stage is rejected`() {
        ShomaraStationFlowMachine(currentStage = MacroStage.P2_GUIDED)
            .advance(ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P3_GAME))
    }

    @Test(expected = IllegalArgumentException::class)
    fun `skipping a stage is rejected - one stage at a time`() {
        ShomaraStationFlowMachine()
            .advance(ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P3_GAME))
    }

    @Test(expected = IllegalArgumentException::class)
    fun `a same-stage advance is rejected`() {
        ShomaraStationFlowMachine()
            .advance(ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P1_DISCOVER))
    }

    @Test(expected = IllegalArgumentException::class)
    fun `a second advance while Transitioning is rejected - no concurrent moments`() {
        val machine = ShomaraStationFlowMachine()
            .advance(ShomaraStageAdvance(from = MacroStage.P1_DISCOVER, to = MacroStage.P2_GUIDED))
        machine.advance(ShomaraStageAdvance(from = MacroStage.P2_GUIDED, to = MacroStage.P3_GAME))
    }

    @Test(expected = IllegalArgumentException::class)
    fun `finishing without a transition is rejected`() {
        ShomaraStationFlowMachine().finishTransition()
    }

    // ---- the walk still refuses to clamp past the final stage (N08-05 regression) ----

    @Test
    fun `past the final stage the walk returns null and the machine stays put`() {
        val final = ShomaraStationFlowMachine(currentStage = MacroStage.P5_TRANSFER)
        assertNull(ShomaraLessonStageWalk.next(final.currentStage))
        assertTrue(ShomaraLessonStageWalk.isFinal(final.currentStage))
    }

    // ---- reduced motion: state cut, never a tween (acceptance ②) ----

    @Test
    fun `reduced motion collapses both stage moments to zero - the cut`() {
        assertEquals(0, ShomaraStageMotionLogic.exitMs(reducedMotion = true))
        assertEquals(0, ShomaraStageMotionLogic.enterMs(reducedMotion = true))
        assertFalse(ShomaraStageMotionLogic.mayAnimate(reducedMotion = true))
        // With motion allowed, the moments come from the canonical tokens (never raw ms here).
        assertTrue(ShomaraStageMotionLogic.exitMs(reducedMotion = false) == ShomaraTokens.MotionDurationFast)
        assertTrue(ShomaraStageMotionLogic.enterMs(reducedMotion = false) == ShomaraTokens.MotionDurationBase)
    }

    @Test
    fun `the exit settle stays inside the token press-scale band`() {
        val scale = ShomaraStageMotionLogic.exitScale()
        assertTrue(scale in 0.90f..1.0f)
        assertEquals(ShomaraTokens.MotionPressScale.toFloat(), scale)
    }

    // ---- the scene phase sequence (the §3 transition contract) ----

    @Test
    fun `the phase sequence is Exit then Enter then Holding - never two at once`() {
        assertEquals(ShomaraScenePhase.Entering, ShomaraScenePhaseLogic.nextPhase(ShomaraScenePhase.Exiting))
        assertEquals(ShomaraScenePhase.Holding, ShomaraScenePhaseLogic.nextPhase(ShomaraScenePhase.Entering))
        assertNull(ShomaraScenePhaseLogic.nextPhase(ShomaraScenePhase.Holding))
    }

    @Test
    fun `phase durations resolve from the same motion logic as the moments`() {
        assertEquals(
            ShomaraStageMotionLogic.exitMs(reducedMotion = false),
            ShomaraScenePhaseLogic.exitDurationMs(reducedMotion = false),
        )
        assertEquals(
            ShomaraStageMotionLogic.enterMs(reducedMotion = true),
            ShomaraScenePhaseLogic.enterDurationMs(reducedMotion = true),
        )
    }

    // ---- exactly one CTA: the slots frame renders what it is given, nothing more ----

    @Test
    fun `the advance signal requires the immediate next stage for EVERY stage`() {
        MacroStage.entries.dropLast(1).forEach { stage ->
            val next = ShomaraLessonStageWalk.next(stage)!!
            val machine = ShomaraStationFlowMachine(currentStage = stage)
                .advance(ShomaraStageAdvance(from = stage, to = next))
            assertEquals(next, machine.enteringStage)
        }
    }
}
