package com.mathlearning.app.launch

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.model.ShomaraLaunchResolver
import com.mathlearning.core.model.ShomaraLaunchState
import com.mathlearning.core.model.ShomaraLaunchSurface
import com.mathlearning.core.model.ShomaraSessionObservation
import com.mathlearning.core.model.ShomaraUnverifiedReason
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * The real launch-state producer (N08-15).
 *
 * Before this file, `ShomaraLaunchState` was published by NOBODY: the contract and its tests existed
 * but the running app always started at the welcome gate, and no session was ever restored on cold
 * start. This controller is the missing producer:
 *
 *   1. publish `Resolving` (the only state that shows the splash gate);
 *   2. read the persisted credential through the secure token store and VERIFY it against the
 *      server via [ShomaraAuthSession.restore] (fail-closed: server probe, expiry window, clear on
 *      rejection);
 *   3. map the observation through [ShomaraLaunchResolver] onto a launch state;
 *   4. publish it once — the gate is dismissed, never held for a minimum display time.
 *
 * It performs no fake success: when no backend is configured a stored credential cannot be
 * verified, so the result is [ShomaraLaunchState.Error] (recovery screen with an honest explanation),
 * never a synthetic authenticated session.
 */
class ShomaraLaunchController(
    private val session: ShomaraAuthSession,
    private val draftStore: ShomaraProfileDraftStore,
    /** True when `ShomaraRuntimeConfig.otpEndpoints` is configured for this build. */
    private val backendConfigured: () -> Boolean,
    private val scope: CoroutineScope,
    /**
     * Dispatcher for the secure-storage read and the server probe. Injected so the launch
     * regression tests can drive resolution deterministically instead of racing real I/O threads;
     * production always passes [Dispatchers.IO].
     */
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    private val _state = MutableStateFlow<ShomaraLaunchState>(ShomaraLaunchState.Resolving)
    val state: StateFlow<ShomaraLaunchState> = _state.asStateFlow()

    private val _retrying = MutableStateFlow(false)
    val retrying: StateFlow<Boolean> = _retrying.asStateFlow()

    @Volatile
    private var started: Boolean = false

    /** One resolution per process. Safe to call from `onCreate`/first composition. */
    fun startOnce() {
        if (started) return
        started = true
        runResolution()
    }

    /** Explicit user retry from the recovery surface; never a silent loop. */
    fun retry() {
        if (_retrying.value) return
        runResolution(retry = true)
    }

    /**
     * Re-open the gate after a sign-out: the credential is already gone, so this simply resolves
     * again and lands on `NewUser` without pretending anything was verified.
     */
    fun restart() {
        started = false
        _state.value = ShomaraLaunchState.Resolving
    }

    /** Last-resort escape from a recovery state: discard the unusable credential and start fresh. */
    fun startOver() {
        scope.launch {
            _state.value = ShomaraLaunchState.Resolving
            withContext(ioDispatcher) { session.signOut() }
            _state.value = ShomaraLaunchState.NewUser
        }
    }

    private fun runResolution(retry: Boolean = false) {
        scope.launch {
            if (retry) _retrying.value = true
            if (_state.value != ShomaraLaunchState.Resolving) _state.value = ShomaraLaunchState.Resolving
            val observation = withContext(ioDispatcher) { observe() }
            val resumed = withContext(ioDispatcher) { hasResumableDraft() }
            _state.value = ShomaraLaunchResolver.resolve(observation = observation, hasResumableDraft = resumed)
            _retrying.value = false
        }
    }

    private suspend fun observe(): ShomaraSessionObservation {
        val outcome = session.restore()
        return when (outcome) {
            RestoreOutcome.Verified ->
                ShomaraSessionObservation.Verified(session.authenticatedAtMs ?: 0L)
            RestoreOutcome.TokenMissing, RestoreOutcome.TokenExpired, RestoreOutcome.ServerRejected ->
                // Nothing usable: not authenticated. A surviving profile draft only changes whether
                // the journey resumes at the profile step — it never authenticates anyone.
                ShomaraSessionObservation.NoSession
            RestoreOutcome.NetworkUnavailable -> ShomaraSessionObservation.Unverified(
                if (!backendConfigured()) {
                    ShomaraUnverifiedReason.BackendNotConfigured
                } else {
                    ShomaraUnverifiedReason.Offline
                },
            )
            // A credential exists but this build has no OTP endpoint, so it can be neither accepted
            // nor refused. Report the configuration problem instead of pretending the child is new.
            RestoreOutcome.BackendUnavailable ->
                ShomaraSessionObservation.Unverified(ShomaraUnverifiedReason.BackendNotConfigured)
        }
    }

    private suspend fun hasResumableDraft(): Boolean =
        runCatching { draftStore.read() != null }.getOrDefault(false)
}

/** The launch surfaces, in one place so the app and the tests agree on the mapping. */
object ShomaraLaunchRouting {
    fun surfaceFor(state: ShomaraLaunchState): ShomaraLaunchSurface =
        ShomaraLaunchResolver.surfaceFor(state)

    fun isRecoverable(state: ShomaraLaunchState): Boolean =
        state == ShomaraLaunchState.Offline || state == ShomaraLaunchState.Error

    /** The authenticated destination is reachable only from a verified session. */
    fun entersChildShell(state: ShomaraLaunchState): Boolean =
        state == ShomaraLaunchState.RestoringSession
}