package com.mathlearning.feature.lesson

import com.mathlearning.core.model.AttemptTelemetry
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ServerLearningConfig

/**
 * N06-10 pilot template adapters. Each adapter is a pure state machine (JVM-tested) plus a thin
 * renderer; every submission leaves as a minimal server-only telemetry payload (CONTENT-018).
 */

/** Shared manipulative sizing rule: the 72–80dp child band from the canonical catalog. */
object ShomaraManipulativeRules {
    const val MinDp: Int = 72
    const val MaxDp: Int = 80

    fun requireBand(sizeDp: Int) {
        require(sizeDp in MinDp..MaxDp) { "manipulative size $sizeDp outside the 72-80dp band" }
    }
}

// ---------------------------------------------------------------------------
// T01 — Count / Subitize & Select
// ---------------------------------------------------------------------------

enum class T01State { Ready, Counting, Selected, Submitted }

data class T01CountAdapter(
    val config: ServerLearningConfig = ServerLearningConfig.DEFAULT,
    val sessionId: String,
    val encounterId: String,
    val taughtNumerals: Set<Int>,
    val objectCount: Int,
    val chosenNumeral: Int? = null,
    val state: T01State = T01State.Ready,
    val tappedObjectOrdinals: Set<Int> = emptySet(),
) {
    init {
        require(taughtNumerals.isNotEmpty()) { "a station always has a taught-numeral ceiling" }
        require(objectCount in 1..20) { "countable objects out of range" }
        // The taught-numeral guard: numerals beyond the ceiling must never be DISPLAYED or offered.
        chosenNumeral?.let { requireNumeralAllowed(it) }
    }

    /** CONTENT-001 adjacent guard: never show a numeral the curriculum hasn't taught yet. */
    fun requireNumeralAllowed(numeral: Int) {
        require(numeral in taughtNumerals) {
            "numeral $numeral exceeds the taught-numeral ceiling ${taughtNumerals.max()}"
        }
    }

    fun objectSizeDp(): Int = config.let { 72 } // canonical manipulative band floor

    /** Tap-to-count: each tap counts exactly one object (no double count). */
    fun tapObject(ordinal: Int): T01CountAdapter {
        require(ordinal in 1..objectCount) { "object ordinal out of range" }
        return copy(state = T01State.Counting, tappedObjectOrdinals = tappedObjectOrdinals + ordinal)
    }

    fun countedSoFar(): Int = tappedObjectOrdinals.size

    /** Select a numeral answer — the guard rejects anything beyond taughtNumerals. */
    fun selectNumeral(numeral: Int): T01CountAdapter {
        requireNumeralAllowed(numeral)
        return copy(state = T01State.Selected, chosenNumeral = numeral)
    }

    fun startSubmit(): Pair<T01CountAdapter, AttemptTelemetry> {
        require(state == T01State.Selected && chosenNumeral != null) { "submit requires a numeral selection" }
        val telemetry = AttemptTelemetry(
            sessionId = sessionId,
            encounterId = encounterId,
            interactionId = "T01_SELECT",
            choiceId = "numeral-$chosenNumeral",
            macroStage = MacroStage.P3_GAME,
        )
        return copy(state = T01State.Submitted) to telemetry
    }
}

// ---------------------------------------------------------------------------
// T05 — Compare / Pattern / Grouping (drag with 100% tap alternative)
// ---------------------------------------------------------------------------

data class T05SlotAdapter(
    val slotIds: List<String>,
    val draggableIds: List<String>,
    val occupied: Map<String, String> = emptyMap(), // slotId -> draggableId
    val selectedDraggableId: String? = null,
    val state: String = "idle", // idle/selected/placing/submitted
) {
    init {
        require(slotIds.isNotEmpty() && draggableIds.isNotEmpty()) { "T05 needs slots and draggables" }
    }

    /** Drag path: place directly. */
    fun dragPlace(draggableId: String, slotId: String): T05SlotAdapter {
        require(draggableId in draggableIds) { "unknown draggable" }
        require(slotId in slotIds) { "unknown slot" }
        return copy(occupied = occupied + (slotId to draggableId), selectedDraggableId = null, state = "submitted")
    }

    /** Tap path (100% equivalent): tap draggable to select, then tap slot to place. */
    fun tapSelect(draggableId: String): T05SlotAdapter {
        require(draggableId in draggableIds) { "unknown draggable" }
        return copy(selectedDraggableId = draggableId, state = "selected")
    }

    fun tapPlace(slotId: String): T05SlotAdapter {
        require(slotId in slotIds) { "unknown slot" }
        val selected = selectedDraggableId ?: return this
        return dragPlace(selected, slotId)
    }

    /** The two paths converge on the exact same end state. */
    fun sameOutcomeAs(other: T05SlotAdapter): Boolean = occupied == other.occupied
}

// ---------------------------------------------------------------------------
// T13 — Numeral Trace / Formation (CONTENT-001: top-to-bottom stroke for ۱)
// ---------------------------------------------------------------------------

enum class T13Point { Top, Middle, Bottom }

data class T13TraceAdapter(
    val config: ServerLearningConfig = ServerLearningConfig.DEFAULT,
    val numeral: Int = 1,
    val visitedCheckpoints: Set<T13Point> = emptySet(),
    val tapFallbackUsed: Boolean = false,
    val state: String = "ready", // ready/tracing/completed
) {
    init {
        require(numeral == 1) { "ST07 pilot traces numeral ۱ only" }
    }

    /** CONTENT-001 canonical textbook stroke: strictly top → middle → bottom. */
    val canonicalStrokeOrder: List<T13Point> = listOf(T13Point.Top, T13Point.Middle, T13Point.Bottom)

    val traceToleranceDp: Int
        get() = config.traceToleranceDp

    fun trace(point: T13Point, dragDp: Int): T13TraceAdapter {
        // Inside tolerance the drag maps onto the nearest checkpoint of the canonical stroke.
        require(dragDp <= config.traceToleranceDp) { "drag beyond tolerance; use the guided fallback" }
        val next = canonicalStrokeOrder.firstOrNull { it !in visitedCheckpoints } ?: return this
        return if (point == next) copy(visitedCheckpoints = visitedCheckpoints + point, state = "tracing") else this
    }

    /** Tap-checkpoint fallback: full TalkBack/motor-accessible alternative, same completion. */
    fun tapCheckpoint(point: T13Point): T13TraceAdapter {
        val next = canonicalStrokeOrder.firstOrNull { it !in visitedCheckpoints } ?: return this
        return if (point == next) {
            copy(visitedCheckpoints = visitedCheckpoints + point, tapFallbackUsed = true, state = "tracing")
        } else this
    }

    val completed: Boolean
        get() = visitedCheckpoints.containsAll(canonicalStrokeOrder)

    /** Either path (drag-trace or tap-checkpoints) reaches the identical completed state. */
    fun sameCompletionAs(other: T13TraceAdapter): Boolean = completed == other.completed && visitedCheckpoints == other.visitedCheckpoints
}

// ---------------------------------------------------------------------------
// T15 — Story / Synthesis / Multi-step Transfer
// ---------------------------------------------------------------------------

data class T15StoryAdapter(
    val steps: List<Int>,
    val currentStep: Int = 0,
    val audioAvailable: Boolean = false,
    val state: String = "ready", // ready/listening/answered/done
) {
    init {
        require(steps.isNotEmpty()) { "story needs steps" }
        require(currentStep in steps.indices) { "current step out of range" }
    }

    /** CONTENT-017: audio missing/offline NEVER blocks — the visible prompt carries the step. */
    val blockedByAudio: Boolean
        get() = false

    fun visiblePromptFallback(fallbackText: String): String =
        if (audioAvailable) "" else fallbackText

    fun answer(choiceId: String): T15StoryAdapter = copy(state = "answered")

    fun advance(): T15StoryAdapter = copy(currentStep = (currentStep + 1).coerceAtMost(steps.lastIndex), state = "ready")

    /** Server-only submission: minimal IDs, one telemetry per step. */
    fun telemetryFor(sessionId: String, encounterId: String, choiceId: String?): AttemptTelemetry =
        AttemptTelemetry(sessionId, encounterId, "T15_STEP_${steps[currentStep]}", choiceId, MacroStage.P5_TRANSFER)
}
