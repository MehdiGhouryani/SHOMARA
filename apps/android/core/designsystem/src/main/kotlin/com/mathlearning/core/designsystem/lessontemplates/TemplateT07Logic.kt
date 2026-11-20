package com.mathlearning.core.designsystem.lessontemplates

import com.mathlearning.core.designsystem.ShomaraMotionLogic

/**
 * S3a · stage5 §T07 «قرینه‌ساز» — the PURE logic of the symmetry template, plus the `fold`
 * moment that verifies it.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - a cell pairs with the cell the SAME distance on the other side of the axis: for a
 *    VERTICAL axis on a grid of [width] columns, column c mirrors to width-1-c
 *    (acceptance: the pair (1, 2) ↔ (1, w−3) — exactly width-1-2 for w columns), and for a
 *    HORIZONTAL axis row r mirrors to height-1-r;
 *  - both axes = both mirrors, applied one after the other;
 *  - symmetry is decided by comparing the MIRRORED SET of coloured cells with itself, never
 *    by looking at a picture (state rule «بررسی با مقایسهٔ آینه‌ای»);
 *  - the interface must never mirror the axis direction by itself: the axis is explicit in
 *    the data (state rule «جهت راست/چپ نباید به‌دلیل آینه‌کردن خودکار رابط جابه‌جا شود»).
 *
 * The `fold` moment (§4.1 / stage5 «انیمیشن تا folding ۴۰۰ms؛ در کاهش حرکت: محو شدن
 * متقاطع») is also pure: it says HOW long and WHICH kind of reveal the child gets.
 */
data class T07SymmetryLogic(
    val width: Int,
    val height: Int,
    val axis: T07Axis,
) {
    init {
        require(width >= 2 && height >= 2) { "a symmetry grid is at least 2x2" }
    }

    /** The mirror cell of (row, col) for the VERTICAL axis, or null when the axis is absent. */
    fun mirrorCol(col: Int, forAxis: T07Axis = axis): Int? =
        if (forAxis == T07Axis.Vertical || forAxis == T07Axis.Both) width - 1 - col else null

    /** The mirror row for the HORIZONTAL axis. */
    fun mirrorRow(row: Int, forAxis: T07Axis = axis): Int? =
        if (forAxis == T07Axis.Horizontal || forAxis == T07Axis.Both) height - 1 - row else null

    /** The mirrored partner cell; for `Both` the cell maps through BOTH mirrors. */
    fun partner(row: Int, col: Int): Pair<Int, Int> {
        val mirroredCol = mirrorCol(col) ?: col
        val mirroredRow = mirrorRow(row) ?: row
        return mirroredRow to mirroredCol
    }

    /** True when the coloured set is its own mirror image (0-based cells). */
    fun isSymmetric(colored: Set<Pair<Int, Int>>): Boolean =
        colored.all { (row, col) -> partner(row, col) in colored }

    /**
     * Completion acceptance: the coloured set is symmetric AND it still contains every given
     * cell (a child cannot win by erasing the given half).
     */
    fun acceptsCompleted(colored: Set<Pair<Int, Int>>, given: Set<Pair<Int, Int>>): Boolean =
        colored.containsAll(given) && isSymmetric(colored)

    /** identify mode: is this GIVEN shape symmetric about the declared axis? */
    fun acceptsIdentify(shape: Set<Pair<Int, Int>>): Boolean = isSymmetric(shape)

    /** h1 support: the partner of the first coloured cell that has none yet. */
    fun firstUnpaired(colored: Set<Pair<Int, Int>>): Pair<Int, Int>? =
        colored.firstOrNull { (row, col) -> partner(row, col) !in colored }
}

enum class T07Axis { Vertical, Horizontal, Both }

/**
 * §4.1 `fold` — the stage5 verification moment: the shape folds onto its axis (400ms); with
 * reduced motion it CROSS-FADES instead of moving. Both modes carry the same information,
 * which is the whole point of the reduced-motion rule.
 */
object ShomaraFoldLogic {
    const val FOLD_BASE_MS: Int = 400

    /** Motion duration: 400ms with motion, 0 (instant swap) under reduced motion. */
    fun foldMs(reducedMotion: Boolean): Int = ShomaraMotionLogic.durationMs(FOLD_BASE_MS, reducedMotion)

    /**
     * How long the verified state is HELD after the moment. Reduced motion still needs reading
     * time even though it has no travel: the information is not removed, only the movement.
     */
    fun holdMs(reducedMotion: Boolean): Int = if (reducedMotion) FOLD_HOLD_REDUCED_MS else FOLD_BASE_MS

    /** The reduced-motion hold is longer than a tween of zero length (a cut needs reading time). */
    const val FOLD_HOLD_REDUCED_MS: Int = 600

    /** The reveal KIND — a fold for motion, a cross-fade for reduced motion. Always exactly one. */
    fun mode(reducedMotion: Boolean): T07FoldMode =
        if (reducedMotion) T07FoldMode.CrossFade else T07FoldMode.Fold

    /** The moment is informational in both modes; only its presentation changes. */
    fun showsVerification(reducedMotion: Boolean): Boolean = true
}

enum class T07FoldMode { Fold, CrossFade }
