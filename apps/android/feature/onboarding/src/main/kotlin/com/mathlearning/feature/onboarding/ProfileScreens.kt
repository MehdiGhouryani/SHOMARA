package com.mathlearning.feature.onboarding

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonLogic
import com.mathlearning.core.designsystem.ShomaraButtonState
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraCardLogic
import com.mathlearning.core.designsystem.ShomaraCardState
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraClayDepth
import com.mathlearning.core.designsystem.ShomaraFeedbackBanner
import com.mathlearning.core.designsystem.ShomaraFeedbackKind
import com.mathlearning.core.designsystem.ShomaraFieldLogic
import com.mathlearning.core.designsystem.ShomaraFieldState
import com.mathlearning.core.designsystem.ShomaraProfileDrawables
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.rememberShomaraTapGuard
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.model.ShomaraGradeCatalog
import com.mathlearning.core.model.ShomaraGradeOption

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
    const val HeroHeightFraction: Float = 0.28f

    /** Hero width/height (878 / 502). */
    const val HeroAspectRatio: Float = 1.749f

    /** Mascot: x, y (of hero height), width (of hero width), image aspect. */
    const val MascotXFraction: Float = 0.267f
    const val MascotYFraction: Float = 0.275f
    const val MascotWidthFraction: Float = 0.485f
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

    /** Yellow rays, upper right of the mascot. */
    const val RaysX: Float = 0.66f
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

/**
 * Leaf greens. The owner SVGs use three fresh light-green shades per leaf
 * cluster (#C1E9A5 / #A1DB8A / #81CD79 and neighbours); the v2 tokens have
 * no mid-green, so the two darker shades are tints of the primary token
 * over the cream canvas. The device screenshot must confirm they read like
 * the mockup; if they read grey, a mid-green token is a later ADR, not a
 * silent hex. The SVG opacity (.7-.8 on the darkest layer) is folded into
 * the tint.
 */
private val LeafLight: Color = ShomaraTokens.ColorPrimarySoft
private val LeafMid: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.35f)
private val LeafDark: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.45f)

/** Bottom-hill bands: one pale green, stepped alphas so the five SVG bands
 * stay distinct (the SVG's .78 opacity on the front band is folded in). */
private val HillBand1: Color = ShomaraTokens.ColorPrimarySoft
private val HillBand2: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.85f)
private val HillBand3: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.7f)
private val HillBand4: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.9f)
private val HillBand5: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.75f)

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
                verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
            ) {
                // Full-bleed hero: no horizontal padding here (the children
                // below carry it); the sample's hero spans the whole width.
                ShomaraProfileHero()
                Text(
                    text = ShomaraProfileStrings.ProfileTitle,
                    style = ShomaraTypography.Title,
                    color = ShomaraTokens.ColorInk,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .padding(horizontal = ShomaraTokens.Space24)
                        .semantics { heading() },
                )
                ShomaraProfileNameField(
                    value = draft.name,
                    onValueChange = { onDraftChange(draft.copy(name = it)) },
                    errorText = nameError,
                    modifier = Modifier.padding(horizontal = ShomaraTokens.Space24),
                )
                Text(
                    text = ShomaraProfileStrings.GradeSectionTitle,
                    style = ShomaraTypography.Title,
                    color = ShomaraTokens.ColorInk,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .padding(horizontal = ShomaraTokens.Space24)
                        .semantics { heading() },
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
 * The hero: clouds + back hills + leaves + rays + the mascot WebP peeking
 * over the front curve, layered in that order (the front curve is drawn
 * last, so it covers the mascot's lower body). All art is decorative.
 */
@Composable
private fun ShomaraProfileHero(modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        val heroWidth = maxWidth
        val heroHeight = heroWidth / ShomaraProfileLayout.HeroAspectRatio
        Box(
            modifier = Modifier
                .size(width = heroWidth, height = heroHeight)
                .clearAndSetSemantics {},
        ) {
            // Clouds first (bottom of the stack).
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudTopLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudTopLeftX,
                        y = heroHeight * ShomaraProfileLayout.CloudTopLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudTopLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudTopLeftWidth * (130f / 220f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudTopRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudTopRightX,
                        y = heroHeight * ShomaraProfileLayout.CloudTopRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudTopRightWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudTopRightWidth * (115f / 190f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudBottomLeftX,
                        y = heroHeight * ShomaraProfileLayout.CloudBottomLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudBottomLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudBottomLeftWidth * (145f / 225f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudBottomRightX,
                        y = heroHeight * ShomaraProfileLayout.CloudBottomRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudBottomRightWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudBottomRightWidth * (115f / 190f),
                    ),
            )
            // Back hills, bottom-anchored, behind the mascot.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .size(
                        width = heroWidth * ShomaraProfileLayout.HeroHillWidth,
                        height = heroWidth * ShomaraProfileLayout.HeroHillWidth * (180f / 320f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(
                        width = heroWidth * ShomaraProfileLayout.HeroHillWidth,
                        height = heroWidth * ShomaraProfileLayout.HeroHillWidth * (150f / 320f),
                    ),
            )
            // Top leaves, at the hero's left/right edges.
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.LeavesTopLeftX,
                        y = heroHeight * ShomaraProfileLayout.LeavesTopLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.LeavesTopLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.LeavesTopLeftWidth * (150f / 180f),
                    ),
                first = ShomaraProfileShapes::leavesTopLeft1Path,
                second = ShomaraProfileShapes::leavesTopLeft2Path,
                third = ShomaraProfileShapes::leavesTopLeft3Path,
            )
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.LeavesTopRightX,
                        y = heroHeight * ShomaraProfileLayout.LeavesTopRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.LeavesTopRightWidth,
                        height = heroWidth * ShomaraProfileLayout.LeavesTopRightWidth * (175f / 175f),
                    ),
                first = ShomaraProfileShapes::leavesTopRight1Path,
                second = ShomaraProfileShapes::leavesTopRight2Path,
                third = ShomaraProfileShapes::leavesTopRight3Path,
            )
            // Yellow rays, upper right of the mascot.
            Canvas(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.RaysX,
                        y = heroHeight * ShomaraProfileLayout.RaysY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.RaysWidth,
                        height = heroWidth * ShomaraProfileLayout.RaysWidth * (115f / 90f),
                    ),
            ) {
                drawPath(
                    path = ShomaraProfileShapes.raysPath(size.width, size.height),
                    color = ShomaraTokens.ColorAmber,
                    style = Stroke(
                        width = size.width * ShomaraProfileLayout.RaysStrokeWidthFraction,
                        cap = StrokeCap.Round,
                    ),
                )
            }
            // The mascot (owner WebP, with bow, as-is). ContentScale.Fit on
            // the exact 1.5 aspect box, so no crop and no distortion.
            Image(
                painter = painterResource(ShomaraProfileDrawables.MascotWithBow),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.MascotXFraction,
                        y = heroHeight * ShomaraProfileLayout.MascotYFraction,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.MascotWidthFraction,
                        height = heroWidth * ShomaraProfileLayout.MascotWidthFraction / ShomaraProfileLayout.MascotAspectRatio,
                    ),
            )
            // Front curve last: it covers the mascot's lower body, so the
            // mascot reads as peeking over the hill.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroFrontCurve1Path,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * (180f / 878f)),
            )
            Canvas(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * (180f / 878f)),
            ) {
                drawPath(
                    path = ShomaraProfileShapes.heroFrontCurve2Path(size.width, size.height),
                    color = ShomaraTokens.ColorAmberSoft,
                    style = Stroke(
                        width = size.width * ShomaraProfileLayout.FrontCurveStrokeWidthFraction,
                        cap = StrokeCap.Round,
                    ),
                )
            }
        }
    }
}

/**
 * Draws one generated path, built for the Canvas's drawn size. The path
 * builder is a function reference (e.g. ShomaraProfileShapes::cloudTopLeftPath)
 * because the pixel size is only known inside the draw scope.
 */
@Composable
private fun ShomaraProfileShapeCanvas(
    buildPath: (width: Float, height: Float) -> Path,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier) {
        drawPath(path = buildPath(size.width, size.height), color = color)
    }
}

/** A three-layer leaf cluster, drawn back to front (light, mid, dark). */
@Composable
private fun ShomaraProfileLeaves(
    first: (width: Float, height: Float) -> Path,
    second: (width: Float, height: Float) -> Path,
    third: (width: Float, height: Float) -> Path,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier) {
        drawPath(path = first(size.width, size.height), color = LeafLight)
        drawPath(path = second(size.width, size.height), color = LeafMid)
        drawPath(path = third(size.width, size.height), color = LeafDark)
    }
}

/**
 * The bottom background layer: bottom clouds, the five-band bottom hills,
 * and the bottom leaves flanking the CTA. Decorative; drawn behind the
 * content and the CTA.
 */
@Composable
private fun ShomaraProfileBottomBackground(modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        val layerWidth = maxWidth
        val layerHeight = layerWidth * ShomaraProfileLayout.BottomBackgroundHeightFraction
        Box(
            modifier = Modifier
                .size(width = layerWidth, height = layerHeight)
                .clearAndSetSemantics {},
        ) {
            // Bottom clouds, above the hills.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = layerWidth * ShomaraProfileLayout.BottomCloudLeftX,
                        y = layerHeight * ShomaraProfileLayout.BottomCloudLeftY,
                    )
                    .size(
                        width = layerWidth * ShomaraProfileLayout.BottomCloudLeftWidth,
                        height = layerWidth * ShomaraProfileLayout.BottomCloudLeftWidth * (145f / 225f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = layerWidth * ShomaraProfileLayout.BottomCloudRightX,
                        y = layerHeight * ShomaraProfileLayout.BottomCloudRightY,
                    )
                    .size(
                        width = layerWidth * ShomaraProfileLayout.BottomCloudRightWidth,
                        height = layerWidth * ShomaraProfileLayout.BottomCloudRightWidth * (115f / 190f),
                    ),
            )
            // Bottom hills: all five bands share one viewBox, so one Canvas.
            Canvas(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = layerWidth, height = layerWidth * (195f / 878f)),
            ) {
                drawPath(path = ShomaraProfileShapes.bottomHills1Path(size.width, size.height), color = HillBand1)
                drawPath(path = ShomaraProfileShapes.bottomHills2Path(size.width, size.height), color = HillBand2)
                drawPath(path = ShomaraProfileShapes.bottomHills3Path(size.width, size.height), color = HillBand3)
                drawPath(path = ShomaraProfileShapes.bottomHills4Path(size.width, size.height), color = HillBand4)
                drawPath(path = ShomaraProfileShapes.bottomHills5Path(size.width, size.height), color = HillBand5)
            }
            // Bottom leaves, flanking the CTA.
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .size(
                        width = layerWidth * ShomaraProfileLayout.LeavesBottomLeftWidth,
                        height = layerWidth * ShomaraProfileLayout.LeavesBottomLeftWidth * (215f / 170f),
                    ),
                first = ShomaraProfileShapes::leavesBottomLeft1Path,
                second = ShomaraProfileShapes::leavesBottomLeft2Path,
                third = ShomaraProfileShapes::leavesBottomLeft3Path,
            )
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .offset(x = layerWidth * ShomaraProfileLayout.LeavesBottomRightX)
                    .size(
                        width = layerWidth * ShomaraProfileLayout.LeavesBottomRightWidth,
                        height = layerWidth * ShomaraProfileLayout.LeavesBottomRightWidth * (230f / 170f),
                    ),
                first = ShomaraProfileShapes::leavesBottomRight1Path,
                second = ShomaraProfileShapes::leavesBottomRight2Path,
                third = ShomaraProfileShapes::leavesBottomRight3Path,
            )
        }
    }
}

/**
 * The name field: the same field logic, border, label, hint, error text and
 * editing-state sync as [ShomaraTextField] — but with the owner SVG's user
 * icon drawn at the field's layout-start (visual right in RTL). The shared
 * component has no icon slot, and overlaying the icon on it would let the
 * text run underneath it; this page-local field reserves the icon's width
 * in the text inset instead. If the design system gains an icon slot, this
 * field should be deleted and the shared component used.
 *
 * Deviation from the sample, recorded: the sample shows no visible label;
 * the guide (and the repo's field contract) requires a real label, so the
 * label «نام کودک» renders above the field as a Caption, as on every other
 * page.
 */
@Composable
private fun ShomaraProfileNameField(
    value: String,
    onValueChange: (String) -> Unit,
    errorText: String?,
    modifier: Modifier = Modifier,
) {
    var focused by remember { mutableStateOf(false) }
    val state = ShomaraFieldLogic.stateFor(value, focused, errorText != null, true, false)
    val borderColor = ShomaraFieldLogic.borderFor(state)
    Column(modifier = modifier.fillMaxWidth()) {
        // Persistent label: rendered in every state so the layout never jumps.
        Text(
            text = ShomaraProfileStrings.NameLabel,
            style = ShomaraTypography.Caption,
            color = ShomaraFieldLogic.labelFor(state),
        )
        val fieldModifier = Modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = ShomaraTokens.ComponentButtonH)
            // ADR-0040 R1: the field is the tactile input surface, so it
            // renders Soft clay depth when interactive.
            .shadow(ShomaraClay.specFor(ShomaraClayDepth.Soft).elevation, RoundedCornerShape(ShomaraTokens.RadiusSm))
            .background(ShomaraTokens.ColorSurface, RoundedCornerShape(ShomaraTokens.RadiusSm))
            .border(
                width = ShomaraFieldLogic.borderWidthFor(state),
                color = borderColor,
                shape = RoundedCornerShape(ShomaraTokens.RadiusSm),
            )
            .padding(horizontal = ShomaraTokens.Space12, vertical = ShomaraTokens.Space8)
        // The field owns its editing state (state-owning TextFieldState API);
        // every text change is reported through onValueChange.
        val editableState = rememberTextFieldState(initialText = value)
        // F-34: an external reset (e.g. the caller clearing the value) is
        // synced back into the owned editing state — without this the field
        // keeps showing the old text after the caller has cleared it.
        LaunchedEffect(value) {
            // foundation 1.12.0 has no setTextAndPlaceCursorAtEnd; the
            // equivalent is an edit block that replaces the whole buffer and
            // moves the cursor to the end.
            if (editableState.text.toString() != value) editableState.edit {
                replace(0, length, value)
                placeCursorBeforeCharAt(value.length)
            }
        }
        LaunchedEffect(editableState.text) {
            val text = editableState.text.toString()
            if (text != value) onValueChange(text)
        }
        Box(
            modifier = fieldModifier.semantics(mergeDescendants = true) {
                if (state == ShomaraFieldState.Invalid && errorText != null) error(errorText)
            },
        ) {
            BasicTextField(
                state = editableState,
                // The text is inset from the layout-start by Space40 so it
                // never runs under the 24dp user icon (12dp inset + 24dp).
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = ShomaraTokens.Space40)
                    .onFocusChanged { focused = it.isFocused },
                textStyle = ShomaraFieldLogic.textStyleFor(false, state),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                cursorBrush = SolidColor(ShomaraTokens.ColorPrimary),
                decorator = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (editableState.text.isEmpty()) {
                            Text(text = ShomaraProfileStrings.NameHint, style = ShomaraFieldLogic.textStyleFor(false, state), color = ShomaraTokens.ColorMuted)
                        }
                        inner()
                    }
                },
            )
            // User icon at the field's layout-start (visual right in RTL),
            // decorative — the label and hint already name the field.
            Canvas(
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .size(ShomaraTokens.Space24)
                    .clearAndSetSemantics {},
            ) {
                drawPath(
                    path = ShomaraProfileShapes.iconUserPath(size.width, size.height),
                    color = ShomaraTokens.ColorMuted,
                )
            }
        }
        // Actionable text error — the non-color status carrier for the Invalid state.
        if (state == ShomaraFieldState.Invalid && errorText != null) {
            Row(modifier = Modifier.padding(top = ShomaraTokens.Space4)) {
                Text(
                    text = errorText,
                    style = ShomaraTypography.Caption,
                    color = ShomaraTokens.ColorDanger,
                )
            }
        }
    }
}

/** The grade grid: 2 columns x 3 rows, RTL order (G1/G2, G3/G4, G5/G6). */
@Composable
private fun ShomaraProfileGradeGrid(
    draft: ShomaraProfileDraft,
    onDraftChange: (ShomaraProfileDraft) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
    ) {
        // The first child of each Row is on the right in RTL, so chunking
        // G1..G6 in pairs gives the sample's order.
        for (pair in ShomaraGradeCatalog.Options.chunked(2)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
            ) {
                for (grade in pair) {
                    ShomaraProfileGradeCard(
                        grade = grade,
                        selected = draft.gradeId == grade.id,
                        onSelect = { onDraftChange(draft.copy(gradeId = grade.id)) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

/**
 * One grade card: title only, centred. The selected card carries the pale
 * green background, the green border and the circular check mark — selection
 * is never colour alone. TalkBack announces the selection through the
 * card's own label («انتخاب‌شده») + selected=true, the same pattern as
 * [ShomaraChoiceTile].
 *
 * This is a page-local card, not [ShomaraCard]: the shared card renders a
 * white background in its Selected state, and the sample's selected card is
 * pale green. Everything else (depth, border widths, radii, tap guard,
 * state label) is the shared component's.
 */
@Composable
private fun ShomaraProfileGradeCard(
    grade: ShomaraGradeOption,
    selected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tapGuard = rememberShomaraTapGuard()
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val depth = if (pressed) ShomaraClayDepth.Hint else ShomaraClayDepth.Soft
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = ShomaraTokens.ComponentRowH)
            .shadow(ShomaraClay.specFor(depth).elevation, RoundedCornerShape(ShomaraTokens.RadiusLg))
            .background(
                if (selected) ShomaraTokens.ColorPrimarySoft else ShomaraTokens.ColorSurface,
                RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .border(
                width = if (selected) ShomaraTokens.ClayAnswerTileBorderWidth else ShomaraTokens.ClaySoftBorderWidth,
                color = if (selected) ShomaraTokens.ColorPrimary else ShomaraTokens.ColorLine,
                shape = RoundedCornerShape(ShomaraTokens.RadiusLg),
            )
            .semantics(mergeDescendants = true) {
                role = Role.RadioButton
                if (selected) {
                    stateDescription = ShomaraCardLogic.stateLabelFor(ShomaraCardState.Selected)
                    this.selected = true
                }
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.RadioButton,
            ) {
                if (tapGuard.beginLatched()) {
                    try {
                        onSelect()
                    } finally {
                        tapGuard.end()
                    }
                }
            }
            .padding(ShomaraTokens.Space16),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = grade.title,
            style = ShomaraTypography.Body,
            color = ShomaraTokens.ColorInk,
            textAlign = TextAlign.Center,
            maxLines = 2,
            modifier = Modifier.fillMaxWidth(),
        )
        // Circular check at the card's layout-start (visual right in RTL),
        // decorative for TalkBack — the card already announces the selection.
        if (selected) {
            Box(
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .size(ShomaraTokens.Space20)
                    .background(ShomaraTokens.ColorPrimary, CircleShape)
                    .clearAndSetSemantics {},
                contentAlignment = Alignment.Center,
            ) {
                // The owner SVG's check path (15-icon-check), drawn with the
                // mockup's bold stroke (Space4, as on the page-01 arrow) —
                // the SVG's own 5/48 stroke would read thin at 20dp.
                Canvas(modifier = Modifier.size(ShomaraTokens.Space20)) {
                    drawPath(
                        path = ShomaraProfileShapes.iconCheckPath(size.width, size.height),
                        color = ShomaraTokens.ColorSurface,
                        style = Stroke(
                            width = ShomaraTokens.Space4.toPx(),
                            cap = StrokeCap.Round,
                        ),
                    )
                }
            }
        }
    }
}

/**
 * The page-02 CTA: one big green pill, exactly the Primary button's colours,
 * Clay depth, tap guard, loading and disabled states — but pill-shaped with
 * a Canvas-drawn right-pointing arrow at the physical right, as in the
 * sample. [ShomaraButton] is text-only (no icon slot), so the arrow cannot
 * be added to it; this page-local button reuses its logic object instead of
 * duplicating colours or depth. Mirrors [ShomaraLaunchCta] on page 01.
 *
 * OPEN QUESTION (owner): the arrow points right (→) while RTL forward is
 * usually left (←). Reproduced exactly as the sample shows, as on page 01.
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
    val tapGuard = rememberShomaraTapGuard()
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()
    val state = when {
        !enabled -> ShomaraButtonState.Disabled
        loading -> ShomaraButtonState.Loading
        pressed -> ShomaraButtonState.Pressed
        focused -> ShomaraButtonState.Focused
        else -> ShomaraButtonState.Default
    }
    val (container, content) = ShomaraButtonLogic.colors(
        ShomaraButtonVariant.Primary,
        state,
    )
    val depth = ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, state)
    val semanticsLabel = when (state) {
        ShomaraButtonState.Disabled -> "غیرفعال"
        ShomaraButtonState.Loading -> "در حال انجام"
        ShomaraButtonState.Pressed -> "فشرده"
        else -> ""
    }
    // Disabled/Loading buttons must not expose an OnClick action to a11y
    // services: Compose's clickable keeps advertising OnClick even when
    // enabled=false, so quiet states skip the clickable modifier entirely
    // (found by the instrumented N08-02 semantics tests).
    val interactive = ShomaraButtonLogic.isEnabled(state)
    val depthElevation = ShomaraClay.specFor(depth).elevation
    Box(
        modifier = modifier
            .defaultMinSize(
                minWidth = ShomaraButtonLogic.MinTouchTarget,
                minHeight = ShomaraButtonLogic.minHeight(),
            )
            .shadow(depthElevation, RoundedCornerShape(ShomaraTokens.RadiusPill))
            .background(container, RoundedCornerShape(ShomaraTokens.RadiusPill))
            .semantics(mergeDescendants = true) {
                role = Role.Button
                if (state == ShomaraButtonState.Disabled) disabled()
                if (semanticsLabel.isNotEmpty()) stateDescription = semanticsLabel
            }
            .let {
                if (interactive) {
                    it.clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        enabled = true,
                        role = Role.Button,
                    ) {
                        if (tapGuard.beginLatched()) {
                            try {
                                onSave()
                            } finally {
                                tapGuard.end()
                            }
                        }
                    }
                } else it
            }
            .padding(
                horizontal = ShomaraTokens.Space16,
                vertical = ShomaraButtonLogic.VerticalPadding,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (state == ShomaraButtonState.Loading) {
                if (reducedMotion) {
                    // F-33: static loading mark — same size and colour as the
                    // spinner, no rotation.
                    Box(
                        modifier = Modifier.size(ShomaraTokens.Space16).background(content, CircleShape),
                    )
                } else {
                    CircularProgressIndicator(
                        modifier = Modifier.size(ShomaraTokens.Space16),
                        color = content,
                        strokeWidth = ShomaraTokens.Space4,
                    )
                }
            }
            Text(
                text = ShomaraProfileStrings.Continue,
                style = ShomaraTypography.Title,
                color = content,
                textAlign = TextAlign.Center,
                maxLines = ShomaraButtonLogic.MaxLabelLines,
            )
        }
        // Right-pointing arrow, drawn from the owner SVG (16-icon-arrow) —
        // the same proportions as the page-01 arrow (ShomaraLaunchLayout
        // .arrowPoints: tail 0.15, tip 0.85, wings 0.62; this SVG: 0.146,
        // 0.833, 0.562). Physical right = Alignment.CenterStart in RTL,
        // exactly where the sample puts it.
        Canvas(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .size(ShomaraTokens.Space24)
                .clearAndSetSemantics {},
        ) {
            drawPath(
                path = ShomaraProfileShapes.iconArrowPath(size.width, size.height),
                color = content,
                style = Stroke(
                    width = ShomaraTokens.Space4.toPx(),
                    cap = StrokeCap.Round,
                ),
            )
        }
    }
}

@Composable
fun ShomaraPlacementScreen(
    state: ShomaraPlacementState,
    // #88: null means no skip affordance at all — the button is not rendered, not merely
    // disabled. The host passes a real callback only when the product/DEBUG flag allows it.
    onSkip: (() -> Unit)?,
    modifier: Modifier = Modifier,
    // #100: the save confirmation carried from the profile step — the profile step advances
    // immediately on a successful save, so this is where the «ذخیره شد» banner is seen.
    // Null when the user did not just save (no banner is invented).
    savedAnnouncement: String? = null,
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
                        state.serverDecision != null -> Text(text = state.serverDecision, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, textAlign = TextAlign.Center)
                        state.isSkipped -> Text(text = ShomaraProfileStrings.GradeOne, style = ShomaraTypography.Body, color = ShomaraTokens.ColorInk, textAlign = TextAlign.Center)
                        else -> Text(text = ShomaraProfileStrings.PlacementPending, style = ShomaraTypography.Caption, color = ShomaraTokens.ColorMuted, textAlign = TextAlign.Center)
                    }
                }
            }
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
