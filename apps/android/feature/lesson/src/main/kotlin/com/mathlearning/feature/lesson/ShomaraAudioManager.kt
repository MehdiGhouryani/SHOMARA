package com.mathlearning.feature.lesson

import com.mathlearning.core.model.ShomaraLocalCalibration

/**
 * B7 — audio manager: explicit states + text fallback + `audio_missing` event.
 *
 * States mirror the audio control (`unavailable/loading/playing/paused/failed/cached`).
 * `isBlocking` is false ALWAYS: missing audio never locks content (CONTENT-017) — the
 * visible text carries the step and the lesson continues silently. When a file is missing
 * the manager records an `audio_missing` event (pilot §11) via [audioMissingEvents].
 *
 * One narrator channel; at most 3 simultaneous effects; 12dB ducking while the narrator
 * speaks (stage5 §6.3) — the numbers are configurable ([ShomaraLocalCalibration]), not
 * approved (CONTENT-011).
 *
 * No wiring to the host yet: the first real audio asset is the wiring point. Until then the
 * manager sits in [ShomaraAudioManagerState.Unavailable] — the honest state of today, now
 * explicit and tested instead of implicit.
 */
enum class ShomaraAudioManagerState { Unavailable, Loading, Playing, Paused, Failed, Cached }

data class ShomaraAudioManager(
    val state: ShomaraAudioManagerState = ShomaraAudioManagerState.Unavailable,
    /** Count of `audio_missing` events recorded (staging/diagnostics only). */
    val audioMissingEvents: Int = 0,
    val calibration: ShomaraLocalCalibration = ShomaraLocalCalibration.Default,
) {
    /** Content is never gated behind audio — false for every state. */
    val isBlocking: Boolean
        get() = false

    /** A visible Persian text fallback is mandatory in these states. */
    val requiresTextFallback: Boolean
        get() = state == ShomaraAudioManagerState.Unavailable || state == ShomaraAudioManagerState.Failed

    /** Maximum simultaneous sound effects (stage5 §6.3, configurable, not approved). */
    val maxSimultaneousEffects: Int
        get() = MAX_SIMULTANEOUS_EFFECTS

    /** Narrator ducking in dB while the narrator speaks (stage5 §6.3, configurable). */
    val narratorDuckingDb: Int
        get() = NARRATOR_DUCKING_DB

    /** The requested file does not exist: stay unavailable, continue silently, record the event. */
    fun markMissing(): ShomaraAudioManager =
        copy(state = ShomaraAudioManagerState.Unavailable, audioMissingEvents = audioMissingEvents + 1)

    fun startLoading(): ShomaraAudioManager {
        require(state == ShomaraAudioManagerState.Unavailable || state == ShomaraAudioManagerState.Failed) {
            "loading starts from unavailable/failed only"
        }
        return copy(state = ShomaraAudioManagerState.Loading)
    }

    fun markCached(): ShomaraAudioManager {
        require(state == ShomaraAudioManagerState.Loading) { "cached follows loading only" }
        return copy(state = ShomaraAudioManagerState.Cached)
    }

    fun markPlaying(): ShomaraAudioManager {
        require(
            state == ShomaraAudioManagerState.Cached ||
                state == ShomaraAudioManagerState.Paused,
        ) { "playing follows cached/paused only" }
        return copy(state = ShomaraAudioManagerState.Playing)
    }

    fun pause(): ShomaraAudioManager {
        require(state == ShomaraAudioManagerState.Playing) { "pause follows playing only" }
        return copy(state = ShomaraAudioManagerState.Paused)
    }

    fun markFailed(): ShomaraAudioManager {
        require(state == ShomaraAudioManagerState.Loading || state == ShomaraAudioManagerState.Playing) {
            "failed follows loading/playing only"
        }
        return copy(state = ShomaraAudioManagerState.Failed)
    }

    fun retry(): ShomaraAudioManager {
        require(state == ShomaraAudioManagerState.Failed) { "retry follows failed only" }
        return copy(state = ShomaraAudioManagerState.Loading)
    }

    companion object {
        const val MAX_SIMULTANEOUS_EFFECTS: Int = 3
        const val NARRATOR_DUCKING_DB: Int = 12
    }
}
