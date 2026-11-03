package com.mathlearning.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.model.ShomaraAvatarOption
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
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
    Column(modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Text(text = "من", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
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
                        .background(ShomaraTokens.ColorPrimarySoft, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusLg))
                        .padding(ShomaraTokens.Space12),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Text(text = f.childName, style = ShomaraTypography.Title, color = ShomaraTokens.ColorPrimaryDark)
                        Text(text = f.progressLine(), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
                    }
                }
                }
            ShomaraMeState.EditReturn -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "تغییرات ذخیره شد.")
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
