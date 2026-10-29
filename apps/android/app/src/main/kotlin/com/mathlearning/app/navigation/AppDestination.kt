package com.mathlearning.app.navigation

enum class AppDestination(val route: String, val deepLink: String) {
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
