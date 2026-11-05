package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.core.network.ShomaraOtpThrottle
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.TimeUnit

/** N04-01 onboarding state contract tests. */
class OnboardingContractTest {

    private class FakeStore : ShomaraTokenStore {
        var value: String? = null
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null }
    }

    @Test
    fun `guest entry is impossible in production - contract constant`() {
        assertFalse(ShomaraOnboardingFlow.GuestEntryAllowed)
    }

    @Test
    fun `canonical route order matches the mandated step order`() {
        assertEquals(
            listOf(
                OnboardingRoutes.Welcome,
                OnboardingRoutes.PhoneInput,
                OnboardingRoutes.OtpVerify,
                OnboardingRoutes.ProfileSetup,
                OnboardingRoutes.GradePlacement,
            ),
            OnboardingRoutes.Ordered,
        )
        val steps = listOf(OnboardingStep.Welcome, OnboardingStep.PhoneInput, OnboardingStep.OtpVerify, OnboardingStep.ProfileSetup, OnboardingStep.GradePlacement)
        for ((index, step) in steps.withIndex()) {
            assertEquals(OnboardingRoutes.Ordered[index], ShomaraOnboardingFlow(step = step).stepRoute())
        }
        // Advancing from Welcome lands on PhoneInput.
        assertEquals(OnboardingRoutes.PhoneInput, ShomaraOnboardingFlow().advanceTo(OnboardingStep.PhoneInput).stepRoute())
    }

    @Test
    fun `flow never steps backwards`() {
        val flow = ShomaraOnboardingFlow().advanceTo(OnboardingStep.OtpVerify)
        assertThrows(IllegalArgumentException::class.java) { flow.advanceTo(OnboardingStep.Welcome) }
    }

    @Test
    fun `restoring mode re-enters through the welcome gate`() {
        val flow = ShomaraOnboardingFlow(mode = ShomaraAuthMode.Restoring)
        assertEquals(OnboardingStep.Welcome, flow.step)
        assertThrows(IllegalArgumentException::class.java) {
            ShomaraOnboardingFlow(mode = ShomaraAuthMode.Restoring, step = OnboardingStep.OtpVerify)
        }
    }

    @Test
    fun `restore entry fails closed - authenticated state can never enter the restore path`() {
        // A still-valid authenticated session must NOT travel the restore path silently.
        assertThrows(IllegalStateException::class.java) {
            ShomaraOnboardingFlow.entryStateFor(ShomaraAuthMode.Restoring, AuthSessionState.Authenticated("token-1"))
        }
        // Signed-out / expired sessions enter the welcome gate in restoring mode.
        assertEquals(OnboardingStep.Welcome, ShomaraOnboardingFlow.entryStateFor(ShomaraAuthMode.Restoring, AuthSessionState.SignedOut).step)
        assertEquals(OnboardingStep.Welcome, ShomaraOnboardingFlow.entryStateFor(ShomaraAuthMode.Restoring, AuthSessionState.Expired).step)
        assertEquals(ShomaraAuthMode.Restoring, ShomaraOnboardingFlow.entryStateFor(ShomaraAuthMode.Restoring, AuthSessionState.SignedOut).mode)
    }

    @Test
    fun `authenticated session always carries a token`() {
        assertThrows(IllegalArgumentException::class.java) { AuthSessionState.Authenticated("  ") }
        assertTrue(AuthSessionState.Authenticated("t").accessToken == "t")
    }

    @Test
    fun `modes cover new restoring recover error`() {
        assertEquals(setOf("New", "Restoring", "Recover", "Error"), ShomaraAuthMode.entries.map { it.name }.toSet())
    }

    // F-19: the banner kind follows the error class — a backend-configuration failure is an
    // Error (retrying cannot fix an unconfigured service), a network failure is a Retry.
    // The kind mapping itself (bannerKindFor) is a private function of the host, so no JVM
    // test can call it; this test locks the holder-level input the branch reads: the two
    // error classes must produce two distinct banner texts — the unconfigured-service text
    // for a missing session, and the network userMessage for a real network failure. The
    // Error-vs-Retry kind assertion itself needs a Compose test of the host (or internal
    // visibility for bannerKindFor).
    @Test
    fun `backend-not-configured and network errors produce distinct banner texts`() = runTest {
        val unconfigured = ShomaraOnboardingStateHolder(session = null)
        unconfigured.phone = "09123456789"
        unconfigured.requestOtp()
        assertEquals(ShomaraAuthErrorMessages.BackendNotConfigured, unconfigured.banner)

        val offlineSession = ShomaraAuthSession(
            api = ShomaraOtpApi(
                client = OkHttpClient.Builder().connectTimeout(1, TimeUnit.SECONDS).build(),
                endpoints = { ShomaraOtpEndpoints("http://127.0.0.1:1/s", "http://127.0.0.1:1/v") },
            ),
            store = FakeStore(),
            throttle = ShomaraOtpThrottle(defaultCooldownMs = 0),
            now = { 0L },
        )
        val offline = ShomaraOnboardingStateHolder(session = offlineSession)
        offline.phone = "09123456789"
        offline.requestOtp()
        assertEquals(ShomaraNetworkFailure(ShomaraNetworkError.Offline, "test").userMessage(), offline.banner)
        assertNotEquals(ShomaraAuthErrorMessages.BackendNotConfigured, offline.banner)
    }
}
