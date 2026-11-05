package com.mathlearning.feature.path

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.lazy.stickyHeader
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraStateSurface
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta
import kotlinx.coroutines.launch
import kotlin.math.sin

/** Path node states (family 06): fresh/current/completed/perfect/locked + offline/error surfaces. */
enum class ShomaraPathNodeState { Fresh, Current, Completed, Perfect, Locked }

/**
 * Caller-provided progress — the path NEVER computes mastery itself (COMPONENT_READINESS
 * Progress policy). Null [currentStationId] means the caller has not placed the child yet.
 */
data class ShomaraPathProgress(
    val completedStationIds: Set<String> = emptySet(),
    val perfectStationIds: Set<String> = emptySet(),
    val currentStationId: String? = null,
    val offline: Boolean = false,
) {
    init {
        require(perfectStationIds.all { it in completedStationIds }) { "perfect implies completed" }
    }
}

/**
 * Width of one node item (circle + title + station + visible state label). Wide enough for
 * the three text lines at 200 percent font; the sine offset still keeps the item inside the
 * 360 dp content width (centre + amplitude + half width stays within the screen).
 */
private val PathNodeColumnWidth: Dp = ShomaraTokens.Space40 * 4

/** Pure node-state mapping; exactly ONE Current node can exist at a time (single featured). */
object ShomaraPathGraphLogic {
    // Sine geometry — mirrors apps/mobile/src/path/layout.ts buildPathLayout:
    // x = width / 2 + amplitude * sin(g * frequency + phase), g = global node index.
    // The ui.path block of packages/design-system/src/tokens.json is not emitted by the
    // generated ShomaraTokens (v2 block only), so the amplitude is derived from generated
    // v2 tokens and equals the ui.path.x.amplitude value, and frequency / phase are the
    // ui.path.x values. A later token-codegen step should emit ui.path and ui.chapter so
    // these derivations can be replaced by generated tokens.
    private val PathSineAmplitude: Dp = ShomaraTokens.ComponentNodeSize - ShomaraTokens.Space8
    private const val PathSineFrequency: Double = 0.9
    private const val PathSinePhase: Double = 3.4

    /** Horizontal sine offset for the node with global index [globalIndex] (0-based). */
    fun sineOffsetDp(globalIndex: Int, isRtl: Boolean): Dp {
        val wave = PathSineAmplitude * sin(globalIndex * PathSineFrequency + PathSinePhase)
        // RTL mirrors the wave so the path begins top-right and winds left.
        return if (isRtl) -wave else wave
    }

    /**
     * First station the child has not completed yet, when no current station is placed.
     * Null once a current station exists: a placed child never has a Fresh node.
     */
    fun freshStationId(progress: ShomaraPathProgress): String? {
        if (progress.currentStationId != null) return null
        return ShomaraStationCatalog.Stations.firstOrNull { it.id !in progress.completedStationIds }?.id
    }

    fun stateFor(meta: StationNodeMeta, progress: ShomaraPathProgress): ShomaraPathNodeState = when {
        progress.offline -> ShomaraPathNodeState.Locked
        meta.id == progress.currentStationId -> ShomaraPathNodeState.Current
        meta.id in progress.perfectStationIds -> ShomaraPathNodeState.Perfect
        meta.id in progress.completedStationIds -> ShomaraPathNodeState.Completed
        meta.id == freshStationId(progress) -> ShomaraPathNodeState.Fresh
        else -> ShomaraPathNodeState.Locked
    }

    /** TalkBack truth: every state has an explicit Persian label (never color-only). */
    fun stateLabelFor(state: ShomaraPathNodeState): String = when (state) {
        ShomaraPathNodeState.Fresh -> "آمادهٔ شروع"
        ShomaraPathNodeState.Current -> "ایستگاه فعلی"
        ShomaraPathNodeState.Completed -> "تکمیل شد"
        ShomaraPathNodeState.Perfect -> "کامل و بی‌نقص"
        ShomaraPathNodeState.Locked -> "هنوز قفل؛ با ترتیب مسیر باز می‌شود"
    }

    fun stateMarkFor(state: ShomaraPathNodeState): String = when (state) {
        ShomaraPathNodeState.Completed, ShomaraPathNodeState.Perfect -> "✓"
        else -> ""
    }

    fun colorsFor(state: ShomaraPathNodeState): Triple<Color, Color, Color> = when (state) {
        ShomaraPathNodeState.Current -> Triple(ShomaraTokens.ColorAmberSoft, ShomaraTokens.ColorAmber, ShomaraTokens.ColorAmberInk)
        ShomaraPathNodeState.Completed -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorPrimaryDark)
        ShomaraPathNodeState.Perfect -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimaryDark, ShomaraTokens.ColorPrimaryDark)
        ShomaraPathNodeState.Locked -> Triple(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine2, ShomaraTokens.ColorMuted)
        ShomaraPathNodeState.Fresh -> Triple(ShomaraTokens.ColorSurface, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
    }

    /** Locked nodes stay tappable: tapping opens the locked explanation, never a disabled dead end. */
    fun tapEnabled(state: ShomaraPathNodeState): Boolean = true

    /** Restore-scroll (family 06): the last visible chapter survives process death. */
    fun restoredChapter(saved: Int?): Int = if (saved != null && saved in ShomaraChapterCatalog.All) saved else ShomaraChapterCatalog.All.first()

    /**
     * The anchor of the path: the placed current station, otherwise the fresh station.
     * Null when everything is complete (no next step) or when the graph is frozen offline
     * (the offline banner is the message there, not a next-step line).
     */
    fun nextStepStation(progress: ShomaraPathProgress): StationNodeMeta? {
        if (progress.offline) return null
        val currentId = progress.currentStationId
        if (currentId != null) return ShomaraStationCatalog.Stations.firstOrNull { it.id == currentId }
        val freshId = freshStationId(progress) ?: return null
        return ShomaraStationCatalog.Stations.firstOrNull { it.id == freshId }
    }

    /** Completed stations of one chapter, counted from the caller-provided set only. */
    fun completedInChapter(chapter: Int, progress: ShomaraPathProgress): Int =
        ShomaraStationCatalog.stationsInChapter(chapter).count { it.id in progress.completedStationIds }

    /** Completed ids that are real catalog stations; unknown ids never inflate progress. */
    fun knownCompletedCount(progress: ShomaraPathProgress): Int {
        val known = ShomaraStationCatalog.Stations.map { it.id }.toSet()
        return progress.completedStationIds.count { it in known }
    }

    fun remainingCount(progress: ShomaraPathProgress): Int =
        (ShomaraStationCatalog.STATION_COUNT - knownCompletedCount(progress)).coerceAtLeast(0)

    fun progressFraction(progress: ShomaraPathProgress): Float {
        val total = ShomaraStationCatalog.STATION_COUNT
        return if (total > 0) knownCompletedCount(progress).toFloat() / total.toFloat() else 0f
    }

    /**
     * Chapter band colours: one v2 soft tint + accent per chapter. The tokens.json
     * ui.chapter palette is not emitted by the generated ShomaraTokens (v2 block only), so
     * it cannot be consumed here without a raw literal or a hand edit of a generated file;
     * a later token-codegen step should emit it and this mapping should switch to it.
     */
    fun chapterBandColors(chapter: Int): Pair<Color, Color> = when (chapter) {
        1 -> ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorPrimary
        2 -> ShomaraTokens.ColorSkySoft to ShomaraTokens.ColorSky
        3 -> ShomaraTokens.ColorAmberSoft to ShomaraTokens.ColorAmber
        4 -> ShomaraTokens.ColorBerrySoft to ShomaraTokens.ColorBerry
        else -> ShomaraTokens.ColorSurfaceAlt to ShomaraTokens.ColorInk2
    }

    // Lazy-list index model: item 0 is the header; each chapter contributes one sticky
    // band header plus five node items; the last item is the bottom spacer.
    fun headerItemIndexForChapter(chapter: Int): Int =
        1 + (chapter - 1) * (ShomaraStationCatalog.STATIONS_PER_CHAPTER + 1)

    fun itemIndexForStation(meta: StationNodeMeta): Int {
        val positionInChapter = (meta.ordinal - 1) % ShomaraStationCatalog.STATIONS_PER_CHAPTER
        return headerItemIndexForChapter(meta.chapter) + 1 + positionInChapter
    }

    /** First visible item that restores the saved chapter; chapter 1 opens at the header. */
    fun restoredFirstVisibleIndex(savedChapter: Int?): Int {
        val chapter = restoredChapter(savedChapter)
        return if (chapter <= 1) 0 else headerItemIndexForChapter(chapter)
    }
}

/**
 * Phase A (Duolingo-copy path, ADR-0039): real scroll (LazyColumn + sticky chapter bands +
 * live restore-scroll), sinusoidal RTL node geometry, 72 dp nodes / 84 dp current node,
 * 14 dp progress bar with a progress role, Fresh for the first unplaced station, honest
 * loading / error / empty surfaces, per-chapter counts, and a floating back-to-anchor
 * button. Display only: mastery, unlock and Station Pass are never decided here.
 *
 * [entryState] is caller-owned: null renders the path (the default today, when the caller
 * has progress to show); Loading / Error / Empty render the shared family 16 surface.
 * [onRetry] is only offered when it is real — a null retry shows no retry button. The host
 * wires both once the local content package loader exists (Phase 1); until then the
 * defaults keep every existing caller unchanged.
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
) {
    // Honest state surfaces (family 16): when the caller reports that the path data has
    // not arrived, the screen says so instead of rendering a fully locked path. Offline
    // is the normal state of this product, so it never replaces the list: the list renders
    // with the offline banner.
    when (entryState) {
        ShomaraEntryState.Loading -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Loading,
                title = "در حال آماده‌سازی مسیر",
                body = "مسیر در حال آماده شدن است.",
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Error -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Error,
                title = "مسیر باز نشد",
                body = "نتوانستیم مسیر را باز کنیم. دوباره تلاش کن.",
                retryLabel = "تلاش دوباره",
                onRetry = onRetry,
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Empty -> {
            ShomaraStateSurface(
                state = ShomaraEntryState.Empty,
                title = "مسیر خالی است",
                body = "فعلاً ایستگاهی برای نمایش نیست.",
                modifier = modifier,
            )
            return
        }
        ShomaraEntryState.Offline, null -> { /* the list below is the honest offline view */ }
    }

    // Family 06 header: one calm progress layer only (no %, no score, no second
    // progress layer in the child's view). The fraction is rendered from the
    // caller-provided completed set only; this screen never computes mastery.
    // RTL: the first element of a Row is on the right, and the progress fill
    // aligns to the layout start (right in RTL). Digit strings and operation
    // order are never mirrored.
    val remainingStations = ShomaraPathGraphLogic.remainingCount(progress)
    val progressFraction = ShomaraPathGraphLogic.progressFraction(progress)
    val nextStep = ShomaraPathGraphLogic.nextStepStation(progress)
    val nextStepText = when {
        nextStep == null -> null
        progress.currentStationId != null -> "گام بعدی: ${nextStep.workingTitle}"
        else -> "از اینجا شروع کن: ${nextStep.workingTitle}"
    }
    val remainingText = if (remainingStations == 0) "مسیر کامل شد"
        else "ایستگاه‌های باقی‌مانده: ${ShomaraDigits.toFa(remainingStations)}"
    val isRtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    val listState = rememberLazyListState(
        initialFirstVisibleItemIndex = ShomaraPathGraphLogic.restoredFirstVisibleIndex(savedChapter),
    )
    val scope = rememberCoroutineScope()
    val anchorIndex = nextStep?.let { ShomaraPathGraphLogic.itemIndexForStation(it) }
    val anchorLabel = if (progress.currentStationId != null) "بازگشت به ایستگاه فعلی" else "بازگشت به نقطه شروع"
    // The floating button only appears once the anchor node has scrolled off-screen, and
    // the jump is instant (no animation), so it stays safe under reduced motion.
    val showBackToAnchor by remember(anchorIndex) {
        derivedStateOf {
            val index = anchorIndex ?: return@derivedStateOf false
            val visible = listState.layoutInfo.visibleItemsInfo
            if (visible.isEmpty()) false
            else index < visible.first().index || index > visible.last().index
        }
    }

    Box(modifier = modifier.fillMaxWidth()) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxWidth().padding(ShomaraTokens.Space24),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            item(key = "path-header") {
                Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        // Static cameo only, from the 4 shipped drawables (Main pose 1).
                        // It is decoration; the hero of this screen is the current node.
                        ShomaraCharacterImage(
                            character = ShomaraCharacter.Main,
                            poseId = 1,
                            slot = ShomaraCharacterSlot.Inline,
                            decorative = true,
                        )
                        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                            Text(text = "مسیر یادگیری", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
                            Text(
                                text = remainingText,
                                style = ShomaraTypography.Caption,
                                color = ShomaraTokens.ColorMuted,
                            )
                            if (nextStepText != null) {
                                Text(
                                    text = nextStepText,
                                    style = ShomaraTypography.Body,
                                    color = ShomaraTokens.ColorInk,
                                )
                            }
                        }
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(ShomaraTokens.ComponentProgressH)
                            .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusSm))
                            .semantics {
                                role = Role.ProgressBar
                                progressBarRangeInfo = ProgressBarRangeInfo(progressFraction, 0f..1f)
                                contentDescription = remainingText
                            },
                        contentAlignment = Alignment.CenterStart,
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progressFraction)
                                .height(ShomaraTokens.ComponentProgressH)
                                .background(ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusSm)),
                        )
                    }
                    if (progress.offline) {
                        ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ مسیر آفلاین دیده می‌شود.")
                    }
                }
            }
            // Top spacer mirrors ui.path.topSpacer.
            item(key = "path-top-spacer") {
                Spacer(modifier = Modifier.height(ShomaraTokens.Space20).fillMaxWidth())
            }
            for (chapter in ShomaraChapterCatalog.All) {
                stickyHeader(key = "chapter-$chapter") {
                    ChapterBand(chapter = chapter, progress = progress)
                }
                for (meta in ShomaraStationCatalog.stationsInChapter(chapter)) {
                    item(key = meta.id) {
                        ShomaraPathNodeItem(
                            meta = meta,
                            state = ShomaraPathGraphLogic.stateFor(meta, progress),
                            isRtl = isRtl,
                            onStationTap = onStationTap,
                        )
                    }
                }
            }
            // Bottom spacer keeps the last node clear of the floating button.
            item(key = "path-bottom-spacer") {
                Spacer(modifier = Modifier.height(ShomaraTokens.ComponentButtonH + ShomaraTokens.Space16).fillMaxWidth())
            }
        }
        if (showBackToAnchor && anchorIndex != null) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(ShomaraTokens.Space16)
                    .shadow(ShomaraTokens.ClaySoftElevation, RoundedCornerShape(ShomaraTokens.RadiusPill))
                    .background(ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusPill))
                    .semantics(mergeDescendants = true) {
                        role = Role.Button
                        contentDescription = anchorLabel
                    }
                    .clickable(role = Role.Button) {
                        scope.launch { listState.scrollToItem(anchorIndex) }
                    }
                    .padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space12),
                contentAlignment = Alignment.Center,
            ) {
                Text(text = anchorLabel, style = ShomaraTypography.Body, color = ShomaraTokens.ColorWhite)
            }
        }
    }
}

/** Sticky chapter band: token tint + accent edge + per-chapter count, announced as a heading. */
@Composable
private fun ChapterBand(chapter: Int, progress: ShomaraPathProgress) {
    val (bandBackground, bandAccent) = ShomaraPathGraphLogic.chapterBandColors(chapter)
    val completed = ShomaraPathGraphLogic.completedInChapter(chapter, progress)
    val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bandBackground, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .padding(ShomaraTokens.Space12),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .width(ShomaraTokens.Space4)
                .height(ShomaraTokens.ComponentTouchMin)
                .background(bandAccent, RoundedCornerShape(ShomaraTokens.RadiusSm)),
        )
        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
            Text(
                text = ShomaraChapterCatalog.labelFor(chapter),
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = "${ShomaraDigits.toFa(completed)} از ${ShomaraDigits.toFa(total)} کامل شد",
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
        }
    }
}

/**
 * One winding-path node: the circle is the node (72 dp, 84 dp for the one current node)
 * and the title, station line and visible state label sit under it. The whole item is
 * offset by the sine wave, so the nodes snake across the screen instead of a flat list.
 * Triple encoding, never colour alone: node circle (shape + colour), visible state label,
 * and the TalkBack label on the merged node. Only the Current node uses Featured depth
 * (border + Clay shadow); every other node stays flat.
 */
@Composable
private fun ShomaraPathNodeItem(
    meta: StationNodeMeta,
    state: ShomaraPathNodeState,
    isRtl: Boolean,
    onStationTap: (String) -> Unit,
) {
    val nodeSize = if (state == ShomaraPathNodeState.Current) ShomaraTokens.ComponentNodeCurrent else ShomaraTokens.ComponentNodeSize
    val (container, border, content) = ShomaraPathGraphLogic.colorsFor(state)
    val depth = if (state == ShomaraPathNodeState.Current) ShomaraClayDepth.Featured else ShomaraClayDepth.Soft
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    var focused by remember { mutableStateOf(false) }
    val pressScale = if (pressed) ShomaraTokens.MotionPressScale.toFloat() else 1f
    // Focus is a neutral ink ring around the whole item: never a filled colour, so it can
    // never be mistaken for "open". Pressed shrinks the item slightly (tactile depth).
    // mergeDescendants keeps TalkBack to one announcement (title + state) per node.
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .offset(x = ShomaraPathGraphLogic.sineOffsetDp(meta.ordinal - 1, isRtl))
            .width(PathNodeColumnWidth)
            .graphicsLayer { scaleX = pressScale; scaleY = pressScale }
            .border(
                width = ShomaraTokens.ClayFeaturedBorderWidth,
                color = if (focused) ShomaraTokens.ColorInk else Color.Transparent,
                shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = meta.workingTitle
                stateDescription = ShomaraPathGraphLogic.stateLabelFor(state)
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.Button,
            ) { onStationTap(meta.id) }
            .onFocusChanged { focused = it.isFocused }
            .padding(ShomaraTokens.Space8),
    ) {
        Box(
            modifier = Modifier
                .then(if (state == ShomaraPathNodeState.Current) Modifier.shadow(ShomaraTokens.ClayFeaturedElevation, CircleShape) else Modifier)
                .size(nodeSize)
                .background(container, CircleShape)
                .border(
                    if (depth == ShomaraClayDepth.Featured) ShomaraTokens.ClayFeaturedBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                    border,
                    CircleShape,
                ),
            contentAlignment = Alignment.Center,
        ) {
            val mark = ShomaraPathGraphLogic.stateMarkFor(state)
            Text(
                text = if (mark.isNotEmpty()) mark else ShomaraDigits.toFa(meta.ordinal),
                style = ShomaraTypography.Body,
                color = content,
            )
        }
        Text(
            text = meta.workingTitle,
            style = ShomaraTypography.Body,
            color = content,
            textAlign = TextAlign.Center,
        )
        Text(
            text = "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)}",
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
            textAlign = TextAlign.Center,
        )
        Text(
            text = ShomaraPathGraphLogic.stateLabelFor(state),
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
            textAlign = TextAlign.Center,
        )
    }
}
