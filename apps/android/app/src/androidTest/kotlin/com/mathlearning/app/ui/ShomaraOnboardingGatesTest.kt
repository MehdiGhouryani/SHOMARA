// SPDX-License-Identifier: Apache-2.0
package com.mathlearning.app.ui

import androidx.compose.ui.test.assertDoesNotExist
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.mathlearning.feature.onboarding.ShomaraPlacementScreen
import com.mathlearning.feature.onboarding.ShomaraPlacementState
import com.mathlearning.feature.onboarding.ShomaraProfileDraft
import com.mathlearning.feature.onboarding.ShomaraProfileSaveState
import com.mathlearning.feature.onboarding.ShomaraProfileScreen
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * #88/#100 — the placement skip is a real flag-gated affordance and the save confirmation
 * is a real visible banner.
 *
 * #88: `ShomaraPlacementScreen` renders the «فعلاً رد می‌کنم» button ONLY when a non-null
 * `onSkip` is passed (the host passes one only when the product/DEBUG flag allows it);
 * with `onSkip = null` there is no skip button at all — not a disabled one.
 *
 * #100: `ShomaraProfileSaveState.announcement()` finally has real callers — the profile
 * screen shows the «ذخیره شد» Correct banner when `saved` is true, and the placement
 * screen shows the same banner from the carried `savedAnnouncement` (the profile step
 * advances immediately on a successful save, so the placement screen is where the child
 * actually sees it). The text is the existing canonical string, not new copy.
 */
class ShomaraOnboardingGatesTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun skipButtonIsAbsentWhenOnSkipIsNull() {
        composeRule.setContent {
            ShomaraPlacementScreen(
                state = ShomaraPlacementState(),
                onSkip = null,
            )
        }

        composeRule.onNodeWithText("فعلاً رد می‌کنم").assertDoesNotExist()
    }

    @Test
    fun skipButtonIsShownAndCallsBackWhenOnSkipIsProvided() {
        var skipped = false
        composeRule.setContent {
            ShomaraPlacementScreen(
                state = ShomaraPlacementState(),
                onSkip = { skipped = true },
            )
        }

        composeRule.onNodeWithText("فعلاً رد می‌کنم").assertIsDisplayed()
        composeRule.onNodeWithText("فعلاً رد می‌کنم").performClick()
        composeRule.runOnIdle { assertTrue(skipped) }
    }

    @Test
    fun profileScreenShowsTheSavedBannerAfterASuccessfulSave() {
        val draft = ShomaraProfileDraft(name = "آریا")
        composeRule.setContent {
            ShomaraProfileScreen(
                draft = draft,
                onDraftChange = {},
                saveState = ShomaraProfileSaveState(draft = draft, saved = true),
                onSave = {},
            )
        }

        composeRule.onNodeWithText("ذخیره شد").assertIsDisplayed()
    }

    @Test
    fun profileScreenShowsNoSavedBannerBeforeSaving() {
        val draft = ShomaraProfileDraft(name = "آریا")
        composeRule.setContent {
            ShomaraProfileScreen(
                draft = draft,
                onDraftChange = {},
                saveState = ShomaraProfileSaveState(draft = draft),
                onSave = {},
            )
        }

        composeRule.onNodeWithText("ذخیره شد").assertDoesNotExist()
    }

    @Test
    fun placementScreenCarriesTheSavedBannerFromTheProfileStep() {
        composeRule.setContent {
            ShomaraPlacementScreen(
                state = ShomaraPlacementState(),
                onSkip = null,
                savedAnnouncement = "ذخیره شد",
            )
        }

        composeRule.onNodeWithText("ذخیره شد").assertIsDisplayed()
    }
}
