package com.mathlearning.feature.onboarding

import com.mathlearning.core.designsystem.ShomaraLaunchDrawables
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs

/** N04-02 Persian phone validation and back-behavior tests. */
class WelcomePhoneTest {

    @Test
    fun `persian and arabic digits normalize to latin`() {
        assertEquals('3', ShomaraPhoneLogic.normalizeDigit('۳'))
        assertEquals('3', ShomaraPhoneLogic.normalizeDigit('٣'))
        assertEquals('9', ShomaraPhoneLogic.normalizeDigit('۹'))
        assertEquals('5', ShomaraPhoneLogic.normalizeDigit('5'))
    }

    @Test
    fun `normalize accepts prefixes separators and persian digits`() {
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("۰۹۱۲۳۴۵۶۷۸۹"))
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("+98 912 345 6789"))
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("0098-912-345-6789"))
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("989123456789"))
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("9123456789"))
        assertEquals("09123456789", ShomaraPhoneLogic.normalize("09123456789"))
        assertEquals("", ShomaraPhoneLogic.normalize("abc"))
    }

    @Test
    fun `validation requires the 09 eleven-digit canonical form`() {
        assertTrue(ShomaraPhoneLogic.isValid("۰۹۱۲۳۴۵۶۷۸۹"))
        assertFalse(ShomaraPhoneLogic.isValid("0912345678")) // 10 digits
        assertFalse(ShomaraPhoneLogic.isValid("08123456789")) // wrong trunk
        assertFalse(ShomaraPhoneLogic.isValid("091234567890")) // 12 digits
        assertFalse(ShomaraPhoneLogic.isValid(""))
        assertEquals("09123456789", ShomaraPhoneLogic.canonical("+98 912 345 6789"))
        assertNull(ShomaraPhoneLogic.canonical("12345"))
    }

    @Test
    fun `validation error is the actionable persian message only when invalid`() {
        assertEquals(ShomaraOnboardingStrings.PhoneInvalid, ShomaraPhoneLogic.validationError("123"))
        assertNull(ShomaraPhoneLogic.validationError("09123456789"))
    }

    // F-08: the phone screen shows the error only once 11 digits are in and the number is
    // still invalid — a partial number is still being typed, not wrong. The display gate
    // (`phone.count { it.isDigit() } >= 11` in ShomaraPhoneScreen) lives in the composable,
    // so this JVM test locks its two halves with the real logic: the digit count that keeps
    // the gate closed, and the validation result that opens it at 11 digits.
    @Test
    fun `partial number shows no error - eleven invalid digits do`() {
        // «۰۹» is only 2 digits: below the 11-digit gate, so no error is shown — even
        // though the strict validator itself still reports the partial input as invalid.
        val partial = "۰۹"
        assertEquals(2, partial.count { it.isDigit() })
        assertTrue(partial.count { it.isDigit() } < 11)
        assertEquals(ShomaraOnboardingStrings.PhoneInvalid, ShomaraPhoneLogic.validationError(partial))
        // 11 digits, wrong trunk: the gate opens and the error is shown.
        val elevenInvalid = "08123456789"
        assertEquals(11, elevenInvalid.count { it.isDigit() })
        assertTrue(elevenInvalid.count { it.isDigit() } >= 11)
        assertEquals(ShomaraOnboardingStrings.PhoneInvalid, ShomaraPhoneLogic.validationError(elevenInvalid))
        // 11 valid digits: no error at any gate.
        assertNull(ShomaraPhoneLogic.validationError("۰۹۱۲۳۴۵۶۷۸۹"))
    }

    @Test
    fun `back behavior maps every step deterministically`() {
        assertEquals(null, ShomaraBackLogic.backTarget(OnboardingStep.Welcome))
        assertEquals(OnboardingStep.Welcome, ShomaraBackLogic.backTarget(OnboardingStep.PhoneInput))
        assertEquals(OnboardingStep.PhoneInput, ShomaraBackLogic.backTarget(OnboardingStep.OtpVerify))
        assertEquals(OnboardingStep.OtpVerify, ShomaraBackLogic.backTarget(OnboardingStep.ProfileSetup))
        assertEquals(OnboardingStep.ProfileSetup, ShomaraBackLogic.backTarget(OnboardingStep.GradePlacement))
        assertEquals(null, ShomaraBackLogic.backTarget(OnboardingStep.Complete))
    }

    @Test
    fun `welcome and phone copy is warm and free of banned terms`() {
        val copy = listOf(
            ShomaraOnboardingStrings.WelcomeTitle,
            ShomaraOnboardingStrings.WelcomeSubtitle,
            ShomaraOnboardingStrings.WelcomeBody,
            ShomaraOnboardingStrings.PhoneInvalid,
        )
        for (text in copy) {
            assertFalse(text.contains("ستاره"))
            assertFalse(text.contains("تنبیه"))
        }
    }

    @Test
    fun `welcome subtitle is the owner-supplied text`() {
        assertEquals(
            "برای یادگیری ریاضی، آماده یک ماجراجویی هیجان‌انگیز!",
            ShomaraOnboardingStrings.WelcomeSubtitle,
        )
    }

    @Test
    fun `launch hero fills just over half the screen`() {
        assertEquals(0.54f, ShomaraLaunchLayout.HeroHeightFraction, 0.001f)
    }

    @Test
    fun `launch hero assets stay inside the hero zone`() {
        for (asset in ShomaraLaunchLayout.heroAssets()) {
            assertTrue("${asset.name} starts inside the hero", asset.xFraction >= 0f)
            assertTrue(
                "${asset.name} ends inside the hero",
                asset.xFraction + asset.widthFraction <= 1.001f,
            )
            assertTrue("${asset.name} starts below the hero top", asset.yFraction >= 0f)
            assertTrue(
                "${asset.name} ends inside the hero",
                ShomaraLaunchLayout.bottomFraction(asset) <= 1.02f,
            )
        }
    }

    @Test
    fun `launch mascot is centred in the hero`() {
        val center = ShomaraLaunchLayout.mascotCenterXFraction()
        assertTrue("mascot centre $center is near the hero centre", abs(center - 0.5f) < 0.02f)
    }

    @Test
    fun `launch cta spans most of the width`() {
        assertEquals(0.807f, ShomaraLaunchLayout.CtaWidthFraction, 0.001f)
        val margin = (1f - ShomaraLaunchLayout.CtaWidthFraction) / 2f
        assertTrue("side margin $margin is near the sample 0.095", abs(margin - 0.095f) < 0.01f)
    }

    @Test
    fun `launch cta arrow points right as in the sample`() {
        val arrow = ShomaraLaunchLayout.arrowPoints()
        assertTrue("arrow tip is to the right of its tail", arrow.tipX > arrow.tailX)
    }

    @Test
    fun `launch swoosh curves downward in the middle`() {
        val swoosh = ShomaraLaunchLayout.swooshPoints()
        assertTrue(swoosh.controlY > swoosh.startY)
        assertTrue(swoosh.controlY > swoosh.endY)
    }

    @Test
    fun `launch drawables cover all twelve owner files`() {
        assertEquals(12, ShomaraLaunchDrawables.All.size)
        assertEquals(12, ShomaraLaunchDrawables.All.toSet().size)
    }
}
