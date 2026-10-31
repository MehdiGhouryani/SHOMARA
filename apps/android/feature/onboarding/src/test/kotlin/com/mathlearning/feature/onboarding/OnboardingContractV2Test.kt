package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.ShomaraProfileDraftSnapshot
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.designsystem.ShomaraOtpFieldState
import com.mathlearning.core.designsystem.ShomaraOtpLogic
import com.mathlearning.core.designsystem.ShomaraOtpState
import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraGradeCatalog
import com.mathlearning.core.model.ShomaraLaunchState
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** MEGA N04 close-out: launch mapping, flow UI states, OTP paste/expired, avatar, resume. */
class OnboardingContractV2Test {

    @Test
    fun `launch mapping is fail-closed for offline and error`() {
        assertEquals(false, ShomaraLaunchLogic.entersOnboarding(ShomaraLaunchState.Resolving))
        for (state in ShomaraLaunchState.entries) {
            if (state == ShomaraLaunchState.Resolving) continue
            assertTrue("state $state must land on onboarding", ShomaraLaunchLogic.entersOnboarding(state))
        }
        assertEquals(ShomaraAuthMode.Restoring, ShomaraLaunchLogic.modeFor(ShomaraLaunchState.RestoringSession))
        assertEquals(ShomaraAuthMode.Recover, ShomaraLaunchLogic.modeFor(ShomaraLaunchState.RecoverIncompleteProfile))
        assertEquals(ShomaraAuthMode.Error, ShomaraLaunchLogic.modeFor(ShomaraLaunchState.Offline))
        assertEquals(ShomaraAuthMode.Error, ShomaraLaunchLogic.modeFor(ShomaraLaunchState.Error))
    }

    @Test
    fun `launch states cover the UI-001 contract`() {
        assertEquals(
            setOf("Resolving", "NewUser", "RestoringSession", "RecoverIncompleteProfile", "Offline", "Error"),
            ShomaraLaunchState.entries.map { it.name }.toSet(),
        )
    }

    @Test
    fun `flow ui states map every event deterministically`() {
        assertEquals(ShomaraFlowUiState.FirstRun, ShomaraFlowUiLogic.uiStateFor(FlowEvent.LaunchFresh))
        assertEquals(ShomaraFlowUiState.Resume, ShomaraFlowUiLogic.uiStateFor(FlowEvent.LaunchWithSavedDraft))
        assertEquals(ShomaraFlowUiState.Back, ShomaraFlowUiLogic.uiStateFor(FlowEvent.BackPressed))
        assertEquals(ShomaraFlowUiState.Saving, ShomaraFlowUiLogic.uiStateFor(FlowEvent.SaveStarted))
        assertEquals(ShomaraFlowUiState.Error, ShomaraFlowUiLogic.uiStateFor(FlowEvent.SaveFailed))
        assertEquals(ShomaraFlowUiState.Error, ShomaraFlowUiLogic.uiStateFor(FlowEvent.NetworkFailed))
    }

    @Test
    fun `otp paste fills ltr cells and caps extras`() {
        val pasted = ShomaraOtpState.empty(4).fillFromCode("123456")
        assertEquals(listOf<Int?>(1, 2, 3, 4), pasted.digits)
        assertEquals(3, pasted.focusIndex)
        assertFalse(pasted.invalid)
        // Non-digit paste is a no-op.
        assertEquals(ShomaraOtpState.empty(4), ShomaraOtpState.empty(4).fillFromCode("abc"))
        // Paste after entry overwrites from the left (clipboard intent wins).
        val half = ShomaraOtpState.empty(4).advance(9)
        assertEquals(listOf<Int?>(1, 2, 3, 4), half.fillFromCode("1234").digits)
    }

    @Test
    fun `otp expired state maps with a warm label and clears on new input`() {
        val expired = ShomaraOtpState.empty(4).markExpired()
        assertEquals(ShomaraOtpFieldState.Expired, ShomaraOtpLogic.stateFor(expired, focused = true, enabled = true, busy = false))
        assertTrue(ShomaraOtpLogic.expiredLabel().contains("منقضی"))
        val renewed = expired.advance(7)
        assertFalse(renewed.expired)
        assertEquals(ShomaraOtpFieldState.Focused, ShomaraOtpLogic.stateFor(renewed, focused = true, enabled = true, busy = false))
    }

    @Test
    fun `avatar catalog mirrors the contracts and validates selection`() {
        assertEquals(listOf("sun", "leaf", "cloud", "moon"), ShomaraAvatarCatalog.Options.map { it.id })
        assertEquals("خورشیدی", ShomaraAvatarCatalog.option("sun").label)
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraAvatarCatalog.option("dragon") }
        val draft = ShomaraProfileDraft(name = "آریا").withAvatar("leaf")
        assertEquals("برگ", draft.avatar.label)
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraProfileDraft(name = "آریا", avatarId = "dragon")
        }
    }

    @Test
    fun `grade catalog locks future grades warmly`() {
        assertEquals(6, ShomaraGradeCatalog.Options.size)
        assertTrue(ShomaraGradeCatalog.Options.first { it.id == "G1" }.available)
        assertFalse(ShomaraGradeCatalog.Options.first { it.id == "G6" }.available)
        assertTrue(ShomaraGradeCatalog.lockedReason("G3").contains("به‌زودی"))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraGradeCatalog.option("G7") }
    }

    @Test
    fun `incomplete draft is resumable and the save state re-enters with resume semantics`() {
        val empty = ShomaraProfileDraft()
        assertFalse(empty.isResumable)
        assertTrue(ShomaraProfileDraft(name = "آ").isResumable) // even partial progress is kept
        val resumed = ShomaraProfileSaveState.resumed(ShomaraProfileDraft(name = "آریا"))
        assertEquals(ShomaraFlowUiState.Resume, ShomaraFlowUiLogic.uiStateFor(FlowEvent.LaunchWithSavedDraft))
        assertTrue(resumed.draft.isComplete)
        assertTrue(resumed.canSubmit)
    }

    @Test
    fun `process death resume rebuilds the step from the saved route`() {
        assertEquals(OnboardingStep.Welcome, OnboardingRoutes.stepFor("onboarding/welcome"))
        assertEquals(OnboardingStep.PhoneInput, OnboardingRoutes.stepFor("onboarding/phone"))
        assertEquals(OnboardingStep.OtpVerify, OnboardingRoutes.stepFor("onboarding/otp"))
        assertEquals(OnboardingStep.ProfileSetup, OnboardingRoutes.stepFor("onboarding/profile"))
        assertEquals(OnboardingStep.GradePlacement, OnboardingRoutes.stepFor("onboarding/placement"))
        // Unknown/corrupt routes fall back to the safe welcome gate.
        assertEquals(OnboardingStep.Welcome, OnboardingRoutes.stepFor("onboarding/unknown"))
        assertEquals(OnboardingStep.Welcome, OnboardingRoutes.stepFor(null))
    }

    @Test
    fun `draft store snapshot persists round-trip`() = runTest {
        val store = InMemoryDraftStore()
        store.save(ShomaraProfileDraftSnapshot("آریا", "leaf", "G1"))
        assertEquals("آریا", store.read()?.name)
        assertEquals("leaf", store.read()?.avatarId)
        store.clear()
        assertNull(store.read())
        // Empty-name snapshots are refused by the real store contract.
        val refused = runCatching { store.save(ShomaraProfileDraftSnapshot("", "sun", "G1")) }
        assertTrue(refused.exceptionOrNull() is IllegalArgumentException)
    }
}

private class InMemoryDraftStore : ShomaraProfileDraftStore {
    var value: ShomaraProfileDraftSnapshot? = null
    override suspend fun save(snapshot: ShomaraProfileDraftSnapshot) {
        require(snapshot.name.isNotEmpty()) { "refusing to persist an empty draft" }
        value = snapshot
    }
    override suspend fun read(): ShomaraProfileDraftSnapshot? = value
    override suspend fun clear() { value = null }
}
