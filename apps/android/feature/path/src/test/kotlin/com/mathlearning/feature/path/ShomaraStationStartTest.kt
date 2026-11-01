package com.mathlearning.feature.path

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import com.mathlearning.core.model.ShomaraStationCatalog
import org.junit.Test

/** N05-03 station start + unit/jump sheet tests. */
class ShomaraStationStartTest {

    private val progress = ShomaraPathProgress(
        completedStationIds = setOf("ST01", "ST02"),
        currentStationId = "ST03",
    )

    @Test
    fun `station start state matrix covers all seven states`() {
        val st03 = ShomaraStationCatalog.station("ST03")
        val st01 = ShomaraStationCatalog.station("ST01")
        val st07 = ShomaraStationCatalog.station("ST07")
        assertEquals(ShomaraStationStartState.Ready, ShomaraStationStartLogic.stateFor(st03, progress))
        assertEquals(ShomaraStationStartState.Resume, ShomaraStationStartLogic.stateFor(st01, progress))
        assertEquals(ShomaraStationStartState.Locked, ShomaraStationStartLogic.stateFor(st07, progress))
        assertEquals(ShomaraStationStartState.Loading, ShomaraStationStartLogic.stateFor(st03, progress, loading = true))
        assertEquals(ShomaraStationStartState.Starting, ShomaraStationStartLogic.stateFor(st03, progress, starting = true))
        assertEquals(ShomaraStationStartState.Offline, ShomaraStationStartLogic.stateFor(st03, progress.copy(offline = true)))
        assertEquals(ShomaraStationStartState.Error, ShomaraStationStartLogic.stateFor(st03, progress, errorText = "x"))
    }

    @Test
    fun `cta is single and deterministic per state`() {
        assertEquals("شروع", ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Ready))
        assertEquals("ادامه", ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Resume))
        assertEquals("متوجه شدم", ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Locked))
        assertNull(ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Loading))
        assertNull(ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Starting))
        assertNull(ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Offline))
        assertNull(ShomaraStationStartLogic.ctaLabel(ShomaraStationStartState.Error))
        assertTrue(ShomaraStationStartLogic.ctaEnabled(ShomaraStationStartState.Ready))
        assertFalse(ShomaraStationStartLogic.ctaEnabled(ShomaraStationStartState.Offline))
    }

    @Test
    fun `metadata is real and derived from the canonical catalog`() {
        assertEquals("ایستگاه ۳ از ۲۵ — فصل ۱", ShomaraStationStartLogic.metadataLine(ShomaraStationCatalog.station("ST03")))
        assertEquals("ایستگاه ۲۵ از ۲۵ — فصل ۵", ShomaraStationStartLogic.metadataLine(ShomaraStationCatalog.station("ST25")))
    }

    @Test
    fun `locked explanation is warm and actionable`() {
        val text = ShomaraStationStartLogic.lockedExplanation()
        assertTrue(text.contains("باز نشده"))
        assertFalse(text.contains("تنبیه"))
    }

    @Test
    fun `jump targets stay inside the chapter with their path states`() {
        val targets = ShomaraJumpSheetLogic.targetsFor("ST03", progress)
        assertEquals(5, targets.size)
        assertTrue(targets.all { it.meta.chapter == 1 })
        assertEquals(ShomaraPathNodeState.Completed, targets.first { it.meta.id == "ST01" }.nodeState)
        assertEquals(ShomaraPathNodeState.Current, targets.first { it.meta.id == "ST03" }.nodeState)
        assertEquals(ShomaraPathNodeState.Locked, targets.first { it.meta.id == "ST05" }.nodeState)
        assertEquals("پرش داخل فصل ۱", ShomaraJumpSheetLogic.titleFor("ST03"))
    }

    @Test
    fun `jump confirm is blocked for locked targets offline and errors`() {
        val targets = ShomaraJumpSheetLogic.targetsFor("ST03", progress)
        var state = ShomaraJumpSheetState(targets = targets)
        assertFalse(state.canConfirm) // nothing selected
        state = ShomaraJumpSheetLogic.select(state, "ST05") // locked target
        assertFalse(state.canConfirm)
        state = ShomaraJumpSheetLogic.select(state, "ST02") // completed target
        assertTrue(state.canConfirm)
        assertFalse(state.copy(offline = true).canConfirm)
        assertFalse(state.copy(errorText = "x").canConfirm)
        // Unknown target rejected at the reducer.
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraJumpSheetLogic.select(state, "ST20")
        }
    }

    @Test
    fun `selecting an already-selected target keeps it - idempotent`() {
        val targets = ShomaraJumpSheetLogic.targetsFor("ST03", progress)
        val state = ShomaraJumpSheetLogic.select(ShomaraJumpSheetState(targets = targets), "ST02")
        val again = ShomaraJumpSheetLogic.select(state, "ST02")
        assertEquals(state, again)
    }
}
