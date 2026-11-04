package com.mathlearning.feature.onboarding

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraOtpInput
import com.mathlearning.core.designsystem.ShomaraOtpState
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
    androidx.compose.runtime.LaunchedEffect(holder.flow.step) {
        onStepRoute(holder.flow.stepRoute())
    }
    androidx.compose.runtime.LaunchedEffect(Unit) { holder.restoreDraft() }
    androidx.compose.foundation.layout.Column(
        modifier = modifier.fillMaxSize().padding(ShomaraTokens.Space16),
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        if (simulatedAuth) {
            ShomaraFeedbackBanner(
                kind = ShomaraFeedbackKind.Recovery,
                text = ShomaraSimulatedAuth.DevelopmentModeBanner,
            )
        }
        holder.banner?.let { ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Retry, text = it) }
        when (holder.flow.step) {
            OnboardingStep.Welcome -> ShomaraWelcomeScreen(onStart = holder::continueFromWelcome)
            OnboardingStep.PhoneInput -> ShomaraPhoneScreen(
                phone = holder.phone,
                onPhoneChange = { holder.phone = it },
                onContinue = { scope.launch { holder.requestOtp() } },
                onBack = { holder.back() },
            )
            OnboardingStep.OtpVerify -> {
                if (simulatedAuth) {
                    Text(
                        text = ShomaraSimulatedAuth.DevelopmentCodeHint,
                        style = ShomaraTypography.Body,
                        color = ShomaraTokens.ColorInk2,
                    )
                }
                ShomaraOtpInput(state = holder.otp, onStateChange = { holder.otp = it })
                ShomaraButton(
                    text = "تأیید کد",
                    onClick = { scope.launch { holder.verifyOtp() } },
                    enabled = holder.otp.isComplete && !holder.otpBusy,
                    loading = holder.otpBusy,
                    variant = ShomaraButtonVariant.Primary,
                )
                ShomaraButton(text = "بازگشت", onClick = { holder.back() }, variant = ShomaraButtonVariant.Ghost)
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
