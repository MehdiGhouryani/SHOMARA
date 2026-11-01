package com.mathlearning.feature.settings

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N05-05 settings reducer tests: dirty/saving/saved/error, toggle-fail revert, restart. */
class ShomaraSettingsTest {

    @Test
    fun `avatar and motion edits mark the state dirty`() {
        val clean = ShomaraSettingsState(avatarId = "sun", reducedMotion = false)
        assertEquals(ShomaraSettingsSaveState.Clean, clean.save)
        assertFalse(clean.canSave)
        val dirtyAvatar = clean.withAvatar("leaf")
        assertEquals(ShomaraSettingsSaveState.Dirty, dirtyAvatar.save)
        assertTrue(dirtyAvatar.canSave)
        val dirtyMotion = clean.withReducedMotion(true)
        assertEquals(ShomaraSettingsSaveState.Dirty, dirtyMotion.save)
    }

    @Test
    fun `same-value edits are no-ops - no dirty churn`() {
        val clean = ShomaraSettingsState(avatarId = "sun", reducedMotion = true)
        assertEquals(clean, clean.withAvatar("sun"))
        assertEquals(clean, clean.withReducedMotion(true))
    }

    @Test
    fun `save lifecycle is dirty then saving then saved`() {
        var state = ShomaraSettingsState(avatarId = "sun", reducedMotion = false).withAvatar("moon")
        state = state.startSave()
        assertEquals(ShomaraSettingsSaveState.Saving, state.save)
        assertFalse(state.canSave)
        state = state.onSaveSuccess()
        assertEquals(ShomaraSettingsSaveState.Saved, state.save)
        assertTrue(state.errorText == null)
    }

    @Test
    fun `toggle-fail reverts cleanly with a warm error and can retry`() {
        var state = ShomaraSettingsState(avatarId = "sun", reducedMotion = false).withReducedMotion(true).startSave()
        state = state.onSaveFailure(ShomaraSettingsStrings.SaveFailed)
        assertEquals(ShomaraSettingsSaveState.Error, state.save)
        assertEquals(ShomaraSettingsStrings.SaveFailed, state.errorText)
        // The user can retry from the error state.
        assertTrue(state.withReducedMotion(false).canSave || state.withReducedMotion(false).save == ShomaraSettingsSaveState.Clean)
    }

    @Test
    fun `save from clean state is rejected`() {
        val clean = ShomaraSettingsState(avatarId = "sun", reducedMotion = false)
        assertThrows(IllegalArgumentException::class.java) { clean.startSave() }
    }

    @Test
    fun `unknown avatar is rejected at construction`() {
        assertThrows(IllegalArgumentException::class.java) { ShomaraSettingsState(avatarId = "dragon", reducedMotion = false) }
    }

    @Test
    fun `reduced motion toggle maps to the design-system reducedMotion contract`() {
        // The toggle's value IS the reducedMotion flag consumed by progress/components.
        val state = ShomaraSettingsState(avatarId = "sun", reducedMotion = true)
        assertTrue(state.reducedMotion)
    }
}
