package com.mathlearning.core.database

import com.mathlearning.core.model.repository.AudioAssetRecord
import com.mathlearning.core.model.repository.AudioAssetRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-08 Kotlin draft importer: 232-row idempotency, DRAFT lock, no binary claims (P4 contracts). */
class DraftAudioImporterTest {

    /** Same-module unit fixture; durable behavior is proven in ShomaraLearningDatabaseTest (Robolectric). */
    private class InMemoryAudioFixture : AudioAssetRepository {
        val rows = LinkedHashMap<String, AudioAssetRecord>()
        override suspend fun upsert(record: AudioAssetRecord) {
            rows[record.audioId] = record
        }
        override suspend fun byId(audioId: String): AudioAssetRecord? = rows[audioId]
        override fun allFlow(): Flow<List<AudioAssetRecord>> = flowOf(rows.values.toList())
    }

    private fun row(id: String): Map<String, String> = mapOf(
        "id" to id, "kind" to "prompt", "text_display" to "متن $id", "text_tts" to "متن $id",
        "voice" to "fa-IR-DilaraNeural", "status" to "draft", "used_by" to "ST07",
    )

    @Test
    fun `232 rows import idempotently - 179 global plus 53 st07`() = runBlocking {
        val audioAssets = InMemoryAudioFixture()
        val global = (1..179).map { row("G.ok.%02d".format(it)) }
        val st07 = (1..53).map { row("ST07.S.row%02d".format(it)) }
        assertEquals(232, DraftAudioImporter.importAll(global + st07, audioAssets))
        assertEquals(232, audioAssets.rows.size)
        // Re-import is a no-op on the registry size (idempotent).
        assertEquals(232, DraftAudioImporter.importAll(global + st07, audioAssets))
        assertEquals(232, audioAssets.rows.size)
    }

    @Test
    fun `every imported row is locked to draft with no binary claims`() = runBlocking {
        val audioAssets = InMemoryAudioFixture()
        DraftAudioImporter.importAll(listOf(row("ST07.P1.s01.a")), audioAssets)
        val asset = audioAssets.byId("ST07.P1.s01.a")
        assertEquals(UNPUBLISHED_NO_BINARY, asset?.publishState)
        assertNull(asset?.localFileRef) // zero TTS-binary claims
        assertNull(asset?.sha256)
    }

    @Test
    fun `provider voice survives only as a non-authoritative hint`() = runBlocking {
        val draft = DraftAudioImporter.fromCsvRow(row("G.ok.01"))
        assertEquals("fa-IR-DilaraNeural", draft.providerVoiceHint)
        assertEquals(DRAFT_STATUS, draft.scriptStatus)
        // The persisted record carries the abstract voiceProfileId, never the provider name.
        val audioAssets = InMemoryAudioFixture()
        DraftAudioImporter.importAll(listOf(row("G.ok.01")), audioAssets)
        assertEquals("vp-fa-01", audioAssets.byId("G.ok.01")?.voiceProfileId)
    }

    @Test
    fun `empty id rows are rejected`() {
        assertThrows(IllegalArgumentException::class.java) { DraftAudioImporter.fromCsvRow(mapOf("id" to "  ")) }
    }

    @Test
    fun `missing binary fallback uses the display text then the tts text`() {
        val display = DraftAudioImporter.fromCsvRow(mapOf("id" to "x", "text_display" to "نمایش", "text_tts" to "خواندن"))
        assertEquals("نمایش", DraftAudioImporter.textFallbackOrDisplay(display))
        val displayOnly = DraftAudioImporter.fromCsvRow(mapOf("id" to "y", "text_display" to "", "text_tts" to "خواندن"))
        assertEquals("خواندن", DraftAudioImporter.textFallbackOrDisplay(displayOnly))
        assertTrue(DraftAudioImporter.textFallbackOrDisplay(display).isNotBlank())
    }
}
