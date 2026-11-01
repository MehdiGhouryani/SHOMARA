package com.mathlearning.feature.lesson

import com.mathlearning.core.datastore.LessonCheckpoint
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ServerLearningConfig
import com.mathlearning.core.network.AttemptSubmission
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.core.network.LessonSubmitResult

/**
 * N06-08 ST07 pilot journey orchestrator: walks P1→P5 with real gateway submissions, saves a
 * checkpoint at every stage boundary, and resumes EXACTLY where an offline interruption hit.
 * The pilot data is a non-production draft — the guard is immutable.
 */
object St07PilotStation {
    const val StationId: String = "ST07"
    const val NonProductionDraft: Boolean = true
    const val Stage: String = "STAGED_PILOT"

    val MacroStages: List<MacroStage> = MacroStage.entries.toList()

    /** Production runtime MUST reject this draft: STAGED content is never ENABLED. */
    fun productionRejected(lifecycleStage: String): Boolean = lifecycleStage != "ENABLED"
}

sealed class JourneyStep {
    data class Entered(val macroStage: MacroStage) : JourneyStep()
    data class Submitted(val nextAction: String, val correct: Boolean?) : JourneyStep()
    data class Interrupted(val failure: com.mathlearning.core.network.ShomaraNetworkFailure) : JourneyStep()
    data class Resumed(val macroStage: MacroStage) : JourneyStep()
}

class ShomaraLessonJourney(
    private val sessionId: String,
    private val stationId: String,
    private val gateway: LessonGateway,
    private val checkpoints: LessonCheckpointStore,
    private val config: ServerLearningConfig = ServerLearningConfig.DEFAULT,
    private val nowMs: () -> Long = { 0L },
) {
    var position: ShomaraLessonPosition = ShomaraLessonPosition(sessionId, stationId, "pending", MacroStage.P1_DISCOVER, null, null)
        private set
    var attemptIndex: Int = 1
        private set

    private fun newEncounterId(stage: MacroStage): String = "enc-$stationId-${stage.name.lowercase()}-$attemptIndex"

    /** Entering a stage rotates the encounter (server assigns real IDs in N06 production). */
    suspend fun enterStage(stage: MacroStage) {
        position = ShomaraLessonPosition(sessionId, stationId, newEncounterId(stage), stage, position.stepIndex, position.totalSteps)
        checkpoints.save(position.checkpoint(nowMs()))
    }

    /**
     * Submits the current attempt with the deterministic idempotency key. On network failure the
     * checkpoint is (re)saved and the attempt index is NOT advanced — the retry replays the key.
     */
    suspend fun submitCurrent(choiceId: String?): JourneyStep {
        val submission = AttemptSubmission(
            sessionId = sessionId,
            encounterId = position.encounterId,
            attemptIndex = attemptIndex,
            interactionId = "${position.macroStage.name}_SELECT",
            choiceId = choiceId,
        )
        return when (val result = gateway.submit(submission)) {
            is LessonSubmitResult.Accepted -> {
                attemptIndex += 1
                JourneyStep.Submitted(result.nextAction, result.correct)
            }
            is LessonSubmitResult.Duplicate -> JourneyStep.Submitted(result.nextAction, result.correct)
            is LessonSubmitResult.Failed -> {
                checkpoints.save(position.checkpoint(nowMs()))
                JourneyStep.Interrupted(result.failure)
            }
        }
    }

    /** Exact resume: restores (encounterId, macroStage) from the checkpoint — no re-walk. */
    suspend fun resume(): JourneyStep.Resumed? {
        val checkpoint: LessonCheckpoint = checkpoints.read(sessionId, stationId) ?: return null
        val stage = MacroStage.entries.firstOrNull { it.name == checkpoint.macroStage } ?: return null
        position = ShomaraLessonPosition(sessionId, stationId, checkpoint.encounterId, stage, position.stepIndex, position.totalSteps)
        return JourneyStep.Resumed(stage)
    }

    val jumpQuestionCount: Int
        get() = if (stationId == config.stationJumpQuestionCount.let { stationId } && stationId.isNotEmpty()) {
            config.stationJumpQuestionCount
        } else {
            config.chapterJumpQuestionCount
        }
}
