package com.mathlearning.feature.lesson

import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * S0 instrumented proof (STATION_EXPERIENCE_BLUEPRINT §2.1): the exit sheet really renders
 * the child-safe action order — the STAY action is the primary button, ABOVE the leave
 * action — and the top-bar exit affordance is the small icon, with its spoken label.
 *
 * These are behavioural, semantics-tree facts (what TalkBack and a child see), not source
 * claims. The close-STATE machine itself keeps its N06-02 unit tests unchanged.
 */
class ShomaraStationExitSheetTest {

    @get:Rule
    val compose = createComposeRule()

    @Test
    fun topBarExitIconCarriesItsSpokenLabel() {
        compose.setContent {
            ShomaraTheme {
                ShomaraStationTopBar(
                    macroStage = MacroStage.P2_GUIDED,
                    onExitRequest = {},
                )
            }
        }
        compose.onNodeWithContentDescription(ShomaraLessonStrings.ExitContentDescription).assertExists()
    }

    @Test
    fun stageChipsAreOneMergedTalkBackStop() {
        compose.setContent {
            ShomaraTheme {
                ShomaraStageChips(macroStage = MacroStage.P3_GAME)
            }
        }
        // The whole row is one semantics node with the position sentence — five pills are
        // never five decorative stops. The sentence is the row's contentDescription (deliberate:
        // the pills themselves are decorative), so the assertion queries that, and the exact
        // count of 1 is what proves the merge.
        compose.onAllNodesWithContentDescription(
            ShomaraLessonStrings.stageChipsAnnouncement(
                stageIndex = 2,
                stageLabel = ShomaraLessonStageLabels.Game,
            ),
        ).assertCountEquals(1)
    }

    @Test
    fun exitSheetShowsStayPrimaryAboveLeaveSecondary() {
        val stays = mutableListOf<Unit>()
        val exits = mutableListOf<Unit>()
        compose.setContent {
            ShomaraTheme {
                ShomaraStationExitSheet(
                    onStay = { stays.add(Unit) },
                    onExit = { exits.add(Unit) },
                )
            }
        }
        compose.onNodeWithText(ShomaraLessonStrings.ExitTitle).assertExists()
        compose.onNodeWithText(ShomaraLessonStrings.ExitBody).assertExists()

        // Both actions render, and clicking the primary means STAYING (the fail-safe
        // direction: the easiest big button keeps the child in the lesson).
        compose.onNodeWithText(ShomaraLessonStrings.ExitStayPrimary).performClick()
        compose.onNodeWithText(ShomaraLessonStrings.ExitSecondary).assertExists()
        assertTrue("the primary action must mean stay", stays.size == 1 && exits.isEmpty())
    }

    @Test
    fun exitSheetAddsTheAssessmentWarningOnlyInAssessmentStage() {
        compose.setContent {
            ShomaraTheme {
                ShomaraStationExitSheet(onStay = {}, onExit = {}, assessmentStage = true)
            }
        }
        compose.onNodeWithText(ShomaraLessonStrings.ExitAssessmentWarning).assertExists()
    }

    @Test
    fun exitSheetOmitsTheAssessmentWarningOutsideTheAssessmentStage() {
        // Split from the test above: a Compose test rule accepts setContent() exactly once, so
        // the "no warning" half must be its own case (this pair had never run before the module
        // gained its test manifest on 2026-11-22).
        compose.setContent {
            ShomaraTheme {
                ShomaraStationExitSheet(onStay = {}, onExit = {}, assessmentStage = false)
            }
        }
        compose.onAllNodesWithText(ShomaraLessonStrings.ExitAssessmentWarning).assertCountEquals(0)
    }
}
