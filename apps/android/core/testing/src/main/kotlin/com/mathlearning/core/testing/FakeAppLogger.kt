package com.mathlearning.core.testing

import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel

class FakeAppLogger : AppLogger {
    private val mutableEvents = mutableListOf<Pair<LogLevel, AppLogEvent>>()
    val events: List<Pair<LogLevel, AppLogEvent>> get() = mutableEvents.toList()

    override fun log(level: LogLevel, event: AppLogEvent) {
        mutableEvents += level to event
    }
}
