package com.mathlearning.app.ui

import androidx.compose.ui.test.assertDoesNotExist
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import com.mathlearning.app.shell.ShomaraChildShell
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.feature.path.ShomaraStationStartLogic
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * F-01 — the station-start sheet is the one door into a lesson (Compose test; navigation +
 * sheet behaviour cannot be proven by a JVM logic test). The shell owns the sheet: a node tap
 * opens it, only its «شروع/ادامه» CTA navigates, and a locked node opens the Locked sheet
 * and never navigates.
 *
 * Progress comes from the real catalog (no invented values): ST07 is the current station
 * when ST01..ST06 are complete, and locked when only ST01/ST02 are complete with ST03
 * current — the same progress the JVM station-start matrix already uses.
 *
 * Note: the shell's NavController is internal, so the «route stays shell/path» half is
 * asserted through its observables — the path node is still present and no lesson header
 * exists after the tap — and the «goes to lesson/ST07» half through the onStartStation
 * callback, which ShomaraApp maps verbatim to navigate("lesson/$stationId").
 */
class ShomaraStationSheetTest {

    @get:Rule
    val composeRule = createComposeRule()

    private class FakeSettingsStore : ShomaraSettingsStore {
        override val state: Flow<ShomaraSettingsSnapshot> =
            MutableStateFlow(ShomaraSettingsSnapshot.Defaults)

        override suspend fun save(snapshot: ShomaraSettingsSnapshot) {}
    }

    private val st07Title: String = ShomaraStationCatalog.station("ST07").workingTitle

    private fun setShell(
        progress: ShomaraPathProgress,
        started: MutableList<String>,
        replayed: MutableList<String> = mutableListOf(),
        initialStationId: String? = null,
        consumed: MutableList<String> = mutableListOf(),
    ) {
        composeRule.setContent {
            ShomaraChildShell(
                onSignOut = {},
                pathProgress = progress,
                settingsStore = FakeSettingsStore(),
                onStartStation = { started += it },
                onReplayStation = { replayed += it },
                initialStationId = initialStationId,
                onInitialStationConsumed = { consumed += initialStationId.orEmpty() },
            )
        }
    }

    @Test
    fun stationTapOpensTheStartSheetAndOnlyItsCtaNavigates() {
        val started = mutableListOf<String>()
        val readyProgress = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02", "ST03", "ST04", "ST05", "ST06"),
            currentStationId = "ST07",
        )
        setShell(readyProgress, started)

        composeRule.onNodeWithContentDescription(st07Title).performScrollTo().performClick()
        composeRule.waitForIdle()

        // The sheet opened — and the tap alone navigated nowhere.
        composeRule.onNodeWithText("شروع").assertIsDisplayed()
        composeRule.runOnIdle { assertTrue(started.isEmpty()) }
        // The path is still the live surface: the node is present and no lesson header exists.
        composeRule.onNodeWithContentDescription(st07Title).assertExists()
        composeRule.onNodeWithText("ایستگاه ۷ — $st07Title — مرحلهٔ کشف").assertDoesNotExist()

        // Only the sheet CTA navigates to the lesson.
        composeRule.onNodeWithText("شروع").performClick()
        composeRule.runOnIdle { assertEquals(listOf("ST07"), started) }
    }

    @Test
    fun lockedNodeTapOpensTheLockedSheetAndNeverNavigates() {
        val started = mutableListOf<String>()
        val lockedProgress = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02"),
            currentStationId = "ST03",
        )
        setShell(lockedProgress, started)

        composeRule.onNodeWithContentDescription(st07Title).performScrollTo().performClick()
        composeRule.waitForIdle()

        // The Locked sheet opens with the locked explanation — and the tap navigated nowhere.
        composeRule.onNodeWithText(ShomaraStationStartLogic.lockedExplanation()).assertIsDisplayed()
        composeRule.onNodeWithText("متوجه شدم").assertIsDisplayed()
        composeRule.runOnIdle { assertTrue(started.isEmpty()) }
        composeRule.onNodeWithText("ایستگاه ۷ — $st07Title — مرحلهٔ کشف").assertDoesNotExist()

        // Dismissing the Locked sheet still navigates nowhere.
        composeRule.onNodeWithText("متوجه شدم").performClick()
        composeRule.waitForIdle()
        composeRule.runOnIdle { assertTrue(started.isEmpty()) }
        composeRule.onNodeWithText(ShomaraStationStartLogic.lockedExplanation()).assertDoesNotExist()
    }

    // ---- R-05: the shell opens the sheet for a deep-linked station ----

    @Test
    fun initialStationIdOpensTheStartSheetWithoutATap() {
        val started = mutableListOf<String>()
        val consumed = mutableListOf<String>()
        val readyProgress = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02", "ST03", "ST04", "ST05", "ST06"),
            currentStationId = "ST07",
        )
        setShell(readyProgress, started, initialStationId = "ST07", consumed = consumed)

        // The sheet opened on its own — the deep link routes through the sheet, and the
        // station id was consumed exactly once.
        composeRule.onNodeWithText("شروع").assertIsDisplayed()
        composeRule.runOnIdle {
            assertTrue(started.isEmpty())
            assertEquals(listOf("ST07"), consumed)
        }
        // The CTA still navigates the same way a tapped sheet does.
        composeRule.onNodeWithText("شروع").performClick()
        composeRule.runOnIdle { assertEquals(listOf("ST07"), started) }
    }

    // ---- R-08: a completed station replays, it does not resume ----

    @Test
    fun completedNodeTapOpensTheReplaySheetAndItsCtaReplaysNotStarts() {
        val started = mutableListOf<String>()
        val replayed = mutableListOf<String>()
        val progress = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02", "ST03", "ST04", "ST05", "ST06"),
            currentStationId = "ST07",
        )
        setShell(progress, started, replayed = replayed)

        val st01Title: String = ShomaraStationCatalog.station("ST01").workingTitle
        composeRule.onNodeWithContentDescription(st01Title).performScrollTo().performClick()
        composeRule.waitForIdle()

        // The completed station's sheet offers «تمرین دوباره» — the node's own words —
        // and the tap alone navigated nowhere.
        composeRule.onNodeWithText("تمرین دوباره").assertIsDisplayed()
        composeRule.runOnIdle { assertTrue(started.isEmpty()) }

        // The replay CTA calls onReplayStation, never onStartStation: the host must restart
        // the lesson from P1 (clearing the checkpoint) instead of resuming it.
        composeRule.onNodeWithText("تمرین دوباره").performClick()
        composeRule.runOnIdle {
            assertEquals(listOf("ST01"), replayed)
            assertTrue(started.isEmpty())
        }
    }
}
