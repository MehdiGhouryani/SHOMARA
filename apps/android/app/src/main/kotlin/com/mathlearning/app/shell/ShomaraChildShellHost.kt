package com.mathlearning.app.shell

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.core.designsystem.ShomaraBottomSheet
import com.mathlearning.core.designsystem.ShomaraTab
import com.mathlearning.core.designsystem.ShomaraTabBar
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraStateSurface
import com.mathlearning.core.designsystem.ShomaraBackHandler
import com.mathlearning.feature.path.ShomaraHomeAction
import com.mathlearning.feature.path.ShomaraHomeScreen
import com.mathlearning.feature.path.ShomaraHomeUiState
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.feature.path.ShomaraStationStartSheet
import com.mathlearning.feature.practice.ShomaraPracticeCatalog
import com.mathlearning.feature.practice.ShomaraPracticeHubScreen
import com.mathlearning.feature.practice.ShomaraPracticeHubStrings
import com.mathlearning.feature.profile.ShomaraMeScreen
import com.mathlearning.feature.settings.ShomaraSettingsSaveState
import com.mathlearning.feature.settings.ShomaraSettingsScreen
import com.mathlearning.feature.settings.ShomaraSettingsState
import com.mathlearning.feature.settings.ShomaraSettingsStrings
import kotlinx.coroutines.launch

/**
 * Child shell host (N05-01 / family 17): three fixed tabs with REAL per-tab state retention
 * (each tab keeps its own back-stack entry with saveState/restoreState, so switching tabs and
 * returning never loses scroll or selection). Back is deterministic via [ShomaraShellLogic].
 *
 * Tab content renders the real feature surfaces (N05-02..N05-06). The path renders a caller-provided
 * resolved snapshot. After ADR-0039, the intended source is the active
 * local child profile + Room projection; O5/profile persistence is not wired yet, so the root currently
 * supplies an unresolved snapshot and the path/practice surfaces remain in Loading instead of fabricating Fresh/Locked.
 */
@Composable
fun ShomaraChildShell(
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
    pathProgress: ShomaraPathProgress = ShomaraPathProgress.unresolved(),
    childName: String? = null,
    completedStations: Int = 0,
    reducedMotion: Boolean = false,
    lessonGateway: com.mathlearning.core.network.LessonGateway? = null,
    lessonCheckpoints: com.mathlearning.core.datastore.LessonCheckpointStore? = null,
    // Required: the settings surface persists real preferences, so the caller must supply the real
    // store. A fabricated/in-memory default would reintroduce the misleading "saved" state.
    settingsStore: ShomaraSettingsStore,
    onStartStation: (String) -> Unit = {},
    // R-08: a completed station's CTA replays it (fresh run from P1), it does not resume it.
    onReplayStation: (String) -> Unit = {},
    // R-05: a station id the shell must open the start sheet for (a lesson deep link hands
    // the shell the station instead of entering the lesson directly). Null is the normal
    // case — the sheet only opens from a node tap.
    initialStationId: String? = null,
    onInitialStationConsumed: () -> Unit = {},
) {
    val navController = rememberNavController()
    var currentTab by rememberSaveable { mutableStateOf(ShomaraShellTab.Default) }
    // F-01: the station-start sheet is shell-owned state. Tapping a node (path or practice)
    // opens the sheet for that station; only the sheet's «شروع/ادامه» CTA navigates to the
    // lesson. Before, the tap navigated straight to `lesson/$id` — the lock was bypassed
    // and the sheet had no caller at all.
    // Queue the deep link through its route argument; do not pre-open hidden sheet state.
    // While progress is unresolved, Back must not consume a sheet that is not visible yet.
    var selectedStationId by rememberSaveable { mutableStateOf<String?>(null) }
    // R-05: a deep-linked station arrives after the first composition (the app sets the
    // pending id, then navigates here). The sheet opens for it exactly once; the pending
    // id is consumed so dismissing the sheet does not reopen it.
    LaunchedEffect(initialStationId, pathProgress.isResolved) {
        if (initialStationId != null && pathProgress.isResolved && selectedStationId == null) {
            selectedStationId = initialStationId
            onInitialStationConsumed()
        }
    }

    fun goToTab(tab: ShomaraShellTab) {
        if (tab != currentTab) {
            currentTab = tab
            navController.navigate(tab.route) {
                popUpTo(ShomaraShellTab.Default.route) { saveState = true }
                launchSingleTop = true
                restoreState = true
            }
        }
    }

    // F-25: system Back is deterministic — on a non-default TAB route it returns to the
    // default tab; on the default tab the system handles it (exit). The handler is only
    // enabled on tab routes: on the settings/parent destinations Back must pop the
    // NavHost stack instead, and swallowing it here would trap the child there.
    // F-25 (sheet): when the station-start sheet is open, Back closes the sheet FIRST —
    // a Back that jumped tabs while the sheet was open would leave the sheet orphaned
    // on the new tab. Only with no sheet open does Back fall through to the tab target.
    val backStackEntry by navController.currentBackStackEntryAsState()
    val onTabRoute = backStackEntry?.destination?.route in ShomaraShellTab.entries.map { it.route }
    val backTarget = if (onTabRoute) ShomaraShellLogic.backTarget(currentTab) else null
    ShomaraBackHandler(enabled = selectedStationId != null || backTarget != null) {
        if (selectedStationId != null) {
            selectedStationId = null
        } else {
            val target = ShomaraShellLogic.backTarget(currentTab)
            if (target != null) goToTab(target)
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            ShomaraTabBar(
                // DT-76 (handoff C13): each tab carries its canonical active/inactive nav icon —
                // the six VectorDrawables from the v3 handoff asset pack.
                tabs = ShomaraShellLogic.canonicalTabs().map { tab ->
                    ShomaraTab(
                        id = tab.route,
                        label = tab.label,
                        activeIconRes = ShomaraShellNavIcons.activeFor(tab),
                        inactiveIconRes = ShomaraShellNavIcons.inactiveFor(tab),
                    )
                },
                selectedId = currentTab.route,
                onSelected = { route ->
                    goToTab(ShomaraShellLogic.select(currentTab, ShomaraShellTab.fromRoute(route)))
                },
            )
        },
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            NavHost(
                navController = navController,
                startDestination = ShomaraShellTab.Default.route,
            ) {
                composable(
                    route = ShomaraShellTab.Path.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Path.deepLink }),
                ) {
                    val homeState = remember(pathProgress) {
                        ShomaraHomeUiState(progress = pathProgress)
                    }
                    ShomaraHomeScreen(
                        state = homeState,
                        onAction = { action ->
                            when (action) {
                                ShomaraHomeAction.OpenSettings -> navController.navigate("shell/settings")
                                is ShomaraHomeAction.OpenStation -> selectedStationId = action.stationId
                                // Home has no retry callback until a real identity/progress loader exists.
                                ShomaraHomeAction.Retry -> Unit
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                    )
                }
                composable(
                    route = ShomaraShellTab.Practice.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Practice.deepLink }),
                ) {
                    // Practice eligibility is a projection of this child's resolved local
                    // progress. Do not render every item as LOCKED while identity/progress is
                    // still loading: that would mislabel a returning child as a first-run learner.
                    if (!pathProgress.isResolved) {
                        // The shell Scaffold already applied the window insets, so this state
                        // surface must not add a second status/navigation padding.
                        ShomaraStateSurface(
                            state = ShomaraEntryState.Loading,
                            title = ShomaraPracticeHubStrings.PreparingTitle,
                            body = ShomaraPracticeHubStrings.PreparingBody,
                            applySystemInsets = false,
                        )
                    } else {
                        val practiceItems = remember(pathProgress) {
                            ShomaraPracticeCatalog.itemsFor(
                                completedStationIds = pathProgress.completedStationIds,
                                currentStationId = pathProgress.currentStationId,
                            )
                        }
                        val practiceRecent = remember(pathProgress) {
                            ShomaraPracticeCatalog.recentFor(pathProgress.completedStationIds)
                        }
                        ShomaraPracticeHubScreen(
                            items = practiceItems,
                            recent = practiceRecent,
                            // F-01: a practice tap opens the same station sheet as a path tap —
                            // the sheet is the one door into a lesson, never a direct navigation.
                            onItemTap = { selectedStationId = it },
                        )
                    }
                }
                composable(
                    route = ShomaraShellTab.Me.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Me.deepLink }),
                ) {
                    // ADR-0051: the avatar preset was removed, so the Me tab renders identity +
                    // real progress only. The settings store is still the source of the
                    // reduced-motion preference (read on the settings route below).
                    val facts = childName?.let {
                        com.mathlearning.feature.profile.ShomaraMeFacts(
                            childName = it,
                            completedStations = completedStations,
                            totalStations = com.mathlearning.core.model.ShomaraStationCatalog.STATION_COUNT,
                        )
                    }
                    ShomaraMeScreen(
                        facts = facts,
                        onOpenSettings = { navController.navigate("shell/settings") },
                    )
                }
                composable(route = "shell/settings") {
                    // N08-04 / family 15: the settings surface reads and writes the REAL
                    // DataStore-backed store. Previously the state lived only in `remember` and the
                    // screen announced "ذخیره شد." while nothing was persisted — a misleading
                    // success state that silently reset on process death.
                    //
                    // The screen's own state machine is authoritative (Clean -> Dirty -> Saving ->
                    // Saved/Error). An earlier version of this wiring bypassed it by rebuilding the
                    // state from the store snapshot and calling startSave(), which requires Dirty;
                    // an edit then threw "save started from an invalid state" and killed the app.
                    // The machine is now driven in order.
                    val persisted by settingsStore.state.collectAsStateWithLifecycle(
                        initialValue = ShomaraSettingsSnapshot.Defaults,
                    )
                    var screenState by remember {
                        mutableStateOf(
                            ShomaraSettingsState(
                                reducedMotion = persisted.reducedMotion,
                            ),
                        )
                    }
                    // SEEDING BUG, second half (found on device 2026-11-05): the seed-once
                    // guard that used to sit here consumed the PLACEHOLDER, not the first real
                    // emission. `collectAsStateWithLifecycle(initialValue = Defaults)` delivers
                    // Defaults synchronously at first composition, so this effect's first run
                    // always saw the default, set the flag, and the later real emission was
                    // ignored — re-entering Settings showed the default although the store held
                    // the child's saved choice and the save banner had said "ذخیره شد.". The
                    // screen is therefore re-seeded from the store on every emission WHILE IT IS
                    // STILL UNTOUCHED (see ShomaraSettingsState.reseededFrom): a Clean screen has
                    // no in-flight edit, so the store is the only truth; once the user edits, the
                    // screen state is authoritative and later emissions — including the echo of
                    // our own save — must not overwrite it. The `remember` seed above still
                    // starts from the placeholder, so the first frame may briefly show the
                    // default before the real emission lands; the settled value is the stored one.
                    LaunchedEffect(persisted) {
                        screenState = screenState.reseededFrom(
                            reducedMotion = persisted.reducedMotion,
                        )
                    }
                    val scope = rememberCoroutineScope()

                    // Persist the preference, driving the real state machine.
                    fun persist(reducedMotion: Boolean) {
                        if (!screenState.canSave) return // already Saving: ignore a second tap
                        val saving = screenState.startSave()
                        screenState = saving
                        scope.launch {
                            screenState = try {
                                settingsStore.save(
                                    ShomaraSettingsSnapshot(reducedMotion = reducedMotion),
                                )
                                saving.onSaveSuccess()
                            } catch (throwable: Throwable) {
                                // A real write failure is surfaced, never swallowed and never
                                // replaced by a success message.
                                saving.onSaveFailure(throwable.message ?: ShomaraSettingsStrings.SaveFailed)
                            }
                        }
                    }

                    ShomaraSettingsScreen(
                        state = screenState,
                        onReducedMotionChange = { enabled ->
                            screenState = screenState.withReducedMotion(enabled)
                            persist(screenState.reducedMotion)
                        },
                        onSave = {
                            // Retained for the screen contract: the value is already persisted on
                            // toggle, so this only acknowledges the last result.
                            if (screenState.save == ShomaraSettingsSaveState.Dirty) {
                                persist(screenState.reducedMotion)
                            }
                        },
                    )
                }
                // DT-46: the parent area, its gate and its PIN were removed by owner decision. The child
                // shell has no adult destination, so there is no route to protect and nothing to unlock.
            }
            // F-01: the station-start sheet — the one door into a lesson. The sheet owns its
            // own heading, so the bottom sheet renders with a null title (no doubled heading).
            // A locked station's CTA dismisses; only Ready/Resume navigate to the lesson, and
            // Replay navigates with the replay flag (R-08).
            val sheetStationId = selectedStationId
            if (sheetStationId != null && pathProgress.isResolved) {
                ShomaraBottomSheet(
                    title = null,
                    onDismiss = { selectedStationId = null },
                    content = {
                        ShomaraStationStartSheet(
                            stationId = sheetStationId,
                            progress = pathProgress,
                            onStart = {
                                selectedStationId = null
                                onStartStation(sheetStationId)
                            },
                            // R-08: the replay CTA enters the same lesson with the replay flag.
                            onReplay = {
                                selectedStationId = null
                                onReplayStation(sheetStationId)
                            },
                            onDismiss = { selectedStationId = null },
                        )
                    },
                )
            }
        }
    }
}
