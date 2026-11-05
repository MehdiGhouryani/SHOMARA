// SPDX-License-Identifier: Apache-2.0
package com.mathlearning.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * R-09/R-10 — the restore Saver saves phone + step only (the OTP is never saved), and
 * any step that needs a live session clamps back to PhoneInput. Progress counts
 * COMPLETED steps only (option a): entering a step never announces progress.
 */
class ShomaraOnboardingRestoreTest {

    @Test
    fun `welcome and phone input restore as themselves`() {
        assertEquals(OnboardingStep.Welcome, ShomaraOnboardingRestore.clampStep(OnboardingStep.Welcome))
        assertEquals(OnboardingStep.PhoneInput, ShomaraOnboardingRestore.clampStep(OnboardingStep.PhoneInput))
    }

    @Test
    fun `steps past the phone gate clamp back to phone input - never a stale session`() {
        // OtpVerify, ProfileSetup and GradePlacement all need a live session; a process
        // death between them must not restore into a step whose state is gone.
        assertEquals(OnboardingStep.PhoneInput, ShomaraOnboardingRestore.clampStep(OnboardingStep.OtpVerify))
        assertEquals(OnboardingStep.PhoneInput, ShomaraOnboardingRestore.clampStep(OnboardingStep.ProfileSetup))
        assertEquals(OnboardingStep.PhoneInput, ShomaraOnboardingRestore.clampStep(OnboardingStep.GradePlacement))
    }

    @Test
    fun `complete restores to welcome - never a finished flow`() {
        assertEquals(OnboardingStep.Welcome, ShomaraOnboardingRestore.clampStep(OnboardingStep.Complete))
    }

    @Test
    fun `encode and decode round-trip phone and clamped step`() {
        val encoded = ShomaraOnboardingRestore.encode("09123456789", OnboardingStep.OtpVerify)
        val decoded = ShomaraOnboardingRestore.decode(encoded)
        assertEquals("09123456789", decoded.first)
        assertEquals(OnboardingStep.PhoneInput, decoded.second)
        // The encoding carries no OTP, ever.
        assertEquals(2, encoded.size)
    }

    @Test
    fun `decode of a corrupt value falls back to empty phone and welcome`() {
        assertEquals("" to OnboardingStep.Welcome, ShomaraOnboardingRestore.decode(emptyList()))
        assertEquals("" to OnboardingStep.Welcome, ShomaraOnboardingRestore.decode(listOf("09123456789", "NotAStep")))
        assertEquals("" to OnboardingStep.Welcome, ShomaraOnboardingRestore.decode(listOf("09123456789")))
    }

    @Test
    fun `progress fractions count completed steps only`() {
        assertNull(ShomaraOnboardingProgress.fractionFor(OnboardingStep.Welcome))
        assertEquals(0f, ShomaraOnboardingProgress.fractionFor(OnboardingStep.PhoneInput))
        assertEquals(0.25f, ShomaraOnboardingProgress.fractionFor(OnboardingStep.OtpVerify))
        assertEquals(0.5f, ShomaraOnboardingProgress.fractionFor(OnboardingStep.ProfileSetup))
        assertEquals(0.75f, ShomaraOnboardingProgress.fractionFor(OnboardingStep.GradePlacement))
        assertNull(ShomaraOnboardingProgress.fractionFor(OnboardingStep.Complete))
    }
}
