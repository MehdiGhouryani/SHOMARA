package com.mathlearning.core.designsystem.lessontemplates

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * Shared lesson-template UI primitives (S2/S3 quality pass).
 *
 * Every template needs the same tappable tile: a surface that grows with 200% font, a
 * distinction for "given" and "selected", a button ROLE for TalkBack, and a neutral press
 * affordance (no ripple noise over the clay surface). Eleven templates used to carry their own
 * copy of that chain — with drifting state descriptions and one place that forgot the state
 * entirely. It lives here once.
 */
@Composable
fun LessonTemplateTile(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    enabled: Boolean = true,
    isGiven: Boolean = false,
    selectedStateText: String = "انتخاب شد",
    idleStateText: String = "انتخاب نشده",
    size: Dp? = null,
    textStyle: TextStyle = ShomaraTypography.BigNum,
    contentColor: Color? = null,
) {
    val surface = when {
        isGiven -> ShomaraTokens.ColorSurfaceAlt
        selected -> ShomaraTokens.ColorPrimarySoft
        else -> ShomaraTokens.ColorSurface
    }
    val border = when {
        selected -> ShomaraTokens.ClayAnswerTileBorderWidth
        isGiven -> ShomaraTokens.ClaySoftBorderWidth
        else -> ShomaraTokens.ClaySoftBorderWidth
    }
    val borderColor = when {
        selected -> ShomaraTokens.ColorPrimary
        isGiven -> ShomaraTokens.ColorLine2
        else -> ShomaraTokens.ColorLine
    }
    val textColor = contentColor ?: when {
        selected -> ShomaraTokens.ColorPrimary
        enabled -> ShomaraTokens.ColorInk
        else -> ShomaraTokens.ColorMuted
    }
    val shape = RoundedCornerShape(ShomaraTokens.Space8)
    Box(
        modifier = modifier
            .then(if (size != null) Modifier.size(size) else Modifier)
            .background(surface, shape)
            .border(border, borderColor, shape)
            .semantics(mergeDescendants = true) {
                role = Role.Button
                contentDescription = label
                stateDescription = when {
                    isGiven -> "داده‌شده"
                    selected -> selectedStateText
                    else -> idleStateText
                }
            }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onClick,
            )
            .padding(horizontal = ShomaraTokens.Space8, vertical = ShomaraTokens.Space4),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = label, style = textStyle, color = textColor)
    }
}

/** The canonical tray row: one horizontal band of choices, centred, with the spacing token. */
@Composable
fun LessonTemplateTray(
    modifier: Modifier = Modifier,
    spacing: Dp = ShomaraTokens.Space12,
    content: @Composable RowScope.() -> Unit,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(spacing, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
        content = content,
    )
}
