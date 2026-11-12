package com.mathlearning.core.contentpackage.loader

import com.mathlearning.core.model.repository.ContentPackageRegistryRepository
import java.io.File

/**
 * Security step 9 (owner P5 mission): preserve the last known-good package and restore it on
 * failure. Rollback = atomic pointer restore + registry state correction. The failed package's
 * staging directory stays on disk for diagnostics; registry marks it FAILED (never deleted
 * silently — corruption and failures must be observable, owner mission step 10).
 */
class PackageRollbackManager(
    private val contentRoot: File,
    private val registry: ContentPackageRegistryRepository,
) {

    /**
     * Restores [previous] (the package that was ACTIVE before the failed attempt) as the active
     * pointer and marks [failedPackageId] FAILED in the registry. Safe to call even when the
     * failed attempt never flipped the pointer — the restore is then idempotent.
     */
    suspend fun rollback(previous: ContentPackageActivator.PointerState?, failedPackageId: String?, reason: String) {
        if (previous != null) {
            val tmp = File(contentRoot, ContentPackageLoader.POINTER_FILE + ".tmp")
            tmp.writeText(
                "{\"packageId\":\"${previous.packageId}\",\"version\":${previous.version},\"dir\":\"${previous.dir}\"}",
            )
            val target = File(contentRoot, ContentPackageLoader.POINTER_FILE)
            if (!tmp.renameTo(target)) {
                target.delete()
                check(tmp.renameTo(target)) { "rollback pointer restore failed" }
            }
        } else {
            // Nothing was active before: the honest state is NO active package.
            File(contentRoot, ContentPackageLoader.POINTER_FILE).delete()
        }
        if (failedPackageId != null) {
            registry.setState(failedPackageId, "FAILED")
        }
        // `reason` is caller-logged (identifier-only, per the logging contract) — never persisted
        // into child-facing surfaces.
    }
}
