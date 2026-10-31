package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.RestoreOutcome
import com.mathlearning.core.datastore.ShomaraTokenPolicy
import com.mathlearning.core.datastore.ShomaraTokenStore
import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpResult
import com.mathlearning.core.network.ShomaraOtpThrottle

/**
 * Auth session orchestrator (N04-03/N04-05): binds the real OTP API to the secure token store.
 * Fail-closed rules — a token is persisted ONLY on a verified response, clearing always removes
 * the secret, and a failed verification leaves no partial state behind.
 */
class ShomaraAuthSession(
    private val api: ShomaraOtpApi,
    private val store: ShomaraTokenStore,
    private val throttle: ShomaraOtpThrottle = ShomaraOtpThrottle(),
    private val now: () -> Long = { System.currentTimeMillis() },
) {
    var authenticatedToken: String? = null
        private set
    var authenticatedAtMs: Long? = null
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
            if (ShomaraTokenPolicy.isUsable(token)) {
                store.save(token!!)
                authenticatedToken = token
                authenticatedAtMs = now()
                VerifyOutcome.Verified
            } else {
                VerifyOutcome.Failed(
                    com.mathlearning.core.network.ShomaraNetworkFailure(
                        ShomaraNetworkError.ServerError,
                        "verify response without access_token",
                    ),
                )
            }
        }
    }

    /** Restore (N04-05): fail-closed — nothing is trusted without a storable, verified token. */
    suspend fun restore(): RestoreOutcome {
        val token = store.read()
        if (!ShomaraTokenPolicy.isUsable(token)) {
            store.clear()
            return RestoreOutcome.TokenMissing
        }
        return when (val result = api.verifyOtp(token!!, RESTORE_PROBE)) {
            is ShomaraOtpResult.Failure ->
                when (result.failure.error) {
                    ShomaraNetworkError.InvalidRequest -> { store.clear(); RestoreOutcome.ServerRejected }
                    else -> RestoreOutcome.NetworkUnavailable // offline/timeout: keep the token, retry later
                }
            is ShomaraOtpResult.Success -> {
                authenticatedToken = token
                if (authenticatedAtMs == null) authenticatedAtMs = now()
                RestoreOutcome.Verified
            }
        }
    }

    /** Exit/expiry: ALWAYS clears the stored secret (N04-05). */
    suspend fun signOut() {
        store.clear()
        authenticatedToken = null
        authenticatedAtMs = null
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

    companion object {
        /** Restore probe endpoint verifies the bearer token server-side without burning an OTP. */
        const val RESTORE_PROBE: String = "restore"
    }
}

sealed class RequestOutcome {
    data object Sent : RequestOutcome()
    data class Throttled(val remainingMs: Long) : RequestOutcome()
    data class Failed(val failure: com.mathlearning.core.network.ShomaraNetworkFailure) : RequestOutcome()
}

sealed class VerifyOutcome {
    data object Verified : VerifyOutcome()
    data class Failed(val failure: com.mathlearning.core.network.ShomaraNetworkFailure) : VerifyOutcome()
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
