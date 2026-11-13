package com.mathlearning.app.preview

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ClayDepth
import com.mathlearning.core.designsystem.ClaySurface
import com.mathlearning.core.designsystem.GuideBubble
import com.mathlearning.core.designsystem.HintCard
import com.mathlearning.core.designsystem.LessonActionBar
import com.mathlearning.core.designsystem.LessonProgressHeader
import com.mathlearning.core.designsystem.RecoveryCard
import com.mathlearning.core.designsystem.ResultSummary
import com.mathlearning.core.designsystem.ShomaraPathNode
import com.mathlearning.core.designsystem.ShomaraPathConnector
import com.mathlearning.core.designsystem.ShomaraPathNodeVisualState
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.UnitHeader

/**
 * DesignSystemGalleryActivity (P13, debug-only) — renders every new primitive in light theme
 * with an RTL toggle. Launch from adb for screenshot regression evidence:
 *   adb shell am start -n com.mathlearning.app/.preview.DesignSystemGalleryActivity
 *   adb shell am start -e rtl true -n ... (RTL variant)
 */
class DesignSystemGalleryActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val rtl = intent.getBooleanExtra("rtl", false)
        setContent {
            ShomaraTheme {
                CompositionLocalProvider(LocalLayoutDirection provides if (rtl) LayoutDirection.Rtl else LayoutDirection.Ltr) {
                    Surface(color = ShomaraTokens.ColorCanvas, modifier = Modifier.fillMaxSize()) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Text("SHOMARA Design System Gallery — " + if (rtl) "RTL" else "LTR")
                            UnitHeader(title = "ایستگاه ۷ — عددهای ۱ و ۲", chapterLabel = "فصل ۲")
                            LessonProgressHeader(done = 3, total = 8)
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                ClaySurface(depth = ClayDepth.FLAT, modifier = Modifier.padding(4.dp)) { Text("Flat") }
                                ClaySurface(depth = ClayDepth.HINT, modifier = Modifier.padding(4.dp)) { Text("Hint") }
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                ClaySurface(depth = ClayDepth.SOFT, modifier = Modifier.padding(4.dp)) { Text("Soft") }
                                ClaySurface(depth = ClayDepth.FEATURED, modifier = Modifier.padding(4.dp), containerColor = ShomaraTokens.ColorAmberSoft) { Text("Featured") }
                            }
                            HintCard("به شکل‌ها نگاه کن و مقایسه کن.")
                            GuideBubble("با هم پیدا کنیم؛ هر بار یکی.")
                            ResultSummary(passed = true, title = "آفرین!", detail = "ایستگاه را کامل کردی.")
                            ResultSummary(passed = false, title = "نزدیک بودی", detail = "با مرور دوباره، درست می‌شود.")
                            RecoveryCard(title = "ST07.P2.i02", detail = "دو کفش — یک مرور کوتاه")
                            LessonActionBar { Text("[CTA slot — one primary]") }
                            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                ShomaraPathNode(ShomaraPathNodeVisualState.CURRENT, "ST07")
                                ShomaraPathNode(ShomaraPathNodeVisualState.COMPLETED, "ST06")
                                ShomaraPathNode(ShomaraPathNodeVisualState.LOCKED, "ST08")
                            }
                            ShomaraPathConnector()
                        }
                    }
                }
            }
        }
    }
}
