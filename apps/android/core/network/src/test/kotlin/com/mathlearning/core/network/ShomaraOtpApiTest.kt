package com.mathlearning.core.network

import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.SocketPolicy
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

/** N04-03 real-HTTP OTP API tests: every negative path against a live MockWebServer. */
class ShomaraOtpApiTest {

    private lateinit var server: MockWebServer
    private lateinit var api: ShomaraOtpApi

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        val client = OkHttpClient.Builder()
            .connectTimeout(1, TimeUnit.SECONDS)
            .readTimeout(1, TimeUnit.SECONDS)
            .build()
        api = ShomaraOtpApi(client, endpoints = {
            ShomaraOtpEndpoints(
                start = server.url("/api/v1/auth/otp/start").toString(),
                verify = server.url("/api/v1/auth/otp/verify").toString(),
            )
        })
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `request posts canonical json and parses success`() = runTest {
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-1\"}"))
        val result = api.requestOtp("09123456789")
        assertTrue(result is ShomaraOtpResult.Success)
        assertEquals("tok-1", (result as ShomaraOtpResult.Success).accessToken)
        val recorded = server.takeRequest()
        assertEquals("/api/v1/auth/otp/start", recorded.path)
        assertTrue(recorded.body.readUtf8().contains("\"phone\":\"09123456789\""))
    }

    @Test
    fun `verify without token yields server error outcome`() = runTest {
        server.enqueue(MockResponse().setBody("{\"ok\":true}"))
        val result = api.verifyOtp("09123456789", "123456")
        // HTTP 200 but no access_token: Success(null) — the session layer decides (fail-closed).
        assertTrue(result is ShomaraOtpResult.Success)
        assertNull((result as ShomaraOtpResult.Success).accessToken)
    }

    @Test
    fun `http 429 maps to rate limited with retry-after`() = runTest {
        server.enqueue(MockResponse().setResponseCode(429).setHeader("Retry-After", "30"))
        val result = api.requestOtp("09123456789")
        assertTrue(result is ShomaraOtpResult.Failure)
        assertEquals(ShomaraNetworkError.RateLimited, (result as ShomaraOtpResult.Failure).failure.error)
        assertEquals(30L, ShomaraNetworkMapping.retryAfterSeconds(mapOf("Retry-After" to "30")))
    }

    @Test
    fun `http 400 maps to invalid request`() = runTest {
        server.enqueue(MockResponse().setResponseCode(400))
        val result = api.verifyOtp("09123456789", "000000")
        assertEquals(ShomaraNetworkError.InvalidRequest, (result as ShomaraOtpResult.Failure).failure.error)
    }

    @Test
    fun `http 500 maps to server error`() = runTest {
        server.enqueue(MockResponse().setResponseCode(503))
        assertEquals(ShomaraNetworkError.ServerError, (api.requestOtp("09123456789") as ShomaraOtpResult.Failure).failure.error)
    }

    @Test
    fun `delayed response maps to timeout`() = runTest {
        server.enqueue(MockResponse().setSocketPolicy(SocketPolicy.NO_RESPONSE))
        val result = api.requestOtp("09123456789")
        assertEquals(ShomaraNetworkError.Timeout, (result as ShomaraOtpResult.Failure).failure.error)
    }

    @Test
    fun `connection refused maps to offline`() = runTest {
        // Port 1 on loopback refuses immediately -> pure IOException, no server semantics involved.
        val refused = ShomaraOtpApi(
            client = OkHttpClient.Builder().connectTimeout(1, TimeUnit.SECONDS).build(),
            endpoints = { ShomaraOtpEndpoints(start = "http://127.0.0.1:1/api/v1/auth/otp/start", verify = "http://127.0.0.1:1/x") },
        )
        val result = refused.requestOtp("09123456789")
        assertEquals(ShomaraNetworkError.Offline, (result as ShomaraOtpResult.Failure).failure.error)
    }

    @Test
    fun `unconfigured endpoints fail closed without any network call`() = runTest {
        val unconfigured = ShomaraOtpApi(OkHttpClient(), endpoints = { null })
        val result = unconfigured.requestOtp("09123456789")
        assertEquals(ShomaraNetworkError.InvalidRequest, (result as ShomaraOtpResult.Failure).failure.error)
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `json extraction handles escapes and missing keys`() {
        assertEquals("a\"b", ShomaraJson.extractString("{\"k\":\"a\\\"b\"}", "k"))
        assertEquals("x\ny", ShomaraJson.extractString("{\"k\":\"x\\ny\"}", "k"))
        assertNull(ShomaraJson.extractString("{\"other\":1}", "k"))
        assertNull(ShomaraJson.extractString("{\"k\":12}", "k"))
        assertEquals("v", ShomaraJson.extractString(" { \"k\" : \"v\" } ", "k"))
    }

    @Test
    fun `throttle enforces cooldown then escalation on 429`() {
        val throttle = ShomaraOtpThrottle(defaultCooldownMs = 60_000)
        assertTrue(throttle.canRequest(0))
        throttle.onRequested(0)
        assertFalse(throttle.canRequest(59_999))
        assertTrue(throttle.canRequest(60_000))
        throttle.onRateLimited(60_000) // attempts=2 -> 120s
        assertEquals(120_000L, throttle.remainingMs(60_000))
        throttle.reset()
        assertTrue(throttle.canRequest(0))
    }

    @Test
    fun `server retry-after caps the client cooldown`() {
        val throttle = ShomaraOtpThrottle(defaultCooldownMs = 1_000, maxCooldownMs = 10_000)
        throttle.onRequested(0, retryAfterSeconds = 9_000) // clamped to max 10s
        assertEquals(10_000L, throttle.remainingMs(0))
    }
}

