package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.designsystem.ShomaraOtpState
import com.mathlearning.core.designsystem.ShomaraProgressLogic
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.core.network.ShomaraOtpThrottle
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

/**
 * N04-06 a11y traversal contract tests + N04-07 journey gate (real session over MockWebServer
 * with network negative paths inside the full onboarding flow).
 */
class OnboardingJourneyTest {

    private class FakeStore : ShomaraTokenStore {
        var value: String? = null
        var clears: Int = 0
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null; clears += 1 }
    }

    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    private fun session(store: FakeStore): ShomaraAuthSession = ShomaraAuthSession(
        api = ShomaraOtpApi(
            client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
            endpoints = {
                ShomaraOtpEndpoints(
                    start = server.url("/api/v1/auth/otp/start").toString(),
                    verify = server.url("/api/v1/auth/otp/verify").toString(),
                )
            },
        ),
        store = store,
        throttle = ShomaraOtpThrottle(defaultCooldownMs = 0),
        now = { 0L },
    )

    // ---- N04-06: a11y traversal contracts ----

    @Test
    fun `traversal order covers every step with a leading title and trailing action`() {
        for (step in listOf(OnboardingStep.Welcome, OnboardingStep.PhoneInput, OnboardingStep.OtpVerify, OnboardingStep.ProfileSetup, OnboardingStep.GradePlacement)) {
            val traversal = ShomaraOnboardingA11y.traversalFor(step)
            assertTrue("step $step traversal must not be empty", traversal.isNotEmpty())
            assertTrue("step $step must end with an action", traversal.last().role == "Button")
            assertTrue(traversal.all { it.label.isNotBlank() })
        }
        assertEquals("Heading", ShomaraOnboardingA11y.traversalFor(OnboardingStep.Welcome).first().role)
        assertEquals("Heading", ShomaraOnboardingA11y.traversalFor(OnboardingStep.ProfileSetup).first().role)
    }

    @Test
    fun `otp traversal announces digits in strict ltr order`() {
        val traversal = ShomaraOnboardingA11y.traversalFor(OnboardingStep.OtpVerify)
        val digits = traversal.filter { it.role == "DigitCell" }
        assertEquals(4, digits.size)
        // Persian digit labels ۱..۴ appear in LTR cell order (cell 0 first).
        assertTrue(digits[0].label.contains("۱"))
        assertTrue(digits[1].label.contains("۲"))
        assertTrue(digits[2].label.contains("۳"))
        assertTrue(digits[3].label.contains("۴"))
    }

    @Test
    fun `traversal copy stays warm and free of banned terms`() {
        val all = OnboardingStep.entries.flatMap { ShomaraOnboardingA11y.traversalFor(it) }.map { it.label }
        for (label in all) {
            assertFalse(label.contains("ستاره"))
            assertFalse(label.contains("تنبیه"))
        }
    }

    // ---- N04-07: real journey with network negative paths ----

    @Test
    fun `happy journey - welcome to placement with real http verify`() = runTest {
        val store = FakeStore()
        val holder = ShomaraOnboardingStateHolder(session = session(store))
        assertEquals(OnboardingStep.Welcome, holder.flow.step)

        holder.continueFromWelcome()
        assertEquals(OnboardingStep.PhoneInput, holder.flow.step)

        holder.phone = "۰۹۱۲ ۳۴۵ ۶۷۸۹"
        server.enqueue(MockResponse().setBody("{\"sent\":true}"))
        holder.requestOtp()
        assertEquals(OnboardingStep.OtpVerify, holder.flow.step)

        // Wrong code first: warm banner, no token stored, flow stays.
        server.enqueue(MockResponse().setResponseCode(400))
        holder.otp = ShomaraOtpState.empty(4).advance(1).advance(2).advance(3).advance(4)
        holder.verifyOtp()
        assertEquals(OnboardingStep.OtpVerify, holder.flow.step)
        assertTrue(holder.banner != null)
        assertNull(store.value)

        // Correct code: flow advances and the secret is stored.
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-journey\"}"))
        holder.verifyOtp()
        assertEquals(OnboardingStep.ProfileSetup, holder.flow.step)
        assertEquals("tok-journey", store.value)

        // Profile: incomplete drafts cannot save; the complete draft advances to placement.
        holder.profileDraft = ShomaraProfileDraft(name = "آریا")
        holder.saveState = holder.saveState.copy(draft = holder.profileDraft)
        holder.saveProfile(onComplete = {})
        assertEquals(OnboardingStep.GradePlacement, holder.flow.step)
        assertEquals("tok-journey", store.value)
    }

    @Test
    fun `journey gate - incomplete profile blocks the save step`() = runTest {
        val store = FakeStore()
        val holder = ShomaraOnboardingStateHolder(session = session(store))
        holder.continueFromWelcome()
        holder.phone = "09123456789"
        server.enqueue(MockResponse().setBody("{\"sent\":true}"))
        holder.requestOtp()
        holder.otp = ShomaraOtpState.empty(4).advance(9).advance(9).advance(9).advance(9)
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-2\"}"))
        holder.verifyOtp()
        assertEquals(OnboardingStep.ProfileSetup, holder.flow.step)
        assertFalse(holder.saveState.canSubmit)
        holder.saveProfile(onComplete = {})
        // Incomplete profile: placement is never reached.
        assertEquals(OnboardingStep.ProfileSetup, holder.flow.step)
    }

    @Test
    fun `journey network negative - throttled request keeps the flow on phone with warm banner`() = runTest {
        val store = FakeStore()
        val holder = ShomaraOnboardingStateHolder(session = session(store))
        holder.continueFromWelcome()
        holder.phone = "09123456789"
        // Throttle already armed (cooldown of one hour from the frozen clock 0).
        val preArmedThrottle = ShomaraOtpThrottle(defaultCooldownMs = 3_600_000)
        preArmedThrottle.onRequested(0) // arms the cooldown on the frozen clock
        val holderThrottled = ShomaraOnboardingStateHolder(
            session = ShomaraAuthSession(
                api = ShomaraOtpApi(
                    client = OkHttpClient(),
                    endpoints = { ShomaraOtpEndpoints(server.url("/s").toString(), server.url("/v").toString()) },
                ),
                store = store,
                throttle = preArmedThrottle,
                now = { 0L },
            ),
        )
        holderThrottled.continueFromWelcome()
        holderThrottled.phone = "09123456789"
        holderThrottled.requestOtp()
        assertEquals(OnboardingStep.PhoneInput, holderThrottled.flow.step)
        assertTrue(holderThrottled.banner!!.contains("صبر"))
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `journey network negative - offline verify keeps prior state and no secret`() = runTest {
        val store = FakeStore()
        val offlineSession = ShomaraAuthSession(
            api = ShomaraOtpApi(
                client = OkHttpClient.Builder().connectTimeout(1, TimeUnit.SECONDS).build(),
                endpoints = { ShomaraOtpEndpoints("http://127.0.0.1:1/s", "http://127.0.0.1:1/v") },
            ),
            store = store,
            throttle = ShomaraOtpThrottle(defaultCooldownMs = 0),
            now = { 0L },
        )
        val holder = ShomaraOnboardingStateHolder(session = offlineSession)
        holder.continueFromWelcome()
        holder.phone = "09123456789"
        holder.requestOtp() // offline -> failure banner
        assertEquals(ShomaraNetworkFailure(ShomaraNetworkError.Offline, "test").userMessage(), holder.banner)
        assertEquals(OnboardingStep.PhoneInput, holder.flow.step)
        assertNull(store.value)
    }

    // F-06: the GradePlacement step is not «complete» — the host assigns it the fraction
    // 0.875f (OnboardingHost stepProgressFraction), and the canonical progress bar must
    // announce that fraction in words as «سه‌چهارم راه», never «کامل شد». The step mapping
    // itself is a private function of the host, so this test locks the announcement the
    // bar renders for exactly that fraction (and the 1.0 boundary that alone says complete).
    @Test
    fun `grade placement progress announces three quarters - never complete`() {
        assertEquals(
            "سه‌چهارم راه",
            ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.875f)),
        )
        assertFalse(
            ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.875f))
                .contains("کامل شد"),
        )
        assertEquals("کامل شد", ShomaraProgressLogic.progressWords(1f))
    }

    @Test
    fun `back behavior inside the journey clears the otp and steps back`() {
        val holder = ShomaraOnboardingStateHolder(session = null)
        holder.continueFromWelcome()
        holder.phone = "09123456789"
        holder.flow = holder.flow.advanceTo(OnboardingStep.OtpVerify)
        holder.otp = ShomaraOtpState.empty(4).advance(1)
        assertTrue(holder.back())
        assertEquals(OnboardingStep.PhoneInput, holder.flow.step)
        assertEquals(ShomaraOtpState.empty(4), holder.otp)
        // Welcome has no route behind: back reports false.
        holder.flow = ShomaraOnboardingFlow()
        assertFalse(holder.back())
    }
}
