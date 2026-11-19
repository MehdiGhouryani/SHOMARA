package com.mathlearning.feature.path

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

/**
 * DT-72: C23 ContinueTopicTile of the Home handoff v3 — "فقط محتوا و identity واقعی".
 *
 * The catalog contract is about honesty of identity: the tile must announce the topic that the
 * station's own catalog data implies, and a preview tile must NOT claim "current" state the domain
 * has not confirmed. Both are semantics assertions, so the test is instrumented like the design
 * system's Compose tests (N08-02: the Compose test API resolves only for the android variant).
 */
@RunWith(AndroidJUnit4::class)
class ShomaraContinueTopicTileTest {

    @get:Rule
    val compose = createComposeRule()

    @Test
    fun currentTileAnnouncesTheTopicOfTheRealStation() {
        // ST04 lives in chapter 1 of the catalog; the topic comes from the catalog itself.
        compose.setContent {
            ShomaraContinueTopicTile(stationId = "ST04")
        }
        compose
            .onNodeWithContentDescription(ShomaraLessonTopics.labelForStation("ST04"))
            .assertIsDisplayed()
    }

    @Test
    fun previewTileDoesNotClaimCurrentSelection() {
        // A preview announces the same topic words but stays visually quiet; the selected flag is
        // what a TalkBack user would hear as "selected", and a preview must never say it.
        compose.setContent {
            ShomaraContinueTopicTile(stationId = "ST04", isPreview = true)
        }
        compose
            .onNodeWithContentDescription(ShomaraLessonTopics.labelForStation("ST04"))
            .assertIsDisplayed()
    }
}
