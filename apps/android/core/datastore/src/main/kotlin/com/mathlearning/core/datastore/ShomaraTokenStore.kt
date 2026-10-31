package com.mathlearning.core.datastore

/**
 * Token storage contract (N04-03/N04-05): the access token is written only through this store,
 * is never logged, and every read is validated against the fail-closed policy before use.
 */
interface ShomaraTokenStore {
    suspend fun save(token: String)
    suspend fun read(): String?
    suspend fun clear()
}

/**
 * Fail-closed session policy (N04-05 acceptance): an expired or blank token must never be used;
 * restoring always requires a non-blank token AND explicit server verification, and clearing
 * removes the secret completely.
 */
object ShomaraTokenPolicy {
    /** Server-side session TTL for the OTP session (7 days, mirroring apps/web TEACHER TTL is NOT reused; auth TTL comes from the server). */
    const val MaxRestoredSessionMs: Long = 7L * 24 * 60 * 60 * 1000

    fun isUsable(token: String?): Boolean = !token.isNullOrBlank()

    /** Restore decision: only a present token within the age window may attempt verification. */
    fun canAttemptRestore(token: String?, savedAtEpochMs: Long?, nowEpochMs: Long): Boolean {
        if (!isUsable(token)) return false
        val savedAt = savedAtEpochMs ?: return false
        if (savedAt > nowEpochMs) return false // future-dated entry is tampering; fail closed
        return nowEpochMs - savedAt <= MaxRestoredSessionMs
    }

    /**
     * What the store must do when restore/expiry handling decides the session is dead:
     * ALWAYS clear (no residual secret on disk), regardless of why the session ended.
     */
    fun mustClearOnExit(reason: RestoreOutcome): Boolean = true
}

enum class RestoreOutcome { Verified, TokenMissing, TokenExpired, ServerRejected, NetworkUnavailable }
