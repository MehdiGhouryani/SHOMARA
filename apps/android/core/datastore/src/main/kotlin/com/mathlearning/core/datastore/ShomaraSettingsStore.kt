package com.mathlearning.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

/**
 * Persisted child preferences (N08-04 / family 15). Before this store existed, the preference
 * toggle lived ONLY in `remember { mutableStateOf(...) }`, so every process death silently reset the
 * child's choice while the UI still reported "ذخیره شد." — a misleading success state. This is the
 * real persistence layer behind that screen.
 *
 * ADR-0051: the child avatar preset was removed by owner decision, so the store persists only the
 * reduced-motion preference. The old `shomara_settings_avatar` key is simply no longer read;
 * orphaned data is ignored rather than migrated, and no Kotlin surface knows an avatar id exists.
 *
 * Fail-closed reading: a corrupt or unreadable store yields [ShomaraSettingsSnapshot.Defaults]
 * rather than throwing into the composition. Defaults are the documented product defaults, never a
 * fabricated preference.
 */
data class ShomaraSettingsSnapshot(
    val reducedMotion: Boolean,
) {
    companion object {
        /**
         * Canonical defaults. Motion is ON (animation allowed) because no owner decision has set the
         * haptic/motion default — see CONTENT-007, which stays OWNER_DECISION_PENDING.
         */
        val Defaults: ShomaraSettingsSnapshot = ShomaraSettingsSnapshot(reducedMotion = false)
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
) : ShomaraSettingsStore {

    override val state: Flow<ShomaraSettingsSnapshot> = dataStore.data
        .catch { throwable ->
            // Only swallow an I/O read failure (a transient disk problem); a programming error
            // must still crash loudly rather than be masked as "defaults".
            if (throwable is IOException) emit(androidx.datastore.preferences.core.emptyPreferences())
            else throw throwable
        }
        .map { prefs ->
            ShomaraSettingsSnapshot(
                reducedMotion = prefs[REDUCED_MOTION_KEY] ?: false,
            )
        }

    override suspend fun save(snapshot: ShomaraSettingsSnapshot) {
        dataStore.edit {
            it[REDUCED_MOTION_KEY] = snapshot.reducedMotion
        }
    }

    companion object {
        private val REDUCED_MOTION_KEY = booleanPreferencesKey("shomara_settings_reduced_motion")
    }
}
