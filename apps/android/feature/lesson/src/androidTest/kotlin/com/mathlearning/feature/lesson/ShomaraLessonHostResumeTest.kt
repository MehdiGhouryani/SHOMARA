package com.mathlearning.feature.lesson

import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import com.mathlearning.core.datastore.LessonCheckpoint
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.network.LessonGateway
import okhttp3.OkHttpClient
import org.junit.Rule
import org.junit.Test

/**
 * F-04 — the lesson host starts at the resumed stage, not P1 (Compose test; the journey
 * logic is covered by the JVM gate test, but only a rendered host proves the recovered
 * macro stage actually becomes the visible stage).
 *
 * The checkpoint is the real stored shape: session "local-session" is the host's default
 * session id, the encounter id follows the journey's own "enc-ST07-p3_game-1" format, and
 * the macro stage is the stored enum name "P3_GAME". The gateway never receives a call
 * during resume, so it is a real LessonGateway whose submit URL is unconfigured (null) —
 * no network, no MockWebServer (which lives only in the JVM test source set).
 *
 * NOTE: feature/lesson declares no androidTestImplementation for the Compose test
 * libraries yet (only :app and :core:designsystem do), so this file compiles only once
 * those dependencies are added to this module's build file.
 */
class ShomaraLessonHostResumeTest {

    @get:Rule
    val composeRule = createComposeRule()

    private class MemoryCheckpoints : LessonCheckpointStore {
        val map = mutableMapOf<String, LessonCheckpoint>()
        private fun k(s: String, st: String) = "$s|$st"
        override suspend fun save(checkpoint: LessonCheckpoint) { map[k(checkpoint.sessionId, checkpoint.stationId)] = checkpoint }
        override suspend fun read(sessionId: String, stationId: String): LessonCheckpoint? = map[k(sessionId, stationId)]
        override suspend fun clear(sessionId: String, stationId: String) { map.remove(k(sessionId, stationId)) }
    }

    @Test
    fun hostStartsAtTheResumedStageNotP1() {
        val store = MemoryCheckpoints()
        // Pre-seed the checkpoint directly (no coroutine needed): the host reads it in
        // its LaunchedEffect resume() on first composition.
        store.map["local-session|ST07"] = LessonCheckpoint(
            sessionId = "local-session",
            stationId = "ST07",
            encounterId = "enc-ST07-p3_game-1",
            macroStage = "P3_GAME",
            savedAtMs = 0L,
        )
        val gateway = LessonGateway(client = OkHttpClient(), submitUrl = { null })
        val st07Title = ShomaraStationCatalog.station("ST07").workingTitle

        composeRule.setContent {
            ShomaraLessonHost(
                stationId = "ST07",
                gateway = gateway,
                checkpointStore = store,
                onExitToShell = {},
            )
        }
        composeRule.waitForIdle()

        // The header names the P3 stage («بازی»), from the real stage labels — not P1 («کشف»).
        val p3Header = "ایستگاه ۷ — $st07Title — مرحلهٔ ${ShomaraLessonStageLabels.labelFor(MacroStage.P3_GAME)}"
        val p1Header = "ایستگاه ۷ — $st07Title — مرحلهٔ ${ShomaraLessonStageLabels.labelFor(MacroStage.P1_DISCOVER)}"
        composeRule.onNodeWithText(p3Header).assertIsDisplayed()
        composeRule.onAllNodesWithText(p1Header).assertCountEquals(0)
        // And the resume banner is shown for the stage that was actually resumed.
        composeRule.onNodeWithText("از همون‌جا ادامه می‌دهیم.").assertIsDisplayed()
    }
}
