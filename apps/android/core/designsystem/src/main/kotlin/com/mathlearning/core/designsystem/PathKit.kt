package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * PathKit (P13) — PathNode / PathConnector primitives for Family 06 (extracted from the
 * feature:path implementation so ANY future path renderer uses the same redundant encodings:
 * shape + fill + icon/label + semantics label).
 */
enum class ShomaraPathNodeVisualState { FRESH, CURRENT, COMPLETED, PERFECT, LOCKED }

data class ShomaraPathNodeColors(val fill: Color, val border: Color, val content: Color)

/** Redundant encoding contract: EVERY state differs in fill AND mark AND label (never color-only). */
object ShomaraPathNodeVisuals {
    fun colorsFor(state: ShomaraPathNodeVisualState): ShomaraPathNodeColors = when (state) {
        ShomaraPathNodeVisualState.FRESH -> ShomaraPathNodeColors(ShomaraTokens.ColorPrimary, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
        ShomaraPathNodeVisualState.CURRENT -> ShomaraPathNodeColors(ShomaraTokens.ColorAmber, ShomaraTokens.ColorInk, ShomaraTokens.ColorInk)
        ShomaraPathNodeVisualState.COMPLETED -> ShomaraPathNodeColors(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
        ShomaraPathNodeVisualState.PERFECT -> ShomaraPathNodeColors(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorInk)
        ShomaraPathNodeVisualState.LOCKED -> ShomaraPathNodeColors(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine2, ShomaraTokens.ColorLine2)
    }

    fun markFor(state: ShomaraPathNodeVisualState): String = when (state) {
        ShomaraPathNodeVisualState.FRESH -> "▶"
        ShomaraPathNodeVisualState.CURRENT -> "★"
        ShomaraPathNodeVisualState.COMPLETED -> "✓"
        ShomaraPathNodeVisualState.PERFECT -> "✓✓"
        ShomaraPathNodeVisualState.LOCKED -> "🔒"
    }

    fun labelFor(state: ShomaraPathNodeVisualState): String = when (state) {
        ShomaraPathNodeVisualState.FRESH -> "آماده"
        ShomaraPathNodeVisualState.CURRENT -> "ایستگاه فعلی"
        ShomaraPathNodeVisualState.COMPLETED -> "تکمیل‌شده"
        ShomaraPathNodeVisualState.PERFECT -> "تکمیل بی‌نقص"
        ShomaraPathNodeVisualState.LOCKED -> "قفل"
    }

    fun depthFor(state: ShomaraPathNodeVisualState): ClayDepth = when (state) {
        ShomaraPathNodeVisualState.CURRENT -> ClayDepth.FEATURED
        ShomaraPathNodeVisualState.LOCKED -> ClayDepth.FLAT
        else -> ClayDepth.SOFT
    }
}

/** PathNode — the single path node (current is 84dp Featured per ADR-0039 §6; others 72dp Soft). */
@Composable
fun ShomaraPathNode(
    state: ShomaraPathNodeVisualState,
    label: String,
    modifier: Modifier = Modifier,
    nodeSize: Dp = if (state == ShomaraPathNodeVisualState.CURRENT) ShomaraTokens.ComponentNodeCurrent else ShomaraTokens.ComponentNodeSize,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
) {
    val colors = ShomaraPathNodeVisuals.colorsFor(state)
    Column(modifier = modifier.semantics(mergeDescendants = true) { }, horizontalAlignment = Alignment.CenterHorizontally) {
        ClaySurface(
            depth = ShomaraPathNodeVisuals.depthFor(state),
            shape = CircleShape,
            reducedMotion = reducedMotion,
            containerColor = colors.fill,
            borderColor = colors.border,
            modifier = Modifier.size(nodeSize).heightIn(min = ShomaraTokens.ComponentTouchMin),
        ) {
            Box(modifier = Modifier.size(nodeSize), contentAlignment = Alignment.Center) {
                Text(ShomaraPathNodeVisuals.markFor(state), color = colors.content)
            }
        }
        Text(label, style = ShomaraTypography.Caption, color = colors.content)
        Text(ShomaraPathNodeVisuals.labelFor(state), style = ShomaraTypography.Caption, color = colors.content)
    }
}

/** PathConnector — the connector between two nodes (RTL-safe: direction is the caller's layout job). */
@Composable
fun ShomaraPathConnector(
    modifier: Modifier = Modifier,
    thickness: Dp = ShomaraTokens.Space8,
    color: Color = ShomaraTokens.ColorLine,
    length: Dp = ShomaraTokens.Space40,
) {
    Box(
        modifier = modifier
            .size(width = length, height = thickness)
            .clip(CircleShape)
            .background(color),
    )
}
