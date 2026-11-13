package com.mathlearning.core.profile

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
