package com.mathlearning.core.contentpackage.validation

import com.mathlearning.core.contentpackage.manifest.PackageCompatibilityException
import com.mathlearning.core.contentpackage.manifest.PackageManifest

/**
 * Security step 6 (owner P5 mission): compatibility + reference validation of an ALREADY
 * signature-verified and integrity-verified manifest.
 *
 * Lifecycle note (owner P5 mission): the engine refuses anything that is not an APPROVED/
 * PUBLISHED package — today that gate is structural (no package ships at all until the owner's
 * content pipeline produces one), and the manifest's lifecycle evidence field arrives with the
 * O2-final schema. Release builds must contain only approved packages; debug fixtures live in
 * the debug variant ONLY (compile-time separation), never in release assets.
 */
class ContentPackageValidator(
    /** Current app versionName for the minAppVersion compatibility gate. */
    private val currentAppVersion: String,
) {

    fun validate(manifest: PackageManifest) {
        if (manifest.schemaVersion != PackageManifest.SUPPORTED_SCHEMA_VERSION) {
            throw PackageCompatibilityException(
                "unsupported package schemaVersion ${manifest.schemaVersion} (supported: ${PackageManifest.SUPPORTED_SCHEMA_VERSION})",
            )
        }
        if (compareVersions(manifest.minAppVersion, currentAppVersion) > 0) {
            throw PackageCompatibilityException(
                "package requires minAppVersion ${manifest.minAppVersion} but this app is $currentAppVersion",
            )
        }
        if (manifest.stations.isEmpty()) {
            throw PackageCompatibilityException("package declares no stations")
        }
        val stationRoots = manifest.files.map { it.path.substringBefore('/') }.toSet()
        if ("stations" !in stationRoots) {
            throw PackageCompatibilityException("package declares stations but no stations/ files")
        }
    }

    /** Strict numeric-dot comparison; a package demanding a NEWER app than installed is rejected. */
    fun compareVersions(required: String, current: String): Int {
        val requiredParts = required.split('.').map { it.toIntOrNull() ?: throw PackageCompatibilityException("invalid minAppVersion '$required'") }
        val currentParts = current.split('.').map { it.toIntOrNull() ?: throw PackageCompatibilityException("invalid app version '$current'") }
        for (i in 0 until maxOf(requiredParts.size, currentParts.size)) {
            val r = requiredParts.getOrElse(i) { 0 }
            val c = currentParts.getOrElse(i) { 0 }
            if (r != c) return r - c
        }
        return 0
    }
}
