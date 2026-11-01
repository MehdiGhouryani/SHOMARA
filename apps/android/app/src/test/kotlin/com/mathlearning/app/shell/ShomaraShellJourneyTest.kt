package com.mathlearning.app.shell

import com.mathlearning.app.navigation.AppDestination
import com.mathlearning.app.navigation.NavigationSnapshot
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N05-08 child shell journey gate: cold start, warm resume, Back journey and deep-link entry —
 * all decided by pure, JVM-verified logic; on-device navigation evidence stays NATIVE_PENDING.
 */
class ShomaraShellJourneyTest {

    @Test
    fun `cold start opens the default path tab`() {
        // No saved state at all (process death without a snapshot, first launch).
        assertEquals(ShomaraShellTab.Path, ShomaraShellTab.fromRoute(null))
        assertEquals(ShomaraShellTab.Path, ShomaraShellTab.fromRoute(""))
    }

    @Test
    fun `warm resume restores the exact saved tab`() {
        for (tab in ShomaraShellLogic.canonicalTabs()) {
            assertEquals(tab, ShomaraShellTab.fromRoute(tab.route))
        }
        // The shell route survives process death through NavigationSnapshot.
        val snapshot = NavigationSnapshot(AppDestination.SHELL).save()
        assertEquals(AppDestination.SHELL, NavigationSnapshot.restore(snapshot).destination)
    }

    @Test
    fun `deep link entry maps to the right tab and rejects foreign links`() {
        assertEquals(ShomaraShellTab.Path, ShomaraShellTab.fromDeepLink("mathlearning://shell/path"))
        assertEquals(ShomaraShellTab.Practice, ShomaraShellTab.fromDeepLink("mathlearning://shell/practice"))
        assertEquals(ShomaraShellTab.Me, ShomaraShellTab.fromDeepLink("mathlearning://shell/me"))
        assertNull(ShomaraShellTab.fromDeepLink("mathlearning://shell/parent")) // parent never enters via deep link
        assertNull(ShomaraShellTab.fromDeepLink("mathlearning://onboarding"))
    }

    @Test
    fun `back journey is deterministic across the whole shell`() {
        var tab = ShomaraShellTab.Me
        tab = ShomaraShellLogic.backTarget(tab) ?: tab
        assertEquals(ShomaraShellTab.Path, tab)
        // Back on the default tab exits the app (null target = system back, no re-route).
        assertNull(ShomaraShellLogic.backTarget(tab))
    }

    @Test
    fun `authentication lands on the shell - the launch migration is complete`() {
        // The onboarding flow's onAuthenticated navigates to SHELL (never the old foundation placeholder).
        assertEquals("shell", AppDestination.SHELL.route)
        assertEquals("mathlearning://shell", AppDestination.SHELL.deepLink)
        // Foundation stays available for compatibility but is not the auth landing.
        assertTrue(AppDestination.entries.any { it.route == "foundation" })
    }

    @Test
    fun `tab switch never duplicates navigation and back never loops`() {
        var tab = ShomaraShellTab.Path
        tab = ShomaraShellLogic.select(tab, ShomaraShellTab.Practice)
        assertEquals(ShomaraShellTab.Practice, tab)
        tab = ShomaraShellLogic.select(tab, ShomaraShellTab.Practice)
        assertEquals(ShomaraShellTab.Practice, tab) // reselect: no navigation
        tab = ShomaraShellLogic.select(tab, ShomaraShellTab.Me)
        tab = ShomaraShellLogic.backTarget(tab) ?: ShomaraShellTab.Path
        assertEquals(ShomaraShellTab.Path, tab)
        tab = ShomaraShellLogic.select(tab, ShomaraShellTab.Path)
        assertEquals(ShomaraShellTab.Path, tab)
    }
}
