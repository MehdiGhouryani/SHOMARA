package com.mathlearning.core.contentpackage.manifest

/**
 * PROPOSED content-package manifest schema v1 (field names and limits are DRAFT pending owner
 * decisions O2 — final format — and O7 — size budget). The ENGINE built around this model is
 * format-agnostic plumbing: signature verification, integrity, staging, atomic activation and
 * rollback do not depend on the exact field names. NO field here is final until O2 lands; NO
 * fabricated content format is finalized while O1/O2 remain open (owner P5-mission constraint).
 *
 * Trust chain (detached signature — NOT a hash-of-itself):
 *   manifest.sig (ECDSA P-256/SHA-256 by a trusted keyId) covers the EXACT bytes of manifest.json
 *   → manifest lists every file (path, sizeBytes, sha256) → each file is verified byte-by-byte.
 * SHA-256 provides integrity; ONLY the signature provides authenticity — the two are never
 * conflated (owner P5-mission rule).
 */
data class PackageManifest(
    val packageId: String,
    val packageVersion: Int,
    val schemaVersion: Int,
    val minAppVersion: String,
    val stations: List<String>,
    val files: List<PackageFileEntry>,
    val signingKeyId: String,
    val signingAlgorithm: String,
) {
    val totalBytes: Long get() = files.sumOf { it.sizeBytes }

    companion object {
        const val SUPPORTED_SCHEMA_VERSION: Int = 1
        const val SUPPORTED_ALGORITHM: String = "SHA256withECDSA"

        // PROPOSED limits pending O7 — the activator refuses packages beyond them. The numbers are
        // engineering guards against pathological inputs, NOT the approved product size budget.
        const val MAX_MANIFEST_BYTES: Int = 256 * 1024
        const val MAX_FILES: Int = 10_000
        const val MAX_TOTAL_BYTES: Long = 64L * 1024 * 1024
        const val MAX_SINGLE_FILE_BYTES: Long = 8L * 1024 * 1024
        val ALLOWED_ROOTS: Set<String> = setOf("stations", "audio", "images")
    }
}

data class PackageFileEntry(val path: String, val sizeBytes: Long, val sha256: String)

/** Detached signature file payload: which trusted key signed the manifest bytes. */
data class ManifestSignatureEnvelope(val keyId: String, val algorithm: String, val base64Signature: String)

class ManifestFormatException(detail: String) : Exception(detail)
class SignatureVerificationException(detail: String) : Exception(detail)
class PackageIntegrityException(detail: String) : Exception(detail)
class PackageCompatibilityException(detail: String) : Exception(detail)

object PackagePaths {
    /** Safe relative path inside a package: known root, no traversal, no absolute/edge segments. */
    fun isSafe(path: String): Boolean {
        if (path.isBlank()) return false
        if (path.startsWith("/") || path.endsWith("/")) return false
        if (path.contains('\\')) return false
        val segments = path.split('/')
        if (segments.any { it.isEmpty() || it == "." || it == ".." }) return false
        if (segments.size < 2) return false // must live under a root directory
        return segments.first() in PackageManifest.ALLOWED_ROOTS
    }
}

object PackageManifestParser {

    /**
     * Security steps 1+2 (owner P5 mission): bounded parse — manifest size capped BEFORE parsing,
     * strict expected structure (no unbounded nesting), file count/size/total caps, path-traversal
     * and duplicate-path rejection, algorithm/field validation. Any deviation is a loud
     * [ManifestFormatException] — never a best-effort partial parse.
     */
    fun parse(manifestBytes: ByteArray): PackageManifest {
        if (manifestBytes.size > PackageManifest.MAX_MANIFEST_BYTES) {
            throw ManifestFormatException("manifest exceeds ${PackageManifest.MAX_MANIFEST_BYTES} bytes")
        }
        val text = manifestBytes.decodeToString()
        val root = try {
            org.json.JSONObject(text)
        } catch (e: org.json.JSONException) {
            throw ManifestFormatException("manifest is not valid JSON: ${e.message}")
        }

        val packageId = root.optStringOrNull("packageId") ?: throw ManifestFormatException("missing packageId")
        requireIdShape(packageId, "packageId")
        val packageVersion = root.optIntOrThrow("packageVersion")
        val schemaVersion = root.optIntOrThrow("schemaVersion")
        val minAppVersion = root.optStringOrNull("minAppVersion") ?: throw ManifestFormatException("missing minAppVersion")
        val signingKeyId = root.optStringOrNull("signing")?.let { org.json.JSONObject(it).optStringOrNull("keyId") }
            ?: throw ManifestFormatException("missing signing.keyId")
        val signingAlgorithm = root.optStringOrNull("signing")?.let { org.json.JSONObject(it).optStringOrNull("algorithm") }
            ?: throw ManifestFormatException("missing signing.algorithm")
        if (signingAlgorithm != PackageManifest.SUPPORTED_ALGORITHM) {
            throw ManifestFormatException("unsupported signing algorithm: $signingAlgorithm")
        }

        val stations = root.optJSONArray("stations") ?: throw ManifestFormatException("missing stations")
        val stationIds = buildList {
            for (i in 0 until stations.length()) add(stations.getString(i))
        }
        stationIds.forEach { requireStationIdShape(it) }

        val filesArray = root.optJSONArray("files") ?: throw ManifestFormatException("missing files")
        if (filesArray.length() > PackageManifest.MAX_FILES) {
            throw ManifestFormatException("manifest declares ${filesArray.length()} files (max ${PackageManifest.MAX_FILES})")
        }
        val seen = HashSet<String>()
        var total = 0L
        val files = buildList {
            for (i in 0 until filesArray.length()) {
                val entry = filesArray.getJSONObject(i)
                val path = entry.optStringOrNull("path") ?: throw ManifestFormatException("file entry $i missing path")
                if (!PackagePaths.isSafe(path)) throw ManifestFormatException("unsafe package path: $path")
                if (!seen.add(path)) throw ManifestFormatException("duplicate package path: $path")
                val size = entry.optLong("sizeBytes", -1L)
                if (size < 0) throw ManifestFormatException("file $path missing sizeBytes")
                if (size > PackageManifest.MAX_SINGLE_FILE_BYTES) {
                    throw ManifestFormatException("file $path exceeds single-file cap")
                }
                total += size
                if (total > PackageManifest.MAX_TOTAL_BYTES) {
                    throw ManifestFormatException("package exceeds total size cap")
                }
                val sha = entry.optStringOrNull("sha256") ?: throw ManifestFormatException("file $path missing sha256")
                if (!sha.matches(Regex("^[0-9a-f]{64}$"))) throw ManifestFormatException("file $path sha256 must be 64 lowercase hex chars")
                add(PackageFileEntry(path, size, sha))
            }
        }
        if (total > PackageManifest.MAX_TOTAL_BYTES) throw ManifestFormatException("package exceeds total size cap")

        return PackageManifest(
            packageId = packageId,
            packageVersion = packageVersion,
            schemaVersion = schemaVersion,
            minAppVersion = minAppVersion,
            stations = stationIds,
            files = files,
            signingKeyId = signingKeyId,
            signingAlgorithm = signingAlgorithm,
        )
    }

    fun parseSignature(bytes: ByteArray): ManifestSignatureEnvelope {
        if (bytes.size > 64 * 1024) throw ManifestFormatException("signature file exceeds cap")
        val root = try {
            org.json.JSONObject(bytes.decodeToString())
        } catch (e: org.json.JSONException) {
            throw ManifestFormatException("signature file is not valid JSON: ${e.message}")
        }
        val keyId = root.optStringOrNull("keyId") ?: throw ManifestFormatException("signature missing keyId")
        val algorithm = root.optStringOrNull("algorithm") ?: throw ManifestFormatException("signature missing algorithm")
        val signature = root.optStringOrNull("signature") ?: throw ManifestFormatException("signature missing signature")
        if (algorithm != PackageManifest.SUPPORTED_ALGORITHM) {
            throw ManifestFormatException("unsupported signature algorithm: $algorithm")
        }
        return ManifestSignatureEnvelope(keyId, algorithm, signature)
    }

    private fun requireIdShape(id: String, what: String) {
        if (!id.matches(Regex("^[a-z0-9][a-z0-9.-]{1,63}$"))) {
            throw ManifestFormatException("$what has an unsafe id shape: $id")
        }
    }

    /** Station ids are the fixed STxx form (the house contract since the content pipeline). */
    private fun requireStationIdShape(id: String) {
        if (!id.matches(Regex("^ST[0-9]{2}$"))) {
            throw ManifestFormatException("station id must be the STxx form: $id")
        }
    }

    private fun org.json.JSONObject.optStringOrNull(key: String): String? {
        if (!has(key)) return null
        val value = optString(key, "\u0000unreachable")
        return if (value == "\u0000unreachable") null else value
    }

    private fun org.json.JSONObject.optIntOrThrow(key: String): Int {
        if (!has(key)) throw ManifestFormatException("missing $key")
        val value = optInt(key, Int.MIN_VALUE)
        if (value == Int.MIN_VALUE) throw ManifestFormatException("$key must be a positive int")
        if (value <= 0) throw ManifestFormatException("$key must be positive")
        return value
    }
}
