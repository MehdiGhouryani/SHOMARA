package com.mathlearning.core.designsystem.lessontemplates

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.shomaraPressScale

/**
 * S2 · stage5 §T01 «لمس‌وشمار» — the touch-and-count template.
 *
 * The composable RENDERS [T01CountLogic]'s facts: it never decides what was counted. The
 * parent (lesson host / template renderer) owns tappedIds + timing and passes them down;
 * [onObjectTap] carries only the touched object id.
 *
 * Visual contract (stage5):
 *  - objects in the 72–80dp manipulative band, seeded scatter with no overlap;
 *  - a counted object: blue ring + the ORDER number in a bubble (§4.1 `countPulse`, 400ms,
 *    reduced motion = static ring 600ms);
 *  - the counted-so-far bubble is a live region (the spoken count follows the child).
 */
@Composable
fun TemplateT01(
    objects: List<String>,
    tappedIds: List<String>,
    state: LessonTemplateState,
    onObjectTap: (objectId: String) -> Unit,
    modifier: Modifier = Modifier,
    seed: Long = 0L,
    optionCards: List<String> = emptyList(),
    onOptionSelected: (optionId: String) -> Unit = {},
    selectedOptionId: String? = null,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    val logic = remember(objects) { T01CountLogic(objects) }
    val tapped = remember(tappedIds) { tappedIds.toSet() }
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        // The objects: a deterministic grid, each cell one object (no overlap by construction).
        // The SEED permutes which cell an object occupies, so the scatter really is seeded —
        // not merely a seeded function that the render ignores.
        val (cols, rows) = T01ScatterLayout.gridFor(objects.size)
        val slotOf = remember(objects, seed) {
            objects.indices.associateWith { it to T01ScatterLayout.slotFor(objects.size, it, seed) }
        }
        Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
            repeat(rows) { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12, Alignment.CenterHorizontally),
                ) {
                    repeat(cols) { col ->
                        val index = slotOf.entries.firstOrNull { it.value.second == (col to row) }?.value?.first
                        if (index != null && index < objects.size) {
                            val id = objects[index]
                            val order = tappedIds.indexOf(id)
                            ShomaraT01Object(
                                objectId = id,
                                counted = order >= 0,
                                order = if (order >= 0) order + 1 else 0,
                                reducedMotion = reducedMotion,
                                // h1/h2 are about the objects NOT yet counted (stage5: «نبض
                                // اشیای نشمرده»), never a pulse on already-counted objects.
                                hintPulse = state is LessonTemplateState.Hint &&
                                    state.level >= 1 && order < 0,
                                enabled = state !is LessonTemplateState.Correct,
                                onTap = { onObjectTap(id) },
                            )
                        }
                    }
                }
            }
        }
        // The count-so-far bubble: one live region, no numerals on the objects themselves.
        if (tapped.isNotEmpty()) {
            Text(
                text = ShomaraDigits.toFa(tapped.size),
                style = ShomaraTypography.BigNum,
                color = ShomaraTokens.ColorPrimary,
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics(mergeDescendants = true) {
                        liveRegion = LiveRegionMode.Polite
                        contentDescription = "شمرده شد"
                    },
            )
        }
        // Optional answer cards (the T15 pairing the stage5 loop hands off to).
        if (optionCards.isNotEmpty()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16, Alignment.CenterHorizontally),
            ) {
                optionCards.forEach { option ->
                    ShomaraT01AnswerCard(
                        text = option,
                        selected = option == selectedOptionId,
                        enabled = state !is LessonTemplateState.Correct,
                        onTap = { onOptionSelected(option) },
                    )
                }
            }
        }
    }
}

@Composable
private fun ShomaraT01Object(
    objectId: String,
    counted: Boolean,
    order: Int,
    reducedMotion: Boolean,
    hintPulse: Boolean,
    enabled: Boolean,
    onTap: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val ring = remember { Animatable(if (counted) 1f else 0f) }
    LaunchedEffect(counted) {
        if (counted) {
            if (reducedMotion) ring.snapTo(1f) else ring.animateTo(1f, tween(ShomaraCountPulseLogic.pulseMs(false)))
        } else {
            ring.snapTo(0f)
        }
    }
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMin)
            .shomaraPressScale(pressed = pressed, reducedMotion = reducedMotion)
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, CircleShape)
            .background(
                if (counted) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurfaceAlt,
                CircleShape,
            )
            .border(
                width = if (counted || hintPulse) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (counted) ShomaraTokens.ColorPrimary else if (hintPulse) ShomaraTokens.ColorAmber else ShomaraTokens.ColorLine,
                shape = CircleShape,
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = objectId
                stateDescription = if (counted) "شمرده شد" else "لمس نکرده"
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onTap,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.size(ShomaraTokens.Space24)) {
            val stroke = ShomaraTokens.Space4.toPx()
            drawCircle(
                color = if (counted) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk2,
                radius = size.minDimension / 2f - stroke,
                style = Stroke(stroke),
            )
        }
        if (counted) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = ShomaraTokens.Space4, y = (-ShomaraTokens.Space8))
                    .size(ShomaraTokens.Space24)
                    .background(ShomaraTokens.ColorAmber, CircleShape)
                    .semantics(mergeDescendants = true) { contentDescription = "عدد " + ShomaraDigits.toFa(order) },
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = ShomaraDigits.toFa(order),
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorAmberInk,
                )
            }
        }
    }
}

@Composable
private fun ShomaraT01AnswerCard(
    text: String,
    selected: Boolean,
    enabled: Boolean,
    onTap: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(ShomaraTokens.ComponentManipulativeMax)
            .background(
                if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface,
                RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .border(
                width = if (selected) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics(mergeDescendants = true) {
                role = Role.Button
                stateDescription = if (selected) "انتخاب شد" else "انتخاب نشده"
                contentDescription = text
            }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onTap,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = text, style = ShomaraTypography.BigNum, color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorInk)
    }
}
