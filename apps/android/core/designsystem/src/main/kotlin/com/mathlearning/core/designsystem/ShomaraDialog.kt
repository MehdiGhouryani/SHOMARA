package com.mathlearning.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics

/**
 * Dialog/Sheet state matrix: open/busy/error/dismiss-blocked (COMPONENT_READINESS). Pure logic —
 * dismiss is allowed only when the dialog is dismissible AND not busy; an error keeps the dialog
 * open and announces the error text. State restoration uses the data class directly with
 * rememberSaveable at call sites (plain Kotlin data class, Saver-compatible).
 */
data class ShomaraDialogState(
    val busy: Boolean = false,
    val errorText: String? = null,
    val dismissible: Boolean = true,
)

object ShomaraDialogLogic {
    fun canDismiss(state: ShomaraDialogState): Boolean = state.dismissible && !state.busy

    /** Non-null reason means the dialog is dismiss-blocked and must announce why. */
    fun dismissBlockReason(state: ShomaraDialogState): String? = when {
        state.busy -> "در حال پردازش؛ لطفاً صبر کنید"
        !state.dismissible -> "این پنجره در این مرحله بسته نمی‌شود"
        else -> null
    }

    fun confirmEnabled(state: ShomaraDialogState): Boolean = !state.busy

    /** Error never auto-dismisses; it is announced and the dialog stays open. */
    fun errorKeepsOpen(state: ShomaraDialogState): Boolean = state.errorText != null

    val ErrorAnnouncement: String = "خطا"
}

@Composable
fun ShomaraDialog(
    title: String,
    body: String,
    confirmLabel: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    state: ShomaraDialogState,
    modifier: Modifier = Modifier,
    dismissLabel: String = "بستن",
    tapGuard: ShomaraTapGuard = rememberShomaraTapGuard(),
) {
    var open by remember { mutableStateOf(true) }
    if (!open) return
    val reason = ShomaraDialogLogic.dismissBlockReason(state)
    AlertDialog(
        modifier = modifier,
        onDismissRequest = {
            // Back/system dismiss honors the same fail-closed policy as the close button.
            if (ShomaraDialogLogic.canDismiss(state)) {
                open = false
                onDismiss()
            }
        },
        title = { Text(text = title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() }) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
                Text(text = body, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk2)
                if (state.errorText != null) {
                    Text(
                        text = state.errorText,
                        style = ShomaraTypography.Caption,
                        color = ShomaraTokens.ColorDanger,
                        modifier = Modifier.semantics {
                            liveRegion = LiveRegionMode.Polite
                        },
                    )
                }
                if (reason != null) {
                    Text(
                        text = reason,
                        style = ShomaraTypography.Caption,
                        color = ShomaraTokens.ColorMuted,
                        modifier = Modifier.semantics {
                            liveRegion = LiveRegionMode.Polite
                        },
                    )
                }
            }
        },
        confirmButton = {
            ShomaraButton(
                text = confirmLabel,
                onClick = {
                    if (ShomaraDialogLogic.confirmEnabled(state) && tapGuard.begin()) {
                        try { onConfirm() } finally { tapGuard.end() }
                    }
                },
                enabled = ShomaraDialogLogic.confirmEnabled(state),
                variant = ShomaraButtonVariant.Primary,
            )
        },
        dismissButton = if (ShomaraDialogLogic.canDismiss(state)) {
            {
                ShomaraButton(
                    text = dismissLabel,
                    onClick = { open = false; onDismiss() },
                    variant = ShomaraButtonVariant.Ghost,
                )
            }
        } else null,
        containerColor = ShomaraTokens.ColorSurface,
        shape = androidx.compose.foundation.shape.RoundedCornerShape(ShomaraTokens.RadiusLg),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShomaraBottomSheet(
    title: String,
    onDismiss: () -> Unit,
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    state: ShomaraDialogState = ShomaraDialogState(),
) {
    // Sheet honors the identical dismiss policy as the dialog (contract parity).
    ModalBottomSheet(
        onDismissRequest = { if (ShomaraDialogLogic.canDismiss(state)) onDismiss() },
        modifier = modifier,
        containerColor = ShomaraTokens.ColorSurface,
        shape = androidx.compose.foundation.shape.RoundedCornerShape(topStart = ShomaraTokens.RadiusLg, topEnd = ShomaraTokens.RadiusLg),
        dragHandle = if (ShomaraDialogLogic.canDismiss(state)) null else ({}) // drag handle only while dismissible
    ) {
        Column(modifier = Modifier.padding(ShomaraTokens.Space16), verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            }
            content()
        }
    }
}
