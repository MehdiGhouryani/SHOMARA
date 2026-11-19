package com.mathlearning.feature.path

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** One responsive Home heading with a real settings action and an optional static cameo. */
@Composable
fun ShomaraHomeHeader(
    title: String,
    subtitle: String,
    onSettings: (() -> Unit)?,
    modifier: Modifier = Modifier,
    settingsContentDescription: String = ShomaraHomeStrings.Settings,
    characterSlot: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) {
            Text(
                text = title,
                style = ShomaraTypography.Title,
                color = ShomaraHomeUiTokens.Ink,
                textAlign = TextAlign.End,
                modifier = Modifier.semantics { heading() },
            )
            Spacer(Modifier.height(ShomaraTokens.Space4))
            Text(
                text = subtitle,
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.Muted,
                textAlign = TextAlign.End,
            )
        }
        if (characterSlot != null) {
            Box(
                Modifier.size(ShomaraTokens.ComponentNodeSize),
                contentAlignment = Alignment.Center,
            ) {
                characterSlot()
            }
        }
        if (onSettings != null) {
            Surface(
                onClick = onSettings,
                modifier = Modifier
                    .defaultMinSize(
                        minWidth = ShomaraTokens.ComponentTouchMin,
                        minHeight = ShomaraTokens.ComponentTouchMin,
                    )
                    .semantics { contentDescription = settingsContentDescription },
                shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
                color = ShomaraHomeUiTokens.Surface,
                border = BorderStroke(
                    ShomaraTokens.ClaySoftBorderWidth,
                    ShomaraHomeUiTokens.Border,
                ),
                shadowElevation = ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation,
            ) {
                Box(
                    Modifier.padding(ShomaraTokens.Space12),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(
                        painter = painterResource(R.drawable.shomara_ui_settings),
                        contentDescription = null,
                        modifier = Modifier.size(ShomaraTokens.Space24),
                    )
                }
            }
        }
    }
}

/**
 * Pinned orientation for the path: the real chapter, the real next step and the real remaining
 * count. It is deliberately not a Continue card — no click action, and it never duplicates the
 * Current/Fresh node's station-start interaction.
 *
 * [ShomaraPathScreen] renders this ABOVE the scrolling list, so a returning child who lands on a
 * mid-path Current station still knows where they are, what comes next and how much is left.
 */
@Composable
internal fun ShomaraHomeOrientationStrip(
    chapterLabel: String?,
    nextStepText: String?,
    remainingText: String,
    progressFraction: Float,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation,
                RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .background(
                ShomaraHomeUiTokens.Surface,
                RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .border(
                ShomaraTokens.ClaySoftBorderWidth,
                ShomaraHomeUiTokens.Border,
                RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space12),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
    ) {
        if (chapterLabel != null) {
            Text(
                text = chapterLabel,
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.VioletDark,
            )
        }
        Text(
            text = nextStepText ?: remainingText,
            style = ShomaraTypography.Body,
            color = ShomaraHomeUiTokens.Ink,
        )
        if (nextStepText != null) {
            Text(
                text = remainingText,
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.Muted,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(ShomaraTokens.ComponentProgressH)
                .background(
                    ShomaraHomeUiTokens.GreenSoft,
                    RoundedCornerShape(ShomaraTokens.RadiusPill),
                )
                // The visible «remaining» line owns the words; the bar only exposes progress, so
                // TalkBack never announces the same sentence twice for one orientation strip.
                .semantics {
                    progressBarRangeInfo = ProgressBarRangeInfo(progressFraction.coerceIn(0f, 1f), 0f..1f)
                },
            contentAlignment = Alignment.CenterStart,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progressFraction.coerceIn(0f, 1f))
                    .height(ShomaraTokens.ComponentProgressH)
                    .background(
                        ShomaraHomeUiTokens.Green,
                        RoundedCornerShape(ShomaraTokens.RadiusPill),
                    ),
            )
        }
    }
}
