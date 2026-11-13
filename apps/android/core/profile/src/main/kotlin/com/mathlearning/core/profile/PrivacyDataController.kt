package com.mathlearning.core.profile

import java.io.File

/**
 * PrivacyDataController (P10, ADR-0047) — the controlled deletion of EVERYTHING tied to one
 * child profile, in ONE orchestrated pass:
 *   profile draft + parent PIN + preferences/checkpoints + Room learning rows (sessions,
 *   attempts, progress, outbox) + media/cache files + staged package dirs.
 *
 * The wipe is FAIL-SAFE: every store wipe runs even if a previous one failed, and failures are
 * collected — the caller surfaces them. No partial "logout" semantics: deletion means deletion
 * (ADR-0039 §5: data lives only on the device; erasure is real).
 *
 * Backup policy (BackupPolicyController): allowBackup=false + fullBackupContent=false +
 * API-31+ dataExtractionRules exclude EVERYTHING — no child data in cloud/device-transfer
 * backups until a separate Recovery product decision (owner) changes the policy document.
 */
class PrivacyDataController(
    private val stores: List<PrivacyStore>,
    private val dirs: List<File>,
) {
    interface PrivacyStore {
        val label: String
        /** Wipes ALL child data in this store; returns the number of records cleared. */
        suspend fun wipeAll(): Int
    }

    data class WipeResult(val cleared: List<String>, val failures: List<String>)

    suspend fun deleteAllChildData(): WipeResult {
        val cleared = mutableListOf<String>()
        val failures = mutableListOf<String>()
        for (store in stores) {
            runCatching { val n = store.wipeAll(); cleared += "${store.label}=$n" }
                .onFailure { failures += "${store.label}: ${it.message}" }
        }
        for (dir in dirs) {
            runCatching {
                if (dir.exists()) {
                    val removed = dir.walkTopDown().filter { it.isFile }.count()
                    dir.deleteRecursively()
                    cleared += "${dir.path}=$removed"
                }
            }.onFailure { failures += "${dir.path}: ${it.message}" }
        }
        return WipeResult(cleared, failures)
    }
}
