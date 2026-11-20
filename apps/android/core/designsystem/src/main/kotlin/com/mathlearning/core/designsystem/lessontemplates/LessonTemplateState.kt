package com.mathlearning.core.designsystem.lessontemplates

import com.mathlearning.core.designsystem.ShomaraMotionLogic
import com.mathlearning.core.designsystem.ShomaraTokens

/**
 * S2 · STATION_BUILD_PHASES S2 / STATION_EXPERIENCE_BLUEPRINT §5 — the shared lesson-template
 * state contract and the `countPulse` narrative moment.
 *
 * Every lesson template (T01…) renders with ONE state object and ONE callbacks object
 * (blueprint §5 signature). The states are the mandatory set from stage5 §6.2: idle, active,
 * correct, retry, and the hint ladder h1–h3 — the same facts the feature:lesson item machine
 * already walks; the template only RENDERS them, it never judges (ADR-0039 boundary: answers
 * and verdicts stay in the evaluator layer; the template receives an already-made verdict).
 */
sealed interface LessonTemplateState {
    /** Waiting for the child's first interaction. */
    data object Idle : LessonTemplateState

    /** The child is working (tapping, counting, building). */
    data object Active : LessonTemplateState

    /** The evaluator said correct — the ok moment, not a UI judgement. */
    data object Correct : LessonTemplateState

    /** The evaluator said try again — the warm retry moment, never blame. */
    data object Retry : LessonTemplateState

    /** A ladder hint is showing (level 1..3, per stage5 hint tables). */
    data class Hint(val level: Int) : LessonTemplateState
}

/** Which hint level a template should render (1..3); anything else means none. */
fun LessonTemplateState.hintLevelOrNull(): Int? = when (this) {
    is LessonTemplateState.Hint -> level.takeIf { it in 1..3 }
    else -> null
}

/**
 * §4.1 `countPulse` — "this was counted": a ring around the object plus the count bubble,
 * 400ms base; reduced motion keeps a STATIC ring for 600ms (movement removed, information
 * kept). Token-driven; no raw ms in call sites.
 */
object ShomaraCountPulseLogic {
    fun pulseMs(reducedMotion: Boolean): Int = ShomaraMotionLogic.durationMs(400, reducedMotion)

    /** Reduced-motion fallback: the ring stays visible (static) for this long. */
    fun staticRingMs(reducedMotion: Boolean): Int = if (reducedMotion) 600 else pulseMs(reducedMotion)

    /** The ring is informational in both modes; only the ANIMATION differs. */
    fun showsRing(reducedMotion: Boolean): Boolean = true
}

/** The §5 manipulative floor is the canonical child band (72–80dp) — one rule for all templates. */
object LessonTemplateSizing {
    const val MinManipulativeDp: Int = 72
    const val MaxManipulativeDp: Int = 80
    const val FingerTargetDp: Int = 56
    const val TallyRowMinHeightDp: Int = 40

    fun requireManipulativeDp(dp: Int) {
        require(dp in MinManipulativeDp..MaxManipulativeDp) {
            "manipulative $dp outside the 72-80dp band"
        }
    }

    /**
     * The cell size of a square grid with [cells] per side. ONE rule for every grid template
     * (T07 symmetry, T08 magic square), derived from the token scale so a 9×9 still fits a
     * 360dp phone — the two templates used to carry private copies of this function.
     */
    fun cellDp(cells: Int): androidx.compose.ui.unit.Dp = when {
        cells <= 4 -> ShomaraTokens.Space40
        cells <= 6 -> ShomaraTokens.Space32
        else -> ShomaraTokens.Space24
    }
}
