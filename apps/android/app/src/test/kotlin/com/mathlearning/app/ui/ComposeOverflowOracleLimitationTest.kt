package com.mathlearning.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.mathlearning.core.designsystem.ShomaraTheme
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

/**
 * DT-57: what a JVM-rendered Compose test can and cannot prove about overflow - measured, not assumed.
 *
 * The plan was to settle the landscape question here: render Home inside an 800x360dp box and fail when a node
 * escaped it. The plan did not survive contact with the runner. Robolectric CLIPS `boundsInRoot` to the parent, so a
 * node that is genuinely too tall reports bounds that stop at the edge and looks like it fits. The calibration below
 * proves it: a 400dp-tall node inside a 360dp-tall viewport is reported as ZERO escapes.
 *
 * That makes a JVM positional-overflow oracle worthless - and worse than worthless if it silently passes, because it
 * would have "verified" landscape while measuring nothing. `ShomaraA11ySweepTest` can keep doing this on a device,
 * where the bounds are not clipped; on the JVM it must not be pretended.
 *
 * This file therefore pins the limitation itself. If a future Compose or Robolectric release stops clipping, the
 * first test below fails, and that failure is the signal that a real JVM overflow oracle has become possible.
 * It is a characterization test of the tool, deliberately asserting the tool's weakness rather than the app's
 * strength.
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
class ComposeOverflowOracleLimitationTest {

    @get:Rule
    val compose = createComposeRule()

    private val viewportWidth = 800
    private val viewportHeight = 360
    private val density = 2.625f

    private fun renderOverSizedNode() {
        compose.setContent {
            CompositionLocalProvider(LocalDensity provides Density(density = density, fontScale = 1f)) {
                ShomaraTheme {
                    Box(modifier = Modifier.width(viewportWidth.dp).height(viewportHeight.dp)) {
                        Box(
                            modifier = Modifier
                                .width(400.dp)
                                .height(400.dp)
                                .semantics { contentDescription = "deliberately too tall" },
                        )
                    }
                }
            }
        }
        compose.waitForIdle()
    }

    @Test
    fun `robolectric clips boundsInRoot so a too-tall node looks like it fits`() {
        renderOverSizedNode()

        val heightPx = viewportHeight * density
        val reportedEscaping = compose
            .onAllNodes(SemanticsMatcher("any") { true }, useUnmergedTree = true)
            .fetchSemanticsNodes()
            .filter { it.boundsInRoot.bottom > heightPx + 0.5f }

        assertEquals(
            "boundsInRoot is expected to be CLIPPED on the JVM: a 400dp node inside a 360dp viewport reports no " +
                "escape. If this assertion fails, the runner stopped clipping and a real JVM overflow oracle is " +
                "possible now - replace this test with one instead of relaxing it.",
            0,
            reportedEscaping.size,
        )
    }

    /**
     * The clipping is not limited to position: the reported SIZE is flattened too (a 400dp node reports well under
     * 400dp here). Both geometry channels a test could use are therefore unreliable on this runner, which is the
     * whole finding - documented as an inequality rather than a magic number, because the exact number is the
     * runner's business and would make this test brittle for no benefit.
     */
    @Test
    fun `the reported size of that node is flattened as well`() {
        renderOverSizedNode()

        val node = compose
            .onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.ContentDescription))
            .fetchSemanticsNodes()
            .single()

        val declaredPx = 400 * density
        assertTrue(
            "expected the clipped runner to report LESS than the declared ${declaredPx}px, got ${node.size.height}; " +
                "if it reports the true size the runner stopped flattening geometry - revisit the oracle",
            node.size.height < declaredPx,
        )
    }
}
