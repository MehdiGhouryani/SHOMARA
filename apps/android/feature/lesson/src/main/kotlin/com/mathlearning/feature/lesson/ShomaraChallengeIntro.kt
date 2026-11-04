package com.mathlearning.feature.lesson

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraDigits
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * Family 13 challenge intro — the first Native equivalent of the Expo
 * `ChallengeIntroView2` (which has no Native composable yet).
 *
 * Display only, and only meaningful in the Intro state: the caller shows
 * this when `session.state == ShomaraChallengeState.Intro` and calls
 * `session.startRound(...)` from [onStart]. The question takes visual
 * priority, so there is no character, no reward artwork, no score, and
 * no timer here — the round timer belongs to the Round state only, and
 * [ShomaraChallengeSession.timerVisible] already hides it under
 * reduced motion. A challenge result never changes station mastery
 * ([ShomaraChallengeSession.affectsStationMastery] is false), and this
 * intro changes nothing about that.
 */
@Composable
fun ShomaraChallengeIntro(
    session: ShomaraChallengeSession,
    onStart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (session.state != ShomaraChallengeState.Intro) return
    Column(
        modifier = modifier.fillMaxWidth().padding(ShomaraTokens.Space24),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Text(
            text = "چالش",
            style = ShomaraTypography.Title,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            text = "تعداد دورها: ${ShomaraDigits.toFa(session.totalRounds)}",
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk2,
            textAlign = TextAlign.Center,
        )
        Text(
            text = "آماده‌ای؟ سؤال اول را با هم شروع می‌کنیم.",
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk2,
            textAlign = TextAlign.Center,
        )
        ShomaraButton(
            text = "شروع چالش",
            onClick = onStart,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
