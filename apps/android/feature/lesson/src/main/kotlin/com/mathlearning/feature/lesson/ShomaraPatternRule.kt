package com.mathlearning.feature.lesson

/**
 * B9 — pattern-law engine (T05) as a pure function over abstract units.
 *
 * `accepts(unit, placed)` checks ONLY consistency with the repeating-unit law: the placed
 * elements must continue the unit's repetition. Elements are abstract ids («A», «B», …) —
 * the engine is never bound to P3 rounds or P4 items; the law values for real rounds arrive
 * from the content package only after O1/O2.
 *
 * This engine is NOT judgement until the evaluator (O1) calls it: the host never uses it as
 * a preview verdict, and no call site in this batch renders its result as correct/incorrect.
 *
 * Acceptance test (stage5 §7): ABAB with four blanks — every combination consistent with the
 * law is accepted; ABAB with the blanks filled ABBA is rejected.
 */
object ShomaraPatternRule {
    fun accepts(unit: List<String>, placed: List<String>): Boolean {
        require(unit.isNotEmpty()) { "pattern unit must not be empty" }
        if (placed.isEmpty()) return true
        return placed.withIndex().all { (index, element) -> element == unit[index % unit.size] }
    }
}
