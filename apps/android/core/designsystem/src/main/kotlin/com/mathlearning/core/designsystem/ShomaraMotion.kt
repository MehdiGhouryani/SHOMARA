package com.mathlearning.core.designsystem

/**
 * N08-04 motion contract.
 *
 * The Native client deliberately ships almost no decorative motion: there is no `animate*AsState`,
 * no `AnimatedVisibility`, no infinite celebration transition anywhere in `apps/android`. The REAL
 * motion that does exist is the indeterminate progress indicator, and — like every Compose
 * `rememberInfiniteTransition` — it ignores the platform animator duration scale unless the app
 * checks it. That is the defect this task fixes.
 *
 * Two independent signals reduce motion, and either one is sufficient:
 *  1. the child/guardian preference persisted in settings (`reducedMotion`), and
 *  2. the system-wide "Remove animations" / animator duration scale = 0 setting.
 *
 * Reduced motion never removes INFORMATION — it removes MOVEMENT. A determinate bar keeps showing
 * its fraction, an indeterminate bar becomes a static placeholder, and every state label stays.
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