package com.mathlearning.feature.onboarding

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTypography

/**
 * Page 02-profile — the profile step, reproduced from the owner's sample
 * image (878x1792) and the 16 owner-delivered SVGs + the mascot WebP
 * (complete-ui-assets.zip, 2026-11-06).
 *
 * Structure, top to bottom: full-bleed hero (clouds, back hills, leaves,
 * rays, the mascot WebP peeking over the front curve) → title → name field
 * with a user icon → grade section title → 2-column grade grid (all six
 * grades selectable, G1 selected by default) → «ادامه» CTA on the bottom
 * hills. The progress bar is host-owned and keeps the real step value
 * (ProfileSetup = 0.5); the sample's ~0.75 bar is the placement step's
 * value, not this screen's.
 *
 * Owner decisions recorded here (2026-11-06): grades 2-6 have NO lock
 * (overrides the catalog's content-driven availability rule — content for
 * G2-G6 does not exist yet, Phase 3; the stored gradeId drives nothing
 * downstream today, see the implementation note); the avatar picker is
 * removed (the mockup has none); the body subtitle sentence is removed.
 * The save behaviour is unchanged: the CTA saves the draft through the
 * existing saveProfile/canSubmit logic and the «ذخیره شد» banner still
 * appears on the placement step.
 */

/**
 * Pure layout geometry for the profile screen, measured from the owner's
 * sample (878x1792). All values are fractions of the hero/bottom-layer
 * width or height, so the layout scales to any width; JVM-testable.
 */
internal object ShomaraProfileLayout {
    /** Hero height as a fraction of screen height (sample: hero ends ~0.28). */
    const val HeroHeightFraction: Float = 0.387f

    /** Hero width/height (878 / 502). */
    const val HeroAspectRatio: Float = 1.27f

    /** Mascot: x, y (of hero height), width (of hero width), image aspect. */
    const val MascotXFraction: Float = 0.11f
    // Owner: raise the mascot a touch so the hands clearly drape over the
    // hill edge (mockup: the bow nearly touches the progress bar).
    const val MascotYFraction: Float = -0.03f
    const val MascotWidthFraction: Float = 0.78f
    const val MascotAspectRatio: Float = 1.5f // 1536x1024

    /** Clouds (x, y of hero height, width of hero width). */
    const val CloudTopLeftX: Float = 0.03f
    const val CloudTopLeftY: Float = 0.02f
    const val CloudTopLeftWidth: Float = 0.25f
    const val CloudTopRightX: Float = 0.72f
    const val CloudTopRightY: Float = 0.04f
    const val CloudTopRightWidth: Float = 0.22f
    const val CloudBottomLeftX: Float = 0.0f
    const val CloudBottomLeftY: Float = 0.58f
    const val CloudBottomLeftWidth: Float = 0.26f
    const val CloudBottomRightX: Float = 0.76f
    const val CloudBottomRightY: Float = 0.55f
    const val CloudBottomRightWidth: Float = 0.22f

    /** Yellow rays: right of the mascot's head in the free space. Offsets
     * are RTL-mirrored (measured from the start/right edge), so 0.27 lands
     * the 0.10-wide box at 0.63-0.73 of the width from the left, matching
     * the owner mockup. */
    const val RaysX: Float = 0.27f
    const val RaysY: Float = 0.05f
    const val RaysWidth: Float = 0.10f

    /** Back hills: full-width bands at the hero bottom, behind the mascot. */
    const val HeroHillWidth: Float = 0.365f

    /** Top leaves at the hero's left/right edges. */
    const val LeavesTopLeftX: Float = 0.0f
    const val LeavesTopLeftY: Float = 0.42f
    const val LeavesTopLeftWidth: Float = 0.20f
    const val LeavesTopRightX: Float = 0.80f
    const val LeavesTopRightY: Float = 0.38f
    const val LeavesTopRightWidth: Float = 0.20f

    /** Bottom background layer height, as a fraction of screen width. */
    const val BottomBackgroundHeightFraction: Float = 0.36f

    /** Bottom clouds, above the bottom hills. */
    const val BottomCloudLeftX: Float = 0.02f
    const val BottomCloudLeftY: Float = 0.02f
    const val BottomCloudLeftWidth: Float = 0.26f
    const val BottomCloudRightX: Float = 0.74f
    const val BottomCloudRightY: Float = 0.05f
    const val BottomCloudRightWidth: Float = 0.22f

    /** Bottom leaves flanking the CTA. */
    const val LeavesBottomLeftWidth: Float = 0.19f
    const val LeavesBottomRightX: Float = 0.81f
    const val LeavesBottomRightWidth: Float = 0.19f

    /** CTA width, as a fraction of the full screen width (sample 0.116-0.888). */
    const val CtaWidthFraction: Float = 0.772f

    /** Rays stroke: 13 viewBox units in a 90-wide viewBox. */
    const val RaysStrokeWidthFraction: Float = 13f / 90f

    /** Front-curve stroke: 5 viewBox units in an 878-wide viewBox. */
    const val FrontCurveStrokeWidthFraction: Float = 5f / 878f
}


@Composable
fun ShomaraProfileScreen(
    draft: ShomaraProfileDraft,
    onDraftChange: (ShomaraProfileDraft) -> Unit,
    saveState: ShomaraProfileSaveState,
    onSave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Grade the draft against the stored name only (the same validation the
    // previous screen used); the grade is always valid now — every grade is
    // selectable, so there is no locked state to show.
    val nameError = ShomaraProfileDraft.nameValidationError(draft.name)
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorCanvas),
    ) {
        // Bottom background layer: bottom hills + bottom clouds + bottom
        // leaves, behind the content and the CTA.
        ShomaraProfileBottomBackground(
            modifier = Modifier.align(Alignment.BottomCenter),
        )
        Column(
            modifier = Modifier.fillMaxSize(),
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            ) {
                // Full-bleed hero: no horizontal padding here (the children
                // below carry it); the sample's hero spans the whole width.
                ShomaraProfileHero()
                ShomaraProfileNameField(
                    value = draft.name,
                    onValueChange = { onDraftChange(draft.copy(name = it)) },
                    errorText = if (saveState.attempt > 0) nameError else null,
                    modifier = Modifier.padding(horizontal = ShomaraTokens.Space24),
                )
                ShomaraProfileGradeGrid(
                    draft = draft,
                    onDraftChange = onDraftChange,
                    modifier = Modifier.padding(horizontal = ShomaraTokens.Space24),
                )
            }
            // Bottom zone: the save banners (same as before, same position)
            // then the «ادامه» CTA, 0.772 of the full width, centred.
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = ShomaraTokens.Space24),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
            ) {
                if (saveState.failureMessage != null) {
                    ShomaraFeedbackBanner(
                        kind = ShomaraFeedbackKind.Retry,
                        text = saveState.failureMessage,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = ShomaraTokens.Space24),
                    )
                }
                if (saveState.saved) {
                    ShomaraFeedbackBanner(
                        kind = ShomaraFeedbackKind.Correct,
                        text = saveState.announcement(),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = ShomaraTokens.Space24),
                    )
                }
                ShomaraProfileCta(
                    onSave = onSave,
                    enabled = saveState.canSubmit,
                    loading = saveState.inFlight,
                    modifier = Modifier.fillMaxWidth(ShomaraProfileLayout.CtaWidthFraction),
                )
            }
        }
    }
}


/**
 * The name field. The design system now owns an icon slot (`ShomaraTextField(leading = …)`), so the
 * page-local copy of this field is deleted: it carried its own label, surface, padding, editing-state
 * sync and error row just to place one glyph, and that copy had drifted — its interactive area
 * measured 40dp inside a 56dp surface (caught by the cross-screen a11y sweep).
 *
 * Deviation from the sample, recorded: the sample shows no visible label; the guide (and the repo's
 * field contract) requires a real label, so «نام کودک» renders above the field as a Caption, as on
 * every other page.
 */
@Composable
private fun ShomaraProfileNameField(
    value: String,
    onValueChange: (String) -> Unit,
    errorText: String?,
    modifier: Modifier = Modifier,
) {
    // Typed explicitly: a nullable composable lambda argument cannot be inferred composable from a
    // bare trailing lambda, so the reference is declared first.
    val userIcon: (@Composable () -> Unit)? = {
        // The owner SVG's user icon at the field's layout-start (visual right in RTL).
        Canvas(modifier = Modifier.size(ShomaraTokens.Space24).clearAndSetSemantics {}) {
            drawPath(
                path = ShomaraProfileShapes.iconUserPath(size.width, size.height),
                color = ShomaraTokens.ColorMuted,
            )
        }
    }
    ShomaraTextField(
        value = value,
        onValueChange = onValueChange,
        label = ShomaraProfileStrings.NameLabel,
        hint = ShomaraProfileStrings.NameHint,
        errorText = errorText,
        modifier = modifier,
        leading = userIcon,
    )
}


/**
 * The page-02 CTA: the same pill and drawn arrow as pages 01/03, plus loading and the page-local
 * disabled colour the owner asked for. Shape, arrow slot and disabled override are
 * [ShomaraButton] parameters now, so the page owns no button machinery of its own.
 *
 * OPEN QUESTION (owner): the arrow points right while RTL forward is usually left.
 * Reproduced exactly as the sample shows, as on page 01.
 */
@Composable
private fun ShomaraProfileCta(
    onSave: () -> Unit,
    enabled: Boolean,
    loading: Boolean,
    modifier: Modifier = Modifier,
    // F-33: under reduced motion the loading spinner renders as a static dot.
    reducedMotion: Boolean = LocalShomaraReducedMotion.current,
) {
    OnboardingCta(
        text = ShomaraProfileStrings.Continue,
        onClick = onSave,
        modifier = modifier,
        enabled = enabled,
        loading = loading,
        darkWhenDisabled = true,
        reducedMotion = reducedMotion,
        arrow = { content -> OnboardingArrow(content) },
    )
}

@Composable
fun ShomaraPlacementScreen(
    state: ShomaraPlacementState,
    // #88: null means no skip affordance at all — the button is not rendered, not merely
    // disabled. The host passes a real callback only when the product/DEBUG flag allows it.
    onSkip: (() -> Unit)?,
    // DT-38: modifier moved ahead of the other optional parameters (Compose convention, enforced by
    // lint). Every call site passes named arguments, so no caller changed.
    modifier: Modifier = Modifier,
    // Owner bug fix: the skipped state used to hardcode «پایه اول ابتدایی» — a child
    // who picked G3 read G1. The host passes the draft's actual grade label.
    chosenGradeLabel: String? = null,
    // #100: the save confirmation carried from the profile step — the profile step advances
    // immediately on a successful save, so this is where the «ذخیره شد» banner is seen.
    // Null when the user did not just save (no banner is invented).
    savedAnnouncement: String? = null,
    // DT-75: the primary CTA once a placement decision exists. The screen without it is the
    // old dead end — a decision was rendered with no way to act on it.
    onStart: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(ShomaraTokens.Space24),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // #100: the carried save confirmation — visible at the top of the step the user
            // lands on after saving, with the banner's live region announcing it once.
            if (savedAnnouncement != null) {
                ShomaraFeedbackBanner(kind = ShomaraFeedbackKind.Correct, text = savedAnnouncement)
            }
            // Family 05 (Stage 1): no character here by contract.
            // Batch 2: the placement title is a TalkBack heading.
            Text(text = ShomaraProfileStrings.PlacementTitle, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            ShomaraCard {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    // F-29: the placement status is plain text, not a Recovery banner inside a
                    // card — a banner implies an action or a problem, and placement has neither
                    // yet. The server decision (when it exists) is the main line; the pending
                    // note is a caption.
                    when {
                        state.serverDecision != null -> Text(
                            text = state.serverDecision,
                            style = ShomaraTypography.Body,
                            color = ShomaraTokens.ColorInk,
                            textAlign = TextAlign.Center,
                            // A11y gap (a): when a server decision ever lands, TalkBack
                            // announces the card's change instead of staying silent.
                            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                        )
                        state.isSkipped -> Text(
                            text = chosenGradeLabel ?: ShomaraProfileStrings.GradeOne,
                            style = ShomaraTypography.Body,
                            color = ShomaraTokens.ColorInk,
                            textAlign = TextAlign.Center,
                        )
                        else -> Text(text = ShomaraProfileStrings.PlacementPending, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted, textAlign = TextAlign.Center)
                    }
                }
            }
        }
        // DT-75: with a decision the screen has exactly one primary CTA — «شروع مسیر».
        // The skip stays a ghost affordance below it (DEBUG only), never a second primary.
        if (state.hasDecision && onStart != null) {
            ShomaraButton(
                text = ShomaraProfileStrings.PlacementStart,
                onClick = onStart,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        // #88: the skip button renders only when a skip callback is supplied (product/DEBUG
        // flag). In release there is no button at all — never a disabled or dead skip.
        if (onSkip != null) {
            ShomaraButton(
                text = ShomaraProfileStrings.PlacementSkip,
                onClick = onSkip,
                variant = ShomaraButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
