package com.mathlearning.feature.lesson

import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-04 audio cache state machine tests: SHA-256 gate, text fallback, no blocking (P4 contracts). */
class ShomaraAudioCacheTest {

    /** Minimal fixture over the same contract the app wires (Room-backed in production). */
    private class InMemoryAudioAssetFixture : AudioAssetRepository {
        val rows = LinkedHashMap<String, AudioAssetRecord>()
        override suspend fun upsert(record: AudioAssetRecord) {
            rows[record.audioId] = record
        }
        override suspend fun byId(audioId: String): AudioAssetRecord? = rows[audioId]
        override fun allFlow(): Flow<List<AudioAssetRecord>> = flowOf(rows.values.toList())
    }

    private val audioAssets = InMemoryAudioAssetFixture()

    @Test
    fun `verified download enters ready-cached and persists to the audio table`() = runBlocking {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.a", expectedSha256 = "a".repeat(64), textFallback = "متن")
        assertEquals(ShomaraAudioPlaybackState.DownloadQueued, entry.state)
        val downloaded = ShomaraAudioCacheManager.onDownloaded(entry, actualSha256 = "a".repeat(64), localFileRef = "cache/a.ogg", audioAssets = audioAssets)
        assertEquals(ShomaraAudioPlaybackState.ReadyCached, downloaded.state)
        assertEquals("cache/a.ogg", audioAssets.byId("ST07.P1.s01.a")?.localFileRef)
        val playing = ShomaraAudioCacheManager.play(downloaded)
        assertEquals(ShomaraAudioPlaybackState.Playing, playing.state)
        val paused = ShomaraAudioCacheManager.pause(playing)
        assertEquals(ShomaraAudioPlaybackState.Paused, paused.state)
    }

    @Test
    fun `corrupt binary quarantines and falls back to text - never blocks`() = runBlocking {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.b", expectedSha256 = "b".repeat(64), textFallback = "متن جایگزین")
        val failed = ShomaraAudioCacheManager.onDownloaded(entry, actualSha256 = "c".repeat(64), localFileRef = "cache/bad.ogg", audioAssets = audioAssets)
        assertEquals(ShomaraAudioPlaybackState.FailedWithTextFallback, failed.state)
        // Quarantined: no usable local ref persisted.
        assertNull(audioAssets.byId("ST07.P1.s01.b")?.localFileRef)
        assertNull(audioAssets.byId("ST07.P1.s01.b")?.sha256)
        assertEquals("QUARANTINED_CORRUPT", audioAssets.byId("ST07.P1.s01.b")?.publishState)
        assertFalse(failed.blocked)
        assertTrue(failed.textFallback.isNotBlank())
    }

    @Test
    fun `missing binary degrades to text fallback and never blocks`() = runBlocking {
        val entry = ShomaraAudioCacheManager.queueDownload("ST07.P1.s01.c", expectedSha256 = "d".repeat(64), textFallback = "متن")
        val missing = ShomaraAudioCacheManager.onMissingBinary(entry, audioAssets = audioAssets)
        assertEquals(ShomaraAudioPlaybackState.FailedWithTextFallback, missing.state)
        assertEquals("MISSING_TEXT_FALLBACK", audioAssets.byId("ST07.P1.s01.c")?.publishState)
        assertFalse(missing.blocked)
    }
}
