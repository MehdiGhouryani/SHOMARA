package com.mathlearning.core.contentpackage.security

import com.mathlearning.core.contentpackage.PackageBuilder
import com.mathlearning.core.contentpackage.loader.ContentPackageLoader
import com.mathlearning.core.contentpackage.manifest.ManifestFormatException
import com.mathlearning.core.contentpackage.manifest.PackageCompatibilityException
import com.mathlearning.core.contentpackage.manifest.PackageManifestParser
import com.mathlearning.core.contentpackage.manifest.SignatureVerificationException
import com.mathlearning.core.contentpackage.signing.PackageSignatureVerifier
import com.mathlearning.core.contentpackage.signing.TrustedPackageKeys
import com.mathlearning.core.contentpackage.validation.ContentPackageValidator
import java.io.File
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * The P5 security matrix (owner mission) at the manifest/signature/integrity/compatibility
 * layer — pure JVM, real ECDSA keys generated per test, real bytes on disk.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class PackageEngineSecurityTest {

    private val builder = PackageBuilder()
    private val trusted = TrustedPackageKeys(mapOf(builder.keyId to builder.keyPair.public))
    private val verifier = PackageSignatureVerifier(trusted)
    private val validator = ContentPackageValidator(currentAppVersion = "0.1.0")
    private val loader = ContentPackageLoader(verifier, validator)

    @Test
    fun `valid package loads end to end - signature, integrity and compatibility all pass`() {
        val dir = PackageBuilder.tempDir("valid")
        val built = builder.build(dir)
        val loaded = loader.loadFromDirectory(built.dir)
        assertEquals(1, loaded.manifest.packageVersion)
        assertEquals(built.manifestSha256, loaded.manifestSha256)
    }

    @Test
    fun `signature by a wrong key is rejected - only the pinned trusted key authorizes manifests`() {
        val otherKeyPair = PackageBuilder.generateKeyPair()
        val dir = PackageBuilder.tempDir("wrong-key")
        builder.build(dir, signWith = otherKeyPair, signingKeyId = builder.keyId)
        assertThrows(SignatureVerificationException::class.java) { loader.loadFromDirectory(dir) }
    }

    @Test
    fun `an unknown keyId is rejected even if the signature is valid`() {
        val otherKeyPair = PackageBuilder.generateKeyPair()
        val dir = PackageBuilder.tempDir("unknown-key")
        builder.build(dir, signWith = otherKeyPair, signingKeyId = "rogue-key")
        assertThrows(SignatureVerificationException::class.java) { loader.loadFromDirectory(dir) }
    }

    @Test
    fun `tampered manifest bytes fail the signature check`() {
        val dir = PackageBuilder.tempDir("tampered")
        val built = builder.build(dir)
        // Tamper INSIDE the signed bytes while keeping the manifest valid JSON (trailing
        // whitespace): the signature covers the exact bytes, so verification must fail.
        val bytes = File(dir, "manifest.json").readBytes() + " ".toByteArray()
        File(dir, "manifest.json").writeBytes(bytes)
        assertThrows(SignatureVerificationException::class.java) { loader.loadFromDirectory(dir) }
        assertEquals(built.manifestSha256, PackageBuilder.sha256Hex(built.manifestBytes))
    }

    @Test
    fun `a missing declared file fails integrity`() {
        val dir = PackageBuilder.tempDir("missing-file")
        builder.build(dir, files = mapOf("stations/ST07.json" to "x", "audio/a.opus" to "audiodata"))
        File(dir, "audio/a.opus").delete()
        val thrown = assertThrows(
            com.mathlearning.core.contentpackage.manifest.PackageIntegrityException::class.java,
        ) { loader.loadFromDirectory(dir) }
        assertTrue(thrown.message!!.contains("missing declared file"))
    }

    @Test
    fun `tampered file bytes fail integrity against the verified manifest`() {
        val dir = PackageBuilder.tempDir("tampered-file")
        builder.build(dir)
        File(dir, "stations/ST07.json").writeText("{\"stationId\":\"ST07\",\"injected\":true}")
        assertThrows(com.mathlearning.core.contentpackage.manifest.PackageIntegrityException::class.java) {
            loader.loadFromDirectory(dir)
        }
    }

    @Test
    fun `path traversal is rejected at parse time`() {
        val hostile = JSONObject()
        for (path in listOf("../escape/ST07.json", "stations/../../etc/passwd", "/absolute/stations/ST07.json", "stations/a\\b.json", "stations//x.json")) {
            assertThrows(ManifestFormatException::class.java) {
                PackageManifestParser.parse(manifestBytesWithFile(path))
            }
        }
        assertThrows(ManifestFormatException::class.java) {
            PackageManifestParser.parse(manifestBytesWithFile("../escape/ST07.json"))
        }
    }

    @Test
    fun `duplicate paths are rejected at parse time`() {
        val raw = JSONObject(
            """
            {"packageId":"shomara-core","packageVersion":1,"schemaVersion":1,"minAppVersion":"0.1.0",
             "stations":["ST07"],
             "files":[
               {"path":"stations/ST07.json","sizeBytes":1,"sha256":"${"a".repeat(64)}"},
               {"path":"stations/ST07.json","sizeBytes":2,"sha256":"${"b".repeat(64)}"}],
             "signing":{"keyId":"k","algorithm":"SHA256withECDSA"}}
            """.trimIndent(),
        )
        assertThrows(ManifestFormatException::class.java) { PackageManifestParser.parse(raw.toString().toByteArray()) }
    }

    @Test
    fun `oversize single file and oversize manifest are rejected - size caps precede any parse`() {
        val oversizeManifest = ByteArray(256 * 1024 + 1) { ' '.code.toByte() }
        assertThrows(ManifestFormatException::class.java) { PackageManifestParser.parse(oversizeManifest) }

        val hostile = JSONObject(
            """
            {"packageId":"shomara-core","packageVersion":1,"schemaVersion":1,"minAppVersion":"0.1.0",
             "stations":["ST07"],
             "files":[
               {"path":"stations/ST07.json","sizeBytes":${8L * 1024 * 1024 + 1},"sha256":"${"a".repeat(64)}"}],
             "signing":{"keyId":"k","algorithm":"SHA256withECDSA"}}
            """.trimIndent(),
        )
        assertThrows(ManifestFormatException::class.java) { PackageManifestParser.parse(hostile.toString().toByteArray()) }
    }

    @Test
    fun `unsupported schema version and newer minAppVersion are rejected at validation`() {
        val dir = PackageBuilder.tempDir("schema")
        builder.build(dir, schemaVersion = 2)
        assertThrows(PackageCompatibilityException::class.java) { loader.loadFromDirectory(dir) }

        val newer = PackageBuilder.tempDir("minapp")
        builder.build(newer, minAppVersion = "99.0.0")
        assertThrows(PackageCompatibilityException::class.java) { loader.loadFromDirectory(newer) }
    }

    @Test
    fun `the production trust slot is empty and rejects everything - fail-closed until the owner pins a key`() {
        val production = TrustedPackageKeys.production()
        assertEquals(0, production.trustedKeyIds().size)
        val dir = PackageBuilder.tempDir("prod")
        builder.build(dir)
        val prodVerifier = PackageSignatureVerifier(production)
        val prodLoader = ContentPackageLoader(prodVerifier, validator)
        assertThrows(SignatureVerificationException::class.java) { prodLoader.loadFromDirectory(dir) }
    }

    @Test
    fun `the package path is network-free by construction - airplane mode is the normal state`() {
        // Structural assertion on the engine sources: no network types may appear in the
        // contentpackage module (the loader reads only local files/assets).
        val moduleRoot = File(System.getProperty("user.dir")).resolve("src/main/kotlin")
        val offenders = moduleRoot.walkTopDown()
            .filter { it.isFile && it.extension == "kt" }
            .filter { it.readText().contains(Regex("import (java\\.net|okhttp3|javax\\.net|retrofit2)")) }
            .toList()
        assertTrue("network imports found in contentpackage: $offenders", offenders.isEmpty())
    }


    private fun manifestBytesWithFile(path: String): ByteArray {
        val raw = JSONObject()
            .put("packageId", "shomara-core")
            .put("packageVersion", 1)
            .put("schemaVersion", 1)
            .put("minAppVersion", "0.1.0")
            .put("stations", org.json.JSONArray(listOf("ST07")))
            .put(
                "files",
                org.json.JSONArray().put(
                    JSONObject().put("path", path).put("sizeBytes", 1).put("sha256", "a".repeat(64)),
                ),
            )
            .put("signing", JSONObject().put("keyId", "k").put("algorithm", "SHA256withECDSA"))
        return raw.toString().toByteArray()
    }
}
