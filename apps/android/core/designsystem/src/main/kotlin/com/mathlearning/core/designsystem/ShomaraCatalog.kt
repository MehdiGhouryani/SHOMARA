package com.mathlearning.core.designsystem

import androidx.compose.material3.Text
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

/**
 * N03-06 catalog matrix: every fixture set must be rendered deterministically across the three
 * canonical widths (360/390/412dp), both font scales, light theme, RTL interface and LTR math.
 * Rendered screenshots are a Paparazzi/device gate (NATIVE_PENDING until that evidence exists);
 * this matrix plus the JVM tests are the N03-verifiable part.
 */
object ShomaraCatalogMatrix {
    val Widths: List<Int> = listOf(360, 390, 412)
    val FontScales: List<Float> = listOf(1.0f, 2.0f)

    /** The nine canonical component families in COMPONENT_READINESS order. */
    val Families: List<String> = listOf(
        "Button",
        "TextField/OTP",
        "Card/Choice",
        "Feedback",
        "Progress",
        "TopBar/TabBar",
        "Dialog/Sheet",
        "AudioControl",
        "Manipulative",
    )

    fun covers(width: Int, fontScale: Float, families: Collection<String>): Boolean =
        width in Widths && fontScale in FontScales && Families.all { it in families }

    fun fullWidthFixtureWidth(width: Int): Dp = width.dp
}

