package com.mathlearning.feature.practice

import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta

/**
 * N08 §4 — practice hub data derivation.
 *
 * The hub screen was already complete and honest (loading/list/empty/locked/offline/error/history),
 * but `ShomaraChildShellHost` called it with `items = emptyList(), recent = emptyList()`, so the tab
 * could ONLY ever render the empty state. No amount of UI work fixes that.
 *
 * This object derives the practice list from data the client genuinely has:
 *  - the canonical station catalog (25 stations, IDs fixed per CONTENT-004), and
 *  - the child's real progress projection.
 *
 * It deliberately does NOT invent practice items. A station appears as PRACTICE only when it is
 * already reachable (current or completed): re-practising mastered material is a legitimate,
 * server-permitted activity, whereas offering an unreached station as a "practice" would leak the
 * curriculum forward and misrepresent what the child may do.
 *
 * Stations the child has not reached are not silently dropped either — they are surfaced as LOCKED
 * with a warm reason, which is what the screen's Locked state was designed for.
 */
object ShomaraPracticeCatalog {
    /**
     * Builds the practice list from catalog + progress.
     *
     * @param completedStationIds stations the server reports as completed
     * @param currentStationId the station the server placed the child on (may be null)
     */
    fun itemsFor(
        completedStationIds: Set<String>,
        currentStationId: String?,
    ): List<ShomaraPracticeItem> {
        val completed = completedStationIds.filter { id -> ShomaraStationCatalog.Stations.any { it.id == id } }.toSet()

        return ShomaraStationCatalog.Stations.map { station ->
            val reachable = station.id in completed || station.id == currentStationId
            if (reachable) {
                ShomaraPracticeItem(
                    id = station.id,
                    title = station.workingTitle,
                    locked = false,
                )
            } else {
                ShomaraPracticeItem(
                    id = station.id,
                    title = station.workingTitle,
                    locked = true,
                    lockedReason = lockedReasonFor(station),
                )
            }
        }
    }

    /**
     * Recently practised: completed stations only, most recent first as far as the client knows.
     * The client has no per-station timestamp, so ordering follows catalog order (stable and
     * deterministic) instead of a fabricated "recent" ordering.
     */
    fun recentFor(completedStationIds: Set<String>): List<ShomaraPracticeItem> =
        ShomaraStationCatalog.Stations
            .filter { it.id in completedStationIds }
            .map { ShomaraPracticeItem(id = it.id, title = it.workingTitle) }

    /** Warm, non-punitive reason (AGENTS rule 9): a lock is an invitation, never a scolding. */
    private fun lockedReasonFor(station: StationNodeMeta): String =
        "با ادامهٔ مسیر باز می‌شود"

    /** True when there is genuinely nothing to practise yet (a real empty state, not a bug). */
    fun isEmpty(items: List<ShomaraPracticeItem>): Boolean = items.none { !it.locked }
}