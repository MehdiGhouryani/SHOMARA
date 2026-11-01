package com.mathlearning.feature.lesson

import com.mathlearning.core.database.LocalLearningDatabase
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-04 audio cache state machine tests: SHA-256 gate, text fallback, no blocking. */
class ShomaraAudioCacheTest {

    private val db = LocalLearningDatabase()

    @Test
    fun `verified download enters ready-cached and persists to the audio table`() {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.a", expectedSha256 = "a".repeat(64), textFallback = "متن")
        assertEquals(ShomaraAudioPlaybackState.DownloadQueued, entry.state)
        val downloaded = ShomaraAudioCacheManager.onDownloaded(entry, actualSha256 = "a".repeat(64), localFileRef = "cache/a.ogg", db = db)
        assertEquals(ShomaraAudioPlaybackState.ReadyCached, downloaded.state)
        assertEquals("cache/a.ogg", db.audioAsset("ST07.P1.s01.a")?.localFileRef)
        val playing = ShomaraAudioCacheManager.play(downloaded)
        assertEquals(ShomaraAudioPlaybackState.Playing, playing.state)
        val paused = ShomaraAudioCacheManager.pause(playing)
        assertEquals(ShomaraAudioPlaybackState.Paused, paused.state)
    }

    @Test
    fun `corrupt binary quarantines and falls back to text - never blocks`() {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.b", expectedSha256 = "b".repeat(64), textFallback = "متن جایگزین")
        val failed = ShomaraAudioCacheManager.onDownloaded(entry, actualSha256 = "c".repeat(64), localFileRef = "cache/bad.ogg", db = db)
        assertEquals(ShomaraAudioPlaybackState.FailedWithTextFallback, failed.state)
        // Quarantined: no usable local ref persisted.
        assertNull(db.audioAsset("ST07.P1.s01.b")?.localFileRef)
        assertNull(db.audioAsset("ST07.P1.s01.b")?.sha256)
        assertEquals("QUARANTINED_CORRUPT", db.audioAsset("ST07.P1.s01.b")?.publishState)
        assertFalse(failed.blocked)
        assertTrue(failed.textFallback.isNotBlank())
    }

    @Test
    fun `missing binary triggers the non-blocking text fallback (CONTENT-017)`() {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.c", expectedSha256 = "d".repeat(64), textFallback = "متن داستان")
        val failed = ShomaraAudioCacheManager.onMissingBinary(entry, db = db)
        assertEquals(ShomaraAudioPlaybackState.FailedWithTextFallback, failed.state)
        assertEquals("MISSING_TEXT_FALLBACK", db.audioAsset("ST07.P1.s01.c")?.publishState)
        assertFalse(failed.blocked)
    }

    @Test
    fun `play and pause ignore invalid transitions`() {
        val queued = ShomaraAudioCacheManager.queueDownload("x", "e".repeat(64), "t")
        assertEquals(ShomaraAudioPlaybackState.DownloadQueued, ShomaraAudioCacheManager.play(queued).state)
        assertEquals(ShomaraAudioPlaybackState.DownloadQueued, ShomaraAudioCacheManager.pause(queued).state)
    }
}
