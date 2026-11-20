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

    /**
     * Target acceptance. With [anyDecomposition] every shape of the same total is valid
     * (7 = 4+3 or 5+2). Without it the item asks for the CANONICAL shape — all on one hand up
     * to five, and «۵ روی شانه» beyond — which is a different, stricter task, not a different
     * total.
     */
    fun acceptsTarget(target: Int, anyDecomposition: Boolean): Boolean {
        if (total() != target) return false
        if (anyDecomposition) return true
        val canonical = T03FiveOnShoulder.decomposition(target)
        return if (canonical == null) {
            // 0..5: one hand holds everything, the other is closed.
            (openLeft() == target && openRight() == 0) || (openRight() == target && openLeft() == 0)
        } else {
            (openLeft() == canonical.first && openRight() == canonical.second) ||
                (openRight() == canonical.first && openLeft() == canonical.second)
        }
    }

    private fun closeOne(hand: T03Hand): T03Hands = when (hand) {
        T03Hand.Left -> copy(left = left.withFirstSet(false))
        T03Hand.Right -> copy(right = right.withFirstSet(false))
    }

    private fun openOne(hand: T03Hand): T03Hands = when (hand) {
        T03Hand.Left -> copy(left = left.withFirstSet(true))
        T03Hand.Right -> copy(right = right.withFirstSet(true))
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

/** Flip the FIRST finger whose state differs from [value] — one helper for open and close. */
private fun List<Boolean>.withFirstSet(value: Boolean): List<Boolean> {
    val target = indexOfFirst { it != value }
    return if (target < 0) this else toMutableList().also { it[target] = value }
}
