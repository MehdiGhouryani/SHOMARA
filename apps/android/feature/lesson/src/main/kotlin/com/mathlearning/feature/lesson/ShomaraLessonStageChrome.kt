package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCharacter
import com.mathlearning.core.designsystem.ShomaraCharacterImage
import com.mathlearning.core.designsystem.ShomaraCharacterSlot
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.MacroStage
import com.mathlearning.core.model.ShomaraStationCatalog

/**
 * Stage 3 display-only lesson chrome (families 08-11).
 *
 * Nothing here decides mastery, unlock, correctness, or the next item:
 * those stay server-owned. This file only renders state the host already
 * holds, with Persian stage labels (the host previously showed the raw
 * Latin enum name) and the character rules from POSE_TO_PAGE_MAPPING_DRAFT:
 * a small static guide only in P1 discovery, no character in guided
 * practice (P2/P3) or assessment (P4), and a static character only in the
 * restrained result surface (family 11).
 */
object ShomaraLessonStageLabels {
    fun labelFor(stage: MacroStage): String = when (stage) {
        MacroStage.P1_DISCOVER -> "کشف"
        MacroStage.P2_GUIDED -> "تمرین هدایت‌شده"
        MacroStage.P3_GAME -> "بازی"
        MacroStage.P4_ASSESSMENT -> "ارزیابی"
        MacroStage.P5_TRANSFER -> "انتقال"
    }

    /** Only P1 discovery may show a guide character, small and static. */
    fun showsGuideCharacter(stage: MacroStage): Boolean =
        stage == MacroStage.P1_DISCOVER
}

@Composable
fun ShomaraLessonStageHeader(
    macroStage: MacroStage,
    stationId: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (ShomaraLessonStageLabels.showsGuideCharacter(macroStage)) {
            // Number is the teaching-screen character; pose 1 is shipped.
            // Static and decorative: the maths task, not the picture, is the hero.
            ShomaraCharacterImage(
                character = ShomaraCharacter.Number,
                poseId = 1,
                slot = ShomaraCharacterSlot.Inline,
                decorative = true,
            )
        }
        // Batch 2: the header used to print the raw Latin station id
        // ("ایستگاه ST07") into a Persian heading. The id is resolved
        // through the canonical catalog instead — Persian ordinal plus the
        // catalog working title, both already user-visible on the path —
        // and an unknown id falls back to the old rendering, never a crash.
        val stationTitle = runCatching { ShomaraStationCatalog.station(stationId) }.getOrNull()?.let { meta ->
            "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)} — ${meta.workingTitle}"
        } ?: "ایستگاه $stationId"
        Text(
            text = "$stationTitle — مرحلهٔ ${ShomaraLessonStageLabels.labelFor(macroStage)}",
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Start,
            modifier = Modifier.semantics { heading() },
        )
    }
}

/**
 * Family 11 result surface, shown only after an authoritative server
 * result (CompletePass / CompleteNeedsPractice). Restrained: one static
 * character, the server-owned headline from [ShomaraResultLogic], no
 * score, no reward motif, no celebration sound, no second progress layer, and
 * one primary CTA that returns to the path. It is skippable by that CTA
 * and by the host's existing close-confirm path.
 */
@Composable
fun ShomaraLessonResultSurface(
    surface: ShomaraResultSurface,
    onExitToShell: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        ShomaraCharacterImage(
            character = ShomaraCharacter.Main,
            poseId = 1,
            slot = ShomaraCharacterSlot.Lesson,
            decorative = true,
        )
        Text(
            text = ShomaraResultLogic.headlineFor(surface),
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            text = "برای ادامه، به مسیر برگرد.",
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk2,
            textAlign = TextAlign.Center,
        )
        ShomaraButton(
            text = "بازگشت به مسیر",
            onClick = onExitToShell,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
