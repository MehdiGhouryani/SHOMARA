package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * N08-04 instrumented proof: reduced motion is not just a promise in a pure function — the rendered
 * progress surface really stops animating and really keeps its state announcement.
 *
 * The indeterminate branch renders `LinearProgressIndicator` (a Compose infinite transition that
 * ignores the platform animator scale by itself) when motion is allowed, and a static Box when it
 * is reduced. We distinguish the two from the semantics tree: the animated indicator exposes the
 * `ProgressBarRangeInfo` semantics property, which the static placeholder does not.
 *
 * That is a behavioural difference visible to the child (something is moving vs. nothing is), not
 * a source-code claim.
 */
class ShomaraReducedMotionTest {

    @get:Rule
    val compose = createComposeRule()

    private val animatedTag = "progress"

    @Test
    fun indeterminateProgressKeepsAnimatingWhenMotionIsAllowed() {
        compose.setContent {
            ShomaraTheme(reducedMotion = false) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ShomaraProgressBar(
                        state = ShomaraProgressState(),
                        modifier = Modifier.testTag(animatedTag),
                    )
                }
            }
        }
        // The live LinearProgressIndicator contributes range-info semantics; its presence is the
        // machine-visible signal that the animated composable is in the tree.
        assertTrue(
            "an indeterminate bar with motion allowed must render the animated indicator",
            hasAnimatedIndicator(),
        )
    }

    @Test
    fun indeterminateProgressStopsWhenReducedMotionIsOn() {
        compose.setContent {
            ShomaraTheme(reducedMotion = true) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ShomaraProgressBar(
                        state = ShomaraProgressState(),
                        modifier = Modifier.testTag(animatedTag),
                    )
                }
            }
        }
        assertFalse(
            "reduced motion must replace the animated indicator with a static placeholder",
            hasAnimatedIndicator(),
        )
    }

    @Test
    fun reducedMotionKeepsTheStateAnnouncement() {
        // Reduced motion removes MOVEMENT, never INFORMATION: TalkBack must still hear the state.
        val stateDescription = mutableStateOf("")
        compose.setContent {
            ShomaraTheme(reducedMotion = true) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ShomaraProgressBar(
                        state = ShomaraProgressState(fraction = 0.4f),
                        modifier = Modifier.testTag(animatedTag),
                    )
                }
            }
        }
        val node = compose.onNodeWithTag(animatedTag, useUnmergedTree = true).fetchSemanticsNode()
        val config = node.config
        assertTrue(
            "determinate progress must announce its fraction even under reduced motion",
            config.contains(androidx.compose.ui.semantics.SemanticsProperties.StateDescription),
        )
        stateDescription.value = config[androidx.compose.ui.semantics.SemanticsProperties.StateDescription]
        assertTrue(
            "announcement should mention progress, got '${stateDescription.value}'",
            stateDescription.value.contains("پیشرفت"),
        )
    }

    @Test
    fun determinateProgressNeverRendersTheAnimatedIndicator() {
        // setContent runs once; the flag is driven through state for both modes.
        val reduced = mutableStateOf(false)
        val fraction = mutableStateOf(0.5f)
        compose.setContent {
            ShomaraTheme(reducedMotion = reduced.value) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ShomaraProgressBar(
                        state = ShomaraProgressState(fraction = fraction.value),
                        modifier = Modifier.testTag(animatedTag),
                    )
                }
            }
        }
        for (r in listOf(false, true)) {
            reduced.value = r
            compose.waitForIdle()
            assertFalse(
                "determinate progress must not animate (reduced=$r)",
                hasAnimatedIndicator(),
            )
        }
    }

    /** True when a node in the tree exposes progress range info (the animated indicator). */
    private fun hasAnimatedIndicator(): Boolean {
        val matcher = androidx.compose.ui.test.SemanticsMatcher.keyIsDefined(
            androidx.compose.ui.semantics.SemanticsProperties.ProgressBarRangeInfo,
        )
        return compose.onAllNodes(matcher, useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
    }

    // ---- R-01 (F-33): the loading text field ----
    //
    // The busy field renders CircularProgressIndicator (animated, exposes
    // ProgressBarRangeInfo) when motion is allowed, and a static dot of the same size and
    // colour when reduced motion is on. The dot is a plain Box — no range-info semantics.

    @Test
    fun textFieldLoadingSpinnerAnimatesWhenMotionIsAllowed() {
        compose.setContent {
            ShomaraTheme(reducedMotion = false) {
                ShomaraTextField(value = "", onValueChange = {}, label = "شماره", busy = true)
            }
        }
        assertTrue(
            "a busy text field with motion allowed must render the animated spinner",
            hasAnimatedIndicator(),
        )
    }

    @Test
    fun textFieldLoadingSpinnerIsStaticUnderReducedMotion() {
        compose.setContent {
            ShomaraTheme(reducedMotion = true) {
                ShomaraTextField(value = "", onValueChange = {}, label = "شماره", busy = true)
            }
        }
        assertFalse(
            "a busy text field under reduced motion must render the static dot, not the spinner",
            hasAnimatedIndicator(),
        )
    }
}