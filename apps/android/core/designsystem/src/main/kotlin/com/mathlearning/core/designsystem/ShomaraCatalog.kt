package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

/**
 * N03-06 catalog matrix: every fixture set must be rendered deterministically across the three
 * canonical widths (360/390/412dp), both font scales, light theme, RTL interface and LTR math.
 * Rendered screenshots are a Paparazzi/device gate (NATIVE_PENDING until that evidence exists);
 * this matrix plus the JVM tests are the N03-verifiable part.
 */
object ShomaraCatalogMatrix {
    val Widths: List<Int> = listOf(360, 390, 412)
    val FontScales: List<Float> = listOf(1.0f, 2.0f)

    /** The nine canonical component families in COMPONENT_READINESS order. */
    val Families: List<String> = listOf(
        "Button",
        "TextField/OTP",
        "Card/Choice",
        "Feedback",
        "Progress",
        "TopBar/TabBar",
        "Dialog/Sheet",
        "AudioControl",
        "Manipulative",
    )

    fun covers(width: Int, fontScale: Float, families: Collection<String>): Boolean =
        width in Widths && fontScale in FontScales && Families.all { it in families }

    fun fullWidthFixtureWidth(width: Int): Dp = width.dp
}

/**
 * Deterministic light-theme catalog covering all nine component families. Every fixture uses
 * canonical tokens only (enforced by scripts/verify-design-system-native.mjs).
 */
@Composable
fun ShomaraDesignSystemCatalog(
    width: Dp,
    fontScale: Float,
    modifier: Modifier = Modifier,
) {
    CompositionLocalProvider(
        LocalLayoutDirection provides ShomaraDirections.DefaultInterfaceDirection,
        LocalDensity provides LocalDensity.current.let { androidx.compose.ui.unit.Density(it.density, fontScale) },
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .background(ShomaraTokens.ColorCanvas)
                .padding(ShomaraTokens.Space16),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        ) {
            Text(text = "SHOMARA Design System — ${ShomaraDigits.toFa(width.value.toInt())}dp", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)

            // Button — Primary/Secondary/Ghost + loading.
            ShomaraButton(text = "ادامه", onClick = {}, variant = ShomaraButtonVariant.Primary)
            ShomaraButton(text = "بازگشت", onClick = {}, variant = ShomaraButtonVariant.Secondary)
            ShomaraButton(text = "بعداً", onClick = {}, variant = ShomaraButtonVariant.Ghost)
            ShomaraButton(text = "در حال ذخیره", onClick = {}, variant = ShomaraButtonVariant.Primary, loading = true)

            // TextField + OTP (LTR math inside RTL).
            ShomaraTextField(value = "", onValueChange = {}, label = "نام شما", hint = "مثلاً آریا", focused = true)
            ShomaraTextField(value = "", onValueChange = {}, label = "شماره تلفن", hint = "۰۹۱۲…", numericLtr = true, errorText = "شماره را کامل وارد کنید")
            ShomaraOtpInput(state = ShomaraOtpState.empty(4), onStateChange = {})

            // Card/Choice.
            ShomaraCard(state = ShomaraCardState.Correct) { Text(text = "کارت درست", style = ShomaraTypography.Body) }
            ShomaraCard(state = ShomaraCardState.Retry) { Text(text = "کارت دوباره", style = ShomaraTypography.Body) }
            ShomaraChoiceTile(label = "گزینهٔ انتخاب‌شده", selectedId = "a", id = "a", onSelected = {})

            // Feedback.
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Correct)
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry)
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery)

            // Progress.
            ShomaraProgressBar(state = ShomaraProgressState(fraction = 0.4f))
            ShomaraProgressBar(state = ShomaraProgressState(), reducedMotion = true)
            ShomaraProgressBar(state = ShomaraProgressState(fraction = 0.3f, offline = true))

            // TopBar/TabBar.
            ShomaraTopBar(title = "ایستگاه شمارش", onBack = {})
            ShomaraTabBar(
                tabs = ShomaraChildTabs.All.map { ShomaraTab(id = it, label = it) },
                selectedId = ShomaraChildTabs.Path,
                onSelected = {},
            )

            // Dialog/Sheet fixtures render through logic previews (open state is interactive).
            ShomaraCard(state = ShomaraCardState.Default) {
                Text(text = "Dialog: open/busy/error/dismiss-blocked — منطق در ShomaraDialogLogic", style = ShomaraTypography.Caption)
            }

            // AudioControl with mandatory fallback.
            ShomaraAudioControl(state = ShomaraAudioState.Unavailable, textFallback = "سه سیب و دو سیب؛ با هم پنج سیب شد.") // نمونهٔ transcript؛ callers جایگزین می‌کنند
            ShomaraAudioControl(state = ShomaraAudioState.Playing, textFallback = null)

            // Manipulative: LTR equation inside RTL + tiles in the canonical band.
            ShomaraEquationSlot(operands = listOf("۲", "۳", "۵"), operators = listOf("+", "="))
            Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8), verticalAlignment = Alignment.CenterVertically) {
                ShomaraNumberTile(tileId = "t1", label = "۲", state = ShomaraManipulativeState.Active, onTap = {})
                ShomaraNumberTile(tileId = "t2", label = "۳", state = ShomaraManipulativeState.Accepted, onTap = {})
                ShomaraNumberTile(tileId = "t3", label = "۴", state = ShomaraManipulativeState.Locked, onTap = {})
            }
        }
    }
}
