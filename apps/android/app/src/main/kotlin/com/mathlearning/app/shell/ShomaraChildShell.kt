package com.mathlearning.app.shell

import com.mathlearning.core.designsystem.ShomaraChildTabs

/** The three canonical child tabs (START_HERE §7) — enforced against the design-system contract. */
enum class ShomaraShellTab(val route: String, val label: String, val deepLink: String) {
    Path(route = "shell/path", label = ShomaraChildTabs.Path, deepLink = "mathlearning://shell/path"),
    Practice(route = "shell/practice", label = ShomaraChildTabs.Practice, deepLink = "mathlearning://shell/practice"),
    Me(route = "shell/me", label = ShomaraChildTabs.Me, deepLink = "mathlearning://shell/me"),
    ;

    companion object {
        val Default: ShomaraShellTab = Path

        fun fromRoute(route: String?): ShomaraShellTab =
            entries.firstOrNull { it.route == route } ?: Default

        fun fromDeepLink(link: String?): ShomaraShellTab? =
            entries.firstOrNull { it.deepLink == link }
    }
}

/**
 * Pure shell logic (family 17): re-selecting the active tab is a no-op (duplicate navigation
 * guard), only the three canonical tabs exist, and system Back is deterministic — Back on a
 * non-default tab returns to the default tab, Back on the default tab exits the app.
 */
object ShomaraShellLogic {
    fun select(current: ShomaraShellTab, tapped: ShomaraShellTab): ShomaraShellTab =
        if (tapped == current) current else tapped

    fun backTarget(current: ShomaraShellTab): ShomaraShellTab? =
        if (current == ShomaraShellTab.Default) null else ShomaraShellTab.Default

    /** Tab-bar model must always be exactly the canonical three, in canonical order. */
    fun canonicalTabs(): List<ShomaraShellTab> = ShomaraShellTab.entries.toList()

    init {
        check(canonicalTabs().map { it.label } == ShomaraChildTabs.All) {
            "shell tabs diverged from the canonical three-tab contract"
        }
    }
}
