package com.mathlearning.core.learning.checkpoint

/** Test fixture: in-memory checkpoint store over the same SPI the DataStore impl will use. */
class InMemoryCheckpointStore : SessionCheckpointStore {
    private val rows = LinkedHashMap<String, SessionCheckpoint>()
    override fun write(checkpoint: SessionCheckpoint) {
        rows[checkpoint.sessionId] = checkpoint
    }
    override fun read(sessionId: String): SessionCheckpoint? = rows[sessionId]
    override fun clear(sessionId: String) {
        rows.remove(sessionId)
    }
}
