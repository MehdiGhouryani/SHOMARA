package com.mathlearning.feature.practice

import com.mathlearning.core.model.StationId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** B10 — practice-set structure: six items, spiral rule, never a fabricated item. */
class ShomaraPracticeSetTest {

    @Test
    fun `spiral takes at least one item from each thread first`() {
        // R-16: build is an instance method — the set's own size is the build size, and
        // poolRef names the pool the caller passes in.
        val set = ShomaraPracticeSet(size = 6, poolRef = StationId.parse("ST07")).build(
            threadPools = mapOf(
                "ST01" to listOf("ST01/a", "ST01/b"),
                "ST02" to listOf("ST02/a"),
                "ST03" to listOf("ST03/a", "ST03/b", "ST03/c"),
            ),
        )
        assertEquals(6, set.size)
        // Spiral pass first: one from each thread, in thread order.
        assertEquals(listOf("ST01/a", "ST02/a", "ST03/a"), set.take(3))
        // Fill pass: round-robin over what is left.
        assertEquals(listOf("ST01/b", "ST03/b", "ST03/c"), set.drop(3))
    }

    @Test
    fun `a short pool gives a short honest set - never padding`() {
        val set = ShomaraPracticeSet(size = 6, poolRef = StationId.parse("ST07")).build(
            threadPools = mapOf("ST01" to listOf("ST01/a")),
        )
        assertEquals(listOf("ST01/a"), set)
    }

    @Test
    fun `build uses the instance size - not a caller-supplied one (R-16)`() {
        val small = ShomaraPracticeSet(size = 2, poolRef = StationId.parse("ST07")).build(
            threadPools = mapOf(
                "ST01" to listOf("ST01/a", "ST01/b"),
                "ST02" to listOf("ST02/a", "ST02/b"),
                "ST03" to listOf("ST03/a"),
            ),
        )
        assertEquals(listOf("ST01/a", "ST02/a"), small)
        assertEquals(StationId.parse("ST07"), ShomaraPracticeSet(size = 2, poolRef = StationId.parse("ST07")).poolRef)
    }

    @Test
    fun `default size is the pilot draft six`() {
        assertEquals(6, ShomaraPracticeSet.DEFAULT_SIZE)
        assertEquals(6, ShomaraPracticeSet(size = 6, poolRef = StationId.parse("ST07")).size)
    }

    @Test
    fun `zero size is refused`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            ShomaraPracticeSet(size = 0, poolRef = StationId.parse("ST07"))
        }
    }

    @Test
    fun `spiral rule is quoted verbatim`() {
        assertTrue(ShomaraPracticeSet.SPIRAL_RULE.contains("ST01"))
        assertTrue(ShomaraPracticeSet.SPIRAL_RULE.contains("ST06"))
    }
}
