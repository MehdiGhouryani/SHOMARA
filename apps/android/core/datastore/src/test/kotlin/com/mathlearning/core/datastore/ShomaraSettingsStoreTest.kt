package com.mathlearning.core.datastore

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files

/**
 * N08-04 settings persistence on a REAL file-backed DataStore.
 *
 * Before this store existed the reduced-motion choice lived only in `remember`, so the screen could
 * announce "ذخیره شد." while nothing survived process death. These tests prove the value is
 * actually written to disk and read back by a SECOND store instance over the same file — which is
 * exactly what a process restart does.
 *
 * ADR-0051 (owner decision, 2026-11-19): the avatar preset was removed, so the tests that existed
 * only to prove avatar-id validation and the unknown-id fallback were deleted with the feature. The
 * persistence contract they sat beside — documented defaults and a real disk round-trip — is
 * unchanged and still measured here.
 */
class ShomaraSettingsStoreTest {

    private val tempDir: File = Files.createTempDirectory("shomara-settings-test").toFile()
    private val scope = CoroutineScope(Dispatchers.IO)
    private fun file() = File(tempDir, "shomara_settings_test.preferences_pb")

    private fun newStore() = PreferencesSettingsStore(
        PreferenceDataStoreFactory.create(scope = scope, produceFile = { file() }),
    )

    @After
    fun tearDown() {
        tempDir.deleteRecursively()
    }

    @Test
    fun `defaults are the documented product defaults`() = runBlocking {
        withTimeout(10_000) {
            val snapshot = newStore().state.first()
            assertFalse(snapshot.reducedMotion)
            assertEquals(ShomaraSettingsSnapshot.Defaults, snapshot)
        }
    }

    @Test
    fun `save persists across a new store instance over the same file`() = runBlocking {
        withTimeout(10_000) {
            // DataStore forbids two LIVE instances on one file, so the first store's scope is
            // cancelled before reopening — that is also what a real process restart does.
            val firstScope = CoroutineScope(Dispatchers.IO)
            val first = PreferencesSettingsStore(
                PreferenceDataStoreFactory.create(scope = firstScope, produceFile = { file() }),
            )
            first.save(ShomaraSettingsSnapshot(reducedMotion = true))
            firstScope.coroutineContext[Job]?.cancelAndJoin()

            val reloaded = newStore().state.first()
            assertTrue(reloaded.reducedMotion)
            assertEquals(ShomaraSettingsSnapshot(reducedMotion = true), reloaded)
        }
    }
}
