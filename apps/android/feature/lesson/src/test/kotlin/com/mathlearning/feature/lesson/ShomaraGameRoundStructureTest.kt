package com.mathlearning.feature.lesson

import org.junit.Assert.assertEquals
import org.junit.Test

/** B4 — P3 round structure: six rounds, pilot §4 counts as configurable data, no content. */
class ShomaraGameRoundStructureTest {

    @Test
    fun `pilot structure has six rounds with the quoted blank and tray counts`() {
        val rounds = ShomaraGameRoundStructure.pilotStructure()
        assertEquals(6, rounds.size)
        assertEquals(listOf(2, 3, 2, 3, 4, 0), rounds.map { it.blankCount })
        assertEquals(listOf(3, 2, 2, 2, 3, 0), rounds.map { it.traySize })
        assertEquals((1..6).toList(), rounds.map { it.roundIndex })
    }

    @Test
    fun `first five rounds continue - the sixth does not`() {
        val rounds = ShomaraGameRoundStructure.pilotStructure()
        assertEquals(List(5) { ShomaraGameRoundMode.Continue }, rounds.take(5).map { it.mode })
        assertEquals(ShomaraGameRoundMode.FindUnit, rounds[5].mode)
    }

    @Test
    fun `round label counts in Persian words from structure only`() {
        assertEquals("راند ۱ از ۶", ShomaraGameRoundStructure.pilotStructure()[0].roundLabel())
        assertEquals("راند ۶ از ۶", ShomaraGameRoundStructure.pilotStructure()[5].roundLabel())
    }

    @Test
    fun `round index outside 1 to 6 is refused`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraGameRoundStructure(roundIndex = 0, blankCount = 2, traySize = 3, mode = ShomaraGameRoundMode.Continue)
        }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraGameRoundStructure(roundIndex = 7, blankCount = 2, traySize = 3, mode = ShomaraGameRoundMode.Continue)
        }
    }
}
