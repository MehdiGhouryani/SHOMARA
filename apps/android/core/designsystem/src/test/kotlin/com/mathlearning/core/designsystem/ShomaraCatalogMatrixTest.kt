package com.mathlearning.core.designsystem

import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** N03-06 catalog matrix verification (JVM-pure; rendered screenshots stay a device/Paparazzi gate). */
class ShomaraCatalogMatrixTest {

    @Test
    fun `matrix covers the three canonical widths at both font scales`() {
        assertEquals(listOf(360, 390, 412), ShomaraCatalogMatrix.Widths)
        assertEquals(listOf(1.0f, 2.0f), ShomaraCatalogMatrix.FontScales)
        for (width in ShomaraCatalogMatrix.Widths) {
            for (scale in ShomaraCatalogMatrix.FontScales) {
                assertTrue(ShomaraCatalogMatrix.covers(width, scale, ShomaraCatalogMatrix.Families))
            }
        }
        assertFalse(ShomaraCatalogMatrix.covers(320, 1.0f, ShomaraCatalogMatrix.Families))
        assertFalse(ShomaraCatalogMatrix.covers(390, 3.0f, ShomaraCatalogMatrix.Families))
    }

    @Test
    fun `catalog lists exactly the nine canonical component families`() {
        assertEquals(9, ShomaraCatalogMatrix.Families.size)
        assertEquals(
            listOf(
                "Button",
                "TextField/OTP",
                "Card/Choice",
                "Feedback",
                "Progress",
                "TopBar/TabBar",
                "Dialog/Sheet",
                "AudioControl",
                "Manipulative",
            ),
            ShomaraCatalogMatrix.Families,
        )
    }

    @Test
    fun `catalog fixture widths derive from the matrix`() {
        for (width in ShomaraCatalogMatrix.Widths) {
            assertEquals(width.dp, ShomaraCatalogMatrix.fullWidthFixtureWidth(width))
        }
    }

    @Test
    fun `catalog directions encode RTL interface with LTR math`() {
        assertEquals(LayoutDirection.Rtl, ShomaraDirections.DefaultInterfaceDirection)
        assertEquals(LayoutDirection.Ltr, ShomaraDirections.DefaultMathDirection)
    }
}
