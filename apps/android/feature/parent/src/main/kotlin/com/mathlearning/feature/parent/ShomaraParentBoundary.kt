package com.mathlearning.feature.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
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
    // F-03a: the gate state is Compose state, not a plain var — a plain var never
    // recomposes the screen, so a lockout or a failure never repainted the gate.
    var state: ShomaraParentGateState by mutableStateOf(ShomaraParentGateState.Idle)
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

/** Local label for the gate's back action (F-23): the string lives in this file because a
 * cross-feature import (parent <- onboarding strings) is forbidden. */
private const val ParentGateBackLabel: String = "بازگشت"

@Composable
fun ShomaraParentGateScreen(
    gate: ShomaraParentGate,
    onAuthenticated: () -> Unit,
    modifier: Modifier = Modifier,
    // F-03b: the default clock is the real clock. The old default (0L) froze every lockout
    // until process death: `nowMs < untilMs` was true forever for any lockout set after boot.
    nowMs: () -> Long = { System.currentTimeMillis() },
    // F-23: an on-screen way back to the child shell — system Back alone is not an affordance.
    onBack: (() -> Unit)? = null,
) {
    var passcode by remember { mutableStateOf("") }
    // Stage 4, family 15 guardian: calm, textual, preferred 24dp inset.
    // The gate logic is untouched: fail-closed, verifier == null can
    // never authenticate, and no bypass is added here.
    // Batch 2: the column scrolls, so a 200%-font gate can never clip the
    // entry button below the fold on a short window.
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(ShomaraTokens.Space24), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = "بخش والدین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
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
            // F-03c: an empty submission used to burn one of the three attempts (and, with
            // a null verifier, lock the gate). The button is disabled until something is typed.
            enabled = passcode.isNotBlank(),
            // Batch 2: the primary entry action is full-width like every
            // other primary CTA in the app.
            modifier = Modifier.fillMaxWidth(),
        )
        if (onBack != null) {
            ShomaraButton(
                text = ParentGateBackLabel,
                onClick = onBack,
                variant = ShomaraButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        // Honest lockout rule, stated before any failure happens.
        Text(text = "پس از چند تلاش ناموفق، ورود موقتاً قفل می‌شود.", style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
    }
}

@Composable
fun ShomaraParentHome(
    completedStations: Int,
    totalStations: Int,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Batch 2: the column scrolls (200% font), and the progress summary
    // is the one progress layer of this adult surface — the same real
    // numbers as the text line, rendered as a bar whose TalkBack
    // announcement uses words, never a percentage or a score.
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(ShomaraTokens.Space24), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = "گزارش والدین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        Row(
            modifier = Modifier.fillMaxWidth()
                // Batch 2 (ADR-0040 R1): the summary card is the one
                // Featured surface of this viewport.
                .shadow(ShomaraClay.specFor(ShomaraClayDepth.Featured).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
                // F-31: the card carries its hairline border like every other surface card —
                // a shadow without a border reads as a loose patch on the canvas.
                .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
                .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusLg))
                .padding(ShomaraTokens.Space12),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "پیشرفت ثبت‌شده: " + ShomaraDigits.toFa(completedStations) + " از " + ShomaraDigits.toFa(totalStations) + " ایستگاه",
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
            )
        }
        ShomaraProgressBar(
            state = ShomaraProgressState(
                fraction = if (totalStations > 0) completedStations.toFloat() / totalStations.toFloat() else 0f,
            ),
        )
        ShomaraButton(
            text = "خروج از حساب",
            onClick = onSignOut,
            variant = ShomaraButtonVariant.Ghost,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text = "این سطح فقط خلاصهٔ بزرگسالان نشان می‌دهد و محتوای درس کودک را باز نمی‌کند.",
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
        )
    }
}
