package com.mathlearning.feature.path

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.R
import com.mathlearning.core.designsystem.ShomaraTapGuard
import com.mathlearning.core.designsystem.rememberShomaraTapGuard

/** Exactly three child destinations. The app coordinator remains the route owner. */
enum class ShomaraHomeTab(val label: String) {
    Path("مسیر"),
    Practice("تمرین"),
    Me("من"),
}

/**
 * Icon-first bottom bar for the supplied home visual direction.
 * The parent Scaffold owns navigationBarsPadding/WindowInsets; do not apply a second inset here.
 */
@Composable
fun ShomaraHomeBottomBar(
    selected: ShomaraHomeTab,
    onSelect: (ShomaraHomeTab) -> Unit,
    modifier: Modifier = Modifier,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    Surface(
        modifier = modifier.fillMaxWidth().shadow(8.dp, RoundedCornerShape(28.dp)),
        color = ShomaraHomeUiTokens.Surface,
        shape = RoundedCornerShape(28.dp),
        tonalElevation = 0.dp,
        shadowElevation = 0.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, ShomaraHomeUiTokens.Border),
    ) {
        Row(
            Modifier.fillMaxWidth().padding(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            // Row is RTL: logical order starts at the right (Path), then Practice, then Me.
            // Physical left-to-right in the screenshot is therefore Me / Practice / Path.
            HomeNavItem(ShomaraHomeTab.Path, selected, R.drawable.shomara_nav_path_active,
                R.drawable.shomara_nav_path_inactive, onSelect, tapGuard, Modifier.weight(1f))
            HomeNavItem(ShomaraHomeTab.Practice, selected, R.drawable.shomara_nav_practice_active,
                R.drawable.shomara_nav_practice_inactive, onSelect, tapGuard, Modifier.weight(1f))
            HomeNavItem(ShomaraHomeTab.Me, selected, R.drawable.shomara_nav_me_active,
                R.drawable.shomara_nav_me_inactive, onSelect, tapGuard, Modifier.weight(1f))
        }
    }
}

@Composable
private fun HomeNavItem(
    tab: ShomaraHomeTab,
    selected: ShomaraHomeTab,
    activeIcon: Int,
    inactiveIcon: Int,
    onSelect: (ShomaraHomeTab) -> Unit,
    tapGuard: ShomaraTapGuard,
    modifier: Modifier = Modifier,
) {
    val isSelected = selected == tab
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reducedMotion = LocalShomaraReducedMotion.current
    val target = when {
        isSelected -> ShomaraHomeUiTokens.VioletSoft
        pressed -> ShomaraHomeUiTokens.PressedSoft
        else -> ShomaraHomeUiTokens.Surface
    }
    val background by animateColorAsState(
        targetValue = target,
        animationSpec = tween(if (reducedMotion) 0 else 120),
        label = "shomara-home-tab-container",
    )

    Column(
        modifier = modifier
            .defaultMinSize(minHeight = 64.dp)
            .background(background, RoundedCornerShape(22.dp))
            .semantics(mergeDescendants = true) {
                selected = isSelected
                stateDescription = if (isSelected) "فعال" else "انتخاب نشده"
            }
            .clickable(interactionSource = interaction, indication = null, role = Role.Tab) {
                if (!isSelected && tapGuard.beginLatched()) {
                    try {
                        onSelect(tab)
                    } finally {
                        tapGuard.end()
                    }
                }
            }
            .padding(horizontal = 4.dp, vertical = 7.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Image(
            painter = painterResource(if (isSelected) activeIcon else inactiveIcon),
            contentDescription = null,
            modifier = Modifier.size(28.dp),
        )
        Text(
            text = tab.label,
            color = if (isSelected) ShomaraHomeUiTokens.VioletDark else ShomaraHomeUiTokens.Muted,
            fontSize = 12.sp,
            lineHeight = 17.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
        )
    }
}
