package com.mathlearning.feature.lesson

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** B9 — pattern-law engine with synthetic units (stage5 §7 acceptance tests). */
class ShomaraPatternRuleTest {

    @Test
    fun `ABAB with four blanks accepts every law-consistent fill`() {
        val unit = listOf("A", "B")
        assertTrue(ShomaraPatternRule.accepts(unit, listOf("A", "B", "A", "B")))
        assertTrue(ShomaraPatternRule.accepts(unit, listOf("A", "B")))
        assertTrue(ShomaraPatternRule.accepts(unit, listOf("A")))
        assertTrue(ShomaraPatternRule.accepts(unit, emptyList()))
    }

    @Test
    fun `ABAB with ABBA blanks is rejected`() {
        assertFalse(ShomaraPatternRule.accepts(listOf("A", "B"), listOf("A", "B", "B", "A")))
    }

    @Test
    fun `AAB unit repeats every three`() {
        val unit = listOf("A", "A", "B")
        assertTrue(ShomaraPatternRule.accepts(unit, listOf("A", "A", "B", "A", "A", "B")))
        assertFalse(ShomaraPatternRule.accepts(unit, listOf("A", "A", "B", "A", "B", "A")))
    }

    @Test
    fun `empty unit is refused`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraPatternRule.accepts(emptyList(), listOf("A"))
        }
    }
}
