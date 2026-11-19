package com.mathlearning.feature.path

/**
 * Immutable presentation contract for the home/path screen.
 * Map from the current domain + ViewModel projection; never calculate progress,
 * mastery, unlocks or answer correctness in UI code.
 */
enum class ShomaraHomeLoadState {
    Loading,
    Ready,
    Empty,
    ContentUnavailable,
    Error,
}

enum class ShomaraHomeNodeVisualState {
    Fresh,
    Current,
    Completed,
    Perfect,
    Locked,
}

enum class ShomaraHomeTabId { Path, Practice, Me }

data class ShomaraHomeProgressUi(
    val completed: Int,
    val total: Int,
    val spokenLabel: String,
) {
    init {
        require(completed >= 0) { "completed cannot be negative" }
        require(total >= 0) { "total cannot be negative" }
        require(completed <= total || total == 0) { "completed cannot exceed known total" }
        require(spokenLabel.isNotBlank()) { "progress label is required for accessibility" }
    }

    val isDeterminate: Boolean get() = total > 0
    val fraction: Float get() = if (total > 0) completed.toFloat() / total.toFloat() else 0f
}

data class ShomaraHomeContinueUi(
    val stationId: String,
    val title: String,
    val description: String?,
    val actionLabel: String,
    val isResume: Boolean,
) {
    init {
        require(stationId.isNotBlank())
        require(title.isNotBlank())
        require(actionLabel.isNotBlank())
    }
}

data class ShomaraHomePathNodeUi(
    val stationId: String,
    val ordinal: Int,
    val title: String,
    val description: String?,
    val state: ShomaraHomeNodeVisualState,
    /** Full reason from domain; can be rendered in a sheet and announced by TalkBack. */
    val lockedReason: String? = null,
    /** True only if a real route/action exists (including a lock explanation). */
    val canOpen: Boolean,
) {
    init {
        require(stationId.isNotBlank())
        require(ordinal > 0)
        require(title.isNotBlank())
        if (state == ShomaraHomeNodeVisualState.Locked) require(!lockedReason.isNullOrBlank())
    }
}

data class ShomaraHomePathUiState(
    val loadState: ShomaraHomeLoadState = ShomaraHomeLoadState.Loading,
    val gradeLabel: String? = null,
    val chapterTitle: String? = null,
    val progress: ShomaraHomeProgressUi? = null,
    val continueStation: ShomaraHomeContinueUi? = null,
    val nodes: List<ShomaraHomePathNodeUi> = emptyList(),
    val selectedTab: ShomaraHomeTabId = ShomaraHomeTabId.Path,
    val currentStationId: String? = null,
    /** Stable key/anchor only; the ViewModel or saved-state owner controls restoration. */
    val scrollAnchorStationId: String? = null,
    val childFacingMessage: String? = null,
) {
    init {
        require(nodes.map { it.stationId }.distinct().size == nodes.size) {
            "stationId must be unique for LazyColumn keys"
        }
        require(nodes.count { it.state == ShomaraHomeNodeVisualState.Current } <= 1) {
            "only one Current node may be present"
        }
        if (currentStationId != null) require(nodes.any { it.stationId == currentStationId } || nodes.isEmpty()) {
            "currentStationId should refer to a projected node when nodes are present"
        }
        if (loadState == ShomaraHomeLoadState.Ready) {
            require(!gradeLabel.isNullOrBlank())
            require(!chapterTitle.isNullOrBlank())
        }
    }
}

/** UI emits intent; the ViewModel/use case owns navigation and side effects. */
sealed interface ShomaraHomePathEvent {
    data object OpenSettings : ShomaraHomePathEvent
    data object ContinueStation : ShomaraHomePathEvent
    data class OpenStation(val stationId: String) : ShomaraHomePathEvent
    data class ExplainLockedStation(val stationId: String) : ShomaraHomePathEvent
    data class SelectTab(val tab: ShomaraHomeTabId) : ShomaraHomePathEvent
    data object ReturnToCurrentStation : ShomaraHomePathEvent
}
