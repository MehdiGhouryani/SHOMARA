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
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
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
            verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space16),
        ) {
            // Section header above the card; the field keeps its own persistent label inside.
            // Batch 2: the section title is a TalkBack heading, like every
            // other screen title in the flow.
            Text(text = title, style = ShomaraTypography.Title, color = ShomaraTokens.ColorInk, modifier = Modifier.semantics { heading() })
            ShomaraCard {
                Column(verticalArrangement = Arrangement.spacedBy(ShomaraTokens.Space12)) {
                    // F-27: the welcome body line lived inside the phone card too — the same
                    // sentence twice on one screen. It stays on the welcome screen only.
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
        ShomaraButton(
            text = ShomaraOnboardingStrings.Continue,
            onClick = {
                val canonical = ShomaraPhoneLogic.canonical(phone)
                if (canonical != null) onContinue(canonical)
            },
            enabled = canContinue,
            variant = ShomaraButtonVariant.Primary,
            modifier = Modifier.fillMaxWidth(),
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
