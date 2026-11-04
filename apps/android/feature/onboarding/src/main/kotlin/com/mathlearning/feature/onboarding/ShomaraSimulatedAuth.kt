package com.mathlearning.feature.onboarding

import com.mathlearning.core.network.ShomaraNetworkError
import com.mathlearning.core.network.ShomaraNetworkFailure
import com.mathlearning.core.network.ShomaraOtpResult

/**
 * DEBUG-only simulated authentication (N08-15, owner request 2026-11-04).
 *
 * The real OTP backend is unconfigured (`ShomaraRuntimeConfig.otpEndpoints == null`, ADR-0037 I2),
 * so Phone → OTP → Profile cannot be explored. This file defines the **contract** of the simulation;
 * the provider itself lives in `src/debug/` so no release artifact contains it.
 *
 * Hard rules encoded here (each one is asserted by a test):
 *  1. The simulated credential is recognisable and can NEVER be produced by — or accepted by — the
 *     production [com.mathlearning.core.network.ShomaraOtpApi]. A release build that somehow
 *     received it would treat it as an invalid request (fail closed).
 *  2. The flow is not a guest bypass: it still requires a valid Iranian mobile number, still runs
 *     the same phone validation, and still ends in a *persisted* session whose credential is
 *     verified first. It replaces the SMS step, nothing else.
 *  3. The development code is a documented constant and the UI labels the flow as development mode,
 *     so nobody mistakes it for a real SMS.
 */
object ShomaraSimulatedAuth {
    /** Recognisable prefix of every simulated credential. */
    const val TokenPrefix: String = "sim-dev-session."

    /** Fixed development OTP (documented, displayed on the OTP screen in debug builds only). */
    const val DevelopmentCode: String = "1234"

    /** Persian banner shown wherever the simulation is active. */
    const val DevelopmentModeBanner: String = "حالت توسعه: کد پیامک واقعی ارسال نمی‌شود."

    /** Warm helper line with the fixed code, shown on the OTP screen in debug builds only. */
    const val DevelopmentCodeHint: String = "کد آزمایشی این نسخه: ۱۲۳۴"

    fun isSimulatedToken(token: String?): Boolean = token?.startsWith(TokenPrefix) == true

    /** Deterministic-format credential. The suffix is supplied by the caller (a random UUID). */
    fun tokenFor(sessionId: String): String {
        require(sessionId.isNotBlank()) { "simulated session id must not be blank" }
        require(!sessionId.contains(' ')) { "simulated session id must not contain spaces" }
        return "$TokenPrefix$sessionId"
    }
}

/**
 * The single gate that decides whether a simulated credential may become an authenticated session.
 *
 * Only a DEBUG build passes `allowSimulated = true` (injected by `:app` from `BuildConfig`, which is
 * itself generated from the build type). In every other case the credential is rejected with the
 * same failure the server would produce, so a leaked debug credential is inert in production.
 */
object ShomaraSimulatedCredentialGate {
    fun mayAccept(simulated: Boolean, allowSimulated: Boolean): Boolean = simulated && allowSimulated

    /** Fail-closed failure used when a simulated credential reaches a non-simulated code path. */
    fun rejection(): ShomaraNetworkFailure = ShomaraNetworkFailure(
        error = ShomaraNetworkError.InvalidRequest,
        detail = "simulated credential rejected on production path",
    )
}

/**
 * Mapping used to render the two error classes the task requires to stay distinct:
 * a phone-format problem is the child's/user's input, while an unconfigured backend is a build
 * configuration problem — they must never share a message.
 */
object ShomaraAuthErrorMessages {
    /** Phone format / empty input (validated BEFORE any network access). */
    fun forPhoneInput(): String = ShomaraOnboardingStrings.PhoneInvalid

    /**
     * Backend configuration error, surfaced separately from the phone error (N08-15 acceptance).
     * Deliberately says "not configured", not "check your number": retrying cannot fix it.
     */
    const val BackendNotConfigured: String = "سرویس ورود این نسخه هنوز پیکربندی نشده است."

    /** Generic warm network message; never contains internal detail (AGENTS §3.12). */
    const val NetworkWarm: String = "به اینترنت وصل نشدیم. یک بار دیگر امتحان کنیم."
}

/**
 * The OTP provider contract lives in `:core:network` so the session orchestrator has exactly one
 * type in every build. This alias keeps feature code readable.
 */
typealias ShomaraOtpProvider = com.mathlearning.core.network.ShomaraOtpProvider

/** Adapts the real HTTP API to the provider contract (production path, unchanged semantics). */
class ShomaraRealOtpProvider(
    private val api: com.mathlearning.core.network.ShomaraOtpApi,
) : ShomaraOtpProvider {
    override val isSimulated: Boolean = false

    override fun requestOtp(phone: String): ShomaraOtpResult = api.requestOtp(phone)

    override fun verifyOtp(phone: String, code: String): ShomaraOtpResult = api.verifyOtp(phone, code)
}
