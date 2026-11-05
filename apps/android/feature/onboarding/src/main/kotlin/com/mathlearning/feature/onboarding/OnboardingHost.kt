package com.mathlearning.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraOtpInput
import com.mathlearning.core.designsystem.ShomaraOtpState
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import kotlinx.coroutines.launch

/**
 * Holder for the whole onboarding journey (N04-07): one plain state holder drives the real
 * navigation host. Network calls go through [ShomaraAuthSession]; every negative path lands in
 * a warm banner and never advances the flow.
 */
class ShomaraOnboardingStateHolder(
    val session: ShomaraAuthSession?,
    private val draftStore: com.mathlearning.core.datastore.ShomaraProfileDraftStore? = null,
) {
    var flow by mutableStateOf(ShomaraOnboardingFlow())
    var phone by mutableStateOf("")
    var otp by mutableStateOf(ShomaraOtpState.empty(OTP_LENGTH))
    var otpBusy by mutableStateOf(false)
    var banner by mutableStateOf<String?>(null)
    var profileDraft by mutableStateOf(ShomaraProfileDraft())
    var saveState by mutableStateOf(ShomaraProfileSaveState(profileDraft))
    var placement by mutableStateOf(ShomaraPlacementState())
    var resumedFromDraft by mutableStateOf(false)

    /**
     * N04-04 incomplete-profile resume: on start, a saved draft re-enters the profile step with
     * Resume semantics; the draft is cleared once the profile is saved (or signed out).
     */
    suspend fun restoreDraft() {
        val snapshot = draftStore?.read() ?: return
        val draft = runCatching {
            ShomaraProfileDraft(name = snapshot.name, avatarId = snapshot.avatarId, gradeId = snapshot.gradeId)
        }.getOrNull() ?: return
        profileDraft = draft
        saveState = ShomaraProfileSaveState.resumed(draft)
        flow = flow.advanceTo(OnboardingStep.ProfileSetup)
        resumedFromDraft = true
    }

    suspend fun persistDraft() {
        val active = draftStore ?: return
        if (profileDraft.isResumable) active.save(com.mathlearning.core.datastore.ShomaraProfileDraftSnapshot(profileDraft.name, profileDraft.avatarId, profileDraft.gradeId))
        else active.clear()
    }

    suspend fun requestOtp() {
        val canonical = ShomaraPhoneLogic.canonical(phone)
        if (canonical == null) {
            // N08-15: a phone-format problem is the user's input and is reported as such — it is
            // never mixed with a backend/configuration problem (the two classes stay distinct).
            banner = ShomaraAuthErrorMessages.forPhoneInput()
            return
        }
        val active = session
        if (active == null) {
            banner = ShomaraAuthErrorMessages.BackendNotConfigured
            return
        }
        otpBusy = true
        banner = null
        try {
            when (val outcome = active.requestOtp(canonical)) {
                is RequestOutcome.Sent -> flow = flow.advanceTo(OnboardingStep.OtpVerify)
                is RequestOutcome.Throttled -> banner = "کمی صبر کن؛ ${com.mathlearning.core.designsystem.ShomaraDigits.toFa((outcome.remainingMs / 1000).toInt())} ثانیه تا تلاش بعد."
                is RequestOutcome.Failed -> banner = messageFor(outcome.failure)
            }
        } finally {
            otpBusy = false
        }
    }

    /**
     * N08-15: the backend-configuration failure is surfaced with its own message. The real API
     * reports it as `InvalidRequest` with a "not configured" detail, which would otherwise be
     * rendered as "check your information" — misleading, because no input can fix it.
     */
    private fun messageFor(failure: com.mathlearning.core.network.ShomaraNetworkFailure): String =
        if (failure.error == com.mathlearning.core.network.ShomaraNetworkError.InvalidRequest &&
            failure.detail.contains("not configured", ignoreCase = true)
        ) {
            ShomaraAuthErrorMessages.BackendNotConfigured
        } else {
            failure.userMessage()
        }

    suspend fun verifyOtp() {
        val canonical = ShomaraPhoneLogic.canonical(phone) ?: return
        val active = session ?: return
        if (!otp.isComplete) return
        otpBusy = true
        banner = null
        try {
            when (val outcome = active.verifyOtp(canonical, otp.asCode())) {
                is VerifyOutcome.Verified -> flow = flow.advanceTo(OnboardingStep.ProfileSetup)
                is VerifyOutcome.Failed -> {
                    otp = otp.markInvalid()
                    banner = messageFor(outcome.failure)
                }
            }
        } finally {
            otpBusy = false
        }
    }

    fun continueFromWelcome() {
        flow = flow.advanceTo(OnboardingStep.PhoneInput)
    }

    fun back(): Boolean {
        val target = ShomaraBackLogic.backTarget(flow.step) ?: return false
        flow = flow.copy(step = target)
        if (target == OnboardingStep.PhoneInput) otp = ShomaraOtpState.empty(OTP_LENGTH)
        // Re-entering the welcome gate starts clean; a stale throttle/error banner has no
        // meaning on the first gate and only confuses it.
        if (target == OnboardingStep.Welcome) banner = null
        return true
    }

    fun saveProfile(onComplete: () -> Unit) {
        if (!saveState.canSubmit) return
        // Local draft persistence + server profile write arrive with N06/N07 server contracts;
        // the local gate is complete-draft-only and the placement step follows immediately.
        saveState = saveState.startSave().onSaveSuccess()
        flow = flow.advanceTo(OnboardingStep.GradePlacement)
        onComplete()
    }

    fun skipPlacement() {
        placement = ShomaraPlacementState.skip()
        flow = flow.advanceTo(OnboardingStep.Complete)
    }

    /**
     * DEBUG simulation only (N08-15): jumps from the phone step straight to the profile step with
     * no network call and no credential. The only callers are UI affordances gated behind
     * `simulatedAuth`; filling a valid phone keeps every downstream validation honest, and
     * clearing the banner keeps the step the simulation lands on clean.
     */
    fun skipAuthInSimulation() {
        if (phone.isBlank()) phone = "09123456789"
        flow = flow.advanceTo(OnboardingStep.ProfileSetup)
        banner = null
    }

    companion object {
        const val OTP_LENGTH: Int = 4
    }
}

@Composable
fun rememberOnboardingStateHolder(
    session: ShomaraAuthSession?,
    draftStore: com.mathlearning.core.datastore.ShomaraProfileDraftStore? = null,
): ShomaraOnboardingStateHolder = remember { ShomaraOnboardingStateHolder(session = session, draftStore = draftStore) }

/**
 * Real navigation host (N04-07): renders the current onboarding step from the flow state and
 * reports completion upward; the app maps each step to a real navigation route.
 *
 * N08-15: [simulatedAuth] is true only in a DEBUG build. When it is true the journey says so on
 * screen (a development banner plus the fixed development code), so the flow can never be mistaken
 * for a real SMS verification. The flag is data, not a build check inside the composable.
 */
@Composable
fun ShomaraOnboardingHost(
    session: ShomaraAuthSession?,
    onStepRoute: (String) -> Unit,
    onAuthenticated: () -> Unit,
    modifier: Modifier = Modifier,
    draftStore: com.mathlearning.core.datastore.ShomaraProfileDraftStore? = null,
    simulatedAuth: Boolean = false,
) {
    val holder = rememberOnboardingStateHolder(session, draftStore)
    val scope = rememberCoroutineScope()
    val clipboard = LocalClipboardManager.current
    androidx.compose.runtime.LaunchedEffect(holder.flow.step) {
        onStepRoute(holder.flow.stepRoute())
    }
    androidx.compose.runtime.LaunchedEffect(Unit) { holder.restoreDraft() }
    androidx.compose.foundation.layout.Column(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorCanvas)
            .statusBarsPadding()
            .navigationBarsPadding()
            .imePadding()
            .padding(ShomaraTokens.Space16),
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        if (simulatedAuth) {
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = ShomaraSimulatedAuth.DevelopmentModeBanner,
            )
        }
        holder.banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry, text = it) }
        // Duolingo principle (progress as a first-class surface; INSPIRATION_GUARDRAILS adopt
        // list): a calm canonical bar shows onboarding position. Welcome is the gate — no bar.
        stepProgressFraction(holder.flow.step)?.let { fraction ->
            ShomaraProgressBar(state = ShomaraProgressState(fraction = fraction))
        }
        when (holder.flow.step) {
            OnboardingStep.Welcome -> ShomaraWelcomeScreen(onStart = holder::continueFromWelcome)
            OnboardingStep.PhoneInput -> ShomaraPhoneScreen(
                phone = holder.phone,
                onPhoneChange = { holder.phone = it },
                onContinue = { scope.launch { holder.requestOtp() } },
                onBack = { holder.back() },
                simulatedSkip = if (simulatedAuth) holder::skipAuthInSimulation else null,
            )
            OnboardingStep.OtpVerify -> Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                ) {
                    if (simulatedAuth) {
                        Text(
                            text = ShomaraSimulatedAuth.DevelopmentCodeHint,
                            style = ShomaraTypography.Body,
                            color = ShomaraTokens.ColorInk2,
                        )
                    }
                    Text(text = ShomaraOtpStepStrings.Title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
                    if (holder.phone.isNotBlank()) {
                        Text(
                            text = "${ShomaraOtpStepStrings.SentToPrefix} ${holder.phone} ${ShomaraOtpStepStrings.SentToSuffix}",
                            style = ShomaraTypography.Body,
                            color = ShomaraTokens.ColorInk2,
                        )
                    }
                    ShomaraOtpInput(
                        state = holder.otp,
                        onStateChange = { holder.otp = it },
                        enabled = !holder.otpBusy,
                    )
                    ShomaraOtpKeypad(
                        onDigit = { digit -> holder.otp = holder.otp.advance(digit) },
                        onBackspace = { holder.otp = holder.otp.backspace() },
                        enabled = !holder.otpBusy,
                    )
                }
                if (simulatedAuth) {
                    ShomaraButton(
                        text = ShomaraOtpStepStrings.FillSimulationCode,
                        onClick = {
                            holder.otp = ShomaraOtpState.empty(ShomaraOnboardingStateHolder.OTP_LENGTH)
                                .fillFromCode(ShomaraSimulatedAuth.DevelopmentCode)
                            if (holder.session == null) holder.skipAuthInSimulation()
                            else scope.launch { holder.verifyOtp() }
                        },
                        variant = ShomaraButtonVariant.Secondary,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    ShomaraButton(
                        text = ShomaraOtpStepStrings.SimulationSkip,
                        onClick = { holder.skipAuthInSimulation() },
                        variant = ShomaraButtonVariant.Ghost,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                ShomaraButton(
                    text = ShomaraOtpStepStrings.Confirm,
                    onClick = { scope.launch { holder.verifyOtp() } },
                    enabled = holder.otp.isComplete && !holder.otpBusy,
                    loading = holder.otpBusy,
                    variant = ShomaraButtonVariant.Primary,
                    modifier = Modifier.fillMaxWidth(),
                )
                // Stage 1 (family 03): resend reuses the real server request,
                // so the server throttle banner (remaining seconds) IS the
                // cooldown — no client-invented cooldown duration, and the
                // code is never logged. Paste reuses ShomaraOtpState
                // .fillFromCode, which keeps digits in LTR cell order.
                ShomaraButton(
                    text = ShomaraOtpStepStrings.Resend,
                    onClick = { scope.launch { holder.requestOtp() } },
                    enabled = !holder.otpBusy,
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
                ShomaraButton(
                    text = ShomaraOtpStepStrings.Paste,
                    onClick = {
                        val pasted = clipboard.getText()?.text.orEmpty()
                        if (pasted.isNotEmpty()) holder.otp = holder.otp.fillFromCode(pasted)
                    },
                    enabled = !holder.otpBusy,
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
                ShomaraButton(
                    text = ShomaraOtpStepStrings.Back,
                    onClick = { holder.back() },
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            OnboardingStep.ProfileSetup -> ShomaraProfileScreen(
                draft = holder.profileDraft,
                onDraftChange = {
                    holder.profileDraft = it
                    holder.saveState = holder.saveState.copy(draft = it)
                },
                saveState = holder.saveState,
                onSave = {
                    scope.launch {
                        holder.persistDraft()
                        holder.saveProfile(onComplete = {})
                    }
                },
            )
            OnboardingStep.GradePlacement -> ShomaraPlacementScreen(
                state = holder.placement,
                onSkip = { holder.skipPlacement(); onAuthenticated() },
            )
            OnboardingStep.Complete -> onAuthenticated()
        }
    }
}

/** Stable onboarding progress for the canonical bar (Welcome/Complete show none). */
private fun stepProgressFraction(step: OnboardingStep): Float? = when (step) {
    OnboardingStep.PhoneInput -> 0.25f
    OnboardingStep.OtpVerify -> 0.5f
    OnboardingStep.ProfileSetup -> 0.75f
    OnboardingStep.GradePlacement -> 1f
    OnboardingStep.Welcome, OnboardingStep.Complete -> null
}

/** Copy for the redesigned OTP step (seed strings; canonical-source overrides arrive with CMS). */
private object ShomaraOtpStepStrings {
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
private fun ShomaraOtpKeypad(
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
