package com.mathlearning.feature.onboarding

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

/** N04-05 session restore/expiry fail-closed tests. */
class SessionExpiryTest {

    private class FakeStore : com.mathlearning.core.datastore.ShomaraTokenStore {
        var value: String? = null
        var clears: Int = 0
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null; clears += 1 }
    }

    private lateinit var server: MockWebServer
    private lateinit var store: FakeStore
    private lateinit var api: ShomaraOtpApi
    private var nowMs: Long = 1_000_000L

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        api = ShomaraOtpApi(
            client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
            endpoints = {
                ShomaraOtpEndpoints(
                    start = server.url("/api/v1/auth/otp/start").toString(),
                    verify = server.url("/api/v1/auth/otp/verify").toString(),
                )
            },
        )
        store = FakeStore()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    private fun session(): ShomaraAuthSession =
        ShomaraAuthSession(api = api, store = store, throttle = ShomaraOtpThrottle(), now = { nowMs })

    @Test
    fun `expiry policy - boundary is inclusive and missing timestamp is expired`() {
        val at = 1_000L
        assertEquals(at + ShomaraSessionExpiry.TtlMs, ShomaraSessionExpiry.expiresAt(at))
        assertFalse(ShomaraSessionExpiry.isExpired(at, at + ShomaraSessionExpiry.TtlMs - 1))
        assertTrue(ShomaraSessionExpiry.isExpired(at, at + ShomaraSessionExpiry.TtlMs))
        assertTrue(ShomaraSessionExpiry.isExpired(null, 0L))
    }

    @Test
    fun `expired session is torn down and the secret cleared`() = runTest {
        val s = session()
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-old\"}"))
        assertTrue(s.verifyOtp("09123456789", "123456") is VerifyOutcome.Verified)
        assertEquals("tok-old", store.value)
        nowMs += ShomaraSessionExpiry.TtlMs + 1
        assertFalse(s.ensureUnexpired(nowMs))
        assertNull(store.value)
        assertNull(s.authenticatedToken)
        assertEquals(1, store.clears)
    }

    @Test
    fun `fresh session survives the unexpired check without side effects`() = runTest {
        val s = session()
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-new\"}"))
        assertTrue(s.verifyOtp("09123456789", "123456") is VerifyOutcome.Verified)
        nowMs += ShomaraSessionExpiry.TtlMs - 1
        assertTrue(s.ensureUnexpired(nowMs))
        assertEquals("tok-new", store.value)
        assertEquals(0, store.clears)
    }

    @Test
    fun `auth gate routes every combination fail-closed`() {
        assertEquals(ShomaraAuthGate.Surface.ChildShell, ShomaraAuthGate.decide(authenticated = true, sessionExpired = false))
        assertEquals(ShomaraAuthGate.Surface.OnboardingRestoring, ShomaraAuthGate.decide(authenticated = true, sessionExpired = true))
        assertEquals(ShomaraAuthGate.Surface.OnboardingNew, ShomaraAuthGate.decide(authenticated = false, sessionExpired = false))
        assertEquals(ShomaraAuthGate.Surface.OnboardingNew, ShomaraAuthGate.decide(authenticated = false, sessionExpired = true))
    }
}
