package com.mathlearning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign

/**
 * Family 16 shared entry / shell state surface (Stage 1).
 *
 * One surface for loading, offline, error, and empty states, so no screen
 * invents its own raw developer error page or endless spinner:
 * - Loading renders a static page placeholder (fixed bars, no animation),
 *   so it is safe under reduced motion by construction.
 * - Offline / Error / Empty render one title, one body, one primary
 *   retry action, and at most one secondary escape action.
 * - A character is optional, small, and static when present; the caller
 *   decides, and family contracts that forbid a character pass null.
 * - No state is decided here: the caller owns the kind, the copy, and
 *   whether retry is real. This component only renders state.
 */
enum class ShomaraEntryState { Loading, Offline, Error, Empty }

object ShomaraEntryStateLogic {
    fun isLoading(state: ShomaraEntryState): Boolean = state == ShomaraEntryState.Loading

    fun showRetry(state: ShomaraEntryState, onRetry: (() -> Unit)?): Boolean =
        !isLoading(state) && onRetry != null

    fun announcementFor(state: ShomaraEntryState): String = when (state) {
        ShomaraEntryState.Loading -> "در حال آماده‌سازی"
        ShomaraEntryState.Offline -> "آفلاین"
        ShomaraEntryState.Error -> "خطا"
        ShomaraEntryState.Empty -> "خالی"
    }
}

@Composable
fun ShomaraStateSurface(
    state: ShomaraEntryState,
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    character: ShomaraCharacter? = null,
    poseId: Int = 1,
    characterSlot: ShomaraCharacterSlot = ShomaraCharacterSlot.Lesson,
    retryLabel: String? = null,
    onRetry: (() -> Unit)? = null,
    retrying: Boolean = false,
    secondaryLabel: String? = null,
    onSecondary: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorCanvas)
            .statusBarsPadding()
            .navigationBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(ShomaraTokens.Space24),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        if (character != null) {
            ShomaraCharacterImage(
                character = character,
                poseId = poseId,
                slot = characterSlot,
                decorative = true,
            )
        }
        Text(
            text = title,
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            text = body,
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk2,
            textAlign = TextAlign.Center,
        )
        if (ShomaraEntryStateLogic.isLoading(state)) {
            ShomaraPagePlaceholder()
        }
        if (ShomaraEntryStateLogic.showRetry(state, onRetry) && retryLabel != null) {
            ShomaraButton(
                text = retryLabel,
                onClick = { onRetry?.invoke() },
                enabled = !retrying,
                loading = retrying,
                variant = ShomaraButtonVariant.Primary,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (secondaryLabel != null && onSecondary != null) {
            ShomaraButton(
                text = secondaryLabel,
                onClick = onSecondary,
                variant = ShomaraButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

/**
 * Static page placeholder: the shape of a page, not a spinner.
 * Fixed bars only, no animation, so reduced motion is honoured
 * without a special case.
 */
@Composable
fun ShomaraPagePlaceholder(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.7f)
                .height(ShomaraTokens.Space16)
                .background(ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusSm)),
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(ShomaraTokens.Space16)
                .background(ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusSm)),
        )
        Box(
            modifier = Modifier
                .fillMaxWidth(0.5f)
                .height(ShomaraTokens.Space16)
                .background(ShomaraTokens.ColorLine, RoundedCornerShape(ShomaraTokens.RadiusSm)),
        )
    }
}
