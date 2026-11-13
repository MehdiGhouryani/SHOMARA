package com.mathlearning.core.profile

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Privacy controller + diagnostics tests (P10): controlled deletion, backup policy statement,
 * and the no-PII log contract.
 */
class PrivacyAndDiagnosticsTest {

    private class CountingStore(override val label: String, private var rows: Int) : PrivacyDataController.PrivacyStore {
        override suspend fun wipeAll(): Int { val n = rows; rows = 0; return n }
    }

    @Test
    fun `controlled deletion wipes every store and directory and reports counts`() = runBlocking {
        val dir = File.createTempFile("wipe-test", "").let { f -> File(f.parent, f.name + "-dir").apply { mkdirs() } }
        File(dir, "nested/deep.bin").apply { parentFile.mkdirs() }.writeText("child data")
        val controller = PrivacyDataController(
            stores = listOf(CountingStore("room", 42), CountingStore("datastore", 7)),
            dirs = listOf(dir),
        )
        val result = controller.deleteAllChildData()
        assertTrue(result.failures.isEmpty())
        assertTrue(result.cleared.any { it.startsWith("room=42") })
        assertTrue(result.cleared.any { it.startsWith("datastore=7") })
        assertTrue(result.cleared.any { it.startsWith(dir.path) })
        assertFalse(dir.exists())
    }

    @Test
    fun `a failing store does not stop the wipe - failures are collected (fail-safe)`() = runBlocking {
        val failing = object : PrivacyDataController.PrivacyStore {
            override val label = "boom"
            override suspend fun wipeAll(): Int = throw IllegalStateException("store exploded")
        }
        val dir = File.createTempFile("wipe2", "").let { f -> File(f.parent, f.name + "-dir").apply { mkdirs() } }
        val result = PrivacyDataController(stores = listOf(failing), dirs = listOf(dir)).deleteAllChildData()
        assertTrue(result.failures.single().startsWith("boom"))
        assertFalse(dir.exists()) // the file wipe still ran
    }

    @Test
    fun `backup policy v1 excludes everything - no child data in cloud or transfer backups`() {
        val policy = BackupPolicyController.current()
        assertFalse(policy.allowBackup)
        assertFalse(policy.cloudBackup)
        assertFalse(policy.deviceTransfer)
        assertTrue(policy.exemptPaths.contains("databases/"))
        assertEquals(BackupPolicyController.POLICY_VERSION, "backup-policy:v1-none")
    }

    @Test
    fun `noPII log contract - phone pin digits and email detected, IDs pass`() {
        assertTrue(SafeDiagnostics.containsPii("09121234567"))
        assertTrue(SafeDiagnostics.containsPii("+989121234567"))
        assertTrue(SafeDiagnostics.containsPii("1234")) // PIN-shaped digit run
        assertTrue(SafeDiagnostics.containsPii("child@example.com"))
        assertFalse(SafeDiagnostics.containsPii("attempt|s1|ST07|1|i1")) // structural ID — safe
        assertFalse(SafeDiagnostics.containsPii("CORRECT"))
    }

    @Test
    fun `diagnostics scan flags sensitive keys and PII values`() {
        val flagged = SafeDiagnostics.scan(mapOf("childName" to "آرش", "session" to "s1", "pin" to "ignored-key-name"))
        assertTrue(flagged.contains("childName"))
        assertTrue(flagged.contains("pin"))
        assertFalse(flagged.contains("session"))
    }
}
