// SPDX-License-Identifier: Apache-2.0
package com.mathlearning.app.ui

import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import com.mathlearning.feature.path.ShomaraJumpAssessment
import com.mathlearning.feature.path.ShomaraJumpAssessmentShell
import org.junit.Rule
import org.junit.Test

/**
 * R-19 — the jump-assessment shell composable exists and renders only what B11 allows:
 * the progress line («سؤال ۱ از N») and the empty question-slot placeholder. It renders
 * NO feedback, NO guide character and NO reward motif at any point — the questions
 * themselves arrive with the content package (O2), and the shell still has no caller:
 * wiring it in waits on CONTENT-002 (the jump question set), so this test proves the
 * surface, not the entry.
 */
class ShomaraJumpAssessmentShellTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun jumpShellShowsOnlyTheProgressLineAndTheEmptySlots() {
        composeRule.setContent {
            ShomaraJumpAssessmentShell(test = ShomaraJumpAssessment(questionCount = 3))
        }

        composeRule.onNodeWithText("سؤال ۱ از ۳").assertIsDisplayed()
    }

    @Test
    fun jumpShellRendersNoFeedbackGuideOrReward() {
        composeRule.setContent {
            ShomaraJumpAssessmentShell(test = ShomaraJumpAssessment(questionCount = 3))
        }

        // None of the forbidden surfaces may appear — no feedback text, no guide, no reward.
        composeRule.onAllNodesWithText("آفرین!").assertCountEquals(0)
        composeRule.onAllNodesWithText("دوباره تلاش کن").assertCountEquals(0)
        composeRule.onAllNodesWithText("راهنما").assertCountEquals(0)
        composeRule.onAllNodesWithText("جایزه").assertCountEquals(0)
        composeRule.onAllNodesWithText("ستاره").assertCountEquals(0)
    }

    @Test
    fun jumpShellProgressLineAdvancesWithAnsweredCount() {
        val answered = ShomaraJumpAssessment(questionCount = 3)
            .answer()
            .answer()
        composeRule.setContent {
            ShomaraJumpAssessmentShell(test = answered)
        }

        composeRule.onNodeWithText("سؤال ۳ از ۳").assertIsDisplayed()
    }
}
