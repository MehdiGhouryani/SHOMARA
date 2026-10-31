package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription

/**
 * Feedback state matrix: correct/retry/recovery/error (COMPONENT_READINESS Feedback row).
 * AGENTS rule 9: warm, actionable, never scary — the wording defaults mirror the approved
 * Persian character lines and are overridable by the canonical string source.
 */
enum class ShomaraFeedbackKind { Correct, Retry, Recovery, Error }

/** Native canonical seed strings; screens may pass canonical-source overrides. */
object ShomaraFeedbackStrings {
    val Correct: String = "آفرین! درست بود!"
    val Retry: String = "ایراد نداره؛ باز هم امتحان کن!"
    val Recovery: String = "اشکالی نداره؛ با هم دوباره نگاه می‌کنیم!"
    val Error: String = "یک مشکل کوچک پیش آمد؛ دوباره تلاش می‌کنیم."
}

/** Pure feedback mapping — warm tone tokens per kind, fixed geometry, no punitive framing. */
object ShomaraFeedbackLogic {
    fun colorsFor(kind: ShomaraFeedbackKind): Triple<Color, Color, Color> = when (kind) {
        ShomaraFeedbackKind.Correct -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorPrimaryDark)
        ShomaraFeedbackKind.Retry -> Triple(ShomaraTokens.ColorAmberSoft, ShomaraTokens.ColorAmberEdge, ShomaraTokens.ColorAmberInk)
        ShomaraFeedbackKind.Recovery -> Triple(ShomaraTokens.ColorSkySoft, ShomaraTokens.ColorSky, ShomaraTokens.ColorInk)
        ShomaraFeedbackKind.Error -> Triple(ShomaraTokens.ColorDangerSoft, ShomaraTokens.ColorDanger, ShomaraTokens.ColorDanger)
    }

    fun defaultTextFor(kind: ShomaraFeedbackKind): String = when (kind) {
        ShomaraFeedbackKind.Correct -> ShomaraFeedbackStrings.Correct
        ShomaraFeedbackKind.Retry -> ShomaraFeedbackStrings.Retry
        ShomaraFeedbackKind.Recovery -> ShomaraFeedbackStrings.Recovery
        ShomaraFeedbackKind.Error -> ShomaraFeedbackStrings.Error
    }

    /** Non-color status carrier per kind (TalkBack stateDescription). */
    fun stateLabelFor(kind: ShomaraFeedbackKind): String = when (kind) {
        ShomaraFeedbackKind.Correct -> "درست"
        ShomaraFeedbackKind.Retry -> "دوباره تلاش کن"
        ShomaraFeedbackKind.Recovery -> "راهنمایی"
        ShomaraFeedbackKind.Error -> "خطا"
    }

    /** Stable layout: every kind keeps the same fixed banner height. */
    fun bannerHeight(): androidx.compose.ui.unit.Dp = ShomaraTokens.ComponentRowH
}

@Composable
fun ShomaraFeedbackBanner(
    kind: ShomaraFeedbackKind,
    modifier: Modifier = Modifier,
    text: String = ShomaraFeedbackLogic.defaultTextFor(kind),
) {
    val (container, border, content) = ShomaraFeedbackLogic.colorsFor(kind)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraFeedbackLogic.bannerHeight())
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, border, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .padding(ShomaraTokens.Space12)
            .semantics { stateDescription = ShomaraFeedbackLogic.stateLabelFor(kind) },
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = text, style = ShomaraTypography.Body, color = content)
    }
}

/** Progress state matrix: determinate/indeterminate/paused/offline (COMPONENT_READINESS Progress row). */
enum class ShomaraProgressKind { Determinate, Indeterminate, Paused, Offline }

data class ShomaraProgressState(
    val fraction: Float? = null,
    val paused: Boolean = false,
    val offline: Boolean = false,
) {
    init {
        if (fraction != null) require(fraction in 0f..1f) { "fraction must be within 0..1" }
        require(!(paused && offline)) { "paused and offline are exclusive caller states" }
    }
}

/** Persian digit conversion — the project-wide `toFa` convention for user-facing numbers. */
object ShomaraDigits {
    private val Persian = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
    fun toFa(value: Int): String = value.toString().map { if (it.isDigit()) Persian[it - '0'] else it }.joinToString("")
}

object ShomaraProgressLogic {
    fun kindFor(state: ShomaraProgressState): ShomaraProgressKind = when {
        state.offline -> ShomaraProgressKind.Offline
        state.paused -> ShomaraProgressKind.Paused
        state.fraction == null -> ShomaraProgressKind.Indeterminate
        else -> ShomaraProgressKind.Determinate
    }

    /**
     * Controlled announcement: a single deterministic string per state (the composable sets it
     * as stateDescription; no live region). The server-supplied fraction is rendered verbatim —
     * the component never infers mastery.
     */
    fun announcementFor(state: ShomaraProgressState): String = when (kindFor(state)) {
        ShomaraProgressKind.Determinate -> "پیشرفت ${ShomaraDigits.toFa(((state.fraction ?: 0f) * 100).toInt())} درصد"
        ShomaraProgressKind.Indeterminate -> "در حال آماده‌سازی"
        ShomaraProgressKind.Paused -> "متوقف شد"
        ShomaraProgressKind.Offline -> "آفلاین؛ بعداً ادامه می‌دهیم"
    }

    /** Reduced motion stops the indeterminate animation; determinate width was never animated. */
    fun animates(state: ShomaraProgressState, reducedMotion: Boolean): Boolean =
        !reducedMotion && kindFor(state) == ShomaraProgressKind.Indeterminate

    fun trackColor(): Color = ShomaraTokens.ColorLine
    fun fillColor(state: ShomaraProgressState): Color = when (kindFor(state)) {
        ShomaraProgressKind.Offline, ShomaraProgressKind.Paused -> ShomaraTokens.ColorMuted
        else -> ShomaraTokens.ColorPrimary
    }
}

@Composable
fun ShomaraProgressBar(
    state: ShomaraProgressState,
    modifier: Modifier = Modifier,
    reducedMotion: Boolean = false,
) {
    val kind = ShomaraProgressLogic.kindFor(state)
    val height = ShomaraTokens.ComponentProgressH
    Column(modifier = modifier.fillMaxWidth().semantics {
        stateDescription = ShomaraProgressLogic.announcementFor(state)
    }) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(height)
                .background(ShomaraProgressLogic.trackColor(), RoundedCornerShape(ShomaraTokens.RadiusPill)),
        ) {
            when (kind) {
                ShomaraProgressKind.Determinate -> Box(
                    modifier = Modifier
                        .fillMaxWidth(state.fraction ?: 0f)
                        .height(height)
                        .background(ShomaraProgressLogic.fillColor(state), RoundedCornerShape(ShomaraTokens.RadiusPill)),
                )
                ShomaraProgressKind.Indeterminate -> if (ShomaraProgressLogic.animates(state, reducedMotion)) {
                    androidx.compose.material3.LinearProgressIndicator(
                        modifier = Modifier.fillMaxWidth().height(height),
                        color = ShomaraProgressLogic.fillColor(state),
                        trackColor = ShomaraProgressLogic.trackColor(),
                    )
                } else {
                    // Reduced motion: static half-width placeholder, no animation.
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.5f)
                            .height(height)
                            .background(ShomaraProgressLogic.fillColor(state), RoundedCornerShape(ShomaraTokens.RadiusPill)),
                    )
                }
                else -> Box(
                    modifier = Modifier
                        .fillMaxWidth(0.25f)
                        .height(height)
                        .background(ShomaraProgressLogic.fillColor(state), RoundedCornerShape(ShomaraTokens.RadiusPill)),
                )
            }
        }
    }
}
