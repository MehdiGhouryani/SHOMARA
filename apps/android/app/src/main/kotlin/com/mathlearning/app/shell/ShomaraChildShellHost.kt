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
import com.mathlearning.core.designsystem.shomaraBackHandler
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.parent.ShomaraParentHome
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.feature.path.ShomaraPathScreen
import com.mathlearning.feature.path.ShomaraStationStartSheet
import com.mathlearning.feature.practice.ShomaraPracticeCatalog
import com.mathlearning.feature.practice.ShomaraPracticeHubScreen
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
 * Tab content renders the real feature surfaces (N05-02..N05-06). Progress-aware parameters are
 * wired from server truth in N06; the path renders the caller-provided progress verbatim.
 */
@Composable
fun ShomaraChildShell(
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
    pathProgress: ShomaraPathProgress = ShomaraPathProgress(),
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
    var selectedStationId by rememberSaveable { mutableStateOf(initialStationId) }
    // R-05: a deep-linked station arrives after the first composition (the app sets the
    // pending id, then navigates here). The sheet opens for it exactly once; the pending
    // id is consumed so dismissing the sheet does not reopen it.
    LaunchedEffect(initialStationId) {
        if (initialStationId != null) {
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
    shomaraBackHandler(enabled = selectedStationId != null || backTarget != null) {
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
                tabs = ShomaraShellLogic.canonicalTabs().map { ShomaraTab(id = it.route, label = it.label) },
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
                    ShomaraPathScreen(progress = pathProgress, onStationTap = { selectedStationId = it })
                }
                composable(
                    route = ShomaraShellTab.Practice.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Practice.deepLink }),
                ) {
                    // N08 §4: this used to pass emptyList()/emptyList(), so the tab could ONLY ever
                    // render the empty state. The list now derives from the canonical 25-station
                    // catalog plus the child's real progress: reached stations are practiseable,
                    // unreached ones appear LOCKED with a warm reason (never fabricated practice).
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
                composable(
                    route = ShomaraShellTab.Me.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Me.deepLink }),
                ) {
                    // Stage 5 (global hardening): Me avatar now comes from the
                    // persisted settings store, not the catalog default. The
                    // store validates ids and falls back to the default on
                    // corrupt/unknown data, so resolve() here cannot throw
                    // for a stored value. Before this change every child
                    // always saw "sun" in Me, even after choosing "moon".
                    val persistedMe by settingsStore.state.collectAsStateWithLifecycle(
                        initialValue = ShomaraSettingsSnapshot.Defaults,
                    )
                    val facts = childName?.let {
                        com.mathlearning.feature.profile.ShomaraMeFacts(
                            childName = it,
                            avatar = com.mathlearning.feature.profile.ShomaraMeAvatarWiring.resolve(persistedMe.avatarId),
                            completedStations = completedStations,
                            totalStations = com.mathlearning.core.model.ShomaraStationCatalog.STATION_COUNT,
                        )
                    }
                    ShomaraMeScreen(
                        facts = facts,
                        onOpenParent = { navController.navigate("shell/parent") },
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
                    // tapping an avatar then threw "save started from an invalid state" and killed
                    // the app. The machine is now driven in order.
                    val persisted by settingsStore.state.collectAsStateWithLifecycle(
                        initialValue = ShomaraSettingsSnapshot.Defaults,
                    )
                    var screenState by remember {
                        mutableStateOf(
                            ShomaraSettingsState(
                                avatarId = persisted.avatarId,
                                reducedMotion = persisted.reducedMotion,
                            ),
                        )
                    }
                    // SEEDING BUG, second half (found on device 2026-11-05): the seed-once
                    // guard that used to sit here consumed the PLACEHOLDER, not the first real
                    // emission. `collectAsStateWithLifecycle(initialValue = Defaults)` delivers
                    // Defaults synchronously at first composition, so this effect's first run
                    // always saw "sun", set the flag, and the later real emission ("moon") was
                    // ignored — re-entering Settings showed "sun" although the store held
                    // "moon" and the save banner had said "ذخیره شد.". The screen is therefore
                    // re-seeded from the store on every emission WHILE IT IS STILL UNTOUCHED
                    // (see ShomaraSettingsState.reseededFrom): a Clean screen has no in-flight
                    // edit, so the store is the only truth; once the user edits, the screen
                    // state is authoritative and later emissions — including the echo of our
                    // own save — must not overwrite it. The `remember` seed above still starts
                    // from the placeholder, so the first frame may briefly show the default
                    // before the real emission lands; the settled value is the stored one.
                    LaunchedEffect(persisted) {
                        screenState = screenState.reseededFrom(
                            avatarId = persisted.avatarId,
                            reducedMotion = persisted.reducedMotion,
                        )
                    }
                    val scope = rememberCoroutineScope()

                    // Persist a chosen value, driving the real state machine.
                    fun persist(avatarId: String, reducedMotion: Boolean) {
                        if (!screenState.canSave) return // already Saving: ignore a second tap
                        val saving = screenState.startSave()
                        screenState = saving
                        scope.launch {
                            screenState = try {
                                settingsStore.save(
                                    ShomaraSettingsSnapshot(avatarId = avatarId, reducedMotion = reducedMotion),
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
                        onAvatarSelect = { avatarId ->
                            // withAvatar marks Dirty (or returns unchanged if it is the same id).
                            screenState = screenState.withAvatar(avatarId)
                            persist(screenState.avatarId, screenState.reducedMotion)
                        },
                        onReducedMotionChange = { enabled ->
                            screenState = screenState.withReducedMotion(enabled)
                            persist(screenState.avatarId, screenState.reducedMotion)
                        },
                        onSave = {
                            // Retained for the screen contract: values are already persisted on
                            // selection, so this only acknowledges the last result.
                            if (screenState.save == ShomaraSettingsSaveState.Dirty) {
                                persist(screenState.avatarId, screenState.reducedMotion)
                            }
                        },
                    )
                }
                composable(route = "shell/parent") {
                    val gate = remember { ShomaraParentGate(verifier = null) } // fail-closed until the owner wires credentials
                    var authenticated by rememberSaveable { mutableStateOf(false) }
                    if (authenticated) {
                        ShomaraParentHome(completedStations = completedStations, totalStations = com.mathlearning.core.model.ShomaraStationCatalog.STATION_COUNT, onSignOut = onSignOut)
                    } else {
                        ShomaraParentGateScreen(
                            gate = gate,
                            onAuthenticated = { authenticated = true },
                            // F-03b: the gate clock is the real clock (the screen's default is
                            // already real; the shell states it explicitly so the wiring is visible).
                            nowMs = { System.currentTimeMillis() },
                            // F-23: an on-screen way back to the child shell.
                            onBack = { navController.popBackStack() },
                        )
                    }
                }
            }
            // F-01: the station-start sheet — the one door into a lesson. The sheet owns its
            // own heading, so the bottom sheet renders with a null title (no doubled heading).
            // A locked station's CTA dismisses; only Ready/Resume navigate to the lesson, and
            // Replay navigates with the replay flag (R-08).
            val sheetStationId = selectedStationId
            if (sheetStationId != null) {
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
