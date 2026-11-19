package com.mathlearning.core.designsystem

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics

/**
 * C03 of the Home handoff: the grade chip — "فقط grade واقعی؛ بدون badge ارزگونه".
 *
 * The label is always supplied by the caller from a real source of truth. There is deliberately no
 * default and no "unavailable" visual: the catalog's `unavailable` state means the chip is NOT
 * COMPOSED at all (this build holds no grade for the learner, O5). A chip that rendered a made-up
 * grade would fabricate learner data — the same class of violation as any invented reward marker.
 *
 * Contrast note (DT-71): violetDark on violetSoft measures 6.04:1, well above the 4.5:1 the token
 * pack itself requires for 13sp/700 text.
 */
@Composable
fun ShomaraGradeChip(
    gradeLabel: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .heightIn(min = ShomaraTokens.ComponentTouchMin / 2)
            .background(
                color = ShomaraTokens.ColorHomeVioletSoft,
                shape = RoundedCornerShape(ShomaraTokens.RadiusPill),
            )
            .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Image(
            painter = painterResource(R.drawable.shomara_ui_bookmark),
            contentDescription = null,
            modifier = Modifier.size(ShomaraTokens.Space16),
        )
        Text(
            text = gradeLabel,
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorHomeVioletDark,
            modifier = Modifier
                .padding(start = ShomaraTokens.Space8)
                .semantics { contentDescription = gradeLabel },
        )
    }
}

/**
 * C12 of the Home handoff: the return-to-current-station FAB.
 *
 * Catalog contract: "فقط پس از scroll threshold واقعی؛ safe-area-aware". The composable renders
 * NOTHING when [visible] is false — there is no invisible-but-present state, so a TalkBack user can
 * never focus a control that has no meaning at the current scroll position. The caller (the path
 * screen, which owns the scroll state) decides visibility from a measured threshold; this file
 * never guesses it.
 *
 * The 56dp target meets the 48dp minimum with margin, and the spoken label is the caller's real
 * action sentence (Home already has a canonical "بازگشت به ایستگاه فعلی"), not a generic "button".
 */
@Composable
fun ShomaraPathReturnFab(
    visible: Boolean,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
) {
    if (!visible) return
    ShomaraIconButton(
        iconText = "↓",
        contentDescription = contentDescription,
        onClick = onClick,
        modifier = modifier,
    )
}
/**
 * C14 of the Home handoff: the lesson topic icon — counting/addition/shapes/patterns.
 *
 * States are the three the catalog lists: default, selected, disabled. Selection and disability are
 * VISUAL ONLY here; whether a lesson is actually selectable is owned by the domain, never by an icon.
 * The spoken label equals the topic label, so TalkBack reads the same words a sighted child sees.
 */
enum class ShomaraLessonTopic(val drawableRes: Int, val faLabel: String) {
    Counting(R.drawable.shomara_lesson_counting, "شمارش"),
    Addition(R.drawable.shomara_lesson_addition, "جمع"),
    Shapes(R.drawable.shomara_lesson_shapes, "شکل‌ها"),
    Patterns(R.drawable.shomara_lesson_patterns, "الگوها"),
}

@Composable
fun ShomaraLessonTopicIcon(
    topic: ShomaraLessonTopic,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    enabled: Boolean = true,
) {
    val tint = when {
        !enabled -> ShomaraTokens.ColorHomeMuted
        selected -> ShomaraTokens.ColorHomeVioletDark
        else -> ShomaraTokens.ColorHomeViolet
    }
    val boxColor = when {
        !enabled -> ShomaraTokens.ColorHomeBorder
        selected -> ShomaraTokens.ColorHomeVioletSoft
        else -> ShomaraTokens.ColorHomeCanvas
    }
    Box(
        modifier = modifier
            .size(ShomaraTokens.ComponentTouchMin)
            .background(boxColor, RoundedCornerShape(ShomaraTokens.RadiusSm))
            .semantics {
                contentDescription = topic.faLabel
                if (selected) {
                    this.selected = true
                }
                if (!enabled) {
                    disabled()
                }
            },
        contentAlignment = Alignment.Center,
    ) {
        Image(
            painter = painterResource(topic.drawableRes),
            contentDescription = null,
            modifier = Modifier.size(ShomaraTokens.Space24),
            colorFilter = androidx.compose.ui.graphics.ColorFilter.tint(tint),
        )
    }
}
