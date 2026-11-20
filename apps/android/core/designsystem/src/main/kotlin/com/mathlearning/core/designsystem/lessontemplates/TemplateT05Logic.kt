package com.mathlearning.core.designsystem.lessontemplates

/**
 * S3a · stage5 §T05 «الگوساز» — the PURE logic of the pattern template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - the repeating unit has at most three elements (state rule «واحد تکرار تا ۳ عنصر»);
 *  - at least TWO full repetitions are always shown before the row asks for a blank
 *    (rule «دست‌کم دو تکرار کامل نشان داده شود»), which is what makes the law visible;
 *  - a blank is checked against the LAW, not against one memorised answer: every filling
 *    consistent with the unit is accepted (acceptance «هر ترکیب سازگار با قانون پذیرفته
 *    شود» / «ABAB با جای خالی ABBA رد شود»);
 *  - build mode has NO wrong answers — the row records and plays what the child made
 *    (state rule «در حالت build هیچ پاسخ «غلط»ی نیست»).
 *
 * The rhythmic execution is pure data too: each element maps to one short note so the
 * pattern can be HEARD (stage5 «اجرای آهنگین … یک تک‌نت کوتاه»).
 */
data class T05PatternLogic(
    /** The repeating unit, e.g. ["A","B"] for ABAB. */
    val unit: List<String>,
    val repeats: Int,
) {
    init {
        require(unit.isNotEmpty() && unit.size <= 3) { "the repeating unit is 1..3 elements (stage5)" }
        // An AAB unit repeats the SAME element — that is the lesson, not a bug, so the unit
        // elements are deliberately NOT required to be distinct.
        require(unit.all { it.isNotBlank() }) { "unit elements must be non-blank" }
        require(repeats >= 2) { "at least two full repetitions are shown (stage5)" }
    }

    /** The element the LAW puts at zero-based [index] — the only correct filling. */
    fun expectedAt(index: Int): String {
        require(index >= 0) { "index must be non-negative" }
        return unit[index % unit.size]
    }

    /** The full row for [cells] cells (the law applied end to end). */
    fun lawRow(cells: Int): List<String> = (0 until cells).map { expectedAt(it) }

    /**
     * Continue-mode acceptance: every FILLED blank equals what the law puts there. Unfilled
     * blanks are ignored (the row may be mid-answer), and a filling that breaks the law in a
     * single cell is rejected as a whole (acceptance: ABBA in an ABAB row is rejected).
     */
    fun acceptsContinue(fillings: Map<Int, String>): Boolean =
        fillings.all { (index, value) -> expectedAt(index) == value }

    /**
     * findUnit mode: the window starting at [startIndex] is exactly the repeating unit. The
     * comparison is against the UNIT itself — comparing against the law row would accept the
     * shifted window (B,A) as if it were the unit, which is precisely the mistake the mode
     * teaches the child to avoid.
     */
    fun isUnitWindow(startIndex: Int, window: List<String>): Boolean {
        require(startIndex >= 0) { "start index must be non-negative" }
        return window == unit
    }

    /** findUnit mode: every window start where the unit begins (the child may find any). */
    fun unitStarts(cells: Int): List<Int> = (0..cells - unit.size).filter { start ->
        isUnitWindow(start, lawRow(cells).subList(start, start + unit.size))
    }

    /** Build mode never has a wrong answer — the row only needs to be non-empty. */
    fun acceptsBuild(built: List<String>): Boolean = built.isNotEmpty()

    /** At least two full repetitions were displayed (rule guard for the caller). */
    fun showsTwoFullRepeats(cells: Int): Boolean = cells >= 2 * unit.size

    /**
     * The rhythmic execution: one short note per element, pitch taken from the element's
     * position in the unit palette (never a random note). Returns the note index per cell.
     */
    fun executionNotes(cells: Int): List<Int> = (0 until cells).map { elementIndex(it) }

    /** The stable note index for the element at a cell. */
    fun elementIndex(index: Int): Int = unit.indexOf(expectedAt(index)).coerceAtLeast(0)
}
