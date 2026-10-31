package com.mathlearning.feature.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/** Me tab (family 14) — real implementation lands with N05-05; parent entry wired now (N05-06 boundary). */
@Composable
fun ShomaraMeScreen(onOpenParent: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text = "من", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
        ShomaraButton(text = "بخش والدین", onClick = onOpenParent, variant = ShomaraButtonVariant.Secondary)
    }
}
