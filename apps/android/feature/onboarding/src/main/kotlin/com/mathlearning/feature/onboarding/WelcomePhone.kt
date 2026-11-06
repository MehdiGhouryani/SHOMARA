package com.mathlearning.feature.onboarding

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import com.mathlearning.core.designsystem.ShomaraButton
import com.mathlearning.core.designsystem.ShomaraButtonLogic
import com.mathlearning.core.designsystem.ShomaraButtonState
import com.mathlearning.core.designsystem.ShomaraButtonVariant
import com.mathlearning.core.designsystem.ShomaraCard
import com.mathlearning.core.designsystem.ShomaraClay
import com.mathlearning.core.designsystem.ShomaraLaunchDrawables
import com.mathlearning.core.designsystem.ShomaraProfileDrawables
import com.mathlearning.core.designsystem.ShomaraTextField
import com.mathlearning.core.designsystem.ShomaraTokens
import com.mathlearning.core.designsystem.ShomaraTypography
import com.mathlearning.core.designsystem.rememberShomaraTapGuard

/** Welcome/phone copy seeds; screens accept canonical-source overrides. Warm and plain (AGENTS rule 9 tone). */
object ShomaraOnboardingStrings {
    const val WelcomeTitle: String = "به شومارا خوش آمدی!"
    /**
     * Owner-supplied subtitle for page 01-launch (2026-11-05, from the
     * owner's sample image). It settles the family-01 DRAFT welcome text
     * recorded in CANONICAL_TEXTS_DRAFT_FA.md — the draft offered two
     * welcome options; the owner supplied this exact sentence with the
     * sample, so it is now the canonical welcome subtitle.
     */
    const val WelcomeSubtitle: String = "برای یادگیری ریاضی، آماده یک ماجراجویی هیجان‌انگیز!"
    const val WelcomeBody: String = "برای شروع یادگیری، شمارهٔ همراه والدین را وارد کنیم."
    const val PhoneLabel: String = "شمارهٔ همراه والدین"
    const val PhoneHint: String = "۰۹۱۲ ۳۴۵ ۶۷۸۹"
    const val PhoneInvalid: String = "شمارهٔ همراه را با ۰۹ و ۱۱ رقم وارد کن."
    const val Continue: String = "ادامه"
    const val Back: String = "بازگشت"

    /** N08-15 DEBUG simulation affordance; the label names itself so it is never read as real SMS. */
    const val SimulationSkip: String = "عبور آزمایشی (حالت توسعه)"
}

/**
 * Pure Persian phone normalization/validation (N04-02 acceptance). Accepts Persian/Arabic
 * digits, common separators, and 0098/+98/98/0 trunk prefixes; canonical output is the plain
 * 09XXXXXXXXX form (11 digits).
 */
object ShomaraPhoneLogic {
    private val PersianDigits = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
    private val ArabicDigits = charArrayOf('٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩')

    fun normalizeDigit(char: Char): Char = when (char) {
        in PersianDigits -> ('0' + PersianDigits.indexOf(char))
        in ArabicDigits -> ('0' + ArabicDigits.indexOf(char))
        else -> char
    }

    fun normalize(raw: String): String = raw.map(::normalizeDigit)
        .filter { it.isDigit() || it == '+' }
        .joinToString("")
        .removePrefix("+98")
        .removePrefix("0098")
        .removePrefix("98")
        .filter { it.isDigit() }
        .removePrefix("0")
        .let { trunk -> if (trunk.isNotEmpty()) "0$trunk" else "" }

    fun isValid(raw: String): Boolean {
        val normalized = normalize(raw)
        return normalized.length == 11 && normalized.startsWith("09") && normalized.all { it.isDigit() }
    }

    fun canonical(raw: String): String? = if (isValid(raw)) normalize(raw) else null

    fun validationError(raw: String): String? = if (isValid(raw)) null else ShomaraOnboardingStrings.PhoneInvalid
}

/** Pure back-target mapping (N04-02 keyboard/back behavior; wired to real Back in N04-07). */
object ShomaraBackLogic {
    fun backTarget(step: OnboardingStep): OnboardingStep? = when (step) {
        OnboardingStep.Welcome -> null // no route behind the welcome gate
        OnboardingStep.PhoneInput -> OnboardingStep.Welcome
        OnboardingStep.OtpVerify -> OnboardingStep.PhoneInput
        OnboardingStep.ProfileSetup -> OnboardingStep.OtpVerify
        OnboardingStep.GradePlacement -> OnboardingStep.ProfileSetup
        OnboardingStep.Complete -> null // completion exits onboarding
    }
}

/**
 * Pure geometry of the page-01 launch screen, measured from the owner's
 * sample image (841×1870) — see design/playbook/PAGE_01_IMPLEMENTATION_NOTE_FA.md.
 *
 * Fractions are of the hero-zone width (x, width) and hero-zone height
 * (y). Heights follow each PNG's native aspect, so a fraction set measured
 * on one screen width scales to any width. No Compose, no Dp: every value
 * here is JVM-testable.
 *
 * WARNING: the manifest's `source_bbox_xywh` values describe the
 * 1024×1536 asset sheet (vertical bands), NOT the phone-screen layout —
 * they do not map onto the sample. Placement follows the sample
 * screenshot; the manifest is used only for asset identity, native
 * aspect ratios, and the 14px safety margin.
 */
object ShomaraLaunchLayout {

    /** Hero art zone height, as a fraction of screen height (sample: art ends ~0.54). */
    const val HeroHeightFraction: Float = 0.54f

    /** CTA width, as a fraction of screen width (sample: CTA spans 0.095–0.902). */
    const val CtaWidthFraction: Float = 0.807f

    /** Gap below the CTA, as a fraction of screen height (sample: CTA ends 0.928). */
    const val CtaBottomGapFraction: Float = 0.072f

    /** Width of one title-flank spark, as a fraction of screen width. */
    const val TitleFlankWidthFraction: Float = 0.070f

    /** Hero width / hero height on the 412dp sample screen (412 / 0.54×892). */
    const val SampleHeroWidthOverHeight: Float = 0.855f

    /**
     * One hero-zone PNG: top-left corner and width as fractions of the
     * hero zone; height follows the asset's native aspect.
     */
    data class HeroAsset(
        val name: String,
        val xFraction: Float,
        val yFraction: Float,
        val widthFraction: Float,
        /** Native height / native width of the delivered PNG. */
        val heightPerWidth: Float,
    )

    /** All hero-zone PNGs, in draw order (clouds and numbers first, plants last). */
    fun heroAssets(): List<HeroAsset> = listOf(
        HeroAsset("cloudTopLeft", 0.035f, 0.148f, 0.184f, 0.735f),
        HeroAsset("number2", 0.754f, 0.244f, 0.159f, 1.245f),
        HeroAsset("number1", 0.099f, 0.302f, 0.132f, 1.288f),
        HeroAsset("topSpark", 0.535f, 0.369f, 0.137f, 1.050f),
        HeroAsset("mascot", 0.210f, 0.413f, 0.607f, 0.939f),
        HeroAsset("plus", 0.087f, 0.493f, 0.132f, 1.000f),
        HeroAsset("largeStar", 0.830f, 0.537f, 0.107f, 0.966f),
        HeroAsset("cloudMiddleLeft", 0.035f, 0.630f, 0.184f, 0.735f),
        HeroAsset("division", 0.773f, 0.730f, 0.117f, 1.159f),
        HeroAsset("smallStar", 0.210f, 0.759f, 0.083f, 0.936f),
        HeroAsset("plantLeft", 0.000f, 0.893f, 0.164f, 0.598f),
        HeroAsset("plantRight", 0.687f, 0.854f, 0.312f, 0.566f),
    )

    /** Bottom edge of [asset], as a fraction of hero height, on the sample aspect. */
    fun bottomFraction(asset: HeroAsset): Float =
        asset.yFraction + asset.widthFraction * asset.heightPerWidth * SampleHeroWidthOverHeight

    /** Centre of the mascot, as a fraction of hero width (sample: 0.514). */
    fun mascotCenterXFraction(): Float {
        val mascot = heroAssets().first { it.name == "mascot" }
        return mascot.xFraction + mascot.widthFraction / 2f
    }

    /** Right-pointing arrow, normalized to a 0..1 square (the sample CTA arrow points →). */
    data class ArrowPoints(
        val tailX: Float,
        val tailY: Float,
        val tipX: Float,
        val tipY: Float,
        val wingTopX: Float,
        val wingTopY: Float,
        val wingBottomX: Float,
        val wingBottomY: Float,
    )

    fun arrowPoints(): ArrowPoints = ArrowPoints(
        tailX = 0.15f,
        tailY = 0.5f,
        tipX = 0.85f,
        tipY = 0.5f,
        wingTopX = 0.62f,
        wingTopY = 0.22f,
        wingBottomX = 0.62f,
        wingBottomY = 0.78f,
    )

    /** Smile curve under the subtitle: endpoints high, control point low (normalized 0..1). */
    data class SwooshPoints(val startY: Float, val controlY: Float, val endY: Float)

    fun swooshPoints(): SwooshPoints = SwooshPoints(startY = 0.35f, controlY = 1.0f, endY = 0.35f)
}

/**
 * Page 01-launch — the Welcome screen, reproduced from the owner's sample
 * image (841×1870) and the 12 owner-delivered PNGs.
 *
 * Structure, top to bottom: hero art zone (0.54 × screen height, owner
 * artwork on a drawn pale-peach blob with green hills) → title with a
 * yellow spark on each side → owner-supplied subtitle with an amber
 * underline swoosh → one big green pill CTA "ادامه" anchored at the
 * bottom, with a right-pointing arrow exactly as in the sample.
 *
 * The hero art is decorative (silent to TalkBack). The title is a heading.
 * The CTA announces as a button and calls [onStart] exactly as before.
 * Static art, no animation — reduced-motion safe by construction. The
 * text column scrolls, so the page stays usable at 200% font and on
 * 360dp width; the CTA never clips.
 *
 * The purple mascot is owner-supplied artwork for this page only — it is
 * NOT the approved cast (no ShomaraCharacter pose) and must never be
 * reused as a guide or avatar elsewhere. The yellow four-point shapes in
 * the hero are decorative elements of the owner-supplied artwork — not a
 * reward, not counted, not earned; no reward/currency system is introduced.
 *
 * OPEN QUESTION (owner): the sample's CTA arrow points right (→), while
 * RTL forward is usually left (←). Reproduced exactly as the sample
 * shows; the owner confirms the direction.
 */
@Composable
fun ShomaraWelcomeScreen(
    onStart: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = ShomaraOnboardingStrings.WelcomeTitle,
    body: String = ShomaraOnboardingStrings.WelcomeSubtitle,
) {
    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(ShomaraTokens.ColorCanvas),
    ) {
        val screenWidth = maxWidth
        val screenHeight = maxHeight
        val hillSize = screenWidth * 0.55f

        // Background layer, drawn behind the content: bottom hills, small
        // corner plants, and one pale cloud beside the subtitle. All
        // decorative (contentDescription = null, no semantics).
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .offset(x = screenWidth * -0.195f, y = hillSize * 0.75f)
                .size(hillSize)
                .background(ShomaraTokens.ColorPrimarySoft, CircleShape),
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .offset(x = screenWidth * 0.195f, y = hillSize * 0.75f)
                .size(hillSize)
                .background(ShomaraTokens.ColorPrimarySoft, CircleShape),
        )
        Image(
            painter = painterResource(ShomaraLaunchDrawables.LeftGreenPlant),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .size(width = screenWidth * 0.12f, height = screenWidth * 0.12f * 0.598f),
        )
        Image(
            painter = painterResource(ShomaraLaunchDrawables.RightGreenPlant),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .size(width = screenWidth * 0.12f, height = screenWidth * 0.12f * 0.566f),
        )
        Image(
            painter = painterResource(ShomaraLaunchDrawables.WhiteCloud),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .offset(x = screenWidth * 0.740f, y = screenHeight * 0.710f)
                .size(width = screenWidth * 0.200f, height = screenWidth * 0.200f * 0.735f),
        )

        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            ShomaraLaunchHero(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(screenHeight * ShomaraLaunchLayout.HeroHeightFraction),
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = ShomaraTokens.Space24),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(
                    ShomaraTokens.Space16,
                    Alignment.CenterVertically,
                ),
            ) {
                // Title with one yellow spark on each side, as in the sample.
                // In RTL the first child is on the right: right flank as-is,
                // left flank mirrored so the two fans mirror each other.
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
                ) {
                    Image(
                        painter = painterResource(ShomaraLaunchDrawables.BottomYellowSpark),
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.size(
                            width = screenWidth * ShomaraLaunchLayout.TitleFlankWidthFraction,
                            height = screenWidth * ShomaraLaunchLayout.TitleFlankWidthFraction * 1.020f,
                        ),
                    )
                    Text(
                        text = title,
                        style = ShomaraTypography.Display,
                        color = ShomaraTokens.ColorInk,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .weight(1f)
                            .semantics { heading() },
                    )
                    Image(
                        painter = painterResource(ShomaraLaunchDrawables.BottomYellowSpark),
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .graphicsLayer { scaleX = -1f }
                            .size(
                                width = screenWidth * ShomaraLaunchLayout.TitleFlankWidthFraction,
                                height = screenWidth * ShomaraLaunchLayout.TitleFlankWidthFraction * 1.020f,
                            ),
                    )
                }
                // Owner-supplied subtitle with the amber underline swoosh.
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space4),
                ) {
                    Text(
                        text = body,
                        style = ShomaraTypography.Body,
                        color = ShomaraTokens.ColorInk2,
                        textAlign = TextAlign.Center,
                    )
                    Canvas(
                        modifier = Modifier
                            .size(
                                width = screenWidth * 0.210f,
                                height = ShomaraTokens.Space12,
                            )
                            .clearAndSetSemantics {},
                    ) {
                        val swoosh = ShomaraLaunchLayout.swooshPoints()
                        val path = Path().apply {
                            moveTo(0f, size.height * swoosh.startY)
                            quadraticBezierTo(
                                size.width / 2f,
                                size.height * swoosh.controlY,
                                size.width,
                                size.height * swoosh.endY,
                            )
                        }
                        drawPath(
                            path = path,
                            color = ShomaraTokens.ColorAmber,
                            style = Stroke(
                                width = ShomaraTokens.Space4.toPx(),
                                cap = StrokeCap.Round,
                            ),
                        )
                    }
                }
            }
            ShomaraLaunchCta(
                onStart = onStart,
                modifier = Modifier
                    .width(screenWidth * ShomaraLaunchLayout.CtaWidthFraction)
                    .padding(bottom = screenHeight * ShomaraLaunchLayout.CtaBottomGapFraction),
            )
        }
    }
}

/** Hero art zone: drawn blob + hills, then the owner-delivered PNGs. Decorative. */
@Composable
private fun ShomaraLaunchHero(modifier: Modifier = Modifier) {
    BoxWithConstraints(
        modifier = modifier.clearAndSetSemantics {},
    ) {
        val heroWidth = maxWidth
        val heroHeight = maxHeight
        val blobWidth = heroWidth * 0.960f
        val hillSize = heroWidth * 0.520f

        // Soft pale-peach blob behind the artwork (drawn; the sample blob is
        // an organic ellipse — SurfaceAlt is the closest token, CircleShape
        // on a taller-than-wide box gives the same soft ellipse).
        Box(
            modifier = Modifier
                .size(width = blobWidth, height = blobWidth * 1.058f)
                .offset(x = heroWidth * 0.039f, y = heroHeight * 0.037f)
                .background(ShomaraTokens.ColorSurfaceAlt, CircleShape),
        )
        // Green hills peeking from the bottom edge of the hero zone.
        Box(
            modifier = Modifier
                .size(hillSize)
                .offset(x = heroWidth * -0.180f, y = heroHeight - hillSize * 0.320f)
                .background(ShomaraTokens.ColorPrimarySoft, CircleShape),
        )
        Box(
            modifier = Modifier
                .size(hillSize)
                .offset(x = heroWidth * 0.660f, y = heroHeight - hillSize * 0.320f)
                .background(ShomaraTokens.ColorPrimarySoft, CircleShape),
        )
        // Owner-delivered PNGs, in the order of ShomaraLaunchLayout.heroAssets().
        for (asset in ShomaraLaunchLayout.heroAssets()) {
            ShomaraLaunchArt(
                drawableId = drawableIdForLaunchAsset(asset.name),
                asset = asset,
                heroWidth = heroWidth,
                heroHeight = heroHeight,
            )
        }
    }
}

/** One hero PNG, placed from its [ShomaraLaunchLayout.HeroAsset] fractions. */
@Composable
private fun ShomaraLaunchArt(
    drawableId: Int,
    asset: ShomaraLaunchLayout.HeroAsset,
    heroWidth: Dp,
    heroHeight: Dp,
) {
    Image(
        painter = painterResource(drawableId),
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = Modifier
            .size(
                width = heroWidth * asset.widthFraction,
                height = heroWidth * asset.widthFraction * asset.heightPerWidth,
            )
            .offset(x = heroWidth * asset.xFraction, y = heroHeight * asset.yFraction),
    )
}

private fun drawableIdForLaunchAsset(name: String): Int = when (name) {
    "cloudTopLeft", "cloudMiddleLeft" -> ShomaraLaunchDrawables.WhiteCloud
    "number2" -> ShomaraLaunchDrawables.Number2
    "number1" -> ShomaraLaunchDrawables.Number1
    "topSpark" -> ShomaraLaunchDrawables.TopYellowSpark
    "mascot" -> ShomaraLaunchDrawables.MascotBowCharacter
    "plus" -> ShomaraLaunchDrawables.PlusSign
    "largeStar" -> ShomaraLaunchDrawables.LargeYellowStar
    "division" -> ShomaraLaunchDrawables.DivisionSign
    "smallStar" -> ShomaraLaunchDrawables.SmallYellowStar
    "plantLeft" -> ShomaraLaunchDrawables.LeftGreenPlant
    "plantRight" -> ShomaraLaunchDrawables.RightGreenPlant
    else -> error("Unknown launch hero asset: $name")
}

/**
 * The page-01 CTA: one big green pill, exactly the Primary button's
 * colours, Clay depth, tap guard and 56dp minimum height — but pill-shaped
 * with a Canvas-drawn right-pointing arrow at the physical right, as in
 * the sample. [ShomaraButton] is text-only (no icon slot), so the arrow
 * cannot be added to it; this page-local button reuses its logic object
 * instead of duplicating colours or depth.
 *
 * OPEN QUESTION (owner): the arrow points right (→) while RTL forward is
 * usually left (←). Reproduced exactly as the sample shows.
 */
@Composable
private fun ShomaraLaunchCta(
    onStart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tapGuard = rememberShomaraTapGuard()
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()
    val state = when {
        pressed -> ShomaraButtonState.Pressed
        focused -> ShomaraButtonState.Focused
        else -> ShomaraButtonState.Default
    }
    val (container, content) = ShomaraButtonLogic.colors(
        ShomaraButtonVariant.Primary,
        state,
    )
    val depth = ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, state)
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
                if (pressed) stateDescription = "فشرده"
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.Button,
            ) {
                if (tapGuard.beginLatched()) {
                    try {
                        onStart()
                    } finally {
                        tapGuard.end()
                    }
                }
            }
            .padding(
                horizontal = ShomaraTokens.Space16,
                vertical = ShomaraButtonLogic.VerticalPadding,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = ShomaraOnboardingStrings.Continue,
            style = ShomaraTypography.Title,
            color = content,
            textAlign = TextAlign.Center,
            maxLines = ShomaraButtonLogic.MaxLabelLines,
            modifier = Modifier.fillMaxWidth(),
        )
        // Right-pointing arrow, drawn (no material-icons dependency exists
        // in the design system). Physical right = Alignment.CenterStart in
        // RTL, exactly where the sample puts it.
        Canvas(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .size(ShomaraTokens.Space24)
                .clearAndSetSemantics {},
        ) {
            val arrow = ShomaraLaunchLayout.arrowPoints()
            drawLine(
                color = content,
                start = Offset(size.width * arrow.tailX, size.height * arrow.tailY),
                end = Offset(size.width * arrow.tipX, size.height * arrow.tipY),
                strokeWidth = ShomaraTokens.Space4.toPx(),
                cap = StrokeCap.Round,
            )
            drawLine(
                color = content,
                start = Offset(size.width * arrow.tipX, size.height * arrow.tipY),
                end = Offset(size.width * arrow.wingTopX, size.height * arrow.wingTopY),
                strokeWidth = ShomaraTokens.Space4.toPx(),
                cap = StrokeCap.Round,
            )
            drawLine(
                color = content,
                start = Offset(size.width * arrow.tipX, size.height * arrow.tipY),
                end = Offset(size.width * arrow.wingBottomX, size.height * arrow.wingBottomY),
                strokeWidth = ShomaraTokens.Space4.toPx(),
                cap = StrokeCap.Round,
            )
        }
    }
}

/**
 * Compact hero geometry for the page-03 phone screen: the page-02 profile
 * hero's visual language (drawn back hills + leaf clusters + the mascot WebP
 * peeking over the front-curve dome) at a slightly shorter height, so the
 * hero, title, body and phone field card still fit above the bottom-pinned
 * CTA at 360dp width. Every value is a fraction — of the hero width (x,
 * width) or of the hero height (y) — so the composition scales to any
 * width; no Compose types, JVM-testable.
 */
internal object ShomaraPhoneHeroLayout {
    /** Hero height, as a fraction of the hero (full-bleed) width (page-02 is 1/1.27 ≈ 0.787; this page is deliberately shorter). */
    const val HeroHeightFraction: Float = 0.62f

    /** Back hills: full-width bands at the hero bottom, behind the mascot (page-02 fractions). */
    const val HeroHillWidth: Float = 0.365f

    /** Top leaves at the hero's left/right edges (page-02 fractions; y is of the hero height). */
    const val LeavesTopLeftX: Float = 0.0f
    const val LeavesTopLeftY: Float = 0.42f
    const val LeavesTopLeftWidth: Float = 0.20f
    const val LeavesTopRightX: Float = 0.80f
    const val LeavesTopRightY: Float = 0.38f
    const val LeavesTopRightWidth: Float = 0.20f

    /** Mascot: centred (x = (1 − 0.66) / 2), width fraction of the hero width, native 1536×1024 aspect. */
    const val MascotXFraction: Float = 0.17f
    // Negative y = raised above the hero top — the page-02 owner decision, kept
    // here so the hands stay visible draped over the dome (a positive offset
    // would sink them behind it on this shorter hero).
    const val MascotYFraction: Float = -0.03f
    const val MascotWidthFraction: Float = 0.66f
    const val MascotAspectRatio: Float = 1.5f

    /** Front-curve dome box height, as a fraction of the hero width (the same dome as page-02). */
    const val FrontCurveHeightFraction: Float = 355f / 878f

    /** Front-curve stroke: 5 viewBox units in an 878-wide viewBox (page-02). */
    const val FrontCurveStrokeWidthFraction: Float = 5f / 878f
}

/**
 * Leaf greens, derived exactly like page-02's private palette: the owner
 * SVGs' fresh greens have no mid-green token, so the darker layers are tints
 * of the primary token over the cream canvas. A mid-green token would be a
 * later ADR, not a silent hex.
 */
private val PhoneLeafLight: Color = ShomaraTokens.ColorPrimarySoft
private val PhoneLeafMid: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.35f)
private val PhoneLeafDark: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.45f)

/**
 * The page-03 phone screen, restructured to the page-02 profile pattern:
 * top zone (compact hero → title → body line → phone field card) that owns
 * the scroll, then a bottom zone pinned by column weight — «ادامه», «بازگشت»
 * and the DEBUG-only «عبور آزمایشی» — so the primary CTA never scrolls away
 * and the content must fit at 360dp width.
 *
 * The body line under the title is the canonical [ShomaraOnboardingStrings
 * .WelcomeBody] (it used to live inside the phone card too — F-27 — and was
 * then missing from this screen entirely); the card now holds only the
 * field. The hero is fully decorative art, silent to TalkBack; the title
 * stays the heading and the traversal order is title → body → field card →
 * «ادامه» → «بازگشت» (→ DEBUG skip), mirrored by ShomaraOnboardingA11y.
 */
@Composable
fun ShomaraPhoneScreen(
    phone: String,
    onPhoneChange: (String) -> Unit,
    onContinue: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = ShomaraOnboardingStrings.PhoneLabel,
    /** DEBUG simulation only (N08-15); null in release, so the button never renders there. */
    simulatedSkip: (() -> Unit)? = null,
) {
    // Batch 2: the error is shown only once the user has typed something.
    // F-08: «typed something» is not enough — a partial number (fewer than 11 digits) is
    // still being typed, not wrong. The error appears only once 11 digits are in and the
    // number is still invalid; the CTA still stays disabled until valid.
    val error = if (phone.count { it.isDigit() } >= 11) ShomaraPhoneLogic.validationError(phone) else null
    val canContinue = ShomaraPhoneLogic.isValid(phone)
    Column(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space8),
        ) {
            // Full-bleed compact hero: no horizontal padding here (the
            // children below carry it), exactly like the profile hero.
            ShomaraPhoneHero()
            // Section header above the card; the field keeps its own persistent label inside.
            // Batch 2: the section title is a TalkBack heading, like every
            // other screen title in the flow.
            Text(
                text = title,
                style = ShomaraTypography.Title,
                color = ShomaraTokens.ColorInk,
                modifier = Modifier
                    .padding(horizontal = ShomaraTokens.Space24)
                    .semantics { heading() },
            )
            // The canonical body line, muted ink, under the title.
            Text(
                text = ShomaraOnboardingStrings.WelcomeBody,
                style = ShomaraTypography.Body,
                color = ShomaraTokens.ColorInk2,
                modifier = Modifier.padding(horizontal = ShomaraTokens.Space24),
            )
            ShomaraCard(modifier = Modifier.padding(horizontal = ShomaraTokens.Space24)) {
                Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
                    // F-27: the welcome body line lived inside the phone card too — the same
                    // sentence twice on one screen. It now renders once, under the title.
                    ShomaraTextField(
                        value = phone,
                        onValueChange = onPhoneChange,
                        label = title,
                        hint = ShomaraOnboardingStrings.PhoneHint,
                        errorText = error,
                        numericLtr = true,
                    )
                }
            }
        }
        // Bottom zone, pinned by column weight (never scroll-dependent):
        // the primary CTA, then the ghost actions, DEBUG skip last.
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = ShomaraTokens.Space24),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            ShomaraPhoneCta(
                onContinue = {
                    val canonical = ShomaraPhoneLogic.canonical(phone)
                    if (canonical != null) onContinue(canonical)
                },
                enabled = canContinue,
                // The profile's CTA width fraction — the same 0.772 column.
                modifier = Modifier.fillMaxWidth(ShomaraProfileLayout.CtaWidthFraction),
            )
            ShomaraButton(
                text = ShomaraOnboardingStrings.Back,
                onClick = onBack,
                variant = ShomaraButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth(),
            )
            // DEBUG simulation only; never rendered in release builds (simulatedAuth stays false).
            if (simulatedSkip != null) {
                ShomaraButton(
                    text = ShomaraOnboardingStrings.SimulationSkip,
                    onClick = simulatedSkip,
                    variant = ShomaraButtonVariant.Ghost,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

/**
 * The compact hero: page-02's drawn back hills + top leaf clusters + the
 * mascot WebP peeking over the front-curve dome, layered in that order (the
 * dome is drawn last, so it covers the mascot's lower body and the hands
 * read as draped over the hill). All art is decorative and silent.
 */
@Composable
private fun ShomaraPhoneHero(modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        val heroWidth = maxWidth
        val heroHeight = heroWidth * ShomaraPhoneHeroLayout.HeroHeightFraction
        Box(
            modifier = Modifier
                .size(width = heroWidth, height = heroHeight)
                .clearAndSetSemantics {},
        ) {
            // Back hills, bottom-anchored, behind the mascot.
            ShomaraPhoneShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .size(
                        width = heroWidth * ShomaraPhoneHeroLayout.HeroHillWidth,
                        height = heroWidth * ShomaraPhoneHeroLayout.HeroHillWidth * (180f / 320f),
                    ),
            )
            ShomaraPhoneShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(
                        width = heroWidth * ShomaraPhoneHeroLayout.HeroHillWidth,
                        height = heroWidth * ShomaraPhoneHeroLayout.HeroHillWidth * (150f / 320f),
                    ),
            )
            // Top leaves, at the hero's layout-start/layout-end edges (the
            // same RTL-mirrored placement as the profile hero).
            ShomaraPhoneLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraPhoneHeroLayout.LeavesTopLeftX,
                        y = heroHeight * ShomaraPhoneHeroLayout.LeavesTopLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraPhoneHeroLayout.LeavesTopLeftWidth,
                        height = heroWidth * ShomaraPhoneHeroLayout.LeavesTopLeftWidth * (150f / 180f),
                    ),
                first = ShomaraProfileShapes::leavesTopLeft1Path,
                second = ShomaraProfileShapes::leavesTopLeft2Path,
                third = ShomaraProfileShapes::leavesTopLeft3Path,
            )
            ShomaraPhoneLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraPhoneHeroLayout.LeavesTopRightX,
                        y = heroHeight * ShomaraPhoneHeroLayout.LeavesTopRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraPhoneHeroLayout.LeavesTopRightWidth,
                        height = heroWidth * ShomaraPhoneHeroLayout.LeavesTopRightWidth * (175f / 175f),
                    ),
                first = ShomaraProfileShapes::leavesTopRight1Path,
                second = ShomaraProfileShapes::leavesTopRight2Path,
                third = ShomaraProfileShapes::leavesTopRight3Path,
            )
            // The mascot (owner WebP, with bow, as-is). ContentScale.Fit on
            // the exact 1.5 aspect box, so no crop and no distortion.
            Image(
                painter = painterResource(ShomaraProfileDrawables.MascotWithBow),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraPhoneHeroLayout.MascotXFraction,
                        y = heroHeight * ShomaraPhoneHeroLayout.MascotYFraction,
                    )
                    .size(
                        width = heroWidth * ShomaraPhoneHeroLayout.MascotWidthFraction,
                        height = heroWidth * ShomaraPhoneHeroLayout.MascotWidthFraction / ShomaraPhoneHeroLayout.MascotAspectRatio,
                    ),
            )
            // Front curve last: it covers the mascot's lower body, so the
            // mascot reads as peeking over the hill.
            ShomaraPhoneShapeCanvas(
                buildPath = ShomaraProfileShapes::heroFrontCurve1Path,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * ShomaraPhoneHeroLayout.FrontCurveHeightFraction),
            )
            Canvas(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * ShomaraPhoneHeroLayout.FrontCurveHeightFraction),
            ) {
                drawPath(
                    path = ShomaraProfileShapes.heroFrontCurve2Path(size.width, size.height),
                    color = ShomaraTokens.ColorAmberSoft,
                    style = Stroke(
                        width = size.width * ShomaraPhoneHeroLayout.FrontCurveStrokeWidthFraction,
                        cap = StrokeCap.Round,
                    ),
                )
            }
        }
    }
}

/**
 * Draws one generated path, built for the Canvas's drawn size — the same
 * pattern as the profile's shape canvas (the pixel size is only known
 * inside the draw scope).
 */
@Composable
private fun ShomaraPhoneShapeCanvas(
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
private fun ShomaraPhoneLeaves(
    first: (width: Float, height: Float) -> Path,
    second: (width: Float, height: Float) -> Path,
    third: (width: Float, height: Float) -> Path,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier) {
        drawPath(path = first(size.width, size.height), color = PhoneLeafLight)
        drawPath(path = second(size.width, size.height), color = PhoneLeafMid)
        drawPath(path = third(size.width, size.height), color = PhoneLeafDark)
    }
}

/**
 * The page-03 CTA: one big green pill, exactly the Primary button's colours,
 * Clay depth, tap guard and disabled states — pill-shaped with the drawn
 * arrow, mirroring the page-02 profile CTA (which mirrors page 01).
 * [ShomaraButton] is text-only (no icon slot), so this page-local button
 * reuses its logic object instead of duplicating colours or depth.
 *
 * Page-local CTA colour (the same override as the page-02 profile CTA): the
 * owner wants «ادامه» dark even while the phone is still incomplete. The
 * shared quiet mapping stays untouched for every other button; here Disabled
 * renders the darker token and stays non-clickable.
 */
@Composable
private fun ShomaraPhoneCta(
    onContinue: () -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier,
) {
    val tapGuard = rememberShomaraTapGuard()
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()
    val state = when {
        !enabled -> ShomaraButtonState.Disabled
        pressed -> ShomaraButtonState.Pressed
        focused -> ShomaraButtonState.Focused
        else -> ShomaraButtonState.Default
    }
    val (container, content) = if (state == ShomaraButtonState.Disabled) {
        ShomaraTokens.ColorPrimaryDark to ShomaraTokens.ColorWhite
    } else {
        ShomaraButtonLogic.colors(
            ShomaraButtonVariant.Primary,
            state,
        )
    }
    val depth = ShomaraButtonLogic.clayDepth(ShomaraButtonVariant.Primary, state)
    val semanticsLabel = when (state) {
        ShomaraButtonState.Disabled -> "غیرفعال"
        ShomaraButtonState.Pressed -> "فشرده"
        else -> ""
    }
    // Disabled buttons must not expose an OnClick action to a11y services:
    // Compose's clickable keeps advertising OnClick even when enabled=false,
    // so the quiet state skips the clickable modifier entirely (the same
    // pattern as the page-02 profile CTA).
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
                                onContinue()
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
        Text(
            text = ShomaraOnboardingStrings.Continue,
            style = ShomaraTypography.Title,
            color = content,
            textAlign = TextAlign.Center,
            maxLines = ShomaraButtonLogic.MaxLabelLines,
        )
        // Right-pointing arrow from the owner SVG — the same proportions and
        // placement as the page-01/page-02 CTAs (physical right = layout
        // start in RTL).
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
