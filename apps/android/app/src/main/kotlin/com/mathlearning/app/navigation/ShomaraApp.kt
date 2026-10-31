package com.mathlearning.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.app.ui.FoundationScreen
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.feature.onboarding.ShomaraOnboardingHost

/**
 * Launch migration (N04-07): the app starts at the onboarding flow; the foundation placeholder
 * stays reachable as the post-auth destination. Step changes inside the host are mirrored to
 * real navigation routes so Back/process death behave like navigation, not like hidden state.
 */
@Composable
fun ShomaraApp(
    authSession: com.mathlearning.feature.onboarding.ShomaraAuthSession,
    profileDraftStore: com.mathlearning.core.datastore.ShomaraProfileDraftStore,
) {
    val navController = rememberNavController()
    ShomaraTheme {
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
                        // Keep the nav back stack aligned with the logical onboarding step.
                        if (navController.currentDestination?.route != stepRoute) {
                            navController.navigate(stepRoute) { launchSingleTop = true }
                        }
                    },
                    onAuthenticated = {
                        navController.navigate(AppDestination.FOUNDATION.route) { popUpTo(AppDestination.ONBOARDING.route) { inclusive = true } }
                    },
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
}
