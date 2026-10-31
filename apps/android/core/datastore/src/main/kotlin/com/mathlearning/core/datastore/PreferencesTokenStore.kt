package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first

/**
 * Real DataStore-backed token store (N04-03 «secure token storage»). The token lives in the
 * app-private DataStore file; clear() removes the key entirely so no secret residue remains
 * (N04-05). The token is never included in toString/logs.
 */
class PreferencesTokenStore(
    private val dataStore: DataStore<Preferences>,
) : ShomaraTokenStore {

    override suspend fun save(token: String) {
        require(token.isNotBlank()) { "refusing to store a blank token" }
        dataStore.edit { it[TOKEN_KEY] = token }
    }

    override suspend fun read(): String? = dataStore.data.first()[TOKEN_KEY]

    override suspend fun clear() {
        dataStore.edit { it.remove(TOKEN_KEY) }
    }

    override fun toString(): String = "PreferencesTokenStore(secret redacted)"

    companion object {
        private val TOKEN_KEY = stringPreferencesKey("shomara_access_token")
    }
}
