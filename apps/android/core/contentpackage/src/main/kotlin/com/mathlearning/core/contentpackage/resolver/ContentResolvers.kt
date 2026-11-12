package com.mathlearning.core.contentpackage.resolver

import com.mathlearning.core.contentpackage.loader.ContentPackageActivator
import java.io.File

/**
 * Asset resolution against the ACTIVE package (PROPOSED path conventions pending O2 — the
 * resolver is the only place that knows them, so an O2 change lands in exactly one file).
 *
 * Failure is HONEST: an absent asset yields [ResolvedAsset.Absent] — never a silent fallback to
 * other content (ADR-0039 §1). Audio additionally always carries the Persian text fallback so
 * the lesson never blocks (CONTENT-017).
 */
class AssetResolver(private val contentRoot: File) {

    sealed interface ResolvedAsset {
        data class Present(val file: File) : ResolvedAsset
        data class Absent(val reason: String) : ResolvedAsset
    }

    fun resolve(assetId: String): ResolvedAsset {
        val pointer = ContentPackageActivator.readPointer(contentRoot)
            ?: return ResolvedAsset.Absent("no active content package")
        // PROPOSED convention: images/<assetId>.webp under the active package directory.
        val candidate = File(File(contentRoot, pointer.dir), "images/$assetId.webp")
        return if (candidate.isFile) {
            ResolvedAsset.Present(candidate)
        } else {
            ResolvedAsset.Absent("asset $assetId not present in active package ${pointer.packageId} v${pointer.version}")
        }
    }
}

class AudioAssetResolver(private val contentRoot: File, private val textFallback: (audioId: String) -> String) {

    sealed interface ResolvedAudio {
        data class Present(val file: File) : ResolvedAudio
        data class AbsentWithText(val fallbackText: String, val reason: String) : ResolvedAudio
    }

    fun resolve(audioId: String): ResolvedAudio {
        val pointer = ContentPackageActivator.readPointer(contentRoot)
            ?: return ResolvedAudio.AbsentWithText(textFallback(audioId), "no active content package")
        // PROPOSED convention: audio/<audioId>.opus under the active package directory.
        val candidate = File(File(contentRoot, pointer.dir), "audio/$audioId.opus")
        return if (candidate.isFile) {
            ResolvedAudio.Present(candidate)
        } else {
            ResolvedAudio.AbsentWithText(textFallback(audioId), "audio $audioId missing in ${pointer.packageId} v${pointer.version}")
        }
    }
}
