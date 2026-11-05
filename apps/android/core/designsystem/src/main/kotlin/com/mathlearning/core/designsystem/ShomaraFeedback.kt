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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.clearAndSetSemantics
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
            // Batch 2: the feedback panel is the bottom card of the lesson
            // loop (Duolingo structure), so it carries the Soft clay depth
            // like every other card — it is a surface, not a flat strip.
            .shadow(ShomaraTokens.ClaySoftElevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, border, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .padding(ShomaraTokens.Space12)
            .semantics { stateDescription = ShomaraFeedbackLogic.stateLabelFor(kind) },
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Checklist component 4 ("درست" row): the correct panel carries a
        // ✓ icon next to its short sentence — status is never colour alone. The
        // icon is decorative for TalkBack (cleared semantics): the banner's
        // stateDescription ("درست") already announces the kind once, so the glyph
        // must not be read a second time.
        // ADR-0040 (option B, resolving the open × conflict): the wrong-kind
        // panel carries NO × — it carries the neutral retry mark ↺ (the same
        // mark the card system already uses for Retry), in the same decorative
        // pattern. The copied structure stays whole — immediate panel + the
        // correct answer shown + a try-again action — only the "wrong" glyph
        // changes, because the content-library rule ("neutral and encouraging,
        // no red") is child-education-specific and older than the visual.
        // Showing the correct answer itself still needs O1, so the
        // component-4 item stays unticked for that part alone.
        if (kind == ShomaraFeedbackKind.Correct) {
            Text(
                text = "✓",
                style = ShomaraTypography.Title,
                color = content,
                modifier = Modifier.clearAndSetSemantics {},
            )
        }
        if (kind == ShomaraFeedbackKind.Retry) {
            Text(
                text = "↺",
                style = ShomaraTypography.Title,
                color = content,
                modifier = Modifier.clearAndSetSemantics {},
            )
        }
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
     * as stateDescription; no live region). ADR-0040: progress is announced in words,
     * never as a percentage or a score — TalkBack is heard by the child, so the
     * "no %, no score" rule covers it too. The fraction still comes only from
     * caller state; the component never infers mastery, it only names the last
     * completed quarter of the way.
     */
    fun announcementFor(state: ShomaraProgressState): String = when (kindFor(state)) {
        ShomaraProgressKind.Determinate -> progressWords(state.fraction ?: 0f)
        ShomaraProgressKind.Indeterminate -> "در حال آماده‌سازی"
        ShomaraProgressKind.Paused -> "متوقف شد"
        ShomaraProgressKind.Offline -> "آفلاین؛ بعداً ادامه می‌دهیم"
    }

    /** Word bands for a determinate fraction (ADR-0040): the last completed quarter. */
    fun progressWords(fraction: Float): String = when {
        fraction <= 0f -> "هنوز شروع نشده"
        fraction < 0.25f -> "در ابتدای راه"
        fraction < 0.5f -> "یک‌چهارم راه"
        fraction < 0.75f -> "نصف راه"
        fraction < 1f -> "سه‌چهارم راه"
        else -> "کامل شد"
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
    // N08-04: defaults to the composition-wide flag (persisted preference OR system animator scale)
    // so a screen cannot forget to pass it. An indeterminate bar under reduced motion renders a
    // static placeholder instead of a Compose rememberInfiniteTransition, which ignores the
    // platform setting on its own.
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
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
