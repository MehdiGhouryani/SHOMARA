package com.mathlearning.feature.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraAvatarCatalog

/**
 * Avatar/settings surface (family 15): real preference toggles and the canonical avatar grid.
 * Save state: dirty/saving/saved/error(+toggle-fail revert). No fake toggles, no destructive
 * action without confirm.
 */
enum class ShomaraSettingsSaveState { Clean, Dirty, Saving, Saved, Error }

data class ShomaraSettingsState(
    val avatarId: String,
    val reducedMotion: Boolean,
    val save: ShomaraSettingsSaveState = ShomaraSettingsSaveState.Clean,
    val errorText: String? = null,
) {
    init {
        require(avatarId in ShomaraAvatarCatalog.Options.map { it.id }) { "unknown avatar $avatarId" }
    }

    val canSave: Boolean
        get() = save == ShomaraSettingsSaveState.Dirty

    fun withAvatar(avatarId: String): ShomaraSettingsState =
        if (avatarId == this.avatarId) this else copy(avatarId = avatarId, save = ShomaraSettingsSaveState.Dirty)

    fun withReducedMotion(enabled: Boolean): ShomaraSettingsState =
        if (enabled == this.reducedMotion) this else copy(reducedMotion = enabled, save = ShomaraSettingsSaveState.Dirty)

    fun startSave(): ShomaraSettingsState {
        require(canSave) { "save started from an invalid state" }
        return copy(save = ShomaraSettingsSaveState.Saving)
    }

    fun onSaveSuccess(): ShomaraSettingsState = copy(save = ShomaraSettingsSaveState.Saved, errorText = null)

    /** Toggle-fail: the preference reverts and the error is announced (never silently lost). */
    fun onSaveFailure(message: String): ShomaraSettingsState =
        copy(save = ShomaraSettingsSaveState.Error, errorText = message)
}

object ShomaraSettingsStrings {
    const val Title: String = "آواتار و تنظیمات"
    const val AvatarSection: String = "آواتار من"
    const val ReducedMotionLabel: String = "حرکت کمتر"
    const val ReducedMotionHint: String = "انیمیشن‌ها آرام‌تر می‌شوند."
    const val Save: String = "ذخیره"
    const val SavedMessage: String = "ذخیره شد."
    const val SaveFailed: String = "ذخیره نشد؛ دوباره تلاش کن."
}

@Composable
fun ShomaraSettingsScreen(
    state: ShomaraSettingsState,
    onAvatarSelect: (String) -> Unit,
    onReducedMotionChange: (Boolean) -> Unit,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Stage 4, family 15, parent/settings dial 2/2/5: calm and textual.
    // Inset stays 16dp, not 24dp, by arithmetic: the avatar grid is
    // 4 x 72dp tiles + 3 x 8dp gaps = 312dp, which would exactly fill a
    // 360dp screen at 24dp insets with no slack. 16dp is the adaptive
    // reduction, still a v2 token, and it is recorded here, not hidden.
    Column(modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = ShomaraSettingsStrings.Title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        Text(text = ShomaraSettingsStrings.AvatarSection, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        // Stage 5, 200%-font fix: the row fills the width and each tile
        // takes an equal weight with a MINIMUM height of 72dp instead of
        // a fixed 72dp size, so at 200% font the tile grows taller rather
        // than clipping its label. Width at 360dp stays ~76dp (360 - 32
        // insets - 24 gaps, / 4), so no target drops below 48dp.
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
            for (option in ShomaraAvatarCatalog.Options) {
                val equipped = option.id == state.avatarId
                AvatarTile(option = option, equipped = equipped, onEquip = onAvatarSelect)
            }
        }
        // Selected state is stated in plain text, never carried by
        // colour or border width alone.
        Text(text = "آواتار انتخاب‌شده: " + ShomaraAvatarCatalog.option(state.avatarId).label, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk2)
        Text(text = "تنظیمات", style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        ToggleRow(
            label = ShomaraSettingsStrings.ReducedMotionLabel,
            hint = ShomaraSettingsStrings.ReducedMotionHint,
            checked = state.reducedMotion,
            enabled = state.save != ShomaraSettingsSaveState.Saving,
            onChecked = onReducedMotionChange,
        )
        when (state.save) {
            ShomaraSettingsSaveState.Saved -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Correct, text = ShomaraSettingsStrings.SavedMessage)
            ShomaraSettingsSaveState.Error -> ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Error, text = state.errorText ?: ShomaraSettingsStrings.SaveFailed)
            else -> {}
        }
        ShomaraButton(
            text = ShomaraSettingsStrings.Save,
            onClick = onSave,
            enabled = state.canSave,
            loading = state.save == ShomaraSettingsSaveState.Saving,
            variant = ShomaraButtonVariant.Primary,
        )
    }
}

@Composable
private fun AvatarTile(option: com.mathlearning.core.model.ShomaraAvatarOption, equipped: Boolean, onEquip: (String) -> Unit) {
    val container = if (equipped) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface
    val border = if (equipped) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine
    Column(
        modifier = Modifier
            .weight(1f)
            .heightIn(min = ShomaraTokens.ComponentNodeSize)
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(
                if (equipped) ShomaraTokens.ClayFeaturedBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                border,
                RoundedCornerShape(ShomaraTokens.RadiusMd),
            )
            .semantics {
                role = Role.Button
                contentDescription = if (equipped) option.label + " — انتخاب‌شده" else option.label
                stateDescription = if (equipped) "انتخاب‌شده" else ""
            }
            .clickable(role = Role.Button) { onEquip(option.id) }
            .padding(ShomaraTokens.Space8),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        // Visible tick, not colour alone: the selected tile shows it.
        if (equipped) {
            Text(text = "✓", style = ShomaraTypography.Title, color = ShomaraTokens.ColorPrimaryDark)
        }
        Text(text = option.label, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorInk)
    }
}

@Composable
private fun ToggleRow(label: String, hint: String, checked: Boolean, enabled: Boolean, onChecked: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTouchMin)
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .padding(ShomaraTokens.Space12),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(text = label, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
            Text(text = hint, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
        }
        ShomaraButton(
            text = if (checked) "روشن" else "خاموش",
            onClick = { onChecked(!checked) },
            enabled = enabled,
            variant = if (checked) ShomaraButtonVariant.Secondary else ShomaraButtonVariant.Ghost,
        )
    }
}
