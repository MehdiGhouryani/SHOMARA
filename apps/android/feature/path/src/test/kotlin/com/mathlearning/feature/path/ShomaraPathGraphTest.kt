package com.mathlearning.feature.path

import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N05-02 path graph + N05-09 metadata tests. */
class ShomaraPathGraphTest {

    private val progress = ShomaraPathProgress(
        completedStationIds = setOf("ST01", "ST02", "ST03"),
        perfectStationIds = setOf("ST02"),
        currentStationId = "ST04",
    )

    @Test
    fun `node states map from server-provided progress only`() {
        assertEquals(ShomaraPathNodeState.Completed, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST01"), progress))
        assertEquals(ShomaraPathNodeState.Perfect, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST02"), progress))
        assertEquals(ShomaraPathNodeState.Current, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST04"), progress))
        assertEquals(ShomaraPathNodeState.Locked, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST05"), progress))
        // Offline freezes the graph to locked nodes with the recovery banner.
        assertEquals(ShomaraPathNodeState.Locked, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST04"), progress.copy(offline = true)))
    }

    @Test
    fun `exactly one current node can exist`() {
        val states = ShomaraStationCatalog.Stations.map { ShomaraPathGraphLogic.stateFor(it, progress) }
        assertEquals(1, states.count { it == ShomaraPathNodeState.Current })
    }

    @Test
    fun `perfect implies completed is enforced at construction`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraPathProgress(perfectStationIds = setOf("ST07"))
        }
    }

    @Test
    fun `locked nodes stay tappable and carry an explicit state label`() {
        for (state in ShomaraPathNodeState.entries) {
            assertTrue(ShomaraPathGraphLogic.tapEnabled(state))
            assertTrue(ShomaraPathGraphLogic.stateLabelFor(state).isNotBlank())
        }
        assertTrue(ShomaraPathGraphLogic.stateLabelFor(ShomaraPathNodeState.Locked).contains("قفل"))
    }

    @Test
    fun `restore scroll falls back to the first chapter for unknown values`() {
        assertEquals(1, ShomaraPathGraphLogic.restoredChapter(null))
        assertEquals(3, ShomaraPathGraphLogic.restoredChapter(3))
        assertEquals(1, ShomaraPathGraphLogic.restoredChapter(9))
    }

    // ---- N05-09: canonical metadata ----

    @Test
    fun `all 25 fixed station ids exist in order`() {
        assertEquals(25, ShomaraStationCatalog.Stations.size)
        assertEquals((1..25).map { "ST%02d".format(it) }, ShomaraStationCatalog.Stations.map { it.id })
        // ST07 exists with its canonical working title (content contracts reference it).
        assertEquals("عددهای ۱ و ۲", ShomaraStationCatalog.station("ST07").workingTitle)
    }

    @Test
    fun `five chapter bands group five stations each with structural labels`() {
        assertEquals(listOf(1, 2, 3, 4, 5), ShomaraChapterCatalog.All)
        for (chapter in ShomaraChapterCatalog.All) {
            val band = ShomaraStationCatalog.stationsInChapter(chapter)
            assertEquals(5, band.size)
            assertTrue(band.all { it.chapter == chapter })
        }
        assertEquals("فصل ۱", ShomaraChapterCatalog.labelFor(1))
        assertEquals("فصل ۵", ShomaraChapterCatalog.labelFor(5))
    }

    @Test
    fun `station titles are provisional working titles - no owner claim is asserted`() {
        // CONTENT-004: IDs stay fixed; titles are the content-library workingTitles flagged
        // provisional so the UI presents no unresolved claim as final.
        assertTrue(ShomaraStationCatalog.Stations.all { it.provisional })
        assertTrue(ShomaraStationCatalog.Stations.all { it.workingTitle.isNotBlank() })
        // Ordinals are 1-based and contiguous across the whole path.
        assertEquals((1..25).toList(), ShomaraStationCatalog.Stations.map { it.ordinal })
    }

    @Test
    fun `unknown station ids are rejected`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraStationCatalog.station("ST26") }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { ShomaraStationCatalog.station("ST1") }
    }
}
