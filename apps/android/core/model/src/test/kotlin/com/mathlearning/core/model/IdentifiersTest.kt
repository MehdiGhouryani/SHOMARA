package com.mathlearning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class IdentifiersTest {
    @Test
    fun `accepts stable server identifiers`() {
        assertEquals("ST01", StationId.parse("ST01").value)
        assertEquals("unit-1", UnitId.parse("unit-1").value)
    }

    @Test
    fun `rejects values unsafe for navigation arguments`() {
        assertThrows(IllegalArgumentException::class.java) { StationId.parse("../ST01") }
        assertThrows(IllegalArgumentException::class.java) { UnitId.parse(" ") }
    }
}
