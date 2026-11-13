package com.mathlearning.core.profile

import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import java.security.SecureRandom

/**
 * ParentPinManager (P10, ADR-0047) — the local parent control secret.
 *
 *  - The PIN is NEVER stored plaintext: PBKDF2WithHmacSHA256, a per-install random salt, and
 *    210,000 iterations (OWASP 2023 guidance for PBKDF2-HMAC-SHA256) — salt stored alongside,
 *    which is standard and safe (the salt is not a secret; it defeats rainbow tables).
 *  - Verification is constant-time over the derived key (MessageDigest.isEqual).
 *  - Retry/lockout policy v1 (defined here per the owner mission, versioned like every rule):
 *    after FAILED_LOCKOUT_THRESHOLD consecutive failures the manager locks for a growing window
 *    (30s doubling, capped at 15 min); every SUCCESS resets the counter. The counter is
 *    persisted so process death cannot dodge the lockout.
 *  - No PIN characters, lengths or derived keys are ever logged (SafeDiagnostics scans).
 */
class ParentPinManager(private val store: PinStore, private val nowMs: () -> Long = { System.currentTimeMillis() }) {

    interface PinStore {
        fun read(): PinRecord?
        fun write(record: PinRecord)
        fun clear()
    }

    data class PinRecord(val saltHex: String, val hashHex: String, val iterations: Int, val failedAttempts: Int, val lockedUntilMs: Long)

    data class VerifyResult(val ok: Boolean, val lockedForMs: Long)

    fun setPin(pin: CharArray) {
        require(pin.size in PIN_MIN..PIN_MAX) { "PIN length outside the $PIN_MIN..$PIN_MAX band" }
        val salt = ByteArray(SALT_BYTES).also { SecureRandom().nextBytes(it) }
        store.write(PinRecord(salt.toHex(), hash(pin, salt, ITERATIONS), ITERATIONS, failedAttempts = 0, lockedUntilMs = 0))
    }

    fun verify(pin: CharArray): VerifyResult {
        val record = store.read() ?: return VerifyResult(ok = false, lockedForMs = 0)
        val now = nowMs()
        if (record.lockedUntilMs > now) return VerifyResult(ok = false, lockedForMs = record.lockedUntilMs - now)
        val candidate = hash(pin, record.saltHex.fromHex(), record.iterations)
        val ok = MessageDigestBridge.constantTimeEquals(candidate, record.hashHex)
        if (ok) {
            store.write(record.copy(failedAttempts = 0, lockedUntilMs = 0))
            return VerifyResult(ok = true, lockedForMs = 0)
        }
        val failed = record.failedAttempts + 1
        val locked = if (failed >= FAILED_LOCKOUT_THRESHOLD) lockoutMsFor(failed) else 0
        store.write(record.copy(failedAttempts = failed, lockedUntilMs = now + locked))
        return VerifyResult(ok = false, lockedForMs = locked)
    }

    fun isConfigured(): Boolean = store.read() != null

    fun clearPin() = store.clear()

    /** 30s doubling per extra failure beyond the threshold, capped at 15 minutes. Policy v1. */
    fun lockoutMsFor(failedAttempts: Int): Long {
        val beyond = (failedAttempts - FAILED_LOCKOUT_THRESHOLD).coerceAtLeast(0)
        val seconds = 30L shl beyond.coerceAtMost(5) // 30s, 60s, 120s … capped at 15 min
        return seconds.coerceAtMost(900) * 1000
    }

    private fun hash(pin: CharArray, salt: ByteArray, iterations: Int): String {
        val spec = PBEKeySpec(pin, salt, iterations, KEY_BITS)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        return factory.generateSecret(spec).encoded.toHex()
    }

    companion object {
        const val PIN_MIN: Int = 4
        const val PIN_MAX: Int = 8
        const val ITERATIONS: Int = 210_000
        const val SALT_BYTES: Int = 16
        const val KEY_BITS: Int = 256
        const val FAILED_LOCKOUT_THRESHOLD: Int = 5
        const val POLICY_VERSION: String = "parent-pin-policy:v1"
    }
}

internal object MessageDigestBridge {
    /** java.security.MessageDigest.isEqual is the constant-time comparison (available JVM+Android). */
    fun constantTimeEquals(a: String, b: String): Boolean =
        java.security.MessageDigest.isEqual(a.toByteArray(), b.toByteArray())
}

fun ByteArray.toHex(): String = joinToString("") { "%02x".format(it) }
fun String.fromHex(): ByteArray = chunked(2).map { it.toInt(16).toByte() }.toByteArray()
