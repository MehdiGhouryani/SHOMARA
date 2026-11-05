package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** B7 — audio manager: explicit states, never-blocking, `audio_missing` on a missing file. */
class ShomaraAudioManagerTest {

    @Test
    fun `today the manager is unavailable - the honest state`() {
        val manager = ShomaraAudioManager()
        assertEquals(ShomaraAudioManagerState.Unavailable, manager.state)
        assertTrue(manager.requiresTextFallback)
        assertFalse(manager.isBlocking)
    }

    @Test
    fun `missing audio never blocks - it records an event and stays unavailable`() {
        val manager = ShomaraAudioManager().markMissing()
        assertEquals(ShomaraAudioManagerState.Unavailable, manager.state)
        assertEquals(1, manager.audioMissingEvents)
        assertFalse(manager.isBlocking)
        assertTrue(manager.requiresTextFallback)
    }

    @Test
    fun `loading to cached to playing to paused is the happy path`() {
        val manager = ShomaraAudioManager()
            .startLoading()
            .markCached()
            .markPlaying()
            .pause()
        assertEquals(ShomaraAudioManagerState.Paused, manager.state)
        assertFalse(manager.requiresTextFallback)
    }

    @Test
    fun `failure falls back to text and retries through loading`() {
        val manager = ShomaraAudioManager()
            .startLoading()
            .markFailed()
        assertTrue(manager.requiresTextFallback)
        assertFalse(manager.isBlocking)
        assertEquals(ShomaraAudioManagerState.Loading, manager.retry().state)
    }

    @Test
    fun `isBlocking is false in every state`() {
        val states = listOf(
            ShomaraAudioManager(),
            ShomaraAudioManager().startLoading(),
            ShomaraAudioManager().startLoading().markCached(),
            ShomaraAudioManager().startLoading().markFailed(),
        )
        assertTrue(states.all { !it.isBlocking })
    }

    @Test
    fun `effect cap and ducking are the quoted configurable values`() {
        assertEquals(3, ShomaraAudioManager.MAX_SIMULTANEOUS_EFFECTS)
        assertEquals(12, ShomaraAudioManager.NARRATOR_DUCKING_DB)
    }

    @Test
    fun `effect cap and ducking are read from the calibration - not hardcoded (R-07)`() {
        val defaults = ShomaraAudioManager()
        assertEquals(3, defaults.maxSimultaneousEffects)
        assertEquals(12, defaults.narratorDuckingDb)
        // A caller-supplied calibration flows through: the getters never read the constants.
        val custom = ShomaraAudioManager(
            calibration = com.mathlearning.core.model.ShomaraLocalCalibration(
                maxSimultaneousEffects = 2,
                narratorDuckingDb = 6,
            ),
        )
        assertEquals(2, custom.maxSimultaneousEffects)
        assertEquals(6, custom.narratorDuckingDb)
    }
}
