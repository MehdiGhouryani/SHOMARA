package com.mathlearning.feature.practice

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
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraPagePlaceholder
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** Practice-hub state matrix (family 12): loading/list/empty/locked/offline/error/history. */
enum class ShomaraPracticeHubState { Loading, List, Empty, Locked, Offline, Error, History }

/** A real, caller-provided practice entry — the hub never fabricates data (family 12 anti-pattern). */
data class ShomaraPracticeItem(
    val id: String,
    val title: String,
    val locked: Boolean = false,
    val lockedReason: String? = null,
) {
    init {
        if (locked) require(!lockedReason.isNullOrEmpty()) { "locked practice needs a warm reason" }
    }
}

object ShomaraPracticeHubLogic {
    fun stateFor(items: List<ShomaraPracticeItem>, loading: Boolean, offline: Boolean, errorText: String?): ShomaraPracticeHubState = when {
        offline -> ShomaraPracticeHubState.Offline
        errorText != null -> ShomaraPracticeHubState.Error
        loading -> ShomaraPracticeHubState.Loading
        items.isEmpty() -> ShomaraPracticeHubState.Empty
        else -> ShomaraPracticeHubState.List
    }

    /** The recommended list is rendered verbatim from the caller — never guessed client-side. */
    fun recommendedFor(items: List<ShomaraPracticeItem>): List<ShomaraPracticeItem> = items.filter { !it.locked }

    fun historyFor(recent: List<ShomaraPracticeItem>): List<ShomaraPracticeItem> = recent

    /** Warm empty-state guide pointing at the path (never punitive, never a fake mission). */
    fun emptyGuide(): String = "فعلاً تمرین جدیدی نیست؛ از مسیر ادامه بده تا تمرین‌های تازه باز شوند."

    fun lockedLabel(item: ShomaraPracticeItem): String = "قفل: ${item.lockedReason}"
}

@Composable
fun ShomaraPracticeHubScreen(
    items: List<ShomaraPracticeItem>,
    recent: List<ShomaraPracticeItem>,
    modifier: Modifier = Modifier,
    loading: Boolean = false,
    offline: Boolean = false,
    errorText: String? = null,
    onItemTap: (String) -> Unit = {},
) {
    val state = ShomaraPracticeHubLogic.stateFor(items, loading, offline, errorText)
    // Stage 4, family 12: generous breathing room, one clear hierarchy.
    // Preferred inset is 24dp; rows stay full-width so nothing is squeezed.
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(ShomaraTokens.Space24), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = "تمرین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        when (state) {
            ShomaraPracticeHubState.Offline -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ تمرین‌های ذخیره‌شده بعداً به‌روز می‌شوند.")
            ShomaraPracticeHubState.Error -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = errorText ?: "مشکلی پیش آمد.")
            ShomaraPracticeHubState.Loading -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "در حال آوردن تمرین‌ها…")
            ShomaraPracticeHubState.Empty -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraPracticeHubLogic.emptyGuide())
            else -> {}
        }
        if (state == ShomaraPracticeHubState.Loading) {
            // Static page shape, not a spinner: reduced-motion safe by construction.
            ShomaraPagePlaceholder()
        }
        if (state == ShomaraPracticeHubState.List || state == ShomaraPracticeHubState.History) {
            Text(text = "تمرین‌های قابل انجام", style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            for (item in ShomaraPracticeHubLogic.recommendedFor(items)) {
                PracticeRow(item = item, locked = false, onItemTap = onItemTap)
            }
            for (item in items.filter { it.locked }) {
                PracticeRow(item = item, locked = true, onItemTap = onItemTap)
            }
        }
        if (recent.isNotEmpty()) {
            Text(text = "تمرین‌های اخیر", style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            for (item in ShomaraPracticeHubLogic.historyFor(recent)) {
                PracticeRow(item = item, locked = false, onItemTap = onItemTap, historical = true)
            }
        }
    }
}

@Composable
private fun PracticeRow(item: ShomaraPracticeItem, locked: Boolean, onItemTap: (String) -> Unit, historical: Boolean = false) {
    val container = if (locked) ShomaraTokens.ColorSurfaceAlt else ShomaraTokens.ColorSurface
    val content = if (locked) ShomaraTokens.ColorMuted else ShomaraTokens.ColorInk
    val description = if (locked) ShomaraPracticeHubLogic.lockedLabel(item) else item.title
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTouchMin)
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .semantics {
                role = Role.Button
                contentDescription = if (historical) "$description — انجام شده" else description
            }
            .clickable(enabled = !locked, role = Role.Button) { onItemTap(item.id) }
            .padding(ShomaraTokens.Space12),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(text = item.title, style = ShomaraTypography.Body, color = content)
            if (locked) {
                Text(text = ShomaraPracticeHubLogic.lockedLabel(item), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
            }
        }
    }
}
