package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraOtpInput
import com.mathlearning.core.designsystem.ShomaraTokens

/**
 * Copy for the redesigned OTP step (seed strings; canonical-source overrides arrive with CMS).
 * Internal so ShomaraOnboardingA11y's traversal contract references these exact labels instead
 * of duplicating them.
 */
internal object ShomaraOtpStepStrings {
    const val Title: String = "کد تأیید را وارد کن"
    const val SentToPrefix: String = "کد تأیید برای"
    const val SentToSuffix: String = "ارسال شد"
    const val Confirm: String = "تأیید کد"
    const val Resend: String = "ارسال دوباره کد"
    const val Paste: String = "چسباندن کد از حافظه"
    const val Back: String = "بازگشت"
    const val FillSimulationCode: String = "پر کردن کد آزمایشی و ادامه"
    const val SimulationSkip: String = "عبور آزمایشی (حالت توسعه)"
}

/**
 * Numeric keypad for the OTP step (ShomaraOtpInput owns no input mechanism of its own). The grid
 * is forced LTR so the digit keys sit in the same left-to-right order the OTP cells fill
 * (MASTER §6 / COMPONENT_READINESS OTP): 1..9, then ⌫ and 0. Every key is a canonical
 * ShomaraButton, so key height stays a 56dp MINIMUM above the 48dp touch floor and grows at
 * 200% font scale instead of clipping.
 */
@Composable
internal fun ShomaraOtpKeypad(
    onDigit: (Int) -> Unit,
    onBackspace: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Column(
            modifier = modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        ) {
            listOf(listOf(1, 2, 3), listOf(4, 5, 6), listOf(7, 8, 9)).forEach { rowDigits ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                ) {
                    rowDigits.forEach { digit ->
                        ShomaraButton(
                            text = digit.toString(),
                            onClick = { onDigit(digit) },
                            modifier = Modifier.weight(1f),
                            variant = ShomaraButtonVariant.Secondary,
                            enabled = enabled,
                        )
                    }
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            ) {
                ShomaraButton(
                    text = "⌫",
                    onClick = onBackspace,
                    modifier = Modifier.weight(1f),
                    variant = ShomaraButtonVariant.Ghost,
                    enabled = enabled,
                )
                ShomaraButton(
                    text = "0",
                    onClick = { onDigit(0) },
                    modifier = Modifier.weight(1f),
                    variant = ShomaraButtonVariant.Secondary,
                    enabled = enabled,
                )
                Spacer(modifier = Modifier.weight(1f))
            }
        }
    }
}
