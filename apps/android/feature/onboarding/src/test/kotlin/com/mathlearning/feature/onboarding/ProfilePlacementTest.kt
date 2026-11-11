package com.mathlearning.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import com.mathlearning.core.model.ShomaraGradeCatalog
import org.junit.Test

/** N04-04 profile/placement logic tests: save retry, incomplete state, server authority. */
class ProfilePlacementTest {

    @Test
    fun `draft completeness and validation rules`() {
        val empty = ShomaraProfileDraft()
        assertFalse(empty.isComplete)
        assertFalse(empty.canSave)
        assertTrue(ShomaraProfileDraft(name = "آریا").isComplete)
        assertFalse(ShomaraProfileDraft(name = "آ").isComplete) // too short
        assertFalse(ShomaraProfileDraft(name = "آریا ۲").isComplete) // digits
        assertFalse(ShomaraProfileDraft(name = " آریا").isComplete) // untrimmed
        assertEquals(ShomaraProfileStrings.NameInvalid, ShomaraProfileDraft.nameValidationError("۲"))
        assertNull(ShomaraProfileDraft.nameValidationError("آریا"))
    }

    @Test
    fun `all six grades are selectable - unknown grades rejected at construction`() {
        // Owner decision 2026-11-06 (page 02-profile): every grade is selectable;
        // availability no longer gates selection or draft construction. The catalog
        // still records which grades have curriculum content (only G1 today), as
        // content truth — the `available` flags and lockedReason are untouched.
        assertEquals(listOf("G1", "G2", "G3", "G4", "G5", "G6"), ShomaraGradeCatalog.Options.map { it.id })
        assertEquals(listOf("G1"), ShomaraGradeCatalog.Options.filter { it.available }.map { it.id })
        for (gradeId in listOf("G1", "G2", "G3", "G4", "G5", "G6")) {
            assertEquals(gradeId, ShomaraProfileDraft(name = "آریا", gradeId = gradeId).gradeId)
        }
        assertEquals(ShomaraProfileStrings.GradeOne, ShomaraProfileDraft.gradeLabel("G1"))
        assertEquals("G1", ShomaraProfileDraft().gradeId)
        assertThrows(IllegalArgumentException::class.java) { ShomaraProfileDraft(name = "آریا", gradeId = "G9") }
    }

    @Test
    fun `owner-supplied page 02 strings are pinned`() {
        assertEquals("نام کودک را وارد کنید", ShomaraProfileStrings.ProfileTitle)
        assertEquals("پایه تحصیلی را انتخاب کنید", ShomaraProfileStrings.GradeSectionTitle)
        assertEquals("ادامه", ShomaraProfileStrings.Continue)
    }

    @Test
    fun `save reducer keeps state warm across retries`() {
        var state = ShomaraProfileSaveState(draft = ShomaraProfileDraft(name = "آریا"))
        assertTrue(state.canSubmit)
        state = state.startSave()
        assertFalse(state.canSubmit)
        state = state.onSaveFailure()
        assertEquals(1, state.attempt)
        assertEquals(ShomaraProfileStrings.SaveFailed, state.failureMessage)
        assertTrue(state.canSubmit) // draft untouched, ready for the warm retry
        state = state.startSave().onSaveFailure()
        assertEquals(2, state.attempt)
        assertEquals(ShomaraProfileStrings.SaveRetry, state.failureMessage)
        // Success clears any failure and freezes the form.
        state = state.startSave().onSaveSuccess()
        assertTrue(state.saved)
        assertFalse(state.canSubmit)
        assertEquals("ذخیره شد", state.announcement())
        assertEquals("۲", state.attemptFa())
    }

    @Test
    fun `save cannot start from an invalid state`() {
        val incomplete = ShomaraProfileSaveState(draft = ShomaraProfileDraft())
        assertFalse(incomplete.canSubmit)
        assertThrows(IllegalArgumentException::class.java) { incomplete.startSave() }
        val inFlight = ShomaraProfileSaveState(draft = ShomaraProfileDraft(name = "آریا")).startSave()
        assertFalse(inFlight.canSubmit)
        assertThrows(IllegalArgumentException::class.java) { inFlight.startSave() }
    }

    @Test
    fun `placement is server-authoritative - client only reports skip or renders decision`() {
        val pending = ShomaraPlacementState()
        assertTrue(pending.isPending)
        val skipped = ShomaraPlacementState.skip()
        assertTrue(skipped.isSkipped)
        assertFalse(skipped.isPending)
        val decided = pending.withServerDecision("ایستگاه شمارش")
        assertFalse(decided.isPending)
        assertEquals("ایستگاه شمارش", decided.serverDecision)
        // A skipped placement and a server decision are mutually exclusive by construction.
        assertThrows(IllegalArgumentException::class.java) { ShomaraPlacementState(serverDecision = "x", skippedByUser = true) }
    }

    @Test
    fun `placement requires a complete profile before entry`() {
        assertFalse(ShomaraProfileDraft().canEnterPlacement)
        assertTrue(ShomaraProfileDraft(name = "آریا").canEnterPlacement)
    }
}
