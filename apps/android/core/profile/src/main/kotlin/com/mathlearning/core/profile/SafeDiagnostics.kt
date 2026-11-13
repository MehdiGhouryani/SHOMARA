package com.mathlearning.core.profile

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
