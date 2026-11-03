package com.mathlearning.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.mathlearning.app.navigation.ShomaraApp
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.designsystem.ShomaraTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // N08-04: the persisted reduced-motion preference is read once and merged with the
            // system animator scale inside ShomaraTheme, so every nested surface (progress bars,
            // celebrations) honours it without each screen plumbing the flag by hand.
            val container = (application as ShomaraApplication).container
            // Seeded with the documented defaults so the very first frame renders with the same
            // settings the store will emit, instead of flashing a different default.
            val settingsState by container.settingsStore.state
                .collectAsStateWithLifecycle(initialValue = ShomaraSettingsSnapshot.Defaults)
            ShomaraTheme(reducedMotion = settingsState.reducedMotion) {
                ShomaraApp(
                    authSession = container.authSession,
                    profileDraftStore = container.profileDraftStore,
                    lessonGateway = container.lessonGateway,
                    lessonCheckpoints = container.lessonCheckpointStore,
                    settingsStore = container.settingsStore,
                )
            }
        }
    }
}
