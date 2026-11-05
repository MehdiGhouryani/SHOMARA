package com.mathlearning.feature.profile

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
import com.mathlearning.core.model.ShomaraAvatarCatalog
import com.mathlearning.core.model.ShomaraAvatarOption
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraProgressBar
import com.mathlearning.core.designsystem.ShomaraProgressState
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** Me-tab state matrix (family 14): loading/ready/empty/offline/error/edit-return. */
enum class ShomaraMeState { Loading, Ready, Empty, Offline, Error, EditReturn }

/** Real facts only — rendered verbatim from caller/server data (no synthetic badges or streaks). */
data class ShomaraMeFacts(
    val childName: String,
    val avatar: ShomaraAvatarOption,
    val completedStations: Int,
    val totalStations: Int,
) {
    init {
        require(completedStations in 0..totalStations) { "completed stations out of range" }
        require(childName.isNotBlank()) { "child name must exist once onboarding is done" }
    }

    fun progressLine(): String =
        ShomaraDigits.toFa(completedStations) + " از " + ShomaraDigits.toFa(totalStations) + " ایستگاه کامل شده"
}

/**
 * Stage 5 wiring resolver (family 14): the Me tab shows the PERSISTED
 * avatar choice, not the catalog default. The settings store already
 * validates ids; an unknown id (e.g. a catalog change) falls back to
 * the default instead of crashing the Me surface. This is the pure
 * function the "moon survives relaunch" test covers; the host reads
 * the same store, so a saved choice flows host -> facts -> label.
 */
object ShomaraMeAvatarWiring {
    fun resolve(persistedAvatarId: String): ShomaraAvatarOption =
        try {
            ShomaraAvatarCatalog.option(persistedAvatarId)
        } catch (e: IllegalArgumentException) {
            ShomaraAvatarCatalog.option(ShomaraAvatarCatalog.defaultId)
        }
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
    onOpenParent: () -> Unit,
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
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(ShomaraTokens.Space24), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = "من", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        when (state) {
            ShomaraMeState.Offline -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ پیشرفت ذخیره‌شده دیده می‌شود.")
            ShomaraMeState.Error -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = errorText ?: "مشکلی پیش آمد.")
            ShomaraMeState.Loading -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "در حال آوردن پروفایل…")
            ShomaraMeState.Empty -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "پروفایل هنوز کامل نشده؛ از مسیر ادامه بده.")
            ShomaraMeState.Ready -> {
                val f = facts!!
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        // Batch 2: the identity card is the one Featured
                        // surface of this viewport (ADR-0040 R1 — at most
                        // one Featured per viewport), so it renders the
                        // Featured clay depth; the rows below stay Soft.
                        .shadow(ShomaraClay.specFor(ShomaraClayDepth.Featured).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .background(ShomaraTokens.ColorPrimarySoft, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .padding(ShomaraTokens.Space12),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // One real character WebP, small and static, decorative only.
                    // It is a guide, NOT the avatar: the avatar system stays the
                    // abstract preset below, and the two systems are not merged.
                    // Pose 1 only, from the 4 shipped drawables; no pose invented.
                    ShomaraCharacterImage(character = ShomaraCharacter.Main, poseId = 1, slot = ShomaraCharacterSlot.Inline, decorative = true)
                    Column {
                        Text(text = f.childName, style = ShomaraTypography.Title, color = ShomaraTokens.ColorPrimaryDark)
                        Text(text = f.progressLine(), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
                        // Stage 5: the shell host now passes the persisted
                        // settings choice (see ShomaraMeAvatarWiring), so this
                        // label is the saved choice once the store has emitted
                        // its first real value, not a hard-coded default.
                        Text(text = "آواتار من: " + f.avatar.label, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
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
                )
                }
            ShomaraMeState.EditReturn -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "تغییرات ذخیره شد.")
        }
        if (state == ShomaraMeState.Loading) {
            ShomaraPagePlaceholder()
        }
        // N08 §4 dead end fixed: this row used to live INSIDE the Ready branch, so a child
        // whose profile is not complete yet had no way to reach avatar/settings at all — the
        // surface existed but was unreachable. Settings is a valid destination in every state.
        MeRow(label = "آواتار و تنظیمات", description = "ظاهر و preferenceهای واقعی", onClick = onOpenSettings)
        MeRow(label = "بخش والدین", description = "با تأیید بزرگ‌ترها باز می‌شود", onClick = onOpenParent)
    }
}

@Composable
private fun MeRow(label: String, description: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTouchMin)
            // Batch 2 (ADR-0040 R1): the row is a tactile navigation target,
            // so it renders Soft clay depth.
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .semantics {
                role = Role.Button
                contentDescription = label + " — " + description
            }
            .clickable(role = Role.Button) { onClick() }
            .padding(ShomaraTokens.Space12),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(text = label, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
            Text(text = description, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
        }
        Text(text = "←", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk2)
    }
}
