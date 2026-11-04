package com.mathlearning.core.model

/**
 * UI-001 launch resolution (N08-15): the pure decision layer behind [ShomaraLaunchState].
 *
 * Before this, [ShomaraLaunchState] existed as a contract with tests, but NOTHING in the running
 * app ever produced it: `MainActivity` went straight into `ShomaraApp`, whose start destination was
 * always `onboarding`, and the only session restore in the whole client lived in
 * `ShomaraOnboardingStateHolder.restoreDraft()` (a profile DRAFT, not a session). So a child who
 * already authenticated was re-shown the welcome gate on every cold start, and a brand-new user was
 * never distinguished from a returning one.
 *
 * This file holds the mapping rules only: no I/O, no Android types. `:app` performs the real
 * secure restoration (token read from the DataStore-backed store + server verification) and feeds
 * the observation in. Everything here is fail-closed:
 *
 *  - nothing verified → never `Resolving` forever, never a child surface;
 *  - `Resolving` is the ONLY state that renders the splash gate;
 *  - an unverified/incomplete start is `NewUser` (or `RecoverIncompleteProfile`), never a guest
 *    bypass (AGENTS §3.7 / `ShomaraOnboardingFlow.GuestEntryAllowed == false`).
 */
sealed class ShomaraSessionObservation {
    /** No usable credential was found on this device: a first-run or signed-out child. */
    data object NoSession : ShomaraSessionObservation()

    /**
     * A credential exists and the server verified it. [authenticatedAtMs] is the instant the
     * verified session began (used for the fail-closed expiry window).
     */
    data class Verified(val authenticatedAtMs: Long) : ShomaraSessionObservation()

    /**
     * A credential exists but could not be checked right now (network down, timeout, backend not
     * configured). It is NEVER treated as authenticated.
     */
    data class Unverified(val reason: ShomaraUnverifiedReason) : ShomaraSessionObservation()

    /** The server explicitly rejected the stored credential: it must be discarded. */
    data object Rejected : ShomaraSessionObservation()
}

enum class ShomaraUnverifiedReason {
    /** The device is offline (or the call timed out): retry is meaningful. */
    Offline,

    /** A request failed for a non-network reason; retry is still meaningful. */
    ServerError,

    /** No backend is configured for this build: the fix is configuration, not a retry. */
    BackendNotConfigured,
}

/**
 * Which surface a resolved state may render. Exactly one screen per launch state — no screen may
 * "peek" at a child surface while `Resolving` is current.
 */
enum class ShomaraLaunchSurface {
    /** Branded splash gate; nothing child-facing yet. */
    Splash,

    /** Onboarding journey (welcome step, or the resumable profile step). */
    Welcome,

    /** The authenticated child shell (path / practice / me). */
    ChildShell,

    /** Warm, understandable recovery screen with a real retry action. */
    Recovery,
}

object ShomaraLaunchResolver {
    /**
     * Maps one session observation to a launch state.
     *
     * [hasResumableDraft] is the "incomplete profile" signal: the child authenticated earlier (or
     * started the profile) and a real draft survived on disk, so the journey resumes instead of
     * restarting. It never authenticates anyone — the draft is local UI state, not a session.
     */
    fun resolve(
        observation: ShomaraSessionObservation,
        hasResumableDraft: Boolean = false,
    ): ShomaraLaunchState = when (observation) {
        ShomaraSessionObservation.NoSession ->
            if (hasResumableDraft) ShomaraLaunchState.RecoverIncompleteProfile else ShomaraLaunchState.NewUser
        ShomaraSessionObservation.Rejected ->
            if (hasResumableDraft) ShomaraLaunchState.RecoverIncompleteProfile else ShomaraLaunchState.NewUser
        is ShomaraSessionObservation.Verified -> ShomaraLaunchState.RestoringSession
        is ShomaraSessionObservation.Unverified -> when (observation.reason) {
            ShomaraUnverifiedReason.Offline -> ShomaraLaunchState.Offline
            ShomaraUnverifiedReason.ServerError,
            ShomaraUnverifiedReason.BackendNotConfigured,
            -> ShomaraLaunchState.Error
        }
    }

    /**
     * The surface a launch state renders.
     *
     * `RestoringSession` means "a **verified** session exists on this device" — the restore has
     * already completed by the time the state is published, so this state IS the authenticated
     * destination. It is kept in the enum for contract stability (UI-001).
     */
    fun surfaceFor(state: ShomaraLaunchState): ShomaraLaunchSurface = when (state) {
        ShomaraLaunchState.Resolving -> ShomaraLaunchSurface.Splash
        ShomaraLaunchState.NewUser,
        ShomaraLaunchState.RecoverIncompleteProfile,
        -> ShomaraLaunchSurface.Welcome
        ShomaraLaunchState.RestoringSession -> ShomaraLaunchSurface.ChildShell
        ShomaraLaunchState.Offline,
        ShomaraLaunchState.Error,
        -> ShomaraLaunchSurface.Recovery
    }
}