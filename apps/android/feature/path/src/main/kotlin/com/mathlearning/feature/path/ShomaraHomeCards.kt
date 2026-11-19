package com.mathlearning.feature.path

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog

/**
 * C04 of the Home handoff: the chapter the child is actually in, with real progress.
 *
 * Only facts the caller already holds are rendered — the chapter label, the station span of that
 * chapter and how many stations of it are complete. No grade is shown because this build holds no
 * grade for the learner (O5), and inventing one is not allowed.
 */
@Composable
internal fun ShomaraChapterProgressCard(
    chapter: Int,
    progress: ShomaraPathProgress,
    modifier: Modifier = Modifier,
) {
    val completed = ShomaraPathGraphLogic.completedInChapter(chapter, progress)
    val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
    val fraction = if (total <= 0) 0f else (completed.toFloat() / total.toFloat()).coerceIn(0f, 1f)
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        color = ShomaraHomeUiTokens.Surface,
        border = BorderStroke(ShomaraTokens.ClaySoftBorderWidth, ShomaraHomeUiTokens.Border),
        shadowElevation = ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation,
    ) {
        Column(
            modifier = Modifier.padding(ShomaraTokens.Space16),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            ) {
                Box(
                    modifier = Modifier
                        .size(ShomaraTokens.ComponentNodeSize / 2)
                        .background(
                            ShomaraHomeUiTokens.VioletSoft,
                            RoundedCornerShape(ShomaraTokens.RadiusSm),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(
                        painter = painterResource(R.drawable.shomara_ui_book),
                        contentDescription = null,
                        modifier = Modifier.size(ShomaraTokens.Space16),
                    )
                }
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                    Text(
                        text = ShomaraChapterCatalog.labelFor(chapter),
                        style = ShomaraTypography.Caption,
                        color = ShomaraHomeUiTokens.VioletDark,
                        textAlign = TextAlign.End,
                    )
                    Text(
                        text = ShomaraPathGraphLogic.chapterSpanLabel(chapter),
                        style = ShomaraTypography.Title,
                        color = ShomaraHomeUiTokens.Ink,
                        textAlign = TextAlign.End,
                        modifier = Modifier.semantics { heading() },
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
                    // The visible count owns the words; the bar only exposes the range, so TalkBack
                    // never says the same sentence twice for one card.
                    .semantics {
                        progressBarRangeInfo = ProgressBarRangeInfo(fraction, 0f..1f)
                    },
                contentAlignment = Alignment.CenterStart,
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(fraction)
                        .height(ShomaraTokens.ComponentProgressH)
                        .background(
                            ShomaraHomeUiTokens.Green,
                            RoundedCornerShape(ShomaraTokens.RadiusPill),
                        ),
                )
            }
            Text(
                text = "${ShomaraDigits.toFa(completed)} از ${ShomaraDigits.toFa(total)} کامل شد",
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.Muted,
            )
        }
    }
}

/**
 * C05 of the Home handoff: the station the child continues from, with exactly one primary action.
 *
 * This is the Featured surface of the viewport (ADR-0040 pairing: amberSoft fill, amber border), so
 * the continue action is the obvious focal point of Home. The station title is the real projected
 * title; nothing here decides unlocks or progress.
 */
@Composable
internal fun ShomaraContinueStationCard(
    stationId: String,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier,
    actionLabel: String = ShomaraHomeStrings.Continue,
) {
    val station = ShomaraStationCatalog.station(stationId)
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        color = ShomaraTokens.ColorAmberSoft,
        border = BorderStroke(ShomaraTokens.ClayFeaturedBorderWidth, ShomaraHomeUiTokens.Amber),
        shadowElevation = ShomaraClay.specFor(ShomaraClayDepth.Featured).elevation,
    ) {
        Column(
            modifier = Modifier.padding(ShomaraTokens.Space16),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        ) {
            Text(
                text = ShomaraHomeStrings.ContinueEyebrow,
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.AmberInk,
            )
            Text(
                text = station.workingTitle,
                style = ShomaraTypography.Title,
                color = ShomaraHomeUiTokens.Ink,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = ShomaraHomeStrings.continueSupport(ShomaraChapterCatalog.labelFor(station.chapter)),
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.AmberInk,
            )
            Spacer(Modifier.height(ShomaraTokens.Space4))
            ShomaraButton(
                text = actionLabel,
                onClick = onContinue,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
        }
    }
}
