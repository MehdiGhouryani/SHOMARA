package com.mathlearning.feature.practice

import com.mathlearning.core.model.ShomaraStationCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N08 §4: the practice hub was wired with emptyList(), so it could only ever show the empty state.
 * These tests pin the real derivation from the canonical catalog + progress — and pin the rule that
 * the hub never fabricates a practiseable item.
 */
class ShomaraPracticeCatalogTest {

    @Test
    fun `the hub lists every catalog station and never invents one`() {
        val items = ShomaraPracticeCatalog.itemsFor(completedStationIds = emptySet(), currentStationId = null)
        assertEquals(ShomaraStationCatalog.STATION_COUNT, items.size)
        // Every derived id must exist in the canonical catalog — no synthetic entries.
        val catalogIds = ShomaraStationCatalog.Stations.map { it.id }.toSet()
        assertTrue(items.all { it.id in catalogIds })
        assertEquals(items.size, items.map { it.id }.toSet().size)
    }

    @Test
    fun `a fresh child sees only locked practice with a warm reason`() {
        val items = ShomaraPracticeCatalog.itemsFor(completedStationIds = emptySet(), currentStationId = null)
        assertTrue("a child with no progress has nothing to practise yet", ShomaraPracticeCatalog.isEmpty(items))
        assertTrue(items.all { it.locked })
        // Locked items must carry a reason (the data class enforces this, but assert the intent).
        assertTrue(items.all { !it.lockedReason.isNullOrBlank() })
        // The reason must never be punitive.
        assertFalse(items.any { it.lockedReason!!.contains("ممنوع") })
    }

    @Test
    fun `the current station is practiseable`() {
        val items = ShomaraPracticeCatalog.itemsFor(completedStationIds = emptySet(), currentStationId = "ST07")
        val current = items.first { it.id == "ST07" }
        assertFalse("the station the server placed the child on must be practiseable", current.locked)
        assertFalse(ShomaraPracticeCatalog.isEmpty(items))
    }

    @Test
    fun `completed stations are practiseable and the rest stay locked`() {
        val completed = setOf("ST01", "ST02", "ST03")
        val items = ShomaraPracticeCatalog.itemsFor(completedStationIds = completed, currentStationId = "ST04")
        for (id in completed + "ST04") {
            assertFalse("$id should be practiseable", items.first { it.id == id }.locked)
        }
        val locked = items.filter { it.locked }.map { it.id }.toSet()
        assertTrue(locked.isNotEmpty())
        assertTrue((locked.intersect(completed + "ST04")).isEmpty())
    }

    @Test
    fun `unknown ids in progress do not create phantom practice items`() {
        val items = ShomaraPracticeCatalog.itemsFor(
            completedStationIds = setOf("ST01", "ST99-DOES-NOT-EXIST", ""),
            currentStationId = "ST-BOGUS",
        )
        assertEquals(ShomaraStationCatalog.STATION_COUNT, items.size)
        assertTrue(items.none { it.id == "ST99-DOES-NOT-EXIST" || it.id == "" || it.id == "ST-BOGUS" })
        // The bogus current station must not unlock anything.
        assertTrue(items.filter { it.locked }.size == ShomaraStationCatalog.STATION_COUNT - 1)
    }

    @Test
    fun `recent only contains completed stations`() {
        val completed = setOf("ST01", "ST05")
        val recent = ShomaraPracticeCatalog.recentFor(completed)
        assertEquals(setOf("ST01", "ST05"), recent.map { it.id }.toSet())
        assertTrue(recent.all { !it.locked })
        // Deterministic order (catalog order), not a fabricated "most recent" ordering.
        assertEquals(listOf("ST01", "ST05"), recent.map { it.id })
    }

    @Test
    fun `recent is empty for a child with no completions`() {
        assertTrue(ShomaraPracticeCatalog.recentFor(emptySet()).isEmpty())
    }

    @Test
    fun `titles come from the catalog so the child sees the real curriculum wording`() {
        val items = ShomaraPracticeCatalog.itemsFor(completedStationIds = setOf("ST07"), currentStationId = null)
        val st07 = items.first { it.id == "ST07" }
        assertEquals(ShomaraStationCatalog.station("ST07").workingTitle, st07.title)
    }

    @Test
    fun `locking every unreached station is not the same as an empty hub`() {
        // Guards the exact bug: "always empty" vs "nothing unlocked yet" are different states and
        // the screen must be able to tell them apart.
        val unlocked = ShomaraPracticeCatalog.itemsFor(setOf("ST01"), "ST02")
        assertFalse(ShomaraPracticeCatalog.isEmpty(unlocked))
        val nothingYet = ShomaraPracticeCatalog.itemsFor(emptySet(), null)
        assertTrue(ShomaraPracticeCatalog.isEmpty(nothingYet))
    }
}