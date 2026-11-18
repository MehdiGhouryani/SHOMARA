package com.mathlearning.feature.path

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraTokens

/** Compact header. The optional character slot is an approved static art asset, never a redraw. */
@Composable
fun ShomaraHomeHeader(
    title: String,
    subtitle: String,
    onSettings: (() -> Unit)?,
    modifier: Modifier = Modifier,
    settingsContentDescription: String = "باز کردن تنظیمات",
    characterSlot: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        // In RTL, the first child is at the right edge: title first, then mascot, then settings.
        Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) {
            Text(
                title,
                color = ShomaraHomeUiTokens.Ink,
                fontSize = ShomaraTokens.TypeTitleFontSize,
                lineHeight = ShomaraTokens.TypeTitleLineHeight,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.End,
                modifier = Modifier.semantics { heading() },
            )
            Spacer(Modifier.height(ShomaraTokens.Space4))
            Text(subtitle, color = ShomaraHomeUiTokens.Muted, fontSize = ShomaraTokens.TypeBodyFontSize,
                lineHeight = ShomaraTokens.TypeBodyLineHeight, textAlign = TextAlign.End)
        }
        if (characterSlot != null) {
            Box(Modifier.size(ShomaraTokens.ComponentNodeSize), contentAlignment = Alignment.Center) { characterSlot() }
        }
        if (onSettings != null) {
            Surface(
                onClick = onSettings,
                modifier = Modifier
                    .defaultMinSize(minWidth = ShomaraTokens.ComponentTouchMin, minHeight = ShomaraTokens.ComponentTouchMin)
                    .semantics { contentDescription = settingsContentDescription },
                shape = RoundedCornerShape(ShomaraTokens.Space16),
                color = ShomaraHomeUiTokens.Surface,
                border = BorderStroke(ShomaraTokens.Space4, ShomaraHomeUiTokens.Border),
                shadowElevation = ShomaraTokens.Space4,
            ) {
                Box(Modifier.padding(ShomaraTokens.Space12), contentAlignment = Alignment.Center) {
                    androidx.compose.foundation.Image(
                        painter = painterResource(R.drawable.shomara_ui_settings),
                        contentDescription = null,
                        modifier = Modifier.size(ShomaraTokens.Space24),
                    )
                }
            }
        }
    }
}

