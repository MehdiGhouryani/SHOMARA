package com.mathlearning.core.common.error

/**
 * CONTENT-008 boundary — shared by the Room repository implementation (:core:database) and the
 * unit-test fakes that must model the same contract: forbidden keys never reach the child store.
 */
class ForbiddenFieldException(message: String) : Exception(message)

object ForbiddenFieldGuard {
    /** CONTENT-008: these keys must never enter the child database from any payload. */
    val FORBIDDEN_KEYS: Set<String> = setOf(
        "answer", "answers", "answerKey", "answer_key", "correctIndex", "correctAnswer",
        "evaluatorConfig", "evaluator_config", "pass_threshold", "passThreshold",
        "nextStep", "reviewer", "reviewerId", "reviewEvidence", "provenance",
    )

    fun reject(payload: Map<String, String>) {
        for ((key, value) in payload) {
            if (FORBIDDEN_KEYS.any { key.equals(it, ignoreCase = true) }) {
                throw ForbiddenFieldException("forbidden field rejected before persistence: $key")
            }
            if (key == "content" && FORBIDDEN_KEYS.any { value.contains(it, ignoreCase = true) }) {
                throw ForbiddenFieldException("forbidden field embedded in content blob")
            }
        }
    }
}
