package com.mathlearning.core.designsystem.lessontemplates

/**
 * S2 · stage5 §T03 «انگشت‌های دیجیتال» — the PURE logic of the finger template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - left and right are REAL left/right hands — never mirrored (state rule «چپ و راست واقعی
 *    (بدون آینه‌کردن)»);
 *  - a hand shows at most five fingers (invariant of the model, not an error message);
 *  - one number can be made in several shapes: 7 = 4+3 or 5+2 — BOTH accepted
 *    (acceptance: «هدف ۷ با ۴+۳ و ۵+۲ پذیرفته می‌شود»);
 *  - TRANSFER moves n fingers from one hand to the other while the TOTAL stays the same
 *    (acceptance: «انتقال ۲ انگشت از چپ به راست مجموع انگشت‌های باز را تغییر نمی‌دهد»), so a
 *    transfer can never create or destroy a count — that is what makes it a valid way to
 *    show the same number.
 *
 * The model is two boolean arrays of five (thumb..pinky); the composable renders them.
 */
data class T03Hands(
    val left: List<Boolean> = List(FINGERS_PER_HAND) { false },
    val right: List<Boolean> = List(FINGERS_PER_HAND) { false },
) {
    init {
        require(left.size == FINGERS_PER_HAND && right.size == FINGERS_PER_HAND) {
            "each hand has exactly five fingers"
        }
    }

    fun openLeft(): Int = left.count { it }
    fun openRight(): Int = right.count { it }
    fun total(): Int = openLeft() + openRight()

    /** Toggling a finger; each hand can never exceed five (it has only five). */
    fun toggle(hand: T03Hand, fingerIndex: Int): T03Hands {
        require(fingerIndex in 0 until FINGERS_PER_HAND) { "finger index outside 0..4" }
        return when (hand) {
            T03Hand.Left -> copy(left = left.toggleAt(fingerIndex))
            T03Hand.Right -> copy(right = right.toggleAt(fingerIndex))
        }
    }

    /**
     * TRANSFER n open fingers from [from] to [to]: close n on the source, open n on the
     * target — the TOTAL is invariant by construction. Returns unchanged when the source has
     * fewer than n open fingers or the target cannot open n more (target stays ≤ 5).
     */
    fun transfer(from: T03Hand, to: T03Hand, fingers: Int): T03Hands {
        require(fingers >= 0) { "transfer count must be non-negative" }
        if (fingers == 0) return this
        val sourceOpen = if (from == T03Hand.Left) openLeft() else openRight()
        val targetOpen = if (to == T03Hand.Left) openLeft() else openRight()
        if (sourceOpen < fingers || targetOpen + fingers > FINGERS_PER_HAND) return this
        var next = this
        repeat(fingers) {
            next = next.closeOne(from)
            next = next.openOne(to)
        }
        return next
    }

    /** The number the hands show (total open fingers, 0..10). */
    fun showsNumber(number: Int): Boolean = number == total()

    /** Target acceptance: any decomposition is valid, as long as the total matches. */
    fun acceptsTarget(target: Int, anyDecomposition: Boolean): Boolean =
        if (anyDecomposition) total() == target else total() == target

    private fun closeOne(hand: T03Hand): T03Hands = when (hand) {
        T03Hand.Left -> copy(left = left.withFirstOpenSet(false))
        T03Hand.Right -> copy(right = right.withFirstOpenSet(false))
    }

    private fun openOne(hand: T03Hand): T03Hands = when (hand) {
        T03Hand.Left -> copy(left = left.withFirstClosedSet(true))
        T03Hand.Right -> copy(right = right.withFirstClosedSet(true))
    }

    companion object {
        const val FINGERS_PER_HAND: Int = 5
    }
}

enum class T03Hand { Left, Right }

/** The canonical «۵ روی شانه» shape: five on one hand, n on the other (for 6..10). */
object T03FiveOnShoulder {
    fun decomposition(number: Int): Pair<Int, Int>? =
        if (number in 6..10) FIVE to (number - FIVE) else null

    const val FIVE: Int = 5
}

private fun List<Boolean>.toggleAt(index: Int): List<Boolean> =
    toMutableList().also { it[index] = !it[index] }

private fun List<Boolean>.withFirstOpenSet(value: Boolean): List<Boolean> {
    val target = indexOfFirst { it != value }
    return if (target < 0) this else toMutableList().also { it[target] = value }
}

private fun List<Boolean>.withFirstClosedSet(value: Boolean): List<Boolean> {
    val target = indexOfFirst { it != value }
    return if (target < 0) this else toMutableList().also { it[target] = value }
}
