package com.mathlearning.app.ui

import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasSetTextAction
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.parent.ShomaraParentGateState
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * Parent-boundary UX contract: the adult credential is a secret on a child's shared device, and
 * the gate must stay fail-closed while still telling the adult what happened.
 */
class ShomaraParentGateSemanticsTest {

    @get:Rule
    val compose = createComposeRule()

    @Test
    fun passcodeFieldIsAnnouncedAsAPassword() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        compose.setContent {
            ShomaraTheme {
                ShomaraParentGateScreen(gate = gate, onAuthenticated = {})
            }
        }
        // Regression: the field used to be a plain text field, so the adult passcode was rendered
        // in clear text and TalkBack read the credential aloud.
        compose.onNode(hasSetTextAction())
            .assertIsDisplayed()
            .assert(SemanticsMatcher.keyIsDefined(SemanticsProperties.Password))
    }

    @Test
    fun gateStaysClosedOnAWrongPasscodeAndStatesWhy() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        var authenticated = false
        compose.setContent {
            ShomaraTheme {
                ShomaraParentGateScreen(gate = gate, onAuthenticated = { authenticated = true })
            }
        }
        compose.onNode(hasSetTextAction()).performTextInput("0000")
        compose.onNodeWithText("ورود").performClick()
        compose.waitForIdle()
        assertFalse(authenticated)
        assertFalse(gate.canEnter())
        // The adult is told what went wrong instead of facing a silently dead button; the message
        // is asserted through the gate's own state, so it can never drift from the rendered copy.
        val failed = gate.state
        assertTrue(failed is ShomaraParentGateState.Failed)
        compose.onNodeWithText((failed as ShomaraParentGateState.Failed).message).assertIsDisplayed()
    }

    @Test
    fun correctPasscodeOpensTheGate() {
        val gate = ShomaraParentGate(verifier = { it == "1234" })
        var authenticated = false
        compose.setContent {
            ShomaraTheme {
                ShomaraParentGateScreen(gate = gate, onAuthenticated = { authenticated = true })
            }
        }
        compose.onNode(hasSetTextAction()).performTextInput("1234")
        compose.onNodeWithText("ورود").performClick()
        compose.waitForIdle()
        assertTrue(gate.canEnter())
        assertTrue(authenticated)
    }
}
