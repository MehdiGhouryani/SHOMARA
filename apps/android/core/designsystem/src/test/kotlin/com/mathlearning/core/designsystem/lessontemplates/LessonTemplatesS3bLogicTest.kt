package com.mathlearning.core.designsystem.lessontemplates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S3b acceptance — pure logic for T08 (grid), T11 (story) and T13 (tracing).
 * Each block quotes the stage5 acceptance line it proves.
 */
class LessonTemplatesS3bLogicTest {

    // ---------------------------------------------------------------- T08

    private fun grid6() = T08GridLogic(size = 6, blockRows = 2, blockCols = 3)

    @Test
    fun `t08 a duplicate in the row is a conflict and is not recorded`() {
        val logic = grid6()
        val board = mapOf((0 to 0) to "A")
        val conflicts = logic.conflicts(board, row = 0, col = 2, symbol = "A")
        assertEquals(listOf(T08ConflictKind.Row), conflicts.map { it.kind })
        assertFalse(logic.wouldRecord(board, row = 0, col = 2, symbol = "A"))
        assertTrue(logic.wouldRecord(board, row = 0, col = 2, symbol = "B"))
    }

    @Test
    fun `t08 a duplicate in the column and in the block are separate conflicts`() {
        val logic = grid6()
        val columnBoard = mapOf((0 to 2) to "A")
        assertEquals(
            listOf(T08ConflictKind.Column),
            logic.conflicts(columnBoard, row = 4, col = 2, symbol = "A").map { it.kind },
        )
        // Block 0 covers rows 0..1 and columns 0..2, so (1,1) and (0,2) share a block while
        // sharing neither a row nor a column — exactly the block-only conflict case.
        val blockBoard = mapOf((1 to 1) to "A")
        assertEquals(
            listOf(T08ConflictKind.Block),
            logic.conflicts(blockBoard, row = 0, col = 2, symbol = "A").map { it.kind },
        )
    }

    @Test
    fun `t08 blocks tile the grid for every canonical size`() {
        val g4 = T08GridLogic(size = 4, blockRows = 2, blockCols = 2)
        val g9 = T08GridLogic(size = 9, blockRows = 3, blockCols = 3)
        assertEquals(listOf(0, 0, 1, 1), (0 until 4).map { g4.blockOf(0, it) })
        assertEquals(listOf(0, 0, 0, 1, 1, 1, 2, 2, 2), (0 until 9).map { g9.blockOf(0, it) })
        var threw = false
        try {
            T08GridLogic(size = 6, blockRows = 4, blockCols = 3)
        } catch (e: IllegalArgumentException) {
            threw = true
        }
        assertTrue("blocks that do not tile the grid must be rejected", threw)
    }

    @Test
    fun `t08 the grid is complete only when filled and conflict free`() {
        val logic = T08GridLogic(size = 4, blockRows = 2, blockCols = 2)
        val filled = buildMap {
            val symbols = listOf("A", "B", "C", "D")
            // A valid 4x4 Latin square in 2x2 blocks.
            val rows = listOf(
                listOf("A", "B", "C", "D"),
                listOf("C", "D", "A", "B"),
                listOf("B", "A", "D", "C"),
                listOf("D", "C", "B", "A"),
            )
            rows.forEachIndexed { r, row -> row.forEachIndexed { c, s -> put(r to c, s) } }
            require(symbols.size == 4)
        }
        assertTrue(logic.isComplete(filled))
        assertFalse(logic.isComplete(filled - (0 to 0)))
        assertFalse(logic.isComplete(filled + ((0 to 0) to "B")))
    }

    // ---------------------------------------------------------------- T11

    @Test
    fun `t11 the passengers story resolves to 12`() {
        val story = T11Story.passengersExample()
        assertEquals(12, story.resolve())
        assertTrue(story.acceptsNumeric(12))
        assertFalse(story.acceptsNumeric(16))
        assertFalse(story.acceptsCannotSolve())
    }

    @Test
    fun `t11 an insufficient story accepts only cannot-solve`() {
        val story = T11Story(start = 5, steps = listOf(), insufficient = true)
        assertNull(story.resolve())
        assertTrue(story.acceptsCannotSolve())
        assertFalse(story.acceptsNumeric(5))
        assertFalse(story.acceptsNumeric(0))
    }

    @Test
    fun `t11 extra information is not part of the solution`() {
        val story = T11Story(
            start = 10,
            steps = listOf(T11Step(T11Op.Remove, 3)),
            extraInfo = listOf(7),
        )
        assertEquals(7, story.resolve())
        assertEquals(setOf(10, 3), story.usedNumbers())
        assertFalse(story.usedNumbers().contains(7) && story.resolve() != 7)
    }

    @Test
    fun `t11 a story is at most three sentences and numbers stay at 20`() {
        var threw = false
        try {
            T11Story(start = 3, steps = listOf(), sentenceCount = 4)
        } catch (e: IllegalArgumentException) {
            threw = true
        }
        assertTrue(threw)
        var threw2 = false
        try {
            T11Story(start = 25, steps = listOf())
        } catch (e: IllegalArgumentException) {
            threw2 = true
        }
        assertTrue(threw2)
    }

    @Test
    fun `t11 two-step stories apply the steps in order`() {
        val story = T11Story(
            start = 8,
            steps = listOf(
                T11Step(T11Op.Remove, 3),
                T11Step(T11Op.Add, 5),
            ),
        )
        assertEquals(10, story.resolve())
    }

    // ---------------------------------------------------------------- T13

    private fun straightUp(): TraceStroke = TraceStroke(
        listOf(TracePoint(120f, 200f), TracePoint(120f, 40f)),
    )

    @Test
    fun `t13 a straight stroke from the bottom to the top is accepted`() {
        val session = TraceSession(straightUp())
        listOf(200f, 180f, 160f, 140f, 120f, 100f, 80f, 60f, 40f).forEach { y ->
            assertNull("sample y=$y must be accepted", session.onSample(TracePoint(121f, y)))
        }
        assertTrue(session.finish().accepted)
    }

    @Test
    fun `t13 drawing top to bottom is rejected for direction`() {
        val session = TraceSession(straightUp())
        // The child starts at the END point: the start-dot rule rejects it immediately.
        assertEquals(TraceReject.NotStartedAtStart, session.onSample(TracePoint(120f, 40f)))
        assertFalse(session.finish().accepted)
    }

    @Test
    fun `t13 a deviation larger than 28dp is rejected`() {
        val session = TraceSession(straightUp())
        assertNull(session.onSample(TracePoint(120f, 200f)))
        // 40dp to the side: outside the 28dp corridor.
        assertEquals(TraceReject.OutOfCorridor, session.onSample(TracePoint(160f, 180f)))
        assertFalse(session.finish().accepted)
    }

    @Test
    fun `t13 an unfinished stroke is not accepted`() {
        val session = TraceSession(straightUp())
        session.onSample(TracePoint(120f, 200f))
        session.onSample(TracePoint(120f, 140f))
        val verdict = session.finish()
        assertFalse(verdict.accepted)
        assertEquals(TraceReject.NotFinished, verdict.reject)
    }

    @Test
    fun `t13 going backwards mid stroke is rejected`() {
        // A long stroke: the direction slack tolerates a couple of samples of jitter, not a
        // real trip back to the start (a three-point stroke is too short to prove this).
        val stroke = TraceStroke((0..10).map { TracePoint(it * 20f, 0f) })
        val session = TraceSession(stroke, toleranceDp = 28f)
        assertNull(session.onSample(TracePoint(0f, 0f)))
        (1..10).forEach { index ->
            assertNull(session.onSample(TracePoint(index * 20f, 0f)))
        }
        // Travel back to near the start: well past the slack, that is backwards.
        assertEquals(TraceReject.WentBackwards, session.onSample(TracePoint(20f, 0f)))
    }

    @Test
    fun `t13 the canonical glyphs are single shapes and cover zero and one`() {
        assertNotNull(ShomaraTraceGlyphs.forNumeral("0"))
        assertNotNull(ShomaraTraceGlyphs.forNumeral("۱"))
        assertNull(ShomaraTraceGlyphs.forNumeral("۷"))
        assertTrue(ShomaraTraceGlyphs.zero().points.size >= 4)
        assertEquals(2, ShomaraTraceGlyphs.one().points.size)
        // The «۱» stroke starts at the BOTTOM (larger y) so the direction is up.
        assertTrue(ShomaraTraceGlyphs.one().points.first().y > ShomaraTraceGlyphs.one().points.last().y)
    }

    @Test
    fun `t13 tolerance and box come from the stage5 constants`() {
        assertEquals(28f, TraceSession.DEFAULT_TOLERANCE_DP)
        assertEquals(240, TraceSession.MIN_BOX_DP)
    }
}
