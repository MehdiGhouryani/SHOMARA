package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S4 · STATION_BUILD_PHASES.md «صدا و سرنخ» — pure proof for the narration queue, the hint
 * stage gate, replay and the silent-station policy. No device, no player.
 */
class ShomaraAudioHintS4Test {

    // ------------------------------------------------------------------ audio queue

    @Test
    fun `the first request starts speaking at once`() {
        val queue = ShomaraAudioQueue().request("q.stage2", nowMs = 1_000)
        assertEquals("q.stage2", queue.speaking?.utteranceKey)
        assertEquals(1_000L, queue.speaking?.startedAtMs)
        assertNull(queue.pending)
    }

    @Test
    fun `a request after the 450ms floor cuts the current narration immediately`() {
        val speaking = ShomaraAudioQueue().request("q.old", nowMs = 0)
        val cut = speaking.request("q.new", nowMs = 450)
        assertEquals("q.new", cut.speaking?.utteranceKey)
        assertEquals(450L, cut.speaking?.startedAtMs)
        assertNull(cut.pending)
        assertNull(cut.cutAtMs)
    }

    @Test
    fun `a request inside the floor schedules the cut at exactly 450ms`() {
        val speaking = ShomaraAudioQueue().request("q.old", nowMs = 1_000)
        val queued = speaking.request("q.new", nowMs = 1_100)
        assertEquals("q.old", queued.speaking?.utteranceKey)
        assertEquals("q.new", queued.pending)
        assertEquals(1_450L, queued.cutAtMs)
        // Before the floor nothing changes.
        assertEquals("q.old", queued.tick(1_449).speaking?.utteranceKey)
        // At the floor the pending request takes over, stamped at the cut time.
        val swapped = queued.tick(1_450)
        assertEquals("q.new", swapped.speaking?.utteranceKey)
        assertEquals(1_450L, swapped.speaking?.startedAtMs)
        assertNull(swapped.pending)
    }

    @Test
    fun `five fast taps collapse to the newest request instead of queueing a backlog`() {
        var queue = ShomaraAudioQueue().request("q.1", nowMs = 0)
        queue = queue.request("q.2", nowMs = 80)
        queue = queue.request("q.3", nowMs = 160)
        queue = queue.request("q.4", nowMs = 240)
        queue = queue.request("q.5", nowMs = 320)
        // Still the first narration, but only the LAST tap is waiting.
        assertEquals("q.1", queue.speaking?.utteranceKey)
        assertEquals("q.5", queue.pending)
        val after = queue.tick(450)
        assertEquals("q.5", after.speaking?.utteranceKey)
        assertNull("no backlog survives the cut", after.pending)
    }

    @Test
    fun `cutNow on suspend or exit silences everything at once`() {
        val queue = ShomaraAudioQueue()
            .request("q.old", nowMs = 0)
            .request("q.pending", nowMs = 100)
        val cut = queue.cutNow()
        assertTrue(cut.isIdle)
        assertNull(cut.speaking)
        assertNull(cut.pending)
        assertNull(cut.cutAtMs)
    }

    @Test
    fun `a natural end promotes the pending request`() {
        val queue = ShomaraAudioQueue()
            .request("q.old", nowMs = 0)
            .request("q.next", nowMs = 900)
        // 900 >= 450, so it started at once; to exercise the pending path use a short one.
        val pending = ShomaraAudioQueue().request("q.a", nowMs = 0).request("q.b", nowMs = 100)
        val finished = pending.finished(nowMs = 2_000)
        assertEquals("q.b", finished.speaking?.utteranceKey)
        assertEquals(2_000L, finished.speaking?.startedAtMs)
        assertEquals("q.next", queue.speaking?.utteranceKey)
    }

    @Test
    fun `an idle queue finished stays idle`() {
        assertTrue(ShomaraAudioQueue().finished(nowMs = 10).isIdle)
    }

    // ------------------------------------------------------------------ effects + ducking

    @Test
    fun `a fourth simultaneous effect is refused and the narrator ducks effects`() {
        assertTrue(ShomaraEffectBudget.accepts(simultaneousEffects = 0))
        assertTrue(ShomaraEffectBudget.accepts(simultaneousEffects = 2))
        assertFalse(ShomaraEffectBudget.accepts(simultaneousEffects = 3))
        assertTrue(ShomaraEffectBudget.shouldDuck(ShomaraAudioQueue().request("q", 0)))
        assertFalse(ShomaraEffectBudget.shouldDuck(ShomaraAudioQueue()))
    }

    // ------------------------------------------------------------------ replay

    @Test
    fun `replay is impossible before anything is narrated`() {
        val replay = ShomaraNarrationReplay()
        assertFalse(replay.canReplay)
        val (state, queue) = replay.replay(nowMs = 0, queue = ShomaraAudioQueue())
        assertEquals(0, state.replayCount)
        assertTrue("an empty replay must not request audio", queue.isIdle)
    }

    @Test
    fun `replay re-requests the same key and never counts as an attempt`() {
        val replay = ShomaraNarrationReplay().remember("q.question")
        assertTrue(replay.canReplay)
        val (state, queue) = replay.replay(nowMs = 500, queue = ShomaraAudioQueue())
        assertEquals(1, state.replayCount)
        assertEquals("q.question", queue.speaking?.utteranceKey)
        // Five replays are still five replays — no lock-out, no penalty field anywhere.
        val (again, _) = state.replay(nowMs = 1_000, queue = queue.cutNow())
        assertEquals(2, again.replayCount)
    }

    // ------------------------------------------------------------------ hint stage gate

    @Test
    fun `hints are offered in the guided and game stages`() {
        val all = setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3)
        assertEquals(all, ShomaraHintGate.allowedLevels(MacroStage.P2_GUIDED))
        assertEquals(all, ShomaraHintGate.allowedLevels(MacroStage.P3_GAME))
    }

    @Test
    fun `discovery offers no hint - nothing has been attempted yet`() {
        val all = setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3)
        assertTrue(ShomaraHintGate.allowedLevels(MacroStage.P1_DISCOVER).isEmpty())
        assertNull(
            ShomaraHintGate.levelFor(attempt = 2, stage = MacroStage.P1_DISCOVER, availableLevels = all),
        )
    }

    @Test
    fun `the last two stages have no hint slot at all, and the level gate is empty there`() {
        val all = setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3)
        val banned = listOf(MacroStage.P4_ASSESSMENT, MacroStage.P5_TRANSFER)
        banned.forEach { stage ->
            assertTrue(
                "$stage is HINT_BANNED and must offer no level",
                ShomaraHintGate.allowedLevels(stage).isEmpty(),
            )
            assertNull(ShomaraHintGate.levelFor(attempt = 9, stage = stage, availableLevels = all))
            assertFalse(ShomaraHintGate.showsButton(attempt = 9, stage = stage, availableLevels = all))
        }
    }

    @Test
    fun `the button appears only when the package carries the level the attempt asks for`() {
        // Attempt 2 asks for h1; the package carries only h2 → nothing to show, no fake text.
        assertNull(
            ShomaraHintGate.levelFor(
                attempt = 2,
                stage = MacroStage.P2_GUIDED,
                availableLevels = setOf(ShomaraHintLevel.H2),
            ),
        )
        assertEquals(
            ShomaraHintLevel.H2,
            ShomaraHintGate.levelFor(
                attempt = 3,
                stage = MacroStage.P2_GUIDED,
                availableLevels = setOf(ShomaraHintLevel.H2),
            ),
        )
        // Attempt 1 is the retry step: no hint even when content exists.
        assertNull(
            ShomaraHintGate.levelFor(
                attempt = 1,
                stage = MacroStage.P2_GUIDED,
                availableLevels = setOf(ShomaraHintLevel.H1),
            ),
        )
    }

    @Test
    fun `the ladder never walks backwards`() {
        val ladder = (1..6).map {
            ShomaraHintGate.levelFor(
                attempt = it,
                stage = MacroStage.P2_GUIDED,
                availableLevels = setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3),
            )
        }
        assertEquals(
            listOf(null, ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3, ShomaraHintLevel.H3, ShomaraHintLevel.H3),
            ladder,
        )
        assertTrue(ShomaraHintGate.isMonotonic(ladder))
    }

    // ------------------------------------------------------------------ silent station

    @Test
    fun `the tracing station runs silent and every other station plays feedback sound`() {
        assertFalse(ShomaraFeedbackSound.playsSound("ST13"))
        assertTrue(ShomaraFeedbackSound.playsSound("ST01"))
        assertEquals(setOf("ST13"), ShomaraFeedbackSound.silentStations())
    }
}
