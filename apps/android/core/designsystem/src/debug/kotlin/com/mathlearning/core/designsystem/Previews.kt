package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection

/**
 * Debug-only @Preview gallery for the design-system primitives (light theme + RTL).
 *
 * Previews live in the debug source set: they are an authoring aid and must never ship inside a
 * release artifact. Screenshot evidence for shipping UI comes from the instrumented Compose
 * tests in :app (captureToImage), not from a preview activity.
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
            ClaySurface(depth = ShomaraClayDepth.Flat, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Flat", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ShomaraClayDepth.Hint, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Hint", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ShomaraClayDepth.Soft, modifier = Modifier.padding(ShomaraTokens.Space4)) { Text("Soft", Modifier.padding(ShomaraTokens.Space12)) }
            ClaySurface(depth = ShomaraClayDepth.Featured, modifier = Modifier.padding(ShomaraTokens.Space4), containerColor = ShomaraTokens.ColorAmberSoft) { Text("Featured", Modifier.padding(ShomaraTokens.Space12)) }
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
