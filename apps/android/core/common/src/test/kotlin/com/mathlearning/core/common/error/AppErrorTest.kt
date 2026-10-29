package com.mathlearning.core.common.error

import org.junit.Assert.assertEquals
import org.junit.Test

class AppErrorTest {
    @Test
    fun `maps technical errors to stable child-safe messages`() {
        assertEquals(UserMessageKey.OFFLINE, AppError.Offline.toUserMessageKey())
        assertEquals(UserMessageKey.SESSION_EXPIRED, AppError.Unauthorized.toUserMessageKey())
        assertEquals(UserMessageKey.TRY_AGAIN, AppError.Network(retryable = true).toUserMessageKey())
        assertEquals(UserMessageKey.CHECK_INPUT, AppError.Validation("nickname").toUserMessageKey())
        assertEquals(UserMessageKey.UNEXPECTED, AppError.Unknown("incident-1").toUserMessageKey())
    }
}
