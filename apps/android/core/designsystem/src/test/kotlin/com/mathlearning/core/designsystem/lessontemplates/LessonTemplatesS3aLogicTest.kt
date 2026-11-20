package com.mathlearning.core.designsystem.lessontemplates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * S3a acceptance — pure logic for T04 (rods), T05 (pattern), T07 (symmetry) and the `fold`
 * moment. Each block quotes the stage5 acceptance line it proves.
 */
class LessonTemplatesS3aLogicTest {

    // ---------------------------------------------------------------- T04

    private fun rod(id: String, units: Int) = T04Rod(rodId = id, units = units, colorKey = "c")

    @Test
    fun `t04 seven is accepted as 4 plus 3 and as 5 plus 2`() {
        assertTrue(T04RodLogic.acceptsBuild(listOf(rod("a", 4), rod("b", 3)), target = 7))
        assertTrue(T04RodLogic.acceptsBuild(listOf(rod("a", 5), rod("b", 2)), target = 7))
        assertFalse(T04RodLogic.acceptsBuild(listOf(rod("a", 4), rod("b", 4)), target = 7))
        assertFalse(T04RodLogic.acceptsBuild(emptyList(), target = 7))
    }

    @Test
    fun `t04 compare mode knows the real ascending order of three lengths`() {
        val rods = listOf(rod("x", 5), rod("y", 2), rod("z", 8))
        assertEquals(listOf("y", "x", "z"), T04RodLogic.ascending(rods).map { it.rodId })
        assertTrue(T04RodLogic.acceptsOrder(listOf(rod("y", 2), rod("x", 5), rod("z", 8)), rods))
        assertFalse(T04RodLogic.acceptsOrder(listOf(rod("z", 8), rod("x", 5), rod("y", 2)), rods))
    }

    @Test
    fun `t04 the unit is derived from the lane and never below 32dp`() {
        assertEquals(32, T04RodLogic.unitDp(laneWidthDp = 200)) // 200/10 = 20 → floor 32
        assertEquals(36, T04RodLogic.unitDp(laneWidthDp = 360))
        assertEquals(41, T04RodLogic.unitDp(laneWidthDp = 412))
    }

    @Test
    fun `t04 rods snap contiguously and respect the early capacity`() {
        val placed = listOf(rod("a", 3), rod("b", 4))
        assertEquals(7, T04RodLogic.nextStartUnits(placed))
        assertTrue(T04RodLogic.fitsLane(placed, rod("c", 3), capacity = 10))
        assertFalse(T04RodLogic.fitsLane(placed, rod("c", 4), capacity = 10))
    }

    @Test
    fun `t04 difference mode leaves the rest`() {
        assertEquals(3, T04RodLogic.restAfterDifference(listOf(rod("a", 7)), listOf(rod("b", 4))))
    }

    // ---------------------------------------------------------------- T05

    @Test
    fun `t05 any filling consistent with the law is accepted`() {
        val logic = T05PatternLogic(unit = listOf("A", "B"), repeats = 3) // ABABAB
        assertTrue(logic.acceptsContinue(mapOf(0 to "A", 1 to "B", 4 to "A")))
        assertTrue(logic.acceptsContinue(mapOf(2 to "A")))
        // ABBA inside ABAB: the second cell must be B.
        assertFalse(logic.acceptsContinue(mapOf(0 to "A", 1 to "B", 2 to "B", 3 to "A")))
        assertFalse(logic.acceptsContinue(mapOf(1 to "A")))
    }

    @Test
    fun `t05 the law row repeats the unit and two full repeats are shown`() {
        val logic = T05PatternLogic(unit = listOf("A", "A", "B"), repeats = 2) // AABAAB
        assertEquals(listOf("A", "A", "B", "A", "A", "B"), logic.lawRow(6))
        assertEquals("B", logic.expectedAt(5))
        assertTrue(logic.showsTwoFullRepeats(6))
        assertFalse(logic.showsTwoFullRepeats(5))
    }

    @Test
    fun `t05 find unit recognizes every real unit start`() {
        val logic = T05PatternLogic(unit = listOf("A", "B"), repeats = 3)
        assertTrue(logic.isUnitWindow(0, listOf("A", "B")))
        assertTrue(logic.isUnitWindow(2, listOf("A", "B")))
        assertFalse(logic.isUnitWindow(1, listOf("B", "A")))
        assertEquals(listOf(0, 2, 4), logic.unitStarts(6))
    }

    @Test
    fun `t05 build mode has no wrong answer and the unit is at most three elements`() {
        val logic = T05PatternLogic(unit = listOf("A", "B", "C"), repeats = 2)
        assertTrue(logic.acceptsBuild(listOf("C", "A", "B")))
        assertFalse(logic.acceptsBuild(emptyList()))
        var threw = false
        try {
            T05PatternLogic(unit = listOf("A", "B", "C", "D"), repeats = 2)
        } catch (e: IllegalArgumentException) {
            threw = true
        }
        assertTrue(threw)
    }

    @Test
    fun `t05 the rhythmic execution gives one stable note per element`() {
        val logic = T05PatternLogic(unit = listOf("A", "B"), repeats = 3)
        assertEquals(listOf(0, 1, 0, 1, 0, 1), logic.executionNotes(6))
        assertEquals(1, logic.elementIndex(3))
    }

    // ---------------------------------------------------------------- T07

    @Test
    fun `t07 vertical axis pairs column c with w minus one minus c`() {
        val logic = T07SymmetryLogic(width = 6, height = 6, axis = T07Axis.Vertical)
        // stage5 acceptance: (١، ٢) pairs with (١، w−٣) — i.e. 6-1-2 = 3 = w-3.
        assertEquals(3, logic.mirrorCol(2))
        assertEquals(6 - 3, logic.mirrorCol(2))
        assertEquals(0, logic.mirrorCol(5))
        assertNull(logic.mirrorRow(1))
        assertEquals(1 to 3, logic.partner(1, 2))
    }

    @Test
    fun `t07 horizontal and both axes mirror the other coordinate`() {
        val horizontal = T07SymmetryLogic(width = 4, height = 4, axis = T07Axis.Horizontal)
        assertEquals(4 - 1 - 1, horizontal.mirrorRow(1))
        assertNull(horizontal.mirrorCol(1))
        val both = T07SymmetryLogic(width = 4, height = 4, axis = T07Axis.Both)
        assertEquals(1 to 2, both.partner(2, 1))
    }

    @Test
    fun `t07 symmetry is decided by comparing the mirrored set`() {
        val logic = T07SymmetryLogic(width = 6, height = 2, axis = T07Axis.Vertical)
        assertTrue(logic.isSymmetric(setOf(0 to 0, 0 to 5)))
        assertFalse(logic.isSymmetric(setOf(0 to 0)))
        assertTrue(logic.isSymmetric(emptySet()))
    }

    @Test
    fun `t07 completion keeps the given half and rejects erasing it`() {
        val logic = T07SymmetryLogic(width = 6, height = 2, axis = T07Axis.Vertical)
        val given = setOf(0 to 0)
        assertTrue(logic.acceptsCompleted(setOf(0 to 0, 0 to 5), given))
        assertFalse(logic.acceptsCompleted(setOf(0 to 5), given))
        assertFalse(logic.acceptsCompleted(setOf(0 to 0, 0 to 4), given))
    }

    @Test
    fun `t07 h1 points at the first unpaired cell`() {
        val logic = T07SymmetryLogic(width = 6, height = 2, axis = T07Axis.Vertical)
        assertEquals(0 to 0, logic.firstUnpaired(setOf(0 to 0)))
        assertNull(logic.firstUnpaired(setOf(0 to 0, 0 to 5)))
    }

    @Test
    fun `t07 fold is 400ms with motion and a cross fade without it`() {
        assertEquals(400, ShomaraFoldLogic.foldMs(reducedMotion = false))
        assertEquals(0, ShomaraFoldLogic.foldMs(reducedMotion = true))
        assertEquals(T07FoldMode.Fold, ShomaraFoldLogic.mode(reducedMotion = false))
        assertEquals(T07FoldMode.CrossFade, ShomaraFoldLogic.mode(reducedMotion = true))
        assertTrue(ShomaraFoldLogic.showsVerification(reducedMotion = true))
    }

    @Test
    fun `t07 the verified state is held long enough to read in both modes`() {
        assertEquals(400, ShomaraFoldLogic.holdMs(reducedMotion = false))
        assertEquals(600, ShomaraFoldLogic.holdMs(reducedMotion = true))
        assertTrue(ShomaraFoldLogic.holdMs(reducedMotion = true) > ShomaraFoldLogic.foldMs(true))
    }

    // ---------------------------------------------------------------- regression: lane cells

    @Test
    fun `regression t02 lane cells cover every stroke past the first five group`() {
        val logic = T02TallyLogic(List(11) { "o$it" })
        val seven = logic.laneCells(List(7) { "o$it" })
        assertEquals(7, seven.size)
        assertEquals(listOf(0, 0, 0, 0, 0, 1, 1), seven.map { it.groupIndex })
        assertEquals(listOf(0, 1, 2, 3, 4, 0, 1), seven.map { it.slotInGroup })
        assertEquals(listOf(4), seven.filter { it.isDiagonal }.map { it.slotInGroup })
        assertEquals(listOf(0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2), logic.laneCells(List(11) { "o$it" }).map { it.groupIndex })
        assertEquals(2, logic.laneCells(List(11) { "o$it" }).count { it.isDiagonal })
    }

    // ---------------------------------------------------------------- regression: strict target

    @Test
    fun `regression t03 strict target requires the canonical shape`() {
        val fourThree = T03Hands(
            left = listOf(true, true, true, true, false),
            right = listOf(true, true, true, false, false),
        )
        val fiveTwo = T03Hands(
            left = listOf(true, true, true, true, true),
            right = listOf(true, true, false, false, false),
        )
        // Any decomposition: both shapes are the number 7.
        assertTrue(fourThree.acceptsTarget(7, anyDecomposition = true))
        assertTrue(fiveTwo.acceptsTarget(7, anyDecomposition = true))
        // Canonical (five on the shoulder): only 5+2 is the asked shape.
        assertFalse(fourThree.acceptsTarget(7, anyDecomposition = false))
        assertTrue(fiveTwo.acceptsTarget(7, anyDecomposition = false))
        // Up to five: all on one hand.
        val threeLeft = T03Hands(left = listOf(true, true, true, false, false))
        assertTrue(threeLeft.acceptsTarget(3, anyDecomposition = false))
        assertFalse(threeLeft.acceptsTarget(4, anyDecomposition = false))
    }
}
