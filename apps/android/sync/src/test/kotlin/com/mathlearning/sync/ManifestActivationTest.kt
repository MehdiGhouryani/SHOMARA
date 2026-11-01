package com.mathlearning.sync

import com.mathlearning.core.database.LocalLearningDatabase
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N07-03 atomic SHA-256 manifest activation + rollback tests. */
class ManifestActivationTest {

    private fun manifest(version: Int, sha: String, schemaVersion: Int = VersionedContentManifest.SUPPORTED_SCHEMA_VERSION) =
        VersionedContentManifest(
            schemaVersion = schemaVersion,
            packageVersion = version,
            stationId = "ST07",
            contentSha256 = sha,
            audioAssetRefs = listOf("ST07.P1.s01.a"),
            provenance = "content-delivery/signed",
        )

    @Test
    fun `manifest invariants are enforced at construction`() {
        assertThrows(IllegalArgumentException::class.java) {
            manifest(1, sha = "short-digest")
        }
        assertThrows(IllegalArgumentException::class.java) {
            manifest(1, sha = "a".repeat(64), schemaVersion = 0)
        }
        assertThrows(IllegalArgumentException::class.java) {
            manifest(0, sha = "a".repeat(64))
        }
        assertThrows(IllegalArgumentException::class.java) {
            VersionedContentManifest(schemaVersion = 1, packageVersion = 1, stationId = "ST7", contentSha256 = "a".repeat(64), audioAssetRefs = emptyList(), provenance = "p")
        }
    }

    @Test
    fun `valid activation swaps the active version atomically`() {
        val db = LocalLearningDatabase()
        val engine = ManifestActivationEngine(db)
        val bytesV1 = "package-v1-bytes".toByteArray()
        val m1 = manifest(1, ContentManifestVerifier.sha256Hex(bytesV1))
        assertTrue(engine.activate(m1, bytesV1, mapOf("prompt" to "v1")) is ManifestActivation.Activated)
        assertEquals(1, engine.activeVersion("ST07"))
        val bytesV2 = "package-v2-bytes".toByteArray()
        val m2 = manifest(2, ContentManifestVerifier.sha256Hex(bytesV2))
        assertTrue(engine.activate(m2, bytesV2, mapOf("prompt" to "v2")) is ManifestActivation.Activated)
        assertEquals(2, engine.activeVersion("ST07"))
        assertEquals("v2", db.activeStationPackage("ST07")?.payload?.get("prompt"))
    }

    @Test
    fun `sha256 mismatch aborts and the previous active version stays untouched`() {
        val db = LocalLearningDatabase()
        val engine = ManifestActivationEngine(db)
        val bytesV1 = "good-v1".toByteArray()
        engine.activate(manifest(1, ContentManifestVerifier.sha256Hex(bytesV1)), bytesV1, mapOf("prompt" to "v1-good"))
        // Corrupt staged bytes with a manifest claiming a different digest.
        val corruptBytes = "tampered".toByteArray()
        val result = engine.activate(manifest(2, ContentManifestVerifier.sha256Hex("intended".toByteArray())), corruptBytes, mapOf("prompt" to "v2-bad"))
        assertTrue(result is ManifestActivation.RolledBack)
        assertTrue((result as ManifestActivation.RolledBack).reason.contains("SHA-256 mismatch"))
        assertEquals(1, engine.activeVersion("ST07"))
        assertEquals("v1-good", db.activeStationPackage("ST07")?.payload?.get("prompt"))
    }

    @Test
    fun `unsupported schema version aborts with rollback`() {
        val db = LocalLearningDatabase()
        val engine = ManifestActivationEngine(db)
        val bytes = "future".toByteArray()
        val result = engine.activate(manifest(1, ContentManifestVerifier.sha256Hex(bytes), schemaVersion = 99), bytes, emptyMap())
        assertTrue(result is ManifestActivation.RolledBack)
        assertTrue((result as ManifestActivation.RolledBack).reason.contains("schemaVersion"))
        assertNull(engine.activeVersion("ST07"))
    }

    @Test
    fun `contaminated payload is rejected before activation (CONTENT-008)`() {
        val db = LocalLearningDatabase()
        val engine = ManifestActivationEngine(db)
        val bytes = "x".toByteArray()
        val result = engine.activate(manifest(1, ContentManifestVerifier.sha256Hex(bytes)), bytes, mapOf("evaluatorConfig" to "{}"))
        assertTrue(result is ManifestActivation.RolledBack)
        assertNull(db.activeStationPackage("ST07"))
    }

    @Test
    fun `first activation rollback has null previous version`() {
        val engine = ManifestActivationEngine(LocalLearningDatabase())
        val result = engine.activate(manifest(1, "b".repeat(64)), "bytes".toByteArray(), emptyMap())
        assertTrue(result is ManifestActivation.RolledBack)
        assertNull((result as ManifestActivation.RolledBack).previousVersion)
        assertNotNull(result.reason)
    }
}
