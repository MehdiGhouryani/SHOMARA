package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first

/**
 * Local resume checkpoint (N06-02): keyed by (sessionId, stationId); holds the exact
 * (encounterId, macroStage) the child was on so a confirmed exit or process death resumes
 * EXACTLY there. Fail-safe close semantics: the checkpoint is written on every stage advance
 * and only removed when the station completes server-side.
 */
data class LessonCheckpoint(
    val sessionId: String,
    val stationId: String,
    val encounterId: String,
    val macroStage: String,
    val savedAtMs: Long,
)

interface LessonCheckpointStore {
    suspend fun save(checkpoint: LessonCheckpoint)
    suspend fun read(sessionId: String, stationId: String): LessonCheckpoint?
    suspend fun clear(sessionId: String, stationId: String)
}

class PreferencesLessonCheckpointStore(
    private val dataStore: DataStore<Preferences>,
) : LessonCheckpointStore {

    override suspend fun save(checkpoint: LessonCheckpoint) {
        require(checkpoint.sessionId.isNotBlank() && checkpoint.stationId.isNotBlank()) { "checkpoint key must exist" }
        dataStore.edit { prefs ->
            prefs[stringPreferencesKey(keyPrefix(checkpoint.sessionId, checkpoint.stationId) + KEY_ENCOUNTER)] = checkpoint.encounterId
            prefs[stringPreferencesKey(keyPrefix(checkpoint.sessionId, checkpoint.stationId) + KEY_STAGE)] = checkpoint.macroStage
            prefs[longPreferencesKey(keyPrefix(checkpoint.sessionId, checkpoint.stationId) + KEY_SAVED_AT)] = checkpoint.savedAtMs
        }
    }

    override suspend fun read(sessionId: String, stationId: String): LessonCheckpoint? {
        val prefs = dataStore.data.first()
        val prefix = keyPrefix(sessionId, stationId)
        val encounter = prefs[stringPreferencesKey(prefix + KEY_ENCOUNTER)] ?: return null
        val stage = prefs[stringPreferencesKey(prefix + KEY_STAGE)] ?: return null
        val savedAt = prefs[longPreferencesKey(prefix + KEY_SAVED_AT)] ?: return null
        return LessonCheckpoint(sessionId, stationId, encounter, stage, savedAt)
    }

    override suspend fun clear(sessionId: String, stationId: String) {
        val prefix = keyPrefix(sessionId, stationId)
        dataStore.edit { prefs ->
            prefs.remove(stringPreferencesKey(prefix + KEY_ENCOUNTER))
            prefs.remove(stringPreferencesKey(prefix + KEY_STAGE))
            prefs.remove(longPreferencesKey(prefix + KEY_SAVED_AT))
        }
    }

    private fun keyPrefix(sessionId: String, stationId: String): String = "lesson|$sessionId|$stationId|"

    private companion object {
        const val KEY_ENCOUNTER = "encounter"
        const val KEY_STAGE = "stage"
        const val KEY_SAVED_AT = "savedAt"
    }
}
