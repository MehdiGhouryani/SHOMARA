package com.mathlearning.core.common.error

import java.security.MessageDigest

/** Canonical SHA-256 helper for content integrity gates (manifest activation, audio cache). */
object ContentChecksums {
    fun sha256Hex(bytes: ByteArray): String =
        MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
}
