package com.mathlearning.app.di

import android.util.Log
import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel
import com.mathlearning.core.common.logging.LogSink
import com.mathlearning.core.common.logging.SafeAppLogger

interface AppContainer {
    val logger: AppLogger
}

class DefaultAppContainer : AppContainer {
    override val logger: AppLogger = SafeAppLogger(AndroidLogSink)
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
