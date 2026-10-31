package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraOtpApi
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
 * N04-03/N04-05 orchestrator tests with the REAL OtpApi over MockWebServer and an in-memory
 * store mirroring the DataStore contract.
 */
class ShomaraAuthSessionTest {

    private class FakeStore : ShomaraTokenStore {
        var value: String? = null
        var clears: Int = 0
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null; clears += 1 }
    }

    private lateinit var server: MockWebServer
    private lateinit var store: FakeStore
    private lateinit var session: ShomaraAuthSession

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        val api = ShomaraOtpApi(
            client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
            endpoints = {
                ShomaraOtpEndpoints(
                    start = server.url("/api/v1/auth/otp/start").toString(),
                    verify = server.url("/api/v1/auth/otp/verify").toString(),
                )
            },
        )
        store = FakeStore()
        session = ShomaraAuthSession(api = api, store = store, throttle = ShomaraOtpThrottle(), now = { 0L })
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `verify persists the token only on success`() = runTest {
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-ok\"}"))
        assertTrue(session.verifyOtp("09123456789", "123456") is VerifyOutcome.Verified)
        assertEquals("tok-ok", store.value)
        assertEquals("tok-ok", session.authenticatedToken)
    }

    @Test
    fun `verify failure never stores anything`() = runTest {
        server.enqueue(MockResponse().setResponseCode(400))
        val outcome = session.verifyOtp("09123456789", "000000")
        assertTrue(outcome is VerifyOutcome.Failed)
        assertEquals(ShomaraNetworkError.InvalidRequest, (outcome as VerifyOutcome.Failed).failure.error)
        assertNull(store.value)
        assertNull(session.authenticatedToken)
    }

    @Test
    fun `verify response without token fails closed`() = runTest {
        server.enqueue(MockResponse().setBody("{\"ok\":true}"))
        val outcome = session.verifyOtp("09123456789", "123456")
        assertTrue(outcome is VerifyOutcome.Failed)
        assertNull(store.value)
    }

    @Test
    fun `request enforces the local throttle and escalates on 429`() = runTest {
        server.enqueue(MockResponse().setBody("{\"sent\":true}"))
        assertTrue(session.requestOtp("09123456789") is RequestOutcome.Sent)
        // Within the cooldown (now=0 frozen clock) the next request is throttled locally.
        val throttled = session.requestOtp("09123456789")
        assertTrue(throttled is RequestOutcome.Throttled)
        // 429 escalates the cooldown.
        server.enqueue(MockResponse().setResponseCode(429))
        assertTrue(session.requestOtp("09123456789") is RequestOutcome.Throttled)
    }

    @Test
    fun `restore with a stored token verifies server-side and keeps it`() = runTest {
        store.value = "tok-restore"
        server.enqueue(MockResponse().setBody("{\"access_token\":\"tok-restore\"}"))
        assertEquals(RestoreOutcome.Verified, session.restore())
        assertEquals("tok-restore", session.authenticatedToken)
        assertEquals(0, store.clears)
    }

    @Test
    fun `restore with server rejection clears the secret immediately`() = runTest {
        store.value = "tok-stale"
        server.enqueue(MockResponse().setResponseCode(400))
        assertEquals(RestoreOutcome.ServerRejected, session.restore())
        assertNull(store.value)
        assertEquals(1, store.clears)
    }

    @Test
    fun `restore offline keeps the token for a later retry - never locks the child out silently`() = runTest {
        store.value = "tok-keep"
        server.enqueue(MockResponse().setSocketPolicy(okhttp3.mockwebserver.SocketPolicy.DISCONNECT_AT_START))
        assertEquals(RestoreOutcome.NetworkUnavailable, session.restore())
        assertEquals("tok-keep", store.value)
    }

    @Test
    fun `restore without a stored token fails closed and clears`() = runTest {
        assertEquals(RestoreOutcome.TokenMissing, session.restore())
        assertEquals(1, store.clears)
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `signOut always clears the secret`() = runTest {
        store.value = "tok-x"
        session.signOut()
        assertNull(store.value)
        assertNull(session.authenticatedToken)
        assertEquals(1, store.clears)
    }
}
