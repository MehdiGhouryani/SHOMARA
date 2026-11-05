package com.mathlearning.feature.path

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta

/** Station-start state matrix (family 07): loading/ready/resume/locked/offline/error/starting. */
enum class ShomaraStationStartState { Loading, Ready, Resume, Locked, Offline, Error, Starting }

object ShomaraStationStartLogic {
    fun stateFor(
        meta: StationNodeMeta,
        progress: ShomaraPathProgress,
        loading: Boolean = false,
        starting: Boolean = false,
        errorText: String? = null,
    ): ShomaraStationStartState = when {
        progress.offline -> ShomaraStationStartState.Offline
        errorText != null -> ShomaraStationStartState.Error
        loading -> ShomaraStationStartState.Loading
        starting -> ShomaraStationStartState.Starting
        ShomaraPathGraphLogic.stateFor(meta, progress) == ShomaraPathNodeState.Locked -> ShomaraStationStartState.Locked
        ShomaraPathGraphLogic.stateFor(meta, progress) == ShomaraPathNodeState.Completed -> ShomaraStationStartState.Resume
        else -> ShomaraStationStartState.Ready
    }

    /** Exactly ONE primary CTA; its label is deterministic per state (family 07 anti-pattern: repeated CTA). */
    fun ctaLabel(state: ShomaraStationStartState): String? = when (state) {
        ShomaraStationStartState.Ready -> "شروع"
        ShomaraStationStartState.Resume -> "ادامه"
        ShomaraStationStartState.Locked -> "متوجه شدم"
        else -> null
    }

    fun ctaEnabled(state: ShomaraStationStartState): Boolean =
        state == ShomaraStationStartState.Ready || state == ShomaraStationStartState.Resume || state == ShomaraStationStartState.Locked

    fun metadataLine(meta: StationNodeMeta): String =
        "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)} از ${ShomaraDigits.toFa(ShomaraStationCatalog.STATION_COUNT)} — ${meta.chapterLabel}"

    fun lockedExplanation(): String = "این ایستگاه هنوز باز نشده؛ ایستگاه فعلی مسیر را کامل کن تا باز شود."
}

/**
 * Unit/jump sheet (N05-03): jumps stay inside the station's own chapter; only unlocked targets
 * are confirmable; offline/error block the confirm; exactly one confirm CTA.
 */
data class ShomaraJumpTarget(val meta: StationNodeMeta, val nodeState: ShomaraPathNodeState)

data class ShomaraJumpSheetState(
    val targets: List<ShomaraJumpTarget>,
    val selectedId: String? = null,
    val offline: Boolean = false,
    val errorText: String? = null,
) {
    val canConfirm: Boolean
        get() = !offline && errorText == null &&
            selectedId != null &&
            targets.firstOrNull { it.meta.id == selectedId }?.nodeState != ShomaraPathNodeState.Locked
}

object ShomaraJumpSheetLogic {
    /** Jump candidates: every station of the target's chapter with its current path state. */
    fun targetsFor(stationId: String, progress: ShomaraPathProgress): List<ShomaraJumpTarget> =
        ShomaraStationCatalog.stationsInChapter(ShomaraStationCatalog.chapterOf(stationId))
            .map { ShomaraJumpTarget(it, ShomaraPathGraphLogic.stateFor(it, progress)) }

    fun select(state: ShomaraJumpSheetState, tappedId: String): ShomaraJumpSheetState {
        require(state.targets.any { it.meta.id == tappedId }) { "jump target outside the chapter" }
        return state.copy(selectedId = tappedId)
    }

    fun titleFor(stationId: String): String =
        "پرش داخل ${ShomaraChapterCatalog.labelFor(ShomaraStationCatalog.chapterOf(stationId))}"
}

@Composable
fun ShomaraStationStartSheet(
    stationId: String,
    progress: ShomaraPathProgress,
    onStart: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    loading: Boolean = false,
    starting: Boolean = false,
    errorText: String? = null,
) {
    val meta = ShomaraStationCatalog.station(stationId)
    val state = ShomaraStationStartLogic.stateFor(meta, progress, loading, starting, errorText)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .padding(ShomaraTokens.Space16),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        // Family 07: character in a frame, static and small, from the shipped
        // drawables only (Main pose 1). The concise lesson goal is the
        // catalog working title itself; no goal description is invented here,
        // and stations that are not authored are never faked as available.
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(ShomaraTokens.ComponentNodeSize)
                    .background(ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
                    .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd)),
                contentAlignment = Alignment.Center,
            ) {
                ShomaraCharacterImage(
                    character = ShomaraCharacter.Main,
                    poseId = 1,
                    slot = ShomaraCharacterSlot.Inline,
                    decorative = true,
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                Text(text = meta.workingTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
                Text(text = ShomaraStationStartLogic.metadataLine(meta), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
            }
        }
        when (state) {
            ShomaraStationStartState.Offline -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ بعداً ادامه می‌دهیم.")
            ShomaraStationStartState.Error -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = errorText ?: "مشکلی پیش آمد.")
            ShomaraStationStartState.Locked -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = ShomaraStationStartLogic.lockedExplanation())
            ShomaraStationStartState.Loading, ShomaraStationStartState.Starting ->
                ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = if (state == ShomaraStationStartState.Loading) "در حال آماده‌سازی…" else "در حال شروع…")
            else -> {}
        }
        val cta = ShomaraStationStartLogic.ctaLabel(state)
        if (cta != null) {
            ShomaraButton(
                text = cta,
                onClick = { if (state == ShomaraStationStartState.Locked) onDismiss() else onStart() },
                enabled = ShomaraStationStartLogic.ctaEnabled(state),
                loading = state == ShomaraStationStartState.Starting,
                variant = if (state == ShomaraStationStartState.Locked) ShomaraButtonVariant.Ghost else ShomaraButtonVariant.Primary,
            )
        }
        // Exactly one dismissing action when locked: the "متوجه شدم" CTA
        // above already dismisses, so a second "بستن" button would duplicate it.
        if (state != ShomaraStationStartState.Locked) {
            ShomaraButton(text = "بستن", onClick = onDismiss, variant = ShomaraButtonVariant.Ghost)
        }
    }
}

@Composable
fun ShomaraJumpSheet(
    state: ShomaraJumpSheetState,
    titleStationId: String,
    onSelect: (String) -> Unit,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .padding(ShomaraTokens.Space16),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        Text(text = ShomaraJumpSheetLogic.titleFor(titleStationId), style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        if (state.offline) ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ پرش فعلاً ممکن نیست.")
        if (state.errorText != null) ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = state.errorText)
        for (target in state.targets) {
            val selected = state.selectedId == target.meta.id
            val (_, border, content) = ShomaraPathGraphLogic.colorsFor(target.nodeState)
            val label = "${target.meta.workingTitle} — ${ShomaraPathGraphLogic.stateLabelFor(target.nodeState)}"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = ShomaraTokens.ComponentTouchMin)
                    .background(if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusSm))
                    .border(ShomaraTokens.ClaySoftBorderWidth, border, RoundedCornerShape(ShomaraTokens.RadiusSm))
                    .semantics {
                        role = Role.Button
                        contentDescription = label
                        // Stage 5 TalkBack: every jump target announces its
                        // state, not only the selected one.
                        stateDescription = ShomaraPathGraphLogic.stateLabelFor(target.nodeState) +
                            if (selected) "؛ انتخاب شد" else ""
                    }
                    .clickable(role = Role.Button) { onSelect(target.meta.id) }
                    .padding(ShomaraTokens.Space8),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(text = if (selected) "●" else "", style = ShomaraTypography.Body, color = content)
                Column {
                    Text(text = target.meta.workingTitle, style = ShomaraTypography.Body, color = content)
                    Text(text = ShomaraPathGraphLogic.stateLabelFor(target.nodeState), style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
                }
            }
        }
        ShomaraButton(
            text = "پرش",
            onClick = { state.selectedId?.let(onConfirm) },
            enabled = state.canConfirm,
            variant = ShomaraButtonVariant.Primary,
        )
        ShomaraButton(text = "بستن", onClick = onDismiss, variant = ShomaraButtonVariant.Ghost)
    }
}
