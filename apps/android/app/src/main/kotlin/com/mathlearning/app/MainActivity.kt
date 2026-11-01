package com.mathlearning.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.mathlearning.app.navigation.ShomaraApp
import com.mathlearning.core.designsystem.ShomaraTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShomaraTheme {
                ShomaraApp(
                    authSession = (application as ShomaraApplication).container.authSession,
                    profileDraftStore = (application as ShomaraApplication).container.profileDraftStore,
                    lessonGateway = (application as ShomaraApplication).container.lessonGateway,
                    lessonCheckpoints = (application as ShomaraApplication).container.lessonCheckpointStore,
                )
            }
        }
    }
}
