package com.mathlearning.core.designsystem

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

/**
 * DT-72: the three previously-missing catalog components from the Home handoff v3 that live in the
 * design system. ContinueTopicTile (C23) is tested in feature/path beside the station catalog.
 *
 * Each test pins the catalog's own contract, not an implementation detail:
 *   - C03 GradeChip: "فقط grade واقعی" — the caller's label is the spoken label; no invented badge.
 *   - C12 PathReturnFab: "فقط پس از scroll threshold واقعی" — invisible means composed NOTHING,
 *     so TalkBack can never focus a control that has no meaning at the current scroll position.
 *   - C14 LessonTopicIcon: the spoken label equals the visible topic words in all three catalog
 *     states (default/selected/disabled) — the same rule the path node states follow.
 */
@RunWith(AndroidJUnit4::class)
class ShomaraHomeKitTest {

    @get:Rule
    val compose = createComposeRule()

    // ---- C03 GradeChip ------------------------------------------------------------

    @Test
    fun gradeChipSpeaksExactlyTheCallersRealLabel() {
        compose.setContent { ShomaraGradeChip(gradeLabel = "پایهٔ دوم") }
        compose.onNodeWithText("پایهٔ دوم").assertIsDisplayed()
        compose.onNodeWithContentDescription("پایهٔ دوم").assertIsDisplayed()
    }

    // ---- C12 PathReturnFab --------------------------------------------------------

    @Test
    fun returnFabRendersNothingWhenInvisible() {
        compose.setContent {
            ShomaraPathReturnFab(
                visible = false,
                contentDescription = "بازگشت به ایستگاه فعلی",
                onClick = {},
            )
        }
        compose.onAllNodesWithContentDescription("بازگشت به ایستگاه فعلی").assertCountEquals(0)
    }

    @Test
    fun returnFabIsFocusableWithTheCallersSentenceWhenVisible() {
        var clicked = false
        compose.setContent {
            ShomaraPathReturnFab(
                visible = true,
                contentDescription = "بازگشت به ایستگاه فعلی",
                onClick = { clicked = true },
            )
        }
        compose.onNodeWithContentDescription("بازگشت به ایستگاه فعلی").assertIsDisplayed()
        compose.onNodeWithContentDescription("بازگشت به ایستگاه فعلی").performClick()
        assertTrue(clicked)
    }

    // ---- C14 LessonTopicIcon ------------------------------------------------------

    @Test
    fun everyCatalogTopicExistsWithDistinctDrawableAndPersianLabel() {
        val topics = ShomaraLessonTopic.entries
        assertEquals(4, topics.size)
        assertEquals(
            listOf("شمارش", "جمع", "شکل‌ها", "الگوها"),
            topics.map { it.faLabel },
        )
        // Two topics sharing one drawable would destroy the icon's value as topic identity for
        // a child who cannot read yet, so distinctness is part of the contract.
        assertEquals(topics.size, topics.map { it.drawableRes }.distinct().size)
    }

    @Test
    fun topicIconAnnouncesTheSameWordsASightedChildSees() {
        compose.setContent { ShomaraLessonTopicIcon(topic = ShomaraLessonTopic.Addition) }
        compose.onNodeWithContentDescription("جمع").assertIsDisplayed()
    }

    @Test
    fun disabledTopicIconIsStillAnnounced() {
        // §3.9/§6: a disabled lesson must not become invisible to TalkBack — the child still
        // deserves to know what exists there, and why it is not yet playable comes from the domain.
        compose.setContent {
            ShomaraLessonTopicIcon(topic = ShomaraLessonTopic.Shapes, enabled = false)
        }
        compose.onNodeWithContentDescription("شکل‌ها").assertIsDisplayed()
    }

    @Test
    fun selectedTopicIconStaysAnnounced() {
        compose.setContent {
            ShomaraLessonTopicIcon(topic = ShomaraLessonTopic.Patterns, selected = true)
        }
        compose.onNodeWithContentDescription("الگوها").assertIsDisplayed()
    }
}
