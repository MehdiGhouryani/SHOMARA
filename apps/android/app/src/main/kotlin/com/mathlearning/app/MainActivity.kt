package com.mathlearning.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.mathlearning.app.navigation.ShomaraApp
import com.mathlearning.core.datastore.ShomaraSettingsSnapshot
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.core.designsystem.ShomaraTokens

/**
 * Single activity (AGENTS §5).
 *
 * Splash hand-off (N08-15):
 *  - Android's own launch window paints `Theme.Shomara`'s window background — the artwork's warm
 *    cream — before any Kotlin runs. On API 31+ the system splash additionally uses the branded
 *    launcher mark on that same cream, configured in `values-v31/themes.xml`.
 *  - The first Compose frame is the branded splash (`ShomaraLaunchState.Resolving`), which paints the
 *    same cream and then the artwork. The two surfaces share a colour, so there is no white flash and
 *    no second, different splash.
 *  - No artificial hold is applied: the gate dismisses as soon as launch resolution completes.
 */
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
                // N08-15: the root paints the canonical canvas. Without this, every screen that does
                // not paint its own background would inherit the launch window's splash cream and
                // silently change appearance. The splash paints its own cream on top of this.
                Surface(
                    color = ShomaraTokens.ColorCanvas,
                    modifier = Modifier.fillMaxSize(),
                ) {
                    ShomaraApp(
                        authSession = container.authSession,
                        profileDraftStore = container.profileDraftStore,
                        lessonGateway = container.lessonGateway,
                        lessonCheckpoints = container.lessonCheckpointStore,
                        settingsStore = container.settingsStore,
                        simulatedAuth = container.simulatedAuthEnabled,
                        backendConfigured = container.isBackendConfigured(),
                    )
                }
            }
        }
    }
}