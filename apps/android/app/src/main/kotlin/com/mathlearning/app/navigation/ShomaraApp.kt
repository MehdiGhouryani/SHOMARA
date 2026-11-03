package com.mathlearning.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.app.shell.ShomaraChildShell
import com.mathlearning.app.ui.FoundationScreen
import com.mathlearning.feature.onboarding.ShomaraOnboardingHost

/**
 * Launch migration (N04-07): the app starts at the onboarding flow; the shell is the post-auth
 * destination.
 *
 * The theme is intentionally NOT provided here — the activity supplies it so the persisted
 * reduced-motion preference (N08-04) reaches every surface. See [ShomaraApp]'s callers.
 */
@Composable
fun ShomaraApp(
    authSession: com.mathlearning.feature.onboarding.ShomaraAuthSession,
    profileDraftStore: com.mathlearning.core.datastore.ShomaraProfileDraftStore,
    lessonGateway: com.mathlearning.core.network.LessonGateway,
    lessonCheckpoints: com.mathlearning.core.datastore.LessonCheckpointStore,
    settingsStore: com.mathlearning.core.datastore.ShomaraSettingsStore,
) {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = AppDestination.ONBOARDING.route,
    ) {
        composable(
            route = AppDestination.ONBOARDING.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.ONBOARDING.deepLink }),
        ) {
            ShomaraOnboardingHost(
                session = authSession,
                draftStore = profileDraftStore,
                onStepRoute = { stepRoute ->
                    // P0 FIX: this used to call navController.navigate(stepRoute) for every
                    // onboarding step ("onboarding/welcome", "onboarding/phone", …). Those are NOT
                    // registered destinations — ROUTE_REGISTRY.md defines `onboarding` as a single
                    // route whose steps are internal to feature:onboarding — so the very first
                    // frame threw "Navigation destination that matches route onboarding/welcome
                    // cannot be found in the navigation graph". The host already renders the right
                    // step from its own state, so the mirror is removed instead of being papered
                    // over by registering five fake destinations.
                    //
                    // Only a genuinely registered route may be navigated to; the guard makes that
                    // mechanical rather than a comment (see RegisteredRoutesTest).
                    if (stepRoute in AppNavigationRoutes.Registered &&
                        navController.currentDestination?.route != stepRoute
                    ) {
                        navController.navigate(stepRoute) { launchSingleTop = true }
                    }
                },
                onAuthenticated = {
                    navController.navigate(AppDestination.SHELL.route) {
                        popUpTo(AppDestination.ONBOARDING.route) { inclusive = true }
                    }
                },
            )
        }
        composable(
            route = AppDestination.LESSON.route,
            deepLinks = listOf(navDeepLink { uriPattern = "mathlearning://lesson/{stationId}" }),
        ) { entry ->
            val stationId = entry.arguments?.getString("stationId") ?: "ST07"
            com.mathlearning.feature.lesson.ShomaraLessonHost(
                stationId = stationId,
                gateway = lessonGateway,
                checkpointStore = lessonCheckpoints,
                onExitToShell = { navController.popBackStack(AppDestination.SHELL.route, inclusive = false) },
            )
        }
        composable(
            route = AppDestination.SHELL.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.SHELL.deepLink }),
        ) {
            ShomaraChildShell(
                onSignOut = { /* session sign-out joins the parent surface flow in N06 */ },
                onStartStation = { stationId -> navController.navigate("lesson/$stationId") },
                lessonGateway = lessonGateway,
                lessonCheckpoints = lessonCheckpoints,
                settingsStore = settingsStore,
            )
        }
        composable(
            route = AppDestination.FOUNDATION.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.FOUNDATION.deepLink }),
        ) {
            FoundationScreen()
        }
    }
}