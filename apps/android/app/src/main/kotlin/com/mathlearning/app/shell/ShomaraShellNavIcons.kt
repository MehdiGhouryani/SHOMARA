package com.mathlearning.app.shell

import com.mathlearning.core.designsystem.R

/**
 * DT-76 (handoff C13): the canonical mapping from each child shell destination to its v3 nav icon
 * pair. A single explicit table — not a naming convention derived at runtime — so a missing icon is
 * a compile-time crash, not a silently text-only tab.
 */
object ShomaraShellNavIcons {
    fun activeFor(tab: ShomaraShellTab): Int = when (tab) {
        ShomaraShellTab.Path -> R.drawable.shomara_nav_path_active
        ShomaraShellTab.Practice -> R.drawable.shomara_nav_practice_active
        ShomaraShellTab.Me -> R.drawable.shomara_nav_me_active
    }

    fun inactiveFor(tab: ShomaraShellTab): Int = when (tab) {
        ShomaraShellTab.Path -> R.drawable.shomara_nav_path_inactive
        ShomaraShellTab.Practice -> R.drawable.shomara_nav_practice_inactive
        ShomaraShellTab.Me -> R.drawable.shomara_nav_me_inactive
    }
}
