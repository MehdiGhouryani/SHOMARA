package com.mathlearning.feature.path

import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs

/** N05-02 path graph + N05-09 metadata tests. Phase A adds Fresh, anchor, counts and index tests. */
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

    // ---- Phase A: Fresh is reachable, never a fake Current ----

    @Test
    fun `fresh is reachable for ST01 when no current station is placed`() {
        val unplaced = ShomaraPathProgress()
        assertEquals(ShomaraPathNodeState.Fresh, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST01"), unplaced))
        assertEquals(ShomaraPathNodeState.Locked, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST02"), unplaced))
        // Exactly one Fresh node, zero Current nodes: "no data arrived" never hides as "all locked".
        val states = ShomaraStationCatalog.Stations.map { ShomaraPathGraphLogic.stateFor(it, unplaced) }
        assertEquals(1, states.count { it == ShomaraPathNodeState.Fresh })
        assertEquals(0, states.count { it == ShomaraPathNodeState.Current })
        assertEquals("آمادهٔ شروع", ShomaraPathGraphLogic.stateLabelFor(ShomaraPathNodeState.Fresh))
    }

    @Test
    fun `fresh follows the first uncompleted station when current is missing`() {
        val gap = ShomaraPathProgress(completedStationIds = setOf("ST01", "ST02", "ST03"))
        assertEquals(ShomaraPathNodeState.Fresh, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST04"), gap))
        assertEquals(ShomaraPathNodeState.Locked, ShomaraPathGraphLogic.stateFor(ShomaraStationCatalog.station("ST05"), gap))
        assertEquals("ST04", ShomaraPathGraphLogic.freshStationId(gap))
    }

    @Test
    fun `no fresh node exists once a current station is placed`() {
        val states = ShomaraStationCatalog.Stations.map { ShomaraPathGraphLogic.stateFor(it, progress) }
        assertEquals(0, states.count { it == ShomaraPathNodeState.Fresh })
        assertEquals(null, ShomaraPathGraphLogic.freshStationId(progress))
    }

    @Test
    fun `next step is the current station, otherwise the fresh station, otherwise none`() {
        assertEquals("ST04", ShomaraPathGraphLogic.nextStepStation(progress)?.id)
        assertEquals("ST01", ShomaraPathGraphLogic.nextStepStation(ShomaraPathProgress())?.id)
        val allDone = ShomaraPathProgress(
            completedStationIds = (1..25).map { "ST%02d".format(it) }.toSet(),
        )
        assertEquals(null, ShomaraPathGraphLogic.nextStepStation(allDone))
    }

    @Test
    fun `offline freezes the anchor so no next-step line is derived`() {
        assertEquals(null, ShomaraPathGraphLogic.nextStepStation(ShomaraPathProgress(offline = true)))
    }

    // ---- Phase A: honest counts (unknown ids never inflate progress) ----

    @Test
    fun `per-chapter counts and remaining count only known station ids`() {
        val withUnknown = ShomaraPathProgress(completedStationIds = setOf("ST01", "ST99"))
        assertEquals(24, ShomaraPathGraphLogic.remainingCount(withUnknown))
        assertEquals(1, ShomaraPathGraphLogic.completedInChapter(1, withUnknown))
        assertEquals(0, ShomaraPathGraphLogic.completedInChapter(2, withUnknown))
        assertEquals(3, ShomaraPathGraphLogic.completedInChapter(1, progress))
        assertEquals(0, ShomaraPathGraphLogic.completedInChapter(2, progress))
        assertEquals(22, ShomaraPathGraphLogic.remainingCount(progress))
    }

    @Test
    fun `each chapter band has its own background tint`() {
        val backgrounds = (1..5).map { ShomaraPathGraphLogic.chapterBandColors(it).first }
        assertEquals(5, backgrounds.toSet().size)
    }

    // ---- Phase A: sine geometry + lazy-list index model ----

    @Test
    fun `sine offsets stay within the token amplitude and mirror in RTL`() {
        val amplitude = ShomaraTokens.ComponentNodeSize - ShomaraTokens.Space8
        for (globalIndex in 0..24) {
            val ltr = ShomaraPathGraphLogic.sineOffsetDp(globalIndex, isRtl = false)
            val rtl = ShomaraPathGraphLogic.sineOffsetDp(globalIndex, isRtl = true)
            assertEquals(-ltr, rtl)
            assertTrue(abs(ltr.value) <= amplitude.value)
        }
        // The wave actually moves: not every node sits on the centre line.
        assertFalse((0..24).all { ShomaraPathGraphLogic.sineOffsetDp(it, isRtl = false) == ShomaraPathGraphLogic.sineOffsetDp(0, isRtl = false) })
    }

    @Test
    fun `item indices follow the lazy list model`() {
        assertEquals(1, ShomaraPathGraphLogic.headerItemIndexForChapter(1))
        assertEquals(7, ShomaraPathGraphLogic.headerItemIndexForChapter(2))
        assertEquals(25, ShomaraPathGraphLogic.headerItemIndexForChapter(5))
        assertEquals(2, ShomaraPathGraphLogic.itemIndexForStation(ShomaraStationCatalog.station("ST01")))
        assertEquals(6, ShomaraPathGraphLogic.itemIndexForStation(ShomaraStationCatalog.station("ST05")))
        assertEquals(8, ShomaraPathGraphLogic.itemIndexForStation(ShomaraStationCatalog.station("ST06")))
        assertEquals(30, ShomaraPathGraphLogic.itemIndexForStation(ShomaraStationCatalog.station("ST25")))
    }

    @Test
    fun `restore scroll targets the saved chapter header`() {
        assertEquals(0, ShomaraPathGraphLogic.restoredFirstVisibleIndex(null))
        assertEquals(0, ShomaraPathGraphLogic.restoredFirstVisibleIndex(1))
        assertEquals(7, ShomaraPathGraphLogic.restoredFirstVisibleIndex(2))
        assertEquals(25, ShomaraPathGraphLogic.restoredFirstVisibleIndex(5))
        assertEquals(0, ShomaraPathGraphLogic.restoredFirstVisibleIndex(9))
    }

    // ---- Screenshot evidence 2026-11-05: segmented Current ring + unit banner ----

    @Test
    fun `current node ring fraction is the chapter completion from the same progress set`() {
        // Fixture progress: ST01-ST03 completed in chapter 1, ST04 current.
        assertEquals(0.6f, ShomaraPathGraphLogic.ringFractionFor(ShomaraStationCatalog.station("ST04"), progress), 0.001f)
        assertEquals(0f, ShomaraPathGraphLogic.ringFractionFor(ShomaraStationCatalog.station("ST01"), ShomaraPathProgress()), 0.001f)
        val chapterDone = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02", "ST03", "ST04", "ST05"),
            currentStationId = "ST06",
        )
        assertEquals(1f, ShomaraPathGraphLogic.ringFractionFor(ShomaraStationCatalog.station("ST06"), chapterDone), 0.001f)
        // Unknown ids never inflate the ring: the ring is a chapter fraction, never a lesson value.
        assertEquals(0f, ShomaraPathGraphLogic.ringFractionFor(ShomaraStationCatalog.station("ST04"), ShomaraPathProgress(completedStationIds = setOf("ST99"))), 0.001f)
    }

    @Test
    fun `unit banner title is the chapter station span, never an invented concept name`() {
        assertEquals("ایستگاه‌های ۱ تا ۵", ShomaraPathGraphLogic.chapterSpanLabel(1))
        assertEquals("ایستگاه‌های ۶ تا ۱۰", ShomaraPathGraphLogic.chapterSpanLabel(2))
        assertEquals("ایستگاه‌های ۲۱ تا ۲۵", ShomaraPathGraphLogic.chapterSpanLabel(5))
    }
}
