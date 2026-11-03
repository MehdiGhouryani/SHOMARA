package com.mathlearning.core.datastore

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.edit
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
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files

/**
 * N08-04 settings persistence on a REAL file-backed DataStore.
 *
 * Before this store existed the avatar/reduced-motion choices lived only in `remember`, so the
 * screen could announce "ذخیره شد." while nothing survived process death. These tests prove the
 * value is actually written to disk and read back by a SECOND store instance over the same file —
 * which is exactly what a process restart does.
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
            assertEquals("sun", snapshot.avatarId)
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
            first.save(ShomaraSettingsSnapshot(avatarId = "moon", reducedMotion = true))
            firstScope.coroutineContext[kotlinx.coroutines.Job]?.cancelAndJoin()

            val reloaded = newStore().state.first()
            assertEquals("moon", reloaded.avatarId)
            assertTrue(reloaded.reducedMotion)
        }
    }

    @Test
    fun `saving one field preserves the other`() = runBlocking {
        withTimeout(10_000) {
            val store = newStore()
            store.save(ShomaraSettingsSnapshot(avatarId = "leaf", reducedMotion = false))
            assertEquals("leaf", store.state.first().avatarId)
            store.save(ShomaraSettingsSnapshot(avatarId = "leaf", reducedMotion = true))
            val after = store.state.first()
            assertEquals("leaf", after.avatarId)
            assertTrue(after.reducedMotion)
        }
    }

    @Test
    fun `an unknown avatar id falls back to the default instead of an unresolvable surface`() = runBlocking {
        withTimeout(10_000) {
            // Simulates a catalog change leaving an orphaned id on disk.
            val dataStore = PreferenceDataStoreFactory.create(scope = scope, produceFile = { file() })
            dataStore.edit {
                it[androidx.datastore.preferences.core.stringPreferencesKey("shomara_settings_avatar")] = "retired-avatar"
            }
            assertEquals("sun", PreferencesSettingsStore(dataStore).state.first().avatarId)
        }
    }

    @Test
    fun `saving an invalid avatar is rejected rather than written`() = runBlocking {
        withTimeout(10_000) {
            val store = newStore()
            val rejected = runCatching {
                store.save(ShomaraSettingsSnapshot(avatarId = "not-an-avatar", reducedMotion = false))
            }
            assertTrue(
                "an unknown avatar must be rejected, not silently persisted",
                rejected.exceptionOrNull() is IllegalArgumentException,
            )
            // The rejection must not have partially written anything.
            assertEquals(ShomaraSettingsSnapshot.Defaults, store.state.first())
        }
    }
}