package com.mathlearning.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Page-03 phone hero geometry: the compact version of the page-02 profile
 * hero (same visual language, shorter box). Pins the owner-brief fractions —
 * hero height 0.62 of the width, mascot box 0.66 of the width, y-offset 0.03
 * of the hero height, front-curve box 242/878 of the width (device-verified hands-drape) — and the peek
 * property that keeps the mascot reading as draped over the dome.
 */
class ShomaraPhoneHeroLayoutTest {

    @Test
    fun `hero fractions stay inside the hero box`() {
        val layout = ShomaraPhoneHeroLayout
        for (fraction in listOf(
            layout.MascotXFraction,
            layout.MascotYFraction,
            layout.MascotWidthFraction,
            layout.HeroHillWidth,
            layout.LeavesTopLeftX,
            layout.LeavesTopLeftY,
            layout.LeavesTopLeftWidth,
            layout.LeavesTopRightX,
            layout.LeavesTopRightY,
            layout.LeavesTopRightWidth,
            layout.FrontCurveHeightFraction,
        )) {
            // The mascot's Y may poke slightly above the hero top (the
            // page-02 owner decision: the hands drape over the dome).
            val bound = if (fraction == layout.MascotYFraction) -0.06f else 0f
            assertTrue("fraction $fraction must be inside [$bound, 1]", fraction in bound..1f)
        }
    }

    @Test
    fun `hero is shorter than the profile hero and matches the owner brief`() {
        // The brief's numbers: hero 0.62 of the width, mascot box 0.66, dome
        // 242/878 (device-verified: the hands drape over the edge).
        assertEquals(0.62f, ShomaraPhoneHeroLayout.HeroHeightFraction, 0.001f)
        assertEquals(0.66f, ShomaraPhoneHeroLayout.MascotWidthFraction, 0.001f)
        assertEquals(242f / 878f, ShomaraPhoneHeroLayout.FrontCurveHeightFraction, 0.0001f)
        // «slightly shorter» than page-02 (1/1.27 ≈ 0.787).
        assertTrue(ShomaraPhoneHeroLayout.HeroHeightFraction < 1f / ShomaraProfileLayout.HeroAspectRatio)
    }

    @Test
    fun `mascot is centred and peeks over the front curve`() {
        val layout = ShomaraPhoneHeroLayout
        val centreX = layout.MascotXFraction + layout.MascotWidthFraction / 2f
        assertEquals(0.5f, centreX, 0.001f)
        // The mascot's bottom must sit below the front curve's top edge at the
        // centre, so the curve covers the lower body and the mascot peeks.
        val mascotHeightFractionOfHero = layout.MascotWidthFraction / layout.MascotAspectRatio / layout.HeroHeightFraction
        val mascotBottom = layout.MascotYFraction + mascotHeightFractionOfHero
        // Front curve: 242/878 of the width tall, bottom-anchored; its top
        // edge at the centre is 11/180 down its own height (owner SVG 12).
        val curveHeightFractionOfHero = layout.FrontCurveHeightFraction / layout.HeroHeightFraction
        val curveCentreTop = 1f - curveHeightFractionOfHero + 11f / 180f * curveHeightFractionOfHero
        assertTrue("mascot bottom $mascotBottom must be below curve centre top $curveCentreTop", mascotBottom > curveCentreTop)
    }

    @Test
    fun `cta shares the profile cta width fraction`() {
        // «0.772 width like profile»: the phone screen references the page-02
        // constant directly, so the two can never drift apart.
        assertEquals(0.772f, ShomaraProfileLayout.CtaWidthFraction, 0.0001f)
    }
}
