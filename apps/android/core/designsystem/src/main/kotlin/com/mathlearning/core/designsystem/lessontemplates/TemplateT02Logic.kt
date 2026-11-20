package com.mathlearning.core.designsystem.lessontemplates

/**
 * S2 · stage5 §T02 «چوب‌خط‌ساز» — the PURE logic of the tally template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - one stroke per object, one object counted once;
 *  - the FIFTH stroke is DIAGONAL over the previous four (acceptance: «چوب خط پنجم مورب روی
 *    چهار تای قبلی کشیده می‌شود»);
 *  - undo removes exactly the LAST stroke (acceptance: «برگشت خط آخر را حذف می‌کند»);
 *  - `make` mode never accepts a target beyond the tray capacity (state rule);
 *  - in `sum` mode the second group continues the row with its own colour and only AFTER the
 *    preceding five-group is complete (stage5 «پیش از شروع دستهٔ بعد دستهٔ ۵تایی کامل شود»).
 *
 * The rendering (diagonal geometry) stays in the composable; the LOGIC of what a stroke IS
 * lives here so it can be proven on the JVM.
 */
data class T02TallyLogic(
    /** Object ids in scene order (rows/icons are content). */
    val objectIds: List<String>,
    val mode: T02TallyMode = T02TallyMode.Count,
) {
    init {
        require(objectIds.size in 1..20) { "T02 tallies 1..20 strokes (stage5 levels ≤ 20)" }
    }

    /** One accepted tap appends one stroke in TOUCH order; a duplicate tap is neutral (no stroke). */
    fun addStroke(strokes: List<String>, objectId: String): List<String> =
        if (objectId in objectIds && objectId !in strokes) strokes + objectId else strokes

    /** Undo removes exactly the last stroke (or nothing when empty). */
    fun undo(strokes: List<String>): List<String> = if (strokes.isEmpty()) strokes else strokes.dropLast(1)

    /** The display groups: each full five is one group; the remainder is the open group. */
    fun groups(strokes: List<String>): List<T02TallyGroup> {
        val result = mutableListOf<T02TallyGroup>()
        var index = 0
        var groupNumber = 1
        while (index < strokes.size) {
            val size = minOf(5, strokes.size - index)
            result += T02TallyGroup(groupNumber = groupNumber, size = size, closed = size == 5)
            index += size
            groupNumber += 1
        }
        return result
    }

    /**
     * TRUE when the stroke at [zeroBasedIndex] is the DIAGONAL fifth of its group: the fifth
     * stroke of a complete five-group. The renderer draws exactly this one slanted.
     */
    fun isDiagonalFifth(zeroBasedIndex: Int): Boolean {
        require(zeroBasedIndex >= 0) { "stroke index must be non-negative" }
        return zeroBasedIndex % 5 == 4
    }

    /** `make` mode: the target is inside the tray capacity (never beyond it). */
    fun canMakeTarget(target: Int, trayCapacity: Int): Boolean =
        target in 0..trayCapacity && trayCapacity in 1..20

    /** `sum` mode rule: a new group's first stroke cannot open before the previous five closed. */
    fun canStartNextGroup(strokeCount: Int): Boolean = strokeCount % 5 == 0
}

enum class T02TallyMode { Count, Make, Sum }

data class T02TallyGroup(val groupNumber: Int, val size: Int, val closed: Boolean)
