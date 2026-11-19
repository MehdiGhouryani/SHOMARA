package com.mathlearning.app.ui

import android.graphics.Bitmap
import android.util.Log
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsNode
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.DeviceConfigurationOverride
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.FontScale
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.captureToImage
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollToNode
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.dp
import androidx.test.platform.app.InstrumentationRegistry
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta
import com.mathlearning.feature.path.ShomaraHomeAction
import com.mathlearning.feature.path.ShomaraHomeScreen
import com.mathlearning.feature.path.ShomaraHomeStrings
import com.mathlearning.feature.path.ShomaraHomeUiState
import com.mathlearning.feature.path.ShomaraPathNodeState
import com.mathlearning.feature.path.ShomaraPathGraphLogic
import com.mathlearning.feature.path.ShomaraPathProgress
import java.io.File
import java.io.FileOutputStream
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/** Instrumented rendering, semantics and PNG evidence for the real stateless Home composable. */
class ShomaraHomeScreenTest {

    @get:Rule
    val compose = createComposeRule()

    private val currentProgress = ShomaraPathProgress(
        completedStationIds = setOf("ST01", "ST02", "ST03"),
        perfectStationIds = setOf("ST02"),
        currentStationId = "ST04",
        isResolved = true,
    )

    @Test
    fun homeRendersWithoutClippingAt360390412AndTwoHundredPercent() {
        val width = mutableStateOf(360)
        val scale = mutableStateOf(1f)
        val state = ShomaraHomeUiState(progress = ShomaraPathProgress.emptyResolved())
        setHome(state = mutableStateOf(state), width = width, scale = scale)

        for (widthDp in listOf(360, 390, 412)) {
            for (fontScale in listOf(1f, 2f)) {
                width.value = widthDp
                scale.value = fontScale
                compose.waitForIdle()
                compose.onAllNodesWithText(ShomaraHomeStrings.Title).assertCountEquals(1)
                assertReadableInsideViewport(ShomaraHomeStrings.Title)
                assertReadableInsideViewport(ShomaraHomeStrings.Subtitle)
                assertReadableInsideViewport(
                    ShomaraHomeStrings.startHere(ShomaraStationCatalog.station("ST01").workingTitle),
                )
                assertMinimumTouchTarget(ShomaraHomeStrings.Settings)
                capture("home-fresh-${widthDp}dp-font${(fontScale * 100).toInt()}")
            }
        }
    }

    @Test
    fun currentNodeWrapsKeepsSemanticsAndEmitsExactlyOneStationIntent() {
        val actions = mutableListOf<ShomaraHomeAction>()
        val state = mutableStateOf(ShomaraHomeUiState(progress = currentProgress))
        val width = mutableStateOf(360)
        val scale = mutableStateOf(2f)
        setHome(state = state, width = width, scale = scale, actions = actions)

        val current = ShomaraStationCatalog.station("ST04")
        val currentLabel = stationLabel(current)
        // Cards-first layout (DT-40/DT-76, owner-approved device walk): the featured cards own
        // the first frame and the list opens at the top, so the Current node is reached by the
        // same scroll a child performs. Everything this test guards — wrapping, semantics, the
        // single emitted intent — then runs against the scrolled node exactly as before.
        compose.onNodeWithTag("shomara-path-list").performScrollToNode(stationMatcher("ST04"))
        compose.onNodeWithContentDescription(current.workingTitle).assertIsDisplayed()
        compose.onNodeWithContentDescription(current.workingTitle).assert(
            SemanticsMatcher.expectValue(
                SemanticsProperties.StateDescription,
                ShomaraPathGraphLogic.stateLabelFor(ShomaraPathNodeState.Current),
            ),
        )
        assertReadableInsideViewport(currentLabel)
        assertMinimumTouchTarget(current.workingTitle)
        capture("home-current-360dp-font200")

        compose.onNodeWithContentDescription(current.workingTitle).performClick()
        compose.runOnIdle {
            assertEquals(listOf<ShomaraHomeAction>(ShomaraHomeAction.OpenStation("ST04")), actions)
        }
    }

    @Test
    fun orientationStripStaysPinnedAboveTheListOnAMidPathStation() {
        // A returning child lands on ST07 (chapter 2, third station of the chapter). Orientation
        // used to be the first list row, so opening on a mid-path station scrolled the chapter,
        // the next step and the remaining count out of view entirely. The strip is now pinned
        // outside the list, so it must survive an arbitrary scroll.
        val midPath = ShomaraPathProgress(
            completedStationIds = setOf("ST01", "ST02", "ST03", "ST04", "ST05", "ST06"),
            perfectStationIds = setOf("ST02"),
            currentStationId = "ST07",
            isResolved = true,
        )
        val state = mutableStateOf(ShomaraHomeUiState(progress = midPath))
        setHome(state = state, width = mutableStateOf(390), scale = mutableStateOf(1f))

        val station = ShomaraStationCatalog.station("ST07")
        val nextStep = ShomaraHomeStrings.nextStep(station.workingTitle)
        val remaining = ShomaraHomeStrings.remaining(ShomaraDigits.toFa(19))

        // Cards-first layout (DT-40/DT-76): the list opens at the top with the featured cards,
        // so the Current node is reached by the same scroll a child performs. This test's
        // contract is that the orientation strip stays pinned and correct through arbitrary
        // scrolling — not the node's first-frame position.
        compose.onNodeWithTag("shomara-path-list").performScrollToNode(stationMatcher("ST07"))

        // The Current station is immediately actionable…
        compose.onNodeWithContentDescription(station.workingTitle).assertIsDisplayed()
        // (The anchor-bubble copy «ادامه» is decorative with cleared semantics — it is asserted
        //  in ShomaraPathGraphTest against real progress, not through the semantics tree here.)
        // …and the orientation is already on screen next to it.
        compose.onNodeWithText(nextStep).assertIsDisplayed()
        compose.onNodeWithText(remaining).assertIsDisplayed()

        // Scrolling to the end of the path must not move the pinned strip.
        val lastStation = SemanticsMatcher("station ST25") { node ->
            node.config.getOrNull(SemanticsProperties.ContentDescription)
                ?.contains(ShomaraStationCatalog.station("ST25").workingTitle) == true
        }
        compose.onNodeWithTag("shomara-path-list").performScrollToNode(lastStation)
        compose.onNodeWithText(nextStep).assertIsDisplayed()
        compose.onNodeWithText(remaining).assertIsDisplayed()
        capture("home-midpath-strip-390dp")
    }

    @Test
    fun completedPerfectAndLockedStationsKeepTheirDomainSemantics() {
        val state = mutableStateOf(ShomaraHomeUiState(progress = currentProgress))
        setHome(state = state, width = mutableStateOf(412), scale = mutableStateOf(1f))

        assertStationState("ST01", ShomaraPathNodeState.Completed)
        assertStationState("ST02", ShomaraPathNodeState.Perfect)
        assertStationState("ST05", ShomaraPathNodeState.Locked)
    }

    @Test
    fun loadingEmptyErrorOfflineAndRetryUseOnlyRealStateAndActions() {
        val state = mutableStateOf(ShomaraHomeUiState())
        val actions = mutableListOf<ShomaraHomeAction>()
        setHome(state = state, width = mutableStateOf(390), scale = mutableStateOf(1f), actions = actions)

        compose.onNodeWithText(ShomaraHomeStrings.LoadingTitle).assertIsDisplayed()
        compose.onAllNodesWithText("آمادهٔ شروع", substring = true).assertCountEquals(0)
        compose.onAllNodesWithText("هنوز قفل", substring = true).assertCountEquals(0)

        state.value = ShomaraHomeUiState(
            progress = ShomaraPathProgress.emptyResolved(),
            entryState = ShomaraEntryState.Empty,
        )
        compose.waitForIdle()
        compose.onNodeWithText(ShomaraHomeStrings.EmptyTitle).assertIsDisplayed()

        state.value = ShomaraHomeUiState(
            progress = ShomaraPathProgress.emptyResolved(),
            entryState = ShomaraEntryState.Error,
            retryAvailable = true,
        )
        compose.waitForIdle()
        compose.onNodeWithText(ShomaraHomeStrings.Retry).assertIsDisplayed().performClick()
        compose.runOnIdle { assertEquals(listOf<ShomaraHomeAction>(ShomaraHomeAction.Retry), actions) }
        capture("home-error-390dp")

        state.value = ShomaraHomeUiState(progress = currentProgress.copy(offline = true))
        compose.waitForIdle()
        // Cards-first layout (DT-40/DT-76): the Current node needs the same scroll a child
        // performs before its offline state can be asserted.
        compose.onNodeWithTag("shomara-path-list").performScrollToNode(stationMatcher("ST04"))
        compose.onNodeWithText(ShomaraHomeStrings.Offline).assertIsDisplayed()
        compose.onNodeWithContentDescription(ShomaraStationCatalog.station("ST04").workingTitle).assertIsDisplayed()
        capture("home-offline-current-390dp")
    }

    private fun setHome(
        state: androidx.compose.runtime.MutableState<ShomaraHomeUiState>,
        width: androidx.compose.runtime.MutableState<Int>,
        scale: androidx.compose.runtime.MutableState<Float>,
        actions: MutableList<ShomaraHomeAction> = mutableListOf(),
    ) {
        compose.setContent {
            DeviceConfigurationOverride(DeviceConfigurationOverride.FontScale(scale.value)) {
                ShomaraTheme {
                    Box(
                        modifier = Modifier
                            .width(width.value.dp)
                            .height(800.dp)
                            .testTag("home-viewport"),
                    ) {
                        ShomaraHomeScreen(
                            state = state.value,
                            onAction = { actions += it },
                        )
                    }
                }
            }
        }
    }

    /** Matches the path node of a station by its ContentDescription (the working title). */
    private fun stationMatcher(stationId: String): SemanticsMatcher = SemanticsMatcher("station $stationId") { node ->
        node.config.getOrNull(SemanticsProperties.ContentDescription)
            ?.contains(ShomaraStationCatalog.station(stationId).workingTitle) == true
    }

    private fun assertStationState(stationId: String, expected: ShomaraPathNodeState) {
        val station = ShomaraStationCatalog.station(stationId)
        compose.onNodeWithTag("shomara-path-list").performScrollToNode(stationMatcher(stationId))
        compose.onNodeWithContentDescription(station.workingTitle)
            .assert(
                SemanticsMatcher.expectValue(
                    SemanticsProperties.StateDescription,
                    ShomaraPathGraphLogic.stateLabelFor(expected),
                ),
            )
    }

    private fun assertReadableInsideViewport(text: String) {
        val node = compose.onNodeWithText(text, useUnmergedTree = true).fetchSemanticsNode()
        val viewport = compose.onNodeWithTag("home-viewport").fetchSemanticsNode().boundsInRoot
        val bounds = node.boundsInRoot
        assertTrue("text is outside viewport: $text ($bounds vs $viewport)", bounds.left >= viewport.left - 1f && bounds.right <= viewport.right + 1f)
        val layout = textLayoutOf(node, text)
        assertFalse("text vertically clipped: $text (lines=${layout.lineCount})", layout.didOverflowHeight)
    }

    private fun assertMinimumTouchTarget(contentDescription: String) {
        val bounds = compose.onNodeWithContentDescription(contentDescription).fetchSemanticsNode().boundsInRoot
        val minimum = with(compose.density) { 48.dp.toPx() }
        assertTrue("touch width below 48dp: $contentDescription (${bounds.width}px)", bounds.width + 1f >= minimum)
        assertTrue("touch height below 48dp: $contentDescription (${bounds.height}px)", bounds.height + 1f >= minimum)
    }

    private fun textLayoutOf(node: SemanticsNode, text: String): TextLayoutResult {
        assertTrue("no text layout action for $text", node.config.contains(SemanticsActions.GetTextLayoutResult))
        val results = mutableListOf<TextLayoutResult>()
        node.config[SemanticsActions.GetTextLayoutResult].action?.invoke(results)
        assertEquals("exactly one text layout for $text", 1, results.size)
        return results.first()
    }

    private fun stationLabel(meta: StationNodeMeta): String =
        "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)} · ${meta.workingTitle}"

    @OptIn(ExperimentalTestApi::class)
    private fun capture(name: String) {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val directory = context.getExternalFilesDir("compose-evidence") ?: context.filesDir
        val output = File(directory, "$name.png")
        FileOutputStream(output).use { stream ->
            val bitmap = compose.onNodeWithTag("home-viewport").captureToImage().asAndroidBitmap()
            assertTrue("screenshot encoding failed for $name", bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream))
        }
        Log.i("HomeEvidence", output.absolutePath)
    }
}
