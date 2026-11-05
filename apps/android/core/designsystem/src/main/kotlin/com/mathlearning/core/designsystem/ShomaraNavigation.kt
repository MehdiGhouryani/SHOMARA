package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign

/**
 * Child shell contract (START_HERE §7, protected decision): exactly three canonical tabs —
 * «مسیر / تمرین / من». Guardian surfaces stay outside the child tab bar.
 */
object ShomaraChildTabs {
    const val Path: String = "مسیر"
    const val Practice: String = "تمرین"
    const val Me: String = "من"

    val All: List<String> = listOf(Path, Practice, Me)

    /** The child tab bar must be exactly the canonical three, in canonical order. */
    fun isCanonical(tabs: List<String>): Boolean = tabs == All
}

data class ShomaraTab(
    val id: String,
    val label: String,
    val locked: Boolean = false,
    val lockReason: String? = null,
) {
    init {
        if (locked) require(!lockReason.isNullOrEmpty()) { "locked tabs must announce why they are locked" }
    }
}

object ShomaraTabLogic {
    fun canSelect(tab: ShomaraTab): Boolean = !tab.locked

    /** Locked tabs announce themselves as locked, never silently disabled.
     * Stage 1 (family 17): an unselected tab now also announces itself
     * ("انتخاب نشده") instead of having no state at all, so TalkBack
     * traversal always reports the tab state. */
    fun stateLabelFor(tab: ShomaraTab, isSelected: Boolean): String = when {
        tab.locked -> "قفل: ${tab.lockReason}"
        isSelected -> "فعال"
        else -> "انتخاب نشده"
    }

    /** Duplicate navigation guard: re-tapping the selected tab keeps the selection unchanged. */
    fun resolveSelection(selectedId: String?, tapped: ShomaraTab?): String? = when {
        tapped == null -> selectedId
        tapped.locked -> selectedId
        tapped.id == selectedId -> selectedId
        else -> tapped.id
    }

    fun colorsFor(isSelected: Boolean): Pair<Color, Color> =
        if (isSelected) ShomaraTokens.ColorPrimarySoft to ShomaraTokens.ColorPrimaryDark
        else ShomaraTokens.ColorSurface to ShomaraTokens.ColorInk2
}

@Composable
fun ShomaraTabBar(
    tabs: List<ShomaraTab>,
    selectedId: String?,
    onSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    // E-05: a hairline above the tab row separates the bar from the content scrolling under
    // it — the bar reads as a surface, not a loose strip on the canvas.
    Column(modifier = modifier.fillMaxWidth()) {
        HorizontalDivider(color = ShomaraTokens.ColorLine)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                // Batch 2 (ADR-0040 R1): the tab bar is a tactile surface, so it
                // renders its clay depth (Soft) instead of sitting flat on the canvas.
                .shadow(ShomaraTokens.ClaySoftElevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
                .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusLg))
                .padding(ShomaraTokens.Space4),
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
        ) {
            for (tab in tabs) {
                val isSelected = tab.id == selectedId
                val (container, content) = ShomaraTabLogic.colorsFor(isSelected)
                val label = ShomaraTabLogic.stateLabelFor(tab, isSelected)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH)
                        // The selected tab is the one active pill: it carries the
                        // Soft depth, unselected tabs stay Flat — never a second
                        // Featured surface in the same viewport.
                        .shadow(ShomaraClay.specFor(if (isSelected) ShomaraClayDepth.Soft else ShomaraClayDepth.Flat).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .semantics {
                            role = Role.Tab
                            if (label.isNotEmpty()) stateDescription = label
                            if (tab.locked) contentDescription = "${tab.label} — ${ShomaraTabLogic.stateLabelFor(tab, isSelected)}"
                        }
                        .clickable(enabled = ShomaraTabLogic.canSelect(tab), role = Role.Tab) {
                            if (tapGuard.begin()) {
                                try { onSelected(ShomaraTabLogic.resolveSelection(selectedId, tab) ?: selectedId.orEmpty()) } finally { tapGuard.end() }
                            }
                        }
                        .padding(ShomaraTokens.Space8),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(text = tab.label, style = ShomaraTypography.Body, color = content)
                }
            }
        }
    }
}

object ShomaraTopBarLogic {
    /** Back is real: the bar only shows a back affordance when a real route exists behind it. */
    fun backIsReal(showBack: Boolean): Boolean = showBack

    fun height(): androidx.compose.ui.unit.Dp = ShomaraTokens.ComponentTopBarH
    fun backTouchTarget(): androidx.compose.ui.unit.Dp = ShomaraTokens.ComponentTouchMin
}

/** TopBar renders title, optional real Back, and badge-free trailing slot (contract: badge-free). */
@Composable
fun ShomaraTopBar(
    title: String,
    onBack: (() -> Unit)?,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraTopBarLogic.height())
            .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space4),
        contentAlignment = Alignment.Center,
    ) {
        // N08-03: the title is laid out in a Row that RESERVES the back/trailing slots instead of
        // centring over them in a Box. At 200% font scale a centred title used to overlap the back
        // affordance; now it wraps inside its own weighted column and the bar grows in height.
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (onBack != null) {
                Box(
                    modifier = Modifier
                        .defaultMinSize(minWidth = ShomaraTopBarLogic.backTouchTarget(), minHeight = ShomaraTopBarLogic.backTouchTarget())
                        // Batch 2 (ADR-0040 R1): the back affordance is tactile,
                        // so it renders its Soft clay depth like every button.
                        .shadow(ShomaraTokens.ClaySoftElevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
                        .semantics { role = Role.Button; stateDescription = "بازگشت" }
                        .clickable(role = Role.Button) {
                            if (tapGuard.begin()) {
                                try { onBack() } finally { tapGuard.end() }
                            }
                        }
                        .padding(ShomaraTokens.Space8),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(text = "→", style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk)
                }
                Spacer(modifier = Modifier.width(ShomaraTokens.Space8))
            }
            Text(
                text = title,
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f).semantics { heading() },
            )
            if (trailing != null) {
                Spacer(modifier = Modifier.width(ShomaraTokens.Space8))
                trailing()
            }
        }
    }
}
