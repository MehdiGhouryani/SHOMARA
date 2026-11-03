package com.mathlearning.app.shell

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
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
import com.mathlearning.core.designsystem.ShomaraTab
import com.mathlearning.core.designsystem.ShomaraTabBar
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.parent.ShomaraParentHome
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.feature.path.ShomaraPathScreen
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
) {
    val navController = rememberNavController()
    var currentTab by rememberSaveable { mutableStateOf(ShomaraShellTab.Default) }
    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            ShomaraTabBar(
                tabs = ShomaraShellLogic.canonicalTabs().map { ShomaraTab(id = it.route, label = it.label) },
                selectedId = currentTab.route,
                onSelected = { route ->
                    val tapped = ShomaraShellTab.fromRoute(route)
                    val target = ShomaraShellLogic.select(currentTab, tapped)
                    if (target != currentTab) {
                        currentTab = target
                        navController.navigate(target.route) {
                            popUpTo(ShomaraShellTab.Default.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
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
                    ShomaraPathScreen(progress = pathProgress, onStationTap = onStartStation)
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
                        onItemTap = onStartStation,
                    )
                }
                composable(
                    route = ShomaraShellTab.Me.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Me.deepLink }),
                ) {
                    val facts = childName?.let {
                        com.mathlearning.feature.profile.ShomaraMeFacts(
                            childName = it,
                            avatar = com.mathlearning.core.model.ShomaraAvatarCatalog.defaultId.let { id -> com.mathlearning.core.model.ShomaraAvatarCatalog.option(id) },
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
                    // N08-04 / family 15: the settings surface now reads and writes the REAL
                    // DataStore-backed store. Previously the state lived only in `remember` and the
                    // screen announced "ذخیره شد." while nothing was persisted — a misleading
                    // success state that silently reset on process death.
                    val settingsState by settingsStore.state.collectAsStateWithLifecycle(
                        initialValue = ShomaraSettingsSnapshot.Defaults,
                    )
                    var saveState by remember { mutableStateOf(ShomaraSettingsSaveState.Clean) }
                    var errorText by remember { mutableStateOf<String?>(null) }
                    val scope = rememberCoroutineScope()
                    val screenState = ShomaraSettingsState(
                        avatarId = settingsState.avatarId,
                        reducedMotion = settingsState.reducedMotion,
                    ).let { base ->
                        when (saveState) {
                            ShomaraSettingsSaveState.Saving -> base.startSave().copy(save = ShomaraSettingsSaveState.Saving)
                            ShomaraSettingsSaveState.Saved -> base.copy(save = ShomaraSettingsSaveState.Saved)
                            ShomaraSettingsSaveState.Error -> base.copy(save = ShomaraSettingsSaveState.Error, errorText = errorText)
                            else -> base.copy(save = ShomaraSettingsSaveState.Clean)
                        }
                    }
                    ShomaraSettingsScreen(
                        state = screenState,
                        onAvatarSelect = { avatarId ->
                            scope.launch {
                                saveState = ShomaraSettingsSaveState.Saving
                                errorText = null
                                saveState = try {
                                    settingsStore.save(ShomaraSettingsSnapshot(avatarId = avatarId, reducedMotion = screenState.reducedMotion))
                                    ShomaraSettingsSaveState.Saved
                                } catch (throwable: Throwable) {
                                    // A real write failure is surfaced, never silently swallowed and
                                    // never replaced by a success message.
                                    errorText = throwable.message ?: ShomaraSettingsStrings.SaveFailed
                                    ShomaraSettingsSaveState.Error
                                }
                            }
                        },
                        onReducedMotionChange = { enabled ->
                            scope.launch {
                                saveState = ShomaraSettingsSaveState.Saving
                                errorText = null
                                saveState = try {
                                    settingsStore.save(ShomaraSettingsSnapshot(avatarId = screenState.avatarId, reducedMotion = enabled))
                                    ShomaraSettingsSaveState.Saved
                                } catch (throwable: Throwable) {
                                    errorText = throwable.message ?: ShomaraSettingsStrings.SaveFailed
                                    ShomaraSettingsSaveState.Error
                                }
                            }
                        },
                        onSave = { saveState = ShomaraSettingsSaveState.Saved },
                    )
                }
                composable(route = "shell/parent") {
                    val gate = remember { ShomaraParentGate(verifier = null) } // fail-closed until the owner wires credentials
                    var authenticated by rememberSaveable { mutableStateOf(false) }
                    if (authenticated) {
                        ShomaraParentHome(completedStations = completedStations, totalStations = com.mathlearning.core.model.ShomaraStationCatalog.STATION_COUNT, onSignOut = onSignOut)
                    } else {
                        ShomaraParentGateScreen(gate = gate, onAuthenticated = { authenticated = true })
                    }
                }
            }
        }
    }
}
