package com.mathlearning.feature.path

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraPagePlaceholder
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * B11 — jump-assessment shell (pilot §7): configurable question count, one attempt, no
 * mid-test feedback, no guide, no reward.
 *
 * The count is a parameter — neither hardcoded 1 nor 5: both are draft and in conflict (C9).
 * The final number and its effect on progression need CONTENT-002 + CONTENT-014 + O1.
 * Connecting [ShomaraJumpSheet] to a real caller needs CONTENT-002; this shell is the
 * structure that caller will drive.
 *
 * There is deliberately no correctness field here: feedback (if any) comes only after the
 * single attempt ends, from the evaluator — never mid-test, never from this shell.
 *
 * (Renamed from `ShomaraJumpTest`: a production data class must not be named `...Test`.
 * The file name stays `ShomaraJumpTest.kt` — snapshot push cannot delete/rename files —
 * and will be aligned when a delete-capable method exists.)
 */
data class ShomaraJumpAssessment(
    /** Configurable question count (not a hardcoded 1 or 5). */
    val questionCount: Int,
    val answeredCount: Int = 0,
    val finished: Boolean = false,
) {
    init {
        require(questionCount > 0) { "jump test needs at least one question" }
        require(answeredCount in 0..questionCount) { "answered count outside the test" }
        require(!finished || answeredCount == questionCount) { "a finished test answered every question" }
    }

    /** Exactly one attempt for the whole test — a second attempt is refused, not retried. */
    val attemptsLeft: Int
        get() = if (finished) 0 else 1

    /** Answers one question. The test ends with the single attempt; no feedback is produced. */
    fun answer(): ShomaraJumpAssessment {
        require(!finished) { "jump test already finished — one attempt only" }
        val answered = answeredCount + 1
        return copy(answeredCount = answered, finished = answered == questionCount)
    }

    /** «سؤال N از M» — the one progress line, from counts only (same pattern as the path). */
    fun progressLine(): String {
        val current = if (finished) questionCount else answeredCount + 1
        return "سؤال ${ShomaraDigits.toFa(current)} از ${ShomaraDigits.toFa(questionCount)}"
    }
}

/**
 * The shell surface: the question slots (empty placeholders — no questions exist yet) and
 * the count line. No feedback, no guide character and no reward motif are rendered at any
 * point of the test.
 */
@Composable
fun ShomaraJumpAssessmentShell(
    test: ShomaraJumpAssessment,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Text(
            text = test.progressLine(),
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk,
        )
        // Static page shape, not content: the questions arrive with the package (O2).
        ShomaraPagePlaceholder()
    }
}
