package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.unit.LayoutDirection

/**
 * Preview gallery (P13) — light theme + RTL for every new primitive. Screenshot regression
 * evidence comes from the device gallery run (Gradle task) — @Preview gives IDE/in-CI rendering.
 */
@Composable
private fun Wrap(direction: LayoutDirection, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalLayoutDirection provides direction) {
        Surface(color = ShomaraTokens.ColorCanvas) { Column(Modifier.padding(ShomaraTokens.Space16)) { content() } }
    }
}

@Preview(name = "ClaySurface - LTR", widthDp = 360, showBackground = true)
@Preview(name = "ClaySurface - RTL", widthDp = 360, showBackground = true, locale = "fa")
@Composable
fun ClaySurfacePreviews() {
    Wrap(LayoutDirection.Ltr) {
        Text("Clay tiers", style = ShomaraTypography.Caption)
        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
            ClaySurface(depth = ClayDepth.FLAT, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Flat", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ClayDepth.HINT, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Hint", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ClayDepth.SOFT, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Soft", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ClayDepth.FEATURED, modifier = Modifier.padding(ShomaraTokens.Space4), containerColor = ShomaraTokens.ColorAmberSoft) { Text("Featured", Modifier.padding(ShomaraTokens.Space12)) }
        }
    }
}

@Preview(name = "LessonKit - LTR", widthDp = 360, showBackground = true)
@Preview(name = "LessonKit - RTL", widthDp = 360, showBackground = true, locale = "fa")
@Composable
fun LessonKitPreviews() {
    Wrap(LayoutDirection.Ltr) {
        UnitHeader(title = "ایستگاه ۷", chapterLabel = "فصل ۲ · عددهای ۱ و ۲")
        LessonProgressHeader(done = 3, total = 8)
        HintCard("به شکل‌ها نگاه کن و مقایسه کن.")
        GuideBubble("با هم پیدا کنیم؛ هر بار یکی.")
        ResultSummary(passed = true, title = "آفرین!", detail = "ایستگاه را کامل کردی.")
        ResultSummary(passed = false, title = "نزدیک بودی", detail = "با مرور دوباره، درست می‌شود.")
        RecoveryCard(title = "ST07.P2.i02", detail = "دو کفش — یک مرور کوتاه")
        LessonActionBar { Text("[CTA slot]", style = ShomaraTypography.Caption) }
    }
}

@Preview(name = "PathKit - LTR", widthDp = 360, showBackground = true)
@Preview(name = "PathKit - RTL", widthDp = 360, showBackground = true, locale = "fa")
@Composable
fun PathKitPreviews() {
    Wrap(LayoutDirection.Ltr) {
        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
            ShomaraPathNode(state = ShomaraPathNodeVisualState.CURRENT, label = "ST07")
            ShomaraPathNode(state = ShomaraPathNodeVisualState.COMPLETED, label = "ST06")
            ShomaraPathNode(state = ShomaraPathNodeVisualState.LOCKED, label = "ST08")
            ShomaraPathConnector()
        }
    }
}
