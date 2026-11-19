package com.mathlearning.feature.path

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.unit.Dp
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta

/** Domain-projected node states; the UI never adds an Upcoming or mastery state. */
enum class ShomaraPathNodeState { Fresh, Current, Completed, Perfect, Locked }

/** Caller-provided local progress. Unresolved identity is never a resolved empty learner. */
@Immutable
data class ShomaraPathProgress(
    val completedStationIds: Set<String> = emptySet(),
    val perfectStationIds: Set<String> = emptySet(),
    val currentStationId: String? = null,
    val offline: Boolean = false,
    val isResolved: Boolean = false,
) {
    init {
        require(perfectStationIds.all { it in completedStationIds }) { "perfect implies completed" }
        require(isResolved || (completedStationIds.isEmpty() && perfectStationIds.isEmpty() && currentStationId == null)) {
            "unresolved progress cannot carry fabricated or partial station state"
        }
    }

    companion object {
        fun unresolved(): ShomaraPathProgress = ShomaraPathProgress()
        fun emptyResolved(): ShomaraPathProgress = ShomaraPathProgress(isResolved = true)
    }
}

/** Geometry and node text share this width at every supported font scale. */
internal val PathNodeColumnWidth: Dp = ShomaraTokens.Space40 * 4

data class ShomaraNodeColors(val container: Color, val content: Color, val edge: Color)

/** Pure path projection and deterministic geometry; no Compose measurement or I/O happens here. */
object ShomaraPathGraphLogic {
    fun resolveEntryState(
        progress: ShomaraPathProgress,
        requested: ShomaraEntryState?,
    ): ShomaraEntryState? = when (requested) {
        ShomaraEntryState.Loading -> ShomaraEntryState.Loading
        ShomaraEntryState.Error -> ShomaraEntryState.Error
        ShomaraEntryState.Empty -> ShomaraEntryState.Empty
        ShomaraEntryState.Offline -> if (progress.isResolved) ShomaraEntryState.Offline else ShomaraEntryState.Loading
        null -> if (progress.isResolved) null else ShomaraEntryState.Loading
    }

    private val PathZigzagMaxAmplitude: Dp = ShomaraTokens.ComponentNodeSize - ShomaraTokens.Space8

    fun zigzagMagnitude(globalIndex: Int): Float = when (globalIndex % 4) {
        0 -> 1f
        1 -> 0.55f
        2 -> 1f
        else -> 0.55f
    }

    fun zigzagAmplitudeDp(contentWidth: Dp): Dp {
        val reachable = (contentWidth - PathNodeColumnWidth) / 2f
        val cap = if (reachable.value > 0f) reachable else Dp(0f)
        return minOf(PathZigzagMaxAmplitude, cap)
    }

    fun zigzagOffsetDp(globalIndex: Int, isRtl: Boolean, contentWidth: Dp): Dp {
        val sign = if (globalIndex % 2 == 0) 1f else -1f
        val offset = zigzagAmplitudeDp(contentWidth) * sign * zigzagMagnitude(globalIndex)
        return if (isRtl) -offset else offset
    }

    fun connectorEnterOffsetDp(globalIndex: Int, isRtl: Boolean, contentWidth: Dp): Dp =
        if (globalIndex <= 0) zigzagOffsetDp(globalIndex, isRtl, contentWidth)
        else zigzagOffsetDp(globalIndex - 1, isRtl, contentWidth)

    fun freshStationId(progress: ShomaraPathProgress): String? {
        if (!progress.isResolved || progress.currentStationId != null) return null
        return ShomaraStationCatalog.Stations.firstOrNull { it.id !in progress.completedStationIds }?.id
    }

    fun stateFor(meta: StationNodeMeta, progress: ShomaraPathProgress): ShomaraPathNodeState = when {
        !progress.isResolved -> ShomaraPathNodeState.Locked
        meta.id == progress.currentStationId -> ShomaraPathNodeState.Current
        meta.id in progress.perfectStationIds -> ShomaraPathNodeState.Perfect
        meta.id in progress.completedStationIds -> ShomaraPathNodeState.Completed
        meta.id == freshStationId(progress) -> ShomaraPathNodeState.Fresh
        else -> ShomaraPathNodeState.Locked
    }

    fun stateLabelFor(state: ShomaraPathNodeState): String = when (state) {
        ShomaraPathNodeState.Fresh -> "آمادهٔ شروع"
        ShomaraPathNodeState.Current -> "ایستگاه فعلی"
        ShomaraPathNodeState.Completed -> "تکمیل شد — برای تمرین دوباره ضربه بزن"
        ShomaraPathNodeState.Perfect -> "کامل و بی‌نقص"
        ShomaraPathNodeState.Locked -> "هنوز قفل؛ با ترتیب مسیر باز می‌شود"
    }

    val lockedShortLabel: String = "هنوز قفل"

    fun accentFor(chapter: Int): Color = chapterBandColors(chapter).second

    fun edgeFor(accent: Color): Color = lerp(accent, ShomaraTokens.ColorInk, 0.3f)

    fun colorsFor(state: ShomaraPathNodeState, chapter: Int): ShomaraNodeColors {
        val accent = accentFor(chapter)
        return when (state) {
            // One violet focal station across all chapter palettes; other nodes retain chapter identity.
            ShomaraPathNodeState.Current -> ShomaraNodeColors(
                ShomaraTokens.ColorHomeViolet,
                ShomaraTokens.ColorHomeOnViolet,
                ShomaraTokens.ColorHomeVioletDark,
            )
            ShomaraPathNodeState.Completed -> ShomaraNodeColors(accent, ShomaraTokens.ColorWhite, edgeFor(accent))
            ShomaraPathNodeState.Perfect -> ShomaraNodeColors(accent, ShomaraTokens.ColorWhite, lerp(edgeFor(accent), ShomaraTokens.ColorInk, 0.3f))
            ShomaraPathNodeState.Fresh -> ShomaraNodeColors(ShomaraTokens.ColorSurface, accent, edgeFor(accent))
            ShomaraPathNodeState.Locked -> ShomaraNodeColors(ShomaraTokens.ColorLine2, ShomaraTokens.ColorInk2, lerp(ShomaraTokens.ColorLine2, ShomaraTokens.ColorInk, 0.35f))
        }
    }

    fun tapEnabled(state: ShomaraPathNodeState): Boolean = true

    /**
     * Depth encodes availability and can never contradict the state label: the Current station
     * is the only raised surface, a locked station is flat (there is nothing to press into) and
     * every other station is a soft surface. Migrated from the retired PathKit contract, so the
     * rule is now asserted against the real renderer instead of a parallel one.
     */
    fun depthFor(state: ShomaraPathNodeState): ShomaraClayDepth = when (state) {
        ShomaraPathNodeState.Current -> ShomaraClayDepth.Featured
        ShomaraPathNodeState.Locked -> ShomaraClayDepth.Flat
        ShomaraPathNodeState.Fresh,
        ShomaraPathNodeState.Completed,
        ShomaraPathNodeState.Perfect
        -> ShomaraClayDepth.Soft
    }

    fun restoredChapter(saved: Int?): Int =
        if (saved != null && saved in ShomaraChapterCatalog.All) saved else ShomaraChapterCatalog.All.first()

    fun nextStepStation(progress: ShomaraPathProgress): StationNodeMeta? {
        if (!progress.isResolved || progress.offline) return null
        val currentId = progress.currentStationId
        if (currentId != null) return ShomaraStationCatalog.Stations.firstOrNull { it.id == currentId }
        val freshId = freshStationId(progress) ?: return null
        return ShomaraStationCatalog.Stations.firstOrNull { it.id == freshId }
    }

    fun completedInChapter(chapter: Int, progress: ShomaraPathProgress): Int =
        ShomaraStationCatalog.stationsInChapter(chapter).count { it.id in progress.completedStationIds }

    fun knownCompletedCount(progress: ShomaraPathProgress): Int {
        val known = ShomaraStationCatalog.Stations.map { it.id }.toSet()
        return progress.completedStationIds.count { it in known }
    }

    fun remainingCount(progress: ShomaraPathProgress): Int =
        (ShomaraStationCatalog.STATION_COUNT - knownCompletedCount(progress)).coerceAtLeast(0)

    /**
     * Copy for the anchor bubble above the Current station. It is derived from real progress, so
     * a child resuming at ST07 never reads «شروع» over a station twelve steps into the path.
     */
    fun currentBubbleLabel(progress: ShomaraPathProgress): String =
        if (knownCompletedCount(progress) == 0) "شروع" else "ادامه"

    fun progressFraction(progress: ShomaraPathProgress): Float {
        val total = ShomaraStationCatalog.STATION_COUNT
        return if (total > 0) knownCompletedCount(progress).toFloat() / total.toFloat() else 0f
    }

    fun ringFractionFor(meta: StationNodeMeta, progress: ShomaraPathProgress): Float {
        val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
        if (total <= 0) return 0f
        val lastCompleted = ShomaraStationCatalog.Stations.lastOrNull { it.id in progress.completedStationIds }
        val chapter = lastCompleted?.chapter ?: meta.chapter
        return completedInChapter(chapter, progress).toFloat() / total.toFloat()
    }

    fun chapterSpanLabel(chapter: Int): String {
        val stations = ShomaraStationCatalog.stationsInChapter(chapter)
        return "ایستگاه‌های ${ShomaraDigits.toFa(stations.first().ordinal)} تا ${ShomaraDigits.toFa(stations.last().ordinal)}"
    }

    fun chapterBandColors(chapter: Int): Pair<Color, Color> = when (chapter) {
        1 -> ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorPrimary
        2 -> ShomaraTokens.ColorSkySoft to ShomaraTokens.ColorSky
        3 -> ShomaraTokens.ColorAmberSoft to ShomaraTokens.ColorAmberInk
        4 -> ShomaraTokens.ColorBerrySoft to ShomaraTokens.ColorBerry
        else -> ShomaraTokens.ColorSurfaceAlt to ShomaraTokens.ColorInk2
    }

    // The list holds path rows only: per chapter one sticky band, its stations, and a divider
    // between chapters. The orientation strip is pinned outside the list, so chapter 1's band is
    // index 0 and no synthetic header offset is counted anywhere.
    fun chapterBandIndexForChapter(chapter: Int): Int =
        (chapter - 1) * (ShomaraStationCatalog.STATIONS_PER_CHAPTER + 2)

    fun itemIndexForStation(meta: StationNodeMeta): Int {
        val positionInChapter = (meta.ordinal - 1) % ShomaraStationCatalog.STATIONS_PER_CHAPTER
        return chapterBandIndexForChapter(meta.chapter) + 1 + positionInChapter
    }

    fun restoredFirstVisibleIndex(savedChapter: Int?): Int {
        val chapter = restoredChapter(savedChapter)
        return if (chapter <= 1) 0 else chapterBandIndexForChapter(chapter)
    }

    /**
     * A restored chapter wins. Otherwise the active/fresh station is visible immediately instead
     * of leaving a returning learner at ST01 while the actual next action is several chapters away.
     */
    fun initialFirstVisibleIndex(savedChapter: Int?, progress: ShomaraPathProgress): Int {
        if (savedChapter != null) return restoredFirstVisibleIndex(savedChapter)
        if (!progress.isResolved) return 0
        val anchorId = progress.currentStationId ?: freshStationId(progress) ?: return 0
        val anchor = ShomaraStationCatalog.Stations.firstOrNull { it.id == anchorId } ?: return 0
        if (anchor.ordinal == ShomaraStationCatalog.Stations.first().ordinal) return 0
        return itemIndexForStation(anchor)
    }
}
