package com.mathlearning.feature.lesson

import com.mathlearning.core.model.MacroStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S0 · STATION_EXPERIENCE_BLUEPRINT §2.2 — pure logic proof for the station chrome.
 *
 * The chips replace the removed progress bar (F-05) with a POSITION sentence: no fraction,
 * no percentage, no numeral on the row itself. These tests pin the three invariants the
 * blueprint locks:
 *  1. chip state derivation (done / current / locked) from the macro stage alone;
 *  2. the TalkBack announcement is one sentence with the spoken ordinal and the stage label;
 *  3. the exit copy set keeps its safety promise («ذخیره» stays in the child-facing words).
 */
class ShomaraStationChromeLogicTest {

    @Test
    fun stagesBeforeCurrentAreDoneCurrentIsCurrentAfterIsLocked() {
        val current = MacroStage.P3_GAME
        assertEquals(ShomaraStageChipState.Done, ShomaraStationChromeLogic.chipState(MacroStage.P1_DISCOVER, current))
        assertEquals(ShomaraStageChipState.Done, ShomaraStationChromeLogic.chipState(MacroStage.P2_GUIDED, current))
        assertEquals(ShomaraStageChipState.Current, ShomaraStationChromeLogic.chipState(MacroStage.P3_GAME, current))
        assertEquals(ShomaraStageChipState.Locked, ShomaraStationChromeLogic.chipState(MacroStage.P4_ASSESSMENT, current))
        assertEquals(ShomaraStageChipState.Locked, ShomaraStationChromeLogic.chipState(MacroStage.P5_TRANSFER, current))
    }

    @Test
    fun firstStageHasNoDoneChipsAndLastHasNoLocked() {
        MacroStage.entries.forEach { current ->
            val states = ShomaraStationChromeLogic.stageOrder.map { ShomaraStationChromeLogic.chipState(it, current) }
            assertEquals(5, states.size)
            assertEquals(1, states.count { it == ShomaraStageChipState.Current })
            // done stages always precede the current one, locked always follow
            val currentIdx = states.indexOf(ShomaraStageChipState.Current)
            assertEquals(currentIdx, states.count { it == ShomaraStageChipState.Done })
            assertEquals(4 - currentIdx, states.count { it == ShomaraStageChipState.Locked })
        }
    }

    @Test
    fun chipsAnnouncementIsOneSentenceWithOrdinalAndLabel() {
        val announcement = ShomaraStationChromeLogic.chipsAnnouncement(MacroStage.P2_GUIDED)
        assertEquals("مرحلهٔ دوم از پنج: تمرین هدایت‌شده", announcement)
    }

    @Test
    fun announcementCoversEveryStageWithItsOwnOrdinal() {
        val announcements = MacroStage.entries.map { ShomaraStationChromeLogic.chipsAnnouncement(it) }
        assertEquals(announcements.size, announcements.toSet().size) // five distinct sentences
    }

    /** The exit sheet keeps the safety promise visible to the child (blueprint §2.1). */
    @Test
    fun exitCopyKeepsSavePromiseAndStayPrimary() {
        assertTrue(ShomaraLessonStrings.ExitBody.contains("ذخیره"))
        assertTrue(ShomaraLessonStrings.ExitTitle.contains("؟"))
        // staying stays the primary words; leaving is explicitly secondary
        assertTrue(ShomaraCloseConfirmLogic.StayLabel == ShomaraLessonStrings.ExitStayPrimary)
        assertTrue(ShomaraCloseConfirmLogic.ConfirmLabel == ShomaraLessonStrings.ExitSecondary)
    }
}
