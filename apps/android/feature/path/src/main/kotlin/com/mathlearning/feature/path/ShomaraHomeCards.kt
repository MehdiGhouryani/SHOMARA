package com.mathlearning.feature.path

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraLessonTopic
import com.mathlearning.core.designsystem.ShomaraLessonTopicIcon
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
 * DT-76 (handoff v3 reconciliation): this is the Featured surface of the viewport and now uses the
 * handoff's violet treatment — violet fill, white CTA card, and the optional Number/lesson art on
 * the physical left of the RTL row (reference: ShomaraHomeComponents.kt C05). The eyebrow adapts to
 * the real session state (fresh vs resume) instead of always claiming a continuation.
 */
@Composable
internal fun ShomaraContinueStationCard(
    stationId: String,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier,
    actionLabel: String = ShomaraHomeStrings.Continue,
    // DT-76 (handoff C05): eyebrow and CTA adapt to the real session state — a fresh child sees
    // the first-ready invitation, a returning child sees the resume invitation.
    isResume: Boolean = true,
) {
    val station = ShomaraStationCatalog.station(stationId)
    val eyebrow = if (isResume) {
        ShomaraHomeStrings.ContinueEyebrow
    } else {
        ShomaraHomeStrings.ContinueEyebrowFresh
    }
    val cta = if (isResume) actionLabel else ShomaraHomeStrings.ContinueFresh
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
        color = ShomaraHomeUiTokens.Violet,
        shadowElevation = ShomaraClay.specFor(ShomaraClayDepth.Featured).elevation,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ShomaraTokens.Space16),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // In an RTL Row the first child sits on the physical right: text/CTA column first,
            // the optional art slot lands on the left — the approved composition.
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                horizontalAlignment = Alignment.End,
            ) {
                Text(
                    text = eyebrow,
                    style = ShomaraTypography.Caption,
                    color = ShomaraHomeUiTokens.OnViolet,
                    textAlign = TextAlign.End,
                )
                Text(
                    text = station.workingTitle,
                    style = ShomaraTypography.Title,
                    color = ShomaraHomeUiTokens.OnViolet,
                    textAlign = TextAlign.End,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = ShomaraHomeStrings.continueSupport(ShomaraChapterCatalog.labelFor(station.chapter)),
                    style = ShomaraTypography.Caption,
                    color = ShomaraHomeUiTokens.OnVioletMuted,
                    textAlign = TextAlign.End,
                )
                Spacer(Modifier.height(ShomaraTokens.Space4))
                ContinueCardAction(
                    text = cta,
                    onClick = onContinue,
                )
            }
            // C23 topic tile of the continued station — real station identity, never decoration.
            ShomaraContinueTopicTile(
                stationId = stationId,
                modifier = Modifier.size(ShomaraTokens.ComponentNodeSize),
            )
        }
    }
}

/**
 * The single primary action of the continue card. On-violet contrast treatment: a white surface
 * with violet text (4.99:1, PACKAGE_CONTRACT_AUDIT) rather than the shared green button, which
 * would clash with the violet featured surface.
 */
@Composable
private fun ContinueCardAction(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH),
        shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
        color = ShomaraHomeUiTokens.Surface,
        border = BorderStroke(ShomaraTokens.ClaySoftBorderWidth, ShomaraHomeUiTokens.VioletSoft),
    ) {
        Box(
            modifier = Modifier.fillMaxWidth().padding(ShomaraTokens.Space16),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = text,
                style = ShomaraTypography.Body,
                color = ShomaraHomeUiTokens.VioletDark,
                textAlign = TextAlign.Center,
            )
        }
    }
}

/**
 * C23 of the Home handoff: the topic tile of the station being continued — "فقط محتوا و identity واقعی".
 *
 * The topic mapping is an explicit, JVM-testable table (not a modulo hidden inside a composable):
 * every chapter of the catalog names the topic its lessons teach, and this object is the single
 * place that decision lives. A preview tile renders without a "selected" claim, because a preview
 * must not announce state the domain has not confirmed.
 */
internal object ShomaraLessonTopics {
    /** Chapter number → the topic its lessons teach. Station identity comes from the catalog. */
    private val chapterTopic = mapOf(
        1 to ShomaraLessonTopic.Counting,
        2 to ShomaraLessonTopic.Addition,
        3 to ShomaraLessonTopic.Shapes,
        4 to ShomaraLessonTopic.Patterns,
        5 to ShomaraLessonTopic.Counting,
    )

    fun labelForStation(stationId: String): String =
        topicForStation(stationId).faLabel

    fun topicForStation(stationId: String): ShomaraLessonTopic {
        val chapter = ShomaraStationCatalog.chapterOf(stationId)
        check(chapter in 1..5) { "catalog chapter out of range: $chapter" }
        return chapterTopic.getValue(chapter)
    }
}

@Composable
internal fun ShomaraContinueTopicTile(
    stationId: String,
    modifier: Modifier = Modifier,
    isPreview: Boolean = false,
) {
    val topic = ShomaraLessonTopics.topicForStation(stationId)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .semantics(mergeDescendants = true) { },
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ShomaraLessonTopicIcon(
            topic = topic,
            selected = !isPreview,
            enabled = true,
        )
        Column(Modifier.weight(1f)) {
            Text(
                text = if (isPreview) ShomaraHomeStrings.ContinueEyebrow else topic.faLabel,
                style = ShomaraTypography.Caption,
                color = ShomaraHomeUiTokens.Muted,
            )
        }
    }
}
