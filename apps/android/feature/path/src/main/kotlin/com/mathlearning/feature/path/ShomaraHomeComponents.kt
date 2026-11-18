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
import androidx.compose.foundation.shape.CircleShape
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
 * Real progress/next-step orientation, not a Continue card: it has no click action and never
 * duplicates the Current/Fresh node's station-start interaction.
 */
@Composable
internal fun ShomaraHomePathOverview(
    remainingText: String,
    nextStepText: String?,
    chapterLabel: String?,
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
            .padding(ShomaraTokens.Space16),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(
                modifier = Modifier.weight(1f),
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
            }
            Box(
                modifier = Modifier
                    .size(ShomaraTokens.ComponentTouchMin)
                    .background(ShomaraHomeUiTokens.VioletSoft, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Image(
                    painter = painterResource(R.drawable.shomara_ui_book),
                    contentDescription = null,
                    modifier = Modifier.size(ShomaraTokens.Space24),
                )
            }
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(ShomaraTokens.ComponentProgressH)
                .background(
                    ShomaraHomeUiTokens.GreenSoft,
                    RoundedCornerShape(ShomaraTokens.RadiusPill),
                )
                .semantics {
                    progressBarRangeInfo = ProgressBarRangeInfo(progressFraction, 0f..1f)
                    contentDescription = remainingText
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
