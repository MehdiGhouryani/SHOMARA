package com.mathlearning.feature.lesson

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S4 — the two secondary audio/hint controls.
 *
 * Both are deliberately QUIET: they sit under the scene as a text control pair, sized to the
 * 48dp touch floor with the child radius, and neither can ever become the primary action — the
 * station CTA stays the only filled button (STATION_EXPERIENCE_BLUEPRINT §3).
 */
@Composable
fun ShomaraAudioHintControls(
    canReplay: Boolean,
    showsHint: Boolean,
    onReplay: () -> Unit,
    onHint: () -> Unit,
    modifier: Modifier = Modifier,
    audioSilent: Boolean = false,
) {
    if (!canReplay && !showsHint && !audioSilent) return
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (canReplay) {
            ShomaraQuietControl(
                label = ShomaraLessonStrings.ReplayNarration,
                stateText = if (audioSilent) {
                    ShomaraLessonStrings.AudioSilentState
                } else {
                    ShomaraLessonStrings.ReplayNarrationState
                },
                onClick = onReplay,
                enabled = !audioSilent,
            )
        }
        if (showsHint) {
            ShomaraQuietControl(
                label = ShomaraLessonStrings.HintRequest,
                stateText = ShomaraLessonStrings.HintRequestState,
                onClick = onHint,
                enabled = true,
            )
        }
    }
}

@Composable
private fun ShomaraQuietControl(
    label: String,
    stateText: String,
    onClick: () -> Unit,
    enabled: Boolean,
) {
    val shape = RoundedCornerShape(ShomaraTokens.RadiusMd)
    Text(
        text = label,
        style = ShomaraTypography.Body,
        color = if (enabled) ShomaraTokens.ColorInk else ShomaraTokens.ColorMuted,
        modifier = Modifier
            .defaultMinSize(minHeight = ShomaraTokens.ComponentTouchMin)
            .background(ShomaraTokens.ColorSurfaceAlt, shape)
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, shape)
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = label
                stateDescription = stateText
            }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onClick,
            )
            .padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space8),
    )
}
