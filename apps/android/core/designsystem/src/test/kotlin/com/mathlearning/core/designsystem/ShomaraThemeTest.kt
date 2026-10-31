package com.mathlearning.core.designsystem

import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * N03-02 unit tests: every theme value must resolve from the generated ShomaraTokens (zero
 * magic values), typography weights must match the canonical type scale, clay specs must mirror
 * the token tiers, and direction defaults must encode RTL interface vs LTR math semantics.
 */
class ShomaraThemeTest {

    @Test
    fun `color scheme maps slots to generated v2 tokens`() {
        val scheme = ShomaraColorScheme.Light
        assertEquals(ShomaraTokens.ColorPrimary, scheme.primary)
        assertEquals(ShomaraTokens.ColorWhite, scheme.onPrimary)
        assertEquals(ShomaraTokens.ColorPrimarySoft, scheme.primaryContainer)
        assertEquals(ShomaraTokens.ColorCanvas, scheme.background)
        assertEquals(ShomaraTokens.ColorInk, scheme.onBackground)
        assertEquals(ShomaraTokens.ColorSurface, scheme.surface)
        assertEquals(ShomaraTokens.ColorSurfaceAlt, scheme.surfaceVariant)
        assertEquals(ShomaraTokens.ColorInk2, scheme.onSurfaceVariant)
        assertEquals(ShomaraTokens.ColorDanger, scheme.error)
        assertEquals(ShomaraTokens.ColorBerry, scheme.secondary)
        assertEquals(ShomaraTokens.ColorSky, scheme.tertiary)
        assertEquals(ShomaraTokens.ColorLine, scheme.outline)
    }

    @Test
    fun `typography carries the canonical v2 weights and sizes`() {
        val t = ShomaraTypography
        assertEquals(ShomaraTokens.TypeDisplayWeight, t.Display.fontWeight)
        assertEquals(ShomaraTokens.TypeDisplayFontSize, t.Display.fontSize)
        assertEquals(ShomaraTokens.TypeDisplayLineHeight, t.Display.lineHeight)
        assertEquals(ShomaraTokens.TypeBodyWeight, t.Body.fontWeight)
        assertEquals(ShomaraTokens.TypeCaptionWeight, t.Caption.fontWeight)
        assertEquals(ShomaraTokens.TypeBignumWeight, t.BigNum.fontWeight)
        // Material3 typography wiring keeps the token styles.
        assertEquals(t.Display.fontSize, t.Material.displayLarge?.fontSize)
        assertEquals(t.Body.fontSize, t.Material.bodyLarge?.fontSize)
    }

    @Test
    fun `clay specs mirror the generated tiers`() {
        assertEquals(ShomaraTokens.ClaySoftBorderWidth, ShomaraClay.Soft.borderWidth)
        assertEquals(ShomaraTokens.ClaySoftShadowOpacity.toFloat(), ShomaraClay.Soft.shadowOpacity)
        assertEquals(ShomaraTokens.ClayFeaturedBorderWidth, ShomaraClay.Featured.borderWidth)
        assertEquals(ShomaraTokens.ClayLevelFeatured.dp, ShomaraClay.Featured.elevation)
        // Flat carries no depth; hint is flat depth with its level only.
        assertEquals(0.dp, ShomaraClay.Flat.borderWidth)
        assertEquals(0.dp, ShomaraClay.Hint.borderWidth)
        assertNotEquals(ShomaraClay.Flat.elevation, ShomaraClay.Hint.elevation)
        assertEquals(ShomaraClay.Soft, ShomaraClay.specFor(ShomaraClayDepth.Soft))
        assertEquals(ShomaraClay.Featured, ShomaraClay.specFor(ShomaraClayDepth.Featured))
    }

    @Test
    fun `clay color pairing follows the token note`() {
        assertEquals(ShomaraTokens.ColorSurface, ShomaraClayColors.fillFor(ShomaraClayDepth.Soft))
        assertEquals(ShomaraTokens.ColorLine, ShomaraClayColors.borderFor(ShomaraClayDepth.Soft))
        assertEquals(ShomaraTokens.ColorAmberSoft, ShomaraClayColors.fillFor(ShomaraClayDepth.Featured))
        assertEquals(ShomaraTokens.ColorAmber, ShomaraClayColors.borderFor(ShomaraClayDepth.Featured))
        assertEquals(ShomaraTokens.ColorWhite, ShomaraClayColors.Highlight)
    }

    @Test
    fun `shapes wire the material slots to token-derived instances`() {
        org.junit.Assert.assertSame(ShomaraShapes.Small, ShomaraShapes.Material.small)
        org.junit.Assert.assertSame(ShomaraShapes.Medium, ShomaraShapes.Material.medium)
        org.junit.Assert.assertSame(ShomaraShapes.Large, ShomaraShapes.Material.large)
        // Distinct radius tiers produce distinct shape instances (sm=12, md=18, lg=24, xl=32, pill=999).
        assertNotEquals(ShomaraShapes.Small, ShomaraShapes.Medium)
        assertNotEquals(ShomaraShapes.Large, ShomaraShapes.ExtraLarge)
        assertNotEquals(ShomaraShapes.ExtraLarge, ShomaraShapes.Pill)
    }

    @Test
    fun `direction defaults encode RTL interface and LTR math`() {
        assertEquals(LayoutDirection.Rtl, ShomaraDirections.DefaultInterfaceDirection)
        assertEquals(LayoutDirection.Ltr, ShomaraDirections.DefaultMathDirection)
        assertNotEquals(ShomaraDirections.DefaultInterfaceDirection, ShomaraDirections.DefaultMathDirection)
    }

    @Test
    fun `48dp child touch floor holds`() {
        assertTrue("touchMin below the 48dp child floor", ShomaraTokens.ComponentTouchMin >= 48.dp)
    }
}
