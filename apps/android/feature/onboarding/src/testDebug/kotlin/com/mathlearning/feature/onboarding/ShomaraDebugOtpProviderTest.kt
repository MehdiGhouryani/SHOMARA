package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.core.network.ShomaraOtpResult
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
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
 * DEBUG-only simulated OTP (N08-15).
 *
 * This test class sits in `src/testDebug` on purpose: the class under test exists only in the debug
 * source set, so a release compilation physically cannot link these tests — which is itself part of
 * the isolation proof (`DemoAuthIsolationTest` scans the variants from the `:app` side).
 *
 * The REAL API is wired to a MockWebServer in every test and is asserted to receive ZERO requests:
 * the simulation must never touch the network, so "no real SMS" is a measured property, not a claim.
 */
class ShomaraDebugOtpProviderTest {

    private class FakeStore : ShomaraTokenStore {
        var value: String? = null
        var clears: Int = 0
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null; clears += 1 }
    }

    private lateinit var server: MockWebServer
    private lateinit var realApi: ShomaraOtpApi
    private lateinit var provider: ShomaraDebugOtpProvider
    private lateinit var store: FakeStore

    private val phone = "09123456789"

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        realApi = ShomaraOtpApi(
            client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
            endpoints = {
                ShomaraOtpEndpoints(
                    start = server.url("/api/v1/auth/otp/start").toString(),
                    verify = server.url("/api/v1/auth/otp/verify").toString(),
                )
            },
        )
        provider = ShomaraDebugOtpProvider(realApi = realApi)
        store = FakeStore()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `the provider declares itself simulated`() {
        assertTrue(provider.isSimulated)
    }

    @Test
    fun `a valid number plus the documented development code verifies without any network call`() {
        assertTrue(provider.requestOtp(phone) is ShomaraOtpResult.Success)
        val verified = provider.verifyOtp(phone, ShomaraSimulatedAuth.DevelopmentCode)
        assertTrue(verified is ShomaraOtpResult.Success)
        // The whole point of the simulation: nothing left the device.
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `the minted token is recognisable as simulated`() {
        provider.requestOtp(phone)
        val token = (provider.verifyOtp(phone, ShomaraSimulatedAuth.DevelopmentCode) as ShomaraOtpResult.Success).accessToken
        assertTrue(ShomaraSimulatedAuth.isSimulatedToken(token))
        assertTrue(token!!.startsWith(ShomaraSimulatedAuth.TokenPrefix))
    }

    @Test
    fun `a wrong code is refused and mints nothing`() {
        provider.requestOtp(phone)
        val result = provider.verifyOtp(phone, "9999")
        assertTrue(result is ShomaraOtpResult.Failure)
        assertEquals(ShomaraNetworkError.InvalidRequest, (result as ShomaraOtpResult.Failure).failure.error)
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `an invalid mobile number is refused exactly like production`() {
        assertTrue(provider.requestOtp("12345") is ShomaraOtpResult.Failure)
        assertTrue(provider.verifyOtp("12345", ShomaraSimulatedAuth.DevelopmentCode) is ShomaraOtpResult.Failure)
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `verifying a number that never requested a code is refused`() {
        val result = provider.verifyOtp(phone, ShomaraSimulatedAuth.DevelopmentCode)
        assertTrue(result is ShomaraOtpResult.Failure)
    }

    @Test
    fun `a debug session accepts the simulated credential when the build allows it`() = runTest {
        val session = ShomaraAuthSession(api = provider, store = store, now = { 5_000L }, allowSimulated = true)
        session.requestOtp(phone)
        assertEquals(VerifyOutcome.Verified, session.verifyOtp(phone, ShomaraSimulatedAuth.DevelopmentCode))
        assertTrue(store.value!!.startsWith(ShomaraSimulatedAuth.TokenPrefix))
        assertTrue(session.isSimulatedSession)
        // Debug flow keeps working across a restart.
        assertEquals(RestoreOutcome.Verified, session.restore())
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `the same simulated credential is rejected on a production path`() = runTest {
        // allowSimulated defaults to false: this is exactly the release configuration.
        val session = ShomaraAuthSession(api = provider, store = store, now = { 5_000L })
        session.requestOtp(phone)
        val outcome = session.verifyOtp(phone, ShomaraSimulatedAuth.DevelopmentCode)
        assertTrue(outcome is VerifyOutcome.Failed)
        assertEquals(
            ShomaraNetworkError.InvalidRequest,
            (outcome as VerifyOutcome.Failed).failure.error,
        )
        assertNull(store.value)
        assertFalse(session.isSimulatedSession)
    }

    @Test
    fun `a stored simulated credential is purged when the production path restores`() = runTest {
        store.value = ShomaraSimulatedAuth.tokenFor("pre-existing")
        val session = ShomaraAuthSession(api = provider, store = store, now = { 5_000L })
        assertEquals(RestoreOutcome.ServerRejected, session.restore())
        assertNull(store.value)
        assertNull(session.authenticatedToken)
        assertEquals(0, server.requestCount)
    }
}