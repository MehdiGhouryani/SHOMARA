package com.mathlearning.app.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test

class FoundationScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun rendersFoundationStateWithStableSemantics() {
        composeRule.setContent { FoundationScreen() }

        composeRule.onNodeWithTag("foundation-screen").assertIsDisplayed()
        composeRule.onNodeWithText("زیرساخت اندروید شمارا").assertIsDisplayed()
    }
}
