package com.mathlearning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** B12 — audio-manifest CSV parser (staging/admin only): BOM, uniqueness, row/file report. */
class ShomaraAudioManifestTest {

    private val csv = "\uFEFFid,kind,text_display,text_tts,voice,rate,status,used_by,notes\n" +
        "G.ok.01,ok,درست است.,درست است.,fa-IR-DilaraNeural,-15%,draft,global,\n" +
        "G.ok.02,ok,همین‌طور است.,همین‌طور است.,fa-IR-DilaraNeural,-15%,draft,global,\n"

    @Test
    fun `BOM header parses two rows with no errors`() {
        val report = ShomaraAudioManifest.parse(csv)
        assertEquals(2, report.rows.size)
        assertEquals("G.ok.01", report.rows[0].id)
        assertEquals("ok", report.rows[0].kind)
        assertTrue(report.errors.isEmpty())
        assertTrue(report.duplicateIds.isEmpty())
    }

    @Test
    fun `duplicate ids are reported - never silently merged`() {
        val duplicated = csv + "G.ok.01,ok,درست است.,درست است.,fa-IR-DilaraNeural,-15%,draft,global,\n"
        val report = ShomaraAudioManifest.parse(duplicated)
        assertEquals(listOf("G.ok.01"), report.duplicateIds)
        assertEquals(3, report.rows.size)
    }

    @Test
    fun `rows without a file and files without a row are both reported`() {
        val report = ShomaraAudioManifest.parse(
            csv,
            knownFiles = setOf("G.ok.01.opus", "G.orphan.opus"),
        )
        assertEquals(listOf("G.ok.02"), report.rowsWithoutFile)
        assertEquals(listOf("G.orphan"), report.filesWithoutRow)
    }

    @Test
    fun `with no known files every row is without a file - the honest staging state`() {
        val report = ShomaraAudioManifest.parse(csv)
        assertEquals(listOf("G.ok.01", "G.ok.02"), report.rowsWithoutFile)
        assertTrue(report.filesWithoutRow.isEmpty())
    }

    @Test
    fun `malformed rows are reported with their line number`() {
        val bad = "\uFEFFid,kind,text_display,text_tts,voice,rate,status,used_by,notes\n" +
            "G.ok.01,ok,short\n" +
            ",ok,empty id,,,,,,\n"
        val report = ShomaraAudioManifest.parse(bad)
        assertEquals(2, report.errors.size)
        assertTrue(report.errors[0].contains("line 2"))
        assertTrue(report.errors[1].contains("line 3"))
        assertTrue(report.rows.isEmpty())
    }

    @Test
    fun `empty manifest reports an error`() {
        val report = ShomaraAudioManifest.parse("")
        assertEquals(listOf("empty manifest"), report.errors)
    }
}
