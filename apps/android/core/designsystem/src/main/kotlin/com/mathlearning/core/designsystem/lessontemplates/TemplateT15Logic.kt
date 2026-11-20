package com.mathlearning.core.designsystem.lessontemplates

/**
 * S2 · stage5 §T15 «انتخاب پاسخ» — the PURE logic of the answer-card template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - the OPTIONS ARE ALWAYS UNIQUE (acceptance «سه گزینه همیشه یکتا»);
 *  - the CORRECT option lands in a different position per render seed (acceptance «گزینهٔ
 *    درست هر بار در جای متفاوت»);
 *  - wrong options come from the caller's COMMON-ERROR table, never randomly invented —
 *    the logic only places and validates them;
 *  - h1 = eliminate ONE wrong option (stage5 hint table «حذف یک گزینهٔ غلط»);
 *  - the template never decides correctness: [T15Placement.correctIndex] comes from the
 *    evaluator side; the UI only knows where to render it.
 */
data class T15OptionSpec(
    /** A stable id the evaluator uses for the verdict (e.g. `opt-3`). */
    val optionId: String,
    /** Display text/dots/picture key; the UI renders it, the logic never parses it. */
    val displayKey: String,
    val isCorrect: Boolean,
)

data class T15Placement(
    val options: List<T15OptionSpec>,
    /** Position (0-based) of the correct option in the shuffled render order. */
    val correctIndex: Int,
) {
    init {
        require(options.size in 2..3) { "T15 renders 2..3 options (stage5)" }
        require(correctIndex in options.indices) { "correctIndex must point at a rendered option" }
        require(options.count { it.isCorrect } == 1) { "exactly one correct option" }
    }

    /** The id the evaluator receives when the child taps position [index]. */
    fun optionIdAt(index: Int): String = options[index].optionId

    /** h1: which WRONG position to eliminate (the first wrong one) — null when none left. */
    fun eliminatedWrongIndex(): Int? = options.indices.firstOrNull { it != correctIndex }
}

object T15PlacementLogic {
    /** Options must be unique by display AND by id — duplicates are a content bug, not a UI state. */
    fun requiresUnique(options: List<T15OptionSpec>) {
        require(options.map { it.optionId }.toSet().size == options.size) { "option ids must be unique" }
        require(options.map { it.displayKey }.toSet().size == options.size) { "option displays must be unique" }
    }

    /**
     * Deterministic placement: the correct option's position is a function of the seed, and
     * the whole order is a seeded permutation. Same seed reproduces the same placement
     * (screenshot tests), different seeds move the correct card (acceptance).
     */
    fun place(options: List<T15OptionSpec>, seed: Long): T15Placement {
        requiresUnique(options)
        require(options.count { it.isCorrect } == 1) { "exactly one correct option" }
        val random = java.util.Random(seed)
        val order = options.toMutableList()
        for (i in order.size - 1 downTo 1) {
            val j = random.nextInt(i + 1)
            val tmp = order[i]
            order[i] = order[j]
            order[j] = tmp
        }
        val correctIndex = order.indexOfFirst { it.isCorrect }
        return T15Placement(options = order, correctIndex = correctIndex)
    }
}
