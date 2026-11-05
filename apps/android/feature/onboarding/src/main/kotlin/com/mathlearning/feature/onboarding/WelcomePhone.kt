package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
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

    /** N08-15 DEBUG simulation affordance; the label names itself so it is never read as real SMS. */
    const val SimulationSkip: String = "عبور آزمایشی (حالت توسعه)"
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
    // Duolingo welcome structure (ADR-0039 structure copy, ADR-0040): a
    // breathing content zone centred in the upper area — character, title and
    // one line of body — with ONE primary CTA anchored at the bottom, always
    // reachable without scrolling, never floating mid-screen. No text changed
    // here: the canonical welcome wording is still DRAFT (see
    // design/playbook/CANONICAL_TEXTS_DRAFT_FA.md) and needs owner approval.
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterVertically),
        ) {
            // Family 01 (Stage 1): a small, static character — Lesson slot (84dp),
            // not the 180dp Hero. The hero of this screen is the welcome
            // message and the single CTA, not the artwork.
            ShomaraCharacterImage(
                character = ShomaraCharacter.Main,
                poseId = 1,
                slot = ShomaraCharacterSlot.Lesson,
                decorative = true,
            )
            Text(
                text = title,
                style = ShomaraTypography.Display,
                color = ShomaraTokens.ColorInk,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = body,
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
                textAlign = TextAlign.Center,
            )
        }
        ShomaraButton(
            text = ShomaraOnboardingStrings.Continue,
            onClick = onStart,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
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
    /** DEBUG simulation only (N08-15); null in release, so the button never renders there. */
    simulatedSkip: (() -> Unit)? = null,
) {
    // Batch 2: the error is shown only once the user has typed something.
    // Before, an empty field showed the invalid-format error on first
    // paint — the child was told the number was wrong before typing a
    // digit. The validation itself is untouched (ShomaraPhoneLogic still
    // decides validity, and the CTA still stays disabled until valid).
    val error = if (phone.isBlank()) null else ShomaraPhoneLogic.validationError(phone)
    val canContinue = ShomaraPhoneLogic.isValid(phone)
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // Section header above the card; the field keeps its own persistent label inside.
            // Batch 2: the section title is a TalkBack heading, like every
            // other screen title in the flow.
            Text(text = title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            ShomaraCard {
                Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
                    Text(text = ShomaraOnboardingStrings.WelcomeBody, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
                    ShomaraTextField(
                        value = phone,
                        onValueChange = onPhoneChange,
                        label = title,
                        hint = ShomaraOnboardingStrings.PhoneHint,
                        errorText = error,
                        numericLtr = true,
                    )
                }
            }
        }
        ShomaraButton(
            text = ShomaraOnboardingStrings.Continue,
            onClick = {
                val canonical = ShomaraPhoneLogic.canonical(phone)
                if (canonical != null) onContinue(canonical)
            },
            enabled = canContinue,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
        ShomaraButton(
            text = ShomaraOnboardingStrings.Back,
            onClick = onBack,
            variant = ShomaraButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        // DEBUG simulation only; never rendered in release builds (simulatedAuth stays false).
        if (simulatedSkip != null) {
            ShomaraButton(
                text = ShomaraOnboardingStrings.SimulationSkip,
                onClick = simulatedSkip,
                variant = ShomaraButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
