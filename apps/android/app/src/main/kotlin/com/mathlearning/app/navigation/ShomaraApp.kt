package com.mathlearning.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.app.di.AppContainer
import com.mathlearning.app.launch.ShomaraLaunchController
import com.mathlearning.app.launch.ShomaraLaunchGate
import com.mathlearning.app.launch.ShomaraLaunchRouting
import com.mathlearning.app.shell.ShomaraChildShell
import com.mathlearning.app.ui.FoundationScreen
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.core.model.ShomaraLaunchState
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import com.mathlearning.feature.onboarding.ShomaraOnboardingHost
import kotlinx.coroutines.launch

/**
 * Root navigation (N04-07 launch migration, extended in N08-15).
 *
 * The start destination is now [AppDestination.LAUNCH] — the launch gate — instead of
 * `onboarding`. That single change is what makes `ShomaraLaunchState` real: the gate performs the
 * secure session restoration, shows the branded splash while `Resolving`, shows a warm recovery
 * surface for `Offline`/`Error`, and only then routes to:
 *  - the authenticated child shell (`RestoringSession` = a VERIFIED session),
 *  - or the onboarding journey (`NewUser` / `RecoverIncompleteProfile`).
 *
 * The theme is intentionally NOT provided here — the activity supplies it so the persisted
 * reduced-motion preference (N08-04) reaches every surface.
 */
@Composable
fun ShomaraApp(
    authSession: ShomaraAuthSession,
    profileDraftStore: ShomaraProfileDraftStore,
    lessonGateway: LessonGateway,
    lessonCheckpoints: LessonCheckpointStore,
    settingsStore: ShomaraSettingsStore,
    simulatedAuth: Boolean = false,
    backendConfigured: Boolean = false,
) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    val launchController = remember(authSession, profileDraftStore) {
        ShomaraLaunchController(
            session = authSession,
            draftStore = profileDraftStore,
            backendConfigured = { backendConfigured },
            scope = scope,
        )
    }

    NavHost(
        navController = navController,
        startDestination = AppDestination.LAUNCH.route,
    ) {
        composable(
            route = AppDestination.LAUNCH.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.LAUNCH.deepLink }),
        ) {
            ShomaraLaunchGate(
                controller = launchController,
                onResolved = { state ->
                    if (ShomaraLaunchRouting.entersChildShell(state)) {
                        navController.navigate(AppDestination.SHELL.route) {
                            popUpTo(AppDestination.LAUNCH.route) { inclusive = true }
                        }
                    } else {
                        navController.navigate(AppDestination.ONBOARDING.route) {
                            popUpTo(AppDestination.LAUNCH.route) { inclusive = true }
                        }
                    }
                },
            )
        }
        composable(
            route = AppDestination.ONBOARDING.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.ONBOARDING.deepLink }),
        ) {
            ShomaraOnboardingHost(
                session = authSession,
                draftStore = profileDraftStore,
                simulatedAuth = simulatedAuth,
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
                onSignOut = {
                    // A sign-out clears the verified credential, then re-enters the launch gate so
                    // the next surface is resolved (never a stale child shell).
                    scope.launch {
                        authSession.signOut()
                        launchController.restart()
                        navController.navigate(AppDestination.LAUNCH.route) {
                            popUpTo(AppDestination.SHELL.route) { inclusive = true }
                        }
                    }
                },
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