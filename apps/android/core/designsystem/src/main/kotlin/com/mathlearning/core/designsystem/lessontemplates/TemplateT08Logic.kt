package com.mathlearning.core.designsystem.lessontemplates

/**
 * S3b · stage5 §T08 «مربع شگفت‌انگیز» — the PURE logic of the grid template.
 *
 * stage5 rules enforced here (acceptance = the template's own acceptance lines):
 *  - every row, every column and (in the larger grids) every BLOCK holds each symbol exactly
 *    once — 3×3/4×4 with 2×2-ish blocks, 6×6 with 2×3 rectangles, 9×9 with 3×3 squares;
 *  - placing a symbol that already exists in the row/column/block highlights the CONFLICT with
 *    a soft pulse and does NOT record the placement (acceptance: «تعارض را برجسته می‌کند و
 *    ثبت نمی‌شود») — a conflict is information, never an error mark;
 *  - the template never decides the puzzle is solved: [isComplete] is a fact the evaluator
 *    can use, and the unique solution is content (`given`/`solution`), not a UI guess.
 */
data class T08GridLogic(
    val size: Int,
    /** Rows × columns of one block — 2×3 for a 6×6, 3×3 for a 9×9, 2×2 for a 4×4. */
    val blockRows: Int,
    val blockCols: Int,
) {
    init {
        require(size >= 4) { "the grid template covers 4x4 and larger (stage5 levels)" }
        require(size % blockRows == 0 && size % blockCols == 0) {
            "blocks must tile the grid ($blockRows x $blockCols over $size)"
        }
        require(blockRows * blockCols == size) { "a block holds exactly `size` cells" }
    }

    /** The block index of a cell — row-major over the block layout. */
    fun blockOf(row: Int, col: Int): Int {
        require(row in 0 until size && col in 0 until size) { "cell outside the grid" }
        val blocksPerRow = size / blockCols
        return (row / blockRows) * blocksPerRow + (col / blockCols)
    }

    /**
     * Every conflict that placing [symbol] at (row, col) would create on [board]. Empty means
     * the placement may be RECORDED; non-empty means the cell pulses and nothing is written.
     */
    fun conflicts(
        board: Map<Pair<Int, Int>, String>,
        row: Int,
        col: Int,
        symbol: String,
    ): List<T08Conflict> {
        val result = mutableListOf<T08Conflict>()
        val block = blockOf(row, col)
        board.forEach { (cell, value) ->
            if (cell.first == row && cell.second == col) return@forEach // the target cell
            if (value != symbol) return@forEach
            when {
                cell.first == row -> result += T08Conflict(T08ConflictKind.Row, cell)
                cell.second == col -> result += T08Conflict(T08ConflictKind.Column, cell)
                blockOf(cell.first, cell.second) == block -> result += T08Conflict(T08ConflictKind.Block, cell)
            }
        }
        return result
    }

    /** True when the placement is legal and must be written (the acceptance rule). */
    fun wouldRecord(
        board: Map<Pair<Int, Int>, String>,
        row: Int,
        col: Int,
        symbol: String,
    ): Boolean = conflicts(board, row, col, symbol).isEmpty()

    /** h1 support: the row and column indices of a cell (highlighted around a blank). */
    fun rowAndColumn(row: Int, col: Int): Pair<Int, Int> = row to col

    /** The grid is filled and conflict-free — a FACT the evaluator may use, not a verdict. */
    fun isComplete(board: Map<Pair<Int, Int>, String>): Boolean =
        board.size == size * size && board.all { (cell, symbol) ->
            conflicts(board - cell, cell.first, cell.second, symbol).isEmpty()
        }
}

enum class T08ConflictKind { Row, Column, Block }

data class T08Conflict(val kind: T08ConflictKind, val cell: Pair<Int, Int>)
