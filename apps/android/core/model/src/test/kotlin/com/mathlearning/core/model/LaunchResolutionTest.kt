package com.mathlearning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08-15 regression guard for the launch gate.
 *
 * The defect this locks down: `ShomaraLaunchState` had a contract and tests, but NO producer in the
 * running app — `MainActivity` always started at the welcome gate, so a child with a verified
 * session was re-onboarded on every cold start. These assertions pin the two properties that make
 * the fix safe:
 *
 *  1. `Resolving` is the only state that shows the splash, and it never shows a child surface;
 *  2. nothing except a VERIFIED session reaches the child shell — no observation can be mistaken
 *     for a session (that is the "no fake session success" rule, expressed as a test).
 */
class LaunchResolutionTest {

    @Test
    fun `no session resolves to the welcome gate`() {
        assertEquals(ShomaraLaunchState.NewUser, ShomaraLaunchResolver.resolve(ShomaraSessionObservation.NoSession))
        assertEquals(ShomaraLaunchSurface.Welcome, ShomaraLaunchResolver.surfaceFor(ShomaraLaunchState.NewUser))
    }

    @Test
    fun `a resumable draft resumes the journey without authenticating anyone`() {
        val state = ShomaraLaunchResolver.resolve(
            observation = ShomaraSessionObservation.NoSession,
            hasResumableDraft = true,
        )
        assertEquals(ShomaraLaunchState.RecoverIncompleteProfile, state)
        // Still the onboarding surface, NOT the child shell.
        assertEquals(ShomaraLaunchSurface.Welcome, ShomaraLaunchResolver.surfaceFor(state))
    }

    @Test
    fun `a verified session is the only thing that reaches the child shell`() {
        val verified = ShomaraLaunchResolver.resolve(ShomaraSessionObservation.Verified(authenticatedAtMs = 1_000L))
        assertEquals(ShomaraLaunchState.RestoringSession, verified)
        assertEquals(ShomaraLaunchSurface.ChildShell, ShomaraLaunchResolver.surfaceFor(verified))

        // Every non-verified observation is excluded from the child shell.
        val nonVerified = listOf(
            ShomaraSessionObservation.NoSession,
            ShomaraSessionObservation.Rejected,
            ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.Offline),
            ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.ServerError),
            ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.BackendNotConfigured),
        )
        for (observation in nonVerified) {
            val surface = ShomaraLaunchResolver.surfaceFor(ShomaraLaunchResolver.resolve(observation))
            assertTrue(
                "observation $observation must never render the child shell",
                surface != ShomaraLaunchSurface.ChildShell,
            )
        }
    }

    @Test
    fun `an unverified session never resolves to an authenticated destination`() {
        val offline = ShomaraLaunchResolver.resolve(ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.Offline))
        assertEquals(ShomaraLaunchState.Offline, offline)
        assertEquals(ShomaraLaunchSurface.Recovery, ShomaraLaunchResolver.surfaceFor(offline))

        val serverError = ShomaraLaunchResolver.resolve(ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.ServerError))
        assertEquals(ShomaraLaunchState.Error, serverError)
        assertEquals(ShomaraLaunchSurface.Recovery, ShomaraLaunchResolver.surfaceFor(serverError))
    }

    @Test
    fun `an unconfigured backend is an error with recovery, not an offline claim`() {
        // Saying "check your connection" for a build that has no OTP endpoint would be a fabrication.
        val state = ShomaraLaunchResolver.resolve(
            ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.BackendNotConfigured),
        )
        assertEquals(ShomaraLaunchState.Error, state)
        assertEquals(ShomaraLaunchSurface.Recovery, ShomaraLaunchResolver.surfaceFor(state))
    }

    @Test
    fun `a rejected credential falls back to onboarding and never to the shell`() {
        val state = ShomaraLaunchResolver.resolve(ShomaraSessionObservation.Rejected)
        assertEquals(ShomaraLaunchState.NewUser, state)
        assertFalse(ShomaraLaunchResolver.surfaceFor(state) == ShomaraLaunchSurface.ChildShell)
    }

    @Test
    fun `resolving renders the splash and nothing child-facing`() {
        assertEquals(ShomaraLaunchSurface.Splash, ShomaraLaunchResolver.surfaceFor(ShomaraLaunchState.Resolving))
    }

    @Test
    fun `every launch state maps to exactly one surface and the mapping is total`() {
        for (state in ShomaraLaunchState.entries) {
            // The `when` in surfaceFor is exhaustive by construction; calling it for every entry
            // proves a new state cannot be added without deciding its surface.
            val surface = ShomaraLaunchResolver.surfaceFor(state)
            assertTrue("no launch state may map to a null surface", surface in ShomaraLaunchSurface.entries)
        }
        // Splash is reserved for Resolving alone.
        val splashStates = ShomaraLaunchState.entries.filter {
            ShomaraLaunchResolver.surfaceFor(it) == ShomaraLaunchSurface.Splash
        }
        assertEquals(listOf(ShomaraLaunchState.Resolving), splashStates)
    }
}