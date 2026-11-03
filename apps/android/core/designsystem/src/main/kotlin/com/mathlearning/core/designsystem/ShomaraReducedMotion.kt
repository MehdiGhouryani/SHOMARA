package com.mathlearning.core.designsystem

import android.provider.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext

/**
 * The effective reduced-motion flag for the whole composition (N08-04).
 *
 * Provided once by [ShomaraTheme] from the real system animator scale merged with the persisted
 * child preference, so components never read platform settings themselves and never have to
 * duplicate the merge rule.
 */
val LocalShomaraReducedMotion = staticCompositionLocalOf { false }

/**
 * Reads the system animator duration scale ("Remove animations" / Developer options) and combines
 * it with the caller's user preference. Reading it here keeps a single source of truth; the value
 * is fixed for the composition's lifetime because the activity is recreated when the system
 * setting changes on modern Android.
 *
 * A null context or an unreadable setting yields null, which [ShomaraMotionLogic.resolveReducedMotion]
 * treats as "not off" — we never disable motion speculatively.
 */
@Composable
fun rememberSystemReducedMotion(userPreference: Boolean): Boolean {
    val context = LocalContext.current
    val systemScale = remember(context) {
        runCatching {
            Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE)
        }.getOrNull()
    }
    return ShomaraMotionLogic.resolveReducedMotion(userPreference, systemScale)
}