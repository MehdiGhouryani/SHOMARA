package com.mathlearning.core.designsystem

import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N03-04 state-matrix, warm-tone and reduced-motion tests (JVM-pure logic). */
class ShomaraPrimitives04Test {

    // ---- card / choice ----

    @Test
    fun `pressed card reduces clay depth and disabled card is flat`() {
        assertEquals(ShomaraClayDepth.Soft, ShomaraCardLogic.depthFor(ShomaraCardState.Default))
        assertEquals(ShomaraClayDepth.Hint, ShomaraCardLogic.depthFor(ShomaraCardState.Pressed))
        assertEquals(ShomaraClayDepth.Flat, ShomaraCardLogic.depthFor(ShomaraCardState.Disabled))
        for (state in ShomaraCardState.entries) {
            assertTrue(ShomaraCardLogic.depthFor(state).ordinal <= ShomaraCardLogic.depthFor(ShomaraCardState.Default).ordinal)
        }
    }

    @Test
    fun `status states always carry a non-color mark or label`() {
        for (state in ShomaraCardState.entries) {
            if (state == ShomaraCardState.Default) continue // no status to convey
            val hasCarrier = ShomaraCardLogic.markFor(state).isNotEmpty() || ShomaraCardLogic.stateLabelFor(state).isNotEmpty()
            assertTrue("state $state lacks a non-color carrier", hasCarrier)
        }
        assertEquals("✓", ShomaraCardLogic.markFor(ShomaraCardState.Correct))
        assertEquals("↺", ShomaraCardLogic.markFor(ShomaraCardState.Retry))
        assertTrue(ShomaraChoiceLogic.requiresExplicitMark(ShomaraCardState.Correct))
        assertTrue(ShomaraChoiceLogic.requiresExplicitMark(ShomaraCardState.Retry))
        assertTrue(ShomaraChoiceLogic.requiresExplicitMark(ShomaraCardState.Checked))
        assertFalse(ShomaraChoiceLogic.requiresExplicitMark(ShomaraCardState.Default))
    }

    @Test
    fun `choice selection is single-select and idempotent`() {
        val options = listOf("a", "b", "c")
        assertEquals("b", ShomaraChoiceLogic.select(options, null, "b"))
        assertEquals("b", ShomaraChoiceLogic.select(options, "a", "b"))
        assertEquals("b", ShomaraChoiceLogic.select(options, "b", "b"))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraChoiceLogic.select(options, null, "z") }
        // At most one featured surface per decision viewport (depth contract).
        assertEquals(1, ShomaraChoiceLogic.maxFeaturedSurfaces())
    }

    @Test
    fun `correct and retry tones resolve from warm token pairs`() {
        val (correctBg, correctBorder, _) = ShomaraCardLogic.colorsFor(ShomaraCardState.Correct)
        assertEquals(ShomaraTokens.ColorPrimarySoft, correctBg)
        assertEquals(ShomaraTokens.ColorPrimary, correctBorder)
        val (retryBg, retryBorder, _) = ShomaraCardLogic.colorsFor(ShomaraCardState.Retry)
        assertEquals(ShomaraTokens.ColorAmberSoft, retryBg)
        assertEquals(ShomaraTokens.ColorAmberEdge, retryBorder)
        // Disabled is quiet, never scary.
        val (disabledBg, _, disabledContent) = ShomaraCardLogic.colorsFor(ShomaraCardState.Disabled)
        assertEquals(ShomaraTokens.ColorSurfaceAlt, disabledBg)
        assertEquals(ShomaraTokens.ColorMuted, disabledContent)
    }

    // ---- feedback ----

    @Test
    fun `feedback defaults are warm-neutral for every kind`() {
        val texts = ShomaraFeedbackKind.entries.map { ShomaraFeedbackLogic.defaultTextFor(it) }
        assertTrue(texts.all { it.isNotBlank() })
        // AGENTS rule 9: no punitive/scary framing in the canonical defaults.
        val punitive = listOf("تنبیه", "اشتباه کردی", "باختی", "واقعاً بد", "شرمنده")
        for (text in texts) for (word in punitive) org.junit.Assert.assertFalse(text.contains(word))
        assertEquals(ShomaraFeedbackStrings.Retry, ShomaraFeedbackLogic.defaultTextFor(ShomaraFeedbackKind.Retry))
        assertEquals(ShomaraFeedbackStrings.Recovery, ShomaraFeedbackLogic.defaultTextFor(ShomaraFeedbackKind.Recovery))
    }

    @Test
    fun `feedback banner geometry is stable across kinds`() {
        for (kind in ShomaraFeedbackKind.entries) {
            assertEquals(ShomaraFeedbackLogic.bannerHeight(), ShomaraFeedbackLogic.bannerHeight())
            assertEquals(ShomaraTokens.ComponentRowH, ShomaraFeedbackLogic.bannerHeight())
        }
    }

    @Test
    fun `feedback tones come from token pairs`() {
        assertEquals(ShomaraTokens.ColorPrimarySoft, ShomaraFeedbackLogic.colorsFor(ShomaraFeedbackKind.Correct).first)
        assertEquals(ShomaraTokens.ColorAmberSoft, ShomaraFeedbackLogic.colorsFor(ShomaraFeedbackKind.Retry).first)
        assertEquals(ShomaraTokens.ColorSkySoft, ShomaraFeedbackLogic.colorsFor(ShomaraFeedbackKind.Recovery).first)
        assertEquals(ShomaraTokens.ColorDangerSoft, ShomaraFeedbackLogic.colorsFor(ShomaraFeedbackKind.Error).first)
    }

    // ---- progress ----

    @Test
    fun `progress kind mapping covers the matrix`() {
        assertEquals(ShomaraProgressKind.Determinate, ShomaraProgressLogic.kindFor(ShomaraProgressState(fraction = 0.4f)))
        assertEquals(ShomaraProgressKind.Indeterminate, ShomaraProgressLogic.kindFor(ShomaraProgressState()))
        assertEquals(ShomaraProgressKind.Paused, ShomaraProgressLogic.kindFor(ShomaraProgressState(fraction = 0.4f, paused = true)))
        assertEquals(ShomaraProgressKind.Offline, ShomaraProgressLogic.kindFor(ShomaraProgressState(fraction = 0.4f, offline = true)))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraProgressState(fraction = 1.4f) }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraProgressState(paused = true, offline = true) }
    }

    @Test
    fun `progress announcements are deterministic word bands, never a percentage`() {
        // ADR-0040 amends the contract: TalkBack progress is announced in words
        // (the last completed quarter), never as a percentage or a score.
        assertEquals("یک‌چهارم راه", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.4f)))
        assertEquals("کامل شد", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 1f)))
        assertEquals("هنوز شروع نشده", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0f)))
        assertEquals("در ابتدای راه", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.1f)))
        assertEquals("نصف راه", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.6f)))
        assertEquals("سه‌چهارم راه", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.9f)))
        assertEquals("در حال آماده‌سازی", ShomaraProgressLogic.announcementFor(ShomaraProgressState()))
        assertEquals("متوقف شد", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.2f, paused = true)))
        assertEquals("آفلاین؛ بعداً ادامه می‌دهیم", ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = 0.2f, offline = true)))
        // No determinate announcement ever carries a percentage word or a score.
        for (fraction in listOf(0f, 0.1f, 0.4f, 0.6f, 0.9f, 1f)) {
            val announcement = ShomaraProgressLogic.announcementFor(ShomaraProgressState(fraction = fraction))
            assertFalse(announcement.contains("درصد"))
        }
    }

    @Test
    fun `reduced motion stops the indeterminate animation only`() {
        val indeterminate = ShomaraProgressState()
        val determinate = ShomaraProgressState(fraction = 0.5f)
        assertTrue(ShomaraProgressLogic.animates(indeterminate, reducedMotion = false))
        assertFalse(ShomaraProgressLogic.animates(indeterminate, reducedMotion = true))
        assertFalse(ShomaraProgressLogic.animates(determinate, reducedMotion = false))
        assertFalse(ShomaraProgressLogic.animates(determinate, reducedMotion = true))
    }

    @Test
    fun `persian digits conversion follows the toFa convention`() {
        assertEquals("۰", ShomaraDigits.toFa(0))
        assertEquals("۴۰", ShomaraDigits.toFa(40))
        assertEquals("۱۰۰", ShomaraDigits.toFa(100))
    }
}
