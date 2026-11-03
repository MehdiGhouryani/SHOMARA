package com.mathlearning.app.navigation

/**
 * The routes the app's NavHost actually registers (single source of truth).
 *
 * This exists because of a measured P0: `ShomaraOnboardingHost` mirrors every onboarding step into
 * `navController.navigate(OnboardingRoutes.X)`, while the graph registered only `onboarding`. The
 * first frame therefore crashed with
 *
 *   IllegalArgumentException: Navigation destination that matches route onboarding/welcome
 *   cannot be found in the navigation graph
 *
 * Per `design/playbook/ROUTE_REGISTRY.md`, `onboarding` is ONE route whose steps are internal to
 * `feature:onboarding`; the steps are NOT navigation destinations. Declaring the registered routes
 * in one place lets [RegisteredRoutesTest] fail if any navigation target drifts outside the graph
 * again, instead of only discovering it when a device launches the app.
 */
object AppNavigationRoutes {
    /** Every route registered in the NavHost, in declaration order. */
    val Registered: List<String> = listOf(
        AppDestination.ONBOARDING.route,
        AppDestination.LESSON.route,
        AppDestination.SHELL.route,
        AppDestination.FOUNDATION.route,
    )

    /**
     * Onboarding steps are rendered INSIDE the `onboarding` route and must never be navigated to
     * directly. Mirrored as data so the invariant is enforced by a test rather than a comment.
     */
    val OnboardingInternalSteps: List<String> = listOf(
        "onboarding/welcome",
        "onboarding/phone",
        "onboarding/otp",
        "onboarding/profile",
        "onboarding/placement",
    )

    fun isRegistered(route: String): Boolean = route in Registered

    /** True when a navigation target is a step that must stay internal to onboarding. */
    fun isOnboardingInternalStep(route: String): Boolean = route in OnboardingInternalSteps
}