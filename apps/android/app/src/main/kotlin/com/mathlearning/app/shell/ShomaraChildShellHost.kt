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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.core.designsystem.ShomaraTab
import com.mathlearning.core.designsystem.ShomaraTabBar
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.parent.ShomaraParentHome
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.feature.path.ShomaraPathScreen
import com.mathlearning.feature.practice.ShomaraPracticeHubScreen
import com.mathlearning.feature.profile.ShomaraMeScreen
import com.mathlearning.feature.settings.ShomaraSettingsScreen
import com.mathlearning.feature.settings.ShomaraSettingsState

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
    onPathStationTap: (String) -> Unit = {},
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
                    ShomaraPathScreen(progress = pathProgress, onStationTap = onPathStationTap)
                }
                composable(
                    route = ShomaraShellTab.Practice.route,
                    deepLinks = listOf(navDeepLink { uriPattern = ShomaraShellTab.Practice.deepLink }),
                ) {
                    ShomaraPracticeHubScreen(items = emptyList(), recent = emptyList())
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
                    var settingsState by remember { mutableStateOf(ShomaraSettingsState(avatarId = "sun", reducedMotion = reducedMotion)) }
                    ShomaraSettingsScreen(
                        state = settingsState,
                        onAvatarSelect = { settingsState = settingsState.withAvatar(it) },
                        onReducedMotionChange = { settingsState = settingsState.withReducedMotion(it) },
                        onSave = { settingsState = settingsState.startSave().onSaveSuccess() },
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
