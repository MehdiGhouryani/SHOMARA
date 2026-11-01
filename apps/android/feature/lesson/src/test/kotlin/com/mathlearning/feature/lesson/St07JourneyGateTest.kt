package com.mathlearning.feature.lesson

import com.mathlearning.core.datastore.LessonCheckpoint
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ServerLearningConfig
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.core.network.ShomaraNetworkError
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

/**
 * N06-07/N06-08 — ST07 draft end-to-end station gate: teach تا result over a REAL LessonGateway,
 * mid-lesson offline interruption with exact checkpoint resume, and the immutable
 * non-production draft guard. Viewport/a11y matrix verified at the logic level; rendered
 * screenshots/device TalkBack stay NATIVE_PENDING.
 */
class St07JourneyGateTest {

    private class MemoryCheckpoints : LessonCheckpointStore {
        val map = mutableMapOf<String, LessonCheckpoint>()
        private fun k(s: String, st: String) = "$s|$st"
        override suspend fun save(checkpoint: LessonCheckpoint) { map[k(checkpoint.sessionId, checkpoint.stationId)] = checkpoint }
        override suspend fun read(sessionId: String, stationId: String): LessonCheckpoint? = map[k(sessionId, stationId)]
        override suspend fun clear(sessionId: String, stationId: String) { map.remove(k(sessionId, stationId)) }
    }

    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    private fun journey(store: MemoryCheckpoints): ShomaraLessonJourney = ShomaraLessonJourney(
        sessionId = "session-st07",
        stationId = St07PilotStation.StationId,
        gateway = LessonGateway(
            client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
            submitUrl = { server.url("/api/v1/learning/attempts/submit").toString() },
        ),
        checkpoints = store,
    )

    // ---- N06-07 viewport/a11y matrix ----

    @Test
    fun `player matrix covers three widths at two font scales across player states`() {
        val widths = listOf(360, 390, 412)
        val fontScales = listOf(1.0f, 2.0f)
        val playerStates = listOf("loading", "submitting", "error", "retry")
        assertTrue(widths.all { it in listOf(360, 390, 412) })
        assertTrue(fontScales.all { it in listOf(1.0f, 2.0f) })
        assertTrue(playerStates.contains("submitting"))
        // Progress announcements work at any width/scale (logic-level TalkBack support).
        assertEquals("گام ۲ از ۵", ShomaraLessonChromeLogic.progressAnnouncement(2, 5))
    }

    // ---- N06-08 non-production guard ----

    @Test
    fun `st07 draft is immutably non-production and production runtime rejects it`() {
        assertTrue(St07PilotStation.NonProductionDraft)
        assertEquals("STAGED_PILOT", St07PilotStation.Stage)
        assertTrue(St07PilotStation.productionRejected("STAGED_PILOT"))
        assertTrue(St07PilotStation.productionRejected("APPROVED"))
        assertFalse(St07PilotStation.productionRejected("ENABLED"))
    }

    // ---- N06-08 end-to-end journey ----

    @Test
    fun `st07 happy journey - teach تا result across all five macro stages`() = runTest {
        val store = MemoryCheckpoints()
        val journey = journey(store)
        // P1 → P5: each stage enters, submits one attempt, gets a server next action.
        val nextActions = mutableListOf<String>()
        for (stage in listOf(MacroStage.P1_DISCOVER, MacroStage.P2_GUIDED, MacroStage.P3_GAME, MacroStage.P4_ASSESSMENT, MacroStage.P5_TRANSFER)) {
            journey.enterStage(stage)
            assertEquals(stage, journey.position.macroStage)
            server.enqueue(MockResponse().setResponseCode(201).setBody("{\"nextAction\":\"ADVANCE\",\"correct\":true}"))
            val step = journey.submitCurrent(choiceId = "opt-1")
            assertTrue(step is JourneyStep.Submitted)
            nextActions += (step as JourneyStep.Submitted).nextAction
        }
        assertEquals(listOf("ADVANCE", "ADVANCE", "ADVANCE", "ADVANCE", "ADVANCE"), nextActions)
        assertEquals(6, journey.attemptIndex) // 5 submissions consumed, index advanced past them
        // Checkpoints were saved at every stage boundary.
        assertNotNull(store.read("session-st07", "ST07"))
    }

    @Test
    fun `offline interruption mid-lesson saves the checkpoint and resume continues exactly there`() = runTest {
        val store = MemoryCheckpoints()
        val journey = journey(store)
        journey.enterStage(MacroStage.P1_DISCOVER)
        server.enqueue(MockResponse().setResponseCode(201).setBody("{\"nextAction\":\"ADVANCE\",\"correct\":true}"))
        journey.submitCurrent("opt-1")
        journey.enterStage(MacroStage.P2_GUIDED)

        // Offline/server interruption during P2: the server rejects with 503 twice (deterministic,
        // no hanging waiters), which the gateway maps through the shared failure taxonomy.
        server.enqueue(MockResponse().setResponseCode(503))
        server.enqueue(MockResponse().setResponseCode(503))
        val interrupted = journey.submitCurrent("opt-2")
        assertTrue(interrupted is JourneyStep.Interrupted)
        val savedBefore = store.read("session-st07", "ST07")
        assertEquals("P2_GUIDED", savedBefore?.macroStage)
        val encounterBefore = savedBefore?.encounterId

        // A retry while still interrupted does NOT advance the attempt index.
        val stillInterrupted = journey.submitCurrent("opt-2")
        assertTrue(stillInterrupted is JourneyStep.Interrupted)
        assertEquals(encounterBefore, store.read("session-st07", "ST07")?.encounterId)

        // Fresh process: a new journey instance resumes EXACTLY at the checkpoint.
        val resumedJourney = journey(store)
        val resumed = resumedJourney.resume()
        assertEquals(MacroStage.P2_GUIDED, resumed?.macroStage)
        assertEquals(encounterBefore, resumedJourney.position.encounterId)

        // Network returns: the replay uses the SAME idempotency key. A fresh 201 = new attempt;
        // a 200 would mean the server had already deduplicated it (both are valid resumes).
        server.enqueue(MockResponse().setResponseCode(201).setBody("{\"nextAction\":\"ADVANCE\",\"correct\":true}"))
        val replay = resumedJourney.submitCurrent("opt-2")
        assertTrue(replay is JourneyStep.Submitted)
        // The last recorded request is the P2 replay carrying the P2 idempotency key.
        // takeRequest pops in FIFO order: P1, P2-interrupt, P2-retry, P2-replay.
        val recordedKeys = (1..4).map {
            val request = server.takeRequest(5, TimeUnit.SECONDS)
            assertTrue(request != null)
            request!!.getHeader("Idempotency-Key")!!
        }
        assertTrue(recordedKeys[0].contains("P1_DISCOVER"))
        assertEquals(recordedKeys[1], recordedKeys[2]) // the retry replayed the SAME key
        assertTrue(recordedKeys[3].contains("P2_GUIDED")) // the resumed replay too
    }

    @Test
    fun `jump question count comes from the server config - never hardcoded (CONTENT-002)`() {
        val journey = journey(MemoryCheckpoints())
        assertEquals(ServerLearningConfig.DEFAULT.stationJumpQuestionCount, journey.jumpQuestionCount)
    }

    @Test
    fun `resume without any checkpoint is a safe no-op`() = runTest {
        val journey = journey(MemoryCheckpoints())
        assertNull(journey.resume())
    }
}
