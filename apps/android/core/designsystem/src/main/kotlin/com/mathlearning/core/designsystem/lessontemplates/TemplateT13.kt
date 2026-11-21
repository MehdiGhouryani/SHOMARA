package com.mathlearning.core.designsystem.lessontemplates

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * S3b · stage5 §T13 «ردگیری عدد» — the tracing template.
 *
 * The writing box is ≥240dp (stage5), shows the reference stroke faintly with the start dot
 * and an optional arrow, and records the child's finger as samples. The verdict comes from
 * [TraceSession] only — corridor + direction + arrival — never from handwriting recognition.
 * A rejected trace shows a calm retry cue, not an error mark.
 */
@Composable
fun TemplateT13(
    stroke: TraceStroke,
    state: LessonTemplateState,
    onTraceFinished: (TraceVerdict) -> Unit,
    modifier: Modifier = Modifier,
    showStartDot: Boolean = true,
    showArrows: Boolean = true,
    toleranceDp: Float = TraceSession.DEFAULT_TOLERANCE_DP,
) {
    var samples by remember(stroke) { mutableStateOf<List<TracePoint>>(emptyList()) }
    var verdict by remember(stroke) { mutableStateOf<TraceVerdict?>(null) }
    val session = remember(stroke) { TraceSession(stroke, toleranceDp) }
    // The verdict is reported once: an accepted trace must not re-report on recomposition.
    var reported by remember(stroke) { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
        Box(
            // The writing box is the stage5 minimum SQUARE (a fixed 240dp), so the old
            // `fillMaxWidth().size(...)` chain was contradictory: `size` always won and the
            // fillMaxWidth step only misled the reader.
            modifier = Modifier
                .size(TraceSession.MIN_BOX_DP.dp)
                .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .border(
                    width = ShomaraTokens.ClaySoftBorderWidth,
                    color = ShomaraTokens.ColorLine,
                    shape = RoundedCornerShape(ShomaraTokens.RadiusMd),
                )
                .semantics { contentDescription = "ناحیهٔ نوشتن" }
                .pointerInput(stroke) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            samples = emptyList()
                            verdict = null
                            reported = false
                        },
                        onDragEnd = {
                            val result = session.finish()
                            verdict = result
                            if (!reported) {
                                reported = true
                                onTraceFinished(result)
                            }
                        },
                        onDragCancel = {
                            samples = emptyList()
                            verdict = null
                            reported = false
                        },
                    ) { change, _ ->
                        val point = TracePoint(change.position.x / size.width * 240f, change.position.y / size.height * 240f)
                        samples = samples + point
                        session.onSample(point)
                        change.consume()
                    }
                },
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val scaleX = size.width / 240f
                val scaleY = size.height / 240f
                fun toCanvas(p: TracePoint) = Offset(p.x * scaleX, p.y * scaleY)
                // The ghost glyph: the reference stroke, faint.
                stroke.points.zipWithNext { a, b ->
                    drawLine(
                        color = ShomaraTokens.ColorLine2,
                        start = toCanvas(a),
                        end = toCanvas(b),
                        strokeWidth = ShomaraTokens.Space8.toPx(),
                        cap = StrokeCap.Round,
                    )
                }
                // The start dot (h1 support).
                if (showStartDot) {
                    drawCircle(
                        color = ShomaraTokens.ColorPrimary,
                        radius = ShomaraTokens.Space8.toPx(),
                        center = toCanvas(stroke.points.first()),
                    )
                }
                // The child's trail: the primary colour, soft.
                samples.zipWithNext { a, b ->
                    drawLine(
                        color = ShomaraTokens.ColorPrimary,
                        start = toCanvas(a),
                        end = toCanvas(b),
                        strokeWidth = ShomaraTokens.Space12.toPx(),
                        cap = StrokeCap.Round,
                    )
                }
                // A rejected trace is drawn with a dashed-looking thin outline: calm, not alarming.
                if (verdict?.accepted == false) {
                    stroke.points.zipWithNext { a, b ->
                        drawLine(
                            color = ShomaraTokens.ColorAmber,
                            start = toCanvas(a),
                            end = toCanvas(b),
                            strokeWidth = ShomaraTokens.Space4.toPx(),
                        )
                    }
                }
                if (showArrows) {
                    val last = stroke.points.last()
                    val beforeLast = stroke.points[stroke.points.lastIndex - 1]
                    drawCircle(
                        color = ShomaraTokens.ColorAmber,
                        radius = ShomaraTokens.Space4.toPx(),
                        center = toCanvas(TracePoint((last.x + beforeLast.x) / 2f, (last.y + beforeLast.y) / 2f)),
                        style = Stroke(ShomaraTokens.Space4.toPx()),
                    )
                }
            }
        }
        if (verdict?.accepted == false) {
            Text(
                text = "یک بار دیگر از نقطهٔ شروع",
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
        }
    }
}
