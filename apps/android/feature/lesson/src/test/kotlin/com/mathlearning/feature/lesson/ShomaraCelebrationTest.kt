package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S5 · STATION_BUILD_PHASES.md «پالایش حرکت و جشن» — the three rules that no screenshot can
 * show: single ownership, the stage5 durations, and the particle budget.
 */
class ShomaraCelebrationTest {

    // ------------------------------------------------------------------ single owner

    @Test
    fun `a celebration cannot start while the intro card is up`() {
        val intro = ShomaraCelebrationGate.showIntro(
            ShomaraCelebrationState(),
            stage = MacroStage.P2_GUIDED,
            nowMs = 0,
        )
        assertTrue(intro.isBusy)
        val rejected = ShomaraCelebrationGate.celebrate(
            intro,
            ShomaraCelebrationKind.RoundEnd,
            nowMs = 100,
        )
        assertEquals(ShomaraCelebrationKind.None, rejected.kind)
        assertEquals(intro, rejected)
    }

    @Test
    fun `two celebrations can never overlap`() {
        val first = ShomaraCelebrationGate.celebrate(
            ShomaraCelebrationState(),
            ShomaraCelebrationKind.RoundEnd,
            nowMs = 0,
        )
        assertEquals(ShomaraCelebrationKind.RoundEnd, first.kind)
        assertFalse(ShomaraCelebrationGate.canCelebrate(first))
        val second = ShomaraCelebrationGate.celebrate(
            first,
            ShomaraCelebrationKind.StationEnd,
            nowMs = 200,
        )
        assertEquals("the second request is refused, not queued", first, second)
    }

    @Test
    fun `the station celebrates exactly once`() {
        val shown = ShomaraCelebrationGate.celebrate(
            ShomaraCelebrationState(),
            ShomaraCelebrationKind.StationEnd,
            nowMs = 0,
        )
        assertTrue(shown.stationCelebrationShown)
        // The moment ends on its own clock...
        val expired = ShomaraCelebrationGate.tick(shown, nowMs = ShomaraCelebrationGate.STATION_MAX_MS)
        assertEquals(ShomaraCelebrationKind.None, expired.kind)
        // ...but the station never celebrates its end a second time.
        val again = ShomaraCelebrationGate.celebrate(
            expired,
            ShomaraCelebrationKind.StationEnd,
            nowMs = 5_000,
        )
        assertEquals(ShomaraCelebrationKind.None, again.kind)
    }

    @Test
    fun `a round celebration may run again in a later round`() {
        val first = ShomaraCelebrationGate.celebrate(
            ShomaraCelebrationState(),
            ShomaraCelebrationKind.RoundEnd,
            nowMs = 0,
        )
        val expired = ShomaraCelebrationGate.tick(first, ShomaraCelebrationGate.ROUND_MAX_MS)
        val next = ShomaraCelebrationGate.celebrate(
            expired,
            ShomaraCelebrationKind.RoundEnd,
            nowMs = 9_000,
        )
        assertEquals(ShomaraCelebrationKind.RoundEnd, next.kind)
        assertEquals(9_000L, next.startedAtMs)
    }

    // ------------------------------------------------------------------ durations (stage5 §4.1)

    @Test
    fun `the three durations are the stage5 numbers`() {
        assertEquals(1_500L, ShomaraCelebrationGate.INTRO_MAX_MS)
        assertEquals(1_600L, ShomaraCelebrationGate.ROUND_MAX_MS)
        assertEquals(2_200L, ShomaraCelebrationGate.STATION_MAX_MS)
        assertEquals(1_600L, ShomaraCelebrationGate.durationMs(ShomaraCelebrationKind.RoundEnd))
        assertEquals(2_200L, ShomaraCelebrationGate.durationMs(ShomaraCelebrationKind.StationEnd))
        assertEquals(0L, ShomaraCelebrationGate.durationMs(ShomaraCelebrationKind.None))
    }

    @Test
    fun `the intro card expires at one and a half seconds, never later`() {
        val intro = ShomaraCelebrationGate.showIntro(
            ShomaraCelebrationState(),
            stage = MacroStage.P1_DISCOVER,
            nowMs = 1_000,
        )
        // One millisecond before the limit it is still there.
        assertTrue(ShomaraCelebrationGate.tick(intro, 2_499).intro != null)
        // At the limit it is gone.
        assertNull(ShomaraCelebrationGate.tick(intro, 2_500).intro)
    }

    @Test
    fun `tapping the intro card dismisses it and leaves a celebration alone`() {
        val intro = ShomaraCelebrationGate.showIntro(
            ShomaraCelebrationState(),
            stage = MacroStage.P3_GAME,
            nowMs = 0,
        )
        val dismissed = ShomaraCelebrationGate.dismissIntro(intro)
        assertNull(dismissed.intro)
        assertFalse(dismissed.isBusy)

        val celebrating = ShomaraCelebrationGate.celebrate(
            ShomaraCelebrationState(),
            ShomaraCelebrationKind.RoundEnd,
            nowMs = 0,
        )
        // A tap during a celebration must not silently end the moment.
        assertEquals(celebrating, ShomaraCelebrationGate.dismissIntro(celebrating))
    }

    // ------------------------------------------------------------------ particles (stage5 §4.1)

    @Test
    fun `particles never exceed 24 and never outlive 1_2 seconds`() {
        val station = ShomaraParticleBudget.particles(ShomaraCelebrationKind.StationEnd, reducedMotion = false)
        assertEquals(24, station.size)
        assertTrue(station.size <= ShomaraParticleBudget.MAX_PARTICLES)
        assertEquals(1_200L, ShomaraParticleBudget.LIFE_MS)
        assertTrue("the life must fit inside the round celebration", ShomaraParticleBudget.LIFE_MS <= 1_600)
    }

    @Test
    fun `a round celebration uses fewer particles than the station celebration`() {
        val round = ShomaraParticleBudget.count(ShomaraCelebrationKind.RoundEnd, reducedMotion = false)
        val station = ShomaraParticleBudget.count(ShomaraCelebrationKind.StationEnd, reducedMotion = false)
        assertTrue(round in 1 until station)
        assertEquals(0, ShomaraParticleBudget.count(ShomaraCelebrationKind.None, reducedMotion = false))
    }

    @Test
    fun `reduced motion removes every particle - the fact survives as a still card`() {
        assertEquals(0, ShomaraParticleBudget.count(ShomaraCelebrationKind.RoundEnd, reducedMotion = true))
        assertEquals(0, ShomaraParticleBudget.count(ShomaraCelebrationKind.StationEnd, reducedMotion = true))
        assertTrue(
            ShomaraParticleBudget.particles(ShomaraCelebrationKind.StationEnd, reducedMotion = true).isEmpty(),
        )
    }

    @Test
    fun `particles are deterministic and mirror-symmetric around the centre`() {
        val a = ShomaraParticleBudget.particles(ShomaraCelebrationKind.StationEnd, reducedMotion = false)
        val b = ShomaraParticleBudget.particles(ShomaraCelebrationKind.StationEnd, reducedMotion = false)
        assertEquals("the same celebration must look the same twice", a, b)
        val half = a.size / 2
        a.take(half).zip(a.drop(half)).forEach { (left, right) ->
            assertEquals(1f - left.xFraction, right.xFraction, 0.0001f)
            assertEquals(left.yFraction, right.yFraction, 0.0001f)
        }
    }

    @Test
    fun `the only drawable shapes are a line and a dot`() {
        // The type itself is the guarantee: there is no Star/Crown/Coin/Trophy/Heart/Fire member.
        assertEquals(2, ShomaraParticleShape.entries.size)
        assertEquals(
            listOf(ShomaraParticleShape.Line, ShomaraParticleShape.Dot),
            ShomaraParticleShape.entries.toList(),
        )
        val shapes = ShomaraParticleBudget.particles(ShomaraCelebrationKind.StationEnd, reducedMotion = false)
            .map { it.shape }
            .toSet()
        assertTrue(shapes.all { it == ShomaraParticleShape.Line || it == ShomaraParticleShape.Dot })
    }

    // ------------------------------------------------------------------ copy (stage5 §3)

    @Test
    fun `the celebration copy is exactly the approved closed list`() {
        assertEquals(4, ShomaraCelebrationCopy.Win.size)
        assertEquals(2, ShomaraCelebrationCopy.PreAssessment.size)
        // The list is closed: every line is an approved one, and nothing else can pass the check.
        ShomaraCelebrationCopy.Win.forEach {
            assertTrue("unapproved win line: $it", ShomaraCelebrationCopy.isApprovedWinLine(it))
        }
        ShomaraCelebrationCopy.PreAssessment.forEach {
            assertTrue(ShomaraCelebrationCopy.isApprovedPreAssessmentLine(it))
        }
        assertFalse(ShomaraCelebrationCopy.isApprovedWinLine("۲ امتیاز گرفتی"))
        assertFalse(ShomaraCelebrationCopy.isApprovedPreAssessmentLine("آفرین، این مرحله تمام شد."))
    }

    @Test
    fun `the copy selection is deterministic and cycles`() {
        assertEquals(ShomaraCelebrationCopy.Win[0], ShomaraCelebrationCopy.winLine(0))
        assertEquals(ShomaraCelebrationCopy.Win[4 % 4], ShomaraCelebrationCopy.winLine(4))
        assertEquals(ShomaraCelebrationCopy.PreAssessment[0], ShomaraCelebrationCopy.preAssessmentLine(0))
        assertEquals(ShomaraCelebrationCopy.PreAssessment[1], ShomaraCelebrationCopy.preAssessmentLine(3))
    }
}
