package com.mathlearning.sync

import com.mathlearning.core.database.LocalLearningDatabase
import java.security.MessageDigest

/**
 * N07-03 — versioned content manifest with ATOMIC package activation.
 *
 * Activation contract: a new package version is staged, verified against its SHA-256 checksum
 * AND supported schema version, and only then activated — replacing the previously active
 * version in a single swap. Any verification failure aborts and the previously active valid
 * version remains untouched (automatic rollback).
 */
object ContentManifestVerifier {
    fun sha256Hex(bytes: ByteArray): String =
        MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
}

data class VersionedContentManifest(
    val schemaVersion: Int,
    val packageVersion: Int,
    val stationId: String,
    val contentSha256: String,
    val audioAssetRefs: List<String>,
    val provenance: String,
) {
    init {
        require(schemaVersion > 0) { "schema version must be positive" }
        require(packageVersion > 0) { "package version must be positive" }
        require(stationId.matches(Regex("ST\\d{2}"))) { "station id must be the fixed STxx form" }
        require(contentSha256.length == 64) { "content sha256 must be a 64-char hex digest" }
    }

    companion object {
        const val SUPPORTED_SCHEMA_VERSION: Int = 1
    }
}

sealed class ManifestActivation {
    data class Activated(val manifest: VersionedContentManifest) : ManifestActivation()
    data class RolledBack(val reason: String, val previousVersion: Int?) : ManifestActivation()
}

class ManifestActivationEngine(private val db: LocalLearningDatabase) {

    fun activeVersion(stationId: String): Int? =
        db.activeStationPackage(stationId)?.version

    /**
     * Atomic activate-or-rollback. The staged bytes are checksum-verified and schema-checked
     * BEFORE any local state changes; on failure nothing is written.
     */
    fun activate(
        manifest: VersionedContentManifest,
        stagedBytes: ByteArray,
        payload: Map<String, String>,
    ): ManifestActivation {
        // 1. Checksum verification.
        val actual = ContentManifestVerifier.sha256Hex(stagedBytes)
        if (actual != manifest.contentSha256) {
            return ManifestActivation.RolledBack(
                reason = "SHA-256 mismatch: expected ${manifest.contentSha256.take(12)}…, got ${actual.take(12)}…",
                previousVersion = activeVersion(manifest.stationId),
            )
        }
        // 2. Schema version gate.
        if (manifest.schemaVersion != VersionedContentManifest.SUPPORTED_SCHEMA_VERSION) {
            return ManifestActivation.RolledBack(
                reason = "unsupported schemaVersion ${manifest.schemaVersion}",
                previousVersion = activeVersion(manifest.stationId),
            )
        }
        // 3. Payload contamination gate (CONTENT-008) — rejected before persistence.
        return try {
            val previous = activeVersion(manifest.stationId)
            db.upsertStationPackage(
                com.mathlearning.core.database.LocalStationPackageEntity(
                    stationId = manifest.stationId,
                    version = manifest.packageVersion,
                    sha256 = manifest.contentSha256,
                    isActive = true,
                    payload = payload, // provenance stays on the manifest; payload passes the CONTENT-008 guard
                ),
            )
            ManifestActivation.Activated(manifest)
        } catch (e: Exception) {
            ManifestActivation.RolledBack(reason = e.message ?: "activation rejected", previousVersion = activeVersion(manifest.stationId))
        }
    }
}
