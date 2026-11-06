package com.mathlearning.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Page 02-profile layout geometry: every fraction measured from the owner's sample (878x1792). */
class ShomaraProfileLayoutTest {

    @Test
    fun `hero fractions stay inside the hero box`() {
        val layout = ShomaraProfileLayout
        for (fraction in listOf(
            layout.MascotXFraction,
            layout.MascotYFraction,
            layout.MascotWidthFraction,
            layout.CloudTopLeftX,
            layout.CloudTopLeftY,
            layout.CloudTopLeftWidth,
            layout.CloudTopRightX,
            layout.CloudTopRightY,
            layout.CloudTopRightWidth,
            layout.CloudBottomLeftX,
            layout.CloudBottomLeftY,
            layout.CloudBottomLeftWidth,
            layout.CloudBottomRightX,
            layout.CloudBottomRightY,
            layout.CloudBottomRightWidth,
            layout.RaysX,
            layout.RaysY,
            layout.RaysWidth,
            layout.HeroHillWidth,
            layout.LeavesTopLeftX,
            layout.LeavesTopLeftY,
            layout.LeavesTopLeftWidth,
            layout.LeavesTopRightX,
            layout.LeavesTopRightY,
            layout.LeavesTopRightWidth,
            layout.BottomBackgroundHeightFraction,
            layout.BottomCloudLeftX,
            layout.BottomCloudLeftY,
            layout.BottomCloudLeftWidth,
            layout.BottomCloudRightX,
            layout.BottomCloudRightY,
            layout.BottomCloudRightWidth,
            layout.LeavesBottomLeftWidth,
            layout.LeavesBottomRightX,
            layout.LeavesBottomRightWidth,
            layout.CtaWidthFraction,
        )) {
            // The mascot's Y may poke slightly above the hero top (owner
            // mockup: the bow nearly touches the progress bar).
            val bound = if (fraction == layout.MascotYFraction) -0.06f else 0f
            assertTrue("fraction $fraction must be inside [$bound, 1]", fraction in bound..1f)
        }
        assertTrue(layout.HeroAspectRatio > 1f)
    }

    @Test
    fun `mascot is centred and peeks over the front curve`() {
        val layout = ShomaraProfileLayout
        // Sample bbox x 0.267-0.752: centre 0.51, i.e. centred within 0.02.
        val centreX = layout.MascotXFraction + layout.MascotWidthFraction / 2f
        assertEquals(0.5f, centreX, 0.02f)
        // The mascot's bottom must sit below the front curve's top edge at the
        // centre, so the curve covers the lower body and the mascot peeks.
        val mascotHeightFractionOfHero = layout.MascotWidthFraction / layout.MascotAspectRatio * layout.HeroAspectRatio
        val mascotBottom = layout.MascotYFraction + mascotHeightFractionOfHero
        // Front curve: 355/878 of the width tall (owner mockup: the dome cut
        // passes at the mascot's resting hands), bottom-anchored; its top edge
        // at the centre is 11/180 down its own height (owner SVG 12).
        val curveHeightFractionOfHero = 355f / 878f * layout.HeroAspectRatio
        val curveCentreTop = 1f - curveHeightFractionOfHero + 11f / 180f * curveHeightFractionOfHero
        assertTrue("mascot bottom $mascotBottom must be below curve centre top $curveCentreTop", mascotBottom > curveCentreTop)
    }

    @Test
    fun `cta is narrower than the content and centred`() {
        val layout = ShomaraProfileLayout
        // Sample: CTA x 0.116-0.888 — symmetric margins, narrower than the
        // 0.89-wide content column.
        assertEquals(0.772f, layout.CtaWidthFraction, 0.001f)
        assertEquals((1f - layout.CtaWidthFraction) / 2f, 0.114f, 0.001f)
    }

}
