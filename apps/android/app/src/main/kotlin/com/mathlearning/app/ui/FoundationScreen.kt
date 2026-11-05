package com.mathlearning.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.mathlearning.app.R
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

@Composable
fun FoundationScreen(modifier: Modifier = Modifier) {
    Surface(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = ShomaraTokens.Space24)
                .testTag("foundation-screen"),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // F-42: the foundation screen renders with the design-system typography and
            // tokens, not Material defaults — it is a SHOMARA surface, not a stock one.
            // The strings stay resource-backed (stringResource is unchanged).
            Text(
                text = stringResource(R.string.foundation_title),
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = stringResource(R.string.foundation_description),
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
                modifier = Modifier.padding(top = ShomaraTokens.Space12),
            )
        }
    }
}
