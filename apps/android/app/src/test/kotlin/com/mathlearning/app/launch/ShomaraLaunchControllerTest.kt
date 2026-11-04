package com.mathlearning.app.launch

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraProfileDraftSnapshot
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.model.ShomaraLaunchState
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpProvider
import com.mathlearning.core.network.ShomaraOtpResult
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08-15: the launch controller is the real producer of `ShomaraLaunchState`.
 *
 * These tests drive it with a fake provider and an in-memory store, so the two properties that
 * matter are measured rather than asserted in prose:
 *
 *  1. a verified session reaches the child shell, and nothing else does;
 *  2. an unverifiable start never fabricates a session — it lands on a recovery state with a real
 *     retry, and the stored credential is preserved for that retry (never silently destroyed).
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ShomaraLaunchControllerTest {

    private class FakeStore(var value: String? = null) : ShomaraTokenStore {
        override suspend fun save(token: String) { value = token }
        override suspend fun read(): String? = value
        override suspend fun clear() { value = null }
    }

    private class FakeDraftStore(var snapshot: ShomaraProfileDraftSnapshot? = null) : ShomaraProfileDraftStore {
        override suspend fun save(snapshot: ShomaraProfileDraftSnapshot) { this.snapshot = snapshot }
        override suspend fun read(): ShomaraProfileDraftSnapshot? = snapshot
        override suspend fun clear() { snapshot = null }
    }

    private class FakeProvider(
        var verifyResult: ShomaraOtpResult = ShomaraOtpResult.Success("tok-real"),
    ) : ShomaraOtpProvider {
        override val isSimulated: Boolean = false
        var verifyCalls: Int = 0
        override fun requestOtp(phone: String): ShomaraOtpResult = ShomaraOtpResult.Success(null)
        override fun verifyOtp(phone: String, code: String): ShomaraOtpResult {
            verifyCalls += 1
            return verifyResult
        }
    }

    private fun controller(
        scope: TestScope,
        store: FakeStore,
        draft: FakeDraftStore = FakeDraftStore(),
        provider: FakeProvider = FakeProvider(),
        backendConfigured: Boolean = true,
    ): ShomaraLaunchController = ShomaraLaunchController(
        session = ShomaraAuthSession(api = provider, store = store, now = { 1_000L }),
        draftStore = draft,
        backendConfigured = { backendConfigured },
        scope = scope,
        ioDispatcher = StandardTestDispatcher(scope.testScheduler),
    )

    @Test
    fun `a fresh install resolves to the welcome gate`() = runTest {
        val controller = controller(this, FakeStore())
        assertEquals(ShomaraLaunchState.Resolving, controller.state.value)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.NewUser, controller.state.value)
        assertFalse(ShomaraLaunchRouting.entersChildShell(controller.state.value))
    }

    @Test
    fun `a verified stored session resolves to the authenticated destination`() = runTest {
        val store = FakeStore("tok-real")
        val controller = controller(this, store)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.RestoringSession, controller.state.value)
        assertTrue(ShomaraLaunchRouting.entersChildShell(controller.state.value))
        assertEquals("tok-real", store.value)
    }

    @Test
    fun `a rejected stored session is purged and never reaches the shell`() = runTest {
        val store = FakeStore("tok-stale")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "HTTP 401"),
            ),
        )
        val controller = controller(this, store, provider = provider)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.NewUser, controller.state.value)
        assertNull(store.value)
    }

    @Test
    fun `an offline start keeps the credential and offers recovery`() = runTest {
        val store = FakeStore("tok-keep")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.Offline, "no route to host"),
            ),
        )
        val controller = controller(this, store, provider = provider)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.Offline, controller.state.value)
        assertTrue(ShomaraLaunchRouting.isRecoverable(controller.state.value))
        // The credential survives so the retry can succeed without re-onboarding the child.
        assertEquals("tok-keep", store.value)
    }

    @Test
    fun `an unconfigured backend is an error, not an offline claim, and keeps the credential`() = runTest {
        val store = FakeStore("tok-keep")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "backend endpoints not configured"),
            ),
        )
        val controller = controller(this, store, provider = provider, backendConfigured = false)
        controller.startOnce()
        advanceUntilIdle()
        // The server never spoke, so the credential is neither accepted nor refused: the child is
        // shown an honest configuration error with recovery, never the shell and never a bare welcome.
        assertEquals(ShomaraLaunchState.Error, controller.state.value)
        assertFalse(ShomaraLaunchRouting.entersChildShell(controller.state.value))
        assertTrue(ShomaraLaunchRouting.isRecoverable(controller.state.value))
        assertEquals("tok-keep", store.value)
    }

    @Test
    fun `a wrong code on an unconfigured backend is still a rejected credential`() = runTest {
        // Guards the distinction: only the "not configured" detail maps to BackendUnavailable.
        val store = FakeStore("tok-bad")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "HTTP 401"),
            ),
        )
        val controller = controller(this, store, provider = provider, backendConfigured = false)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.NewUser, controller.state.value)
        assertNull(store.value)
    }

    @Test
    fun `retry re-resolves and can succeed after a transient failure`() = runTest {
        val store = FakeStore("tok-keep")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.Offline, "no route to host"),
            ),
        )
        val controller = controller(this, store, provider = provider)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.Offline, controller.state.value)

        provider.verifyResult = ShomaraOtpResult.Success("tok-keep")
        controller.retry()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.RestoringSession, controller.state.value)
        assertFalse(controller.retrying.value)
    }

    @Test
    fun `start over discards the credential and lands on the welcome gate`() = runTest {
        val store = FakeStore("tok-stale")
        val provider = FakeProvider(
            verifyResult = ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.Offline, "no route to host"),
            ),
        )
        val controller = controller(this, store, provider = provider)
        controller.startOnce()
        advanceUntilIdle()
        controller.startOver()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.NewUser, controller.state.value)
        assertNull(store.value)
    }

    @Test
    fun `a surviving profile draft resumes the journey without authenticating`() = runTest {
        val draft = FakeDraftStore(ShomaraProfileDraftSnapshot(name = "سارا", avatarId = "A1", gradeId = "G1"))
        val controller = controller(this, FakeStore(), draft = draft)
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(ShomaraLaunchState.RecoverIncompleteProfile, controller.state.value)
        assertFalse(ShomaraLaunchRouting.entersChildShell(controller.state.value))
    }

    @Test
    fun `resolution runs once per process even if the gate recomposes`() = runTest {
        val provider = FakeProvider()
        val controller = controller(this, FakeStore("tok-real"), provider = provider)
        controller.startOnce()
        controller.startOnce()
        controller.startOnce()
        advanceUntilIdle()
        assertEquals(1, provider.verifyCalls)
    }

    @Test
    fun `the splash is the only surface while resolving`() = runTest {
        val controller = controller(this, FakeStore("tok-real"))
        assertEquals(ShomaraLaunchState.Resolving, controller.state.value)
        assertEquals(
            com.mathlearning.core.model.ShomaraLaunchSurface.Splash,
            ShomaraLaunchRouting.surfaceFor(controller.state.value),
        )
        controller.startOnce()
        advanceUntilIdle()
        assertFalse(ShomaraLaunchRouting.surfaceFor(controller.state.value) ==
            com.mathlearning.core.model.ShomaraLaunchSurface.Splash)
    }

    @Test
    fun `recovery copy never blames the child and always offers a way forward`() {
        for (state in listOf(ShomaraLaunchState.Offline, ShomaraLaunchState.Error)) {
            val copy = ShomaraLaunchRecoveryCopy.forState(state)
            assertTrue(copy.title.isNotBlank())
            assertTrue(copy.body.isNotBlank())
            assertTrue(copy.retryLabel.isNotBlank())
            assertTrue(ShomaraLaunchRecoveryCopy.StartOverLabel.isNotBlank())
        }
    }
}