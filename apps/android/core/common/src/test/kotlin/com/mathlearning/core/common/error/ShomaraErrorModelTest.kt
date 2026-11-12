package com.mathlearning.core.common.error

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ShomaraErrorModelTest {

    @Test
    fun `data errors inherit the retry decision of their canonical AppError cause`() {
        assertEquals(RetryDecision.backoff(), ShomaraRetryPolicy.decide(ShomaraError.Data(AppError.Offline)))
        assertEquals(RetryDecision.backoff(), ShomaraRetryPolicy.decide(ShomaraError.Data(AppError.Network(retryable = true))))
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(ShomaraError.Data(AppError.Network(retryable = false))))
    }

    @Test
    fun `session recovery and rule rejections are never auto-retried`() {
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(AppError.Unauthorized))
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(AppError.Validation("field")))
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(ShomaraError.Domain(ruleId = "station.locked")))
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(ShomaraError.Presentation(surfaceId = "path")))
        assertEquals(RetryDecision.NEVER, ShomaraRetryPolicy.decide(AppError.Unknown("i-1")))
    }

    @Test
    fun `the backoff decision mirrors the shipped OutboxSyncEngine policy numbers`() {
        val decision = ShomaraRetryPolicy.decide(ShomaraError.Data(AppError.Offline))
        assertEquals(RetryKind.BACKOFF, decision.kind)
        assertEquals(8, decision.maxAttempts)
        assertEquals(750L, decision.baseDelayMs)
        assertEquals(300_000L, decision.maxDelayMs)
    }

    @Test
    fun `layers and child-safe message keys stay stable`() {
        assertEquals(ErrorLayer.DOMAIN, ShomaraError.Domain("station.locked").layer)
        assertEquals(ErrorLayer.DATA, ShomaraError.Data(AppError.Offline).layer)
        assertEquals(ErrorLayer.PRESENTATION, ShomaraError.Presentation("lesson").layer)
        assertEquals(UserMessageKey.TRY_AGAIN, ShomaraError.Domain("station.locked").userMessageKey)
        assertEquals(UserMessageKey.OFFLINE, ShomaraError.Data(AppError.Offline).userMessageKey)
        assertEquals(UserMessageKey.UNEXPECTED, ShomaraError.Presentation("lesson").userMessageKey)
    }

    @Test
    fun `data errors surface the cause incident id and presentation errors mint a fresh one`() {
        val dataError = ShomaraError.Data(AppError.Unknown("incident-7"))
        assertEquals("incident-7", dataError.incidentId)

        val presentation = ShomaraError.Presentation("lesson")
        val incident: String = presentation.incidentId
        assertTrue(incident.isNotBlank())
        assertNotEquals(ShomaraError.Presentation("lesson").incidentId, incident)
    }

    @Test
    fun `error models carry identifiers only - no payload-like fields exist`() {
        val error = ShomaraError.Data(AppError.Offline, reportedIncidentId = "i-1")
        val forbidden = listOf("answer", "correct", "childName", "phone", "payload")
        forbidden.forEach { key ->
            assertTrue(
                "error model must not embed a $key-like field",
                error.toString().contains(key, ignoreCase = true).not(),
            )
        }
    }
}
