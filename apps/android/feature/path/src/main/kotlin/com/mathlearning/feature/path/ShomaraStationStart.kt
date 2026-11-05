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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
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
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog
import com.mathlearning.core.model.StationNodeMeta

/** Station-start state matrix (family 07): loading/ready/resume/replay/locked/offline/error/starting. */
enum class ShomaraStationStartState { Loading, Ready, Resume, Replay, Locked, Offline, Error, Starting }

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
        // R-08: a completed station re-enters as Replay, not Resume — the node promises
        // «برای تمرین دوباره ضربه بزن», so the sheet must offer a fresh run from P1,
        // not a resume from the leftover checkpoint. Resume stays in the matrix for a
        // future checkpoint-aware in-progress entry; stateFor never produces it today.
        ShomaraPathGraphLogic.stateFor(meta, progress) == ShomaraPathNodeState.Completed -> ShomaraStationStartState.Replay
        else -> ShomaraStationStartState.Ready
    }

    /** Exactly ONE primary CTA; its label is deterministic per state (family 07 anti-pattern: repeated CTA). */
    fun ctaLabel(state: ShomaraStationStartState): String? = when (state) {
        ShomaraStationStartState.Ready -> "شروع"
        ShomaraStationStartState.Resume -> "ادامه"
        // R-08: the replay label reuses the node's own words («تمرین دوباره») — no new text.
        ShomaraStationStartState.Replay -> "تمرین دوباره"
        ShomaraStationStartState.Locked -> "متوجه شدم"
        else -> null
    }

    fun ctaEnabled(state: ShomaraStationStartState): Boolean =
        state == ShomaraStationStartState.Ready || state == ShomaraStationStartState.Resume || state == ShomaraStationStartState.Replay || state == ShomaraStationStartState.Locked

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
    // R-08: a completed station's CTA is a replay, not a resume — the host enters with
    // the replay flag and clears the checkpoint, so the run starts fresh from P1.
    // Defaults to onStart so existing callers keep working; the shell passes its own.
    onReplay: () -> Unit = onStart,
) {
    val meta = ShomaraStationCatalog.station(stationId)
    val state = ShomaraStationStartLogic.stateFor(meta, progress, loading, starting, errorText)
    Column(
        modifier = modifier
            .fillMaxWidth()
            // Batch 2: the sheet is a raised card (Soft depth), and it
            // scrolls — at 200% font the character row + banner + CTA can
            // otherwise overflow a short sheet window. The elevation comes
            // from the clay spec, never the raw token (R-02).
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .verticalScroll(rememberScrollState())
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
                Text(text = meta.workingTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
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
                // R-08: Locked dismisses, Replay replays, everything else starts.
                onClick = {
                    when (state) {
                        ShomaraStationStartState.Locked -> onDismiss()
                        ShomaraStationStartState.Replay -> onReplay()
                        else -> onStart()
                    }
                },
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
            // Batch 2: same raised-card depth and scroll as the station sheet.
            // The elevation comes from the clay spec, never the raw token (R-02).
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .verticalScroll(rememberScrollState())
            .padding(ShomaraTokens.Space16),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
    ) {
        Text(text = ShomaraJumpSheetLogic.titleFor(titleStationId), style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        if (state.offline) ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = "اینترنت وصل نیست؛ پرش فعلاً ممکن نیست.")
        if (state.errorText != null) ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = state.errorText)
        // F-17: tapping a locked target does not select it — it shows the warm locked
        // explanation in the sheet's own banner, so the child learns why instead of
        // hitting a dead row. The message clears as soon as a real target is tapped.
        var lockedMessage by remember { mutableStateOf<String?>(null) }
        if (lockedMessage != null) ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = lockedMessage!!)
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
                    // R-21: one TalkBack stop per row — the title and state texts merge
                    // into the row's node («عنوان — وضعیت») instead of three stops.
                    .semantics(mergeDescendants = true) {
                        role = Role.Button
                        contentDescription = label
                        // Stage 5 TalkBack: every jump target announces its
                        // state, not only the selected one.
                        stateDescription = ShomaraPathGraphLogic.stateLabelFor(target.nodeState) +
                            if (selected) "؛ انتخاب شد" else ""
                    }
                    .clickable(role = Role.Button) {
                        if (target.nodeState == ShomaraPathNodeState.Locked) {
                            lockedMessage = ShomaraStationStartLogic.lockedExplanation()
                        } else {
                            lockedMessage = null
                            onSelect(target.meta.id)
                        }
                    }
                    .padding(ShomaraTokens.Space8),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // F-17: the selection mark lives in a fixed-width box, so every row's text
                // starts at the same x whether or not the row is selected — the mark is
                // never a layout shift. Decorative for TalkBack: stateDescription already
                // says "انتخاب شد" once.
                Box(
                    modifier = Modifier.width(ShomaraTokens.Space24),
                    contentAlignment = Alignment.Center,
                ) {
                    if (selected) {
                        Text(text = "✓", style = ShomaraTypography.Body, color = content, modifier = Modifier.clearAndSetSemantics {})
                    }
                }
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
