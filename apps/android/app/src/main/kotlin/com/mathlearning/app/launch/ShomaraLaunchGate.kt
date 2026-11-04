package com.mathlearning.app.launch

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraSplashScreen
import com.mathlearning.core.designsystem.ShomaraStateSurface
import com.mathlearning.core.model.ShomaraLaunchState
import com.mathlearning.core.model.ShomaraLaunchSurface
import kotlinx.coroutines.delay

/**
 * The launch gate (N08-15): the ONLY place `ShomaraLaunchState` becomes a surface.
 *
 * - `Resolving` → the branded splash (no child-facing screen, no artificial delay);
 * - `Offline` / `Error` → a warm recovery screen with a real retry and an explicit escape;
 * - `NewUser` / `RecoverIncompleteProfile` → onboarding/welcome (reported upward, once);
 * - `RestoringSession` → the authenticated destination (reported upward, once).
 *
 * The gate reports its decision through [onResolved] exactly once per resolved state.
 *
 * A pending `NewUser` start is held back very briefly ([NewUserHandoffMs]) so the branded splash is
 * actually seen on a warm start. This is NOT an artificial delay of the child's work: resolution has
 * already completed, no authenticated surface depends on it, the wait is bounded and single-shot,
 * and it never applies to a connected child.
 */
@Composable
fun ShomaraLaunchGate(
    controller: ShomaraLaunchController,
    onResolved: (ShomaraLaunchState) -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by controller.state.collectAsStateWithLifecycle()
    val retrying by controller.retrying.collectAsStateWithLifecycle()

    // One resolution per process, started from the real entry point.
    LaunchedEffect(Unit) { controller.startOnce() }

    // The splash is a gate, not a destination: hand control upward as soon as resolution ends.
    LaunchedEffect(state) {
        when (ShomaraLaunchRouting.surfaceFor(state)) {
            ShomaraLaunchSurface.Splash, ShomaraLaunchSurface.Recovery -> Unit
            // A verified session is never delayed: the child goes straight to their content.
            ShomaraLaunchSurface.ChildShell -> onResolved(state)
            ShomaraLaunchSurface.Welcome -> {
                delay(NewUserHandoffMs)
                onResolved(state)
            }
        }
    }

    when (ShomaraLaunchRouting.surfaceFor(state)) {
        ShomaraLaunchSurface.Splash -> ShomaraSplashScreen(modifier = modifier)
        ShomaraLaunchSurface.Recovery -> ShomaraLaunchRecoveryScreen(
            state = state,
            retrying = retrying,
            onRetry = controller::retry,
            onStartOver = controller::startOver,
            modifier = modifier,
        )
        // The caller swaps this destination out immediately; rendering the splash meanwhile keeps
        // the frame stable and prevents a blank flash between destinations.
        ShomaraLaunchSurface.Welcome, ShomaraLaunchSurface.ChildShell ->
            ShomaraSplashScreen(modifier = modifier)
    }
}

/**
 * How long the branded splash stays up when the result is "a new child must see the welcome gate".
 *
 * Justification: a warm start resolves `NewUser` in a few milliseconds, so without this the splash
 * would flash for a single frame and read as a glitch. 600 ms is one comfortable beat (below the ~1 s
 * threshold where a wait starts to feel like loading), it is measured from the completed resolution,
 * and it never applies to a child with a verified session.
 */
private const val NewUserHandoffMs: Long = 600

/**
 * Warm recovery surface for `Offline` / `Error` (Stage 1, family 16).
 * Now rendered through the shared ShomaraStateSurface: one title, one
 * body, one warm hint, one primary retry, one ghost escape. Copy and
 * behaviour are unchanged; only the duplicated layout is removed.
 * Two honest actions, never a dead end: retry (real re-resolution) and
 * "start over" (discard the unusable credential and enter the welcome
 * gate). The wording never blames the child and never exposes internal
 * detail.
 */
@Composable
fun ShomaraLaunchRecoveryScreen(
    state: ShomaraLaunchState,
    retrying: Boolean,
    onRetry: () -> Unit,
    onStartOver: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val copy = ShomaraLaunchRecoveryCopy.forState(state)
    ShomaraStateSurface(
        state = if (state == ShomaraLaunchState.Offline) ShomaraEntryState.Offline else ShomaraEntryState.Error,
        title = copy.title,
        body = copy.body,
        hint = copy.hint,
        character = ShomaraCharacter.Main,
        poseId = 1,
        characterSlot = ShomaraCharacterSlot.Lesson,
        retryLabel = copy.retryLabel,
        onRetry = onRetry,
        retrying = retrying,
        secondaryLabel = ShomaraLaunchRecoveryCopy.StartOverLabel,
        onSecondary = onStartOver,
        modifier = modifier,
    )
}

/** Recovery copy per launch failure, kept pure so it is unit-testable. */
object ShomaraLaunchRecoveryCopy {
    const val StartOverLabel: String = "شروع از اول"

    data class Copy(
        val title: String,
        val body: String,
        val hint: String,
        val retryLabel: String,
    )

    fun forState(state: ShomaraLaunchState): Copy = when (state) {
        ShomaraLaunchState.Offline -> Copy(
            title = "به اینترنت وصل نیستیم",
            body = "برای ادامه لازم است یک بار به اینترنت وصل شویم.",
            hint = "شبکه را بررسی کن و دوباره تلاش کنیم.",
            retryLabel = "تلاش دوباره",
        )
        ShomaraLaunchState.Error -> forBackendNotConfigured()
        else -> Copy(
            title = "هنوز آماده نیستیم",
            body = "یک مشکل کوچک پیش آمد و نتوانستیم وارد شویم.",
            hint = "اگر تکرار شد، با «شروع از اول» برمی‌گردیم به ابتدا.",
            retryLabel = "تلاش دوباره",
        )
    }

    /**
     * The backend-configuration failure deserves its own honest explanation: no amount of tapping
     * fixes a build that has no OTP endpoint (ADR-0037 I2), and saying "check your connection" would
     * be a fabrication.
     */
    fun forBackendNotConfigured(): Copy = Copy(
        title = "ورود هنوز پیکربندی نشده",
        body = "این نسخه هنوز به سرویس ورود وصل نیست.",
        hint = "با «شروع از اول» می‌توانی از ابتدا شروع کنی.",
        retryLabel = "تلاش دوباره",
    )
}