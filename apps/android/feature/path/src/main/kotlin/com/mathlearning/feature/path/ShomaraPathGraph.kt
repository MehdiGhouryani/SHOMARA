package com.mathlearning.feature.path

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.layout.LayoutCoordinates
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.LayoutDirection
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraStateSurface
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraPressScale
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta
import kotlinx.coroutines.launch

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

/** Chapter-aware node colours for the N08R-06 path redesign (container / mark / 3D edge). */
data class ShomaraNodeColors(val container: Color, val content: Color, val edge: Color)

/** Pure node-state mapping; exactly ONE Current node can exist at a time (single featured). */
object ShomaraPathGraphLogic {
    // N08R-06 zigzag geometry (owner directive: Duolingo-style winding learning path).
    // Nodes alternate sides of the centre axis on EVERY row — never a vertical line, never a
    // checkerboard — with a deterministic magnitude rhythm so the path reads organic but is
    // fully reproducible and testable. The maximum amplitude stays the token-derived path
    // amplitude (nodeSize − space8, the value the ui.path tokens encoded), and
    // [zigzagAmplitudeDp] clamps it on narrow content widths so a node (and its label column)
    // can never be cut by the screen edge.
    private val PathZigzagMaxAmplitude: Dp = ShomaraTokens.ComponentNodeSize - ShomaraTokens.Space8

    /** Deterministic magnitude rhythm of the zigzag (index 0-based), in 0..1 of amplitude. */
    fun zigzagMagnitude(globalIndex: Int): Float = when (globalIndex % 4) {
        0 -> 1f
        1 -> 0.55f
        2 -> 1f
        else -> 0.55f
    }

    /**
     * Responsive amplitude: the token maximum, clamped so the offset label column stays fully
     * inside [contentWidth] (the lazy-list content width after the 24 dp edge insets).
     */
    fun zigzagAmplitudeDp(contentWidth: Dp): Dp {
        val reachable = (contentWidth - PathNodeColumnWidth) / 2f
        val cap = if (reachable.value > 0f) reachable else Dp(0f)
        return minOf(PathZigzagMaxAmplitude, cap)
    }

    /** Horizontal zigzag offset for the node with global index [globalIndex] (0-based). */
    fun zigzagOffsetDp(globalIndex: Int, isRtl: Boolean, contentWidth: Dp): Dp {
        val sign = if (globalIndex % 2 == 0) 1f else -1f
        val offset = zigzagAmplitudeDp(contentWidth) * sign * zigzagMagnitude(globalIndex)
        // RTL mirrors the path so it begins top-right and winds left.
        return if (isRtl) -offset else offset
    }

    /**
     * X where the curved connector ENTERS this node's item = the previous node's offset, so
     * consecutive items chain: item N exits at its own offset at the bottom edge and item
     * N+1 enters at exactly that x at its top edge — one continuous winding line behind the
     * nodes. The first node (ordinal 1) has no incoming connector.
     */
    fun connectorEnterOffsetDp(globalIndex: Int, isRtl: Boolean, contentWidth: Dp): Dp =
        if (globalIndex <= 0) zigzagOffsetDp(globalIndex, isRtl, contentWidth)
        else zigzagOffsetDp(globalIndex - 1, isRtl, contentWidth)

    /**
     * First station the child has not completed yet, when no current station is placed.
     * Null once a current station exists: a placed child never has a Fresh node.
     */
    fun freshStationId(progress: ShomaraPathProgress): String? {
        if (progress.currentStationId != null) return null
        return ShomaraStationCatalog.Stations.firstOrNull { it.id !in progress.completedStationIds }?.id
    }

    fun stateFor(meta: StationNodeMeta, progress: ShomaraPathProgress): ShomaraPathNodeState = when {
        // F-40: offline no longer remaps every node to Locked — the nodes keep their real
        // state and the offline banner carries the message. A locked-looking path while
        // offline was a lie: the child's progress did not disappear with the network.
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
        // F-12c: a completed node says what a tap does — replay for practice — instead of
        // only stating the past. The label is the affordance, not a trophy.
        ShomaraPathNodeState.Completed -> "تکمیل شد — برای تمرین دوباره ضربه بزن"
        ShomaraPathNodeState.Perfect -> "کامل و بی‌نقص"
        ShomaraPathNodeState.Locked -> "هنوز قفل؛ با ترتیب مسیر باز می‌شود"
    }

    /**
     * Owner page-06: the locked reason reads as a 2-3 line wall when repeated
     * on every locked node, so the VISIBLE third line shows this short label
     * while the merged semantics keep the full warm reason (stateDescription
     * is unchanged — TalkBack truth is not shortened).
     */
    val lockedShortLabel: String = "هنوز قفل"

    /**
     * N08R-06 owner amendment (Duolingo unit evidence): node colours follow the CHAPTER.
     * Completed / Perfect / Current render as the solid chapter accent with a white mark and
     * a darkened-accent 3D bottom edge (Duolingo tints its nodes with the unit colour);
     * Fresh and Locked stay neutral so "not yours yet" never looks like an achievement.
     * Chapter 3's accent is amberInk (N08R-01 audit) and chapter 5's is ink2 — white marks
     * stay ≥ 3:1 on every accent (guarded by a test).
     */
    fun accentFor(chapter: Int): Color = chapterBandColors(chapter).second

    /** The 3D bottom edge colour: the accent blended toward ink (token-only lerp, no raw hex). */
    fun edgeFor(accent: Color): Color = lerp(accent, ShomaraTokens.ColorInk, 0.3f)

    fun colorsFor(state: ShomaraPathNodeState, chapter: Int): ShomaraNodeColors {
        val accent = accentFor(chapter)
        return when (state) {
            ShomaraPathNodeState.Current -> ShomaraNodeColors(accent, ShomaraTokens.ColorWhite, edgeFor(accent))
            ShomaraPathNodeState.Completed -> ShomaraNodeColors(accent, ShomaraTokens.ColorWhite, edgeFor(accent))
            ShomaraPathNodeState.Perfect -> ShomaraNodeColors(accent, ShomaraTokens.ColorWhite, lerp(edgeFor(accent), ShomaraTokens.ColorInk, 0.3f))
            // N08R-06 device pass: the fresh node is THE next step — white face with the
            // chapter accent numeral + accent lip (distinct from locked), while locked stays
            // fully neutral (warm gray face, ink2 numeral) so "not yours yet" never reads
            // as an achievement. All numerals keep ≥ 4.5:1 on their faces (guarded by test).
            ShomaraPathNodeState.Fresh -> ShomaraNodeColors(ShomaraTokens.ColorSurface, accent, edgeFor(accent))
            ShomaraPathNodeState.Locked -> ShomaraNodeColors(ShomaraTokens.ColorLine2, ShomaraTokens.ColorInk2, lerp(ShomaraTokens.ColorLine2, ShomaraTokens.ColorInk, 0.35f))
        }
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
     * Segmented-ring fraction for the Current node (Duolingo screenshot evidence,
     * 2026-11-05: the ring around the current node is broken into short arcs).
     * The ring shows the completion of the chapter of the LAST COMPLETED station —
     * the chapter the child just finished — so the Current node at the start of a
     * new chapter still shows the finished chapter's ring. With no completed
     * station yet (unknown ids never count), the node's own chapter applies.
     * There is no per-station lesson progress yet (Phase 1), so the ring never
     * shows a lesson fraction and never invents one; 0 renders as track-only,
     * never as an invisible ring.
     */
    fun ringFractionFor(meta: StationNodeMeta, progress: ShomaraPathProgress): Float {
        val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
        if (total <= 0) return 0f
        val lastCompleted = ShomaraStationCatalog.Stations.lastOrNull { it.id in progress.completedStationIds }
        val chapter = lastCompleted?.chapter ?: meta.chapter
        return completedInChapter(chapter, progress).toFloat() / total.toFloat()
    }

    /**
     * Unit-banner title (Duolingo screenshot evidence, 2026-11-05): the banner's
     * big line is the chapter's station span, derived from the catalog — no
     * concept name is invented (CONTENT-004: chapter names stay with the owner).
     */
    fun chapterSpanLabel(chapter: Int): String {
        val stations = ShomaraStationCatalog.stationsInChapter(chapter)
        val first = stations.first().ordinal
        val last = stations.last().ordinal
        return "ایستگاه‌های ${ShomaraDigits.toFa(first)} تا ${ShomaraDigits.toFa(last)}"
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
        // N08R-01 contrast audit: amber on amberSoft was 1.64:1 — washed out next to the other
        // chapter accents (all ≥3:1). The amber family's own ink token carries the chapter's
        // accent identity instead (11.18:1), matching chapter 5's dark-accent precedent (ink2).
        3 -> ShomaraTokens.ColorAmberSoft to ShomaraTokens.ColorAmberInk
        4 -> ShomaraTokens.ColorBerrySoft to ShomaraTokens.ColorBerry
        else -> ShomaraTokens.ColorSurfaceAlt to ShomaraTokens.ColorInk2
    }

    // Lazy-list index model: item 0 is the header; each chapter contributes one sticky
    // band header plus five node items plus one chapter-boundary divider (chapters 1-4;
    // E-02); the last item is the bottom spacer. The top spacer is not modelled: the
    // anchor/restore indices count from the header, as the existing tests encode.
    fun headerItemIndexForChapter(chapter: Int): Int =
        1 + (chapter - 1) * (ShomaraStationCatalog.STATIONS_PER_CHAPTER + 2)

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
    val anchorLabel = if (progress.currentStationId != null) "بازگشت به ایستگاه فعلی" else "بازگشت به نقطهٔ شروع"
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

    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        // N08R-06: the zigzag amplitude clamps to the REAL content width (the lazy list is
        // inset by 24 dp per side), so nodes and labels never touch the screen edge.
        val contentWidth = maxWidth - ShomaraTokens.Space24 * 2
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxWidth().padding(ShomaraTokens.Space24),
            // Spacing is explicit inside each item so the connector Canvas can span the FULL
            // item height — the winding line stays continuous across item boundaries.
            verticalArrangement = Arrangement.spacedBy(0.dp),
        ) {
            item(key = "path-header") {
                Column(
                    verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
                    modifier = Modifier.padding(bottom = ShomaraTokens.Space16),
                ) {
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
                    Box(modifier = Modifier.padding(bottom = ShomaraTokens.Space16)) {
                        ChapterBand(chapter = chapter, progress = progress)
                    }
                }
                for (meta in ShomaraStationCatalog.stationsInChapter(chapter)) {
                    item(key = meta.id) {
                        val nodeState = ShomaraPathGraphLogic.stateFor(meta, progress)
                        ShomaraPathNodeItem(
                            meta = meta,
                            state = nodeState,
                            isRtl = isRtl,
                            contentWidth = contentWidth,
                            onStationTap = onStationTap,
                            ringFraction = if (nodeState == ShomaraPathNodeState.Current) ShomaraPathGraphLogic.ringFractionFor(meta, progress) else null,
                        )
                    }
                }
                // E-02: chapter-boundary divider after the last node of chapters 1-4 — two
                // hairlines around the NEXT chapter's station span, so the boundary reads as
                // a section break (Duolingo unit boundary), not a gap. Decorative for
                // TalkBack: the next chapter's sticky band already announces the same span.
                if (chapter < ShomaraChapterCatalog.All.size) {
                    item(key = "chapter-divider-$chapter") {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                // E-02 + N08R-06: the node above carries its own bottom spacer,
                                // so the divider only pads below before the next sticky band.
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
                    // الف-۰۱: the floating button is an icon-anchored control — its touch
                    // target is at least 48dp even though the label is short.
                    .defaultMinSize(minHeight = ShomaraTokens.ComponentTouchMin)
                    .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusPill))
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

/** Unit banner (N08R-06, Duolingo unit-header evidence): the chapter's token tint card gains
 * a 3D bottom lip (darkened tint behind the card) and a chapter-number badge in the accent —
 * identity, not a second progress layer (the one-progress-layer rule stands; the count stays
 * in words). The guidebook cell stays absent: no content yet (Phase B), no dead affordance. */
@Composable
private fun ChapterBand(chapter: Int, progress: ShomaraPathProgress) {
    val (bandBackground, bandAccent) = ShomaraPathGraphLogic.chapterBandColors(chapter)
    val completed = ShomaraPathGraphLogic.completedInChapter(chapter, progress)
    val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                // N08R-06: the Duolingo band's darker bottom edge — the card rect repeated
                // one edge-token down in the tint blended toward the accent, drawn before
                // the card itself so only the lip shows. Tokens only, no raw colour.
                val edge = ShomaraTokens.ComponentEdge.toPx()
                drawRoundRect(
                    color = lerp(bandBackground, bandAccent, 0.45f),
                    topLeft = Offset(0f, edge),
                    size = size,
                    cornerRadius = CornerRadius(ShomaraTokens.RadiusLg.toPx()),
                )
            }
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(bandBackground, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .padding(ShomaraTokens.Space16),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Chapter badge: the number identity of the unit, white on the accent (contrast
        // guarded by a test). Decorative for TalkBack — the heading below already reads.
        Box(
            modifier = Modifier
                .size(ShomaraTokens.Space40)
                .background(bandAccent, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .clearAndSetSemantics {},
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = ShomaraDigits.toFa(chapter),
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorWhite,
            )
        }
        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4)) {
            Text(
                text = ShomaraChapterCatalog.labelFor(chapter),
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
            Text(
                text = ShomaraPathGraphLogic.chapterSpanLabel(chapter),
                style = ShomaraTypography.Title,
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
 * One winding-path node (N08R-06, Duolingo-home evidence): a full-width item whose connector
 * Canvas spans the whole height — a cubic curve entering at the previous node's offset at the
 * top edge and leaving at this node's offset at the bottom edge, so consecutive items chain
 * into ONE continuous winding line drawn BEHIND the circles. The node column (circle + labels)
 * is centred then zigzag-offset; the labels sit in a canvas-coloured mask so the line never
 * strikes through text. Triple encoding, never colour alone: node circle (shape + colour),
 * visible state label, and the TalkBack label on the merged node. ADR-0040: every node carries
 * a 3D bottom edge; only the Current node is Featured (one-featured-per-viewport).
 */
@Composable
private fun ShomaraPathNodeItem(
    meta: StationNodeMeta,
    state: ShomaraPathNodeState,
    isRtl: Boolean,
    contentWidth: Dp,
    onStationTap: (String) -> Unit,
    ringFraction: Float? = null,
) {
    val nodeSize = if (state == ShomaraPathNodeState.Current) ShomaraTokens.ComponentNodeCurrent else ShomaraTokens.ComponentNodeSize
    val colors = ShomaraPathGraphLogic.colorsFor(state, meta.chapter)
    val accent = ShomaraPathGraphLogic.accentFor(meta.chapter)
    val ownOffset = ShomaraPathGraphLogic.zigzagOffsetDp(meta.ordinal - 1, isRtl, contentWidth)
    val enterOffset = ShomaraPathGraphLogic.connectorEnterOffsetDp(meta.ordinal - 1, isRtl, contentWidth)
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    var focused by remember { mutableStateOf(false) }
    // N08R-06: the connector's end point is the REAL circle centre, measured from layout
    // (bubble height, node size 72/84 and 200% font all shift it) — the curve always
    // disappears exactly behind the node face.
    var nodeCenterYpx by remember { mutableStateOf(0f) }
    val trackNodeCenter: (LayoutCoordinates) -> Unit = {
        nodeCenterYpx = it.positionInParent().y + it.size.height / 2f
    }
    // Focus is a neutral ink ring around the whole item: never a filled colour, so it can
    // never be mistaken for "open". Pressed compresses the node through the token spring
    // (N08R-01 — tactile depth; reduced motion gets a hard cut instead of the spring).
    // mergeDescendants keeps TalkBack to one announcement (title + state) per node.
    Box(modifier = Modifier.fillMaxWidth()) {
        Canvas(modifier = Modifier.matchParentSize()) {
            if (meta.ordinal > 1) {
                // The winding line behind the nodes: enter at the previous node's x at the
                // item top and swoop INTO this node's circle — the horizontal run happens
                // in the upper quarter (free canvas above the circle), and the line ends
                // behind the circle face, never striking through the labels below.
                // RTL: Modifier.offset mirrors x, Canvas does NOT — and the logic offsets
                // already mirror for RTL (the recorded page-06 double-negation), so the
                // canvas must negate once more to land on the VISUAL node x.
                fun canvasX(offset: Dp): Float {
                    val visual = if (isRtl) -offset else offset
                    return size.width / 2f + visual.toPx()
                }
                val startX = canvasX(enterOffset)
                val endX = canvasX(ownOffset)
                val endY = if (nodeCenterYpx > 0f) nodeCenterYpx else size.height * 0.5f
                val bendY = endY * 0.6f
                // Incoming swoop: every node EXCEPT the very first (which has no predecessor)
                // receives the line from the previous node's x, ending behind its own face.
                // EVERY node then draws the outgoing tail from its circle centre down its own
                // x to the item edge — the next node's swoop picks it up there, so the path is
                // ONE continuous line behind everything; the label mask hides it behind text.
                drawPath(
                    path = Path().apply {
                        if (meta.ordinal > 1) {
                            moveTo(startX, 0f)
                            cubicTo(startX, bendY, endX, bendY, endX, endY)
                        } else {
                            moveTo(endX, endY)
                        }
                        lineTo(endX, size.height)
                    },
                    color = accent,
                    style = Stroke(
                        width = ShomaraTokens.Space8.toPx(),
                        cap = StrokeCap.Round,
                    ),
                )
            }
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(x = ownOffset)
                .width(PathNodeColumnWidth)
                .shomaraPressScale(
                    pressed = pressed,
                    reducedMotion = LocalShomaraReducedMotion.current,
                )
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
            // Anchor cue (Duolingo START evidence): one bubble on the one node the child
            // acts on next — Current («ادامه», the sheet's resume CTA) or Fresh («شروع»).
            // Both strings are existing canonical CTA labels; nothing new is invented, and
            // the bubble is decorative for TalkBack (the node state is already announced).
            if (state == ShomaraPathNodeState.Current || state == ShomaraPathNodeState.Fresh) {
                ShomaraAnchorBubble(
                    text = if (state == ShomaraPathNodeState.Current) "ادامه" else "شروع",
                    accent = accent,
                )
            }
            if (ringFraction != null) {
                // Screenshot evidence (2026-11-05): the Current node wears a segmented
                // progress ring around it. The fraction is the chapter completion from
                // the same caller-provided set (ringFractionFor) — never an invented
                // lesson value — and the ring is static, so it needs no reduced-motion
                // gate. The ring adds no TalkBack layer: the chapter band already
                // announces the same count in words.
                Box(
                    modifier = Modifier
                        .size(nodeSize + ShomaraTokens.Space12)
                        .onGloballyPositioned(trackNodeCenter),
                    contentAlignment = Alignment.Center,
                ) {
                    ShomaraCurrentNodeRing(fraction = ringFraction, accent = accent, modifier = Modifier.fillMaxSize())
                    ShomaraPathNodeCircle(meta = meta, state = state, nodeSize = nodeSize, colors = colors)
                }
            } else {
                Box(
                    modifier = Modifier.onGloballyPositioned(trackNodeCenter),
                    contentAlignment = Alignment.Center,
                ) {
                    ShomaraPathNodeCircle(meta = meta, state = state, nodeSize = nodeSize, colors = colors)
                }
            }
            // The labels sit in a canvas-coloured mask: the winding line runs behind them
            // without ever striking through the text (the mask is the background colour
            // itself — no extra card, no contrast change).
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .background(ShomaraTokens.ColorCanvas, RoundedCornerShape(ShomaraTokens.RadiusMd))
                    .padding(horizontal = ShomaraTokens.Space4, vertical = ShomaraTokens.Space4),
            ) {
                Text(
                    text = meta.workingTitle,
                    style = ShomaraTypography.Body,
                    color = ShomaraTokens.ColorInk,
                    textAlign = TextAlign.Center,
                )
                Text(
                    text = "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)}",
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorMuted,
                    textAlign = TextAlign.Center,
                )
                Text(
                    // Owner page-06: locked nodes show the short visual label — the
                    // full warm reason stays in stateDescription for TalkBack.
                    text = if (state == ShomaraPathNodeState.Locked) {
                        ShomaraPathGraphLogic.lockedShortLabel
                    } else {
                        ShomaraPathGraphLogic.stateLabelFor(state)
                    },
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorMuted,
                    textAlign = TextAlign.Center,
                )
            }
            Spacer(modifier = Modifier.height(ShomaraTokens.Space16))
        }
    }
}

/**
 * The one-node speech bubble over the anchor node (N08R-06). Accent fill, white canonical
 * CTA word, small tail pointing at the circle. Decorative for TalkBack: clear semantics —
 * the merged node already announces its state; the bubble adds no second reading.
 */
@Composable
private fun ShomaraAnchorBubble(text: String, accent: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clearAndSetSemantics {},
    ) {
        Box(
            modifier = Modifier
                .background(accent, RoundedCornerShape(ShomaraTokens.RadiusPill))
                .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space4),
        ) {
            Text(text = text, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorWhite)
        }
        Canvas(modifier = Modifier.size(width = ShomaraTokens.Space12, height = ShomaraTokens.Space8)) {
            drawPath(
                path = Path().apply {
                    moveTo(0f, 0f)
                    lineTo(size.width, 0f)
                    lineTo(size.width / 2f, size.height)
                    close()
                },
                color = accent,
            )
        }
    }
}

/**
 * The node circle itself (72 dp, 84 dp for the one Current node) — N08R-06 Duolingo-style
 * solid node: 3D bottom edge (darkened accent offset one edge-token down), the top circle,
 * and a soft top-left sheen, all drawn behind the bounds. Completed/Perfect draw a crisp
 * white checkmark path; Fresh/Locked/Current show the Persian ordinal. No node is flat.
 */
@Composable
private fun ShomaraPathNodeCircle(
    meta: StationNodeMeta,
    state: ShomaraPathNodeState,
    nodeSize: Dp,
    colors: ShomaraNodeColors,
) {
    val depth = if (state == ShomaraPathNodeState.Current) ShomaraClayDepth.Featured else ShomaraClayDepth.Soft
    val showCheck = state == ShomaraPathNodeState.Completed || state == ShomaraPathNodeState.Perfect
    // The sheen only reads on the saturated chapter faces; on white/gray faces it is an
    // invisible wash (device pass finding) — skip it there.
    val showSheen = state == ShomaraPathNodeState.Current || showCheck
    Box(
        modifier = Modifier
            .shadow(ShomaraClay.specFor(depth).elevation, CircleShape)
            .size(nodeSize)
            .drawBehind {
                val radius = size.minDimension / 2f
                val edge = ShomaraTokens.ComponentEdge.toPx()
                // 1) the darkened-accent base circle, one edge-token down (the tactile lip)
                drawCircle(color = colors.edge, radius = radius, center = Offset(center.x, center.y + edge))
                // 2) the node face
                drawCircle(color = colors.container, radius = radius)
                // 3) the soft top sheen (Clay highlight, token widths only)
                if (showSheen) {
                    drawArc(
                        color = ShomaraTokens.ColorWhite.copy(alpha = 0.22f),
                        startAngle = 150f,
                        sweepAngle = 110f,
                        useCenter = false,
                        topLeft = Offset(ShomaraTokens.Space8.toPx(), ShomaraTokens.Space8.toPx()),
                        size = Size(size.width - ShomaraTokens.Space16.toPx(), size.height - ShomaraTokens.Space16.toPx()),
                        style = Stroke(width = ShomaraTokens.Space4.toPx(), cap = StrokeCap.Round),
                    )
                }
                if (showCheck) {
                    // Crisp drawn checkmark (Duolingo evidence): round-capped white stroke,
                    // sized by the circle radius so it scales with 72/84 dp nodes.
                    val stroke = ShomaraTokens.Space8.toPx()
                    val path = Path().apply {
                        moveTo(center.x - radius * 0.34f, center.y + radius * 0.02f)
                        lineTo(center.x - radius * 0.08f, center.y + radius * 0.28f)
                        lineTo(center.x + radius * 0.36f, center.y - radius * 0.24f)
                    }
                    drawPath(
                        path = path,
                        color = ShomaraTokens.ColorWhite,
                        style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round),
                    )
                }
            },
        contentAlignment = Alignment.Center,
    ) {
        if (!showCheck) {
            Text(
                text = ShomaraDigits.toFa(meta.ordinal),
                style = ShomaraTypography.Title,
                color = colors.content,
            )
        }
    }
}

/**
 * Segmented progress ring around the Current node (Duolingo screenshot evidence,
 * 2026-11-05: the ring is broken into short arcs on a grey track — not a continuous
 * circle). N08R-06: the fill follows the CHAPTER accent, like the node itself. Static
 * by construction: no animation, no pulse, so it is safe under reduced motion without
 * a special case. At fraction 0 only the track is visible, never an invisible ring.
 */
@Composable
private fun ShomaraCurrentNodeRing(fraction: Float, accent: Color, modifier: Modifier = Modifier) {
    val trackColor = ShomaraTokens.ColorLine2
    val fillColor = accent
    val stroke = ShomaraTokens.Space4
    Canvas(modifier = modifier) {
        val strokePx = stroke.toPx()
        val diameter = size.minDimension
        val arcSize = Size(diameter - strokePx, diameter - strokePx)
        val topLeft = Offset(strokePx / 2f, strokePx / 2f)
        drawArc(
            color = trackColor,
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = strokePx),
        )
        if (fraction > 0f) {
            // Dash lengths come from spacing tokens only (the design-system guard
            // rejects raw dp literals); 12dp segments with 8dp gaps.
            val segment = ShomaraTokens.Space12.toPx()
            val gap = ShomaraTokens.Space8.toPx()
            drawArc(
                color = fillColor,
                startAngle = -90f,
                sweepAngle = 360f * fraction.coerceIn(0f, 1f),
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(
                    width = strokePx,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(segment, gap), 0f),
                ),
            )
        }
    }
}
