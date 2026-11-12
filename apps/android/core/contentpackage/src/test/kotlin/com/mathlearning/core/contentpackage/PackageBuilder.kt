package com.mathlearning.core.contentpackage

import java.io.File
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.Signature
import java.util.Base64
import org.json.JSONArray
import org.json.JSONObject

/**
 * Test fixture: builds real signed packages on disk with EPHEMERAL keys generated in-test.
 * No private key is ever committed to the repository (owner P5-mission rule) — every test
 * generates a fresh keypair.
 */
class PackageBuilder(val keyPair: KeyPair = generateKeyPair(), val keyId: String = "test-key-1") {


    data class Built(val dir: File, val manifestBytes: ByteArray, val manifestSha256: String)

    /**
     * Writes files/, manifest.json and the detached manifest.sig into [dir]. `extraManifestJson`
     * (nullable) lets tests hand-craft hostile manifests for the parser/verifier matrix.
     */
    fun build(
        dir: File,
        packageId: String = "shomara-core",
        version: Int = 1,
        schemaVersion: Int = 1,
        stations: List<String> = listOf("ST07"),
        files: Map<String, String> = mapOf("stations/ST07.json" to "{\"stationId\":\"ST07\"}"),
        minAppVersion: String = "0.1.0",
        extraManifestJson: JSONObject? = null,
        includeSignature: Boolean = true,
        signWith: KeyPair = keyPair,
        signingKeyId: String = keyId,
        manifestBytesOverride: ByteArray? = null,
    ): Built {
        dir.mkdirs()
        files.forEach { (path, content) ->
            val out = File(dir, path)
            out.parentFile.mkdirs()
            out.writeText(content)
        }

        val manifestBytes = manifestBytesOverride ?: run {
            val root = JSONObject()
            root.put("packageId", packageId)
            root.put("packageVersion", version)
            root.put("schemaVersion", schemaVersion)
            root.put("minAppVersion", minAppVersion)
            root.put("stations", JSONArray(stations))
            val filesArray = JSONArray()
            files.forEach { (path, content) ->
                val bytes = content.toByteArray(Charsets.UTF_8)
                filesArray.put(
                    JSONObject()
                        .put("path", path)
                        .put("sizeBytes", bytes.size.toLong())
                        .put("sha256", sha256Hex(bytes)),
                )
            }
            root.put("files", filesArray)
            root.put(
                "signing",
                JSONObject().put("keyId", signingKeyId).put("algorithm", "SHA256withECDSA"),
            )
            extraManifestJson?.let { merged ->
                val keys = merged.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    root.put(k, merged.get(k))
                }
            }
            root.toString().toByteArray(Charsets.UTF_8)
        }
        File(dir, "manifest.json").writeBytes(manifestBytes)

        if (includeSignature) {
            val signature = Signature.getInstance("SHA256withECDSA")
            signature.initSign(signWith.private)
            signature.update(manifestBytes)
            val encoded = Base64.getEncoder().encodeToString(signature.sign())
            File(dir, "manifest.sig").writeText(
                JSONObject()
                    .put("keyId", signingKeyId)
                    .put("algorithm", "SHA256withECDSA")
                    .put("signature", encoded)
                    .toString(),
            )
        }
        val manifestSha = sha256Hex(manifestBytes)
        return Built(dir, manifestBytes, manifestSha)
    }

    companion object {
        fun generateKeyPair(): KeyPair = KeyPairGenerator.getInstance("EC").apply { initialize(256) }.generateKeyPair()

        fun sha256Hex(bytes: ByteArray): String =
            java.security.MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

        fun tempDir(prefix: String): File =
            java.nio.file.Files.createTempDirectory(prefix).toFile()
    }
}
