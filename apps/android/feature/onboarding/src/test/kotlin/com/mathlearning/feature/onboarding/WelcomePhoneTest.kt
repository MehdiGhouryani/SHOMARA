package com.mathlearning.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

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
            ShomaraOnboardingStrings.WelcomeBody,
            ShomaraOnboardingStrings.PhoneInvalid,
        )
        for (text in copy) {
            assertFalse(text.contains("ستاره"))
            assertFalse(text.contains("تنبیه"))
        }
    }
}
