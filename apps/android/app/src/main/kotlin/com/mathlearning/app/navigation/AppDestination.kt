package com.mathlearning.app.navigation

enum class AppDestination(val route: String, val deepLink: String) {
    /**
     * Root launch gate (N08-15). This is the real start destination: it resolves
     * `ShomaraLaunchState` (splash while `Resolving`, recovery on offline/error) and only then
     * hands over to the onboarding gate or the authenticated child shell.
     *
     * It corresponds to ROUTE_REGISTRY's root/session/loading/error row (`_layout` →
     * `RootRoute` / app state coordinator, page contract 01).
     */
    LAUNCH(route = "launch", deepLink = "mathlearning://launch"),
    ONBOARDING(route = "onboarding", deepLink = "mathlearning://onboarding"),
    SHELL(route = "shell", deepLink = "mathlearning://shell"),
    LESSON(route = "lesson/{stationId}", deepLink = "mathlearning://lesson/{stationId}"),
    FOUNDATION(route = "foundation", deepLink = "mathlearning://foundation"),
    ;

    companion object {
        fun restore(route: String?): AppDestination =
            entries.firstOrNull { it.route == route } ?: FOUNDATION
    }
}

data class NavigationSnapshot(val destination: AppDestination) {
    fun save(): String = destination.route

    companion object {
        fun restore(value: String?): NavigationSnapshot = NavigationSnapshot(AppDestination.restore(value))
    }
}