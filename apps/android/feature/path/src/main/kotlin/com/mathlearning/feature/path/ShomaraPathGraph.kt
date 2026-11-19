package com.mathlearning.feature.path

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraStateSurface
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import kotlinx.coroutines.launch

/**
 * The single winding learning journey. Graph state and geometry live in ShomaraPathState;
 * node/chapter rendering lives in ShomaraPathNodes/ShomaraPathChapter.
 *
 * Layout ownership: the orientation strip is PINNED above the scrolling list, so the chapter,
 * the real next step and the real remaining count stay on screen even when the list opens on a
 * mid-path Current station. Index math in [ShomaraPathGraphLogic] therefore counts only path
 * rows (chapter band, node, divider) and never a synthetic header row.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ShomaraPathScreen(
    progress: ShomaraPathProgress,
    onStationTap: (String) -> Unit,
    modifier: Modifier = Modifier,
    entryState: ShomaraEntryState? = null,
    onRetry: (() -> Unit)? = null,
    savedChapter: Int? = null,
    showPathHeading: Boolean = true,
    canvasColor: Color = ShomaraTokens.ColorCanvas,
    /** Hosts that already apply window insets (a Scaffold tab) pass false to avoid double padding. */
    applySystemInsets: Boolean = false,
) {
    when (ShomaraPathGraphLogic.resolveEntryState(progress, entryState)) {
        ShomaraEntryState.Loading -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Loading,
                title = ShomaraHomeStrings.LoadingTitle,
                body = ShomaraHomeStrings.LoadingBody,
                containerColor = canvasColor,
                applySystemInsets = applySystemInsets,
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Error -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Error,
                title = ShomaraHomeStrings.ErrorTitle,
                body = ShomaraHomeStrings.ErrorBody,
                retryLabel = ShomaraHomeStrings.Retry,
                onRetry = onRetry,
                stateIconRes = R.drawable.shomara_state_error,
                containerColor = canvasColor,
                applySystemInsets = applySystemInsets,
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Empty -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Empty,
                title = ShomaraHomeStrings.EmptyTitle,
                body = ShomaraHomeStrings.EmptyBody,
                stateIconRes = R.drawable.shomara_state_empty,
                containerColor = canvasColor,
                applySystemInsets = applySystemInsets,
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Offline, null -> Unit
    }

    val remainingStations = ShomaraPathGraphLogic.remainingCount(progress)
    val progressFraction = ShomaraPathGraphLogic.progressFraction(progress)
    val nextStep = ShomaraPathGraphLogic.nextStepStation(progress)
    val nextStepText = when {
        nextStep == null -> null
        progress.currentStationId != null -> ShomaraHomeStrings.nextStep(nextStep.workingTitle)
        else -> ShomaraHomeStrings.startHere(nextStep.workingTitle)
    }
    val remainingText = if (remainingStations == 0) {
        ShomaraHomeStrings.PathComplete
    } else {
        ShomaraHomeStrings.remaining(ShomaraDigits.toFa(remainingStations))
    }
    val isRtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    val listState = rememberLazyListState(
        initialFirstVisibleItemIndex = ShomaraPathGraphLogic.initialFirstVisibleIndex(savedChapter, progress),
    )
    val scope = rememberCoroutineScope()
    val anchorIndex = nextStep?.let { ShomaraPathGraphLogic.itemIndexForStation(it) }
    val anchorLabel = if (progress.currentStationId != null) {
        ShomaraHomeStrings.ReturnCurrent
    } else {
        ShomaraHomeStrings.ReturnStart
    }
    val showBackToAnchor by remember(anchorIndex) {
        derivedStateOf {
            val index = anchorIndex ?: return@derivedStateOf false
            val visible = listState.layoutInfo.visibleItemsInfo
            visible.isNotEmpty() && (index < visible.first().index || index > visible.last().index)
        }
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .background(canvasColor),
    ) {
        val horizontalInset = if (maxWidth <= ShomaraTokens.ComponentCharacterCompactWidth) {
            ShomaraTokens.Space16
        } else {
            ShomaraTokens.Space20
        }
        val contentWidth = maxWidth - horizontalInset * 2
        Column(modifier = Modifier.fillMaxSize()) {
            if (showPathHeading) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(
                        start = horizontalInset,
                        end = horizontalInset,
                        top = ShomaraTokens.Space8,
                    ),
                ) {
                    ShomaraCharacterImage(
                        character = ShomaraCharacter.Main,
                        poseId = 1,
                        slot = ShomaraCharacterSlot.Inline,
                        decorative = true,
                    )
                    Text(
                        text = ShomaraHomeStrings.Title,
                        style = ShomaraTypography.Title,
                        color = ShomaraTokens.ColorInk,
                        modifier = Modifier.semantics { heading() },
                    )
                }
            }
            ShomaraHomeOrientationStrip(
                chapterLabel = nextStep?.chapterLabel,
                nextStepText = nextStepText,
                remainingText = remainingText,
                progressFraction = progressFraction,
                modifier = Modifier.padding(
                    start = horizontalInset,
                    end = horizontalInset,
                    top = ShomaraTokens.Space8,
                    bottom = ShomaraTokens.Space12,
                ),
            )
            Box(modifier = Modifier.weight(1f)) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = horizontalInset)
                        .testTag("shomara-path-list"),
                    verticalArrangement = Arrangement.spacedBy(0.dp),
                ) {
                    for (chapter in ShomaraChapterCatalog.All) {
                        stickyHeader(key = "chapter-$chapter") {
                            Box(modifier = Modifier.padding(bottom = ShomaraTokens.Space16)) {
                                ShomaraChapterBand(chapter = chapter, progress = progress)
                            }
                        }
                        for (meta in ShomaraStationCatalog.stationsInChapter(chapter)) {
                            item(key = meta.id, contentType = "station-node") {
                                val nodeState = ShomaraPathGraphLogic.stateFor(meta, progress)
                                ShomaraPathNodeItem(
                                    meta = meta,
                                    state = nodeState,
                                    isRtl = isRtl,
                                    contentWidth = contentWidth,
                                    canvasColor = canvasColor,
                                    onStationTap = onStationTap,
                                    ringFraction = if (nodeState == ShomaraPathNodeState.Current) {
                                        ShomaraPathGraphLogic.ringFractionFor(meta, progress)
                                    } else {
                                        null
                                    },
                                    bubbleLabel = ShomaraPathGraphLogic.currentBubbleLabel(progress),
                                )
                            }
                        }
                        if (chapter < ShomaraChapterCatalog.All.size) {
                            item(key = "chapter-divider-$chapter", contentType = "chapter-divider") {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = ShomaraTokens.Space16)
                                        .clearAndSetSemantics {},
                                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    HorizontalDivider(color = ShomaraTokens.ColorLine2, modifier = Modifier.weight(1f))
                                    Text(
                                        text = ShomaraPathGraphLogic.chapterSpanLabel(chapter + 1),
                                        style = ShomaraTypography.Caption,
                                        color = ShomaraTokens.ColorMuted,
                                    )
                                    HorizontalDivider(color = ShomaraTokens.ColorLine2, modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                    // End-of-path art marks a real completion only. While stations remain it
                    // would be decoration without meaning in the middle of the journey.
                    if (remainingStations == 0) {
                        item(key = "path-garden-footer", contentType = "decorative-footer") {
                            Image(
                                painter = painterResource(R.drawable.shomara_garden_path_footer),
                                contentDescription = null,
                                contentScale = ContentScale.FillWidth,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clearAndSetSemantics {},
                            )
                        }
                    }
                    item(key = "path-bottom-spacer", contentType = "bottom-inset") {
                        Spacer(
                            modifier = Modifier
                                .height(ShomaraTokens.ComponentButtonH + ShomaraTokens.Space16)
                                .fillMaxWidth(),
                        )
                    }
                }
                if (showBackToAnchor && anchorIndex != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(ShomaraTokens.Space16)
                            .size(ShomaraTokens.ComponentTouchMin)
                            .shadow(
                                ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation,
                                RoundedCornerShape(ShomaraTokens.RadiusPill),
                            )
                            .background(
                                ShomaraTokens.ColorHomeViolet,
                                RoundedCornerShape(ShomaraTokens.RadiusPill),
                            )
                            .semantics(mergeDescendants = true) {
                                role = Role.Button
                                contentDescription = anchorLabel
                            }
                            .clickable(role = Role.Button) {
                                scope.launch { listState.scrollToItem(anchorIndex) }
                            },
                        contentAlignment = Alignment.Center,
                    ) {
                        Image(
                            painter = painterResource(R.drawable.shomara_ui_arrow),
                            contentDescription = null,
                            modifier = Modifier
                                .size(ShomaraTokens.Space24)
                                .graphicsLayer { rotationZ = -90f },
                        )
                    }
                }
            }
        }
    }
}
