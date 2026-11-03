package com.mathlearning.core.designsystem

import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasStateDescription
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

/**
 * N08-02 machine-verifiable semantics for interactive design-system controls
 * (role / label / selected / disabled / error / action contracts). Instrumented
 * Compose test — the test API resolves only for the android variant. Runs via
 * :core:designsystem:connectedCheck on a device/emulator; until that executes,
 * compilation is verified by the build. The REAL TalkBack gesture walkthrough
 * stays a separately tracked NATIVE_PENDING gate.
 */
class ShomaraInteractiveSemanticsTest {

    @get:Rule
    val compose = createComposeRule()

    // ---- Button: role + label + disabled/loading state descriptions ----

    @Test
    fun buttonAnnouncesTextLabelAndClickAction() {
        compose.setContent {
            ShomaraButton(text = "ادامه", onClick = {})
        }
        compose.onNodeWithText("ادامه").assert(hasClickAction())
    }

    @Test
    fun disabledButtonNotClickableAnnouncesState() {
        compose.setContent {
            ShomaraButton(text = "ادامه", onClick = {}, enabled = false)
        }
        val node = compose.onNodeWithText("ادامه")
        node.assert(hasStateDescription("غیرفعال"))
        // disabled: no click action exposed to a11y services
        node.assert(!hasClickAction())
    }

    @Test
    fun loadingButtonKeepsLabelAnnouncesLoading() {
        compose.setContent {
            ShomaraButton(text = "ارسال", onClick = {}, loading = true)
        }
        val node = compose.onNodeWithText("ارسال")
        node.assert(hasStateDescription("در حال انجام"))
        node.assert(!hasClickAction())
    }

    // ---- Card: selected state semantics ----

    @Test
    fun selectedCardAnnouncesStateAndClickAction() {
        var clicks = 0
        compose.setContent {
            ShomaraCard(state = ShomaraCardState.Selected, onClick = { clicks += 1 }) {
                androidx.compose.material3.Text("گزینهٔ الف")
            }
        }
        compose.onNodeWithText("گزینهٔ الف").assert(hasStateDescription("انتخاب‌شده")).assert(hasClickAction())
        compose.onNodeWithText("گزینهٔ الف").performClick()
        assertEquals(1, clicks)
    }

    @Test
    fun disabledCardHasNoClickAction() {
        compose.setContent {
            ShomaraCard(state = ShomaraCardState.Disabled, onClick = {}) {
                androidx.compose.material3.Text("گزینهٔ الف")
            }
        }
        compose.onNodeWithText("گزینهٔ الف").assert(hasStateDescription("غیرفعال")).assert(!hasClickAction())
    }

    // ---- OTP: per-digit descriptions in strict LTR order ----

    @Test
    fun otpCellsAnnounceDigitPositionDescriptions() {
        val state = ShomaraOtpState.empty(4).advance(1).advance(2)
        compose.setContent {
            ShomaraOtpInput(state = state, onStateChange = {})
        }
        // Digit values render as text nodes; per-cell contentDescription is set on each cell.
        compose.onNodeWithText("1").assert(hasContentDescription("رقم ۱ از ۴"))
        compose.onNodeWithText("2").assert(hasContentDescription("رقم ۲ از ۴"))
    }

    @Test
    fun otpCellsClickableForDirectFocus() {
        // Fill three digits so the third cell renders a text node we can query.
        val filled = ShomaraOtpState.empty(4).advance(1).advance(2).advance(3)
        var receivedFilled: ShomaraOtpState? = null
        compose.setContent {
            ShomaraOtpInput(state = filled, onStateChange = { receivedFilled = it })
        }
        compose.onNodeWithText("3").assert(hasClickAction())
        compose.onNodeWithText("3").performClick()
        compose.runOnIdle { assertEquals(2, receivedFilled?.focusIndex) }
    }

    @Test
    fun disabledOtpCellsExposeNoClickAction() {
        // A filled cell renders digit text we can query; disabled input must not expose OnClick.
        val filled = ShomaraOtpState.empty(4).advance(1)
        compose.setContent {
            ShomaraOtpInput(state = filled, onStateChange = {}, enabled = false)
        }
        compose.onNodeWithText("1").assert(!hasClickAction())
    }

    // ---- TextField: error semantics (non-color status carrier) ----

    @Test
    fun invalidTextFieldAnnouncesErrorMessage() {
        compose.setContent {
            ShomaraTextField(
                value = "09",
                onValueChange = {},
                label = "شمارهٔ همراه",
                errorText = "شماره باید ۱۱ رقم باشد",
            )
        }
        // The error is announced to a11y services (not conveyed by color alone)
        // and the actionable text is rendered as a readable node.
        compose.onNodeWithText("شماره باید ۱۱ رقم باشد").assertExists()
        compose.onNode(hasErrorMessage("شماره باید ۱۱ رقم باشد")).assertExists()
    }

    @Test
    fun validTextFieldExposesNoErrorSemantics() {
        compose.setContent {
            ShomaraTextField(value = "09123456789", onValueChange = {}, label = "شمارهٔ همراه")
        }
        compose.onNode(hasErrorMessage("شماره باید ۱۱ رقم باشد")).assertDoesNotExist()
    }

    private companion object {
        /** Compose ships no hasError() matcher; the error string lives in SemanticsProperties.Error. */
        fun hasErrorMessage(text: String): SemanticsMatcher = SemanticsMatcher.expectValue(
            SemanticsProperties.Error,
            text,
        )
    }
}
