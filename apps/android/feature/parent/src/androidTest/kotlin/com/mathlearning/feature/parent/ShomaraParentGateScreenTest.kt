package com.mathlearning.feature.parent

import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasSetTextAction
import androidx.compose.ui.test.hasStateDescription
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNode
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * F-03 — the parent gate recomposes on state change (Compose test; a JVM logic test can
 * prove the reducer, but only a rendered screen proves the failure/lock banner actually
 * appears). The gate is built with the real verifier { it == "1234" } — never null, so a
 * null verifier cannot fail-closed the gate into an early lockout.
 *
 * NOTE: feature/parent declares no androidTestImplementation for the Compose test
 * libraries yet (only :app and :core:designsystem do), so this file compiles only once
 * those dependencies are added to this module's build file.
 */
class ShomaraParentGateScreenTest {

    @get:Rule
    val composeRule = createComposeRule()

    private var authenticated = false
    private lateinit var gate: ShomaraParentGate

    private fun setGate() {
        authenticated = false
        gate = ShomaraParentGate(verifier = { it == "1234" })
        composeRule.setContent {
            ShomaraParentGateScreen(
                gate = gate,
                onAuthenticated = { authenticated = true },
            )
        }
    }

    private fun typeWrongPasscode() {
        composeRule.onNode(hasSetTextAction()).performTextInput("9999")
    }

    @Test
    fun failedAttemptShowsTheErrorBannerWithoutTyping() {
        setGate()
        typeWrongPasscode()
        composeRule.onNodeWithText("ورود").performClick()
        composeRule.waitForIdle()

        // The banner appears with no further typing — the gate state recomposes the screen.
        composeRule.onNodeWithText("گذرواژه درست نیست؛ دوباره تلاش کن.").assertIsDisplayed()
        composeRule.runOnIdle { assertFalse(authenticated) }
    }

    @Test
    fun threeWrongAttemptsShowTheLockoutBanner() {
        setGate()
        typeWrongPasscode()
        repeat(3) {
            composeRule.onNodeWithText("ورود").performClick()
            composeRule.waitForIdle()
        }

        composeRule.onNodeWithText("چند لحظه صبر کن و دوباره تلاش کن.").assertIsDisplayed()
        composeRule.runOnIdle {
            assertTrue(gate.state is ShomaraParentGateState.LockedOut)
            assertFalse(authenticated)
        }
    }

    @Test
    fun entryButtonIsDisabledWhileThePasscodeIsBlank() {
        setGate()

        // Blank means no attempt exists yet, so the entry button exposes no click action
        // and announces itself disabled (the same disabled-button contract the
        // design-system semantics tests assert).
        composeRule.onNodeWithText("ورود")
            .assert(hasStateDescription("غیرفعال"))
            .assert(!hasClickAction())
        composeRule.runOnIdle { assertEqualsGateIdle() }
    }

    private fun assertEqualsGateIdle() {
        assertTrue(gate.state is ShomaraParentGateState.Idle)
        assertEquals(0, gate.failures)
    }
}
