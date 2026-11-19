package com.mathlearning.feature.path

import com.mathlearning.core.designsystem.ShomaraLessonTopic
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

/**
 * DT-72: the C23 topic table — an honest mapping, tested on the JVM because it is pure logic.
 *
 * Every chapter of the five-chapter catalog must have a topic (a missing entry would crash Home),
 * the mapping must follow the real chapter bands (ST01–ST05 → ch1 … ST21–ST25 → ch5), and an
 * unknown station id must fail loudly rather than silently render a wrong topic.
 */
class ShomaraLessonTopicsTest {

    @Test
    fun `every catalog chapter maps to a topic`() {
        val topics = (1..5).map { ch ->
            ShomaraLessonTopics.topicForStation("ST%02d".format(ch * 5))
        }
        assertEquals(
            listOf(
                ShomaraLessonTopic.Counting,
                ShomaraLessonTopic.Addition,
                ShomaraLessonTopic.Shapes,
                ShomaraLessonTopic.Patterns,
                ShomaraLessonTopic.Counting,
            ),
            topics,
        )
    }

    @Test
    fun `mapping follows the real chapter bands`() {
        assertEquals(ShomaraLessonTopic.Counting, ShomaraLessonTopics.topicForStation("ST01"))
        assertEquals(ShomaraLessonTopic.Counting, ShomaraLessonTopics.topicForStation("ST05"))
        assertEquals(ShomaraLessonTopic.Addition, ShomaraLessonTopics.topicForStation("ST06"))
        assertEquals(ShomaraLessonTopic.Counting, ShomaraLessonTopics.topicForStation("ST25"))
    }

    @Test
    fun `unknown station fails loudly instead of guessing`() {
        assertThrows(IllegalArgumentException::class.java) {
            ShomaraLessonTopics.topicForStation("ST99")
        }
    }
}
