package com.mathlearning.app.navigation

import com.mathlearning.feature.onboarding.OnboardingRoutes
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Regression guard for the measured LAUNCH CRASH (P0).
 *
 * The device log was:
 *   FATAL EXCEPTION: main
 *   java.lang.IllegalArgumentException: Navigation destination that matches route
 *   onboarding/welcome cannot be found in the navigation graph
 *
 * Cause: `ShomaraOnboardingHost` reported every onboarding STEP route upward, and the app turned
 * each one into `navController.navigate(stepRoute)` — but the graph registers `onboarding` as a
 * single destination whose steps are internal (design/playbook/ROUTE_REGISTRY.md).
 *
 * These are pure JVM assertions so the invariant is checked on every `./gradlew test`, not only
 * when someone happens to launch the app on a device.
 */
class RegisteredRoutesTest {

    @Test
    fun `every app destination is a registered route`() {
        for (destination in AppDestination.entries) {
            assertTrue(
                "destination ${destination.route} is declared but not registered in the NavHost",
                AppNavigationRoutes.isRegistered(destination.route),
            )
        }
    }

    @Test
    fun `onboarding step routes are NOT registered destinations`() {
        // The exact regression: these must never be reachable as navigation targets.
        for (step in AppNavigationRoutes.OnboardingInternalSteps) {
            assertFalse(
                "onboarding step '$step' must stay internal to the onboarding route",
                AppNavigationRoutes.isRegistered(step),
            )
        }
    }

    @Test
    fun `the onboarding internal step list matches what the feature actually emits`() {
        // If the onboarding feature ever renames or adds a step route, this fails instead of the
        // app silently drifting away from the registry again.
        assertEquals(
            OnboardingRoutes.Ordered,
            AppNavigationRoutes.OnboardingInternalSteps,
        )
    }

    @Test
    fun `every step route the onboarding flow can emit is classified as internal or registered`() {
        for (route in OnboardingRoutes.Ordered) {
            assertTrue(
                "'$route' must be either a registered destination or a known internal step",
                AppNavigationRoutes.isRegistered(route) || AppNavigationRoutes.isOnboardingInternalStep(route),
            )
        }
    }

    @Test
    fun `the registered list contains no duplicates`() {
        assertEquals(
            AppNavigationRoutes.Registered.size,
            AppNavigationRoutes.Registered.toSet().size,
        )
    }

    @Test
    fun `an unregistered route is rejected by the guard the app uses`() {
        // The app only navigates when the guard passes; prove the guard says no for step routes.
        assertFalse(AppNavigationRoutes.isRegistered("onboarding/welcome"))
        assertFalse(AppNavigationRoutes.isRegistered("shell/does-not-exist"))
        // And yes for the real ones.
        assertTrue(AppNavigationRoutes.isRegistered("shell"))
        assertTrue(AppNavigationRoutes.isRegistered("onboarding"))
    }
}