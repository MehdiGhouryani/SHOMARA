package com.mathlearning.core.model

/**
 * N06-01/09/11 — Kotlin-side mirror of the 3-tier content projection boundary
 * (packages/contracts/src/content-projection.ts). Staging validators + projection guards run on
 * the device too: a contaminated payload must fail loudly, never silently reach a child.
 */

/** Canonical station/content lifecycle (CONTENT-015). */
enum class ContentLifecycleStage {
    SOURCE_ONLY, MAPPED_TO_REPO, STAGED, VALIDATED, HUMAN_REVIEWED, APPROVED, ENABLED,
}

/** Canonical audio asset lifecycle. */
enum class AudioLifecycleStage {
    DRAFT, GENERATED_OR_UPLOADED, TECHNICALLY_VALIDATED, LISTENED, RIGHTS_CLEARED, APPROVED, PUBLISHED,
}

/** The four distinct review roles; `reviewed` alone is never sufficient (CONTENT-015). */
enum class ReviewRole { CURRICULUM, PERSIAN_PRONUNCIATION, ACCESSIBILITY, RIGHTS_MODERATION }

/** P1..P5 macro stages mapped onto server-owned state names. */
enum class MacroStage { P1_DISCOVER, P2_GUIDED, P3_GAME, P4_ASSESSMENT, P5_TRANSFER }

object ShomaraMacroStages {
    val HINT_BANNED: Set<MacroStage> = setOf(MacroStage.P4_ASSESSMENT, MacroStage.P5_TRANSFER)
    val HINT_KEYS: Set<String> = setOf("h1", "h2", "h3", "hint", "hints")
    val FORBIDDEN_PROJECTION_KEYS: Set<String> = setOf(
        "answer", "answers", "answerKey", "answer_key", "correctIndex", "correctAnswer",
        "evaluatorConfig", "evaluator_config", "pass_threshold", "passThreshold",
        "nextStep", "reviewer", "reviewerId", "reviewEvidence", "provenance",
    ) + HINT_KEYS
}

data class ReviewEvidence(val role: ReviewRole, val reviewerId: String, val decidedAt: String)

data class PrerequisiteEdge(val fromStationId: String, val toStationId: String)

/** Server-owned versioned config (CONTENT-001/002/014); client never hardcodes these values. */
data class ServerLearningConfig(
    val configVersion: Int,
    val stationJumpQuestionCount: Int,
    val chapterJumpQuestionCount: Int,
    val masteryPassThreshold: String,
    val traceToleranceDp: Int,
) {
    companion object {
        val DEFAULT: ServerLearningConfig = ServerLearningConfig(
            configVersion = 1,
            stationJumpQuestionCount = 1,
            chapterJumpQuestionCount = 5,
            masteryPassThreshold = "3/4",
            traceToleranceDp = 28,
        )
    }
}

/** CONTENT-017: audio is expected but never blocks a lesson. */
enum class AudioPolicy { EXPECTED_NEVER_BLOCKING }

object ShomaraProjectionGuards {

    fun reviewRoleViolations(evidence: List<ReviewEvidence>): List<String> {
        val violations = mutableListOf<String>()
        val seen = evidence.map { it.role }.toSet()
        for (role in ReviewRole.entries) {
            if (role !in seen) violations += "missing review role: ${role.name.lowercase()}"
        }
        if (evidence.any { it.reviewerId.isBlank() }) violations += "review evidence with empty reviewerId"
        return violations
    }

    fun prerequisiteViolations(edges: List<PrerequisiteEdge>, knownStationIds: Set<String>): List<String> {
        val violations = mutableListOf<String>()
        for (edge in edges) {
            if (edge.fromStationId !in knownStationIds) violations += "unknown prerequisite source: ${edge.fromStationId}"
            if (edge.toStationId !in knownStationIds) violations += "unknown prerequisite target: ${edge.toStationId}"
            if (edge.fromStationId == edge.toStationId) violations += "self-edge: ${edge.fromStationId}"
        }
        val adjacency = edges.groupBy({ it.fromStationId }, { it.toStationId })
        val visiting = mutableSetOf<String>()
        val visited = mutableSetOf<String>()
        fun visit(node: String) {
            if (node in visited) return
            if (node in visiting) {
                violations += "prerequisite cycle at $node"
                return
            }
            visiting += node
            for (next in adjacency[node].orEmpty()) visit(next)
            visiting -= node
            visited += node
        }
        for (node in knownStationIds) visit(node)
        return violations
    }

    /** Deep scan: forbidden keys (answers/evaluator/threshold/reviewer/hints) at any depth. */
    fun projectionViolations(payload: Map<String, Any?>, macroStages: Set<MacroStage> = emptySet()): List<String> {
        val violations = mutableListOf<String>()
        val hintScanRequired = macroStages.any { it in ShomaraMacroStages.HINT_BANNED }
        fun scan(value: Any?, path: String) {
            when (value) {
                is Map<*, *> -> for ((key, child) in value) {
                    val keyString = key.toString()
                    if (keyString in ShomaraMacroStages.FORBIDDEN_PROJECTION_KEYS) violations += "$path.$keyString"
                    if (hintScanRequired && keyString in ShomaraMacroStages.HINT_KEYS) violations += "hint-in-P4/P5:$path.$keyString"
                    scan(child, "$path.$keyString")
                }
                is List<*> -> value.forEachIndexed { index, item -> scan(item, "$path[$index]") }
                else -> {}
            }
        }
        scan(payload, "$")
        return violations
    }
}

/** CONTENT-018: minimal telemetry — IDs only, never answers, correctness, or child PII. */
data class AttemptTelemetry(
    val sessionId: String,
    val encounterId: String,
    val interactionId: String,
    val choiceId: String?,
    val macroStage: MacroStage,
) {
    init {
        require(sessionId.isNotBlank() && encounterId.isNotBlank() && interactionId.isNotBlank()) {
            "telemetry requires non-blank session/encounter/interaction IDs"
        }
    }

    fun asMinimalPayload(): Map<String, Any?> = mapOf(
        "sessionId" to sessionId,
        "encounterId" to encounterId,
        "interactionId" to interactionId,
        "choiceId" to choiceId,
        "macroStage" to macroStage.name,
    )
}
