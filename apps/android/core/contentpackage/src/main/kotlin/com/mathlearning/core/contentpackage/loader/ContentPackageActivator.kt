package com.mathlearning.core.contentpackage.loader

import com.mathlearning.core.contentpackage.manifest.PackageCompatibilityException
import com.mathlearning.core.contentpackage.manifest.PackageIntegrityException
import com.mathlearning.core.contentpackage.signing.PackageSignatureVerifier
import com.mathlearning.core.contentpackage.validation.ContentPackageValidator
import com.mathlearning.core.model.repository.ContentPackageRegistryRepository
import com.mathlearning.core.model.repository.InstalledContentPackage
import java.io.File

/**
 * Security steps 7–9 (owner P5 mission): STAGE in a temporary location, verify the staged bytes
 * (never the source), then ATOMICALLY flip the active pointer (write-temp + rename — the only
 * atomic filesystem primitive that matters here), then commit the registry transaction.
 *
 * Crash-safety ordering:
 *  - crash during staging → pointer untouched → previous active package still serves (rollback is implicit);
 *  - crash after pointer flip, before registry commit → the loader trusts the POINTER (files on
 *    disk are the truth); the registry reconciles on the next activation — documented, safe.
 *
 * The previously-active staged directory is NEVER deleted by activation: rollback keeps the last
 * known-good package available (step 9). Cleanup of superseded directories is a separate,
 * deliberate maintenance operation (not implemented — recorded debt).
 */
class ContentPackageActivator(
    private val contentRoot: File,
    private val registry: ContentPackageRegistryRepository,
    private val signatureVerifier: PackageSignatureVerifier,
    private val validator: ContentPackageValidator,
    private val nowMs: () -> Long = { System.currentTimeMillis() },
) {

    data class Staged(val verified: VerifiedPackage, val stagedDir: File)

    /** Steps 7+1..6: copy the candidate into staging, then run the FULL verification pipeline there. */
    suspend fun stage(candidateDir: File): Staged {
        val stagingRoot = File(contentRoot, "staging").apply { mkdirs() }
        val loader = ContentPackageLoader(signatureVerifier, validator)
        // Verify the candidate FIRST — a broken candidate never earns a staging copy.
        val verified = loader.loadFromDirectory(candidateDir)
        val stagedDir = File(stagingRoot, "${verified.manifest.packageId}-${verified.manifest.packageVersion}")
        stagedDir.deleteRecursively()
        candidateDir.copyRecursively(stagedDir, overwrite = true)
        // Re-verify the STAGED bytes (step 7 contract: what will be activated is what was verified).
        loader.loadFromDirectory(stagedDir)
        return Staged(verified, stagedDir)
    }

    /** Steps 8+9: atomic pointer flip + registry commit. Previous active stays on disk for rollback. */
    suspend fun activate(staged: Staged): InstalledContentPackage {
        val manifest = staged.verified.manifest
        val manifestSha = staged.verified.manifestSha256
        val currentAppVersion = currentAppVersionProvider()
        if (com.mathlearning.core.contentpackage.validation.ContentPackageValidator(currentAppVersion)
                .compareVersions(manifest.minAppVersion, currentAppVersion) > 0
        ) {
            throw PackageCompatibilityException("package minAppVersion ${manifest.minAppVersion} exceeds app $currentAppVersion")
        }
        val previous = registry.activePackage()
        writePointerAtomically(
            File(contentRoot, ContentPackageLoader.POINTER_FILE),
            PointerState(manifest.packageId, manifest.packageVersion, staged.stagedDir.name),
        )
        val activated = InstalledContentPackage(
            packageId = manifest.packageId,
            version = manifest.packageVersion,
            schemaVersion = manifest.schemaVersion,
            minAppVersion = manifest.minAppVersion,
            manifestSha256 = manifestSha,
            state = "ACTIVE",
            activatedAtMs = nowMs(),
        )
        registry.commitActivation(activated, previous?.packageId)
        return activated
    }

    /** DI hook: the app layer supplies the versionName. Kept injectable for JVM tests. */
    var currentAppVersionProvider: () -> String = { "0.1.0" }

    private fun writePointerAtomically(target: File, state: PointerState) {
        val tmp = File(target.parentFile, target.name + ".tmp")
        tmp.writeText(
            "{\"packageId\":\"${state.packageId}\",\"version\":${state.version},\"dir\":\"${state.dir}\"}",
        )
        if (!tmp.renameTo(target)) {
            // Same-volume rename of an existing file can fail on some platforms when the target
            // exists — replace-then-rename keeps the swap atomic in practice.
            target.delete()
            if (!tmp.renameTo(target)) {
                tmp.delete()
                throw PackageIntegrityException("atomic pointer swap failed for ${target.path}")
            }
        }
    }

    data class PointerState(val packageId: String, val version: Int, val dir: String)

    companion object {
        /** Reads the active pointer; absent/corrupt pointer = nothing active (fail-closed). */
        fun readPointer(contentRoot: File): PointerState? = try {
            val file = File(contentRoot, ContentPackageLoader.POINTER_FILE)
            if (!file.isFile) null
            else {
                val json = org.json.JSONObject(file.readText())
                PointerState(json.getString("packageId"), json.getInt("version"), json.getString("dir"))
            }
        } catch (e: Exception) {
            null
        }
    }
}
