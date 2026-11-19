package com.mathlearning.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.unit.dp
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

/**
 * DT-57: proves that Compose can be rendered on the JVM in this project, which is the precondition for asserting
 * landscape geometry without a device. It is deliberately trivial - if this ever fails, every JVM UI assertion in
 * this module is untrustworthy, and a failure here says so in one line instead of inside a real screen's test.
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34], qualifiers = "w800dp-h360dp-land")
class ComposeOnJvmSmokeTest {

    @get:Rule
    val compose = createComposeRule()

    @Test
    fun `compose renders on the jvm`() {
        compose.setContent {
            Box(modifier = Modifier.size(48.dp)) {
                Text("سلام")
            }
        }
        compose.onNodeWithText("سلام").assertIsDisplayed()
    }
}
