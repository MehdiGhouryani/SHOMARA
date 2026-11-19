package com.mathlearning.feature.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * Settings surface (family 15): the real reduced-motion preference and its save state.
 *
 * ADR-0051 (owner decision, 2026-11-19): the child avatar preset grid was removed. The
 * dirty/saving/saved/error machine and the "no fake success, no fake toggle" contract are unchanged;
 * with no avatar to select, the motion toggle is the only editable preference.
 */
enum class ShomaraSettingsSaveState { Clean, Dirty, Saving, Saved, Error }

data class ShomaraSettingsState(
    val reducedMotion: Boolean,
    val save: ShomaraSettingsSaveState = ShomaraSettingsSaveState.Clean,
    val errorText: String? = null,
) {
    val canSave: Boolean
        get() = save == ShomaraSettingsSaveState.Dirty

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

    /**
     * BUG 3 (found on device 2026-11-05) — re-seed rule for the host wiring. The host seeds
     * this screen from the settings store, but `collectAsStateWithLifecycle` delivers the
     * `Defaults` placeholder synchronously at first composition and the real stored value only
     * later. A seed-once flag therefore consumed the placeholder and the later real emission
     * was ignored, so re-entering Settings showed the default although the store held the
     * child's saved choice and the save banner had said "ذخیره شد.". The rule is: re-seed from
     * the store on every emission WHILE THE SCREEN IS STILL UNTOUCHED (Clean) — the user has
     * made no edit yet, so the store is the only truth. Once the user edits (Dirty / Saving /
     * Saved / Error) the screen state is authoritative and a later emission — including the
     * echo of our own save — must never overwrite the in-flight edit.
     */
    fun reseededFrom(reducedMotion: Boolean): ShomaraSettingsState =
        if (save == ShomaraSettingsSaveState.Clean) {
            ShomaraSettingsState(reducedMotion = reducedMotion)
        } else {
            this
        }
}

object ShomaraSettingsStrings {
    // ADR-0051: the avatar preset is gone, so the title no longer names avatars.
    const val Title: String = "تنظیمات"
    /** Heading of the preference rows. It must not repeat [Title], or TalkBack reads it twice. */
    const val PreferencesSection: String = "تنظیم‌های برنامه"
    const val ReducedMotionLabel: String = "حرکت کمتر"
    // R-11 (F-36): this hint OVERCLAIMS — it says all animations stop, but the reduced-motion
    // flag only gates the spinners (button/audio/text-field), the indeterminate progress bar
    // and the splash. The one motion it does NOT gate is the ModalBottomSheet enter/exit
    // slide (platform animation inside Material3, in ShomaraBottomSheet) — so the station
    // sheet still slides in with reduced motion on. Rewording this user-facing string needs
    // the owner's approval (it is UI text, and no new user-facing text is invented here),
    // so the string stays verbatim and the overclaim is recorded here and in the
    // application note instead of being silently kept as fact.
    const val ReducedMotionHint: String = "انیمیشن‌ها متوقف می‌شوند."
    const val Save: String = "ذخیره"
    const val SavedMessage: String = "ذخیره شد."
    const val SaveFailed: String = "ذخیره نشد؛ دوباره تلاش کن."
    const val ToggleOn: String = "روشن"
    const val ToggleOff: String = "خاموش"
}

@Composable
fun ShomaraSettingsScreen(
    state: ShomaraSettingsState,
    onReducedMotionChange: (Boolean) -> Unit,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Stage 4, family 15, parent/settings dial 2/2/5: calm and textual.
    // The inset stays 16dp — the v2 adaptive inset for this page (a token, not a magic
    // number). The column scrolls, so at 200% font the toggles and the save button can
    // never clip on a small screen.
    Column(modifier = modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16)) {
        Text(text = ShomaraSettingsStrings.Title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
        Text(text = ShomaraSettingsStrings.PreferencesSection, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
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
            // Batch 2 (Duolingo structure): the primary save action is
            // full-width like every other primary CTA in the app, not a
            // narrow wrap-content button in a scrolling column.
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun ToggleRow(label: String, hint: String, checked: Boolean, enabled: Boolean, onChecked: (Boolean) -> Unit) {
    // F-15: the whole row is the switch — a `toggleable` with Role.Switch — so TalkBack
    // announces «حرکت کمتر، سوئیچ، روشن/خاموش» once, and the full row is the tap target.
    // The old inner button made TalkBack read two controls for one setting.
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = ShomaraTokens.ComponentTouchMin)
            // Batch 2 (ADR-0040 R1): the toggle row is a tactile surface
            // (it holds the on/off control), so it renders Soft clay depth.
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .border(ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusMd))
            .toggleable(value = checked, enabled = enabled, role = Role.Switch, onValueChange = onChecked)
            // R-03 (F-15): one TalkBack stop per row — the label and hint texts merge
            // into the row's node, like MeRow/PracticeRow, instead of separate stops
            // that read the label twice.
            .semantics(mergeDescendants = true) {
                contentDescription = label
                stateDescription = if (checked) ShomaraSettingsStrings.ToggleOn else ShomaraSettingsStrings.ToggleOff
            }
            .padding(ShomaraTokens.Space12),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(text = label, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk)
            Text(text = hint, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted)
        }
        // Status indicator only, not a button: the row owns the toggle. It is invisible
        // to TalkBack (cleared semantics) so the state is announced exactly once, by the row.
        Text(
            text = if (checked) ShomaraSettingsStrings.ToggleOn else ShomaraSettingsStrings.ToggleOff,
            style = ShomaraTypography.Body,
            color = if (checked) ShomaraTokens.ColorPrimaryDark else ShomaraTokens.ColorInk2,
            modifier = Modifier.clearAndSetSemantics {},
        )
    }
}
