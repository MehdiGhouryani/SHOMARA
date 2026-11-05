package com.mathlearning.feature.path

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta

/** Path node states (family 06): fresh/current/completed/perfect/locked + offline/error surfaces. */
enum class ShomaraPathNodeState { Fresh, Current, Completed, Perfect, Locked }

/**
 * Caller/server-provided progress — the path NEVER computes mastery itself (COMPONENT_READINESS
 * Progress policy). Null [currentStationId] means the server has not placed the child yet.
 */
data class ShomaraPathProgress(
    val completedStationIds: Set<String> = emptySet(),
    val perfectStationIds: Set<String> = emptySet(),
    val currentStationId: String? = null,
    val offline: Boolean = false,
) {
    init {
        require(perfectStationIds.all { it in completedStationIds }) { "perfect implies completed" }
    }
}

/** Pure node-state mapping; exactly ONE Current node can exist at a time (single featured). */
object ShomaraPathGraphLogic {
    fun stateFor(meta: StationNodeMeta, progress: ShomaraPathProgress): ShomaraPathNodeState = when {
        progress.offline -> ShomaraPathNodeState.Locked
        meta.id == progress.currentStationId -> ShomaraPathNodeState.Current
        meta.id in progress.perfectStationIds -> ShomaraPathNodeState.Perfect
        meta.id in progress.completedStationIds -> ShomaraPathNodeState.Completed
        else -> ShomaraPathNodeState.Locked
    }

    /** TalkBack truth: every state has an explicit Persian label (never color-only). */
    fun stateLabelFor(state: ShomaraPathNodeState): String = when (state) {
        ShomaraPathNodeState.Fresh -> "آمادهٔ شروع"
        ShomaraPathNodeState.Current -> "ایستگاه فعلی"
        ShomaraPathNodeState.Completed -> "تکمیل شد"
        ShomaraPathNodeState.Perfect -> "کامل و بی‌نقص"
        ShomaraPathNodeState.Locked -> "هنوز قفل؛ با ترتیب مسیر باز می‌شود"
    }

    fun stateMarkFor(state: ShomaraPathNodeState): String = when (state) {
        ShomaraPathNodeState.Completed, ShomaraPathNodeState.Perfect -> "✓"
        else -> ""
    }

    fun colorsFor(state: ShomaraPathNodeState): Triple<Color, Color, Color> = when (state) {
        ShomaraPathNodeState.Current -> Triple(ShomaraTokens.ColorAmberSoft, ShomaraTokens.ColorAmber, ShomaraTokens.ColorAmberInk)
        ShomaraPathNodeState.Completed -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorPrimaryDark)
        ShomaraPathNodeState.Perfect -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimaryDark, ShomaraTokens.ColorPrimaryDark)
        ShomaraPathNodeState.Locked -> Triple(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine2, ShomaraTokens.ColorMuted)
        ShomaraPathNodeState.Fresh -> Triple(ShomaraTokens.ColorSurface, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
    }

    /** Locked nodes stay tappable: tapping opens the locked explanation, never a disabled dead end. */
    fun tapEnabled(state: ShomaraPathNodeState): Boolean = true

    /** Restore-scroll (family 06): the last visible chapter survives process death. */
    fun restoredChapter(saved: Int?): Int = if (saved != null && saved in ShomaraChapterCatalog.All) saved else ShomaraChapterCatalog.All.first()
}

@Composable
fun ShomaraPathScreen(
    progress: ShomaraPathProgress,
    onStationTap: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    // Family 06 header: one calm progress layer only (no %, no score, no second
    // progress layer in the child's view). The fraction is rendered from the
    // server-provided completed set only; this screen never computes mastery.
    // RTL: the first element of a Row is on the right, and the progress fill
    // aligns to the layout start (right in RTL). Digit strings and operation
    // order are never mirrored.
    val totalStations = ShomaraStationCatalog.Stations.size
    val completedCount = progress.completedStationIds.size
    val remainingStations = (totalStations - completedCount).coerceAtLeast(0)
    val progressFraction = if (totalStations > 0) completedCount.toFloat() / totalStations.toFloat() else 0f
    // Stage 5: screen inset unified with Stage 4 language (24dp / 16dp).
    Column(modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space24), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Static cameo only, from the 4 shipped drawables (Main pose 1).
            // It is decoration; the hero of this screen is the current node.
            ShomaraCharacterImage(
                character = ShomaraCharacter.Main,
                poseId = 1,
                slot = ShomaraCharacterSlot.Inline,
                decorative = true,
            )
            Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                Text(text = "مسیر یادگیری", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
                Text(
                    text = if (remainingStations == 0) "مسیر کامل شد" else "ایستگاه‌های باقی‌مانده: ${ShomaraDigits.toFa(remainingStations)}",
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorMuted,
                )
            }
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = ShomaraTokens.Space8)
                .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusSm))
                .semantics { contentDescription = if (remainingStations == 0) "مسیر کامل شد" else "ایستگاه‌های باقی‌مانده: ${ShomaraDigits.toFa(remainingStations)}" },
            contentAlignment = Alignment.CenterStart,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progressFraction)
                    .heightIn(min = ShomaraTokens.Space8)
                    .background(ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusSm)),
            )
        }
        if (progress.offline) {
            ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ مسیر آفلاین دیده می‌شود.")
        }
        for (chapter in ShomaraChapterCatalog.All) {
            Text(text = ShomaraChapterCatalog.labelFor(chapter), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2, modifier = Modifier.semantics { heading() })
            for (meta in ShomaraStationCatalog.stationsInChapter(chapter)) {
                val state = ShomaraPathGraphLogic.stateFor(meta, progress)
                val (container, border, content) = ShomaraPathGraphLogic.colorsFor(state)
                val depth = if (state == ShomaraPathNodeState.Current) ShomaraClayDepth.Featured else ShomaraClayDepth.Soft
                // Stage 5 TalkBack: title and state are separate semantics
                // (content = title, state = state label), so a locked node
                // is announced as locked for every state, not only Current.
                val label = meta.workingTitle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = ShomaraTokens.ComponentTouchMin)
                        .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .border(
                            if (depth == ShomaraClayDepth.Featured) ShomaraTokens.ClayFeaturedBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                            border,
                            RoundedCornerShape(ShomaraTokens.RadiusMd),
                        )
                        .semantics {
                            role = Role.Button
                            contentDescription = label
                            stateDescription = ShomaraPathGraphLogic.stateLabelFor(state)
                        }
                        .clickable(role = Role.Button) { onStationTap(meta.id) }
                        .padding(ShomaraTokens.Space12),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // Triple encoding, never colour alone: node circle (shape +
                    // colour), visible state label below, and the TalkBack label
                    // on the row. Only the Current node uses Featured depth.
                    Box(
                        modifier = Modifier
                            .size(ShomaraTokens.ComponentTouchMin)
                            .background(container, CircleShape)
                            .border(ShomaraTokens.ClaySoftBorderWidth, border, CircleShape),
                        contentAlignment = Alignment.Center,
                    ) {
                        val mark = ShomaraPathGraphLogic.stateMarkFor(state)
                        Text(
                            text = if (mark.isNotEmpty()) mark else ShomaraDigits.toFa(meta.ordinal),
                            style = ShomaraTypography.Body,
                            color = content,
                        )
                    }
                    Column {
                        Text(text = meta.workingTitle, style = ShomaraTypography.Body, color = content)
                        Text(text = "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)}", style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
                        Text(text = ShomaraPathGraphLogic.stateLabelFor(state), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
                    }
                }
            }
        }
    }
}
