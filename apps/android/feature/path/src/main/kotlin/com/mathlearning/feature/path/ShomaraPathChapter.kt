package com.mathlearning.feature.path

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraChapterCatalog
import com.mathlearning.core.model.ShomaraStationCatalog

/** One tactile chapter boundary; its count is the same verified progress used by Home. */
@Composable
internal fun ShomaraChapterBand(chapter: Int, progress: ShomaraPathProgress) {
    val (bandBackground, bandAccent) = ShomaraPathGraphLogic.chapterBandColors(chapter)
    val completed = ShomaraPathGraphLogic.completedInChapter(chapter, progress)
    val total = ShomaraStationCatalog.STATIONS_PER_CHAPTER
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                val edge = ShomaraTokens.ComponentEdge.toPx()
                drawRoundRect(
                    color = lerp(bandBackground, bandAccent, 0.45f),
                    topLeft = Offset(0f, edge),
                    size = size,
                    cornerRadius = CornerRadius(ShomaraTokens.RadiusLg.toPx()),
                )
            }
            .background(bandBackground, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .padding(ShomaraTokens.Space16),
        horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(ShomaraTokens.Space40)
                .background(bandAccent, RoundedCornerShape(ShomaraTokens.RadiusMd))
                .clearAndSetSemantics {},
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = ShomaraDigits.toFa(chapter),
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorWhite,
            )
        }
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
        ) {
            Text(
                text = ShomaraChapterCatalog.labelFor(chapter),
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
            Text(
                text = ShomaraPathGraphLogic.chapterSpanLabel(chapter),
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier.semantics { heading() },
            )
            Text(
                text = "${ShomaraDigits.toFa(completed)} از ${ShomaraDigits.toFa(total)} کامل شد",
                style = ShomaraTypography.Caption,
                color = ShomaraTokens.ColorInk2,
            )
        }
    }
}
