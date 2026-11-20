package com.mathlearning.feature.lesson

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraBottomSheet
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraIconButton
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.MacroStage

/**
 * S0 · STATION_EXPERIENCE_BLUEPRINT §2: the fixed station top bar and the exit sheet.
 *
 * Why this exists (audit findings A1/A2): the exit used to be a FULL-WIDTH text button at the
 * top of the SCROLLING lesson column — a secondary action with primary prominence, competing
 * with the single primary CTA — and its confirmation was an in-flow banner that replaced the
 * button inside the scroll. Now:
 *
 *  - the exit affordance is a 48dp icon (the smallest allowed target) pinned OUTSIDE the scroll,
 *    at the start corner (RTL-aware: the reading-start corner);
 *  - confirmation is a modal bottom sheet OVER the game, not a reflow of the lesson content;
 *  - the sheet's PRIMARY (big, filled) action is «ادامه می‌دهم» — staying must be the easiest
 *    choice for a child; leaving is a plain-text secondary;
 *  - system BACK opens the SAME sheet (the host's existing [ShomaraCloseConfirmLogic] state
 *    machine is untouched — this file only renders its AwaitingConfirmation state).
 *
 * Nothing here decides mastery, saves state or exits by itself: the host owns the close state
 * and calls back through the same confirm/stay logic that has unit tests from N06-02.
 */

/** Pure chip-state derivation — testable without a device (S0 acceptance ①). */
enum class ShomaraStageChipState { Done, Current, Locked }

object ShomaraStationChromeLogic {
    /** The walk order the lesson host already uses; a single source for chip rendering. */
    val stageOrder: List<MacroStage> = listOf(
        MacroStage.P1_DISCOVER,
        MacroStage.P2_GUIDED,
        MacroStage.P3_GAME,
        MacroStage.P4_ASSESSMENT,
        MacroStage.P5_TRANSFER,
    )

    /**
     * Blueprint §2.2: stages before the current one are done, the current one is current,
     * everything after is locked. The chips carry NO number and NO percent — the position
     * fills, the spoken announcement carries the words.
     */
    fun chipState(stage: MacroStage, current: MacroStage): ShomaraStageChipState = when {
        stage.ordinal < current.ordinal -> ShomaraStageChipState.Done
        stage == current -> ShomaraStageChipState.Current
        else -> ShomaraStageChipState.Locked
    }

    fun stageIndex(current: MacroStage): Int = stageOrder.indexOf(current).coerceIn(0, stageOrder.lastIndex)

    /** One merged TalkBack stop for the whole row (blueprint §2.2). */
    fun chipsAnnouncement(current: MacroStage): String = ShomaraLessonStrings.stageChipsAnnouncement(
        stageIndex = stageIndex(current),
        stageLabel = ShomaraLessonStageLabels.labelFor(current),
    )
}

/**
 * The fixed lesson top bar: exit icon (start corner) + the five stage chips (centered).
 * The audio toggle joins in S4 — no dead controls are rendered before they act.
 */
@Composable
fun ShomaraStationTopBar(
    macroStage: MacroStage,
    onExitRequest: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ShomaraIconButton(
            iconText = "×",
            contentDescription = ShomaraLessonStrings.ExitContentDescription,
            onClick = onExitRequest,
        )
        ShomaraStageChips(macroStage = macroStage, modifier = Modifier.weight(1f))
    }
}

/**
 * Five small position pills (§2.2): done = filled soft, current = filled primary (the one
 * gentle "you are here" fill), locked = hairline outline. No numerals, no fraction, no
 * percentage — and the whole row is ONE semantics stop, so TalkBack reads a sentence, not
 * five decorations.
 */
@Composable
fun ShomaraStageChips(
    macroStage: MacroStage,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .semantics(mergeDescendants = true) {
                contentDescription = ShomaraStationChromeLogic.chipsAnnouncement(macroStage)
            },
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ShomaraStationChromeLogic.stageOrder.forEach { stage ->
            val state = ShomaraStationChromeLogic.chipState(stage, macroStage)
            Box(
                modifier = Modifier
                    .height(ShomaraTokens.Space12)
                    .weight(1f, fill = false)
                    .let { m ->
                        when (state) {
                            ShomaraStageChipState.Done -> m.background(
                                ShomaraTokens.ColorPrimarySoft,
                                RoundedCornerShape(percent = 50),
                            )
                            ShomaraStageChipState.Current -> m.background(
                                ShomaraTokens.ColorPrimary,
                                RoundedCornerShape(percent = 50),
                            )
                            ShomaraStageChipState.Locked -> m.border(
                                width = ShomaraTokens.ClaySoftBorderWidth,
                                color = ShomaraTokens.ColorLine,
                                shape = RoundedCornerShape(percent = 50),
                            )
                        }
                    },
            )
        }
    }
}

/**
 * The exit-confirmation bottom sheet (§2.1). Rendered only while the host's close state is
 * AwaitingConfirmation; dismissing the sheet (scrim, drag, back) means «می‌مانم» — the same
 * fail-safe direction as before, now in a surface children recognize ("above the game,
 * not inside it").
 */
@Composable
fun ShomaraStationExitSheet(
    onStay: () -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier,
    assessmentStage: Boolean = false,
) {
    ShomaraBottomSheet(
        // F-01 parity: the sheet content owns its own heading — no doubled title read.
        title = null,
        onDismiss = onStay,
        modifier = modifier,
        content = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
            ) {
                Text(
                    text = ShomaraLessonStrings.ExitTitle,
                    style = ShomaraTypography.Title,
                    color = ShomaraTokens.ColorInk,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = ShomaraLessonStrings.ExitBody,
                    style = ShomaraTypography.Body,
                    color = ShomaraTokens.ColorInk2,
                )
                if (assessmentStage) {
                    Text(
                        text = ShomaraLessonStrings.ExitAssessmentWarning,
                        style = ShomaraTypography.Caption,
                        color = ShomaraTokens.ColorInk2,
                        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                    )
                }
                // Staying is the primary: big, filled, first. Leaving is a plain-text secondary —
                // never equally weighted, never above the stay action.
                ShomaraButton(
                    text = ShomaraLessonStrings.ExitStayPrimary,
                    onClick = onStay,
                    variant = ShomaraButtonVariant.Primary,
                    modifier = Modifier.fillMaxWidth(),
                )
                ShomaraButton(
                    text = ShomaraLessonStrings.ExitSecondary,
                    onClick = onExit,
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
    )
}
