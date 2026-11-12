package com.mathlearning.core.common.error

import java.util.UUID

/**
 * ShomaraErrorModel (P3 native infrastructure, ADR-0041) — the canonical three-layer error
 * contract. [AppError] stays the canonical LEAF taxonomy (data-layer vocabulary); this model
 * classifies it and adds the two layers the UI must distinguish:
 *
 *  - DOMAIN: a learning/product rule rejected the operation (e.g. a locked station). Automatic
 *    retry is meaningless — the rule, not the world, said no. Never carries child data.
 *  - DATA: a source failure, wrapping the canonical [AppError]. Retry follows the shared policy.
 *  - PRESENTATION: a render/surface failure. Recovery = re-render the surface; never auto-retried,
 *    never surfaced to the child as a scary error.
 *
 * Privacy contract: errors carry identifiers ONLY ([incidentId], [ShomaraError.Domain.ruleId],
 * surface ids). Answers, correctness, child names, phone numbers and payloads are forbidden in
 * error models and in logs built from them (CONTENT-008/018; enforced by SafeAppLogger).
 */
enum class ErrorLayer { DOMAIN, DATA, PRESENTATION }

sealed interface ShomaraError {
    val layer: ErrorLayer
    val userMessageKey: UserMessageKey
    val incidentId: String?

    /** A product/learning rule rejected the operation. `ruleId` is a stable identifier, not prose. */
    data class Domain(val ruleId: String) : ShomaraError {
        override val layer: ErrorLayer = ErrorLayer.DOMAIN
        override val userMessageKey: UserMessageKey = UserMessageKey.TRY_AGAIN
        override val incidentId: String? = null
    }

    /** A source failure over the canonical [AppError] leaf taxonomy. */
    data class Data(val cause: AppError, val reportedIncidentId: String? = null) : ShomaraError {
        override val layer: ErrorLayer = ErrorLayer.DATA
        override val userMessageKey: UserMessageKey = cause.toUserMessageKey()
        override val incidentId: String?
            get() = reportedIncidentId ?: (cause as? AppError.Unknown)?.incidentId
    }

    /** A surface failed to render or was interrupted; recovery is re-render, with a fresh incident id. */
    data class Presentation(val surfaceId: String) : ShomaraError {
        override val layer: ErrorLayer = ErrorLayer.PRESENTATION
        override val userMessageKey: UserMessageKey = UserMessageKey.UNEXPECTED
        override val incidentId: String = ShomaraErrors.newIncidentId()
    }
}

object ShomaraErrors {
    /** Identifier-only diagnostics: callers log the id, never the error payload. */
    fun newIncidentId(): String = UUID.randomUUID().toString()
}

enum class RetryKind { NEVER, IMMEDIATE, BACKOFF }

/**
 * Automatic-retry decision. This is POLICY for background/transport retries only — it is NOT the
 * child-visible retry control, which stays a deliberate, calm CTA owned by the UI (AGENTS §6).
 */
data class RetryDecision(
    val kind: RetryKind,
    val maxAttempts: Int = 0,
    val baseDelayMs: Long = 0L,
    val maxDelayMs: Long = 0L,
) {
    companion object {
        val NEVER: RetryDecision = RetryDecision(RetryKind.NEVER)
        val IMMEDIATE: RetryDecision = RetryDecision(RetryKind.IMMEDIATE)

        /**
         * Mirrors the already-shipped OutboxSyncEngine policy (N07-02: 750ms base, 300s cap,
         * 8 attempts). The numbers are reused, not invented; unification into one shared
         * constant is recorded debt in ADR-0041 (core:common cannot depend on :sync).
         */
        fun backoff(
            maxAttempts: Int = DEFAULT_MAX_ATTEMPTS,
            baseDelayMs: Long = DEFAULT_BASE_DELAY_MS,
            maxDelayMs: Long = DEFAULT_MAX_DELAY_MS,
        ): RetryDecision = RetryDecision(RetryKind.BACKOFF, maxAttempts, baseDelayMs, maxDelayMs)

        const val DEFAULT_BASE_DELAY_MS: Long = 750L
        const val DEFAULT_MAX_DELAY_MS: Long = 300_000L
        const val DEFAULT_MAX_ATTEMPTS: Int = 8
    }
}

object ShomaraRetryPolicy {

    fun decide(error: ShomaraError): RetryDecision = when (error) {
        is ShomaraError.Domain -> RetryDecision.NEVER
        is ShomaraError.Data -> decide(error.cause)
        is ShomaraError.Presentation -> RetryDecision.NEVER
    }

    fun decide(error: AppError): RetryDecision = when (error) {
        AppError.Offline -> RetryDecision.backoff()
        is AppError.Network -> if (error.retryable) RetryDecision.backoff() else RetryDecision.NEVER
        // Session recovery belongs to the re-auth path (fail-closed restore), never a background loop.
        AppError.Unauthorized -> RetryDecision.NEVER
        is AppError.Validation -> RetryDecision.NEVER
        is AppError.Unknown -> RetryDecision.NEVER
    }
}
