package com.mathlearning.feature.lesson

/**
 * B3 + الف-۰۶ — explicit lesson-item UI state machine, separate from the evaluator.
 *
 * The cycle is stage5 §6.2: INTRO → PROMPT → INTERACT → CHECK → FEEDBACK → (RETRY | NEXT)
 * → ROUND_END. This machine is the UI's state only: it never decides correct/incorrect.
 *
 * CHECK is explicitly the «awaiting the evaluator» state — the machine parks there and the
 * host shows the existing «منتظر تأیید سرور هستیم» banner. Judgement lives only in the local
 * evaluator (O1, ADR-0039); until the evaluator exists, CHECK never resolves to a verdict.
 *
 * PROMPT always offers the «listen again» action (the host owns the audio control); INTERACT
 * records an early touch without cutting audio (there is no audio state in this machine at
 * all, so a touch cannot cut what the machine does not own).
 */
enum class ShomaraLessonItemState {
    Intro,
    Prompt,
    Interact,
    /** Awaiting the evaluator — never a verdict by itself. */
    Check,
    Feedback,
    Retry,
    Next,
    RoundEnd,
}

data class ShomaraLessonItemMachine(
    val state: ShomaraLessonItemState = ShomaraLessonItemState.Intro,
    val hasSelection: Boolean = false,
    val attemptCount: Int = 0,
) {
    /** True only while parked in CHECK — the host renders the evaluator-wait banner. */
    val isAwaitingEvaluator: Boolean
        get() = state == ShomaraLessonItemState.Check

    fun toPrompt(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Intro) { "PROMPT follows INTRO only" }
        return copy(state = ShomaraLessonItemState.Prompt)
    }

    fun toInteract(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Prompt) { "INTERACT follows PROMPT only" }
        return copy(state = ShomaraLessonItemState.Interact)
    }

    /** An early touch is recorded as a selection; it never cuts audio and never submits. */
    fun select(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Interact) { "select needs INTERACT" }
        return copy(hasSelection = true)
    }

    /**
     * CHECK requires a selection: checking with nothing chosen would submit an answer the
     * child never gave (the old «opt-1» defect). The machine parks in CHECK; the evaluator
     * resolves it — this function never does.
     */
    fun check(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Interact) { "CHECK follows INTERACT only" }
        require(hasSelection) { "CHECK requires a selection" }
        return copy(state = ShomaraLessonItemState.Check)
    }

    /** The evaluator's verdict arrives from outside; the machine only renders it. */
    fun toFeedback(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Check) { "FEEDBACK follows CHECK only" }
        return copy(state = ShomaraLessonItemState.Feedback)
    }

    fun retry(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Feedback) { "RETRY follows FEEDBACK only" }
        return copy(state = ShomaraLessonItemState.Interact, hasSelection = false, attemptCount = attemptCount + 1)
    }

    fun next(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Feedback) { "NEXT follows FEEDBACK only" }
        return copy(state = ShomaraLessonItemState.Next, hasSelection = false)
    }

    fun endRound(): ShomaraLessonItemMachine {
        require(state == ShomaraLessonItemState.Next) { "ROUND_END follows NEXT only" }
        return copy(state = ShomaraLessonItemState.RoundEnd)
    }
}
