package com.mathlearning.app.ui

import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.practice.ShomaraPracticeHubScreen
import com.mathlearning.feature.practice.ShomaraPracticeItem
import com.mathlearning.feature.profile.ShomaraMeFacts
import com.mathlearning.feature.profile.ShomaraMeScreen
import com.mathlearning.feature.settings.ShomaraSettingsScreen
import com.mathlearning.feature.settings.ShomaraSettingsState
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * Cross-screen accessibility contract (AGENTS §6): every clickable surface must carry a spoken
 * label and a touch target of at least 48dp, at every width the app supports.
 *
 * This is the mechanical sweep that was missing while each screen was reviewed by eye: it walks the
 * real semantics tree of each screen, so an unlabelled icon button or a 32dp row fails the build
 * instead of reaching a child. Rendering happens at 360dp x 640dp, the narrowest supported width.
 */
class ShomaraA11ySweepTest {

    @get:Rule
    val compose = createComposeRule()

    @Test
    fun settingsScreenExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraSettingsScreen(
                    state = ShomaraSettingsState(avatarId = "sun", reducedMotion = false),
                    onAvatarSelect = {},
                    onReducedMotionChange = {},
                    onSave = {},
                )
            }
        }
        assertA11yContract("Settings")
    }

    @Test
    fun meScreenExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraMeScreen(
                    facts = ShomaraMeFacts(
                        childName = "آریا",
                        avatar = ShomaraAvatarCatalog.option("sun"),
                        completedStations = 3,
                        totalStations = 25,
                    ),
                    onOpenParent = {},
                    onOpenSettings = {},
                )
            }
        }
        assertA11yContract("Me")
    }

    @Test
    fun practiceHubExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraPracticeHubScreen(
                    items = listOf(
                        ShomaraPracticeItem(id = "p1", title = "جمع تا ۱۰"),
                        ShomaraPracticeItem(id = "p2", title = "الگوها", locked = true, lockedReason = "بعد از ایستگاه ۳"),
                    ),
                    recent = listOf(ShomaraPracticeItem(id = "p3", title = "شمردن")),
                    onItemTap = {},
                )
            }
        }
        assertA11yContract("PracticeHub")
    }

    @Test
    fun parentGateExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraParentGateScreen(
                    gate = ShomaraParentGate(verifier = { it == "1234" }),
                    onAuthenticated = {},
                    onBack = {},
                )
            }
        }
        assertA11yContract("ParentGate")
    }

    /**
     * Walks every clickable node of the current screen and reports every violation at once, so a
     * failure names the screen, the label and the measured height instead of just a boolean.
     */
    private fun assertA11yContract(screen: String) {
        compose.waitForIdle()
        val minHeightPx = with(compose.density) { MinimumTouchTargetDp.dp.toPx() }
        val nodes = compose.onAllNodes(hasClickAction()).fetchSemanticsNodes()
        assertTrue("$screen: no clickable node rendered at all", nodes.isNotEmpty())
        val problems = nodes.mapNotNull { node ->
            val label = node.config.getOrNull(SemanticsProperties.ContentDescription)?.joinToString(" ")?.takeIf { it.isNotBlank() }
                ?: node.config.getOrNull(SemanticsProperties.Text)?.joinToString(" ") { it.text }?.takeIf { it.isNotBlank() }
                ?: node.config.getOrNull(SemanticsProperties.EditableText)?.text?.takeIf { it.isNotBlank() }
            when {
                label == null -> "$screen: clickable surface without a spoken label (id=${node.id})"
                node.size.height < minHeightPx -> "$screen: «$label» is ${node.size.height}px tall, below the 48dp floor"
                else -> null
            }
        }
        assertTrue(problems.joinToString(separator = "\n"), problems.isEmpty())
    }

    private companion object {
        const val MinimumTouchTargetDp = 48
    }
}
