package com.mathlearning.core.datastore

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files
import kotlin.coroutines.cancellation.CancellationException

/**
 * Real DataStore-backed token store on JVM (N04-03): file-backed Preferences DataStore in a
 * temp directory; save/read/clear round trip plus the fail-closed policy.
 */
class PreferencesTokenStoreTest {

    private val tempDir: File = Files.createTempDirectory("shomara-datastore-test").toFile()
    private val scope = CoroutineScope(Dispatchers.IO)
    private val store: PreferencesTokenStore = PreferencesTokenStore(
        PreferenceDataStoreFactory.create(scope = scope, produceFile = { File(tempDir, "shomara_test.preferences_pb") }),
    )

    @After
    fun tearDown() {
        tempDir.deleteRecursively()
    }

    @Test
    fun `save read clear round trip persists to the real datastore file`() = runBlocking {
        withTimeout(10_000) {
            store.save("tok-123")
            assertEquals("tok-123", store.read())
            store.clear()
            assertNull(store.read())
            assertTrue(File(tempDir, "shomara_test.preferences_pb").exists())
        }
    }

    @Test
    fun `blank tokens are rejected before hitting storage`() {
        try {
            runBlocking { store.save("  ") }
            throw AssertionError("expected blank save to fail")
        } catch (expected: IllegalArgumentException) {
            assertTrue(expected.message!!.contains("blank"))
        } catch (ce: CancellationException) {
            throw AssertionError("unexpected cancellation", ce)
        }
    }

    @Test
    fun `store toString never leaks the token`() {
        assertFalse(store.toString().contains("tok"))
        assertTrue(store.toString().contains("redacted"))
    }

    @Test
    fun `policy usability is fail-closed on blank and null`() {
        assertFalse(ShomaraTokenPolicy.isUsable(null))
        assertFalse(ShomaraTokenPolicy.isUsable("   "))
        assertTrue(ShomaraTokenPolicy.isUsable("token"))
    }

    @Test
    fun `restore window is fail-closed on missing, future-dated and expired entries`() {
        val now = 1_700_000_000_000L
        assertFalse(ShomaraTokenPolicy.canAttemptRestore(null, now, now))
        assertFalse(ShomaraTokenPolicy.canAttemptRestore("t", null, now))
        assertFalse(ShomaraTokenPolicy.canAttemptRestore("t", now + 1, now)) // future-dated: tampering
        assertFalse(
            ShomaraTokenPolicy.canAttemptRestore("t", now - ShomaraTokenPolicy.MaxRestoredSessionMs - 1, now),
        )
        assertTrue(ShomaraTokenPolicy.canAttemptRestore("t", now - ShomaraTokenPolicy.MaxRestoredSessionMs, now))
    }

    @Test
    fun `every exit reason forces a clear`() {
        for (reason in RestoreOutcome.entries) {
            assertTrue("exit reason $reason must clear", ShomaraTokenPolicy.mustClearOnExit(reason))
        }
    }
}
