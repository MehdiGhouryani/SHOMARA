package com.mathlearning.feature.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * Parent boundary (N05-06 / family 15 «guardian جدا از shell»): the parent surface is reachable
 * ONLY through adult re-authentication; while unauthenticated it renders zero child content.
 */
sealed class ShomaraParentGateState {
    data object Idle : ShomaraParentGateState()
    data class Verifying(val attempt: Int) : ShomaraParentGateState()
    data object Authenticated : ShomaraParentGateState()
    data class LockedOut(val untilMs: Long) : ShomaraParentGateState()
    data class Failed(val attempt: Int, val message: String) : ShomaraParentGateState()
}

/**
 * Pure gate reducer, fail-closed by construction:
 *  - the passcode check is delegated to a caller-provided verifier (the app wires the real
 *    credential check; the gate itself never trusts a missing verifier — a null verifier can
 *    never authenticate);
 *  - three consecutive failures trigger a cooldown lockout;
 *  - authentication is a state, not a boolean leaked across the child shell.
 */
class ShomaraParentGate(
    private val verifier: ((String) -> Boolean)?,
    private val maxFailures: Int = 3,
    private val lockoutMs: Long = 60_000L,
) {
    var state: ShomaraParentGateState = ShomaraParentGateState.Idle
        private set
    var failures: Int = 0
        private set

    fun canEnter(): Boolean = state is ShomaraParentGateState.Authenticated

    fun verify(passcode: String, nowMs: Long): ShomaraParentGateState {
        val locked = state as? ShomaraParentGateState.LockedOut
        if (locked != null) {
            if (nowMs < locked.untilMs) return state
            state = ShomaraParentGateState.Idle
        }
        if (state is ShomaraParentGateState.Verifying) return state
        if (verifier == null) {
            // Fail-closed: no credential checker wired → entry impossible.
            failures += 1
            return lockOrFail("ورود والدین هنوز پیکربندی نشده است.", nowMs)
        }
        state = ShomaraParentGateState.Verifying(failures + 1)
        return if (verifier.invoke(passcode)) {
            failures = 0
            state = ShomaraParentGateState.Authenticated
            state
        } else {
            failures += 1
            lockOrFail("گذرواژه درست نیست؛ دوباره تلاش کن.", nowMs)
        }
    }

    private fun lockOrFail(message: String, nowMs: Long): ShomaraParentGateState =
        if (failures >= maxFailures) {
            state = ShomaraParentGateState.LockedOut(untilMs = nowMs + lockoutMs)
            state
        } else {
            state = ShomaraParentGateState.Failed(failures, message)
            state
        }

    fun reset() {
        state = ShomaraParentGateState.Idle
        failures = 0
    }
}

/** Adult-only surface contract: sections the parent home may render (no child lesson content). */
object ShomaraParentSurfaceContract {
    val AllowedSections: List<String> = listOf(
        "progress-report",
        "settings",
        "sign-out",
    )

    fun isAllowed(section: String): Boolean = section in AllowedSections
}

@Composable
fun ShomaraParentGateScreen(
    gate: ShomaraParentGate,
    onAuthenticated: () -> Unit,
    modifier: Modifier = Modifier,
    nowMs: () -> Long = { 0L },
) {
    var passcode by remember { mutableStateOf("") }
    Column(modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Text(text = "بخش والدین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "این بخش برای بزرگ‌ترهاست؛ لطفاً گذرواژه را وارد کن.")
        when (val state = gate.state) {
            is ShomaraParentGateState.Failed -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = state.message)
            is ShomaraParentGateState.LockedOut -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "چند لحظه صبر کن و دوباره تلاش کن.")
            else -> {}
        }
        ShomaraTextField(
            value = passcode,
            onValueChange = { passcode = it },
            label = "گذرواژه والدین",
            numericLtr = true,
            modifier = Modifier.fillMaxWidth(),
        )
        ShomaraButton(
            text = "ورود",
            onClick = {
                when (gate.verify(passcode = passcode, nowMs = nowMs())) {
                    is ShomaraParentGateState.Authenticated -> onAuthenticated()
                    else -> {}
                }
            },
            variant = ShomaraButtonVariant.Primary,
        )
    }
}

@Composable
fun ShomaraParentHome(
    completedStations: Int,
    totalStations: Int,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Text(text = "گزارش والدین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        Row(
            modifier = Modifier.fillMaxWidth().background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg)).padding(ShomaraTokens.Space12),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "پیشرفت ثبت‌شده: " + ShomaraDigits.toFa(completedStations) + " از " + ShomaraDigits.toFa(totalStations) + " ایستگاه",
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
            )
        }
        ShomaraButton(
            text = "خروج از حساب",
            onClick = onSignOut,
            variant = ShomaraButtonVariant.Ghost,
        )
        Text(
            text = "این سطح فقط خلاصهٔ بزرگسالان نشان می‌دهد و محتوای درس کودک را باز نمی‌کند.",
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
        )
    }
}
