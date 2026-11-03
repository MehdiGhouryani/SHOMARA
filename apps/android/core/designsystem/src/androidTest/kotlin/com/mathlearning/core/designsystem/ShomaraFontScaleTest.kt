package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsNode
import androidx.compose.ui.test.DeviceConfigurationOverride
import androidx.compose.ui.test.FontScale
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * N08-03 machine-verifiable font-scale proof: at 100/130/150/200% no design-system control may
 * clip its own text. The definitive measure is [TextLayoutResult.didOverflowHeight] — the exact
 * signal that proved the ORIGINAL defect (ShomaraButton reported didOverflowHeight=true at font
 * scale 2.0 inside a fixed 56dp box, line bottom 155px).
 *
 * Horizontal integrity is asserted from REAL bounds (the label must stay inside its container and
 * the viewport), not from [TextLayoutResult.didOverflowWidth]: that flag is also true for text
 * measured under an unbounded width constraint, which is not something the child can see.
 *
 * Instrumented only — the Compose test API resolves for the android variant, and a source-level
 * assertion cannot prove layout. The emulator run is the evidence.
 *
 * Every test calls setContent exactly ONCE and drives font scale (and label) through state: a
 * second setContent on the same ComponentActivity throws "has already set content".
 */
class ShomaraFontScaleTest {

    @get:Rule
    val compose = createComposeRule()

    private val fontScales = listOf(1.0f, 1.3f, 1.5f, 2.0f)

    /** Real Persian learning-action labels, including the longest shipped primary CTA. */
    private val labels = listOf("ادامه", "ذخیره", "تأیید کد", "شروع ایستگاه ششم", "ثبت پاسخ نمونه")

    // ---- Button: no vertical clipping at any supported font scale ----

    @Test
    fun buttonLabelNeverClipsAtAnyFontScale() {
        val scale = mutableStateOf(1.0f)
        val label = mutableStateOf(labels.first())
        compose.setContent {
            themeAt(scale.value) { ShomaraButton(text = label.value, onClick = {}) }
        }
        for (s in fontScales) {
            for (text in labels) {
                scale.value = s
                label.value = text
                compose.waitForIdle()
                val layout = textLayoutOf(text)
                assertFalse(
                    "button label '$text' clipped at fontScale=$s " +
                        "(lines=${layout.lineCount} height=${layout.size.height})",
                    layout.didOverflowHeight,
                )
            }
        }
    }

    @Test
    fun buttonLabelStaysInsideItsOwnBoxAtTwoHundredPercent() {
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) {
                ShomaraButton(text = "شروع ایستگاه ششم", onClick = {}, modifier = Modifier.testTag("cta"))
            }
        }
        for (s in listOf(1.0f, 2.0f)) {
            scale.value = s
            compose.waitForIdle()
            val button = compose.onNodeWithTag("cta").fetchSemanticsNode().boundsInRoot
            val text = compose.onNodeWithText("شروع ایستگاه ششم", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
            assertTrue(
                "label escaped the button box at fontScale=$s (text=$text button=$button)",
                text.left >= button.left - 1f && text.right <= button.right + 1f,
            )
        }
    }

    @Test
    fun buttonBoxGrowsWithTheLabelInsteadOfClippingIt() {
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) {
                ShomaraButton(text = "شروع ایستگاه ششم", onClick = {}, modifier = Modifier.testTag("cta"))
            }
        }
        val normalHeight = compose.onNodeWithTag("cta").fetchSemanticsNode().size.height
        scale.value = 2.0f
        compose.waitForIdle()
        val scaledHeight = compose.onNodeWithTag("cta").fetchSemanticsNode().size.height

        // A fixed .height(56.dp) kept these two numbers identical; the fix must differ.
        assertTrue(
            "button box must grow with the label: 100%=$normalHeight px, 200%=$scaledHeight px",
            scaledHeight > normalHeight,
        )
    }

    @Test
    fun buttonKeepsTheTokenMinimumHeightAtNormalScale() {
        compose.setContent {
            themeAt(1.0f) {
                ShomaraButton(text = "ادامه", onClick = {}, modifier = Modifier.testTag("cta"))
            }
        }
        val height = compose.onNodeWithTag("cta").fetchSemanticsNode().size.height
        val minPx = with(compose.density) { ShomaraTokens.ComponentButtonH.roundToPx() }
        assertTrue(
            "normal-scale button height $height px must respect the ${ShomaraTokens.ComponentButtonH} token floor ($minPx px)",
            height >= minPx,
        )
    }

    // ---- Card / feedback / text field: the other text-bearing surfaces ----

    @Test
    fun cardLabelNeverClipsAtAnyFontScale() {
        val label = "گزینهٔ درست را انتخاب کن و بعد ادامه بده"
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) {
                ShomaraCard(state = ShomaraCardState.Default) { Text(label) }
            }
        }
        for (s in fontScales) {
            scale.value = s
            compose.waitForIdle()
            val layout = textLayoutOf(label)
            assertFalse("card label clipped at fontScale=$s (lines=${layout.lineCount})", layout.didOverflowHeight)
        }
    }

    @Test
    fun feedbackBannerNeverClipsAtAnyFontScale() {
        val text = "ایراد نداره؛ باز هم امتحان کن!"
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry, text = text) }
        }
        for (s in fontScales) {
            scale.value = s
            compose.waitForIdle()
            val layout = textLayoutOf(text)
            assertFalse("feedback text clipped at fontScale=$s (lines=${layout.lineCount})", layout.didOverflowHeight)
        }
    }

    @Test
    fun textFieldLabelNeverClipsAtAnyFontScale() {
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) {
                Column(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                    ShomaraTextField(value = "۰۹۱۲۳۴۵۶۷۸۹", onValueChange = {}, label = "شمارهٔ همراه")
                }
            }
        }
        for (s in fontScales) {
            scale.value = s
            compose.waitForIdle()
            assertFalse(
                "text field label clipped at fontScale=$s",
                textLayoutOf("شمارهٔ همراه").didOverflowHeight,
            )
        }
    }

    // ---- OTP: the 40sp digit inside a fixed 48dp bead was the second clipping surface ----

    @Test
    fun otpDigitNeverClipsAtAnyFontScale() {
        val filled = ShomaraOtpState.empty(4).advance(1)
        val scale = mutableStateOf(1.0f)
        compose.setContent {
            themeAt(scale.value) {
                Column(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                    ShomaraOtpInput(state = filled, onStateChange = {})
                }
            }
        }
        for (s in fontScales) {
            scale.value = s
            compose.waitForIdle()
            val layout = textLayoutOf("1")
            assertFalse("OTP digit clipped at fontScale=$s (lines=${layout.lineCount})", layout.didOverflowHeight)
        }
    }

    @Test
    fun otpRowStaysInsideTheViewportAtTwoHundredPercent() {
        val filled = ShomaraOtpState.empty(4).advance(1).advance(2).advance(3).advance(4)
        compose.setContent {
            themeAt(2.0f) {
                Column(modifier = Modifier.fillMaxWidth().testTag("viewport")) {
                    ShomaraOtpInput(state = filled, onStateChange = {})
                }
            }
        }
        val rootRight = compose.onNodeWithTag("viewport").fetchSemanticsNode().boundsInRoot.right
        for (digit in listOf("1", "2", "3", "4")) {
            val right = compose.onNodeWithText(digit, useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.right
            assertTrue(
                "OTP digit '$digit' escaped the row at 200% (right=$right > $rootRight)",
                right <= rootRight + 1f,
            )
        }
    }

    @Test
    fun otpRowKeepsStrictLtrOrderAtTwoHundredPercent() {
        val filled = ShomaraOtpState.empty(4).advance(1).advance(2).advance(3).advance(4)
        compose.setContent {
            themeAt(2.0f) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ShomaraOtpInput(state = filled, onStateChange = {})
                }
            }
        }
        // The interface is RTL but digit cells must advance left-to-right by index.
        val xs = listOf("1", "2", "3", "4").map {
            compose.onNodeWithText(it, useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        }
        assertTrue("OTP cells mirrored at 200%: $xs", xs == xs.sorted())
    }

    // ---- Mathematical direction: math stays LTR under an RTL interface at every scale ----

    @Test
    fun themeProvidesRtlInterfaceDirectionRegardlessOfDeviceLocale() {
        // The emulator runs en-US. A Persian product must still lay out RTL, so the theme has to
        // pin the direction itself instead of relying on android:supportsRtl (which only means
        // the app RESPECTS the device direction).
        var captured: LayoutDirection? = null
        compose.setContent {
            themeAt(1.0f) {
                captured = LocalLayoutDirection.current
                androidx.compose.material3.Text("جهت")
            }
        }
        assertEquals(
            "ShomaraTheme must provide LayoutDirection.Rtl at the root (device is en-US)",
            LayoutDirection.Rtl,
            captured,
        )
    }

    @Test
    fun rtlShellDoesNotMirrorMathContent() {
        compose.setContent {
            themeAt(2.0f) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // A Persian (RTL) label next to math (LTR) — both in the same composition.
                    Text("جمع کن")
                    ShomaraEquationSlot(operands = listOf("3", "4", "7"), operators = listOf("+", "="))
                }
            }
        }
        // Persian label starts at the RIGHT edge under RTL; math operands still advance LTR.
        val labelLeft = compose.onNodeWithText("جمع کن", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        val mathX3 = compose.onNodeWithText("3", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        // Math row is LTR: the first operand begins at the left of its own row.
        val mathX4 = compose.onNodeWithText("4", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        assertTrue("math must not mirror: 3@$mathX3 must precede 4@$mathX4", mathX3 < mathX4)
        // The Persian label is RTL-positioned relative to the LTR math start.
        assertTrue("Persian label should sit to the right of the math row start", labelLeft > mathX3)
    }

    @Test
    fun mathDirectionIsLtrRegardlessOfInterfaceDirection() {
        assertEquals(LayoutDirection.Ltr, ShomaraManipulativeRules.mathDirection(LayoutDirection.Rtl))
        assertEquals(LayoutDirection.Ltr, ShomaraManipulativeRules.mathDirection(LayoutDirection.Ltr))
        assertEquals(LayoutDirection.Rtl, ShomaraDirections.DefaultInterfaceDirection)
        assertEquals(LayoutDirection.Ltr, ShomaraDirections.DefaultMathDirection)
    }

    @Test
    fun equationSlotKeepsOperandOrderLtrAtTwoHundredPercent() {
        compose.setContent {
            themeAt(2.0f) {
                // The theme provides RTL at the root; math must not mirror it.
                ShomaraEquationSlot(operands = listOf("7", "8", "15"), operators = listOf("+", "="))
            }
        }
        val x7 = compose.onNodeWithText("7", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        val x8 = compose.onNodeWithText("8", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        val x15 = compose.onNodeWithText("15", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot.left
        assertTrue("equation mirrored at 200%: 7@$x7, 8@$x8", x7 < x8)
        assertTrue("equation mirrored at 200%: 8@$x8, 15@$x15", x8 < x15)
    }

    @Test
    fun numberTileLabelNeverClipsAtTwoHundredPercent() {
        compose.setContent {
            themeAt(2.0f) {
                ShomaraNumberTile(tileId = "t1", label = "۱۲", state = ShomaraManipulativeState.Idle, onTap = {})
            }
        }
        assertFalse("number tile label clipped at 200%", textLayoutOf("۱۲").didOverflowHeight)
    }

    // ---- Long-label stress: a pathological label wraps rather than hiding meaning ----

    @Test
    fun longPersianLabelWrapsInsteadOfTruncating() {
        val long = "این یک برچسب عمداً طولانی است تا رفتار شکستن خط بررسی شود"
        compose.setContent { themeAt(2.0f) { ShomaraButton(text = long, onClick = {}) } }
        val layout = textLayoutOf(long)
        assertFalse("long label clipped at 200%", layout.didOverflowHeight)
        assertTrue("long label must occupy at least one line", layout.lineCount >= 1)
    }

    // ---- theme / measurement helpers ----

    @Composable
    private fun themeAt(scale: Float, content: @Composable () -> Unit) {
        DeviceConfigurationOverride(DeviceConfigurationOverride.FontScale(scale)) {
            ShomaraTheme { content() }
        }
    }

    /** Reads the real [TextLayoutResult] of a Text node from the unmerged semantics tree. */
    private fun textLayoutOf(text: String): TextLayoutResult = layoutResultOf(
        compose.onNodeWithText(text, useUnmergedTree = true).fetchSemanticsNode(),
        text,
    )

    private fun layoutResultOf(node: SemanticsNode, text: String): TextLayoutResult {
        val config = node.config
        assertTrue("node '$text' exposes no GetTextLayoutResult action", config.contains(SemanticsActions.GetTextLayoutResult))
        val results = mutableListOf<TextLayoutResult>()
        config[SemanticsActions.GetTextLayoutResult].action?.invoke(results)
        assertEquals("text layout callback must return exactly one result for '$text'", 1, results.size)
        return results.first()
    }
}