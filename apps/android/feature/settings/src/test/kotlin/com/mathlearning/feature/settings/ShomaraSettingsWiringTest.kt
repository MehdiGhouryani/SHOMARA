package com.mathlearning.feature.settings

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Regressions for two bugs found by DRIVING THE SETTINGS SCREEN ON A DEVICE, after the store
 * itself was already real. Both were wiring defects in the caller, and both were invisible to the
 * unit tests that only exercised the pure state machine.
 *
 * BUG 1 — "save started from an invalid state" (crash)
 *   The caller rebuilt its state from the store snapshot on every recomposition and then called
 *   `startSave()`. `startSave()` requires `Dirty`, so a preference tap threw
 *   `IllegalArgumentException: save started from an invalid state` and killed the process.
 *   Fix: drive the machine in order (toggle -> withReducedMotion marks Dirty -> startSave).
 *
 * BUG 2 — the child's saved preference was silently overwritten
 *   The caller seeded `remember` from `ShomaraSettingsSnapshot.Defaults`, because
 *   `collectAsStateWithLifecycle` starts at the initial value and only emits the real stored value
 *   later. The screen therefore believed the preference was the DEFAULT and the first interaction
 *   wrote that default over the saved choice: turn reduced motion on, relaunch, touch anything ->
 *   back to off. Fix: seed once from the first real emission, then treat screen state as
 *   authoritative.
 *
 * ADR-0051 (owner decision, 2026-11-19): the avatar preset was removed, so reduced motion is the
 * only editable preference. The avatar selection tests and the cross-field preservation tests were
 * deleted with that feature (there is no second field left to preserve); the ordering and re-seed
 * contracts were kept and are now exercised through the motion toggle.
 *
 * These tests pin the ORDERING CONTRACT that the caller must respect.
 */
class ShomaraSettingsWiringTest {

    private fun fresh(reducedMotion: Boolean = false) =
        ShomaraSettingsState(reducedMotion = reducedMotion)

    // ---- BUG 1: startSave must never be reachable from a non-Dirty state ----

    @Test
    fun `startSave from a clean state throws instead of silently saving`() {
        val clean = fresh()
        assertEquals(ShomaraSettingsSaveState.Clean, clean.save)
        assertFalse("a clean state must not be savable", clean.canSave)
        // The caller must therefore NEVER call startSave on a clean state. The state machine
        // refuses loudly rather than pretending to save — that loudness is what surfaced the bug.
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { clean.startSave() }
    }

    @Test
    fun `toggling motion makes the state savable`() {
        val dirty = fresh(reducedMotion = false).withReducedMotion(true)
        assertTrue(dirty.reducedMotion)
        assertEquals(ShomaraSettingsSaveState.Dirty, dirty.save)
        assertTrue(dirty.canSave)
        // Now the save is legitimate and moves to Saving.
        assertEquals(ShomaraSettingsSaveState.Saving, dirty.startSave().save)
    }

    @Test
    fun `toggling to the already-selected value does not create a dirty state`() {
        val unchanged = fresh(reducedMotion = true).withReducedMotion(true)
        assertEquals(ShomaraSettingsSaveState.Clean, unchanged.save)
        assertFalse(unchanged.canSave)
    }

    @Test
    fun `toggling then persisting never reaches startSave from clean`() {
        // Mirrors the caller exactly: withReducedMotion -> startSave -> success.
        var state = fresh(reducedMotion = false)
        for (target in listOf(true, false, true)) {
            state = state.withReducedMotion(target)
            assertTrue("after toggling motion to $target the state must be savable", state.canSave)
            state = state.startSave()
            state = state.onSaveSuccess()
            assertEquals(target, state.reducedMotion)
            assertEquals(ShomaraSettingsSaveState.Saved, state.save)
            // A second tap on the same value must NOT re-enter startSave.
            state = state.withReducedMotion(target)
            assertFalse(state.canSave)
        }
    }

    @Test
    fun `a save failure is reported and does not claim success`() {
        val failed = fresh().withReducedMotion(true).startSave().onSaveFailure("disk full")
        assertEquals(ShomaraSettingsSaveState.Error, failed.save)
        assertEquals("disk full", failed.errorText)
        assertFalse(failed.canSave)
    }

    // ---- BUG 2: the saved preference must survive an unrelated change ----
    //
    // ADR-0051: with the avatar field removed, the settings snapshot holds exactly one preference.
    // The cross-field tests (avatar survives a motion change, and the reverse) were deleted with
    // the avatar feature because they no longer have a second field to preserve. The seeding
    // defect they demonstrated is still covered below, on the one remaining field.

    // ---- BUG 3: re-entering Settings showed the default although the store held the saved value
    //
    // The host seeded the screen once from the first `collectAsStateWithLifecycle` value —
    // but that first value is the `Defaults` placeholder, not a store emission, so the
    // seed-once flag was consumed by the default and the later real emission was ignored.
    // The fix re-seeds on every store emission while the screen is still Clean, and never
    // once the user has edited. These tests pin that rule on the pure state machine; the
    // Compose wiring itself (placeholder first frame, then real emission) is only provable
    // by the device check "turn motion on -> BACK -> re-enter Settings -> on".

    @Test
    fun `reseed adopts the stored snapshot while the state is still clean`() {
        // The screen was seeded from the placeholder (motion off) while the store really holds
        // motion on. A Clean screen has no in-flight edit, so the store is the only truth and the
        // reseed must apply — including the full snapshot, not a partial copy.
        val seededFromPlaceholder = fresh(reducedMotion = false)
        val reseeded = seededFromPlaceholder.reseededFrom(reducedMotion = true)
        assertEquals(ShomaraSettingsState(reducedMotion = true), reseeded)
        assertEquals(ShomaraSettingsSaveState.Clean, reseeded.save)
    }

    @Test
    fun `reseed never overwrites a dirty edit`() {
        // The user turned motion on but the store still echoes the old value (the write has not
        // landed yet): the in-flight edit wins and the stale emission is ignored.
        val dirty = fresh(reducedMotion = false).withReducedMotion(true)
        val afterStaleEmission = dirty.reseededFrom(reducedMotion = false)
        assertTrue(afterStaleEmission.reducedMotion)
        assertEquals(ShomaraSettingsSaveState.Dirty, afterStaleEmission.save)
    }

    @Test
    fun `reseed never overwrites a saving or saved state`() {
        // The store emission that follows our own save carries the write back; the screen
        // already holds the saved value, so the echo must not touch it.
        val saving = fresh(reducedMotion = false).withReducedMotion(true).startSave()
        val afterEchoWhileSaving = saving.reseededFrom(reducedMotion = false)
        assertTrue(afterEchoWhileSaving.reducedMotion)
        assertEquals(ShomaraSettingsSaveState.Saving, afterEchoWhileSaving.save)
        val saved = saving.onSaveSuccess()
        val afterEchoWhileSaved = saved.reseededFrom(reducedMotion = false)
        assertTrue(afterEchoWhileSaved.reducedMotion)
        assertEquals(ShomaraSettingsSaveState.Saved, afterEchoWhileSaved.save)
    }

    @Test
    fun `reseed never overwrites a failed save`() {
        val failed = fresh(reducedMotion = false).withReducedMotion(true).startSave()
            .onSaveFailure("disk full")
        val afterEmission = failed.reseededFrom(reducedMotion = false)
        assertTrue(afterEmission.reducedMotion)
        assertEquals(ShomaraSettingsSaveState.Error, afterEmission.save)
        assertEquals("disk full", afterEmission.errorText)
    }
}
