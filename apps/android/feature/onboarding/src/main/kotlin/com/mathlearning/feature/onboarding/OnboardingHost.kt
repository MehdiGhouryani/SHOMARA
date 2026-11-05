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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
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
 * R-13 — the banner carries its kind with its text. The kind used to be re-derived from the
 * text by string equality with BackendNotConfigured, so a canonical-text change would have
 * silently flipped an Error banner into a Retry banner. The error class decides the kind
 * at the site that creates the banner; nothing re-derives it from the text afterwards.
 * (F-19: a backend-configuration failure is an Error — retrying cannot fix an unconfigured
 * service, and a Retry banner would invite the user to try again forever.)
 */
data class ShomaraBanner(
    val kind: ShomaraFeedbackKind,
    val text: String,
) {
    companion object {
        fun error(text: String): ShomaraBanner = ShomaraBanner(ShomaraFeedbackKind.Error, text)
        fun retry(text: String): ShomaraBanner = ShomaraBanner(ShomaraFeedbackKind.Retry, text)
        fun recovery(text: String): ShomaraBanner = ShomaraBanner(ShomaraFeedbackKind.Recovery, text)
    }
}

/**
 * R-09 — process-death restore clamp (pure, JVM-tested). Only the phone and the step are
 * saved — the OTP code is never saved. A restored step must be one the user can actually
 * continue from: OtpVerify clamps to PhoneInput (the code cannot be recovered), and
 * ProfileSetup/GradePlacement clamp to PhoneInput too — they are re-entered through the
 * existing draft-resume path (restoreDraft advances to ProfileSetup when a resumable draft
 * exists), never by restoring the step directly (restoring GradePlacement would also make
 * restoreDraft step backwards and throw). Complete clamps to Welcome.
 */
object ShomaraOnboardingRestore {
    fun clampStep(step: OnboardingStep): OnboardingStep = when (step) {
        OnboardingStep.Welcome -> OnboardingStep.Welcome
        OnboardingStep.PhoneInput -> OnboardingStep.PhoneInput
        OnboardingStep.OtpVerify,
        OnboardingStep.ProfileSetup,
        OnboardingStep.GradePlacement -> OnboardingStep.PhoneInput
        OnboardingStep.Complete -> OnboardingStep.Welcome
    }

    /** Save format: [phone, step-name] — a plain string list the saved-state registry stores. */
    fun encode(phone: String, step: OnboardingStep): List<String> = listOf(phone, step.name)

    /** Unknown or malformed saves fall back to an empty phone at the welcome gate. */
    fun decode(saved: List<String>): Pair<String, OnboardingStep> {
        // Fail-closed: a missing or unknown step means the whole restore is
        // discarded — a saved phone must never survive into a step it does not
        // belong to (the phone alone is not a valid restore).
        val step = saved.getOrNull(1)?.let { name ->
            runCatching { OnboardingStep.valueOf(name) }.getOrNull()
        } ?: return "" to OnboardingStep.Welcome
        return saved.getOrNull(0).orEmpty() to clampStep(step)
    }
}

/**
 * R-10 (option a) — the bar counts COMPLETED steps, never the step being entered. Entering
 * PhoneInput announces nothing completed (0); OtpVerify means the phone step is done (0.25);
 * ProfileSetup means phone + OTP are done (0.5); GradePlacement means phone + OTP + profile
 * are done (0.75). The old fractions announced a quarter/half/three-quarters the moment a
 * step was ENTERED, before anything in it was done — and the 0.875 for placement (F-06) is
 * superseded by this completed-count rule. Welcome and Complete show no bar. Pure, JVM-tested.
 * (Option b — a positional «مرحلهٔ N از M» announcement — needs new canonical text and stays
 * an owner decision.)
 */
object ShomaraOnboardingProgress {
    fun fractionFor(step: OnboardingStep): Float? = when (step) {
        OnboardingStep.PhoneInput -> 0f
        OnboardingStep.OtpVerify -> 0.25f
        OnboardingStep.ProfileSetup -> 0.5f
        OnboardingStep.GradePlacement -> 0.75f
        OnboardingStep.Welcome, OnboardingStep.Complete -> null
    }
}

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
    var banner by mutableStateOf<ShomaraBanner?>(null)
    var profileDraft by mutableStateOf(ShomaraProfileDraft())
    var saveState by mutableStateOf(ShomaraProfileSaveState(profileDraft))
    var placement by mutableStateOf(ShomaraPlacementState())

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
            banner = ShomaraBanner.retry(ShomaraAuthErrorMessages.forPhoneInput())
            return
        }
        val active = session
        if (active == null) {
            banner = ShomaraBanner.error(ShomaraAuthErrorMessages.BackendNotConfigured)
            return
        }
        otpBusy = true
        banner = null
        try {
            when (val outcome = active.requestOtp(canonical)) {
                is RequestOutcome.Sent -> flow = flow.advanceTo(OnboardingStep.OtpVerify)
                is RequestOutcome.Throttled -> banner = ShomaraBanner.retry("کمی صبر کن؛ ${com.mathlearning.core.designsystem.ShomaraDigits.toFa((outcome.remainingMs / 1000).toInt())} ثانیه تا تلاش بعد.")
                is RequestOutcome.Failed -> banner = bannerFor(outcome.failure)
            }
        } finally {
            otpBusy = false
        }
    }

    /**
     * N08-15: the backend-configuration failure is surfaced with its own message. The real API
     * reports it as `InvalidRequest` with a "not configured" detail, which would otherwise be
     * rendered as "check your information" — misleading, because no input can fix it.
     * R-13: the banner KIND is decided here, with the message — never re-derived from the
     * text by string equality afterwards.
     */
    private fun bannerFor(failure: com.mathlearning.core.network.ShomaraNetworkFailure): ShomaraBanner =
        if (failure.error == com.mathlearning.core.network.ShomaraNetworkError.InvalidRequest &&
            failure.detail.contains("not configured", ignoreCase = true)
        ) {
            ShomaraBanner.error(ShomaraAuthErrorMessages.BackendNotConfigured)
        } else {
            ShomaraBanner.retry(failure.userMessage())
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
                    banner = bannerFor(outcome.failure)
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

    /**
     * #100 — the profile save is honest: the success state is set ONLY after the draft write
     * completes. The write is awaited inside this function (it used to be a separate call the
     * host made first, while this function marked success and advanced in the same breath —
     * so the «ذخیره شد» banner could never be seen). On a write failure the user stays on
     * the profile step with the failure banner and can retry — the flow never advances on
     * a failed save. (A null draft store means no persistence is configured — tests and
     * store-less hosts — so there is no write to wait for; production always passes a store.)
     */
    suspend fun saveProfile(onComplete: () -> Unit) {
        if (!saveState.canSubmit) return
        saveState = saveState.startSave()
        try {
            persistDraft()
        } catch (throwable: Throwable) {
            saveState = saveState.onSaveFailure()
            return
        }
        saveState = saveState.onSaveSuccess()
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
): ShomaraOnboardingStateHolder = rememberSaveable(
    session,
    draftStore,
    // F-26: the typed phone survives process death — the holder is state, not a plain
    // remember, and the Saver persists only the phone (never the OTP code: a code must
    // never be restored across death). The session/store are constructor inputs, not
    // saved values, so restore rebuilds the holder around the same live inputs.
    // R-09: the Saver now persists the step too (phone + step), and restore clamps it
    // through ShomaraOnboardingRestore — OtpVerify falls back to PhoneInput, and
    // ProfileSetup/GradePlacement are re-entered through the draft-resume path, never
    // restored directly. The OTP is still never saved.
    saver = Saver(
        save = { holder -> ShomaraOnboardingRestore.encode(holder.phone, holder.flow.step) },
        restore = { saved ->
            val (savedPhone, savedStep) = ShomaraOnboardingRestore.decode(saved)
            ShomaraOnboardingStateHolder(session = session, draftStore = draftStore)
                .also {
                    it.phone = savedPhone
                    it.flow = it.flow.advanceTo(savedStep)
                }
        },
    ),
) { ShomaraOnboardingStateHolder(session = session, draftStore = draftStore) }

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
        // R-13: the banner carries its kind with its text — the kind is decided where the
        // banner is created (see ShomaraBanner), never re-derived from the text here.
        holder.banner?.let { ShomaraFeedbackBanner(kind = it.kind, text = it.text) }
        // Duolingo principle (progress as a first-class surface; INSPIRATION_GUARDRAILS adopt
        // list): a calm canonical bar shows onboarding position. Welcome is the gate — no bar.
        // R-10 (option a): the fraction counts COMPLETED steps (0 on entering PhoneInput).
        ShomaraOnboardingProgress.fractionFor(holder.flow.step)?.let { fraction ->
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
                        // F-41a: the number is shown in its canonical 09-form, not the raw
                        // typed input — a +98-prefixed entry used to read back differently
                        // from what the user typed, and the code went to the canonical form.
                        val shownPhone = ShomaraPhoneLogic.canonical(holder.phone) ?: holder.phone
                        Text(
                            text = "${ShomaraOtpStepStrings.SentToPrefix} $shownPhone ${ShomaraOtpStepStrings.SentToSuffix}",
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
                // #100: the write is awaited inside saveProfile — success is only marked
                // after it completes, and the flow advances only on success.
                onSave = {
                    scope.launch {
                        holder.saveProfile(onComplete = {})
                    }
                },
            )
            OnboardingStep.GradePlacement -> ShomaraPlacementScreen(
                state = holder.placement,
                // #88: the skip is a product/DEBUG affordance, gated behind the same flag as
                // simulatedAuth (true only in a DEBUG build). In release the placement
                // screen renders no skip button at all — no dead affordance, no bypass.
                onSkip = if (simulatedAuth) {
                    { holder.skipPlacement(); onAuthenticated() }
                } else {
                    null
                },
                // #100: the save confirmation is carried to the step the user lands on —
                // the profile step itself advances immediately on success, so this is
                // where the «ذخیره شد» banner is actually seen (and TalkBack hears it once).
                savedAnnouncement = holder.saveState.announcement().takeIf { holder.saveState.saved },
            )
            OnboardingStep.Complete -> onAuthenticated()
        }
    }
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
