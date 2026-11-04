package com.mathlearning.core.network

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Minimal flat-JSON string extraction (no extra serialization dependency for N04). Handles
 * quoted values with escaped quotes/backslashes; numbers/booleans are out of contract scope.
 */
object ShomaraJson {
    fun extractString(json: String, key: String): String? {
        val needle = "\"$key\""
        val keyIndex = json.indexOf(needle)
        if (keyIndex < 0) return null
        var i = keyIndex + needle.length
        while (i < json.length && json[i].isWhitespace()) i += 1
        if (i >= json.length || json[i] != ':') return null
        i += 1
        while (i < json.length && json[i].isWhitespace()) i += 1
        if (i >= json.length || json[i] != '"') return null
        i += 1
        val out = StringBuilder()
        while (i < json.length) {
            val c = json[i]
            when {
                c == '\\' && i + 1 < json.length -> {
                    out.append(
                        when (json[i + 1]) {
                            'n' -> '\n'
                            't' -> '\t'
                            else -> json[i + 1]
                        },
                    )
                    i += 2
                }
                c == '"' -> return out.toString()
                else -> {
                    out.append(c)
                    i += 1
                }
            }
        }
        return null
    }

    /** Extracts a bare JSON boolean (true/false); null when absent or not a boolean. */
    fun extractBoolean(json: String, key: String): Boolean? {
        val needle = "\"$key\""
        val keyIndex = json.indexOf(needle)
        if (keyIndex < 0) return null
        var i = keyIndex + needle.length
        while (i < json.length && json[i].isWhitespace()) i += 1
        if (i >= json.length || json[i] != ':') return null
        i += 1
        while (i < json.length && json[i].isWhitespace()) i += 1
        if (i >= json.length) return null
        return when {
            json.startsWith("true", i) -> true
            json.startsWith("false", i) -> false
            else -> null
        }
    }

    fun escape(value: String): String = buildString {
        for (c in value) when (c) {
            '"' -> append("\\\"")
            '\\' -> append("\\\\")
            '\n' -> append("\\n")
            '\t' -> append("\\t")
            else -> append(c)
        }
    }
}

sealed class ShomaraOtpResult {
    data class Success(val accessToken: String?) : ShomaraOtpResult()
    data class Failure(val failure: ShomaraNetworkFailure) : ShomaraOtpResult()
}

/**
 * The OTP transport contract (N08-15).
 *
 * Production is [ShomaraOtpApi] (real HTTP, fail-closed when no endpoint is configured). A DEBUG
 * build may substitute a simulated provider; because both implement this interface, the session
 * orchestrator has exactly one code path and the simulation cannot bypass any of its rules.
 */
interface ShomaraOtpProvider {
    /** True only for the DEBUG-only simulated provider; production is always false. */
    val isSimulated: Boolean

    fun requestOtp(phone: String): ShomaraOtpResult

    fun verifyOtp(phone: String, code: String): ShomaraOtpResult
}

data class ShomaraOtpEndpoints(
    val start: String,
    val verify: String,
)

/**
 * Real HTTP OTP API (N04-03). The base URL is injected at runtime — never committed (ADR-0037
 * L10). Request/verify POST JSON and map every negative path through the shared taxonomy.
 */
class ShomaraOtpApi(
    private val client: OkHttpClient,
    private val endpoints: () -> ShomaraOtpEndpoints?,
) : ShomaraOtpProvider {
    override val isSimulated: Boolean = false

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    /** Requests an OTP for the canonical phone; returns the server Retry-After when throttled. */
    override fun requestOtp(phone: String): ShomaraOtpResult = post(endpoints()?.start, "{\"phone\":\"${ShomaraJson.escape(phone)}\"}")

    override fun verifyOtp(phone: String, code: String): ShomaraOtpResult =
        post(endpoints()?.verify, "{\"phone\":\"${ShomaraJson.escape(phone)}\",\"code\":\"${ShomaraJson.escape(code)}\"}")

    private fun post(url: String?, bodyJson: String): ShomaraOtpResult {
        if (url.isNullOrBlank()) {
            return ShomaraOtpResult.Failure(ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "backend endpoints not configured"))
        }
        return try {
            val request = Request.Builder()
                .url(url)
                .post(bodyJson.toRequestBody(jsonMedia))
                .build()
            client.newCall(request).execute().use { response ->
                val headers = response.headers.toMap()
                val failure = ShomaraNetworkMapping.fromHttp(response.code, headers)
                if (failure != null) return ShomaraOtpResult.Failure(failure)
                val body = response.body?.string().orEmpty()
                ShomaraOtpResult.Success(ShomaraJson.extractString(body, "access_token"))
            }
        } catch (throwable: Throwable) {
            ShomaraOtpResult.Failure(ShomaraNetworkMapping.fromThrowable(throwable))
        }
    }

    companion object {
        /** Auth calls get a deliberately tight timeout: failing fast beats hanging a child session. */
        fun defaultClient(): OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .build()
    }
}

/**
 * Client-side OTP throttle (N04-03): a resend cooldown enforced locally on top of the server's
 * 429/Retry-After. Pure and testable; the UI disables the resend CTA while blocked.
 */
class ShomaraOtpThrottle(
    private val defaultCooldownMs: Long = 60_000L,
    private val maxCooldownMs: Long = 300_000L,
) {
    var blockedUntilEpochMs: Long = 0L
        private set
    var attempts: Int = 0
        private set

    fun canRequest(nowEpochMs: Long): Boolean = nowEpochMs >= blockedUntilEpochMs

    fun remainingMs(nowEpochMs: Long): Long = (blockedUntilEpochMs - nowEpochMs).coerceAtLeast(0L)

    /** Called after a successful send: applies the server Retry-After or the default cooldown. */
    fun onRequested(nowEpochMs: Long, retryAfterSeconds: Long? = null) {
        attempts += 1
        val fromServer = retryAfterSeconds?.let { it * 1000 }?.coerceAtMost(maxCooldownMs)
        blockedUntilEpochMs = nowEpochMs + (fromServer ?: defaultCooldownMs)
    }

    /** Escalates the cooldown after a server 429 without Retry-After (bounded backoff). */
    fun onRateLimited(nowEpochMs: Long) {
        attempts += 1
        val escalated = (defaultCooldownMs * attempts).coerceAtMost(maxCooldownMs)
        blockedUntilEpochMs = nowEpochMs + escalated
    }

    fun reset() {
        blockedUntilEpochMs = 0L
        attempts = 0
    }
}
