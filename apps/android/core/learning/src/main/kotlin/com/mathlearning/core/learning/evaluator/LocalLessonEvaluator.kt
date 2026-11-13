package com.mathlearning.core.learning.evaluator

import com.mathlearning.core.model.MacroStage

/**
 * LocalLessonEvaluator SPI (O1 SEAM — the only place correctness decisions may ever live).
 *
 * Determinism contract (owner P6 mission): for the same (contentPackageVersion, item, response,
 * configVersion) the outcome MUST be identical — the implementation owns that proof (golden tests
 * per template run against the chosen O1 implementation). This module ships NO correctness
 * decision at all: `UnconfiguredEvaluator` fails closed, so no invented evaluation exists.
 *
 * O1 options map onto implementations exactly as recorded in ADR-0039 §3:
 *  (1) answer keys inside a separate evaluator layer → an implementation holding keys privately,
 *      never logged/surfaced (extractability risk recorded in ADR-0044);
 *  (2) per-template no-extractable-key evaluation → per-template implementations with proofs;
 *  (3) evaluation from item parameters at runtime → parameter-driven implementations.
 * Telemetry from outcomes is IDs-only (CONTENT-018) — outcomes never log answers.
 */
interface LocalLessonEvaluator {
    fun evaluate(request: EvaluationRequest): EvaluationOutcome
}

data class EvaluationRequest(
    val sessionId: String,
    val encounterId: String,
    val stage: MacroStage,
    val response: LearnerResponse,
)

/** Learner response: identifiers + opaque response reference — never raw answer content. */
data class LearnerResponse(
    val interactionId: String,
    val choiceId: String?,
    val responseRef: String?,
)

data class EvaluationOutcome(
    val correct: Boolean,
    val nextAction: NextAction,
    val evaluatorVersion: String,
)

enum class NextAction { ADVANCE, RETRY, RECOVERY, AWAIT_POLICY }

/** Ships in the engine: refuses to decide — fail-closed until an O1-approved evaluator exists. */
object UnconfiguredEvaluator : LocalLessonEvaluator {
    override fun evaluate(request: EvaluationRequest): EvaluationOutcome =
        throw IllegalStateException("no O1-approved evaluator is configured; correctness decisions are refused (fail-closed)")
}
