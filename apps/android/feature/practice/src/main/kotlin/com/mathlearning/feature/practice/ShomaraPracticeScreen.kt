package com.mathlearning.feature.practice

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** تمرین — real implementation lands with its N05 task; shell wiring is N05-01. */
@Composable
fun ShomaraPracticeScreen(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text = "تمرین", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
    }
}
