package com.mathlearning.core.designsystem

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08-04 motion contract tests (JVM-pure): reduced-motion resolution, duration collapse, cancelable
 * celebration ownership and the "no concurrent celebration transition" rule.
 *
 * These are logic tests; the visual proof that an indeterminate bar actually stops under reduced
 * motion lives in the instrumented [ShomaraMotionTest].
 */
class ShomaraMotionTest {

    // ---- reduced-motion resolution ----

    @Test
    fun `user preference alone enables reduced motion`() {
        assertTrue(ShomaraMotionLogic.resolveReducedMotion(userPreference = true, systemAnimatorScale = 1f))
        assertTrue(ShomaraMotionLogic.resolveReducedMotion(userPreference = true, systemAnimatorScale = 0.5f))
        assertTrue(ShomaraMotionLogic.resolveReducedMotion(userPreference = true, systemAnimatorScale = null))
    }

    @Test
    fun `system animator scale zero alone enables reduced motion`() {
        // The system-wide "Remove animations" setting must be honoured even when the child never
        // touched the SHOMARA preference.
        assertTrue(ShomaraMotionLogic.resolveReducedMotion(userPreference = false, systemAnimatorScale = 0f))
    }

    @Test
    fun `motion stays on when nothing asked for stillness`() {
        assertFalse(ShomaraMotionLogic.resolveReducedMotion(userPreference = false, systemAnimatorScale = 1f))
        assertFalse(ShomaraMotionLogic.resolveReducedMotion(userPreference = false, systemAnimatorScale = 0.5f))
        // An unreadable setting is NOT treated as "off": we never disable motion speculatively.
        assertFalse(ShomaraMotionLogic.resolveReducedMotion(userPreference = false, systemAnimatorScale = null))
    }

    // ---- durations derive from tokens, never magic numbers ----

    @Test
    fun `durations collapse to a cut under reduced motion`() {
        assertEquals(ShomaraTokens.MotionDurationBase, ShomaraMotionLogic.transitionMs(reduced = false))
        assertEquals(0, ShomaraMotionLogic.transitionMs(reduced = true))
        assertEquals(ShomaraTokens.MotionDurationFast, ShomaraMotionLogic.fastMs(reduced = false))
        assertEquals(0, ShomaraMotionLogic.fastMs(reduced = true))
        assertEquals(ShomaraTokens.MotionDurationSlow, ShomaraMotionLogic.slowMs(reduced = false))
        assertEquals(0, ShomaraMotionLogic.slowMs(reduced = true))
    }

    @Test
    fun `duration helper rejects negative bases and keeps positive input verbatim`() {
        assertEquals(0, ShomaraMotionLogic.durationMs(0, reduced = false))
        assertEquals(340, ShomaraMotionLogic.durationMs(340, reduced = false))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraMotionLogic.durationMs(-1, reduced = false)
        }
    }

    @Test
    fun `should animate is the exact inverse of reduced motion`() {
        assertTrue(ShomaraMotionLogic.shouldAnimate(reduced = false))
        assertFalse(ShomaraMotionLogic.shouldAnimate(reduced = true))
    }

    // ---- progress bar honours reduced motion ----

    @Test
    fun `indeterminate progress stops animating under reduced motion`() {
        val state = ShomaraProgressState()
        assertTrue(ShomaraProgressLogic.animates(state, reducedMotion = false))
        assertFalse(ShomaraProgressLogic.animates(state, reducedMotion = true))
    }

    @Test
    fun `determinate progress never animates regardless of reduced motion`() {
        // A determinate width was never animated; reduced motion must not change its meaning.
        for (fraction in listOf(0f, 0.25f, 0.5f, 1f)) {
            val state = ShomaraProgressState(fraction = fraction)
            assertFalse(ShomaraProgressLogic.animates(state, reducedMotion = false))
            assertFalse(ShomaraProgressLogic.animates(state, reducedMotion = true))
        }
    }

    @Test
    fun `reduced motion never removes information`() {
        // Every progress kind keeps a deterministic announcement whether or not motion is reduced.
        for (state in listOf(
            ShomaraProgressState(),
            ShomaraProgressState(fraction = 0.4f),
            ShomaraProgressState(paused = true),
            ShomaraProgressState(offline = true),
        )) {
            val text = ShomaraProgressLogic.announcementFor(state)
            assertTrue("a reduced-motion surface must still announce its state", text.isNotEmpty())
        }
    }

    // ---- celebration: single owner, cancelable, never concurrent ----

    @Test
    fun `starting a celebration claims the surface`() {
        val gate = ShomaraCelebrationGate()
        assertEquals(0, gate.concurrentCount())
        assertEquals("correct-1", gate.begin("correct-1"))
        assertEquals("correct-1", gate.activeId)
        assertEquals(1, gate.concurrentCount())
    }

    @Test
    fun `a second celebration cancels the first instead of stacking`() {
        val gate = ShomaraCelebrationGate()
        gate.begin("correct-1")
        gate.begin("complete-1")
        // No overlap is representable: the newest owns the surface, the previous is gone.
        assertEquals("complete-1", gate.activeId)
        assertEquals(1, gate.concurrentCount())
    }

    @Test
    fun `stale completion cannot clear the current celebration`() {
        val gate = ShomaraCelebrationGate()
        gate.begin("correct-1")
        gate.begin("complete-1")
        // The cancelled animation finishing late must not clear its replacement.
        assertFalse(gate.end("correct-1"))
        assertEquals("complete-1", gate.activeId)
        assertTrue(gate.end("complete-1"))
        assertNull(gate.activeId)
    }

    @Test
    fun `ending an idle gate is a no-op and empty ids are rejected`() {
        val gate = ShomaraCelebrationGate()
        assertFalse(gate.end("anything"))
        assertNull(gate.activeId)
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { gate.begin("") }
    }

    @Test
    fun `celebration can be restarted after a clean end`() {
        val gate = ShomaraCelebrationGate()
        gate.begin("correct-1")
        assertTrue(gate.end("correct-1"))
        assertEquals("correct-1", gate.begin("correct-1"))
        assertEquals(1, gate.concurrentCount())
    }

    // ---- N08R-01: press feedback spring is token-derived, never a literal ----

    @Test
    fun `press spring stiffness is the motion token verbatim`() {
        assertEquals(ShomaraTokens.MotionSpringStiffness.toFloat(), ShomaraPressFeedbackLogic.stiffness())
    }

    @Test
    fun `press damping ratio derives from the physical token spring`() {
        // c / 2*sqrt(k*m) with tokens 14/220/1 ≈ 0.472 — bouncy enough to feel alive,
        // contained enough to never wobble (restrained Claymorphism).
        val expected = (ShomaraTokens.MotionSpringDamping /
            (2.0 * kotlin.math.sqrt(ShomaraTokens.MotionSpringStiffness.toDouble() * ShomaraTokens.MotionSpringMass))).toFloat()
        assertEquals(expected, ShomaraPressFeedbackLogic.dampingRatio(), 1e-6f)
        assertTrue("damping must stay in the bouncy-but-controlled band", ShomaraPressFeedbackLogic.dampingRatio() in 0.4f..0.55f)
    }

    @Test
    fun `press scale target is the motion press token and resting is exact`() {
        assertEquals(ShomaraTokens.MotionPressScale.toFloat(), ShomaraPressFeedbackLogic.pressedScale())
        assertTrue("press must stay subtle", ShomaraPressFeedbackLogic.pressedScale() in 0.9f..0.99f)
    }

    @Test
    fun `pressed surface sinks half the clay edge and never more`() {
        // N08R Clay axis: the sink is the edge token halved — tactile weight without
        // exaggerated travel, and strictly smaller than the full edge.
        assertEquals(ShomaraTokens.ComponentEdge / 2, ShomaraPressFeedbackLogic.pressedSink())
        assertTrue(ShomaraPressFeedbackLogic.pressedSink().value < ShomaraTokens.ComponentEdge.value)
    }
}
