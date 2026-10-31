package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** Welcome/phone copy seeds; screens accept canonical-source overrides. Warm and plain (AGENTS rule 9 tone). */
object ShomaraOnboardingStrings {
    const val WelcomeTitle: String = "به شومارا خوش آمدی!"
    const val WelcomeBody: String = "برای شروع یادگیری، شمارهٔ همراه والدین را وارد کنیم."
    const val PhoneLabel: String = "شمارهٔ همراه والدین"
    const val PhoneHint: String = "۰۹۱۲ ۳۴۵ ۶۷۸۹"
    const val PhoneInvalid: String = "شمارهٔ همراه را با ۰۹ و ۱۱ رقم وارد کن."
    const val Continue: String = "ادامه"
    const val Back: String = "بازگشت"
}

/**
 * Pure Persian phone normalization/validation (N04-02 acceptance). Accepts Persian/Arabic
 * digits, common separators, and 0098/+98/98/0 trunk prefixes; canonical output is the plain
 * 09XXXXXXXXX form (11 digits).
 */
object ShomaraPhoneLogic {
    private val PersianDigits = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
    private val ArabicDigits = charArrayOf('٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩')

    fun normalizeDigit(char: Char): Char = when (char) {
        in PersianDigits -> ('0' + PersianDigits.indexOf(char))
        in ArabicDigits -> ('0' + ArabicDigits.indexOf(char))
        else -> char
    }

    fun normalize(raw: String): String = raw.map(::normalizeDigit)
        .filter { it.isDigit() || it == '+' }
        .joinToString("")
        .removePrefix("+98")
        .removePrefix("0098")
        .removePrefix("98")
        .filter { it.isDigit() }
        .removePrefix("0")
        .let { trunk -> if (trunk.isNotEmpty()) "0$trunk" else "" }

    fun isValid(raw: String): Boolean {
        val normalized = normalize(raw)
        return normalized.length == 11 && normalized.startsWith("09") && normalized.all { it.isDigit() }
    }

    fun canonical(raw: String): String? = if (isValid(raw)) normalize(raw) else null

    fun validationError(raw: String): String? = if (isValid(raw)) null else ShomaraOnboardingStrings.PhoneInvalid
}

/** Pure back-target mapping (N04-02 keyboard/back behavior; wired to real Back in N04-07). */
object ShomaraBackLogic {
    fun backTarget(step: OnboardingStep): OnboardingStep? = when (step) {
        OnboardingStep.Welcome -> null // no route behind the welcome gate
        OnboardingStep.PhoneInput -> OnboardingStep.Welcome
        OnboardingStep.OtpVerify -> OnboardingStep.PhoneInput
        OnboardingStep.ProfileSetup -> OnboardingStep.OtpVerify
        OnboardingStep.GradePlacement -> OnboardingStep.ProfileSetup
        OnboardingStep.Complete -> null // completion exits onboarding
    }
}

@Composable
fun ShomaraWelcomeScreen(
    onStart: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = ShomaraOnboardingStrings.WelcomeTitle,
    body: String = ShomaraOnboardingStrings.WelcomeBody,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(ShomaraTokens.Space40))
        Text(text = title, style = ShomaraTypography.Display, color = ShomaraTokens.ColorInk)
        Text(text = body, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
        Spacer(modifier = Modifier.height(ShomaraTokens.Space16))
        ShomaraButton(text = ShomaraOnboardingStrings.Continue, onClick = onStart, variant = ShomaraButtonVariant.Primary)
    }
}

@Composable
fun ShomaraPhoneScreen(
    phone: String,
    onPhoneChange: (String) -> Unit,
    onContinue: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = ShomaraOnboardingStrings.PhoneLabel,
) {
    val error = ShomaraPhoneLogic.validationError(phone)
    val canContinue = ShomaraPhoneLogic.isValid(phone)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Text(text = ShomaraOnboardingStrings.WelcomeBody, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
        ShomaraTextField(
            value = phone,
            onValueChange = onPhoneChange,
            label = title,
            hint = ShomaraOnboardingStrings.PhoneHint,
            errorText = error,
            numericLtr = true,
        )
        ShomaraButton(
            text = ShomaraOnboardingStrings.Continue,
            onClick = {
                val canonical = ShomaraPhoneLogic.canonical(phone)
                if (canonical != null) onContinue(canonical)
            },
            enabled = canContinue,
            variant = ShomaraButtonVariant.Primary,
        )
        ShomaraButton(
            text = ShomaraOnboardingStrings.Back,
            onClick = onBack,
            variant = ShomaraButtonVariant.Ghost,
        )
    }
}
