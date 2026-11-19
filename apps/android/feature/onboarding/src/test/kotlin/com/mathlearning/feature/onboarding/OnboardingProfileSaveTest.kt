package com.mathlearning.feature.onboarding

import com.mathlearning.core.datastore.ShomaraProfileDraftSnapshot
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Profile save persistence (N04-04 / #100) with no settings store in the loop.
 *
 * ADR-0051 (owner decision, 2026-11-19): this file replaces `OnboardingAvatarMirrorTest`. That
 * suite existed only to prove the avatar mirror into the settings store; the mirror and the avatar
 * preset were removed, so its two mirror-only tests and its failing-mirror test were deleted
 * instead of being diluted. The one broader property it also covered — a profile save persists the
 * draft and advances — is kept here and now asserts both fields the draft still owns.
 *
 * These tests use in-memory fakes only; no DataStore, no Compose, no device.
 */
class OnboardingProfileSaveTest {

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

    @Test
    fun `profile save persists the draft and advances to placement`() = runTest {
        val draftStore = FakeDraftStore()
        val holder = ShomaraOnboardingStateHolder(session = null, draftStore = draftStore)
        holder.profileDraft = ShomaraProfileDraft(name = "آریا", gradeId = "G3")
        holder.saveState = holder.saveState.copy(draft = holder.profileDraft)

        holder.saveProfile(onComplete = {})

        assertEquals(OnboardingStep.GradePlacement, holder.flow.step)
        assertTrue("profile save must be marked saved", holder.saveState.saved)
        // The draft still gets its own write — name and grade are what it owns.
        assertEquals("آریا", draftStore.saved?.name)
        assertEquals("G3", draftStore.saved?.gradeId)
    }
}
