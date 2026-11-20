package com.mathlearning.core.designsystem.lessontemplates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S2 acceptance — pure logic for the four «دستهٔ یک» templates (T01, T02, T03, T15).
 *
 * Each test block quotes the stage5 acceptance line it proves:
 *  - T01: 5 objects ⇒ 1..5 in touch order; a repeat tap creates no new number; 250ms gap;
 *    a wrong answer is a retry (the verdict itself stays with the evaluator).
 *  - T02: 7 taps ⇒ one complete five-group + 2 strokes; undo removes the last stroke only;
 *    the fifth stroke is diagonal; sum-mode groups only open after a closed five.
 *  - T03: transferring 2 fingers keeps the total; target 7 accepts 4+3 AND 5+2; each hand
 *    ≤ 5; left/right are never mirrored into each other by the logic.
 *  - T15: three options unique; the correct card lands in different positions per seed.
 */
class LessonTemplatesLogicTest {

    // ---------------------------------------------------------------- T01

    private fun t01(count: Int) = T01CountLogic(List(count) { "o$it" })

    @Test
    fun `t01 counts in touch order 1 to n`() {
        val logic = t01(5)
        var tapped = emptyList<String>()
        var lastAccepted = 0L
        listOf("o2", "o0", "o4", "o1", "o3").forEachIndexed { i, id ->
            val now = lastAccepted + T01CountLogic.MIN_ACCEPT_GAP_MS
            assertTrue(logic.createsCount(tapped.toSet(), id, lastAccepted, now))
            tapped = tapped + id
            lastAccepted = now
            assertEquals(i + 1, logic.numberForCount(tapped.size))
        }
        assertTrue(logic.allCounted(tapped.toSet()))
    }

    @Test
    fun `t01 a repeat tap never creates a new number`() {
        val logic = t01(5)
        val tapped = listOf("o0", "o1")
        assertFalse(
            logic.createsCount(tapped.toSet(), "o1", lastAcceptedAtMs = 0L, nowMs = 10_000L),
        )
        assertEquals(2, logic.numberForCount(tapped.size))
    }

    @Test
    fun `t01 taps faster than 250ms are ignored`() {
        val logic = t01(5)
        assertFalse(logic.createsCount(emptySet(), "o0", lastAcceptedAtMs = 1_000L, nowMs = 1_249L))
        assertTrue(logic.createsCount(emptySet(), "o0", lastAcceptedAtMs = 1_000L, nowMs = 1_250L))
    }

    @Test
    fun `t01 answering before counting everything flags the h1 moment`() {
        val logic = t01(5)
        val facts = logic.countQuestionFacts(tappedIds = setOf("o0", "o1", "o2", "o3"), answeredValue = 4)
        assertTrue(facts.answeredEarly)
        assertEquals(4, facts.counted)
        val complete = logic.countQuestionFacts(tappedIds = logic.objectIds.toSet(), answeredValue = 5)
        assertFalse(complete.answeredEarly)
    }

    @Test
    fun `t01 scatter layout is deterministic per seed and never overlaps`() {
        val a = (0 until 6).map { T01ScatterLayout.slotFor(6, it, seed = 42L) }
        val b = (0 until 6).map { T01ScatterLayout.slotFor(6, it, seed = 42L) }
        assertEquals(a, b)
        assertEquals(6, a.toSet().size) // no two objects share a cell
        val c = (0 until 6).map { T01ScatterLayout.slotFor(6, it, seed = 7L) }
        assertNotEquals(a, c)
    }

    // ---------------------------------------------------------------- T02

    private fun t02(count: Int = 8) = T02TallyLogic(List(count) { "o$it" })

    @Test
    fun `t02 seven taps make one closed five plus two strokes`() {
        val logic = t02()
        var strokes = emptyList<String>()
        repeat(7) { strokes = logic.addStroke(strokes, "o$it") }
        assertEquals(7, strokes.size)
        val groups = logic.groups(strokes)
        assertEquals(2, groups.size)
        assertEquals(5, groups[0].size)
        assertTrue(groups[0].closed)
        assertEquals(2, groups[1].size)
        assertFalse(groups[1].closed)
    }

    @Test
    fun `t02 the fifth stroke of each group is the diagonal`() {
        val logic = t02()
        assertFalse(logic.isDiagonalFifth(0))
        assertFalse(logic.isDiagonalFifth(3))
        assertTrue(logic.isDiagonalFifth(4))
        assertFalse(logic.isDiagonalFifth(5))
        assertTrue(logic.isDiagonalFifth(9))
    }

    @Test
    fun `t02 undo removes exactly the last stroke`() {
        val logic = t02()
        var strokes = listOf("o0", "o1", "o2")
        strokes = logic.undo(strokes)
        assertEquals(listOf("o0", "o1"), strokes)
        assertEquals(emptyList<String>(), logic.undo(emptyList()))
    }

    @Test
    fun `t02 a duplicate tap adds no stroke`() {
        val logic = t02()
        val strokes = logic.addStroke(listOf("o0"), "o0")
        assertEquals(1, strokes.size)
    }

    @Test
    fun `t02 make target never exceeds the tray and sum only opens a group after five`() {
        val logic = t02()
        assertTrue(logic.canMakeTarget(7, trayCapacity = 8))
        assertFalse(logic.canMakeTarget(9, trayCapacity = 8))
        assertTrue(logic.canStartNextGroup(0))
        assertTrue(logic.canStartNextGroup(5))
        assertFalse(logic.canStartNextGroup(3))
    }

    // ---------------------------------------------------------------- T03

    @Test
    fun `t03 transfer keeps the total`() {
        val hands = T03Hands(left = listOf(true, true, true, false, false), right = List(5) { false })
        assertEquals(3, hands.total())
        val after = hands.transfer(from = T03Hand.Left, to = T03Hand.Right, fingers = 2)
        assertEquals(3, after.total())
        assertEquals(1, after.openLeft())
        assertEquals(2, after.openRight())
    }

    @Test
    fun `t03 target 7 accepts both 4 plus 3 and 5 plus 2`() {
        val fourThree = T03Hands(
            left = listOf(true, true, true, true, false),
            right = listOf(true, true, true, false, false),
        )
        val fiveTwo = T03Hands(
            left = listOf(true, true, true, true, true),
            right = listOf(true, true, false, false, false),
        )
        assertTrue(fourThree.acceptsTarget(7, anyDecomposition = true))
        assertTrue(fiveTwo.acceptsTarget(7, anyDecomposition = true))
        assertTrue(fourThree.showsNumber(7))
        assertTrue(fiveTwo.showsNumber(7))
    }

    @Test
    fun `t03 each hand never exceeds five and an impossible transfer is a no-op`() {
        val full = T03Hands(left = List(5) { true }, right = List(5) { true })
        assertEquals(10, full.total())
        assertEquals(full, full.transfer(from = T03Hand.Left, to = T03Hand.Right, fingers = 1))
        val one = T03Hands(left = listOf(true, false, false, false, false))
        assertEquals(one, one.transfer(from = T03Hand.Left, to = T03Hand.Right, fingers = 2))
    }

    @Test
    fun `t03 toggling a finger flips exactly that finger`() {
        val hands = T03Hands().toggle(T03Hand.Left, 0).toggle(T03Hand.Right, 4)
        assertEquals(1, hands.openLeft())
        assertEquals(1, hands.openRight())
        assertEquals(2, hands.total())
    }

    @Test
    fun `t03 five on shoulder decomposes 6 to 10`() {
        assertEquals(5 to 1, T03FiveOnShoulder.decomposition(6))
        assertEquals(5 to 5, T03FiveOnShoulder.decomposition(10))
        assertNull(T03FiveOnShoulder.decomposition(11))
        assertNull(T03FiveOnShoulder.decomposition(5))
    }

    // ---------------------------------------------------------------- T15

    private fun options(correctDisplay: String = "۵") = listOf(
        T15OptionSpec(optionId = "opt-5", displayKey = "۵", isCorrect = correctDisplay == "۵"),
        T15OptionSpec(optionId = "opt-4", displayKey = "۴", isCorrect = correctDisplay == "۴"),
        T15OptionSpec(optionId = "opt-6", displayKey = "۶", isCorrect = correctDisplay == "۶"),
    )

    @Test
    fun `t15 options must be unique and contain exactly one correct`() {
        T15PlacementLogic.requiresUnique(options())
        val placement = T15PlacementLogic.place(options(), seed = 1L)
        assertEquals(3, placement.options.size)
        assertEquals(3, placement.options.map { it.displayKey }.toSet().size)
        assertEquals(1, placement.options.count { it.isCorrect })
    }

    @Test
    fun `t15 the correct card moves position across seeds`() {
        val positions = (1L..12L).map { seed -> T15PlacementLogic.place(options(), seed).correctIndex }
        assertTrue(positions.toSet().size >= 2)
        // and placement is deterministic per seed (screenshot safety)
        assertEquals(
            T15PlacementLogic.place(options(), seed = 9L).options.map { it.optionId },
            T15PlacementLogic.place(options(), seed = 9L).options.map { it.optionId },
        )
    }

    @Test
    fun `t15 h1 eliminates exactly one wrong option`() {
        val placement = T15PlacementLogic.place(options(), seed = 3L)
        val eliminated = placement.eliminatedWrongIndex()
        assertTrue(eliminated != null && eliminated != placement.correctIndex)
        // after elimination the correct card is still present and enabled
        assertTrue(placement.options[eliminated!!].isCorrect.not())
    }

    @Test
    fun `t15 duplicate displays are rejected as a content bug`() {
        val duplicates = listOf(
            T15OptionSpec("a", "۵", isCorrect = true),
            T15OptionSpec("b", "۵", isCorrect = false),
        )
        var threw = false
        try {
            T15PlacementLogic.requiresUnique(duplicates)
        } catch (e: IllegalArgumentException) {
            threw = true
        }
        assertTrue(threw)
    }

    // ---------------------------------------------------------------- countPulse moment

    @Test
    fun `count pulse is 400ms with motion and keeps a static ring without it`() {
        assertEquals(400, ShomaraCountPulseLogic.pulseMs(reducedMotion = false))
        assertEquals(0, ShomaraCountPulseLogic.pulseMs(reducedMotion = true))
        assertEquals(600, ShomaraCountPulseLogic.staticRingMs(reducedMotion = true))
        assertTrue(ShomaraCountPulseLogic.showsRing(reducedMotion = true))
    }
}
