package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription

/** Card/Choice state matrix: default/pressed/selected/checked/correct/retry/disabled (COMPONENT_READINESS). */
enum class ShomaraCardState { Default, Pressed, Selected, Checked, Correct, Retry, Disabled }

/**
 * Pure card logic. Status is never color-only: every state carries a Persian state label for
 * TalkBack and a caller-visible mark glyph. Correctness is rendered from caller/server state —
 * the component never decides mastery (COMPONENT_READINESS Progress/Feedback policy).
 */
object ShomaraCardLogic {
    fun depthFor(state: ShomaraCardState): ShomaraClayDepth = when (state) {
        ShomaraCardState.Disabled -> ShomaraClayDepth.Flat
        ShomaraCardState.Pressed -> ShomaraClayDepth.Hint
        else -> ShomaraClayDepth.Soft
    }

    fun colorsFor(state: ShomaraCardState): Triple<Color, Color, Color> = when (state) {
        ShomaraCardState.Correct -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorPrimaryDark)
        ShomaraCardState.Retry -> Triple(ShomaraTokens.ColorAmberSoft, ShomaraTokens.ColorAmberEdge, ShomaraTokens.ColorAmberInk)
        ShomaraCardState.Disabled -> Triple(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine2, ShomaraTokens.ColorMuted)
        else -> Triple(ShomaraTokens.ColorSurface, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
    }

    /** Non-color status carrier: Persian state label (TalkBack stateDescription) per state. */
    fun stateLabelFor(state: ShomaraCardState): String = when (state) {
        ShomaraCardState.Default -> ""
        ShomaraCardState.Pressed -> "فشرده"
        ShomaraCardState.Selected -> "انتخاب‌شده"
        ShomaraCardState.Checked -> "علامت خورده"
        ShomaraCardState.Correct -> "درست"
        ShomaraCardState.Retry -> "دوباره تلاش کن"
        ShomaraCardState.Disabled -> "غیرفعال"
    }

    /** Non-color status mark rendered beside the content. */
    fun markFor(state: ShomaraCardState): String = when (state) {
        ShomaraCardState.Correct -> "✓"
        ShomaraCardState.Retry -> "↺"
        ShomaraCardState.Checked -> "●"
        else -> ""
    }
}

@Composable
fun ShomaraCard(
    modifier: Modifier = Modifier,
    state: ShomaraCardState = ShomaraCardState.Default,
    onClick: (() -> Unit)? = null,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
    content: @Composable () -> Unit,
) {
    val (container, border, _) = ShomaraCardLogic.colorsFor(state)
    var pressed by remember { mutableStateOf(false) }
    val resolved = when {
        state != ShomaraCardState.Default -> state
        pressed -> ShomaraCardState.Pressed
        else -> ShomaraCardState.Default
    }
    val resolvedDepth = ShomaraCardLogic.depthFor(resolved)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraTokens.ComponentRowH)
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, border, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .semantics {
                val label = ShomaraCardLogic.stateLabelFor(resolved)
                if (label.isNotEmpty()) stateDescription = label
                if (resolved == ShomaraCardState.Selected || resolved == ShomaraCardState.Checked) selected = true
            }
            .let {
                if (onClick != null && ShomaraClay.specFor(resolvedDepth) != ShomaraClay.Flat) {
                    it.clickable {
                        if (tapGuard.begin()) {
                            pressed = true
                            try { onClick() } finally { pressed = false; tapGuard.end() }
                        }
                    }
                } else it
            }
            .padding(ShomaraTokens.Space16),
    ) {
        val mark = ShomaraCardLogic.markFor(resolved)
        if (mark.isNotEmpty()) {
            Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                Text(text = mark, style = ShomaraTypography.Title, color = ShomaraCardLogic.colorsFor(resolved).third)
                content()
            }
        } else {
            content()
        }
    }
}

/** Single-choice reducer — the component renders status; mastery/correctness stays server-side. */
object ShomaraChoiceLogic {
    /** Single-select toggle: selecting a selected option keeps it selected (idempotent), never clears to null. */
    fun select(options: List<String>, selectedId: String?, tappedId: String): String {
        require(tappedId in options) { "tapped id is not an option" }
        return tappedId
    }

    /** A statused option must always expose a non-color mark or label. */
    fun requiresExplicitMark(state: ShomaraCardState): Boolean =
        state == ShomaraCardState.Correct || state == ShomaraCardState.Retry || state == ShomaraCardState.Checked

    fun maxFeaturedSurfaces(): Int = 1
}

@Composable
fun ShomaraChoiceTile(
    label: String,
    selectedId: String?,
    id: String,
    onSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    state: ShomaraCardState = ShomaraCardState.Default,
    enabled: Boolean = true,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    val resolvedState = when {
        !enabled -> ShomaraCardState.Disabled
        selectedId == id -> ShomaraCardState.Selected
        else -> state
    }
    ShomaraCard(
        modifier = modifier,
        state = resolvedState,
        onClick = if (enabled) ({ onSelected(ShomaraChoiceLogic.select(listOf(id), selectedId, id)) }) else null,
        tapGuard = tapGuard,
    ) {
        Column {
            Text(text = label, style = ShomaraTypography.Body, color = ShomaraCardLogic.colorsFor(resolvedState).third)
        }
    }
}
