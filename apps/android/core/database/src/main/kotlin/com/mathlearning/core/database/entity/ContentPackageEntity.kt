package com.mathlearning.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Content-package registry (P5 engine, schema fields PROPOSED pending O2 final approval —
 * engine plumbing, not content format). One row per installed package identity; `state`
 * follows the activation lifecycle: ACTIVE | ROLLED_BACK | FAILED.
 */
@Entity(tableName = "content_packages", indices = [Index(value = ["state"])])
data class ContentPackageEntity(
    @PrimaryKey val packageId: String,
    val version: Int,
    val schemaVersion: Int,
    val minAppVersion: String,
    val manifestSha256: String,
    val state: String,
    val activatedAtMs: Long,
)
