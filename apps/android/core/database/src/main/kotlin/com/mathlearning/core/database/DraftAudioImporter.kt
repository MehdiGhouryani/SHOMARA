package com.mathlearning.core.database

import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository

/**
 * N07-08 — Kotlin mirror of the draft audio script importer (packages/content-delivery/cms-audio.ts).
 * Idempotent: same CSV rows in → identical registry out. Every row is locked to
 * scriptStatus=DRAFT / publishState=UNPUBLISHED_NO_BINARY; the provider voice survives only as a
 * non-authoritative hint (CONTENT-006/013). Zero binary claims, zero auto-approval.
 * P4: the registry is now the durable AudioAssetRepository (Room) — no in-memory store.
 */
const val DRAFT_STATUS: String = "DRAFT"
const val UNPUBLISHED_NO_BINARY: String = "UNPUBLISHED_NO_BINARY"

data class AudioScriptMetadataEntity(
    val audioId: String,
    val purpose: String,
    val textDisplay: String,
    val textTts: String,
    val scriptStatus: String,
    val usedBy: List<String>,
    val providerVoiceHint: String,
)

object DraftAudioImporter {

    fun fromCsvRow(row: Map<String, String>): AudioScriptMetadataEntity {
        val audioId = (row["id"] ?: "").trim()
        if (audioId.isEmpty()) throw IllegalArgumentException("DRAFT_IMPORT_REJECTED: empty audioId")
        return AudioScriptMetadataEntity(
            audioId = audioId,
            purpose = (row["kind"] ?: "prompt").trim(),
            textDisplay = (row["text_display"] ?: "").trim(),
            textTts = (row["text_tts"] ?: row["text_display"] ?: "").trim(),
            scriptStatus = DRAFT_STATUS,
            usedBy = (row["used_by"] ?: "").split(";").map { it.trim() }.filter { it.isNotEmpty() },
            providerVoiceHint = (row["voice"] ?: "").trim(),
        )
    }

    /** Idempotent import keyed by audioId; the registry is then persisted to the audio table. */
    suspend fun importAll(rows: List<Map<String, String>>, audioAssets: AudioAssetRepository): Int {
        for (row in rows) {
            val draft = fromCsvRow(row)
            audioAssets.upsert(
                AudioAssetRecord(
                    audioId = draft.audioId,
                    localFileRef = null, // no binary exists — never claim one
                    sha256 = null,
                    publishState = UNPUBLISHED_NO_BINARY,
                    voiceProfileId = "vp-fa-01",
                ),
            )
        }
        return rows.size
    }

    /** CONTENT-017: a missing binary always degrades to the Persian text fallback. */
    fun textFallbackOrDisplay(draft: AudioScriptMetadataEntity): String =
        draft.textDisplay.ifBlank { draft.textTts }
}
