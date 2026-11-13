package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/**
 * LessonKit (P13) — the reusable lesson-chrome primitives from the P12 contracts:
 * UnitHeader, LessonProgressHeader, LessonActionBar (one primary CTA), HintCard,
 * GuideBubble, ResultSummary, RecoveryCard. All token-driven, RTL-safe, one Featured
 * surface max per viewport (callers own that rule).
 */

/** UnitHeader — chapter ribbon over the path/unit (Family 06/07 opener). */
@Composable
fun UnitHeader(title: String, chapterLabel: String, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTopBarH)
            .padding(horizontal = ShomaraTokens.Space24, vertical = ShomaraTokens.Space8)
            .semantics { },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(chapterLabel, style = ShomaraTypography.Caption)
            Text(title, style = ShomaraTypography.Title)
        }
    }
}

/** LessonProgressHeader — progress that explains REMAINING work (done vs total, Persian digits). */
@Composable
fun LessonProgressHeader(done: Int, total: Int, modifier: Modifier = Modifier) {
    val doneFa = ShomaraDigits.toFa(done)
    val totalFa = ShomaraDigits.toFa(total)
    val remainingFa = ShomaraDigits.toFa((total - done).coerceAtLeast(0))
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentProgressH)
            .padding(horizontal = ShomaraTokens.Space24)
            .semantics { },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("گام $doneFa از $totalFa", style = ShomaraTypography.Caption)
        Text("مانده: $remainingFa", style = ShomaraTypography.Caption)
    }
}

/** LessonActionBar — the fixed bottom slot holding the ONE primary CTA (Family 09/10 contract). */
@Composable
fun LessonActionBar(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = ShomaraTokens.Space24, vertical = ShomaraTokens.Space12),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        content()
    }
}

/** HintCard — hint display for P1..P3 only (callers gate with ShomaraMacroStages.HINT_BANNED). */
@Composable
fun HintCard(text: String, modifier: Modifier = Modifier) {
    ClaySurface(
        depth = ClayDepth.HINT,
        modifier = modifier.fillMaxWidth().heightIn(min = ShomaraTokens.ComponentTouchMin),
        containerColor = ShomaraTokens.ColorSurfaceAlt,
    ) {
        Text(text, style = ShomaraTypography.Body, modifier = Modifier.padding(ShomaraTokens.Space12))
    }
}

/** GuideBubble — guide speech bubble (character-agnostic; the guide face is CONTENT-006). */
@Composable
fun GuideBubble(text: String, modifier: Modifier = Modifier) {
    ClaySurface(
        depth = ClayDepth.SOFT,
        modifier = modifier.fillMaxWidth(),
        containerColor = ShomaraTokens.ColorSurface,
    ) {
        Text(text, style = ShomaraTypography.Body, modifier = Modifier.padding(ShomaraTokens.Space16))
    }
}

/** ResultSummary — pass/fail result summary without shame (Family 11 contract). */
@Composable
fun ResultSummary(passed: Boolean, title: String, detail: String, modifier: Modifier = Modifier) {
    ClaySurface(
        depth = if (passed) ClayDepth.FEATURED else ClayDepth.SOFT,
        modifier = modifier.fillMaxWidth(),
        containerColor = if (passed) ShomaraTokens.ColorAmberSoft else ShomaraTokens.ColorSurface,
    ) {
        Column(modifier = Modifier.padding(ShomaraTokens.Space16)) {
            Text(title, style = ShomaraTypography.Title)
            Text(detail, style = ShomaraTypography.Body)
        }
    }
}

/** RecoveryCard — one mistake-review entry (IDs only; the mistake CONTENT never stores answers). */
@Composable
fun RecoveryCard(title: String, detail: String, modifier: Modifier = Modifier) {
    ClaySurface(
        depth = ClayDepth.SOFT,
        modifier = modifier.fillMaxWidth().heightIn(min = ShomaraTokens.ComponentRowH),
        containerColor = ShomaraTokens.ColorSurface,
    ) {
        Column(modifier = Modifier.padding(ShomaraTokens.Space12)) {
            Text(title, style = ShomaraTypography.Title)
            Text(detail, style = ShomaraTypography.Body)
        }
    }
}
