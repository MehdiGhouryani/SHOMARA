package com.mathlearning.core.model

import org.junit.Assert.assertEquals
import org.junit.Test

/** B13 — local calibration: one versioned point, initial values only, never «approved». */
class ShomaraLocalCalibrationTest {

    @Test
    fun `defaults are the quoted initial values`() {
        val calibration = ShomaraLocalCalibration.Default
        assertEquals(1, calibration.version)
        assertEquals(8, calibration.idleReplaySeconds)
        assertEquals(28, calibration.traceToleranceDp)
        assertEquals(listOf(250L, 350L, 450L), calibration.timingSlotsMs)
        assertEquals(-15, calibration.narratorRatePercent)
        assertEquals(3, calibration.assessmentPassThreshold)
        assertEquals(4, calibration.assessmentPoolSize)
        assertEquals(listOf(30, 12, 3), calibration.audioBudgets)
        // R-07: the audio numbers are explicit calibration fields now (initial values,
        // NOT approved — CONTENT-011), instead of living only as manager constants.
        assertEquals(3, calibration.maxSimultaneousEffects)
        assertEquals(12, calibration.narratorDuckingDb)
    }

    @Test
    fun `defaults mirror the server config where the server owns the value`() {
        assertEquals(ServerLearningConfig.DEFAULT.traceToleranceDp, ShomaraLocalCalibration.Default.traceToleranceDp)
        assertEquals(ServerLearningConfig.DEFAULT.stationJumpQuestionCount, ShomaraLocalCalibration.Default.stationJumpQuestionCount)
        assertEquals(ServerLearningConfig.DEFAULT.chapterJumpQuestionCount, ShomaraLocalCalibration.Default.chapterJumpQuestionCount)
    }

    @Test
    fun `pass threshold stays inside the pool`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraLocalCalibration(assessmentPassThreshold = 5, assessmentPoolSize = 4)
        }
    }
}
