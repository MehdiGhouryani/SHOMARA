package com.mathlearning.core.network

import java.io.IOException

/**
 * Network error taxonomy for auth flows (N04-03 acceptance: rate-limit/offline/timeout).
 * Mapping is pure so negative paths are testable against a real HTTP surface (MockWebServer).
 */
enum class ShomaraNetworkError { RateLimited, Offline, Timeout, ServerError, InvalidRequest, Unknown }

data class ShomaraNetworkFailure(val error: ShomaraNetworkError, val detail: String) {
    init { require(detail.isNotBlank()) { "failures must carry a detail" } }

    /** Persian, actionable, non-alarming message for the UI layer. */
    fun userMessage(): String = when (error) {
        ShomaraNetworkError.RateLimited -> "درخواست‌ها زیاد بود؛ کمی بعد دوباره تلاش کن."
        ShomaraNetworkError.Offline -> "اینترنت وصل نیست؛ بعداً ادامه می‌دهیم."
        ShomaraNetworkError.Timeout -> "پاسخ دیر رسید؛ یک بار دیگر تلاش کن."
        ShomaraNetworkError.ServerError -> "مشکلی در سرور پیش آمد؛ بعداً تلاش می‌کنیم."
        ShomaraNetworkError.InvalidRequest -> "اطلاعات را دوباره بررسی کن."
        ShomaraNetworkError.Unknown -> "مشکلی پیش آمد؛ دوباره تلاش کن."
    }
}

object ShomaraNetworkMapping {
    const val RetryAfterHeader: String = "Retry-After"

    /** Maps an HTTP response to the auth taxonomy. Rate limiting is first-class (N04-03). */
    fun fromHttp(statusCode: Int, headers: Map<String, String> = emptyMap()): ShomaraNetworkFailure? {
        if (statusCode in 200..299) return null
        val error = when (statusCode) {
            429 -> ShomaraNetworkError.RateLimited
            408 -> ShomaraNetworkError.Timeout
            in 500..599 -> ShomaraNetworkError.ServerError
            in 400..499 -> ShomaraNetworkError.InvalidRequest
            else -> ShomaraNetworkError.Unknown
        }
        val retryAfter = headers[RetryAfterHeader]
        val detail = when {
            error == ShomaraNetworkError.RateLimited && retryAfter != null -> "HTTP $statusCode; Retry-After=$retryAfter"
            else -> "HTTP $statusCode"
        }
        return ShomaraNetworkFailure(error, detail)
    }

    /** Maps transport exceptions; timeout and offline are distinct user experiences. */
    fun fromThrowable(throwable: Throwable): ShomaraNetworkFailure = when (throwable) {
        is java.net.SocketTimeoutException -> ShomaraNetworkFailure(ShomaraNetworkError.Timeout, throwable.message ?: "timeout")
        is IOException -> ShomaraNetworkFailure(ShomaraNetworkError.Offline, throwable.message ?: "io error")
        else -> ShomaraNetworkFailure(ShomaraNetworkError.Unknown, throwable.message ?: "unexpected")
    }

    /** Retry-After parsing (seconds), clamped to a sane bound; null when absent/invalid. */
    fun retryAfterSeconds(headers: Map<String, String>, maxSeconds: Long = 120): Long? {
        val raw = headers[RetryAfterHeader] ?: return null
        val parsed = raw.trim().toLongOrNull() ?: return null
        if (parsed < 0) return null
        return parsed.coerceAtMost(maxSeconds)
    }
}
