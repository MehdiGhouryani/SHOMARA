package com.mathlearning.core.network

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * LessonGateway (N06-04): submits an attempt to the server with a DETERMINISTIC idempotency key
 * per (sessionId, encounterId, attemptIndex) — a network retry re-sends the SAME key, so the
 * server deduplicates and the child can never double-submit an attempt.
 *
 * The response is parsed into a server-owned decision only (correctness/next step are server
 * truth; this client never computes either).
 */
data class AttemptSubmission(
    val sessionId: String,
    val encounterId: String,
    val attemptIndex: Int,
    val interactionId: String,
    val choiceId: String?,
) {
    /** Deterministic, replay-safe idempotency key. */
    fun idempotencyKey(): String = "attempt|$sessionId|$encounterId|$attemptIndex|$interactionId"

    /** CONTENT-018 minimal payload: IDs only — never answers, correctness, or PII. */
    fun minimalPayload(): String {
        val choice = choiceId?.let { "\"$it\"" } ?: "null"
        return "{\"sessionId\":\"${ShomaraJson.escape(sessionId)}\"," +
            "\"encounterId\":\"${ShomaraJson.escape(encounterId)}\"," +
            "\"attemptIndex\":$attemptIndex," +
            "\"interactionId\":\"${ShomaraJson.escape(interactionId)}\"," +
            "\"choiceId\":$choice}"
    }
}

sealed class LessonSubmitResult {
    /** Server-owned outcome; raw server JSON is never echoed to the child. */
    data class Accepted(val nextAction: String, val correct: Boolean?) : LessonSubmitResult()
    data class Duplicate(val nextAction: String, val correct: Boolean?) : LessonSubmitResult()
    data class Failed(val failure: ShomaraNetworkFailure) : LessonSubmitResult()
}

class LessonGateway(
    private val client: OkHttpClient,
    private val submitUrl: () -> String?,
) {
    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    fun submit(submission: AttemptSubmission): LessonSubmitResult {
        val url = submitUrl() ?: return LessonSubmitResult.Failed(
            ShomaraNetworkFailure(ShomaraNetworkError.InvalidRequest, "lesson submit endpoint not configured"),
        )
        return try {
            val request = Request.Builder()
                .url(url)
                .header("Idempotency-Key", submission.idempotencyKey())
                .post(submission.minimalPayload().toRequestBody(jsonMedia))
                .build()
            client.newCall(request).execute().use { response ->
                val failure = ShomaraNetworkMapping.fromHttp(response.code, response.headers.toMap())
                if (failure != null) return LessonSubmitResult.Failed(failure)
                val body = response.body?.string().orEmpty()
                val nextAction = ShomaraJson.extractString(body, "nextAction") ?: "ADVANCE"
                val correct = ShomaraJson.extractBoolean(body, "correct")
                if (response.code == 200) {
                    LessonSubmitResult.Duplicate(nextAction, correct)
                } else {
                    LessonSubmitResult.Accepted(nextAction, correct)
                }
            }
        } catch (throwable: Throwable) {
            LessonSubmitResult.Failed(ShomaraNetworkMapping.fromThrowable(throwable))
        }
    }
}
