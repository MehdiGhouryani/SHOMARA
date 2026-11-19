// Merged by DT-54: privacy, diagnostics and backup policy.
// These declarations shared a folder and a theme but were split across files; Kotlin resolves imports
// by package, so keeping them together changes nothing at the call site.

package com.mathlearning.core.profile

import java.io.File

// ---- from BackupPolicyController.kt ----
/**
 * BackupPolicyController (P10, ADR-0047) — the backup/restore policy statement.
 *
 * Current policy (matches the shipped AndroidManifest): allowBackup=false +
 * fullBackupContent=false + API-31+ dataExtractionRules excluding cloud backup AND device
 * transfer for every child-data path. NO child data may reach cloud or transfer backups until a
 * separate Recovery product decision (owner) changes this policy — and that decision must ship
 * its own threat model + encryption design first.
 *
 * The controller exposes the policy as data so tests + the manifest verifier assert the shipped
 * configuration against THIS declaration (single source of truth).
 */
object BackupPolicyController {
    const val POLICY_VERSION: String = "backup-policy:v1-none"

    /** Every known child-data path is backup-EXEMPT under v1. */
    val EXEMPT_PATHS: Set<String> = setOf(
        "datastore/", "databases/", "files/", "shared_prefs/", "cache/",
    )

    data class Policy(val allowBackup: Boolean, val fullBackupContent: Boolean, val cloudBackup: Boolean, val deviceTransfer: Boolean, val exemptPaths: Set<String>)

    fun current(): Policy = Policy(allowBackup = false, fullBackupContent = false, cloudBackup = false, deviceTransfer = false, exemptPaths = EXEMPT_PATHS)
}

// ---- from PrivacyDataController.kt ----
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
                    val deleted = dir.deleteRecursively()
                    if (!deleted && dir.exists()) {
                        throw IllegalStateException("directory deletion was incomplete")
                    }
                    cleared += "${dir.path}=$removed"
                }
            }.onFailure { failures += "${dir.path}: ${it.message}" }
        }
        return WipeResult(cleared, failures)
    }
}

// ---- from SafeDiagnostics.kt ----
/**
 * SafeDiagnostics (P10, ADR-0047) — the crash/log metadata contract.
 *
 * Log and crash metadata must never contain: child name, phone number, PIN (any digit run of
 * PIN length), tokens, answers, or any attribute VALUE beyond whitelisted enum-like strings.
 * The core logger (SafeAppLogger) already rejects sensitive KEYS; this adds the VALUE-side scan
 * for diagnostics payloads and a general PII linter used by tests.
 */
object SafeDiagnostics {

    private val PHONE = Regex("""(?:\+98|0098|0)?9\d{9}""") // Iranian mobile formats
    private val PIN_LIKE = Regex("""^\d{4,8}$""")
    private val EMAIL = Regex("""[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}""")

    fun containsPii(value: String): Boolean {
        if (PHONE.containsMatchIn(value.replace(" ", ""))) return true
        if (EMAIL.containsMatchIn(value)) return true
        if (PIN_LIKE.matches(value.trim())) return true
        return false
    }

    /** Scans a diagnostics payload (key → value); returns offending keys (empty = safe). */
    fun scan(payload: Map<String, String>): List<String> =
        payload.filter { (key, value) ->
            SafeDiagnostics.containsPii(value) || listOf("name", "phone", "pin", "token", "answer").any { key.lowercase().contains(it) }
        }.keys.toList()
}
