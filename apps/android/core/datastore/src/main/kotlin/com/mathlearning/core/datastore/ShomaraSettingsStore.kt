package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

/**
 * Persisted child preferences (N08-04 / family 15). Before this store existed, the avatar and the
 * reduced-motion toggle lived ONLY in `remember { mutableStateOf(...) }`, so every process death
 * silently reset the child's choices while the UI still reported "ذخیره شد." — a misleading success
 * state. This is the real persistence layer behind that screen.
 *
 * Fail-closed reading: a corrupt or unreadable store yields [ShomaraSettingsSnapshot.Defaults]
 * rather than throwing into the composition. Defaults are the documented product defaults, never a
 * fabricated preference.
 */
data class ShomaraSettingsSnapshot(
    val avatarId: String,
    val reducedMotion: Boolean,
) {
    companion object {
        /**
         * Canonical defaults. `avatarId` is intentionally the same default the avatar catalog
         * declares, and motion is ON (animation allowed) because no owner decision has set the
         * haptic/motion default — see CONTENT-007, which stays OWNER_DECISION_PENDING.
         */
        val Defaults: ShomaraSettingsSnapshot = ShomaraSettingsSnapshot(avatarId = "sun", reducedMotion = false)
    }
}

interface ShomaraSettingsStore {
    /** Always emits a usable snapshot; never throws on corrupt data. */
    val state: Flow<ShomaraSettingsSnapshot>

    /** Persists the snapshot; callers must surface failures instead of faking a success message. */
    suspend fun save(snapshot: ShomaraSettingsSnapshot)
}

/** Real DataStore-backed settings store. */
class PreferencesSettingsStore(
    private val dataStore: DataStore<Preferences>,
    private val validAvatarIds: Set<String> = DEFAULT_AVATAR_IDS,
    private val defaultAvatarId: String = "sun",
) : ShomaraSettingsStore {

    override val state: Flow<ShomaraSettingsSnapshot> = dataStore.data
        .catch { throwable ->
            // Only swallow an I/O read failure (a transient disk problem); a programming error
            // must still crash loudly rather than be masked as "defaults".
            if (throwable is IOException) emit(androidx.datastore.preferences.core.emptyPreferences())
            else throw throwable
        }
        .map { prefs ->
            val storedAvatar = prefs[AVATAR_KEY]
            ShomaraSettingsSnapshot(
                // An unknown avatar id (e.g. a catalog change) falls back to the default instead of
                // rendering a surface the catalog cannot resolve.
                avatarId = if (storedAvatar != null && storedAvatar in validAvatarIds) storedAvatar else defaultAvatarId,
                reducedMotion = prefs[REDUCED_MOTION_KEY] ?: false,
            )
        }

    override suspend fun save(snapshot: ShomaraSettingsSnapshot) {
        require(snapshot.avatarId in validAvatarIds) { "unknown avatar ${snapshot.avatarId}" }
        dataStore.edit {
            it[AVATAR_KEY] = snapshot.avatarId
            it[REDUCED_MOTION_KEY] = snapshot.reducedMotion
        }
    }

    companion object {
        private val AVATAR_KEY = stringPreferencesKey("shomara_settings_avatar")
        private val REDUCED_MOTION_KEY = booleanPreferencesKey("shomara_settings_reduced_motion")

        /** Mirrors ShomaraAvatarCatalog; kept here so core:datastore stays free of feature imports. */
        val DEFAULT_AVATAR_IDS: Set<String> = setOf("sun", "leaf", "cloud", "moon")
    }
}