package com.mathlearning.feature.onboarding

import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpResult
import java.util.UUID

/**
 * DEBUG-ONLY simulated OTP provider (N08-15).
 *
 * This file lives in `src/debug/kotlin` and is therefore compiled ONLY into the debug variant: the
 * release APK/AAB cannot contain it, even accidentally (see `verify-demo-auth-isolation.mjs`, which
 * fails if this class appears outside a debug source set, or if any main/release source names it).
 *
 * Behaviour:
 *  - never opens a socket, never sends a real SMS, never touches `ShomaraRuntimeConfig`;
 *  - accepts the documented fixed development code ([ShomaraSimulatedAuth.DevelopmentCode]);
 *  - still rejects an invalid mobile number exactly like production does;
 *  - mints a recognisable simulated credential (`sim-dev-session.<uuid>`) that the production path
 *    rejects by construction ([ShomaraSimulatedCredentialGate]).
 */
class ShomaraDebugOtpProvider(
    private val realApi: ShomaraOtpApi,
    private val newSessionId: () -> String = { UUID.randomUUID().toString() },
) : ShomaraOtpProvider {
    override val isSimulated: Boolean = true

    private val issuedSessions: MutableSet<String> = java.util.Collections.synchronizedSet(mutableSetOf())

    /**
     * "Sending" the development code is a no-op that succeeds immediately for a valid number. An
     * invalid number is refused with the same negative result production produces, so the phone
     * validation path is identical in both modes.
     */
    override fun requestOtp(phone: String): ShomaraOtpResult {
        val canonical = ShomaraPhoneLogic.canonical(phone)
            ?: return ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "invalid phone number"),
            )
        synchronized(issuedSessions) { issuedSessions.add(canonical) }
        return ShomaraOtpResult.Success(accessToken = null)
    }

    override fun verifyOtp(phone: String, code: String): ShomaraOtpResult {
        val canonical = ShomaraPhoneLogic.canonical(phone)
            ?: return ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "invalid phone number"),
            )
        val requested = synchronized(issuedSessions) { issuedSessions.contains(canonical) }
        if (!requested) {
            return ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "no simulated code requested"),
            )
        }
        if (code != ShomaraSimulatedAuth.DevelopmentCode) {
            return ShomaraOtpResult.Failure(
                ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "development code mismatch"),
            )
        }
        // The simulated credential is minted here and nowhere else.
        return ShomaraOtpResult.Success(
            accessToken = ShomaraSimulatedAuth.tokenFor(newSessionId()),
        )
    }

    /**
     * The real API is kept only so the debug build can fall back to it the moment a backend is
     * configured (ADR-0037 I2). It is never called while the simulation is active, which keeps the
     * debug flow hermetic (no accidental network traffic during exploration).
     */
    @Suppress("unused")
    private val real: ShomaraOtpApi = realApi
}

/** Factory kept in the debug source set so `:app` main code cannot reference the provider type. */
object ShomaraDebugOtpProviderFactory {
    fun create(realApi: ShomaraOtpApi): ShomaraOtpProvider = ShomaraDebugOtpProvider(realApi)
}
