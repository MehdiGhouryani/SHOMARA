package com.mathlearning.app.navigation

import org.junit.Assert.assertEquals
import org.junit.Test

class NavigationSnapshotTest {
    @Test
    fun `restores a known destination`() {
        val saved = NavigationSnapshot(AppDestination.FOUNDATION).save()

        assertEquals(AppDestination.FOUNDATION, NavigationSnapshot.restore(saved).destination)
    }

    @Test
    fun `falls back safely when saved route is unknown`() {
        assertEquals(AppDestination.FOUNDATION, NavigationSnapshot.restore("removed-route").destination)
    }

    @Test
    fun `onboarding destination survives process death restore`() {
        val saved = NavigationSnapshot(AppDestination.ONBOARDING).save()
        assertEquals(AppDestination.ONBOARDING, NavigationSnapshot.restore(saved).destination)
    }
}
