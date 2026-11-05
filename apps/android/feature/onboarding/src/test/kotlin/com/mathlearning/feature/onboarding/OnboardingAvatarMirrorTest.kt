package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.ShomaraProfileDraftSnapshot
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.datastore.ShomaraSettingsStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Avatar mirror (found on device 2026-11-05): "moon" chosen in the onboarding profile
 * never arrived in Settings/Me. The profile save wrote only the draft store
 * (`shomara_profile_avatar`) while Settings and Me read the settings store
 * (`shomara_settings_avatar`) — two stores, no bridge. `saveProfile` now mirrors the
 * chosen avatar into the settings store, preserving the reduced-motion preference.
 *
 * These tests use in-memory fakes only; no DataStore, no Compose, no device.
 */
class OnboardingAvatarMirrorTest {

    private class FakeDraftStore : ShomaraProfileDraftStore {
        var saved: ShomaraProfileDraftSnapshot? = null
        override suspend fun save(snapshot: ShomaraProfileDraftSnapshot) {
            saved = snapshot
        }

        override suspend fun read(): ShomaraProfileDraftSnapshot? = saved
        override suspend fun clear() {
            saved = null
        }
    }

    private class FakeSettingsStore(
        initialAvatar: String = "sun",
        initialMotion: Boolean = false,
    ) : ShomaraSettingsStore {
        private val backing = MutableStateFlow(
            ShomaraSettingsSnapshot(avatarId = initialAvatar, reducedMotion = initialMotion),
        )
        override val state: Flow<ShomaraSettingsSnapshot> = backing
        var saved: ShomaraSettingsSnapshot? = null
        override suspend fun save(snapshot: ShomaraSettingsSnapshot) {
            saved = snapshot
            backing.value = snapshot
        }
    }

    private class ThrowingSettingsStore : ShomaraSettingsStore {
        override val state: Flow<ShomaraSettingsSnapshot> =
            flowOf(ShomaraSettingsSnapshot.Defaults)
        override suspend fun save(snapshot: ShomaraSettingsSnapshot): Nothing =
            throw IllegalStateException("disk full")
    }

    @Test
    fun `profile save mirrors the avatar into the settings store`() = runTest {
        val draftStore = FakeDraftStore()
        val settingsStore = FakeSettingsStore(initialAvatar = "sun", initialMotion = true)
        val holder = ShomaraOnboardingStateHolder(
            session = null,
            draftStore = draftStore,
            settingsStore = settingsStore,
        )
        holder.profileDraft = ShomaraProfileDraft(name = "آریا", avatarId = "moon")
        holder.saveState = holder.saveState.copy(draft = holder.profileDraft)

        holder.saveProfile(onComplete = {})

        assertEquals(OnboardingStep.GradePlacement, holder.flow.step)
        assertTrue("profile save must be marked saved", holder.saveState.saved)
        // The draft still gets its own write (name/grade live there).
        assertEquals("moon", draftStore.saved?.avatarId)
        assertEquals("آریا", draftStore.saved?.name)
        // The mirror: same avatar, motion preference preserved, not clobbered.
        assertEquals("moon", settingsStore.saved?.avatarId)
        assertTrue(
            "the mirror must preserve the reduced-motion preference",
            settingsStore.saved?.reducedMotion == true,
        )
    }

    @Test
    fun `profile save without a settings store still completes`() = runTest {
        // The settings store is optional: store-less hosts (and older tests) keep working.
        val draftStore = FakeDraftStore()
        val holder = ShomaraOnboardingStateHolder(session = null, draftStore = draftStore)
        holder.profileDraft = ShomaraProfileDraft(name = "آریا", avatarId = "moon")
        holder.saveState = holder.saveState.copy(draft = holder.profileDraft)

        holder.saveProfile(onComplete = {})

        assertEquals(OnboardingStep.GradePlacement, holder.flow.step)
        assertTrue(holder.saveState.saved)
        assertEquals("moon", draftStore.saved?.avatarId)
    }

    @Test
    fun `a failing avatar mirror does not mark the profile saved and does not advance`() = runTest {
        val draftStore = FakeDraftStore()
        val holder = ShomaraOnboardingStateHolder(
            session = null,
            draftStore = draftStore,
            settingsStore = ThrowingSettingsStore(),
        )
        holder.profileDraft = ShomaraProfileDraft(name = "آریا", avatarId = "moon")
        holder.saveState = holder.saveState.copy(draft = holder.profileDraft)

        holder.saveProfile(onComplete = {})

        // The draft write already landed (it runs first), but the profile is NOT saved
        // until the mirror lands too — the user stays on the profile step and can retry.
        assertFalse("a failed mirror must not claim success", holder.saveState.saved)
        assertEquals(OnboardingStep.ProfileSetup, holder.flow.step)
        assertEquals("moon", draftStore.saved?.avatarId)
    }
}
