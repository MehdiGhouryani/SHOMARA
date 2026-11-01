package com.mathlearning.feature.practice

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N05-04 practice hub: state matrix, real-data-only, non-punitive copy. */
class ShomaraPracticeHubTest {

    private val items = listOf(
        ShomaraPracticeItem("p1", "جمع با مهره‌ها"),
        ShomaraPracticeItem("p2", "الگوی رنگی", locked = true, lockedReason = "پس از ایستگاه ST04 باز می‌شود"),
    )

    @Test
    fun `state matrix covers loading list empty locked offline error`() {
        assertEquals(ShomaraPracticeHubState.Loading, ShomaraPracticeHubLogic.stateFor(items, loading = true, offline = false, errorText = null))
        assertEquals(ShomaraPracticeHubState.List, ShomaraPracticeHubLogic.stateFor(items, loading = false, offline = false, errorText = null))
        assertEquals(ShomaraPracticeHubState.Empty, ShomaraPracticeHubLogic.stateFor(emptyList(), loading = false, offline = false, errorText = null))
        assertEquals(ShomaraPracticeHubState.Offline, ShomaraPracticeHubLogic.stateFor(items, loading = false, offline = true, errorText = null))
        assertEquals(ShomaraPracticeHubState.Error, ShomaraPracticeHubLogic.stateFor(items, loading = false, offline = false, errorText = "x"))
    }

    @Test
    fun `recommended is rendered verbatim - locked items excluded from recommendations`() {
        assertEquals(listOf("p1"), ShomaraPracticeHubLogic.recommendedFor(items).map { it.id })
        assertEquals(emptyList<ShomaraPracticeItem>(), ShomaraPracticeHubLogic.recommendedFor(emptyList()))
    }

    @Test
    fun `history passes through the caller data unchanged`() {
        val recent = listOf(ShomaraPracticeItem("p1", "جمع با مهره‌ها"))
        assertEquals(recent, ShomaraPracticeHubLogic.historyFor(recent))
    }

    @Test
    fun `empty guide is warm and points to the path`() {
        val guide = ShomaraPracticeHubLogic.emptyGuide()
        assertTrue(guide.contains("مسیر"))
        assertFalse(guide.contains("جایزه"))
        assertFalse(guide.contains("ستاره"))
    }

    @Test
    fun `locked rows carry a warm reason - construction enforces it`() {
        assertEquals("قفل: پس از ایستگاه ST04 باز می‌شود", ShomaraPracticeHubLogic.lockedLabel(items[1]))
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraPracticeItem("x", "بدون دلیل", locked = true, lockedReason = null)
        }
    }

    @Test
    fun `no punitive wording in any state label`() {
        for (state in ShomaraPracticeHubState.entries) {
            assertFalse(state.name.contains("FAIL_PUNISH"))
        }
    }
}
