package com.mathlearning.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraPagePlaceholder
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** Me-tab state matrix (family 14): loading/ready/empty/offline/error. */
/**
 * DT-76 (handoff v3, screen-local per DT precedent): semantic aliases for the home visual
 * language — every value still comes from the canonical generated token object, never a magic hex.
 */
internal object ShomaraMeUiTokens {
    val Canvas = ShomaraTokens.ColorHomeCanvas
    val Surface = ShomaraTokens.ColorHomeSurface
    val Ink = ShomaraTokens.ColorHomeInk
    val Muted = ShomaraTokens.ColorHomeMuted
    val Border = ShomaraTokens.ColorHomeBorder
    val Violet = ShomaraTokens.ColorHomeViolet
    val VioletDark = ShomaraTokens.ColorHomeVioletDark
    val VioletSoft = ShomaraTokens.ColorHomeVioletSoft
    val OnViolet = ShomaraTokens.ColorHomeOnViolet
    val OnVioletMuted = ShomaraTokens.ColorHomeOnVioletMuted
}

/**
 * Canonical copy for the Me screen. AGENTS §10: every user-visible line lives here instead of as an
 * inline literal in the renderer — the same rule the practice hub now follows. The strings are the
 * ones this screen rendered when they were extracted; ADR-0051 later renamed only the settings row.
 */
object ShomaraMeStrings {
    const val Title: String = "من"
    const val Offline: String = "اینترنت وصل نیست؛ پیشرفت ذخیره‌شده دیده می‌شود."
    const val ErrorFallback: String = "مشکلی پیش آمد."
    const val Loading: String = "در حال آوردن پروفایل…"
    const val Empty: String = "پروفایل هنوز کامل نشده؛ از مسیر ادامه بده."
    // ADR-0051: the avatar preset is gone, so the destination is just «تنظیمات».
    const val SettingsLabel: String = "تنظیمات"
    const val SettingsDescription: String = "ظاهر و تنظیم‌های واقعی"

    /** «۳ از ۲۵ ایستگاه کامل شده» — digits are already Persian by the time they arrive. */
    fun progressLine(completedFa: String, totalFa: String): String =
        completedFa + " از " + totalFa + " ایستگاه کامل شده"
}

enum class ShomaraMeState { Loading, Ready, Empty, Offline, Error }

/** Real facts only — rendered verbatim from caller/server data (no synthetic badges or streaks). */
data class ShomaraMeFacts(
    val childName: String,
    val completedStations: Int,
    val totalStations: Int,
) {
    init {
        require(completedStations in 0..totalStations) { "completed stations out of range" }
        require(childName.isNotBlank()) { "child name must exist once onboarding is done" }
    }

    fun progressLine(): String =
        ShomaraMeStrings.progressLine(ShomaraDigits.toFa(completedStations), ShomaraDigits.toFa(totalStations))
}

object ShomaraMeLogic {
    fun stateFor(offline: Boolean, errorText: String?, loading: Boolean, hasFacts: Boolean): ShomaraMeState = when {
        offline -> ShomaraMeState.Offline
        errorText != null -> ShomaraMeState.Error
        loading -> ShomaraMeState.Loading
        hasFacts -> ShomaraMeState.Ready
        else -> ShomaraMeState.Empty
    }
}

@Composable
fun ShomaraMeScreen(
    facts: ShomaraMeFacts?,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
    offline: Boolean = false,
    errorText: String? = null,
    loading: Boolean = false,
) {
    val state = ShomaraMeLogic.stateFor(offline, errorText, loading, facts != null)
    // Stage 4, family 14: preferred 24dp inset, generous spacing, one calm
    // featured header card only. No second progress layer, no reward-economy motif.
    // Checklist (family 14 acceptance, 200% font): the column scrolls, so a
    // 200%-font header + rows can never clip on a small screen.
    // DT-76 (handoff v3): the tab speaks the home visual language — lavender canvas.
    Column(
        modifier = modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .background(ShomaraMeUiTokens.Canvas)
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Text(
            text = ShomaraMeStrings.Title,
            style = ShomaraTypography.Title,
            color = ShomaraMeUiTokens.Ink,
            modifier = Modifier.semantics { heading() },
        )
        when (state) {
            ShomaraMeState.Offline -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraMeStrings.Offline)
            ShomaraMeState.Error -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = errorText ?: ShomaraMeStrings.ErrorFallback)
            ShomaraMeState.Loading -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraMeStrings.Loading)
            ShomaraMeState.Empty -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraMeStrings.Empty)
            ShomaraMeState.Ready -> {
                val f = facts!!
                // DT-76 (handoff v3): the identity card is the one Featured surface of this
                // viewport and now uses the handoff's violet treatment — violet fill, on-violet
                // text — instead of the legacy green primarySoft card.
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(ShomaraClay.specFor(ShomaraClayDepth.Featured).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .background(ShomaraMeUiTokens.Violet, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .padding(ShomaraTokens.Space16),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // One real character WebP, small and static, decorative only.
                    // It is a guide illustration, not an avatar: the avatar preset feature
                    // was removed by owner decision (ADR-0051) and this cameo stays.
                    // Pose 1 only, from the 4 shipped drawables; no pose invented.
                    ShomaraCharacterImage(character = ShomaraCharacter.Main, poseId = 1, slot = ShomaraCharacterSlot.Inline, decorative = true)
                    Column {
                        Text(
                            text = f.childName,
                            style = ShomaraTypography.Title,
                            color = ShomaraMeUiTokens.OnViolet,
                            modifier = Modifier.semantics { heading() },
                        )
                        Text(
                            text = f.progressLine(),
                            style = ShomaraTypography.Caption,
                            color = ShomaraMeUiTokens.OnVioletMuted,
                        )
                    }
                }
                // Batch 2 (goal-card structure, ADR-0040 §5 — allowed for
                // Me with real local progress data, and with no economy
                // content of any kind): the one progress layer of this tab. The
                // fraction comes only from the caller-provided facts
                // (completed / total stations); TalkBack announces it in
                // words via ShomaraProgressBar, never as a percentage or a
                // score, and no second progress layer is added anywhere.
                ShomaraProgressBar(
                    state = ShomaraProgressState(
                        fraction = if (f.totalStations > 0) f.completedStations.toFloat() / f.totalStations.toFloat() else 0f,
                    ),
                    // DT-77 (handoff v3): the progress fill speaks the home language too.
                    fillColor = ShomaraMeUiTokens.Violet,
                )
                }
            // F-25: there is no EditReturn state — no caller ever returns from an edit into
            // this tab with a «saved» banner, and a banner for a save that never happened
            // would be a fabricated success. The dead branch is removed.
        }
        if (state == ShomaraMeState.Loading) {
            ShomaraPagePlaceholder()
        }
        // N08 §4 dead end fixed: this row used to live INSIDE the Ready branch, so a child
        // whose profile is not complete yet had no way to reach settings at all — the
        // surface existed but was unreachable. Settings is a valid destination in every state.
        // F-20: the description is plain Persian — no Latin word inside a Persian sentence.
        MeRow(label = ShomaraMeStrings.SettingsLabel, description = ShomaraMeStrings.SettingsDescription, onClick = onOpenSettings)
    }
}

@Composable
private fun MeRow(label: String, description: String, onClick: () -> Unit) {
    // DT-76 (handoff v3): white home card with the home border; the arrow reads in home ink.
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTouchMin)
            // Batch 2 (ADR-0040 R1): the row is a tactile navigation target,
            // so it renders Soft clay depth.
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(ShomaraMeUiTokens.Surface, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraMeUiTokens.Border, RoundedCornerShape(ShomaraTokens.RadiusLg))
            // الف-۰۲: the row merges its descendants into one announcement (label +
            // description) instead of three separate nodes.
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = label + " — " + description
            }
            .clickable(role = Role.Button) { onClick() }
            .padding(ShomaraTokens.Space16),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(text = label, style = ShomaraTypography.Body, color = ShomaraMeUiTokens.Ink)
            Text(text = description, style = ShomaraTypography.Caption, color = ShomaraMeUiTokens.Muted)
        }
        // F-32: the «←» arrow is decoration — the row's contentDescription already says
        // where it goes. Without clearing, TalkBack reads the arrow glyph aloud.
        Text(text = "←", style = ShomaraTypography.Title, color = ShomaraMeUiTokens.Muted, modifier = Modifier.clearAndSetSemantics {})
    }
}
