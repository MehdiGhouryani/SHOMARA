package com.mathlearning.app.di

import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpProvider

/**
 * RELEASE variant wiring (N08-15).
 *
 * This file is the release counterpart of `src/debug/.../AuthProviderWiring.kt`. Both variants
 * declare the same type, so `ShomaraApplication` compiles against the build type rather than a
 * runtime flag:
 *
 *  - `IsDebugBuild` is a compile-time `false`, so the simulated provider parameter is a constant
 *    null and the release path can never construct one;
 *  - `simulatedProviderFactory` is null, so [com.mathlearning.app.di.DefaultAppContainer] falls back
 *    to the real HTTP provider and `allowSimulated` stays false.
 *
 * A simulated credential that somehow reached this build is rejected by the session gate in
 * `ShomaraAuthSession` exactly like the server would reject it, because `allowSimulated` is false.
 */
object AuthProviderWiring {
    const val IsDebugBuild: Boolean = false

    val simulatedProviderFactory: ((ShomaraOtpApi) -> ShomaraOtpProvider)? = null
}