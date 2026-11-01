package com.mathlearning.feature.profile

import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraAvatarOption
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/** N05-05 Me-tab facts/state tests (family 14): real facts only, no synthetic badges. */
class ShomaraMeTest {

    private val avatar: ShomaraAvatarOption = ShomaraAvatarCatalog.option("sun")

    @Test
    fun `state mapping covers the matrix with facts gating readiness`() {
        assertEquals(ShomaraMeState.Loading, ShomaraMeLogic.stateFor(offline = false, errorText = null, loading = true, hasFacts = false))
        assertEquals(ShomaraMeState.Ready, ShomaraMeLogic.stateFor(offline = false, errorText = null, loading = false, hasFacts = true))
        assertEquals(ShomaraMeState.Empty, ShomaraMeLogic.stateFor(offline = false, errorText = null, loading = false, hasFacts = false))
        assertEquals(ShomaraMeState.Offline, ShomaraMeLogic.stateFor(offline = true, errorText = null, loading = false, hasFacts = true))
        assertEquals(ShomaraMeState.Error, ShomaraMeLogic.stateFor(offline = false, errorText = "x", loading = false, hasFacts = true))
    }

    @Test
    fun `facts render real progress verbatim in Persian digits`() {
        val facts = ShomaraMeFacts("آریا", avatar, completedStations = 3, totalStations = 25)
        assertEquals("۳ از ۲۵ ایستگاه کامل شده", facts.progressLine())
    }

    @Test
    fun `facts bounds and name are enforced`() {
        assertThrows(IllegalArgumentException::class.java) {
            ShomaraMeFacts("آریا", avatar, completedStations = 26, totalStations = 25)
        }
        assertThrows(IllegalArgumentException::class.java) {
            ShomaraMeFacts(" ", avatar, completedStations = 0, totalStations = 25)
        }
    }

    @Test
    fun `no synthetic reward surfaces exist in the Me contract`() {
        // The facts model exposes ONLY identity + real progress: no stars, coins, streaks, badges.
        val facts = ShomaraMeFacts("آریا", avatar, 3, 25)
        val declared = facts.javaClass.declaredFields.map { it.name }
        for (banned in listOf("star", "coin", "streak", "badge", "leaderboard")) {
            assertFalse(declared.any { it.lowercase().contains(banned) })
        }
    }
}
