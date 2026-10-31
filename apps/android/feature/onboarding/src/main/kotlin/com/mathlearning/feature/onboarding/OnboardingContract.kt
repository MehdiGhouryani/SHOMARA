package com.mathlearning.feature.onboarding

/**
 * N04-01 onboarding state and route contract (START_HERE §7 protected decisions): Persian-first,
 * phone-OTP-only production onboarding. There is NO guest path into the child shell (AGENTS §3.5
 * / START_HERE §7) — enforced as a contract constant, not a UI detail.
 */

/** Launch auth mode: fresh new session, restoring a saved session, recovery, or error. */
enum class ShomaraAuthMode { New, Restoring, Recover, Error }

/** Canonical onboarding steps in mandated order. */
enum class OnboardingStep { Welcome, PhoneInput, OtpVerify, ProfileSetup, GradePlacement, Complete }

/** Canonical routes — one per step, stable ids for navigation (real navigation gate N04-07). */
object OnboardingRoutes {
    const val Welcome: String = "onboarding/welcome"
    const val PhoneInput: String = "onboarding/phone"
    const val OtpVerify: String = "onboarding/otp"
    const val ProfileSetup: String = "onboarding/profile"
    const val GradePlacement: String = "onboarding/placement"
    val Ordered: List<String> = listOf(Welcome, PhoneInput, OtpVerify, ProfileSetup, GradePlacement)
}

/** Persisted session state machine shared by onboarding and session-restore (N04-05). */
sealed class AuthSessionState {
    data object SignedOut : AuthSessionState()
    data object OtpPending : AuthSessionState()
    data class Authenticated(val accessToken: String) : AuthSessionState() {
        init { require(accessToken.isNotBlank()) { "authenticated session requires a token" } }
    }
    data object Restoring : AuthSessionState()
    data object Expired : AuthSessionState()
}

/** Pure onboarding flow reducer — JVM-testable; composables render, never decide. */
data class ShomaraOnboardingFlow(
    val mode: ShomaraAuthMode = ShomaraAuthMode.New,
    val step: OnboardingStep = OnboardingStep.Welcome,
) {
    init {
        require(mode != ShomaraAuthMode.Restoring || step == OnboardingStep.Welcome) {
            "restoring sessions must re-enter through the welcome gate"
        }
    }

    fun stepRoute(): String = when (step) {
        OnboardingStep.Welcome -> OnboardingRoutes.Welcome
        OnboardingStep.PhoneInput -> OnboardingRoutes.PhoneInput
        OnboardingStep.OtpVerify -> OnboardingRoutes.OtpVerify
        OnboardingStep.ProfileSetup -> OnboardingRoutes.ProfileSetup
        OnboardingStep.GradePlacement -> OnboardingRoutes.GradePlacement
        OnboardingStep.Complete -> OnboardingRoutes.Welcome // completion leaves onboarding entirely
    }

    fun advanceTo(next: OnboardingStep): ShomaraOnboardingFlow {
        require(next.ordinal >= step.ordinal) { "onboarding never steps backwards; replace the flow instead" }
        return copy(step = next)
    }

    fun withMode(mode: ShomaraAuthMode): ShomaraOnboardingFlow = copy(mode = mode)

    companion object {
        /** Production contract: guest entry into the child shell is impossible. */
        const val GuestEntryAllowed: Boolean = false

        /** Restoring mode must verify the saved token server-side before reaching any step. */
        fun entryStateFor(mode: ShomaraAuthMode, session: AuthSessionState): ShomaraOnboardingFlow = when (mode) {
            ShomaraAuthMode.Restoring ->
                if (session is AuthSessionState.Authenticated) {
                    throw IllegalStateException("restore must fail closed until the server verifies the token")
                } else {
                    ShomaraOnboardingFlow(mode = mode, step = OnboardingStep.Welcome)
                }
            else -> ShomaraOnboardingFlow(mode = mode, step = OnboardingStep.Welcome)
        }
    }
}
