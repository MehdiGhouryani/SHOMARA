package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first

/** Persisted profile draft snapshot (N04-04 incomplete-profile resume across process death). */
data class ShomaraProfileDraftSnapshot(
    val name: String,
    val avatarId: String,
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
            it[AVATAR_KEY] = snapshot.avatarId
            it[GRADE_KEY] = snapshot.gradeId
        }
    }

    override suspend fun read(): ShomaraProfileDraftSnapshot? {
        val prefs = dataStore.data.first()
        val name = prefs[NAME_KEY] ?: return null
        return ShomaraProfileDraftSnapshot(
            name = name,
            avatarId = prefs[AVATAR_KEY] ?: "",
            gradeId = prefs[GRADE_KEY] ?: "",
        )
    }

    override suspend fun clear() {
        dataStore.edit { it.remove(NAME_KEY); it.remove(AVATAR_KEY); it.remove(GRADE_KEY) }
    }

    companion object {
        private val NAME_KEY = stringPreferencesKey("shomara_profile_name")
        private val AVATAR_KEY = stringPreferencesKey("shomara_profile_avatar")
        private val GRADE_KEY = stringPreferencesKey("shomara_profile_grade")
    }
}
