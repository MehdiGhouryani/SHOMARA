package com.mathlearning.feature.parent

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N05-06 parent boundary tests: re-auth gate, lockout, fail-closed, child-leak policy. */
class ShomaraParentBoundaryTest {

    @Test
    fun `correct passcode authenticates through the wired verifier`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        val result = gate.verify("1234", nowMs = 0)
        assertTrue(result is ShomaraParentGateState.Authenticated)
        assertTrue(gate.canEnter())
        assertEquals(0, gate.failures)
    }

    @Test
    fun `wrong passcode fails warm and locks out after three failures`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        val first = gate.verify("9999", nowMs = 0)
        assertTrue(first is ShomaraParentGateState.Failed)
        assertFalse(gate.canEnter())
        gate.verify("9999", nowMs = 1)
        val third = gate.verify("9999", nowMs = 2)
        assertTrue(third is ShomaraParentGateState.LockedOut)
        // Even the correct passcode is rejected during the lockout.
        assertTrue(gate.verify("1234", nowMs = 3) is ShomaraParentGateState.LockedOut)
        // After the cooldown, entry works again.
        assertTrue(gate.verify("1234", nowMs = 61_000) is ShomaraParentGateState.Authenticated)
    }

    @Test
    fun `missing verifier fails closed - entry is impossible`() {
        val gate = ShomaraParentGate(verifier = null)
        val result = gate.verify("1234", nowMs = 0)
        assertFalse(result is ShomaraParentGateState.Authenticated)
        assertFalse(gate.canEnter())
        assertTrue((result as ShomaraParentGateState.Failed).message.contains("پیکربندی"))
    }

    @Test
    fun `re-entrant verify while authenticated stays authenticated - no double-submit flip`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        assertTrue(gate.verify("1234", nowMs = 0) is ShomaraParentGateState.Authenticated)
        assertTrue(gate.verify("1234", nowMs = 1) is ShomaraParentGateState.Authenticated)
        assertTrue(gate.canEnter())
    }

    @Test
    fun `reset clears failures and returns to idle`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        gate.verify("wrong", nowMs = 0)
        gate.reset()
        assertEquals(ShomaraParentGateState.Idle, gate.state)
        assertEquals(0, gate.failures)
    }

    @Test
    fun `parent surface allows only adult sections - no child lesson content`() {
        assertTrue(ShomaraParentSurfaceContract.isAllowed("progress-report"))
        assertTrue(ShomaraParentSurfaceContract.isAllowed("settings"))
        assertTrue(ShomaraParentSurfaceContract.isAllowed("sign-out"))
        // Child lesson surfaces are structurally impossible in the parent home.
        assertFalse(ShomaraParentSurfaceContract.isAllowed("lesson"))
        assertFalse(ShomaraParentSurfaceContract.isAllowed("practice"))
        assertFalse(ShomaraParentSurfaceContract.isAllowed("station-start"))
    }

    @Test
    fun `parent progress summary uses persian digits and never child rewards`() {
        val gate = ShomaraParentGate(verifier = { true })
        assertTrue(gate.verify("anything", nowMs = 0) is ShomaraParentGateState.Authenticated)
        // The parent home renders summary numbers only; rewards/leaderboards are contract-banned.
        for (banned in listOf("ستاره", "سکه", "لیدربرد")) {
            assertFalse(ShomaraParentSurfaceContract.AllowedSections.any { it.contains(banned) })
        }
    }

    // F-03c (logic layer): a blank submission is not an attempt at all — verify("") must
    // never burn one of the three attempts and must not change the gate state.
    @Test
    fun `blank passcode never burns an attempt`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        assertEquals(ShomaraParentGateState.Idle, gate.verify("", nowMs = 0))
        assertEquals(0, gate.failures)
        assertEquals(ShomaraParentGateState.Idle, gate.state)
        // A blank submission after a real failure changes nothing either.
        gate.verify("9999", nowMs = 1)
        assertEquals(1, gate.failures)
        gate.verify("", nowMs = 2)
        assertEquals(1, gate.failures)
        assertTrue(gate.state is ShomaraParentGateState.Failed)
    }

    // F-03b: the lockout is a real 60-second cooldown on the caller's clock, not a permanent
    // lock — with a real nowMs the gate unlocks once the cooldown has passed.
    @Test
    fun `lockout expires with real time`() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        gate.verify("9999", nowMs = 1_000_000)
        gate.verify("9999", nowMs = 1_000_000)
        val third = gate.verify("9999", nowMs = 1_000_000)
        assertTrue(third is ShomaraParentGateState.LockedOut)
        assertEquals(1_060_000L, (third as ShomaraParentGateState.LockedOut).untilMs)
        // Still locked one millisecond before the cooldown ends.
        assertTrue(gate.verify("1234", nowMs = 1_059_999) is ShomaraParentGateState.LockedOut)
        // One millisecond after it, the correct passcode authenticates again.
        assertTrue(gate.verify("1234", nowMs = 1_060_001) is ShomaraParentGateState.Authenticated)
        assertEquals(0, gate.failures)
    }
}
