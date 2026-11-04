package com.mathlearning.app.di

import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpProvider
import com.mathlearning.feature.onboarding.ShomaraDebugOtpProviderFactory

/**
 * DEBUG variant wiring (N08-15).
 *
 * The simulated OTP provider is mounted here and only here:
 *  - `ShomaraDebugOtpProviderFactory` lives in `:feature:onboarding`'s `src/debug` source set, so a
 *    release compilation has no such class to reference (this file is the only reference, and it is
 *    itself debug-only);
 *  - `DefaultAppContainer` receives the factory and sets `allowSimulated = true`, which is the only
 *    way a `sim-dev-session.*` credential can become a session.
 *
 * Debug builds never send a real SMS: the simulated provider performs no network call.
 */
object AuthProviderWiring {
    const val IsDebugBuild: Boolean = true

    val simulatedProviderFactory: ((ShomaraOtpApi) -> ShomaraOtpProvider)? =
        { realApi -> ShomaraDebugOtpProviderFactory.create(realApi) }
}