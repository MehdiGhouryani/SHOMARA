package com.mathlearning.core.designsystem

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** N03-05 navigation/dialog/audio contract tests (JVM-pure logic). */
class ShomaraPrimitives05Test {

    // ---- child tab bar contract ----

    @Test
    fun `child shell keeps exactly the three canonical tabs`() {
        assertEquals(listOf("مسیر", "تمرین", "من"), ShomaraChildTabs.All)
        assertEquals(3, ShomaraChildTabs.All.size)
        assertTrue(ShomaraChildTabs.isCanonical(ShomaraChildTabs.All))
        assertFalse(ShomaraChildTabs.isCanonical(ShomaraChildTabs.All + "والدین"))
        assertFalse(ShomaraChildTabs.isCanonical(listOf("مسیر", "من", "تمرین")))
        // Guardian surfaces stay outside the child tab bar.
        assertTrue(ShomaraChildTabs.All.none { it.contains("والد") || it.contains("parent", ignoreCase = true) })
    }

    @Test
    fun `locked tabs announce a reason and block selection`() {
        val locked = ShomaraTab(id = "practice", label = "تمرین", locked = true, lockReason = "پس از مسیر باز می‌شود")
        val open = ShomaraTab(id = "path", label = "مسیر")
        assertFalse(ShomaraTabLogic.canSelect(locked))
        assertTrue(ShomaraTabLogic.canSelect(open))
        assertTrue(ShomaraTabLogic.stateLabelFor(locked, isSelected = false).startsWith("قفل"))
        assertEquals("انتخاب نشده", ShomaraTabLogic.stateLabelFor(open, isSelected = false))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraTab(id = "x", label = "بسته", locked = true, lockReason = null)
        }
    }

    @Test
    fun `duplicate navigation is prevented and locked taps keep selection`() {
        val path = ShomaraTab(id = "path", label = "مسیر")
        val practice = ShomaraTab(id = "practice", label = "تمرین")
        val locked = ShomaraTab(id = "me", label = "من", locked = true, lockReason = "قفل")
        assertEquals("practice", ShomaraTabLogic.resolveSelection("path", practice))
        assertEquals("path", ShomaraTabLogic.resolveSelection("path", path)) // re-tap: no change
        assertEquals("path", ShomaraTabLogic.resolveSelection("path", locked)) // locked: no change
        assertNull(ShomaraTabLogic.resolveSelection(null, null))
    }

    @Test
    fun `topbar back semantics require a real route behind`() {
        assertTrue(ShomaraTopBarLogic.backIsReal(showBack = true))
        assertFalse(ShomaraTopBarLogic.backIsReal(showBack = false))
        assertTrue(ShomaraTopBarLogic.backTouchTarget() >= ShomaraTokens.ComponentTouchMin)
        assertEquals(ShomaraTokens.ComponentTopBarH, ShomaraTopBarLogic.height())
    }

    // ---- dialog / sheet ----

    @Test
    fun `dialog dismiss policy is fail-closed`() {
        assertTrue(ShomaraDialogLogic.canDismiss(ShomaraDialogState()))
        assertFalse(ShomaraDialogLogic.canDismiss(ShomaraDialogState(busy = true)))
        assertFalse(ShomaraDialogLogic.canDismiss(ShomaraDialogState(dismissible = false)))
        assertEquals("در حال پردازش؛ لطفاً صبر کنید", ShomaraDialogLogic.dismissBlockReason(ShomaraDialogState(busy = true)))
        assertEquals("این پنجره در این مرحله بسته نمی‌شود", ShomaraDialogLogic.dismissBlockReason(ShomaraDialogState(dismissible = false)))
        assertNull(ShomaraDialogLogic.dismissBlockReason(ShomaraDialogState()))
        assertFalse(ShomaraDialogLogic.confirmEnabled(ShomaraDialogState(busy = true)))
    }

    @Test
    fun `dialog error keeps the dialog open and is announced`() {
        val error = ShomaraDialogState(errorText = "اتصال برقرار نشد")
        assertTrue(ShomaraDialogLogic.errorKeepsOpen(error))
        assertTrue(ShomaraDialogLogic.canDismiss(error)) // error is dismissible unless busy/locked
        assertFalse(ShomaraDialogLogic.errorKeepsOpen(ShomaraDialogState()))
        assertEquals("خطا", ShomaraDialogLogic.ErrorAnnouncement)
    }

    // ---- audio ----

    @Test
    fun `text fallback is mandatory for unavailable and failed audio`() {
        assertTrue(ShomaraAudioLogic.requiresTextFallback(ShomaraAudioState.Unavailable))
        assertTrue(ShomaraAudioLogic.requiresTextFallback(ShomaraAudioState.Failed))
        for (state in ShomaraAudioState.entries) {
            if (state == ShomaraAudioState.Unavailable || state == ShomaraAudioState.Failed) continue
            assertFalse("state $state must not demand fallback", ShomaraAudioLogic.requiresTextFallback(state))
        }
    }

    @Test
    fun `audio never locks the lesson - contract constant over every state`() {
        for (state in ShomaraAudioState.entries) {
            assertFalse("lesson must never be locked by audio state $state", ShomaraAudioLogic.isContentLocked(state))
        }
    }

    @Test
    fun `audio actions and labels cover the state machine`() {
        assertEquals(ShomaraAudioAction.Pause, ShomaraAudioLogic.actionFor(ShomaraAudioState.Playing))
        assertEquals(ShomaraAudioAction.Play, ShomaraAudioLogic.actionFor(ShomaraAudioState.Paused))
        assertEquals(ShomaraAudioAction.Play, ShomaraAudioLogic.actionFor(ShomaraAudioState.Cached))
        assertEquals(ShomaraAudioAction.Retry, ShomaraAudioLogic.actionFor(ShomaraAudioState.Failed))
        assertEquals(ShomaraAudioAction.None, ShomaraAudioLogic.actionFor(ShomaraAudioState.Unavailable))
        assertEquals(ShomaraAudioAction.None, ShomaraAudioLogic.actionFor(ShomaraAudioState.Loading))
        assertFalse(ShomaraAudioLogic.controlEnabled(ShomaraAudioState.Unavailable))
        assertTrue(ShomaraAudioLogic.controlEnabled(ShomaraAudioState.Failed))
        for (state in ShomaraAudioState.entries) {
            assertTrue(ShomaraAudioLogic.labelFor(state).isNotBlank())
        }
    }

    @Test
    fun `audio warm-neutral labels contain no punitive framing`() {
        val punitive = listOf("تنبیه", "باختی", "واقعاً بد")
        for (state in ShomaraAudioState.entries) {
            for (word in punitive) org.junit.Assert.assertFalse(ShomaraAudioLogic.labelFor(state).contains(word))
        }
    }
}
