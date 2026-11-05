// SPDX-License-Identifier: Apache-2.0
package com.mathlearning.app.navigation

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * R-05 — the lesson host is only rendered after a real station-start sheet tap (or a
 * replay from that sheet). A deep link into a lesson never renders the lesson directly:
 * it parks the station id and the shell opens the station-start sheet for it, so the
 * child always passes the entry point that the path had already locked.
 */
class ShomaraLessonEntryRoutingTest {

    @Test
    fun `a sheet entry renders the lesson directly`() {
        assertTrue(ShomaraLessonEntryRouting.rendersLessonDirectly(enteredViaSheet = true))
    }

    @Test
    fun `a direct deep link never renders the lesson - it must route through the shell sheet`() {
        assertFalse(ShomaraLessonEntryRouting.rendersLessonDirectly(enteredViaSheet = false))
    }
}
