package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraTokenPolicy
import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpResult
import com.mathlearning.core.network.ShomaraOtpThrottle

/**
 * Auth session orchestrator (N04-03/N04-05) — the single place a credential becomes a session.
 *
 * Fail-closed rules kept from N04 and extended in N08-15:
 *  - a token is persisted ONLY on a verified response;
 *  - clearing always removes the secret, and a failed verification leaves no partial state;
 *  - a SIMULATED credential is accepted only when the caller explicitly allows it
 *    ([allowSimulated]), which only the debug build type does. Any simulated credential that
 *    reaches a production path is rejected with the same failure a real server would produce, so a
 *    leaked debug token is inert (see [ShomaraSimulatedCredentialGate]).
 */
class ShomaraAuthSession(
    private val api: ShomaraOtpProvider,
    private val store: ShomaraTokenStore,
    private val throttle: ShomaraOtpThrottle = ShomaraOtpThrottle(),
    private val now: () -> Long = { System.currentTimeMillis() },
    /** Only a debug build sets this true; release builds reject simulated credentials. */
    private val allowSimulated: Boolean = false,
) {
    var authenticatedToken: String? = null
        private set
    var authenticatedAtMs: Long? = null
        private set

    /** True when the current session was produced by the DEBUG-only simulation. */
    var isSimulatedSession: Boolean = false
        private set

    /** Requests an OTP; enforces the local throttle and records server Retry-After. */
    fun requestOtp(phone: String): RequestOutcome {
        val nowMs = now()
        if (!throttle.canRequest(nowMs)) {
            return RequestOutcome.Throttled(throttle.remainingMs(nowMs))
        }
        return when (val result = api.requestOtp(phone)) {
            is ShomaraOtpResult.Failure -> {
                if (result.failure.error == ShomaraNetworkError.RateLimited) throttle.onRateLimited(nowMs)
                RequestOutcome.Failed(result.failure)
            }
            is ShomaraOtpResult.Success -> {
                throttle.onRequested(nowMs)
                RequestOutcome.Sent
            }
        }
    }

    /** Verifies the code; persists the token only on success. */
    suspend fun verifyOtp(phone: String, code: String): VerifyOutcome = when (val result = api.verifyOtp(phone, code)) {
        is ShomaraOtpResult.Failure -> VerifyOutcome.Failed(result.failure)
        is ShomaraOtpResult.Success -> {
            val token = result.accessToken
            if (!ShomaraTokenPolicy.isUsable(token)) {
                VerifyOutcome.Failed(
                    ShomaraNetworkFailure(
                        ShomaraNetworkError.ServerError,
                        "verify response without access_token",
                    ),
                )
            } else if (!accepts(token!!)) {
                VerifyOutcome.Failed(ShomaraSimulatedCredentialGate.rejection())
            } else {
                store.save(token)
                authenticatedToken = token
                authenticatedAtMs = now()
                isSimulatedSession = ShomaraSimulatedAuth.isSimulatedToken(token)
                VerifyOutcome.Verified
            }
        }
    }

    /**
     * Restore (N04-05): fail-closed — nothing is trusted without a verified token, and the
     * simulated credential is verified against the SIMULATED provider only (never sent to a real
     * backend, never trusted on the production path).
     */
    suspend fun restore(): RestoreOutcome {
        val token = store.read()
        if (!ShomaraTokenPolicy.isUsable(token)) {
            store.clear()
            return RestoreOutcome.TokenMissing
        }
        if (ShomaraSimulatedAuth.isSimulatedToken(token)) {
            if (!allowSimulated) {
                // A simulated credential on a production path is not a session: purge and fail closed.
                store.clear()
                return RestoreOutcome.ServerRejected
            }
            authenticatedToken = token
            if (authenticatedAtMs == null) authenticatedAtMs = now()
            isSimulatedSession = true
            return RestoreOutcome.Verified
        }
        return when (val result = api.verifyOtp(token!!, RESTORE_PROBE)) {
            is ShomaraOtpResult.Failure ->
                when {
                    // No backend is configured for this build: the credential is neither accepted nor
                    // refused, so it is KEPT and reported as a configuration problem (not "offline",
                    // not "rejected"). Retry can succeed once a backend exists.
                    isBackendMissing(result.failure) -> RestoreOutcome.BackendUnavailable
                    result.failure.error == ShomaraNetworkError.InvalidRequest -> {
                        store.clear()
                        RestoreOutcome.ServerRejected
                    }
                    // offline/timeout: keep the token, retry later
                    else -> RestoreOutcome.NetworkUnavailable
                }
            is ShomaraOtpResult.Success -> {
                authenticatedToken = token
                if (authenticatedAtMs == null) authenticatedAtMs = now()
                isSimulatedSession = false
                RestoreOutcome.Verified
            }
        }
    }

    /**
     * The real API reports a missing endpoint as `InvalidRequest("backend endpoints not configured")`.
     * That string is the only signal available, and it is produced in exactly one place
     * (`ShomaraOtpApi.post`), so matching it here keeps the distinction precise without widening the
     * network taxonomy.
     */
    private fun isBackendMissing(failure: ShomaraNetworkFailure): Boolean =
        failure.error == ShomaraNetworkError.InvalidRequest &&
            failure.detail.contains("not configured", ignoreCase = true)

    /** Exit/expiry: ALWAYS clears the stored secret (N04-05). */
    suspend fun signOut() {
        store.clear()
        authenticatedToken = null
        authenticatedAtMs = null
        isSimulatedSession = false
    }

    /**
     * Expiry check (N04-05): a session older than the TTL is expired and must be torn down
     * (fail closed) before anything child-facing can use it. Returns false when it signed out.
     */
    suspend fun ensureUnexpired(nowMs: Long): Boolean {
        if (authenticatedToken == null) return true
        if (ShomaraSessionExpiry.isExpired(authenticatedAtMs, nowMs)) {
            signOut()
            return false
        }
        return true
    }

    private fun accepts(token: String): Boolean =
        if (ShomaraSimulatedAuth.isSimulatedToken(token)) {
            ShomaraSimulatedCredentialGate.mayAccept(simulated = true, allowSimulated = allowSimulated)
        } else {
            true
        }

    companion object {
        /** Restore probe endpoint verifies the bearer token server-side without burning an OTP. */
        const val RESTORE_PROBE: String = "restore"
    }
}

sealed class RequestOutcome {
    data object Sent : RequestOutcome()
    data class Throttled(val remainingMs: Long) : RequestOutcome()
    data class Failed(val failure: ShomaraNetworkFailure) : RequestOutcome()
}

sealed class VerifyOutcome {
    data object Verified : VerifyOutcome()
    data class Failed(val failure: ShomaraNetworkFailure) : VerifyOutcome()
}

/**
 * Session expiry policy (N04-05): the TTL mirrors the fail-closed restore window in
 * [com.mathlearning.core.datastore.ShomaraTokenPolicy]. A missing timestamp counts as expired.
 */
object ShomaraSessionExpiry {
    val TtlMs: Long = com.mathlearning.core.datastore.ShomaraTokenPolicy.MaxRestoredSessionMs

    fun expiresAt(authenticatedAtMs: Long): Long = authenticatedAtMs + TtlMs

    fun isExpired(authenticatedAtMs: Long?, nowMs: Long): Boolean = when (authenticatedAtMs) {
        null -> true
        else -> nowMs >= expiresAt(authenticatedAtMs)
    }
}

/** Pure auth gate: which surface may render for a given session state (N04-05). */
object ShomaraAuthGate {
    enum class Surface { ChildShell, OnboardingRestoring, OnboardingNew }

    fun decide(authenticated: Boolean, sessionExpired: Boolean): Surface = when {
        authenticated && !sessionExpired -> Surface.ChildShell
        authenticated && sessionExpired -> Surface.OnboardingRestoring // torn down; re-enter through welcome
        else -> Surface.OnboardingNew
    }
}