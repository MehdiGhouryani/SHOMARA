package com.mathlearning.feature.settings

import com.mathlearning.core.model.ShomaraAvatarCatalog
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
 *   `startSave()`. `startSave()` requires `Dirty`, so tapping an avatar threw
 *   `IllegalArgumentException: save started from an invalid state` and killed the process.
 *   Fix: drive the machine in order (select -> withAvatar marks Dirty -> startSave).
 *
 * BUG 2 — the child's saved avatar was silently overwritten
 *   The caller seeded `remember` from `ShomaraSettingsSnapshot.Defaults`, because
 *   `collectAsStateWithLifecycle` starts at the initial value and only emits the real stored value
 *   later. The screen therefore believed the avatar was the DEFAULT and the first interaction wrote
 *   that default over the saved choice: choose "moon", relaunch, toggle anything -> back to "sun".
 *   Fix: seed once from the first real emission, then treat screen state as authoritative.
 *
 * These tests pin the ORDERING CONTRACT that the caller must respect.
 */
class ShomaraSettingsWiringTest {

    private fun fresh(avatarId: String = "sun", reducedMotion: Boolean = false) =
        ShomaraSettingsState(avatarId = avatarId, reducedMotion = reducedMotion)

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
    fun `selecting an avatar makes the state savable`() {
        val dirty = fresh(avatarId = "sun").withAvatar("moon")
        assertEquals("moon", dirty.avatarId)
        assertEquals(ShomaraSettingsSaveState.Dirty, dirty.save)
        assertTrue(dirty.canSave)
        // Now the save is legitimate and moves to Saving.
        assertEquals(ShomaraSettingsSaveState.Saving, dirty.startSave().save)
    }

    @Test
    fun `selecting the already-selected avatar does not create a dirty state`() {
        val unchanged = fresh(avatarId = "moon").withAvatar("moon")
        assertEquals(ShomaraSettingsSaveState.Clean, unchanged.save)
        assertFalse(unchanged.canSave)
    }

    @Test
    fun `selecting then persisting never reaches startSave from clean`() {
        // Mirrors the caller exactly: withAvatar -> startSave -> success.
        var state = fresh(avatarId = "sun")
        for (target in listOf("moon", "leaf", "cloud")) {
            state = state.withAvatar(target)
            assertTrue("after selecting $target the state must be savable", state.canSave)
            state = state.startSave()
            state = state.onSaveSuccess()
            assertEquals(target, state.avatarId)
            assertEquals(ShomaraSettingsSaveState.Saved, state.save)
            // A second tap on the same avatar must NOT re-enter startSave.
            state = state.withAvatar(target)
            assertFalse(state.canSave)
        }
    }

    @Test
    fun `a save failure is reported and does not claim success`() {
        val failed = fresh().withAvatar("moon").startSave().onSaveFailure("disk full")
        assertEquals(ShomaraSettingsSaveState.Error, failed.save)
        assertEquals("disk full", failed.errorText)
        assertFalse(failed.canSave)
    }

    // ---- BUG 2: the saved avatar must survive an unrelated change ----

    @Test
    fun `changing reduced motion preserves the avatar`() {
        // The exact device repro: persisted avatar "moon", then toggle motion.
        val loaded = fresh(avatarId = "moon", reducedMotion = false)
        val toggled = loaded.withReducedMotion(true)
        assertEquals("moon", toggled.avatarId)
        assertTrue(toggled.reducedMotion)
    }

    @Test
    fun `changing the avatar preserves reduced motion`() {
        val loaded = fresh(avatarId = "sun", reducedMotion = true)
        val changed = loaded.withAvatar("cloud")
        assertTrue(changed.reducedMotion)
        assertEquals("cloud", changed.avatarId)
    }

    @Test
    fun `a defaulted base state is what caused the overwrite so it must be detectable`() {
        // Documents the failure mode: if the caller hands the screen a DEFAULT state while the
        // store really holds "moon", the next interaction writes the default back. The guard is
        // that the caller seeds from the store, so the screen's base must equal the stored value.
        val storedAvatar = "moon"
        val wronglySeeded = fresh(avatarId = "sun", reducedMotion = false)
        // Proof of the bug shape: touching motion here would persist avatarId="sun".
        val afterToggle = wronglySeeded.withReducedMotion(true)
        assertEquals("sun", afterToggle.avatarId)
        assertTrue(
            "with correct seeding the base avatar must already equal the stored one",
            afterToggle.avatarId != storedAvatar,
        )
        // Correct behaviour:
        val correctlySeeded = fresh(avatarId = storedAvatar, reducedMotion = false)
        assertEquals(storedAvatar, correctlySeeded.withReducedMotion(true).avatarId)
    }

    @Test
    fun `round-trip through every other avatar keeps the reduced-motion preference`() {
        // Note: selecting the ALREADY-selected avatar is a deliberate no-op (it does not make the
        // state Dirty), so it must not be driven through startSave — that would throw, correctly.
        var state = fresh(avatarId = "sun", reducedMotion = true)
        for (option in ShomaraAvatarCatalog.Options) {
            if (option.id == state.avatarId) continue
            state = state.withAvatar(option.id).startSave().onSaveSuccess()
            assertTrue("motion preference lost after selecting ${option.id}", state.reducedMotion)
            assertEquals(option.id, state.avatarId)
        }
    }

    // ---- BUG 3: re-entering Settings showed "sun" although the store held "moon" ----
    //
    // The host seeded the screen once from the first `collectAsStateWithLifecycle` value —
    // but that first value is the `Defaults` placeholder, not a store emission, so the
    // seed-once flag was consumed by "sun" and the later real "moon" emission was ignored.
    // The fix re-seeds on every store emission while the screen is still Clean, and never
    // once the user has edited. These tests pin that rule on the pure state machine; the
    // Compose wiring itself (placeholder first frame, then real emission) is only provable
    // by the device check "select moon -> BACK -> re-enter Settings -> moon".

    @Test
    fun `reseed replaces the avatar while the state is still clean`() {
        // The exact device repro: the screen was seeded from the placeholder ("sun") while
        // the store really holds "moon". A Clean screen has no in-flight edit, so the
        // store is the only truth and the reseed must apply.
        val seededFromPlaceholder = fresh(avatarId = "sun")
        val reseeded = seededFromPlaceholder.reseededFrom(avatarId = "moon", reducedMotion = false)
        assertEquals("moon", reseeded.avatarId)
        assertEquals(ShomaraSettingsSaveState.Clean, reseeded.save)
    }

    @Test
    fun `reseed preserves the reduced-motion preference of the stored snapshot`() {
        val reseeded = fresh(avatarId = "sun", reducedMotion = false)
            .reseededFrom(avatarId = "moon", reducedMotion = true)
        assertEquals("moon", reseeded.avatarId)
        assertTrue("stored motion preference lost by the reseed", reseeded.reducedMotion)
    }

    @Test
    fun `reseed never overwrites a dirty edit`() {
        // The user picked "moon" but the store still echoes the old "sun" (the write has
        // not landed yet): the in-flight edit wins and the stale emission is ignored.
        val dirty = fresh(avatarId = "sun").withAvatar("moon")
        val afterStaleEmission = dirty.reseededFrom(avatarId = "sun", reducedMotion = false)
        assertEquals("moon", afterStaleEmission.avatarId)
        assertEquals(ShomaraSettingsSaveState.Dirty, afterStaleEmission.save)
    }

    @Test
    fun `reseed never overwrites a saving or saved state`() {
        // The store emission that follows our own save carries the write back; the screen
        // already holds the saved value, so the echo must not touch it.
        val saving = fresh(avatarId = "sun").withAvatar("moon").startSave()
        val afterEchoWhileSaving = saving.reseededFrom(avatarId = "sun", reducedMotion = false)
        assertEquals("moon", afterEchoWhileSaving.avatarId)
        assertEquals(ShomaraSettingsSaveState.Saving, afterEchoWhileSaving.save)
        val saved = saving.onSaveSuccess()
        val afterEchoWhileSaved = saved.reseededFrom(avatarId = "sun", reducedMotion = false)
        assertEquals("moon", afterEchoWhileSaved.avatarId)
        assertEquals(ShomaraSettingsSaveState.Saved, afterEchoWhileSaved.save)
    }

    @Test
    fun `reseed never overwrites a failed save`() {
        val failed = fresh(avatarId = "sun").withAvatar("moon").startSave()
            .onSaveFailure("disk full")
        val afterEmission = failed.reseededFrom(avatarId = "sun", reducedMotion = false)
        assertEquals("moon", afterEmission.avatarId)
        assertEquals(ShomaraSettingsSaveState.Error, afterEmission.save)
        assertEquals("disk full", afterEmission.errorText)
    }
}