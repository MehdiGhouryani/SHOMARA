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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription

/** AudioControl state matrix: unavailable/loading/playing/paused/failed/cached (COMPONENT_READINESS). */
enum class ShomaraAudioState { Unavailable, Loading, Playing, Paused, Failed, Cached }

enum class ShomaraAudioAction { None, Play, Pause, Retry }

/**
 * Audio contract (COMPONENT_READINESS AudioControl row): a missing or failed track NEVER locks
 * the lesson — [ShomaraAudioLogic.isContentLocked] is false for every state and the UI must show
 * a visible Persian text fallback whenever audio is unavailable or failed.
 */
object ShomaraAudioLogic {
    fun requiresTextFallback(state: ShomaraAudioState): Boolean =
        state == ShomaraAudioState.Unavailable || state == ShomaraAudioState.Failed

    /** Contract constant: content is never gated behind audio. */
    fun isContentLocked(@Suppress("UNUSED_PARAMETER") state: ShomaraAudioState): Boolean = false

    fun labelFor(state: ShomaraAudioState): String = when (state) {
        ShomaraAudioState.Unavailable -> "صدا برای این درس موجود نیست"
        ShomaraAudioState.Loading -> "در حال بارگذاری صدا"
        ShomaraAudioState.Playing -> "در حال پخش"
        ShomaraAudioState.Paused -> "متوقف شد"
        ShomaraAudioState.Failed -> "پخش صدا ناموفق بود؛ متن درس را می‌خوانیم"
        ShomaraAudioState.Cached -> "آمادهٔ پخش"
    }

    fun actionFor(state: ShomaraAudioState): ShomaraAudioAction = when (state) {
        ShomaraAudioState.Playing -> ShomaraAudioAction.Pause
        ShomaraAudioState.Paused, ShomaraAudioState.Cached -> ShomaraAudioAction.Play
        ShomaraAudioState.Failed -> ShomaraAudioAction.Retry
        else -> ShomaraAudioAction.None
    }

    fun controlLabelFor(state: ShomaraAudioState): String = when (actionFor(state)) {
        ShomaraAudioAction.Pause -> "توقف"
        ShomaraAudioAction.Play -> "پخش"
        ShomaraAudioAction.Retry -> "تلاش دوباره"
        ShomaraAudioAction.None -> ""
    }

    fun controlEnabled(state: ShomaraAudioState): Boolean = actionFor(state) != ShomaraAudioAction.None

    fun colorsFor(state: ShomaraAudioState): Pair<Color, Color> = when (state) {
        ShomaraAudioState.Playing -> ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorPrimaryDark
        ShomaraAudioState.Failed -> ShomaraTokens.ColorAmberSoft to ShomaraTokens.ColorAmberInk
        else -> ShomaraTokens.ColorSurface to ShomaraTokens.ColorInk
    }
}

@Composable
fun ShomaraAudioControl(
    state: ShomaraAudioState,
    textFallback: String?,
    modifier: Modifier = Modifier,
    onAction: (ShomaraAudioAction) -> Unit = {},
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    val (container, content) = ShomaraAudioLogic.colorsFor(state)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            // Batch 2: the audio card gets its hairline border, so it reads as
            // one card instead of a loose patch of the canvas (same frame as
            // every other surface card; no new token, no new size).
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .padding(ShomaraTokens.Space8),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            val action = ShomaraAudioLogic.actionFor(state)
            if (state == ShomaraAudioState.Loading) {
                CircularProgressIndicator(modifier = Modifier.defaultMinSize(minWidth = ShomaraTokens.ComponentTouchMin, minHeight = ShomaraTokens.ComponentTouchMin).padding(ShomaraTokens.Space8), color = ShomaraTokens.ColorPrimary)
            } else if (ShomaraAudioLogic.controlEnabled(state)) {
                // Batch 2: the control renders only when it has a real action.
                // Before, the Unavailable state rendered an empty 48dp box
                // (controlLabel is "" there) — a dead visual with no label.
                // The state line beside it already says the audio is missing,
                // and the mandatory text fallback below carries the lesson.
                val controlLabel = ShomaraAudioLogic.controlLabelFor(state)
                Box(
                    modifier = Modifier
                        .defaultMinSize(minWidth = ShomaraTokens.ComponentTouchMin, minHeight = ShomaraTokens.ComponentTouchMin)
                        // ADR-0040 R1: the control is tactile, so it renders
                        // its Soft clay depth.
                        .shadow(ShomaraTokens.ClaySoftElevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .semantics {
                            role = Role.Button
                            if (ShomaraAudioLogic.labelFor(state).isNotEmpty()) stateDescription = ShomaraAudioLogic.labelFor(state)
                        }
                        .clickable(enabled = ShomaraAudioLogic.controlEnabled(state), role = Role.Button) {
                            if (tapGuard.begin()) {
                                try { onAction(action) } finally { tapGuard.end() }
                            }
                        }
                        .padding(ShomaraTokens.Space8),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(text = controlLabel, style = ShomaraTypography.Body, color = content)
                }
            }
            Text(
                text = ShomaraAudioLogic.labelFor(state),
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
        }
        // Mandatory visible Persian fallback so the lesson is NEVER locked by missing audio.
        if (ShomaraAudioLogic.requiresTextFallback(state) && !textFallback.isNullOrEmpty()) {
            Text(
                text = textFallback,
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ShomaraTokens.ColorCanvas, RoundedCornerShape(ShomaraTokens.RadiusSm))
                    .padding(ShomaraTokens.Space8),
            )
        }
    }
}
