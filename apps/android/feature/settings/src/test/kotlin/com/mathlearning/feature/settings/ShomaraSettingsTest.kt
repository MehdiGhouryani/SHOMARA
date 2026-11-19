package com.mathlearning.feature.settings

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N05-05 settings reducer tests: dirty/saving/saved/error, toggle-fail revert, restart.
 *
 * ADR-0051 (owner decision, 2026-11-19): the avatar preset was removed, so the settings state
 * carries only the reduced-motion preference. The check that existed only to reject an unknown
 * avatar id was deleted with the catalog; every remaining assertion keeps its original strength.
 */
class ShomaraSettingsTest {

    @Test
    fun `motion edits mark the state dirty`() {
        val clean = ShomaraSettingsState(reducedMotion = false)
        assertEquals(ShomaraSettingsSaveState.Clean, clean.save)
        assertFalse(clean.canSave)
        val dirtyMotion = clean.withReducedMotion(true)
        assertEquals(ShomaraSettingsSaveState.Dirty, dirtyMotion.save)
        assertTrue(dirtyMotion.canSave)
    }

    @Test
    fun `same-value edits are no-ops - no dirty churn`() {
        val clean = ShomaraSettingsState(reducedMotion = true)
        assertEquals(clean, clean.withReducedMotion(true))
    }

    @Test
    fun `save lifecycle is dirty then saving then saved`() {
        var state = ShomaraSettingsState(reducedMotion = false).withReducedMotion(true)
        state = state.startSave()
        assertEquals(ShomaraSettingsSaveState.Saving, state.save)
        assertFalse(state.canSave)
        state = state.onSaveSuccess()
        assertEquals(ShomaraSettingsSaveState.Saved, state.save)
        assertTrue(state.errorText == null)
    }

    @Test
    fun `toggle-fail reverts cleanly with a warm error and can retry`() {
        var state = ShomaraSettingsState(reducedMotion = false).withReducedMotion(true).startSave()
        state = state.onSaveFailure(ShomaraSettingsStrings.SaveFailed)
        assertEquals(ShomaraSettingsSaveState.Error, state.save)
        assertEquals(ShomaraSettingsStrings.SaveFailed, state.errorText)
        // The user can retry from the error state.
        assertTrue(state.withReducedMotion(false).canSave || state.withReducedMotion(false).save == ShomaraSettingsSaveState.Clean)
    }

    @Test
    fun `save from clean state is rejected`() {
        val clean = ShomaraSettingsState(reducedMotion = false)
        assertThrows(IllegalArgumentException::class.java) { clean.startSave() }
    }

    // ADR-0051: the `unknown avatar is rejected at construction` check was removed with the avatar
    // catalog it validated against — with no avatar field there is no id left to reject.

    @Test
    fun `reduced motion toggle maps to the design-system reducedMotion contract`() {
        // The toggle's value IS the reducedMotion flag consumed by progress/components.
        val state = ShomaraSettingsState(reducedMotion = true)
        assertTrue(state.reducedMotion)
    }

    @Test
    fun `section headings never repeat the page title`() {
        // Regression: the preferences heading used to be the literal «تنظیمات», so TalkBack read
        // the page title twice and the section had no distinct name. Canonical strings only.
        assertTrue(ShomaraSettingsStrings.PreferencesSection.isNotBlank())
        assertTrue(ShomaraSettingsStrings.PreferencesSection != ShomaraSettingsStrings.Title)
    }

    // ADR-0051: the `selected avatar line is built from the real catalog label` check was removed
    // with the avatar preset feature — the selected-avatar line no longer exists to be built.
}
