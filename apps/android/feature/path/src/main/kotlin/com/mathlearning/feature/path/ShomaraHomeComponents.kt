package com.mathlearning.feature.path

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraTapGuard
import com.mathlearning.core.designsystem.rememberShomaraTapGuard
import com.mathlearning.core.designsystem.ShomaraTokens

/** Compact header. The optional character slot is an approved static art asset, never a redraw. */
@Composable
fun ShomaraHomeHeader(
    title: String,
    subtitle: String,
    onSettings: (() -> Unit)?,
    modifier: Modifier = Modifier,
    settingsContentDescription: String = "باز کردن تنظیمات",
    characterSlot: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        // In RTL, the first child is at the right edge: title first, then mascot, then settings.
        Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) {
            Text(title, color = ShomaraHomeUiTokens.Ink, fontSize = ShomaraTokens.TypeTitleFontSize,
                lineHeight = ShomaraTokens.TypeTitleLineHeight, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
            Spacer(Modifier.height(ShomaraTokens.Space4))
            Text(subtitle, color = ShomaraHomeUiTokens.Muted, fontSize = ShomaraTokens.TypeBodyFontSize,
                lineHeight = ShomaraTokens.TypeBodyLineHeight, textAlign = TextAlign.End)
        }
        if (characterSlot != null) {
            Box(Modifier.size(ShomaraTokens.ComponentNodeSize), contentAlignment = Alignment.Center) { characterSlot() }
        }
        if (onSettings != null) {
            Surface(
                onClick = onSettings,
                modifier = Modifier
                    .defaultMinSize(minWidth = ShomaraTokens.ComponentTouchMin, minHeight = ShomaraTokens.ComponentTouchMin)
                    .semantics { contentDescription = settingsContentDescription },
                shape = RoundedCornerShape(ShomaraTokens.Space16),
                color = ShomaraHomeUiTokens.Surface,
                border = BorderStroke(ShomaraTokens.Space4, ShomaraHomeUiTokens.Border),
                shadowElevation = ShomaraTokens.Space4,
            ) {
                Box(Modifier.padding(ShomaraTokens.Space12), contentAlignment = Alignment.Center) {
                    androidx.compose.foundation.Image(
                        painter = painterResource(R.drawable.shomara_ui_settings),
                        contentDescription = null,
                        modifier = Modifier.size(ShomaraTokens.Space24),
                    )
                }
            }
        }
    }
}

/** Progress is passed in by the ViewModel; no count is inferred from visible path nodes. */
@Composable
fun ShomaraChapterProgressCard(
    gradeLabel: String,
    chapterTitle: String,
    progress: ShomaraHomeProgressUi?,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = ShomaraHomeUiTokens.Surface,
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        border = BorderStroke(ShomaraTokens.Space4, ShomaraHomeUiTokens.Border),
        shadowElevation = ShomaraTokens.Space4,
    ) {
        Column(Modifier.padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Box(
                    Modifier.background(ShomaraHomeUiTokens.VioletSoft, RoundedCornerShape(ShomaraTokens.Space16))
                        .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8),
                ) {
                    Text(gradeLabel, color = ShomaraHomeUiTokens.VioletDark,
                        fontSize = ShomaraTokens.TypeCaptionFontSize, fontWeight = FontWeight.Bold)
                }
                Text(chapterTitle, color = ShomaraHomeUiTokens.Ink,
                    fontSize = ShomaraTokens.TypeBodyFontSize, lineHeight = ShomaraTokens.TypeBodyLineHeight,
                    fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
            }
            if (progress == null || !progress.isDeterminate) {
                Text(
                    text = progress?.spokenLabel ?: "پیشرفت این فصل در دسترس نیست",
                    modifier = Modifier.fillMaxWidth(),
                    color = ShomaraHomeUiTokens.Muted,
                    fontSize = ShomaraTokens.TypeCaptionFontSize,
                    lineHeight = ShomaraTokens.TypeBodyLineHeight,
                    textAlign = TextAlign.End,
                )
            } else {
                Text(
                    text = progress.spokenLabel,
                    modifier = Modifier.fillMaxWidth(),
                    color = ShomaraHomeUiTokens.Muted,
                    fontSize = ShomaraTokens.TypeCaptionFontSize,
                    lineHeight = ShomaraTokens.TypeBodyLineHeight,
                    textAlign = TextAlign.End,
                )
                LinearProgressIndicator(
                    progress = { progress.fraction },
                    modifier = Modifier.fillMaxWidth().height(ShomaraTokens.Space8).clip(CircleShape).semantics {
                        progressBarRangeInfo = ProgressBarRangeInfo(progress.fraction, 0f..1f)
                        contentDescription = progress.spokenLabel
                    },
                    color = ShomaraHomeUiTokens.Violet,
                    trackColor = ShomaraHomeUiTokens.VioletSoft,
                )
            }
        }
    }
}

/** Single featured continue action. Use a true station projection and an idempotent callback. */
@Composable
fun ShomaraContinueStationCard(
    eyebrow: String,
    title: String,
    supportingText: String?,
    actionLabel: String,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier,
    leadingContent: (@Composable () -> Unit)? = null,
    loading: Boolean = false,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        color = ShomaraHomeUiTokens.Violet,
        shadowElevation = ShomaraTokens.Space4,
    ) {
        Row(
            Modifier.fillMaxWidth().padding(ShomaraTokens.Space16),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // In an RTL Row, the first child is placed on the physical right.
            // Keep the text/CTA first so the optional Number/lesson art sits on the left,
            // matching the approved composition.
            Column(
                Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                horizontalAlignment = Alignment.End,
            ) {
                Text(eyebrow, color = ShomaraHomeUiTokens.OnViolet,
                    fontSize = ShomaraTokens.TypeCaptionFontSize, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.End)
                Text(title, color = ShomaraHomeUiTokens.OnViolet,
                    fontSize = ShomaraTokens.TypeTitleFontSize, lineHeight = ShomaraTokens.TypeTitleLineHeight,
                    fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
                if (!supportingText.isNullOrBlank()) {
                    Text(supportingText, color = ShomaraHomeUiTokens.OnVioletMuted,
                        fontSize = ShomaraTokens.TypeCaptionFontSize, lineHeight = ShomaraTokens.TypeBodyLineHeight, textAlign = TextAlign.End)
                }
                // This is an on-violet contrast treatment. The shared Button currently exposes
                // canonical green variants only; keep the same touch/guard semantics locally
                // rather than rendering a green secondary button against this violet surface.
                val actionModifier = if (loading) {
                    Modifier
                        .fillMaxWidth()
                        .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH)
                        .semantics {
                            role = Role.Button
                            disabled()
                            stateDescription = "در حال انجام"
                        }
                } else {
                    Modifier
                        .fillMaxWidth()
                        .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH)
                        .clickable(role = Role.Button, onClick = {
                            if (tapGuard.beginLatched()) {
                                try { onContinue() } finally { tapGuard.end() }
                            }
                        })
                }
                Surface(
                    modifier = actionModifier,
                    shape = RoundedCornerShape(ShomaraTokens.Space16),
                    color = ShomaraTokens.ColorHomeOnViolet,
                    border = BorderStroke(ShomaraTokens.Space4, ShomaraHomeUiTokens.VioletSoft),
                    shadowElevation = 0.dp,
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space12),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        if (loading) {
                            if (LocalShomaraReducedMotion.current) {
                                Text("•", color = ShomaraHomeUiTokens.VioletDark, fontSize = ShomaraTokens.TypeTitleFontSize)
                            } else {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(ShomaraTokens.Space16),
                                    color = ShomaraHomeUiTokens.VioletDark,
                                    strokeWidth = ShomaraTokens.Space4,
                                )
                            }
                            Spacer(Modifier.size(ShomaraTokens.Space8))
                            Text("در حال انجام", color = ShomaraHomeUiTokens.VioletDark,
                                fontSize = ShomaraTokens.TypeBodyFontSize, fontWeight = FontWeight.Bold)
                        } else {
                            Text(actionLabel, color = ShomaraHomeUiTokens.VioletDark,
                                fontSize = ShomaraTokens.TypeBodyFontSize, lineHeight = ShomaraTokens.TypeBodyLineHeight, fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center)
                        }
                    }
                }
            }
            if (leadingContent != null) {
                Box(Modifier.size(ShomaraTokens.ComponentNodeSize.minus(ShomaraTokens.Space4)), contentAlignment = Alignment.Center) { leadingContent() }
            }
        }
    }
}

/**
 * A label/card companion for an existing ShomaraPathGraph node. The circle/connector itself
 * should be rendered by the existing path graph; do not replace its geometry with this card.
 */
@Composable
fun ShomaraHomeNodeLabelCard(
    title: String,
    description: String?,
    state: ShomaraHomeNodeVisualState,
    modifier: Modifier = Modifier,
    lockedReason: String? = null,
) {
    val label = when (state) {
        ShomaraHomeNodeVisualState.Fresh -> "آمادهٔ شروع"
        ShomaraHomeNodeVisualState.Current -> "ایستگاه فعلی"
        ShomaraHomeNodeVisualState.Completed -> "تکمیل‌شده"
        ShomaraHomeNodeVisualState.Perfect -> "با عملکرد کامل تکمیل‌شده"
        ShomaraHomeNodeVisualState.Locked -> "قفل‌شده"
    }
    val stateColor = when (state) {
        ShomaraHomeNodeVisualState.Completed, ShomaraHomeNodeVisualState.Perfect -> ShomaraHomeUiTokens.Green
        ShomaraHomeNodeVisualState.Current -> ShomaraHomeUiTokens.VioletDark
        ShomaraHomeNodeVisualState.Fresh -> ShomaraHomeUiTokens.AmberInk
        else -> ShomaraHomeUiTokens.Muted
    }
    Surface(
        modifier = modifier.fillMaxWidth().semantics(mergeDescendants = true) {
            stateDescription = if (state == ShomaraHomeNodeVisualState.Locked && !lockedReason.isNullOrBlank()) {
                "$label: $lockedReason"
            } else label
            if (state == ShomaraHomeNodeVisualState.Locked) contentDescription = "$title، $label، ${lockedReason.orEmpty()}"
        },
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        color = ShomaraHomeUiTokens.Surface,
        border = BorderStroke(ShomaraTokens.Space4, ShomaraHomeUiTokens.Border),
        shadowElevation = if (state == ShomaraHomeNodeVisualState.Current) ShomaraTokens.Space4 else ShomaraTokens.Space4,
    ) {
        Column(
            Modifier.padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space12),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
            horizontalAlignment = Alignment.End,
        ) {
            Text(title, color = ShomaraHomeUiTokens.Ink, fontSize = ShomaraTokens.TypeBodyFontSize,
                lineHeight = ShomaraTokens.TypeBodyLineHeight, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
            if (!description.isNullOrBlank()) {
                Text(description, color = ShomaraHomeUiTokens.Muted, fontSize = ShomaraTokens.TypeCaptionFontSize,
                    lineHeight = ShomaraTokens.TypeBodyLineHeight, textAlign = TextAlign.End)
            }
            Text(label, color = stateColor, fontSize = ShomaraTokens.TypeCaptionFontSize,
                lineHeight = ShomaraTokens.TypeBodyLineHeight, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.End)
        }
    }
}
