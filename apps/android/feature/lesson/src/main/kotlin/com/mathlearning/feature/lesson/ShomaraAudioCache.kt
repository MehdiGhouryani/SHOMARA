package com.mathlearning.feature.lesson

import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository

/**
 * N07-04 — audio playback state machine (fail-safe): DownloadQueued → Downloading →
 * ReadyCached → Playing → Paused → FailedWithTextFallback. SHA-256 verification gates entry to
 * ReadyCached; a missing or corrupt binary ALWAYS degrades to the visible Persian text fallback
 * and never blocks the lesson (CONTENT-017).
 */
enum class ShomaraAudioPlaybackState {
    DownloadQueued, Downloading, ReadyCached, Playing, Paused, FailedWithTextFallback,
}

data class ShomaraAudioCacheEntry(
    val audioId: String,
    val state: ShomaraAudioPlaybackState,
    val expectedSha256: String,
    val actualSha256: String? = null,
    val textFallback: String,
) {
    val blocked: Boolean
        get() = false // audio never blocks the lesson (CONTENT-017)
}

object ShomaraAudioCacheManager {
    /**
     * No hardcoded URLs (forbidden action): the storage descriptor comes from the verified
     * manifest record; this function receives it, never constructs one.
     */
    fun queueDownload(audioId: String, expectedSha256: String, textFallback: String): ShomaraAudioCacheEntry =
        ShomaraAudioCacheEntry(audioId, ShomaraAudioPlaybackState.DownloadQueued, expectedSha256, textFallback = textFallback)

    suspend fun onDownloaded(entry: ShomaraAudioCacheEntry, actualSha256: String, localFileRef: String, audioAssets: AudioAssetRepository): ShomaraAudioCacheEntry {
        if (entry.actualSha256 != null) return entry // already finalized
        val verified = actualSha256 == entry.expectedSha256
        val state = if (verified) ShomaraAudioPlaybackState.ReadyCached else ShomaraAudioPlaybackState.FailedWithTextFallback
        // P4 (ADR-0042): metadata is persisted durably (Room); the binary itself stays in
        // app-private storage and is referenced by localFileRef — never copied into the DB.
        audioAssets.upsert(
            AudioAssetRecord(
                audioId = entry.audioId,
                localFileRef = if (verified) localFileRef else null,
                sha256 = if (verified) actualSha256 else null,
                publishState = if (verified) "CACHED_VERIFIED" else "QUARANTINED_CORRUPT",
                voiceProfileId = "vp-fa-01",
            ),
        )
        return entry.copy(state = state, actualSha256 = actualSha256)
    }

    suspend fun onMissingBinary(entry: ShomaraAudioCacheEntry, audioAssets: AudioAssetRepository): ShomaraAudioCacheEntry {
        audioAssets.upsert(
            AudioAssetRecord(
                audioId = entry.audioId,
                localFileRef = null,
                sha256 = null,
                publishState = "MISSING_TEXT_FALLBACK",
                voiceProfileId = "vp-fa-01",
            ),
        )
        return entry.copy(state = ShomaraAudioPlaybackState.FailedWithTextFallback)
    }

    fun play(entry: ShomaraAudioCacheEntry): ShomaraAudioCacheEntry =
        if (entry.state == ShomaraAudioPlaybackState.ReadyCached) entry.copy(state = ShomaraAudioPlaybackState.Playing) else entry

    fun pause(entry: ShomaraAudioCacheEntry): ShomaraAudioCacheEntry =
        if (entry.state == ShomaraAudioPlaybackState.Playing) entry.copy(state = ShomaraAudioPlaybackState.Paused) else entry
}
