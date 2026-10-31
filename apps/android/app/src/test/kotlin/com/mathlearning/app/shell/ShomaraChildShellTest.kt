package com.mathlearning.app.shell

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ShomaraChildShellTest {
    @Test
    fun `shell keeps exactly the canonical three tabs in order`() {
        assertEquals(listOf("مسیر", "تمرین", "من"), ShomaraShellLogic.canonicalTabs().map { it.label })
        assertEquals(listOf("shell/path", "shell/practice", "shell/me"), ShomaraShellLogic.canonicalTabs().map { it.route })
    }

    @Test
    fun `re-selecting the active tab is a no-op`() {
        assertEquals(ShomaraShellTab.Path, ShomaraShellLogic.select(ShomaraShellTab.Path, ShomaraShellTab.Path))
        assertEquals(ShomaraShellTab.Practice, ShomaraShellLogic.select(ShomaraShellTab.Path, ShomaraShellTab.Practice))
    }

    @Test
    fun `back is deterministic - non-default returns to path, default exits`() {
        assertEquals(ShomaraShellTab.Path, ShomaraShellLogic.backTarget(ShomaraShellTab.Practice))
        assertEquals(ShomaraShellTab.Path, ShomaraShellLogic.backTarget(ShomaraShellTab.Me))
        assertNull(ShomaraShellLogic.backTarget(ShomaraShellTab.Path))
    }

    @Test
    fun `routes and deep links round-trip`() {
        for (tab in ShomaraShellLogic.canonicalTabs()) {
            assertEquals(tab, ShomaraShellTab.fromRoute(tab.route))
            assertEquals(tab, ShomaraShellTab.fromDeepLink(tab.deepLink))
        }
        assertEquals(ShomaraShellTab.Default, ShomaraShellTab.fromRoute("shell/unknown"))
        assertNull(ShomaraShellTab.fromDeepLink("mathlearning://elsewhere"))
    }
}
