package com.mathlearning.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.mathlearning.app.ui.FoundationScreen

@Composable
fun ShomaraApp() {
    val navController = rememberNavController()
    NavHost(
        navController = navController,
        startDestination = AppDestination.FOUNDATION.route,
    ) {
        composable(
            route = AppDestination.FOUNDATION.route,
            deepLinks = listOf(navDeepLink { uriPattern = AppDestination.FOUNDATION.deepLink }),
        ) {
            FoundationScreen()
        }
    }
}
