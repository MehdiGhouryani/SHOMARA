package com.mathlearning.core.designsystem

import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable

/**
 * N08-05 back-gesture contract.
 *
 * Before this existed, `apps/android` had ZERO `BackHandler` registrations: system back popped the
 * navigation stack unconditionally, so a child could destroy their place in a lesson with an
 * accidental gesture even though the on-screen exit button asked for confirmation. Two behaviours
 * shipped from the same button and disagreed.
 *
 * The decision is kept in a pure object so it is testable on the JVM; the composable is a thin
 * wrapper. [enabled] = false intentionally lets the platform handle back (e.g. when there is
 * nothing to protect).
 */
object ShomaraBackLogic {
    /**
     * Whether the screen must consume the back gesture.
     *
     * A screen with unsaved work consumes back so it can confirm; a screen with nothing to lose
     * lets the system pop it normally (back must never feel broken).
     */
    fun shouldIntercept(hasUnsavedWork: Boolean): Boolean = hasUnsavedWork

    /**
     * What a consume should do on a second press. Returning false means "let the platform exit" —
     * used for the deliberate double-back escape hatch so a user is never trapped by a bug.
     */
    fun allowExitOnSecondBack(alreadyAsked: Boolean): Boolean = alreadyAsked
}

/**
 * Registers the back gesture with an explicit, testable policy.
 *
 * @param enabled when false the platform handles back (nothing to protect on this screen)
 * @param onBack invoked when the gesture is consumed
 */
@Composable
fun shomaraBackHandler(
    enabled: Boolean = true,
    onBack: () -> Unit,
) {
    BackHandler(enabled = enabled, onBack = onBack)
}