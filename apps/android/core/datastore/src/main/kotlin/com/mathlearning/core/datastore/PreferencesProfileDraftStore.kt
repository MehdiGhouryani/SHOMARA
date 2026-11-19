package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first

/**
 * Persisted profile draft snapshot (N04-04 incomplete-profile resume across process death).
 *
 * ADR-0051: the avatar preset was removed, so the snapshot carries only the child's name and grade.
 * The retired `shomara_profile_avatar` key is no longer written or read; leftover data in an
 * existing install is ignored, never migrated into a new surface.
 */
data class ShomaraProfileDraftSnapshot(
    val name: String,
    val gradeId: String,
)

interface ShomaraProfileDraftStore {
    suspend fun save(snapshot: ShomaraProfileDraftSnapshot)
    suspend fun read(): ShomaraProfileDraftSnapshot?
    suspend fun clear()
}

/** Real DataStore-backed draft store; reads of an empty store return null (nothing to resume). */
class PreferencesProfileDraftStore(
    private val dataStore: DataStore<Preferences>,
) : ShomaraProfileDraftStore {

    override suspend fun save(snapshot: ShomaraProfileDraftSnapshot) {
        require(snapshot.name.isNotEmpty()) { "refusing to persist an empty draft" }
        dataStore.edit {
            it[NAME_KEY] = snapshot.name
            it[GRADE_KEY] = snapshot.gradeId
        }
    }

    override suspend fun read(): ShomaraProfileDraftSnapshot? {
        val prefs = dataStore.data.first()
        val name = prefs[NAME_KEY] ?: return null
        return ShomaraProfileDraftSnapshot(
            name = name,
            gradeId = prefs[GRADE_KEY] ?: "",
        )
    }

    override suspend fun clear() {
        dataStore.edit { it.remove(NAME_KEY); it.remove(GRADE_KEY) }
    }

    companion object {
        private val NAME_KEY = stringPreferencesKey("shomara_profile_name")
        private val GRADE_KEY = stringPreferencesKey("shomara_profile_grade")
    }
}
