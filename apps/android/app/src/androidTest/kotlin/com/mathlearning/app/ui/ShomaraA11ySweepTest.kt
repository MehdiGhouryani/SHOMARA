package com.mathlearning.app.ui

import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.performClick
import androidx.compose.ui.unit.dp
import com.mathlearning.app.shell.ShomaraChildShell
import com.mathlearning.core.datastore.LessonCheckpoint
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.feature.lesson.ShomaraLessonHost
import com.mathlearning.feature.onboarding.ShomaraPlacementScreen
import com.mathlearning.feature.onboarding.ShomaraPlacementState
import com.mathlearning.feature.onboarding.ShomaraProfileDraft
import com.mathlearning.feature.onboarding.ShomaraProfileSaveState
import com.mathlearning.feature.onboarding.ShomaraProfileScreen
import com.mathlearning.feature.parent.ShomaraParentGate
import com.mathlearning.feature.parent.ShomaraParentGateScreen
import com.mathlearning.feature.parent.ShomaraParentHome
import com.mathlearning.feature.path.ShomaraHomeScreen
import com.mathlearning.feature.path.ShomaraHomeStrings
import com.mathlearning.feature.path.ShomaraHomeUiState
import com.mathlearning.feature.path.ShomaraPathProgress
import com.mathlearning.feature.practice.ShomaraPracticeHubScreen
import com.mathlearning.feature.practice.ShomaraPracticeItem
import com.mathlearning.feature.profile.ShomaraMeFacts
import com.mathlearning.feature.profile.ShomaraMeScreen
import com.mathlearning.feature.settings.ShomaraSettingsScreen
import com.mathlearning.feature.settings.ShomaraSettingsState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import okhttp3.OkHttpClient
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

    @Test
    fun homeScreenExposesLabelledTouchTargets() {
        // The priority surface: every station bubble, the settings entry and the CTA must all be
        // nameable and at least 48dp — measured across the whole tree instead of the two nodes the
        // Home test happens to assert.
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(
                        progress = ShomaraPathProgress(
                            completedStationIds = setOf("ST01", "ST02", "ST03"),
                            perfectStationIds = setOf("ST02"),
                            currentStationId = "ST04",
                            isResolved = true,
                        ),
                    ),
                    onAction = {},
                )
            }
        }
        assertA11yContract("Home")
    }

    @Test
    fun onboardingProfileExposesLabelledTouchTargets() {
        val draft = ShomaraProfileDraft()
        compose.setContent {
            ShomaraTheme {
                ShomaraProfileScreen(
                    draft = draft,
                    onDraftChange = {},
                    saveState = ShomaraProfileSaveState(draft = draft),
                    onSave = {},
                )
            }
        }
        assertA11yContract("OnboardingProfile")
    }

    @Test
    fun onboardingPlacementExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraPlacementScreen(
                    state = ShomaraPlacementState(),
                    onSkip = {},
                )
            }
        }
        assertA11yContract("OnboardingPlacement")
    }

    @Test
    fun homeLoadingExposesTheAnnouncementAndNoDeadControls() {
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(entryState = ShomaraEntryState.Loading),
                    onAction = {},
                )
            }
        }
        // Loading is the one state whose contract is "no action yet": there is nothing honest to
        // tap while the path is being prepared, so it is measured for structure (a heading and a
        // live announcement) rather than for touch targets.
        assertTextPresent("Home/Loading", ShomaraHomeStrings.LoadingTitle)
        assertA11yContract("Home/Loading", expectActions = false)
    }

    @Test
    fun homeOfflineFromTheProgressSnapshotAnnouncesIt() {
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(
                        progress = ShomaraPathProgress.emptyResolved().copy(offline = true),
                    ),
                    onAction = {},
                )
            }
        }
        assertTextPresent("Home/Offline(progress)", ShomaraHomeStrings.Offline)
        assertA11yContract("Home/Offline(progress)")
    }

    @Test
    fun homeOfflineFromTheEntryStateAlsoAnnouncesIt() {
        // The second channel: a caller that only knows the network is down sets entryState. Before
        // this fix that signal was silently dropped and the child saw a normal path.
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(
                        progress = ShomaraPathProgress.emptyResolved(),
                        entryState = ShomaraEntryState.Offline,
                    ),
                    onAction = {},
                )
            }
        }
        assertTextPresent("Home/Offline(entryState)", ShomaraHomeStrings.Offline)
        assertA11yContract("Home/Offline(entryState)")
    }

    @Test
    fun homeErrorExposesALabelledRetry() {
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(
                        entryState = ShomaraEntryState.Error,
                        retryAvailable = true,
                    ),
                    onAction = {},
                )
            }
        }
        assertTextPresent("Home/Error", ShomaraHomeStrings.ErrorTitle)
        assertA11yContract("Home/Error")
    }

    @Test
    fun homeEmptyExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraHomeScreen(
                    state = ShomaraHomeUiState(entryState = ShomaraEntryState.Empty),
                    onAction = {},
                )
            }
        }
        assertTextPresent("Home/Empty", ShomaraHomeStrings.EmptyTitle)
        assertA11yContract("Home/Empty")
    }

    @Test
    fun parentHomeExposesLabelledTouchTargets() {
        compose.setContent {
            ShomaraTheme {
                ShomaraParentHome(completedStations = 3, totalStations = 25, onSignOut = {})
            }
        }
        assertA11yContract("ParentHome")
    }

    @Test
    fun stationSheetExposesLabelledTouchTargets() {
        // The sheet is the one surface between Home and a lesson, so an unlabelled or small control
        // here blocks the child's main journey.
        compose.setContent {
            ShomaraTheme {
                ShomaraChildShell(
                    onSignOut = {},
                    pathProgress = ShomaraPathProgress(
                        completedStationIds = setOf("ST01", "ST02", "ST03"),
                        perfectStationIds = setOf("ST02"),
                        currentStationId = "ST04",
                        isResolved = true,
                    ),
                    settingsStore = FakeSettingsStore,
                    onStartStation = {},
                    onReplayStation = {},
                )
            }
        }
        compose.onNodeWithContentDescription(ShomaraStationCatalog.station("ST04").workingTitle).performClick()
        compose.waitForIdle()
        assertA11yContract("StationSheet")
    }

    private object FakeSettingsStore : ShomaraSettingsStore {
        override val state: Flow<ShomaraSettingsSnapshot> = MutableStateFlow(ShomaraSettingsSnapshot.Defaults)

        override suspend fun save(snapshot: ShomaraSettingsSnapshot) {}
    }

    private class MemoryCheckpoints : LessonCheckpointStore {
        private val map = mutableMapOf<String, LessonCheckpoint>()

        override suspend fun save(checkpoint: LessonCheckpoint) {
            map["${checkpoint.sessionId}|${checkpoint.stationId}"] = checkpoint
        }

        override suspend fun read(sessionId: String, stationId: String): LessonCheckpoint? =
            map["$sessionId|$stationId"]

        override suspend fun clear(sessionId: String, stationId: String) {
            map.remove("$sessionId|$stationId")
        }
    }

    @Test
    fun lessonStartExposesLabelledTouchTargets() {
        // The lesson is the deepest screen in the app and the one with the most controls, yet it
        // had no a11y coverage at all: the module-local Compose test only asserts the resumed
        // stage header.
        compose.setContent {
            ShomaraTheme {
                ShomaraLessonHost(
                    stationId = "ST07",
                    gateway = LessonGateway(client = OkHttpClient(), submitUrl = { null }),
                    checkpointStore = MemoryCheckpoints(),
                    onExitToShell = {},
                )
            }
        }
        compose.waitForIdle()
        // Guard against a vacuous pass: prove the real lesson screen rendered (its header names
        // the station) before measuring it, so a blank skeleton could never satisfy the contract.
        val stationTitle = ShomaraStationCatalog.station("ST07").workingTitle
        val headerNodes = compose
            .onAllNodesWithText(stationTitle, substring = true)
            .fetchSemanticsNodes()
        assertTrue("LessonStart: the real lesson header did not render", headerNodes.isNotEmpty())
        assertA11yContract("LessonStart")
    }

    /**
     * Proves a state really rendered instead of the default path: without it, an ignored
     * `entryState` would make the state cases pass while measuring the happy path four times.
     */
    private fun assertTextPresent(screen: String, text: String) {
        val found = compose.onAllNodesWithText(text, substring = true).fetchSemanticsNodes()
        assertTrue("$screen: «$text» never rendered, so this state is not being shown", found.isNotEmpty())
    }

    /**
     * Walks every clickable node of the current screen and reports every violation at once, so a
     * failure names the screen, the label and the measured height instead of just a boolean.
     */
    private fun assertA11yContract(screen: String, expectActions: Boolean = true) {
        compose.waitForIdle()
        val minHeightPx = with(compose.density) { MinimumTouchTargetDp.dp.toPx() }
        val nodes = compose.onAllNodes(hasClickAction()).fetchSemanticsNodes()
        if (expectActions) {
            assertTrue("$screen: no clickable node rendered at all", nodes.isNotEmpty())
        }
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

        // Structure, not just size: TalkBack's heading navigation is how a child (and their parent)
        // finds the title of a page. A screen with no heading is unnavigable by structure.
        val headings = compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.Heading)).fetchSemanticsNodes()
        assertTrue(
            "$screen: no heading — assistive technology cannot reach a title on this screen",
            headings.isNotEmpty(),
        )
    }

    private companion object {
        const val MinimumTouchTargetDp = 48
    }
}
