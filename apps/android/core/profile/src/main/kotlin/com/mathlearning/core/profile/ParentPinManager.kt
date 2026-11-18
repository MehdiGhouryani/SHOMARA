package com.mathlearning.core.profile

import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import java.security.SecureRandom

/**
 * ParentPinManager (P10, ADR-0047) — the local parent control secret.
 *
 *  - The PIN is NEVER stored plaintext: PBKDF2WithHmacSHA256 with a per-record random 16-byte salt.
 *    210,000 iterations is the legacy ADR-0047 v1 baseline only; it is NOT the current OWASP
 *    recommendation for PBKDF2-HMAC-SHA256. Before production wiring, select a current KDF/work
 *    factor and benchmark it on low-end target devices. See DTR-009 / ADR-0047 evidence correction.
 *    The salt is stored alongside the hash; it is not a secret and prevents rainbow-table reuse.
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

    /**
     * Consumes [pin]: the supplied character array is cleared on every exit path.
     * Callers must not expect to reuse it after this call.
     */
    fun setPin(pin: CharArray) {
        try {
            require(pin.size in PIN_MIN..PIN_MAX) { "PIN length outside the $PIN_MIN..$PIN_MAX band" }
            require(pin.all { it in '0'..'9' }) { "PIN must contain ASCII digits only" }
            val salt = ByteArray(SALT_BYTES).also { SecureRandom().nextBytes(it) }
            try {
                val derived = derive(pin, salt, ITERATIONS)
                try {
                    store.write(
                        PinRecord(
                            saltHex = salt.toHex(),
                            hashHex = derived.toHex(),
                            iterations = ITERATIONS,
                            failedAttempts = 0,
                            lockedUntilMs = 0,
                        ),
                    )
                } finally {
                    derived.fill(0)
                }
            } finally {
                salt.fill(0)
            }
        } finally {
            pin.fill(0.toChar())
        }
    }

    /**
     * Consumes [pin]: input and temporary derived key/salt buffers are cleared on every path.
     * A malformed/corrupt stored record fails closed and never authenticates.
     */
    fun verify(pin: CharArray): VerifyResult {
        try {
            val record = store.read() ?: return VerifyResult(ok = false, lockedForMs = 0)
            val now = nowMs()
            if (record.lockedUntilMs > now) {
                return VerifyResult(ok = false, lockedForMs = record.lockedUntilMs - now)
            }
            if (record.iterations !in MIN_ITERATIONS..MAX_ITERATIONS) {
                return VerifyResult(ok = false, lockedForMs = 0)
            }
            val salt = decodeHex(record.saltHex, SALT_BYTES)
                ?: return VerifyResult(ok = false, lockedForMs = 0)
            val expected = decodeHex(record.hashHex, KEY_BITS / 8)
            if (expected == null) {
                salt.fill(0)
                return VerifyResult(ok = false, lockedForMs = 0)
            }
            val candidate = try {
                derive(pin, salt, record.iterations)
            } finally {
                salt.fill(0)
            }
            val ok = try {
                MessageDigestBridge.constantTimeEquals(candidate, expected)
            } finally {
                candidate.fill(0)
                expected.fill(0)
            }
            if (ok) {
                store.write(record.copy(failedAttempts = 0, lockedUntilMs = 0))
                return VerifyResult(ok = true, lockedForMs = 0)
            }
            val failed = record.failedAttempts + 1
            val locked = if (failed >= FAILED_LOCKOUT_THRESHOLD) lockoutMsFor(failed) else 0
            store.write(record.copy(failedAttempts = failed, lockedUntilMs = if (locked > 0) now + locked else 0L))
            return VerifyResult(ok = false, lockedForMs = locked)
        } finally {
            pin.fill(0.toChar())
        }
    }

    private fun decodeHex(value: String, expectedBytes: Int): ByteArray? {
        if (value.length != expectedBytes * 2 || value.any { it !in '0'..'9' && it !in 'a'..'f' && it !in 'A'..'F' }) {
            return null
        }
        return runCatching { value.fromHex() }.getOrNull()
    }

    fun isConfigured(): Boolean = store.read()?.let(::hasValidRecord) == true

    private fun hasValidRecord(record: PinRecord): Boolean {
        if (record.iterations !in MIN_ITERATIONS..MAX_ITERATIONS ||
            record.failedAttempts < 0 ||
            record.lockedUntilMs < 0
        ) return false

        val salt = decodeHex(record.saltHex, SALT_BYTES) ?: return false
        val expected = decodeHex(record.hashHex, KEY_BITS / 8)
        if (expected == null) {
            salt.fill(0)
            return false
        }
        salt.fill(0)
        expected.fill(0)
        return true
    }

    fun clearPin() = store.clear()

    /** 30s doubling per extra failure beyond the threshold, capped at 15 minutes. Policy v1. */
    fun lockoutMsFor(failedAttempts: Int): Long {
        val beyond = (failedAttempts - FAILED_LOCKOUT_THRESHOLD).coerceAtLeast(0)
        val seconds = 30L shl beyond.coerceAtMost(5) // 30s, 60s, 120s … capped at 15 min
        return seconds.coerceAtMost(900) * 1000
    }

    private fun derive(pin: CharArray, salt: ByteArray, iterations: Int): ByteArray {
        val spec = PBEKeySpec(pin, salt, iterations, KEY_BITS)
        try {
            val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            return factory.generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    companion object {
        const val PIN_MIN: Int = 4
        const val PIN_MAX: Int = 8
        /** Legacy v1 test baseline; replace via a versioned KDF migration before production wiring. */
        const val ITERATIONS: Int = 210_000
        const val SALT_BYTES: Int = 16
        const val KEY_BITS: Int = 256
        const val MIN_ITERATIONS: Int = 210_000
        const val MAX_ITERATIONS: Int = 1_000_000
        const val FAILED_LOCKOUT_THRESHOLD: Int = 5
        const val POLICY_VERSION: String = "parent-pin-policy:v1"
    }
}

internal object MessageDigestBridge {
    /** java.security.MessageDigest.isEqual is the constant-time comparison (available JVM+Android). */
    fun constantTimeEquals(a: ByteArray, b: ByteArray): Boolean =
        java.security.MessageDigest.isEqual(a, b)

    /** Kept for compatibility with existing adapters; prefer byte arrays for secret material. */
    fun constantTimeEquals(a: String, b: String): Boolean =
        constantTimeEquals(a.toByteArray(), b.toByteArray())
}

fun ByteArray.toHex(): String = joinToString("") { "%02x".format(it) }
fun String.fromHex(): ByteArray = chunked(2).map { it.toInt(16).toByte() }.toByteArray()
