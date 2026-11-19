package com.mathlearning.feature.path

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.shomaraPrimaryCta
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.StationNodeMeta

/** One continuous winding-path row; connector and label use the same measured geometry. */
@Composable
internal fun ShomaraPathNodeItem(
    claimsPrimaryCta: Boolean = true,
    meta: StationNodeMeta,
    state: ShomaraPathNodeState,
    isRtl: Boolean,
    contentWidth: Dp,
    canvasColor: Color,
    onStationTap: (String) -> Unit,
    ringFraction: Float? = null,
    bubbleLabel: String = "شروع",
) {
    val globalIndex = meta.ordinal - 1
    val isCurrent = state == ShomaraPathNodeState.Current
    val exitOffset = ShomaraPathGraphLogic.zigzagOffsetDp(globalIndex, isRtl, contentWidth)
    val accent = ShomaraPathGraphLogic.accentFor(meta.chapter)
    val colors = ShomaraPathGraphLogic.colorsFor(state, meta.chapter)
    val nodeSize = if (isCurrent) ShomaraTokens.ComponentNodeCurrent else ShomaraTokens.ComponentNodeSize
    val stateLabel = ShomaraPathGraphLogic.stateLabelFor(state)

    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val pressSink = if (isPressed) ShomaraTokens.ComponentEdge else 0.dp
    var isFocused by remember(meta.id) { mutableStateOf(false) }
    val containerDepth = ShomaraPathGraphLogic.depthFor(state)

    BoxWithConstraints(modifier = Modifier.padding(bottom = ShomaraTokens.Space24)) {
        val half = (maxWidth - PathNodeColumnWidth) / 2f
        // DT-79: the stroke must reach the NEXT node's circle. The next row's circle center
        // sits one item below: this canvas ends 24dp (the item's bottom padding) above the
        // next item's top, then the circle center is 36dp in (42dp for a Current row with
        // its 12dp spacer). 68dp covers the normal center exactly and lands inside the
        // circle for the taller Current row; an overshoot hides behind the next circle
        // (later items draw on top), an undershoot would show a gap.
        val connectorBottom = if (meta.ordinal < com.mathlearning.core.model.ShomaraStationCatalog.STATION_COUNT) {
            ShomaraTokens.Space24 + ShomaraTokens.ComponentNodeSize / 2f + ShomaraTokens.Space8
        } else {
            0.dp
        }

        Canvas(
            modifier = Modifier
                .matchParentSize()
                .offset(x = half + exitOffset)
                .clearAndSetSemantics {},
        ) {
            // DT-79 GEOMETRY (measured on device with calibration dots): this Canvas matches the
            // BoxWithConstraints, which wraps the node column — so it is exactly
            // PathNodeColumnWidth (160dp) wide and moves WITH the node column (same offset).
            // The node circle's center is therefore at the canvas's own center in LOCAL
            // coordinates, and drawing runs left-to-right.
            val localCenter = size.width / 2f
            // DT-79 CRITICAL FIX (direction): the node Box anchors at the item's START edge and
            // `Modifier.offset` moves it toward END as the offset value grows. In RTL that is
            // LEFTWARD — the OPPOSITE of the canvas's local x-axis — so the horizontal delta to
            // the next node must be NEGATED in RTL. On device the un-negated delta mirrored
            // every connector: the ST01→ST02 stroke ran to x=936 while ST02 sits at x=446.
            val directionSign = if (isRtl) -1f else 1f
            val nextOffset = ShomaraPathGraphLogic.zigzagOffsetDp(globalIndex + 1, isRtl, contentWidth)
            val nextCenter = localCenter + directionSign * (nextOffset - exitOffset).toPx()
            val strokePx = ShomaraTokens.Space12.toPx()
            // The curve starts at THIS node's circle center (36dp below the item top) and
            // lands at the next node's circle center; a single cubic whose control points
            // keep the tangent vertical at both ends, so the winding reads as one path.
            val startY = ShomaraTokens.ComponentNodeSize.toPx() / 2f
            val endY = size.height + connectorBottom.toPx()
            val c1y = startY + (endY - startY) * 0.33f
            val c2y = startY + (endY - startY) * 0.67f
            val connector = Path().apply {
                moveTo(localCenter, startY)
                cubicTo(localCenter, c1y, nextCenter, c2y, nextCenter, endY)
            }
            val connectorColor = if (state == ShomaraPathNodeState.Completed || state == ShomaraPathNodeState.Perfect) {
                accent
            } else {
                ShomaraTokens.ColorLine2
            }
            drawPath(path = connector, color = connectorColor, style = Stroke(width = strokePx, cap = StrokeCap.Round))
        }

        Box(modifier = Modifier.offset(x = half + exitOffset)) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .defaultMinSize(minWidth = ShomaraTokens.ComponentNodeSize, minHeight = ShomaraTokens.ComponentNodeSize)
                    .semantics(mergeDescendants = true) {
                        role = Role.Button
                        contentDescription = meta.workingTitle
                        stateDescription = stateLabel
                        if (isCurrent) {
                    selected = true
                    // DT-40: on Home the dedicated Continue card (handoff C05) owns the single
                    // primary action, so the node only claims it where no such card is rendered.
                    // The caller decides; this composable never guesses twice in one viewport.
                    if (claimsPrimaryCta) {
                        shomaraPrimaryCta = true
                    }
                }
                    }
                    .clickable(
                        enabled = ShomaraPathGraphLogic.tapEnabled(state),
                        interactionSource = interactionSource,
                        indication = null,
                    ) { onStationTap(meta.id) }
                    .onFocusChanged { isFocused = it.isFocused },
            ) {
                Spacer(modifier = Modifier.height(if (isCurrent) ShomaraTokens.Space12 else 0.dp))
                ShomaraPathNodeCircle(
                    state = state,
                    colors = colors,
                    size = nodeSize,
                    pressed = isPressed,
                    pressSink = pressSink,
                    depth = containerDepth,
                    focused = isFocused,
                    ringFraction = ringFraction,
                )
                if (isCurrent) {
                    Spacer(modifier = Modifier.height(ShomaraTokens.Space8))
                    ShomaraAnchorBubble(
                        text = bubbleLabel,
                        accent = colors.container,
                        border = colors.edge,
                    )
                    Spacer(modifier = Modifier.height(ShomaraTokens.Space8))
                } else {
                    Spacer(modifier = Modifier.height(ShomaraTokens.Space8))
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .size(width = PathNodeColumnWidth, height = Dp.Unspecified)
                        .background(canvasColor, RoundedCornerShape(ShomaraTokens.RadiusSm))
                        .padding(horizontal = ShomaraTokens.Space4),
                ) {
                    Text(
                        text = "ایستگاه ${ShomaraDigits.toFa(meta.ordinal)} · ${meta.workingTitle}",
                        style = ShomaraTypography.Caption,
                        color = ShomaraTokens.ColorInk,
                        textAlign = TextAlign.Center,
                    )
                    Text(
                        text = if (state == ShomaraPathNodeState.Locked) {
                            ShomaraPathGraphLogic.lockedShortLabel
                        } else {
                            stateLabel
                        },
                        style = ShomaraTypography.Caption,
                        color = ShomaraTokens.ColorInk2,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }
    }
}

/** Decorative pointer above the Current station's single action. */
@Composable
private fun ShomaraAnchorBubble(text: String, accent: Color, border: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Canvas(modifier = Modifier.size(ShomaraTokens.Space16, ShomaraTokens.Space8)) {
            val path = Path().apply {
                moveTo(0f, 0f)
                lineTo(size.width / 2f, size.height)
                lineTo(size.width, 0f)
                close()
            }
            drawPath(path = path, color = border)
            val inner = Path().apply {
                moveTo(ShomaraTokens.Space4.toPx(), 0f)
                lineTo(size.width / 2f, size.height - ShomaraTokens.ComponentEdge.toPx())
                lineTo(size.width - ShomaraTokens.Space4.toPx(), 0f)
                close()
            }
            drawPath(path = inner, color = accent)
        }
        Text(
            text = text,
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorHomeOnViolet,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .clearAndSetSemantics {}
                .shadow(
                    ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation,
                    RoundedCornerShape(ShomaraTokens.RadiusMd),
                )
                .background(accent, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .padding(horizontal = ShomaraTokens.Space16, vertical = ShomaraTokens.Space8),
        )
    }
}

/** Tactile node with redundant vector/status cues; ordinal remains in the accessible text label. */
@Composable
private fun ShomaraPathNodeCircle(
    state: ShomaraPathNodeState,
    colors: ShomaraNodeColors,
    size: Dp,
    pressed: Boolean,
    pressSink: Dp,
    depth: ShomaraClayDepth,
    focused: Boolean,
    ringFraction: Float? = null,
) {

    Box(contentAlignment = Alignment.Center) {
        if (ringFraction != null) {
            ShomaraSegmentedProgressRing(
                fraction = ringFraction,
                fillColor = ShomaraTokens.ColorHomeViolet,
                trackColor = ShomaraTokens.ColorHomeVioletSoft,
                modifier = Modifier.size(ShomaraTokens.ComponentNodeCurrent + ShomaraTokens.Space16),
            )
        }
        Box(
            modifier = Modifier
                .size(size)
                .shadow(
                    elevation = ShomaraClay.specFor(depth).elevation,
                    shape = CircleShape,
                    clip = true,
                )
                .offset(y = pressSink)
                .drawBehind {
                    val radius = this.size.minDimension / 2f
                    val center = Offset(this.size.width / 2f, this.size.height / 2f)
                    val edgePx = ShomaraTokens.ComponentEdge.toPx()
                    drawCircle(color = colors.edge, radius = radius, center = center.copy(y = center.y + edgePx / 2f))
                    drawCircle(color = colors.container, radius = radius, center = center)
                    if (state == ShomaraPathNodeState.Perfect) {
                        drawCircle(
                            color = ShomaraTokens.ColorHomeAmber,
                            radius = radius - ShomaraTokens.Space4.toPx() / 2f,
                            center = center,
                            style = Stroke(width = ShomaraTokens.Space4.toPx()),
                        )
                    }
                    if (focused) {
                        drawCircle(
                            color = ShomaraTokens.ColorHomeVioletDark,
                            radius = radius - ShomaraTokens.Space8.toPx(),
                            center = center,
                            style = Stroke(width = ShomaraTokens.Space4.toPx()),
                        )
                    }
                    if (pressed) drawCircle(color = colors.edge.copy(alpha = 0.18f), radius = radius, center = center)
                },
            contentAlignment = Alignment.Center,
        ) {
            Image(
                painter = painterResource(
                    when (state) {
                        ShomaraPathNodeState.Current, ShomaraPathNodeState.Fresh -> R.drawable.shomara_ui_play
                        ShomaraPathNodeState.Completed, ShomaraPathNodeState.Perfect -> R.drawable.shomara_ui_check
                        ShomaraPathNodeState.Locked -> R.drawable.shomara_ui_lock
                    },
                ),
                contentDescription = null,
                colorFilter = ColorFilter.tint(colors.content),
                modifier = Modifier
                    .size(if (state == ShomaraPathNodeState.Current) ShomaraTokens.Space40 else ShomaraTokens.Space32)
                    .clearAndSetSemantics {},
            )
        }
    }
}

/** Real chapter progress around Current; dashes use canonical spacing only. */
@Composable
private fun ShomaraSegmentedProgressRing(
    fraction: Float,
    fillColor: Color,
    trackColor: Color,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier.fillMaxSize().clearAndSetSemantics {}) {
        val strokePx = ShomaraTokens.ComponentEdge.toPx()
        val inset = strokePx / 2f
        val arcSize = Size(size.width - strokePx, size.height - strokePx)
        val topLeft = Offset(inset, inset)
        drawArc(
            color = trackColor,
            startAngle = 0f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = strokePx),
        )
        if (fraction > 0f) {
            val segment = ShomaraTokens.Space12.toPx()
            val gap = ShomaraTokens.Space8.toPx()
            drawArc(
                color = fillColor,
                startAngle = -90f,
                sweepAngle = 360f * fraction.coerceIn(0f, 1f),
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(
                    width = strokePx,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(segment, gap), 0f),
                ),
            )
        }
    }
}
