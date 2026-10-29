package com.mathlearning.core.common.logging

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SafeAppLoggerTest {
    @Test
    fun `writes allowlisted structural metadata`() {
        val events = mutableListOf<AppLogEvent>()
        val logger = SafeAppLogger { _, event -> events += event }

        logger.log(LogLevel.INFO, AppLogEvent("app.started", mapOf("source" to "launcher")))

        assertEquals(listOf("app.started"), events.map(AppLogEvent::name))
    }

    @Test
    fun `rejects sensitive attributes`() {
        val logger = SafeAppLogger { _, _ -> error("must not reach sink") }

        assertThrows(IllegalArgumentException::class.java) {
            logger.log(LogLevel.INFO, AppLogEvent("auth.started", mapOf("otp_code" to "123456")))
        }
    }
}
