package com.mathlearning.core.learning.engine

import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.evaluator.EvaluationRequest
import com.mathlearning.core.learning.evaluator.LearnerResponse
import com.mathlearning.core.learning.evaluator.LocalLessonEvaluator
import com.mathlearning.core.model.MacroStage

/**
 * LocalLessonEngine (P6, ADR-0044) — the UI-independent session/encounter/stage lifecycle.
 *
 * Decision seams (ALL still open at implementation time — the engine refuses, it never guesses):
 *  - O1: the correctness evaluator (this engine only ORCHESTRATES; [evaluator] is an injected
 *    [LocalLessonEvaluator]). The shipped `UnconfiguredEvaluator` fails closed.
 *  - O3: the HTTP LessonGateway replacement — sessions are local; the engine never touches a server.
 *  - CONTENT-014: mastery/unlock/jump policies — [ProgressionEngine]/[MasteryEngine] run ONLY
 *    with an owner-approved policy handle from VersionedLearningConfigRepository.
 *
 * Mechanics here are decision-free and mirror the RECORDED contracts (TS runtime types + ADR-0039
 * §6 approved behaviours): session/encounter/stage lifecycle states, manual progression (no
 * auto-advance), duplicate-submission prevention (deterministic idempotency keys), suspend/resume.
 */
class LocalLessonEngine(val evaluator: LocalLessonEvaluator) {

    fun createSession(command: StartSessionCommand): LessonSessionState {
        require(command.sessionId.isNotBlank() && command.stationId.isNotBlank()) { "session requires IDs" }
        require(command.stageOrder.isNotEmpty()) { "a session needs its stage order (content-provided)" }
        return LessonSessionState(
            sessionId = command.sessionId,
            stationId = command.stationId,
            stageOrder = command.stageOrder,
            stageCursor = 0,
            lifecycle = SessionLifecycle.ACTIVE,
            completedEncounterIds = emptySet(),
            submittedAttemptKeys = emptySet(),
            mistakes = emptyList(),
        )
    }

    fun presentEncounter(state: LessonSessionState, encounterId: String, stage: MacroStage): PresentedEncounter {
        require(state.lifecycle == SessionLifecycle.ACTIVE) { "session is not active" }
        require(state.stageOrder.contains(stage)) { "stage ${stage.name} is not part of this session's content order" }
        val cursor = state.stageOrder.indexOf(stage)
        require(cursor >= state.stageCursor) { "cannot walk backwards past the session cursor" }
        return PresentedEncounter(
            state = state,
            encounterId = encounterId,
            stage = stage,
            stageCursor = maxOf(cursor, state.stageCursor),
        )
    }

    /** Duplicate-submission prevention: the same attempt key NEVER evaluates twice. */
    fun submitAttempt(
        presented: PresentedEncounter,
        attemptKey: String,
        response: LearnerResponse,
    ): AttemptResult {
        require(attemptKey.isNotBlank()) { "attempt key required (deterministic idempotency)" }
        val canonicalKey = "attempt|${presented.state.sessionId}|${presented.encounterId}|$attemptKey"
        if (canonicalKey in presented.state.submittedAttemptKeys) {
            return AttemptResult(
                state = presented.state,
                outcome = null,
                duplicate = true,
                attemptKey = canonicalKey,
            )
        }
        val outcome = evaluator.evaluate(
            EvaluationRequest(
                sessionId = presented.state.sessionId,
                encounterId = presented.encounterId,
                stage = presented.stage,
                response = response,
            ),
        )
        val mistakes = if (outcome.correct) presented.state.mistakes else presented.state.mistakes + presented.encounterId
        return AttemptResult(
            state = presented.state.copy(
                submittedAttemptKeys = presented.state.submittedAttemptKeys + canonicalKey,
                completedEncounterIds = presented.state.completedEncounterIds + presented.encounterId,
                mistakes = mistakes,
            ),
            outcome = outcome,
            duplicate = false,
            attemptKey = canonicalKey,
        )
    }

    fun advanceStage(state: LessonSessionState, from: MacroStage): LessonSessionState {
        require(state.lifecycle == SessionLifecycle.ACTIVE) { "session is not active" }
        val index = state.stageOrder.indexOf(from)
        require(index == state.stageCursor) { "manual progression only: advance from the current stage" }
        // Manual progression, no auto-advance (ADR-0039 §6 approved behaviour): the UI decides
        // WHEN to advance; the engine only validates the order.
        val next = index + 1
        return if (next >= state.stageOrder.size) {
            state.copy(lifecycle = SessionLifecycle.COMPLETED)
        } else {
            state.copy(stageCursor = next)
        }
    }

    fun suspend(state: LessonSessionState): LessonSessionState = state.copy(lifecycle = SessionLifecycle.INTERRUPTED)

    fun resume(state: LessonSessionState): LessonSessionState {
        require(state.lifecycle == SessionLifecycle.INTERRUPTED) { "only an interrupted session resumes" }
        return state.copy(lifecycle = SessionLifecycle.ACTIVE)
    }

    fun abandon(state: LessonSessionState): LessonSessionState = state.copy(lifecycle = SessionLifecycle.ABANDONED)
}

data class StartSessionCommand(val sessionId: String, val stationId: String, val stageOrder: List<MacroStage>)

data class LessonSessionState(
    val sessionId: String,
    val stationId: String,
    val stageOrder: List<MacroStage>,
    val stageCursor: Int,
    val lifecycle: SessionLifecycle,
    val completedEncounterIds: Set<String>,
    val submittedAttemptKeys: Set<String>,
    val mistakes: List<String>,
)

enum class SessionLifecycle { ACTIVE, INTERRUPTED, COMPLETED, ABANDONED }

data class PresentedEncounter(
    val state: LessonSessionState,
    val encounterId: String,
    val stage: MacroStage,
    val stageCursor: Int,
)

data class AttemptResult(
    val state: LessonSessionState,
    val outcome: EvaluationOutcome?,
    val duplicate: Boolean,
    val attemptKey: String,
)
