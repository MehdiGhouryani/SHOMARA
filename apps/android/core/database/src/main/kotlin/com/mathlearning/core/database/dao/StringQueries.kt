package com.mathlearning.core.database.dao

/** Room @Query SQL constants (compile-time validated against the schema). */
object StringQueries {
    const val LESSON_SESSION_BY_ID: String =
        "SELECT * FROM lesson_sessions WHERE sessionId = :sessionId LIMIT 1"
    const val LESSON_SESSION_SET_LIFECYCLE: String =
        "UPDATE lesson_sessions SET lifecycle = :lifecycle, updatedAtMs = :updatedAtMs WHERE sessionId = :sessionId"
    const val LESSON_ATTEMPT_BY_KEY: String =
        "SELECT * FROM lesson_attempts WHERE attemptKey = :attemptKey LIMIT 1"
    const val LESSON_ATTEMPTS_FOR_SESSION: String =
        "SELECT * FROM lesson_attempts WHERE sessionId = :sessionId ORDER BY recordedAtMs ASC"
}
