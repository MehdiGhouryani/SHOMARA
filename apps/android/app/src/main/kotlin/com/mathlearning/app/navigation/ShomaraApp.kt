package com.mathlearning.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
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
 * R-05 — lesson-entry routing (F-01): the lesson host renders directly ONLY when the entry
 * came through the station-start sheet's CTA (the shell sets [enteredViaSheet] on the way
 * in); every other entry — a deep link, a restored back stack, a stray navigate — routes
 * back through the shell, which opens the station-start sheet for the station (a locked
 * station gets the Locked sheet, never the lesson). Pure decision, JVM-tested.
 */
object ShomaraLessonEntryRouting {
    fun rendersLessonDirectly(enteredViaSheet: Boolean): Boolean = enteredViaSheet
}

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
    // N08R-08: debug-only discover preview steps (release keeps this empty, fail-closed).
    lessonDiscoverSteps: List<com.mathlearning.feature.lesson.ShomaraDiscoverStep> = emptyList(),
    lessonGuidedItems: List<com.mathlearning.feature.lesson.ShomaraGuidedItem> = emptyList(),
    lessonGuidedEvaluator: com.mathlearning.feature.lesson.ShomaraGuidedEvaluator? = null,
    lessonPreviewAdvance: Boolean = false,
    settingsStore: ShomaraSettingsStore,
    simulatedAuth: Boolean = false,
    backendConfigured: Boolean = false,
    // P14: the durable attempt recorder (debug wiring; release passes null — fail-closed).
    lessonRecordRepository: com.mathlearning.core.model.repository.LessonRecordRepository? = null,
) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    // R-05/R-08 — lesson-entry handshake with the shell. The flags are rememberSaveable so a
    // process death mid-lesson restores the same entry mode (the child already passed the
    // sheet); they are cleared on exit to the shell, never while the lesson is live.
    var lessonEnteredViaSheet by rememberSaveable { mutableStateOf(false) }
    var lessonReplay by rememberSaveable { mutableStateOf(false) }
    var pendingDeepLinkStationId by rememberSaveable { mutableStateOf<String?>(null) }
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
                // The profile avatar must land in the settings store (the single source
                // the Me tab and the Settings screen read), not only in the draft store.
                settingsStore = settingsStore,
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
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.LESSON.deepLink }),
        ) { entry ->
            val stationId = entry.arguments?.getString("stationId") ?: "ST07"
            if (ShomaraLessonEntryRouting.rendersLessonDirectly(lessonEnteredViaSheet)) {
                com.mathlearning.feature.lesson.ShomaraLessonHost(
                    stationId = stationId,
                    gateway = lessonGateway,
                    checkpointStore = lessonCheckpoints,
                    discoverSteps = lessonDiscoverSteps,
                    guidedItems = lessonGuidedItems,
                    guidedEvaluator = lessonGuidedEvaluator,
                    lessonRecords = lessonRecordRepository,
                    previewAdvanceToNextStage = lessonPreviewAdvance,
                    replay = lessonReplay,
                    onExitToShell = {
                        lessonEnteredViaSheet = false
                        lessonReplay = false
                        navController.popBackStack(AppDestination.SHELL.route, inclusive = false)
                    },
                )
            } else {
                // R-05 (F-01): a lesson deep link must not bypass the station-start sheet
                // (or its lock) — it routes back through the shell, which opens the sheet
                // for the station; only the sheet's «شروع/ادامه/تمرین دوباره» CTA enters
                // the lesson. The deep link itself is kept (it was deliberately fixed and
                // verified on device); it is the entry that is routed, not removed.
                LaunchedEffect(stationId) {
                    pendingDeepLinkStationId = stationId
                    navController.navigate(AppDestination.SHELL.route) {
                        popUpTo(AppDestination.LESSON.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }
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
                // R-05: a deep-linked station opens its start sheet in the shell; the pending
                // id is consumed once by the shell so the sheet does not reopen.
                initialStationId = pendingDeepLinkStationId,
                onInitialStationConsumed = { pendingDeepLinkStationId = null },
                // R-05/R-08: only the sheet's CTA enters a lesson. The flag marks the entry
                // as sheet-approved; the replay flag marks a fresh run from P1.
                onStartStation = { stationId ->
                    lessonEnteredViaSheet = true
                    lessonReplay = false
                    navController.navigate("lesson/$stationId")
                },
                onReplayStation = { stationId ->
                    lessonEnteredViaSheet = true
                    lessonReplay = true
                    navController.navigate("lesson/$stationId")
                },
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