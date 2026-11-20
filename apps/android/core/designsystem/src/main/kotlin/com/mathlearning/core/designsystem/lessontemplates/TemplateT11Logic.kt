package com.mathlearning.core.designsystem.lessontemplates

/**
 * S3b · stage5 §T11 «صحنهٔ مسئله» — the PURE logic of the story template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - a story is at most three sentences and its numbers stay ≤ 20 until ST21;
 *  - the answer is the result of the STEPS, not of the last number heard: the acceptance
 *    example (18 passengers, 3 stops, 2 leave at each stop) yields 12;
 *  - EXTRA information is a number that the steps do not use — the template still solves;
 *  - INSUFFICIENT information means there is no numeric answer at all, so only the «نمی‌شود
 *    حل کرد» choice is accepted (acceptance: «مسئلهٔ ناکافی پاسخ عددی را نمی‌پذیرد»);
 *  - h1 repeats the narration and highlights the numbers the steps USE (never the extras).
 */
data class T11Step(val op: T11Op, val n: Int, val times: Int = 1) {
    init {
        require(n >= 0) { "a step count must be non-negative" }
        require(times >= 1) { "a step happens at least once" }
    }
}

enum class T11Op { Add, Remove }

data class T11Story(
    val start: Int,
    val steps: List<T11Step>,
    /** Numbers that appear in the story but do not belong to any step. */
    val extraInfo: List<Int> = emptyList(),
    /** True when the story cannot be answered numerically (ST25). */
    val insufficient: Boolean = false,
    val sentenceCount: Int = 1,
) {
    init {
        require(sentenceCount in 1..3) { "a story is at most three sentences (stage5)" }
        require(start in 0..MAX_NUMBER) { "story numbers stay <= 20 until ST21" }
        require(steps.all { it.n * it.times <= MAX_NUMBER }) { "step totals stay <= 20 until ST21" }
    }

    /** The numeric answer the steps produce; null when the story is deliberately unsolvable. */
    fun resolve(): Int? {
        if (insufficient) return null
        var value = start
        steps.forEach { step ->
            val delta = step.n * step.times
            value = when (step.op) {
                T11Op.Add -> value + delta
                T11Op.Remove -> value - delta
            }
        }
        return value.coerceAtLeast(0)
    }

    /** The numbers the SOLUTION uses — what h1 highlights. Extras are never highlighted. */
    fun usedNumbers(): Set<Int> = buildSet {
        add(start)
        steps.forEach { step -> add(step.n); if (step.times > 1) add(step.times) }
    }

    /**
     * Answer acceptance: a numeric answer only exists for a solvable story, and for an
     * insufficient story ONLY the «cannot be solved» choice is accepted.
     */
    fun acceptsNumeric(answer: Int): Boolean = !insufficient && resolve() == answer

    /** The «نمی‌شود حل کرد» choice — correct exactly for an insufficient story. */
    fun acceptsCannotSolve(): Boolean = insufficient

    companion object {
        /** stage5: numbers ≤ 20 until ST21. */
        const val MAX_NUMBER: Int = 20

        /** The stage5 acceptance example: 18 passengers, 3 stops, 2 leave each time ⇒ 12. */
        fun passengersExample(): T11Story = T11Story(
            start = 18,
            steps = listOf(T11Step(op = T11Op.Remove, n = 2, times = 3)),
            sentenceCount = 2,
        )
    }
}
