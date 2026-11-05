package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection

/** Manipulative state matrix: idle/active/dragging/accepted/retry/locked (COMPONENT_READINESS). */
enum class ShomaraManipulativeState { Idle, Active, Dragging, Accepted, Retry, Locked }

/**
 * Configurable timing/tolerance parameters (N03-08 acceptance). Defaults derive from canonical
 * motion/component tokens; callers (learning runtime, N06) may override per activity.
 */
data class ShomaraManipulativeTolerance(
    /** How long a tap-selection stays armed before auto-release. */
    val selectionTimeoutMs: Long = ShomaraTokens.MotionDurationSlow.toLong(),
    /** Delay before a retry state clears back to idle. */
    val retryClearDelayMs: Long = ShomaraTokens.MotionDurationBase.toLong(),
    /** Minimum movement (dp) that turns an active tile into a drag. */
    val dragThresholdDp: Dp = ShomaraTokens.ComponentEdge,
)

/** Pure sizing rules — the 48dp general floor and the 72–80dp manipulative preferred band. */
object ShomaraManipulativeRules {
    val GeneralTouchTarget: Dp = ShomaraTokens.ComponentTouchMin
    val ManipulativeTarget: Dp = ShomaraTokens.ComponentManipulativeMin

    /** Preferred band for child manipulatives (AGENTS §6): [72, 80] from canonical tokens. */
    fun isPreferredBand(size: Dp): Boolean =
        size >= ShomaraTokens.ComponentManipulativeMin && size <= ShomaraTokens.ComponentManipulativeMax

    fun requireBand(size: Dp) {
        require(isPreferredBand(size)) {
            "manipulative target $size outside canonical band " +
                "[${ShomaraTokens.ComponentManipulativeMin}, ${ShomaraTokens.ComponentManipulativeMax}]"
        }
    }

    /** Math geometry is always LTR, independent of the RTL interface direction. */
    fun mathDirection(@Suppress("UNUSED_PARAMETER") interfaceDirection: LayoutDirection): LayoutDirection =
        LayoutDirection.Ltr
}

/**
 * Tap-first reducer — the full drag-free alternative so TalkBack and motor-challenged children
 * never depend on drag gestures (COMPONENT_READINESS Manipulative row). Placement rules come
 * from the caller (learning runtime); the component never judges correctness itself.
 */
data class ShomaraManipulativeSession(
    val tileIds: List<String>,
    val selectedId: String? = null,
    val placedIds: Set<String> = emptySet(),
    val stateByTile: Map<String, ShomaraManipulativeState> = emptyMap(),
) {
    init {
        require(tileIds.isNotEmpty()) { "manipulative session needs tiles" }
    }

    fun stateOf(tileId: String): ShomaraManipulativeState =
        stateByTile[tileId] ?: if (tileId in placedIds) ShomaraManipulativeState.Accepted else ShomaraManipulativeState.Idle

    private fun with(tileId: String, state: ShomaraManipulativeState): ShomaraManipulativeSession =
        copy(stateByTile = stateByTile + (tileId to state))

    /** Tap 1 selects (Active); tap on the same tile deselects (Idle); tap on a second tile places. */
    fun onTap(tileId: String, locked: Set<String> = emptySet(), placementRule: (selectedId: String, targetId: String) -> Boolean): ShomaraManipulativeSession {
        require(tileId in tileIds) { "unknown tile $tileId" }
        if (tileId in locked || stateOf(tileId) == ShomaraManipulativeState.Locked) return this
        val selected = selectedId
        return when {
            selected == null -> with(tileId, ShomaraManipulativeState.Active).copy(selectedId = tileId)
            selected == tileId -> with(tileId, ShomaraManipulativeState.Idle).copy(selectedId = null)
            else -> {
                val accepted = placementRule(selected, tileId)
                val afterSource = with(selected, if (accepted) ShomaraManipulativeState.Accepted else ShomaraManipulativeState.Retry)
                afterSource.with(tileId, if (accepted) ShomaraManipulativeState.Accepted else ShomaraManipulativeState.Idle)
                    .copy(selectedId = null, placedIds = if (accepted) placedIds + tileId else placedIds)
            }
        }
    }

    /** Drag alternative: mirrors the tap flow — drag start arms the tile, drop applies placement. */
    fun onDragStart(tileId: String, locked: Set<String> = emptySet()): ShomaraManipulativeSession =
        if (tileId in locked || stateOf(tileId) == ShomaraManipulativeState.Locked) this
        else with(tileId, ShomaraManipulativeState.Dragging).copy(selectedId = tileId)

    fun onDragEnd(targetId: String, placementRule: (selectedId: String, targetId: String) -> Boolean): ShomaraManipulativeSession {
        val selected = selectedId ?: return this
        if (targetId !in tileIds) return copy(selectedId = null)
        val accepted = placementRule(selected, targetId)
        return with(selected, if (accepted) ShomaraManipulativeState.Accepted else ShomaraManipulativeState.Retry)
            .with(targetId, if (accepted) ShomaraManipulativeState.Accepted else ShomaraManipulativeState.Idle)
            .copy(selectedId = null, placedIds = if (accepted) placedIds + targetId else placedIds)
    }

    fun clearTransient(): ShomaraManipulativeSession =
        copy(stateByTile = stateByTile.mapValues { (_, s) -> if (s == ShomaraManipulativeState.Retry || s == ShomaraManipulativeState.Dragging || s == ShomaraManipulativeState.Active) ShomaraManipulativeState.Idle else s })
}

/** Non-color status carrier per manipulative state. */
fun ShomaraManipulativeState.stateLabel(): String = when (this) {
    ShomaraManipulativeState.Idle -> ""
    ShomaraManipulativeState.Active -> "انتخاب شد"
    ShomaraManipulativeState.Dragging -> "در حال جابه‌جایی"
    ShomaraManipulativeState.Accepted -> "درست قرار گرفت"
    ShomaraManipulativeState.Retry -> "دوباره تلاش کن"
    ShomaraManipulativeState.Locked -> "قفل"
}

private fun manipulativeColors(state: ShomaraManipulativeState): Triple<Color, Color, Color> = when (state) {
    ShomaraManipulativeState.Accepted -> Triple(ShomaraTokens.ColorPrimarySoft, ShomaraTokens.ColorPrimary, ShomaraTokens.ColorPrimaryDark)
    ShomaraManipulativeState.Retry -> Triple(ShomaraTokens.ColorAmberSoft, ShomaraTokens.ColorAmberEdge, ShomaraTokens.ColorAmberInk)
    ShomaraManipulativeState.Active, ShomaraManipulativeState.Dragging -> Triple(ShomaraTokens.ColorSkySoft, ShomaraTokens.ColorSky, ShomaraTokens.ColorInk)
    ShomaraManipulativeState.Locked -> Triple(ShomaraTokens.ColorSurfaceAlt, ShomaraTokens.ColorLine2, ShomaraTokens.ColorMuted)
    ShomaraManipulativeState.Idle -> Triple(ShomaraTokens.ColorSurface, ShomaraTokens.ColorLine, ShomaraTokens.ColorInk)
}

/** A single educational manipulative tile (number/shape token), always tap-accessible. */
@Composable
fun ShomaraNumberTile(
    tileId: String,
    label: String,
    state: ShomaraManipulativeState,
    onTap: (String) -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = ShomaraManipulativeRules.ManipulativeTarget,
    enabled: Boolean = true,
) {
    ShomaraManipulativeRules.requireBand(size)
    val (container, border, content) = manipulativeColors(state)
    val semanticsLabel = state.stateLabel()
    // Batch 2 (ADR-0040 R1): a manipulative tile is tactile, so it renders
    // its clay depth — Soft for every interactive tile, Flat for a locked
    // tile (quiet, non-affordant, like a disabled button).
    val tileDepth = if (state == ShomaraManipulativeState.Locked) ShomaraClayDepth.Flat else ShomaraClayDepth.Soft
    // N08-03: the 72–80dp band is the MINIMUM educational target, not a fixed box. A 40sp digit
    // becomes 80sp at 200% font scale; a fixed .size() clipped it, so the tile grows instead.
    // F-40: a locked tile is not a button — no role, no click action. TalkBack reads the
    // label plus the «قفل» state, never «دکمه».
    val tappable = enabled && state != ShomaraManipulativeState.Locked
    Box(
        modifier = modifier
            .defaultMinSize(minWidth = size, minHeight = size)
            .shadow(ShomaraClay.specFor(tileDepth).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, border, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .semantics {
                if (tappable) role = Role.Button
                contentDescription = label
                if (semanticsLabel.isNotEmpty()) stateDescription = semanticsLabel
            }
            .then(if (tappable) Modifier.clickable(role = Role.Button) { onTap(tileId) } else Modifier)
            .padding(ShomaraTokens.Space8),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = label, style = ShomaraTypography.BigNum, color = content, textAlign = TextAlign.Center)
    }
}

/** Bead-style counting grid; every bead is a 48dp+ target (token-driven). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ShomaraCountersGrid(
    count: Int,
    modifier: Modifier = Modifier,
    onBeadTap: (Int) -> Unit = {},
    enabled: Boolean = true,
) {
    require(count >= 0) { "bead count must be non-negative" }
    // Batch 2 (ADR-0040 R1): beads are tappable, so they render Soft clay
    // depth when enabled and stay Flat when the grid is disabled.
    val beadDepth = if (enabled) ShomaraClayDepth.Soft else ShomaraClayDepth.Flat
    // F-37: a FlowRow wraps the beads onto the next line instead of a Column
    // growing past the screen — a 20-bead count never overflows vertically.
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        modifier = modifier,
    ) {
        repeat(count) { index ->
            Box(
                modifier = Modifier
                    // N08-03: the bead is a minimum target with no text inside, so a fixed size is
                    // correct here — it carries no label that could clip. Kept as defaultMinSize so
                    // an ancestor that grows the row never shrinks the touch target below 48dp.
                    .defaultMinSize(minWidth = ShomaraTokens.ComponentTrayBead, minHeight = ShomaraTokens.ComponentTrayBead)
                    .shadow(ShomaraClay.specFor(beadDepth).elevation, RoundedCornerShape(ShomaraTokens.RadiusPill))
                    .background(ShomaraTokens.ColorPrimarySoft, RoundedCornerShape(ShomaraTokens.RadiusPill))
                    .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorPrimary, RoundedCornerShape(ShomaraTokens.RadiusPill))
                    .semantics {
                        role = Role.Button
                        contentDescription = "مهره ${ShomaraDigits.toFa(index + 1)}"
                    }
                    .clickable(enabled = enabled, role = Role.Button) { onBeadTap(index) },
            )
        }
    }
}

/** Equation slots render strictly LTR inside the RTL interface (N03-08 acceptance). */
@Composable
fun ShomaraEquationSlot(
    operands: List<String>,
    modifier: Modifier = Modifier,
    operators: List<String> = emptyList(),
) {
    CompositionLocalProvider(LocalLayoutDirection provides ShomaraManipulativeRules.mathDirection(LocalLayoutDirection.current)) {
        Row(horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8), modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
            operands.forEachIndexed { index, operand ->
                Text(
                    text = operand,
                    style = ShomaraTypography.BigNum,
                    color = ShomaraTokens.ColorInk,
                    modifier = Modifier.semantics {
                        contentDescription = "گام ${ShomaraDigits.toFa(index + 1)}: $operand"
                    },
                )
                if (index < operands.lastIndex) {
                    // F-37: a missing operator is a caller defect, not a «?» to render — fail
                    // loudly instead of teaching the child a placeholder glyph as maths.
                    require(index < operators.size) { "operator missing between operand $index and ${index + 1}" }
                    val operator = operators[index]
                    Text(text = operator, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk2)
                }
            }
        }
    }
}
