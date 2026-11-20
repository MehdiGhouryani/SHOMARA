package com.mathlearning.core.designsystem.lessontemplates

/**
 * S3a · stage5 §T04 «چینه‌ساز» — the PURE logic of the rod template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - length is the number: building a target accepts ANY decomposition, so 7 = 4+3 and
 *    7 = 5+2 are BOTH correct (acceptance «ساختن ۷ با ۴ و ۳ و با ۵ و ۲ هر دو پذیرفته شود»);
 *  - rods lie HORIZONTALLY and snap edge-to-edge into one row (state rule);
 *  - three lengths compare by their real order (acceptance «مقایسه سه طول ترتیب درست را
 *    می‌شناسد»);
 *  - one unit is at least 32dp, and the whole 10-unit lane must fit the width, so the unit
 *    size is DERIVED and never hardcoded in the view (state rule «طول واحد … کمینهٔ ۳۲ dp»);
 *  - the sum stays ≤ 10 until ST13 (stage5 levels).
 */
data class T04Rod(
    val rodId: String,
    val units: Int,
    val colorKey: String,
)

object T04RodLogic {
    /** The largest rod a station may use before ST13 (stage5: جمع ≤ ۱۰ تا ST13). */
    const val MAX_UNITS_EARLY: Int = 10

    /** stage5 rule: one unit is at least 32dp so ten of them still read as a row. */
    const val MIN_UNIT_DP: Int = 32

    /**
     * The unit width for a lane: the screen width divided into ten units, floored at the
     * stage5 minimum. Never a magic number in the composable.
     */
    fun unitDp(laneWidthDp: Int, maxUnits: Int = MAX_UNITS_EARLY): Int =
        maxOf(MIN_UNIT_DP, laneWidthDp / maxOf(1, maxUnits))

    /** Length of a placed row (the sum of its rods). */
    fun totalUnits(placed: List<T04Rod>): Int = placed.sumOf { it.units }

    /** Build mode: ANY decomposition of the target is accepted — length is the number. */
    fun acceptsBuild(placed: List<T04Rod>, target: Int): Boolean =
        placed.isNotEmpty() && totalUnits(placed) == target

    /** Sum mode: two colours, lengths add up; same acceptance rule, different intent. */
    fun acceptsSum(placed: List<T04Rod>, target: Int): Boolean = acceptsBuild(placed, target)

    /** Diff mode: the remaining length after the second rod is taken away. */
    fun restAfterDifference(start: List<T04Rod>, removed: List<T04Rod>): Int =
        totalUnits(start) - totalUnits(removed)

    /** Compare mode: the rod ids in ascending length order (stable for equal lengths). */
    fun ascending(rods: List<T04Rod>): List<T04Rod> =
        rods.sortedBy { it.units }

    /** Compare mode acceptance: the child's order matches the real ascending order. */
    fun acceptsOrder(chosen: List<T04Rod>, available: List<T04Rod>): Boolean =
        chosen.map { it.rodId } == ascending(available).map { it.rodId }

    /** Snap: the start offset (in units) where the next rod is appended — always contiguous. */
    fun nextStartUnits(placed: List<T04Rod>): Int = totalUnits(placed)

    /** A rod only fits while the lane stays inside the early capacity. */
    fun fitsLane(placed: List<T04Rod>, rod: T04Rod, capacity: Int = MAX_UNITS_EARLY): Boolean =
        totalUnits(placed) + rod.units <= capacity
}
