package com.mathlearning.app

import android.app.Application
import com.mathlearning.app.di.AuthProviderWiring
import com.mathlearning.app.di.DefaultAppContainer

class ShomaraApplication : Application() {
    lateinit var container: DefaultAppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        // N08-15: the build type is the ONLY switch that enables the simulated OTP provider. The
        // wiring object is provided per variant (src/debug vs src/release), so a release build has no
        // reference to the simulated provider type at all — a compile-time guarantee, not a runtime
        // `if`.
        container = DefaultAppContainer(
            context = this,
            debugBuild = AuthProviderWiring.IsDebugBuild,
            debugOtpProvider = AuthProviderWiring.simulatedProviderFactory,
        )
    }
}