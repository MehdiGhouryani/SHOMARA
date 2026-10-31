package com.mathlearning.feature.onboarding

import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraAvatarOption
import com.mathlearning.core.model.ShomaraGradeCatalog
import com.mathlearning.core.model.ShomaraGradeOption
import com.mathlearning.core.model.ShomaraLaunchState

/**
 * Launch mapping (UI-001 → N04-01): the bootstrap state decides which surface renders, always
 * fail-closed — an offline or errored launch lands on onboarding with a warm banner, never on
 * a child surface.
 */
object ShomaraLaunchLogic {
    fun entersOnboarding(state: ShomaraLaunchState): Boolean = when (state) {
        ShomaraLaunchState.Resolving -> false // splash gate: nothing child-facing yet
        else -> true
    }

    fun modeFor(state: ShomaraLaunchState): ShomaraAuthMode = when (state) {
        ShomaraLaunchState.NewUser -> ShomaraAuthMode.New
        ShomaraLaunchState.RestoringSession -> ShomaraAuthMode.Restoring
        ShomaraLaunchState.RecoverIncompleteProfile -> ShomaraAuthMode.Recover
        ShomaraLaunchState.Offline, ShomaraLaunchState.Error -> ShomaraAuthMode.Error
        ShomaraLaunchState.Resolving -> ShomaraAuthMode.New
    }
}

/** Onboarding flow UI state (UI-002): how the current step was reached. */
enum class ShomaraFlowUiState { FirstRun, Resume, Back, Saving, Error }

object ShomaraFlowUiLogic {
    /** Deterministic UI-state mapping per entry event; Error keeps the current step visible. */
    fun uiStateFor(event: FlowEvent): ShomaraFlowUiState = when (event) {
        FlowEvent.LaunchFresh -> ShomaraFlowUiState.FirstRun
        FlowEvent.LaunchWithSavedDraft -> ShomaraFlowUiState.Resume
        FlowEvent.BackPressed -> ShomaraFlowUiState.Back
        FlowEvent.SaveStarted -> ShomaraFlowUiState.Saving
        FlowEvent.SaveFailed, FlowEvent.NetworkFailed -> ShomaraFlowUiState.Error
    }
}

enum class FlowEvent { LaunchFresh, LaunchWithSavedDraft, BackPressed, SaveStarted, SaveFailed, NetworkFailed }

/**
 * Profile draft (UI-004/UI-005): avatar selection from the canonical catalog, grade selection
 * restricted to AVAILABLE grades of the canonical catalog (locked grades are explained, never
 * selectable), and warm validation. Incomplete drafts are resumable across process death.
 */
data class ShomaraProfileDraft(
    val name: String = "",
    val avatarId: String = ShomaraAvatarCatalog.defaultId,
    val gradeId: String = ShomaraGradeCatalog.activeDefaultId,
) {
    init {
        require(ShomaraGradeCatalog.option(gradeId).available) {
            "${ShomaraGradeCatalog.lockedReason(gradeId)}"
        }
        require(ShomaraAvatarCatalog.option(avatarId).id == avatarId) { "unknown avatar $avatarId" }
    }

    val avatar: ShomaraAvatarOption
        get() = ShomaraAvatarCatalog.option(avatarId)

    val grade: ShomaraGradeOption
        get() = ShomaraGradeCatalog.option(gradeId)

    val isNameValid: Boolean
        get() = name.isNotBlank() && name.length >= 2 && name.none { it.isDigit() } && name == name.trim()

    val isComplete: Boolean
        get() = isNameValid

    val canSave: Boolean
        get() = isComplete

    /** Placement can only start from a complete profile. */
    val canEnterPlacement: Boolean
        get() = isComplete

    /** Resumable: a draft with any user-entered progress is worth keeping across restarts. */
    val isResumable: Boolean
        get() = name.isNotBlank() || avatarId != ShomaraAvatarCatalog.defaultId

    fun withAvatar(avatarId: String): ShomaraProfileDraft = copy(avatarId = avatarId)

    companion object {
        fun gradeLabel(gradeId: String): String = ShomaraGradeCatalog.option(gradeId).title

        fun nameValidationError(name: String): String? =
            if (ShomaraProfileDraft(name = name).isNameValid) null else ShomaraProfileStrings.NameInvalid

        fun gradesForSelection(): List<ShomaraGradeOption> = ShomaraGradeCatalog.Options
    }
}
