package com.mathlearning.app.preview

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.mathlearning.core.designsystem.ShomaraEntryState
import com.mathlearning.core.designsystem.ShomaraTheme
import com.mathlearning.feature.path.ShomaraHomeScreen
import com.mathlearning.feature.path.ShomaraHomeUiState
import com.mathlearning.feature.path.ShomaraPathProgress

/** Android Studio fixtures only; instrumented screenshots/tests are the rendering evidence. */
@Preview(name = "Home · Fresh · 360dp", widthDp = 360, heightDp = 800, locale = "fa")
@Composable
private fun HomeFreshPreview() {
    ShomaraTheme {
        ShomaraHomeScreen(
            state = ShomaraHomeUiState(progress = ShomaraPathProgress.emptyResolved()),
            onAction = {},
        )
    }
}

@Preview(name = "Home · Current · 390dp", widthDp = 390, heightDp = 800, locale = "fa")
@Composable
private fun HomeCurrentPreview() {
    ShomaraTheme {
        ShomaraHomeScreen(
            state = ShomaraHomeUiState(
                progress = ShomaraPathProgress(
                    completedStationIds = setOf("ST01", "ST02", "ST03"),
                    perfectStationIds = setOf("ST02"),
                    currentStationId = "ST04",
                    isResolved = true,
                ),
            ),
            onAction = {},
        )
    }
}

@Preview(name = "Home · Error · 412dp", widthDp = 412, heightDp = 800, locale = "fa")
@Composable
private fun HomeErrorPreview() {
    ShomaraTheme {
        ShomaraHomeScreen(
            state = ShomaraHomeUiState(
                progress = ShomaraPathProgress.emptyResolved(),
                entryState = ShomaraEntryState.Error,
            ),
            onAction = {},
        )
    }
}

@Preview(name = "Home · Current · 200% font", widthDp = 360, heightDp = 800, fontScale = 2f, locale = "fa")
@Composable
private fun HomeLargeTextPreview() = HomeCurrentPreview()
