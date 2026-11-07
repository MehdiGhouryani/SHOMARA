package com.mathlearning.core.designsystem

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import kotlin.math.sqrt

/**
 * N08-04 motion contract.
 *
 * The Native client deliberately ships no DECORATIVE motion: no `AnimatedVisibility`, no infinite
 * celebration transition, no ambient looping animation anywhere in `apps/android`. The REAL motion
 * that does exist is the indeterminate progress indicator, and — like every Compose
 * `rememberInfiniteTransition` — it ignores the platform animator duration scale unless the app
 * checks it. That is the defect this task fixes.
 *
 * N08R-01 adds the one functional motion layer the Duolingo-level interaction contract asks for:
 * press feedback (`shomaraPressScale`). It is interaction feedback, not decoration — it tells the
 * child the touch registered — and it obeys the same reduced-motion rule as everything else.
 *
 * Two independent signals reduce motion, and either one is sufficient:
 *  1. the child/guardian preference persisted in settings (`reducedMotion`), and
 *  2. the system-wide "Remove animations" / animator duration scale = 0 setting.
 *
 * Reduced motion never removes INFORMATION — it removes MOVEMENT. A determinate bar keeps showing
 * its fraction, an indeterminate bar becomes a static placeholder, every state label stays, and a
 * press feedback becomes an instant state cut instead of a spring.
 */
object ShomaraMotionLogic {
    /** System animator duration scale that means "animations off" (Developer options / A11y). */
    const val AnimationsOffScale: Float = 0f

    /**
     * Resolves the effective reduced-motion flag. A null/unknown system scale cannot be treated as
     * "off" (that would silently hide motion the user wants), so only an explicit 0 disables.
     */
    fun resolveReducedMotion(userPreference: Boolean, systemAnimatorScale: Float?): Boolean =
        userPreference || systemAnimatorScale == AnimationsOffScale

    /** Duration in ms for a token-derived base duration; reduced motion collapses it to 0 (a cut). */
    fun durationMs(baseMs: Int, reduced: Boolean): Int {
        require(baseMs >= 0) { "duration must be non-negative" }
        return if (reduced) 0 else baseMs
    }

    /** Whether a transition may run at all. Reduced motion means a state change, not a tween. */
    fun shouldAnimate(reduced: Boolean): Boolean = !reduced

    /** The shared-element/motion duration used by screens (base token, not a magic number). */
    fun transitionMs(reduced: Boolean): Int =
        durationMs(ShomaraTokens.MotionDurationBase, reduced)

    fun fastMs(reduced: Boolean): Int = durationMs(ShomaraTokens.MotionDurationFast, reduced)
    fun slowMs(reduced: Boolean): Int = durationMs(ShomaraTokens.MotionDurationSlow, reduced)
}

/**
 * N08-04 «no concurrent celebration transition».
 *
 * A celebration (correct-answer flourish, station-complete moment) must be a single owned
 * sequence. Starting a second one while the first is running CANCELS the first instead of
 * stacking two overlapping animations on the same surface — the stacked version is what produces
 * the jarring double-bounce in the reference apps.
 *
 * This is a pure state machine so the rule is testable without a device; the composable layer
 * only reads [activeId].
 */
class ShomaraCelebrationGate {
    /** Id of the celebration currently owning the surface, if any. */
    var activeId: String? = null
        private set

    /** Starts a celebration; returns the id that now owns the surface (cancelling any previous). */
    fun begin(id: String): String {
        require(id.isNotEmpty()) { "celebration id must not be empty" }
        activeId = id
        return id
    }

    /** Ends a celebration only if it still owns the surface (stale completions are ignored). */
    fun end(id: String): Boolean {
        if (activeId != id) return false
        activeId = null
        return true
    }

    /** Concurrent celebrations are impossible by construction. */
    fun concurrentCount(): Int = if (activeId == null) 0 else 1
}

/**
 * N08R-01 press feedback — the "juicy" tactile layer, restrained to interaction response.
 *
 * The spring parameters come from the canonical motion tokens, not from literals:
 * `MotionSpringStiffness`/`MotionSpringDamping`/`MotionSpringMass` (220/14/1) are physical
 * spring quantities, so the Compose damping ratio is derived as c / 2·√(k·m) ≈ 0.47 — a small,
 * contained bounce (juicy but never rubbery), and the scale target is `MotionPressScale` (0.96).
 * Under reduced motion the state change is an instant cut (`snap`), never a tween — the same
 * rule every other motion consumer follows.
 */
object ShomaraPressFeedbackLogic {
    /** Compose spring stiffness for press feedback: the token stiffness, verbatim. */
    fun stiffness(): Float = ShomaraTokens.MotionSpringStiffness.toFloat()

    /** Compose damping ratio derived from the token physical spring (c / 2·√(k·m)). */
    fun dampingRatio(): Float =
        (ShomaraTokens.MotionSpringDamping /
            (2.0 * sqrt(ShomaraTokens.MotionSpringStiffness.toDouble() * ShomaraTokens.MotionSpringMass))).toFloat()

    /** Pressed scale target from the token (0.96); resting scale is always exactly 1. */
    fun pressedScale(): Float = ShomaraTokens.MotionPressScale.toFloat()
}

/**
 * Spring-animated tactile press scale for any tactile surface. Press compresses the surface
 * toward `MotionPressScale` and release settles it back with the token spring — like a soft
 * object with mass, never a linear flip. Under reduced motion the same boolean drives an
 * instant cut, so the INFORMATION (pressed state) survives without the MOVEMENT.
 */
@Composable
fun Modifier.shomaraPressScale(pressed: Boolean, reducedMotion: Boolean): Modifier {
    val target = if (pressed) ShomaraPressFeedbackLogic.pressedScale() else 1f
    val scale by animateFloatAsState(
        targetValue = target,
        animationSpec = if (reducedMotion) {
            snap()
        } else {
            spring(
                dampingRatio = ShomaraPressFeedbackLogic.dampingRatio(),
                stiffness = ShomaraPressFeedbackLogic.stiffness(),
            )
        },
        label = "shomaraPressScale",
    )
    return graphicsLayer { scaleX = scale; scaleY = scale }
}