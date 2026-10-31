package com.mathlearning.app.di

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel
import com.mathlearning.core.common.logging.LogSink
import com.mathlearning.core.common.logging.SafeAppLogger
import com.mathlearning.core.datastore.PreferencesProfileDraftStore
import com.mathlearning.core.datastore.PreferencesTokenStore
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import java.io.File

interface AppContainer {
    val logger: AppLogger
    val authSession: ShomaraAuthSession
    val profileDraftStore: ShomaraProfileDraftStore
}

/**
 * Runtime endpoint configuration (ADR-0037 L10): the API base URL is injected at runtime and
 * never committed. It stays null until the owner configures the production backend (ADR-0037
 * I2); every auth call then fails closed with a configuration error, never a network attempt.
 */
object ShomaraRuntimeConfig {
    @Volatile
    var otpEndpoints: ShomaraOtpEndpoints? = null
}

class DefaultAppContainer(context: Context) : AppContainer {
    override val logger: AppLogger = SafeAppLogger(AndroidLogSink)

    private val dataStore = PreferenceDataStoreFactory.create(
        scope = CoroutineScope(Dispatchers.IO),
        produceFile = { File(context.filesDir, "shomara_auth.preferences_pb") },
    )

    override val authSession: ShomaraAuthSession = ShomaraAuthSession(
        api = ShomaraOtpApi(client = ShomaraOtpApi.defaultClient(), endpoints = { ShomaraRuntimeConfig.otpEndpoints }),
        store = PreferencesTokenStore(dataStore),
    )

    override val profileDraftStore: ShomaraProfileDraftStore = PreferencesProfileDraftStore(dataStore)
}

private data object AndroidLogSink : LogSink {
    override fun write(level: LogLevel, event: AppLogEvent) {
        val metadataKeys = event.attributes.keys.sorted().joinToString(prefix = "[", postfix = "]")
        val message = "${event.name} keys=$metadataKeys"
        when (level) {
            LogLevel.DEBUG -> Log.d(TAG, message)
            LogLevel.INFO -> Log.i(TAG, message)
            LogLevel.WARN -> Log.w(TAG, message)
            LogLevel.ERROR -> Log.e(TAG, message)
        }
    }

    private const val TAG = "SHOMARA"
}
