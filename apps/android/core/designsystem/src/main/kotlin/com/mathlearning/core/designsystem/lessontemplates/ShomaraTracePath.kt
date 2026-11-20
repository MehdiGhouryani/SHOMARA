package com.mathlearning.core.designsystem.lessontemplates

import kotlin.math.hypot

/**
 * S3b · `ShomaraTracePath.kt` — the reference path for number tracing (T13), with NO machine
 * learning and no handwriting recognition (stage5 «بدون تشخیص دست‌خط … بدون یادگیری ماشین»).
 *
 * The check is geometric and explained: a sample must stay inside a corridor of
 * [TraceSession.toleranceDp] around the reference polyline, must START near the start dot,
 * must not travel BACKWARDS along the stroke, and must END near the last point. That is the
 * whole acceptance contract of stage5 §T13:
 *  - a straight bottom→top line is accepted for «۱», top→bottom is rejected (direction);
 *  - a deviation larger than the tolerance is rejected;
 *  - one single canonical shape per numeral (no second glyph is invented).
 *
 * Coordinates are DPs inside the writing box (≥ 240dp per stage5), so the tolerance is a real
 * 28dp distance and not a fraction of an unknown screen.
 */
data class TracePoint(val x: Float, val y: Float)

/** A reference stroke: an ordered polyline the child must follow. */
data class TraceStroke(val points: List<TracePoint>) {
    init {
        require(points.size >= 2) { "a stroke needs at least two points" }
    }

    /** Shortest distance from [p] to this polyline (perpendicular for segments, not vertices). */
    fun distanceTo(p: TracePoint): Float {
        var best = Float.MAX_VALUE
        for (i in 0 until points.size - 1) {
            val d = distanceToSegment(p, points[i], points[i + 1])
            if (d < best) best = d
        }
        return best
    }

    /** The index of the reference point closest to [p] — the child's progress along the stroke. */
    fun nearestIndex(p: TracePoint): Int {
        var bestIndex = 0
        var best = Float.MAX_VALUE
        points.forEachIndexed { index, point ->
            val d = hypot(p.x - point.x, p.y - point.y)
            if (d < best) {
                best = d
                bestIndex = index
            }
        }
        return bestIndex
    }
}

/** Why a trace was rejected — the message shown to the child is never a blame, these are facts. */
enum class TraceReject { NotStartedAtStart, OutOfCorridor, WentBackwards, NotFinished }

data class TraceVerdict(val accepted: Boolean, val reject: TraceReject? = null) {
    init {
        require(accepted == (reject == null)) { "a verdict is accepted xor rejected" }
    }
}

/**
 * One tracing attempt. Feed every finger sample in order; the session keeps the furthest
 * reference index reached and judges each sample against the corridor and the direction.
 */
class TraceSession(
    private val stroke: TraceStroke,
    val toleranceDp: Float = DEFAULT_TOLERANCE_DP,
) {
    private var progressIndex = 0
    private var started = false
    private var rejected: TraceReject? = null

    /** Samples closer than this to an EARLIER index count as going backwards. */
    private val directionSlack = DIRECTION_SLACK_INDICES

    /** Feed one finger sample. Returns the verdict once a rejection is final, else null. */
    fun onSample(sample: TracePoint): TraceReject? {
        if (rejected != null) return rejected
        // 1) The corridor: everything the child draws must stay near the reference line.
        if (stroke.distanceTo(sample) > toleranceDp) {
            rejected = TraceReject.OutOfCorridor
            return rejected
        }
        // 2) The first sample must be at the start dot — this is what rejects drawing the
        //    stroke backwards (a top-to-bottom attempt starts far from the start point).
        if (!started) {
            val startDistance = hypot(sample.x - stroke.points.first().x, sample.y - stroke.points.first().y)
            if (startDistance > toleranceDp) {
                rejected = TraceReject.NotStartedAtStart
                return rejected
            }
            started = true
            progressIndex = 0
            return null
        }
        // 3) Direction: progress along the stroke never goes back beyond the slack.
        val nearest = stroke.nearestIndex(sample)
        if (nearest < progressIndex - directionSlack) {
            rejected = TraceReject.WentBackwards
            return rejected
        }
        if (nearest > progressIndex) progressIndex = nearest
        return null
    }

    /** Call when the finger lifts: the child must have reached the end of the stroke. */
    fun finish(): TraceVerdict {
        rejected?.let { return TraceVerdict(accepted = false, reject = it) }
        if (!started) return TraceVerdict(accepted = false, reject = TraceReject.NotStartedAtStart)
        val lastIndex = stroke.points.lastIndex
        if (progressIndex < lastIndex) return TraceVerdict(accepted = false, reject = TraceReject.NotFinished)
        return TraceVerdict(accepted = true)
    }

    /** How far along the stroke the child is (0..1) — used to ink the ghost glyph in proportion. */
    fun progressFraction(): Float =
        if (stroke.points.size <= 1) 1f else progressIndex.toFloat() / stroke.points.lastIndex

    companion object {
        /** stage5: «فاصلهٔ ≤ ۲۸ dp از مسیر مرجع». */
        const val DEFAULT_TOLERANCE_DP: Float = 28f

        /** Sampling noise tolerance for direction: a few indices of jitter are not backwards. */
        const val DIRECTION_SLACK_INDICES: Int = 2

        /** stage5: the writing box is at least 240dp. */
        const val MIN_BOX_DP: Int = 240
    }
}

/** Point-to-segment distance — the geometric core of the corridor check. */
private fun distanceToSegment(p: TracePoint, a: TracePoint, b: TracePoint): Float {
    val dx = b.x - a.x
    val dy = b.y - a.y
    val lengthSquared = dx * dx + dy * dy
    if (lengthSquared == 0f) return hypot(p.x - a.x, p.y - a.y)
    val t = (((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared).coerceIn(0f, 1f)
    val projection = TracePoint(a.x + t * dx, a.y + t * dy)
    return hypot(p.x - projection.x, p.y - projection.y)
}
