package com.mathlearning.feature.lesson

import com.mathlearning.core.network.AttemptSubmission
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.core.network.LessonSubmitResult
import com.mathlearning.core.network.ShomaraNetworkError
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit

/** N06-04/05/06: idempotent single-submit, server-owned next actions, challenge isolation. */
class AssessmentGatewayTest {

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

    private fun gateway(): LessonGateway = LessonGateway(
        client = OkHttpClient.Builder().readTimeout(1, TimeUnit.SECONDS).build(),
        submitUrl = { server.url("/api/v1/learning/attempts/submit").toString() },
    )

    @Test
    fun `idempotency key is deterministic per session encounter attempt`() {
        val a = AttemptSubmission("s1", "e1", 2, "P4_ASSESSMENT_SELECT", "opt-1")
        val b = AttemptSubmission("s1", "e1", 2, "P4_ASSESSMENT_SELECT", "opt-1")
        val retriedDifferentChoice = AttemptSubmission("s1", "e1", 2, "P4_ASSESSMENT_SELECT", "opt-2")
        assertEquals(a.idempotencyKey(), b.idempotencyKey())
        assertEquals(a.idempotencyKey(), retriedDifferentChoice.idempotencyKey()) // same attempt slot
        assertFalse(
            a.idempotencyKey() == AttemptSubmission("s1", "e1", 3, "P4_ASSESSMENT_SELECT", "opt-1").idempotencyKey(),
        )
    }

    @Test
    fun `payload carries only minimal ids - never answers or correctness`() {
        val payload = AttemptSubmission("s1", "e1", 1, "P4_ASSESSMENT_SELECT", "opt-1").minimalPayload()
        for (banned in listOf("answer", "correct", "evaluator", "pass_threshold", "name")) {
            assertFalse(payload.contains(banned))
        }
        assertTrue(payload.contains("\"choiceId\":\"opt-1\""))
    }

    @Test
    fun `accepted submit parses the server next action verbatim`() = runTest {
        server.enqueue(MockResponse().setResponseCode(201).setBody("{\"nextAction\":\"RECOVER_GUIDED\",\"correct\":false}"))
        val result = gateway().submit(AttemptSubmission("s1", "e1", 1, "P4_ASSESSMENT_SELECT", "opt-9"))
        assertTrue(result is LessonSubmitResult.Accepted)
        assertEquals("RECOVER_GUIDED", (result as LessonSubmitResult.Accepted).nextAction)
        assertEquals(false, result.correct)
    }

    @Test
    fun `http 200 replay maps to Duplicate - the server deduplicated our retry`() = runTest {
        server.enqueue(MockResponse().setResponseCode(200).setBody("{\"nextAction\":\"ADVANCE\",\"correct\":true}"))
        val result = gateway().submit(AttemptSubmission("s1", "e1", 1, "P4_ASSESSMENT_SELECT", "opt-1"))
        assertTrue(result is LessonSubmitResult.Duplicate)
        assertEquals("ADVANCE", (result as LessonSubmitResult.Duplicate).nextAction)
    }

    @Test
    fun `offline and timeout map through the shared taxonomy`() = runTest {
        val refused = LessonGateway(
            client = OkHttpClient.Builder().connectTimeout(1, TimeUnit.SECONDS).build(),
            submitUrl = { "http://127.0.0.1:1/submit" },
        )
        val offline = refused.submit(AttemptSubmission("s1", "e1", 1, "i", null))
        assertTrue(offline is LessonSubmitResult.Failed)
        assertEquals(ShomaraNetworkError.Offline, (offline as LessonSubmitResult.Failed).failure.error)
        server.enqueue(MockResponse().setSocketPolicy(okhttp3.mockwebserver.SocketPolicy.NO_RESPONSE))
        val timeout = gateway().submit(AttemptSubmission("s1", "e1", 1, "i", null))
        assertEquals(ShomaraNetworkError.Timeout, (timeout as LessonSubmitResult.Failed).failure.error)
    }

    @Test
    fun `unconfigured endpoint fails closed with zero network calls`() = runTest {
        val gateway = LessonGateway(client = OkHttpClient(), submitUrl = { null })
        val result = gateway.submit(AttemptSubmission("s1", "e1", 1, "i", null))
        assertTrue(result is LessonSubmitResult.Failed)
        assertEquals(0, server.requestCount)
    }

    // ---- assessment session ----

    @Test
    fun `assessment duplicate tap while submitting is structurally blocked`() {
        var session = ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1")
        session = session.select("opt-1").startSubmit()
        assertEquals(ShomaraAssessmentState.Submitting, session.state)
        // A second tap cannot re-enter selection while submitting; submit stays locked.
        val untouched = session.select("opt-2")
        assertEquals(ShomaraAssessmentState.Submitting, untouched.state)
        assertEquals("opt-1", untouched.selectedOptionId)
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { untouched.startSubmit() }
    }

    @Test
    fun `assessment disconnect keeps the attempt index and resume replays the same key`() {
        var session = ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1", attemptIndex = 2)
        session = session.select("opt-1").startSubmit().onDisconnect()
        assertEquals(ShomaraAssessmentState.Disconnect, session.state)
        val resumed = session.resumeForRetry()
        assertEquals(ShomaraAssessmentState.Resume, resumed.state)
        assertEquals(2, resumed.attemptIndex)
        assertEquals(
            AttemptSubmission("s1", "e1", 2, "P4_ASSESSMENT_SELECT", "opt-1").idempotencyKey(),
            AttemptSubmission(resumed.sessionId, resumed.encounterId, resumed.attemptIndex, resumed.telemetry.interactionId, resumed.selectedOptionId).idempotencyKey(),
        )
    }

    @Test
    fun `assessment is P4-P5 only - zero hints by construction`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1", macroStage = com.mathlearning.core.model.MacroStage.P2_GUIDED)
        }
        assertTrue(ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1").zeroHints)
        assertTrue(ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1").telemetry.choiceId == null)
    }

    @Test
    fun `expired state ends the assessment without shaming`() {
        val expired = ShomaraAssessmentSession(sessionId = "s1", encounterId = "e1").onExpired()
        assertEquals(ShomaraAssessmentState.Expired, expired.state)
    }

    // ---- result surface (server-owned) ----

    @Test
    fun `next action maps server-verbatim and unknown actions never guess`() {
        assertEquals(ShomaraResultSurface.Advance, ShomaraResultLogic.surfaceFor("ADVANCE"))
        assertEquals(ShomaraResultSurface.Retry, ShomaraResultLogic.surfaceFor("RETRY"))
        assertEquals(ShomaraResultSurface.RecoverGuided, ShomaraResultLogic.surfaceFor("RECOVER_GUIDED"))
        assertEquals(ShomaraResultSurface.CompletePass, ShomaraResultLogic.surfaceFor("COMPLETE_PASS"))
        assertEquals(ShomaraResultSurface.CompleteNeedsPractice, ShomaraResultLogic.surfaceFor("COMPLETE_NEEDS_PRACTICE"))
        assertEquals(ShomaraResultSurface.Unknown, ShomaraResultLogic.surfaceFor("SOMETHING_ELSE"))
        assertFalse(ShomaraResultLogic.isServerKnown("SOMETHING_ELSE"))
    }

    @Test
    fun `wrong-answer copy is warm and never shaming`() {
        val retry = ShomaraResultLogic.headlineFor(ShomaraResultSurface.Retry)
        val recover = ShomaraResultLogic.headlineFor(ShomaraResultSurface.RecoverGuided)
        val needsPractice = ShomaraResultLogic.headlineFor(ShomaraResultSurface.CompleteNeedsPractice)
        for (text in listOf(retry, recover, needsPractice)) {
            for (banned in listOf("اشتباه", "باختی", "تنبیه", "بد")) {
                assertFalse(text.contains(banned))
            }
        }
        assertTrue(needsPractice.contains("محکم‌تر"))
    }

    // ---- challenge isolation ----

    @Test
    fun `challenge is strictly separate from station mastery`() {
        var challenge = ShomaraChallengeSession()
        assertTrue(challenge.affectsStationMastery == false)
        challenge = challenge.startIntro(totalRounds = 3).startRound(30_000).submit().onRoundResult()
        assertEquals(ShomaraChallengeState.Result, challenge.state)
        assertFalse(challenge.affectsStationMastery)
        // No unlock/complete API exists on the challenge type at all.
        val members = challenge.javaClass.methods.map { it.name }
        assertFalse(members.any { it.contains("unlock", ignoreCase = true) || it.contains("completeStation") })
    }

    @Test
    fun `challenge timer is non-punitive and respects reduced motion`() {
        val animated = ShomaraChallengeSession(reducedMotion = false).startIntro(2).startRound(10_000)
        assertTrue(animated.timerVisible)
        assertEquals(1, animated.round)
        val reduced = animated.copy(reducedMotion = true)
        assertFalse(reduced.timerVisible)
        val expired = animated.onTimerExpire()
        assertEquals(ShomaraChallengeState.Result, expired.state)
        assertEquals(0L, expired.remainingMs)
    }

    @Test
    fun `challenge offline and round cap behave`() {
        val challenge = ShomaraChallengeSession().startIntro(1).startRound(5_000).goOffline()
        assertEquals(ShomaraChallengeState.Offline, challenge.state)
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraChallengeSession().startIntro(0)
        }
    }
}
