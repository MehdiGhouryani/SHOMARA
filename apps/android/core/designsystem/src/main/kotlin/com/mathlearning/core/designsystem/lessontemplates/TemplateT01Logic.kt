package com.mathlearning.core.designsystem.lessontemplates

/**
 * S2 · stage5 §T01 «لمس‌وشمار» — the PURE logic of the touch-and-count template.
 *
 * The stage5 rules this object enforces (acceptance = the template's own acceptance lines):
 *  - each object is counted once; tapping an already-counted object gives a NEUTRAL pulse,
 *    never an error, and never a new number (acceptance: «لمس دوباره عدد تازه نمی‌سازد»)；
 *  - the minimum gap between two ACCEPTED taps is 250ms — a faster tap is ignored, it does
 *    not create a count (acceptance «۲۵۰ ms»);
 *  - the spoken/number value follows the TOUCH ORDER (the count so far), the touch order
 *    itself is free;
 *  - answering BEFORE everything is counted asks for hint h1 (the accept line «جواب پیش از
 *    شمردن همه ⇒ h1»);
 *  - a wrong answer is a warm retry (acceptance: «۴» for 5 objects ⇒ retry).
 *
 * No Compose, no device: JVM-testable (S2 acceptance: «تست واحد منطق»).
 */
data class T01CountLogic(
    /** Object ids in scene order (the ids are content, not logic). */
    val objectIds: List<String>,
) {
    init {
        require(objectIds.size in 1..10) { "T01 counts 1..10 objects (stage5 levels)" }
        require(objectIds.toSet().size == objectIds.size) { "object ids must be unique" }
    }

    /** True when this tap adds a NEW count: uncounted object AND 250ms after the last accepted tap. */
    fun createsCount(tappedIds: Set<String>, objectId: String, lastAcceptedAtMs: Long, nowMs: Long): Boolean =
        objectId in objectIds &&
            objectId !in tappedIds &&
            nowMs - lastAcceptedAtMs >= MIN_ACCEPT_GAP_MS

    /** The number the template announces/speaks for this accepted tap (1-based count so far). */
    fun numberForCount(countSoFar: Int): Int = countSoFar.coerceAtMost(objectIds.size)

    /** All objects counted → the count question may be answered. */
    fun allCounted(tappedIds: Set<String>): Boolean = tappedIds.size >= objectIds.size

    /**
     * The evaluator-independent Verdict FACTS for the count question. `answeredEarly` is the
     * h1 trigger; correctness itself stays with the evaluator — this returns what the UI
     * needs to RENDER (early-answer flag + the count the child reached).
     */
    fun countQuestionFacts(tappedIds: Set<String>, answeredValue: Int): T01AnswerFacts =
        T01AnswerFacts(
            counted = tappedIds.size,
            answered = answeredValue,
            answeredEarly = !allCounted(tappedIds),
        )

    companion object {
        /** stage5: «فاصلهٔ کمینهٔ بین دو لمس پذیرفته‌شده ۲۵۰ ms». */
        const val MIN_ACCEPT_GAP_MS: Long = 250

        /** The h1 hint fires exactly when the answer came before counting everything. */
        const val EARLY_ANSWER_HINT_LEVEL: Int = 1
    }
}

data class T01AnswerFacts(
    val counted: Int,
    val answered: Int,
    val answeredEarly: Boolean,
)

/**
 * Deterministic scatter placement from a seed (stage5: «چیدمان با seed») — no overlap by
 * construction: the scene is a fixed grid whose cells are wider than the manipulative band
 * (≥ 1.2× per stage5 «حالت‌های خاص»), and the seed only permutes WHICH cell each object
 * occupies. Same seed ⇒ same layout; different seed ⇒ different arrangement.
 */
object T01ScatterLayout {
    /** Grid columns for 1..10 objects — always enough cells for a no-overlap scatter. */
    fun gridFor(count: Int): Pair<Int, Int> = when {
        count <= 3 -> 3 to 2
        count <= 6 -> 3 to 2
        else -> 4 to 3
    }

    /**
     * The scene slot (column, row) for object [index] with this seed: a Fisher-Yates walk of
     * the cell list with a java.util.Random(seed). Same seed reproduces the same layout.
     */
    fun slotFor(count: Int, index: Int, seed: Long): Pair<Int, Int> {
        val (cols, rows) = gridFor(count)
        val cells = (0 until cols * rows).toMutableList()
        val random = java.util.Random(seed)
        for (i in cells.size - 1 downTo 1) {
            val j = random.nextInt(i + 1)
            val tmp = cells[i]
            cells[i] = cells[j]
            cells[j] = tmp
        }
        val cell = cells[index % cells.size]
        return (cell % cols) to (cell / cols)
    }
}
