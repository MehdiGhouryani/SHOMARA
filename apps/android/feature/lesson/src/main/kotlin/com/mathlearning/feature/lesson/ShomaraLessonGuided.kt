package com.mathlearning.feature.lesson

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraPressScale

/**
 * N08R-09 — the child-safe GUIDED PRACTICE projection (family 09, stages P2, ST07 pilot §3).
 *
 * Same boundary as the discover projection (ADR-0039 §2 / CONTENT-008): prompt texts,
 * stimulus shape and the OPTION DISPLAYS the child sees — never which option is correct.
 * Correctness lives ONLY behind [ShomaraGuidedEvaluator]; in release that interface has no
 * implementation (fail-closed skeleton), the debug variant wires the DRAFT ST07 answers for
 * on-device review. Draft texts (prompt/ok/retry/hints) come from the pilot's audio manifest
 * and stay debug-only until O2 + human approval.
 */
sealed interface ShomaraGuidedOptionDisplay {
    /** `UI.card.numeral` — the numeral the child picks (draft items i01/i02). */
    data class Numeral(val value: Int) : ShomaraGuidedOptionDisplay

    /** A picture card holding `count` objects (draft items i05/i06). */
    data class Pictures(val objectKind: String, val count: Int) : ShomaraGuidedOptionDisplay
}

data class ShomaraGuidedOption(
    val optionId: String,
    val display: ShomaraGuidedOptionDisplay,
)

data class ShomaraGuidedItem(
    val itemId: String,
    /** Draft prompt sentence (audio pr row) — DRAFT until O2 + approval; debug-only today. */
    val promptText: String,
    /** The stimulus scene: objectKind + how many objects the child counts. */
    val stimulusObjectKind: String,
    val stimulusCount: Int,
    val options: List<ShomaraGuidedOption>,
    /** h1..h3 hint display texts, in ladder order; empty slots stay absent (no fabrication). */
    val hintTexts: List<String>,
    val okText: String,
    /** The warm retry sentence shown with the ↺ panel (ADR-0040 R3) — never blame. */
    val retryText: String,
)

/**
 * The evaluator LAYER (ADR-0039 §2): correctness belongs here and nowhere else. Release has
 * no implementation (fail-closed); the debug variant judges the DRAFT ST07 P2 T15 items.
 * The outcome never carries mastery/progression — those stay with the journey/evaluator.
 */
interface ShomaraGuidedEvaluator {
    sealed interface Outcome {
        data object Correct : Outcome
        data class Retry(val hintLevelShown: Int?) : Outcome
    }

    fun evaluate(itemId: String, chosenOptionId: String): Outcome
}

/** Pure guided loop: single-select, submit gate, hint ladder, item advance. No judging here. */
object ShomaraGuidedLogic {
    fun isSelected(selectedId: String?, optionId: String): Boolean = selectedId == optionId

    fun onSelect(selectedId: String?, optionId: String): String = optionId

    /** Single-submit gate: «بررسی» enables only with a real selection. */
    fun canSubmit(selectedId: String?): Boolean = selectedId != null

    /** The hint level this attempt may show, using the B5 ladder + the item's real slots. */
    fun hintFor(attempt: Int, item: ShomaraGuidedItem): Int? {
        val level = ShomaraHintLadder.hintFor(attempt, if (item.hintTexts.isEmpty()) emptySet() else setOf(ShomaraHintLevel.H1, ShomaraHintLevel.H2, ShomaraHintLevel.H3))
        return when (level) {
            ShomaraHintLevel.H1 -> 0
            ShomaraHintLevel.H2 -> 1
            ShomaraHintLevel.H3 -> 2
            ShomaraHintLevel.Retry, null -> null
        }
    }

    fun nextItemIndex(itemCount: Int, current: Int): Int? =
        (current + 1).takeIf { current + 1 < itemCount }
}

/**
 * The Guided Practice stage (N08R-09): the stimulus scene on top, the choice tiles under
 * it, one pinned «بررسی», warm correct/retry panels from the evaluator — the attempt ladder
 * shows a real hint exactly when the B5 ladder asks for one. Concept animation: retry clears
 * the wrong pick so the child re-counts the same scene (the re-count IS the practice).
 */
@Composable
fun ShomaraGuidedStage(
    items: List<ShomaraGuidedItem>,
    evaluator: ShomaraGuidedEvaluator,
    onAllItemsComplete: () -> Unit,
    modifier: Modifier = Modifier,
    /** P14: fired after EACH evaluator decision (encounterId, attemptIndex, outcome) — persistence hook. */
    onAttemptEvaluated: ((String, Int, String) -> Unit)? = null,
) {
    require(items.isNotEmpty()) { "guided stage needs items; empty content stays on the skeleton" }
    var itemIndex by remember { mutableIntStateOf(0) }
    var selectedId by remember { mutableStateOf<String?>(null) }
    var attempts by remember { mutableIntStateOf(0) }
    var bannerState by remember { mutableStateOf<GuidedBanner?>(null) }
    var itemDone by remember { mutableStateOf(false) }
    val reducedMotion = LocalShomaraReducedMotion.current
    val item = items[itemIndex]

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // The ask (draft prompt text) — one line, no paragraph (P-25).
        Text(
            text = item.promptText,
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            modifier = Modifier
                .fillMaxWidth()
                .semantics { this.contentDescription = item.promptText },
        )
        // Stimulus scene: the objects to count, deterministic token placeholders.
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
        ) {
            repeat(item.stimulusCount) { index ->
                ShomaraGuidedSceneTile(index = index + itemIndex * item.stimulusCount)
            }
        }
        // Options: the child's choices, 72dp+ tiles, selected marked beyond colour.
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterHorizontally),
        ) {
            item.options.forEach { option ->
                ShomaraGuidedOptionTile(
                    display = option.display,
                    selected = ShomaraGuidedLogic.isSelected(selectedId, option.optionId),
                    enabled = !itemDone,
                    reducedMotion = reducedMotion,
                    onSelect = { selectedId = ShomaraGuidedLogic.onSelect(selectedId, option.optionId) },
                )
            }
        }
        bannerState?.let { banner ->
            when (banner) {
                is GuidedBanner.Correct -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Correct, text = banner.text)
                is GuidedBanner.Retry -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = banner.text)
                is GuidedBanner.Hint -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Recovery, text = banner.text)
            }
        }
        if (itemDone) {
            val next = ShomaraGuidedLogic.nextItemIndex(items.size, itemIndex)
            if (next != null) {
                ShomaraButton(
                    modifier = Modifier.fillMaxWidth(),
                    text = "ادامه",
                    onClick = {
                        itemIndex = next
                        selectedId = null
                        attempts = 0
                        bannerState = null
                        itemDone = false
                    },
                    variant = ShomaraButtonVariant.Primary,
                )
            } else {
                Text(
                    text = "این پیش‌نمایش همین‌جا تمام می‌شود؛ ادامهٔ درس به‌زودی فعال می‌شود.",
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorMuted,
                    modifier = Modifier.fillMaxWidth(),
                )
                LaunchedEffectSideEffect(onAllItemsComplete)
            }
        } else {
            // The pinned ask of this family: exactly one «بررسی», gated on a real selection.
            ShomaraButton(
                modifier = Modifier.fillMaxWidth(),
                text = "بررسی",
                onClick = {
                    val choice = selectedId ?: return@ShomaraButton
                    when (val outcome = evaluator.evaluate(item.itemId, choice)) {
                        is ShomaraGuidedEvaluator.Outcome.Correct -> {
                            itemDone = true
                            bannerState = GuidedBanner.Correct(item.okText)
                            onAttemptEvaluated?.invoke(item.itemId, attempts + 1, "CORRECT")
                        }
                        is ShomaraGuidedEvaluator.Outcome.Retry -> {
                            attempts += 1
                            selectedId = null
                            bannerState = GuidedBanner.Retry(item.retryText)
                            onAttemptEvaluated?.invoke(item.itemId, attempts, "INCORRECT")
                            // B5 ladder: attempt 2 -> h1, 3 -> h2, 4+ -> h3 — only when the
                            // item really carries that slot; never a fabricated hint.
                            val hintIndex = ShomaraGuidedLogic.hintFor(attempts, item)
                            if (hintIndex != null) {
                                bannerState = GuidedBanner.Hint(item.hintTexts[hintIndex])
                            }
                        }
                    }
                },
                enabled = ShomaraGuidedLogic.canSubmit(selectedId),
                variant = ShomaraButtonVariant.Primary,
            )
        }
    }
}

private sealed interface GuidedBanner {
    data class Correct(val text: String) : GuidedBanner
    data class Retry(val text: String) : GuidedBanner
    data class Hint(val text: String) : GuidedBanner
}

@Composable
private fun LaunchedEffectSideEffect(onAllItemsComplete: () -> Unit) {
    androidx.compose.runtime.LaunchedEffect(Unit) { onAllItemsComplete() }
}

/**
 * The stimulus scene tile: a neutral geometric placeholder for the object (the OBJ.* art is
 * not delivered), Soft clay with the 3D lip. The child counts the TILES — the scene is the
 * quantity, not a picture of one object repeated.
 */
@Composable
private fun ShomaraGuidedSceneTile(index: Int) {
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMin)
            .drawBehind {
                val edge = ShomaraTokens.ComponentEdge.toPx()
                drawRoundRect(
                    color = ShomaraTokens.ColorSurfaceAlt,
                    topLeft = Offset(0f, edge),
                    size = size,
                    cornerRadius = CornerRadius(ShomaraTokens.RadiusMd.toPx()),
                )
            }
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd)),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.size(ShomaraTokens.Space24)) {
            val stroke = ShomaraTokens.Space4.toPx()
            when (index % 3) {
                0 -> drawCircle(color = ShomaraTokens.ColorInk2, radius = size.minDimension / 2f - stroke, style = Stroke(stroke))
                1 -> drawRoundRect(
                    color = ShomaraTokens.ColorInk2,
                    cornerRadius = CornerRadius(ShomaraTokens.Space4.toPx()),
                    style = Stroke(stroke),
                )
                else -> {
                    val p = androidx.compose.ui.graphics.Path().apply {
                        moveTo(size.width / 2f, 0f)
                        lineTo(size.width, size.height)
                        lineTo(0f, size.height)
                        close()
                    }
                    drawPath(p, color = ShomaraTokens.ColorInk2, style = Stroke(stroke, join = androidx.compose.ui.graphics.StrokeJoin.Round))
                }
            }
        }
    }
}

/**
 * One choice tile: numeral cards render the big digit (UI.card.numeral evidence), picture
 * cards render their count as small shapes. Selection = accent border + soft fill + ✓ mark —
 * never colour alone; double-tap-safe via idempotent select.
 */
@Composable
private fun ShomaraGuidedOptionTile(
    display: ShomaraGuidedOptionDisplay,
    selected: Boolean,
    enabled: Boolean,
    reducedMotion: Boolean,
    onSelect: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMax)
            .shomaraPressScale(pressed = pressed, reducedMotion = reducedMotion)
            .drawBehind {
                val edge = ShomaraTokens.ComponentEdge.toPx()
                drawRoundRect(
                    color = if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurfaceAlt,
                    topLeft = Offset(0f, edge),
                    size = size,
                    cornerRadius = CornerRadius(ShomaraTokens.RadiusMd.toPx()),
                )
            }
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(if (selected) ShomaraTokens.ColorSurface else ShomaraTokens.ColorSurfaceAlt, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(
                width = if (selected) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                stateDescription = if (selected) "انتخاب شد" else "انتخاب نشده"
                contentDescription = when (display) {
                    is ShomaraGuidedOptionDisplay.Numeral -> "عدد ${ShomaraDigits.toFa(display.value)}"
                    is ShomaraGuidedOptionDisplay.Pictures -> "${ShomaraDigits.toFa(display.count)} شیء"
                }
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                enabled = enabled,
                role = Role.Button,
            ) { onSelect() },
        contentAlignment = Alignment.Center,
    ) {
        when (display) {
            is ShomaraGuidedOptionDisplay.Numeral -> Text(
                text = ShomaraDigits.toFa(display.value),
                style = ShomaraTypography.BigNum,
                color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk,
            )
            is ShomaraGuidedOptionDisplay.Pictures -> Row(
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                repeat(display.count.coerceAtMost(3)) { i ->
                    Canvas(modifier = Modifier.size(ShomaraTokens.Space16)) {
                        drawCircle(
                            color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk2,
                            radius = size.minDimension / 2f,
                            style = Stroke(ShomaraTokens.Space4.toPx()),
                        )
                    }
                }
            }
        }
        if (selected) {
            // The visible selection mark beyond colour (ADR-0040 evidence pattern).
            Text(
                text = "✓",
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorPrimary,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = ShomaraTokens.Space4, y = -ShomaraTokens.Space4)
                    .clearAndSetSemantics {},
            )
        }
    }
}
