package com.mathlearning.core.learning.checkpoint

import com.mathlearning.core.learning.engine.LessonSessionState
import com.mathlearning.core.model.MacroStage

/**
 * SessionCheckpointManager (P6) — suspend/resume CONTRACT over an injected checkpoint store SPI
 * (the DataStore implementation stays in :core:datastore; this engine stays Android-free).
 * Checkpoints carry IDENTIFIERS ONLY (sessionId/stationId/encounterId/stage/cursor) — never
 * answers or correctness (CONTENT-008/018). Resume = rehydrate the session state; the encounter
 * CONTENT re-loads from the active content package.
 */
interface SessionCheckpointStore {
    fun write(checkpoint: SessionCheckpoint)
    fun read(sessionId: String): SessionCheckpoint?
    fun clear(sessionId: String)
}

data class SessionCheckpoint(
    val sessionId: String,
    val stationId: String,
    val encounterId: String,
    val stage: MacroStage,
    val stageCursor: Int,
    val completedEncounterIds: Set<String>,
    val mistakes: List<String>,
    val engineRuleVersion: String,
    val savedAtMs: Long,
)

class SessionCheckpointManager(private val store: SessionCheckpointStore, private val engineRuleVersion: String) {

    fun suspendSession(state: LessonSessionState, encounterId: String, nowMs: Long) {
        store.write(
            SessionCheckpoint(
                sessionId = state.sessionId,
                stationId = state.stationId,
                encounterId = encounterId,
                stage = state.stageOrder[state.stageCursor],
                stageCursor = state.stageCursor,
                completedEncounterIds = state.completedEncounterIds,
                mistakes = state.mistakes,
                engineRuleVersion = engineRuleVersion,
                savedAtMs = nowMs,
            ),
        )
    }

    /**
     * Resume is version-gated: a checkpoint written by a DIFFERENT engine rule version cannot be
     * silently continued (content/evaluator version mismatch — owner P6 mission). The caller
     * decides the recovery UX; the engine refuses the mismatch.
     */
    fun resumeSession(sessionId: String, expectedRuleVersion: String): ResumableSession {
        val checkpoint = store.read(sessionId)
            ?: throw CheckpointNotFoundException("no checkpoint for session $sessionId")
        if (checkpoint.engineRuleVersion != expectedRuleVersion) {
            throw CheckpointVersionMismatchException(
                "checkpoint rule ${checkpoint.engineRuleVersion} != engine rule $expectedRuleVersion — resume refused",
            )
        }
        return ResumableSession(
            sessionId = checkpoint.sessionId,
            stationId = checkpoint.stationId,
            encounterId = checkpoint.encounterId,
            stage = checkpoint.stage,
            stageCursor = checkpoint.stageCursor,
            completedEncounterIds = checkpoint.completedEncounterIds,
            mistakes = checkpoint.mistakes,
        )
    }

    fun clear(sessionId: String) = store.clear(sessionId)
}

data class ResumableSession(
    val sessionId: String,
    val stationId: String,
    val encounterId: String,
    val stage: MacroStage,
    val stageCursor: Int,
    val completedEncounterIds: Set<String>,
    val mistakes: List<String>,
)

class CheckpointNotFoundException(message: String) : Exception(message)
class CheckpointVersionMismatchException(message: String) : Exception(message)
