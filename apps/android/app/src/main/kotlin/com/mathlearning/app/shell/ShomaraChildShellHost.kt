package com.mathlearning.app.shell

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.core.designsystem.ShomaraTabBar
import com.mathlearning.feature.path.ShomaraPathScreen
import com.mathlearning.feature.practice.ShomaraPracticeScreen
import com.mathlearning.feature.profile.ShomaraMeScreen
import com.mathlearning.core.designsystem.ShomaraTab

/**
 * Child shell host (N05-01 / family 17): three fixed tabs with REAL per-tab state retention
 * (each tab keeps its own back-stack entry with saveState/restoreState, so switching tabs and
 * returning never loses scroll or selection). Back is deterministic via [ShomaraShellLogic].
 */
@Composable
fun ShomaraChildShell(
    onOpenParent: () -> Unit,
    modifier: Modifier = Modifier,
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
                for (tab in ShomaraShellLogic.canonicalTabs()) {
                    composable(
                        route = tab.route,
                        deepLinks = listOf(navDeepLink { uriPattern = tab.deepLink }),
                    ) {
                        when (tab) {
                            ShomaraShellTab.Path -> ShomaraPathScreen()
                            ShomaraShellTab.Practice -> ShomaraPracticeScreen()
                            ShomaraShellTab.Me -> ShomaraMeScreen(onOpenParent = onOpenParent)
                        }
                    }
                }
            }
        }
    }
}
