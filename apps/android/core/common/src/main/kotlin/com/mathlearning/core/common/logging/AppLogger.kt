package com.mathlearning.core.common.logging

enum class LogLevel { DEBUG, INFO, WARN, ERROR }

data class AppLogEvent(
    val name: String,
    val attributes: Map<String, String> = emptyMap(),
)

fun interface LogSink {
    fun write(level: LogLevel, event: AppLogEvent)
}

interface AppLogger {
    fun log(level: LogLevel, event: AppLogEvent)
}

class SafeAppLogger(private val sink: LogSink) : AppLogger {
    override fun log(level: LogLevel, event: AppLogEvent) {
        require(EVENT_NAME.matches(event.name)) { "Log event names must be stable identifiers" }
        val unsafeKey = event.attributes.keys.firstOrNull(::isSensitive)
        require(unsafeKey == null) { "Sensitive log attribute is forbidden: $unsafeKey" }
        sink.write(level, event)
    }

    private fun isSensitive(key: String): Boolean {
        val normalized = key.lowercase()
        return SENSITIVE_PARTS.any(normalized::contains)
    }

    private companion object {
        val EVENT_NAME = Regex("[a-z][a-z0-9_.-]{2,63}")
        val SENSITIVE_PARTS = setOf(
            "token", "secret", "password", "otp", "phone", "child_name", "answer_key",
        )
    }
}
