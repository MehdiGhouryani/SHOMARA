package com.mathlearning.core.designsystem

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

/**
 * ShomaraTheme (N03-02): semantic mapping of the canonical v2 tokens generated into
 * [ShomaraTokens]. Every value below resolves through ShomaraTokens — feature code never
 * hardcodes hex, sizes or durations (AGENTS §3.10, design/MASTER.md §2).
 */

/** Clay depth tiers from design/MASTER.md §2; at most one [ShomaraClayDepth.Featured] surface per viewport. */
enum class ShomaraClayDepth { Flat, Hint, Soft, Featured }

@Immutable
data class ShomaraClaySpec(
    val borderWidth: Dp,
    val shadowOpacity: Float,
    val shadowRadius: Dp,
    val shadowOffsetY: Dp,
    val highlightOpacity: Float,
    val highlightThickness: Dp,
    val elevation: Dp,
)

/** Clay color pairing is fixed by the token note: soft fill=surface/border=line, featured fill=amberSoft/border=amber, highlight=white. */
object ShomaraClayColors {
    val Highlight: Color = ShomaraTokens.ColorWhite
    fun fillFor(depth: ShomaraClayDepth): Color = when (depth) {
        ShomaraClayDepth.Featured -> ShomaraTokens.ColorAmberSoft
        else -> ShomaraTokens.ColorSurface
    }
    fun borderFor(depth: ShomaraClayDepth): Color = when (depth) {
        ShomaraClayDepth.Featured -> ShomaraTokens.ColorAmber
        else -> ShomaraTokens.ColorLine
    }
}

/** Semantic clay specs derived only from the generated clay tokens. */
object ShomaraClay {
    val Flat: ShomaraClaySpec = ShomaraClaySpec(
        borderWidth = 0.dp,
        shadowOpacity = 0f,
        shadowRadius = 0.dp,
        shadowOffsetY = 0.dp,
        highlightOpacity = 0f,
        highlightThickness = 0.dp,
        elevation = ShomaraTokens.ClayLevelFlat.dp,
    )
    val Hint: ShomaraClaySpec = Flat.copy(elevation = ShomaraTokens.ClayLevelHint.dp)
    val Soft: ShomaraClaySpec = ShomaraClaySpec(
        borderWidth = ShomaraTokens.ClaySoftBorderWidth,
        shadowOpacity = ShomaraTokens.ClaySoftShadowOpacity.toFloat(),
        shadowRadius = ShomaraTokens.ClaySoftShadowRadius,
        shadowOffsetY = ShomaraTokens.ClaySoftShadowOffsetY,
        highlightOpacity = ShomaraTokens.ClaySoftHighlightOpacity.toFloat(),
        highlightThickness = ShomaraTokens.ClaySoftHighlightThickness,
        elevation = ShomaraTokens.ClayLevelSoft.dp,
    )
    val Featured: ShomaraClaySpec = ShomaraClaySpec(
        borderWidth = ShomaraTokens.ClayFeaturedBorderWidth,
        shadowOpacity = ShomaraTokens.ClayFeaturedShadowOpacity.toFloat(),
        shadowRadius = ShomaraTokens.ClayFeaturedShadowRadius,
        shadowOffsetY = ShomaraTokens.ClayFeaturedShadowOffsetY,
        highlightOpacity = ShomaraTokens.ClayFeaturedHighlightOpacity.toFloat(),
        highlightThickness = ShomaraTokens.ClayFeaturedHighlightThickness,
        elevation = ShomaraTokens.ClayLevelFeatured.dp,
    )

    fun specFor(depth: ShomaraClayDepth): ShomaraClaySpec = when (depth) {
        ShomaraClayDepth.Flat -> Flat
        ShomaraClayDepth.Hint -> Hint
        ShomaraClayDepth.Soft -> Soft
        ShomaraClayDepth.Featured -> Featured
    }
}

/**
 * Vazirmatn is the interface typeface (design/MASTER.md §2). No Vazirmatn font binaries are
 * committed to this repository and external downloads are forbidden (ADR-0037 L10), so until
 * the owner provides approved TTF assets the family resolves to [FontFamily.Default] with the
 * token-driven weights. This is a recorded pending-owner-input, not a substitute typeface choice.
 */
object ShomaraTypography {
    val Family: FontFamily = FontFamily.Default

    val Display: TextStyle = TextStyle(
        fontFamily = Family,
        fontWeight = ShomaraTokens.TypeDisplayWeight,
        fontSize = ShomaraTokens.TypeDisplayFontSize,
        lineHeight = ShomaraTokens.TypeDisplayLineHeight,
    )
    val Title: TextStyle = TextStyle(
        fontFamily = Family,
        fontWeight = ShomaraTokens.TypeTitleWeight,
        fontSize = ShomaraTokens.TypeTitleFontSize,
        lineHeight = ShomaraTokens.TypeTitleLineHeight,
    )
    val Body: TextStyle = TextStyle(
        fontFamily = Family,
        fontWeight = ShomaraTokens.TypeBodyWeight,
        fontSize = ShomaraTokens.TypeBodyFontSize,
        lineHeight = ShomaraTokens.TypeBodyLineHeight,
    )
    val Caption: TextStyle = TextStyle(
        fontFamily = Family,
        fontWeight = ShomaraTokens.TypeCaptionWeight,
        fontSize = ShomaraTokens.TypeCaptionFontSize,
        lineHeight = ShomaraTokens.TypeCaptionLineHeight,
    )
    val BigNum: TextStyle = TextStyle(
        fontFamily = Family,
        fontWeight = ShomaraTokens.TypeBignumWeight,
        fontSize = ShomaraTokens.TypeBignumFontSize,
        lineHeight = ShomaraTokens.TypeBignumLineHeight,
    )

    val Material: Typography = Typography(
        displayLarge = Display,
        displaySmall = Display,
        titleLarge = Title,
        titleMedium = Title,
        bodyLarge = Body,
        bodyMedium = Body,
        labelSmall = Caption,
        labelLarge = Caption,
    )
}

/** Corner shapes derived only from the generated radius tokens. */
object ShomaraShapes {
    val Small = RoundedCornerShape(ShomaraTokens.RadiusSm)
    val Medium = RoundedCornerShape(ShomaraTokens.RadiusMd)
    val Large = RoundedCornerShape(ShomaraTokens.RadiusLg)
    val ExtraLarge = RoundedCornerShape(ShomaraTokens.RadiusXl)
    val Pill = RoundedCornerShape(ShomaraTokens.RadiusPill)

    val Material: Shapes = Shapes(
        extraSmall = Small,
        small = Small,
        medium = Medium,
        large = Large,
        extraLarge = ExtraLarge,
    )
}

/**
 * Direction semantics: the interface is Persian (RTL) while math content (number lines,
 * inequalities, arithmetic order, meaningful geometry) keeps LTR geometry (design/MASTER.md §6).
 * Components render in the interface direction by default and opt into math LTR explicitly.
 */
object ShomaraDirections {
    val DefaultInterfaceDirection: LayoutDirection = LayoutDirection.Rtl
    val DefaultMathDirection: LayoutDirection = LayoutDirection.Ltr
}

val LocalShomaraInterfaceDirection = staticCompositionLocalOf { ShomaraDirections.DefaultInterfaceDirection }
val LocalShomaraMathDirection = staticCompositionLocalOf { ShomaraDirections.DefaultMathDirection }

/**
 * Material3 light scheme mapped slot-by-slot from the generated v2 tokens. Mapping policy:
 * brand/action=primary, personality=secondary(berry), information=tertiary(sky), error=danger;
 * containers use the matching Soft tokens; text uses ink/ink2/muted; hairlines use line.
 */
object ShomaraColorScheme {
    val Light: ColorScheme = lightColorScheme(
        primary = ShomaraTokens.ColorPrimary,
        onPrimary = ShomaraTokens.ColorWhite,
        primaryContainer = ShomaraTokens.ColorPrimarySoft,
        onPrimaryContainer = ShomaraTokens.ColorPrimaryDark,
        secondary = ShomaraTokens.ColorBerry,
        onSecondary = ShomaraTokens.ColorWhite,
        secondaryContainer = ShomaraTokens.ColorBerrySoft,
        onSecondaryContainer = ShomaraTokens.ColorBerryDark,
        tertiary = ShomaraTokens.ColorSky,
        onTertiary = ShomaraTokens.ColorWhite,
        tertiaryContainer = ShomaraTokens.ColorSkySoft,
        onTertiaryContainer = ShomaraTokens.ColorSky,
        error = ShomaraTokens.ColorDanger,
        onError = ShomaraTokens.ColorWhite,
        errorContainer = ShomaraTokens.ColorDangerSoft,
        onErrorContainer = ShomaraTokens.ColorDanger,
        background = ShomaraTokens.ColorCanvas,
        onBackground = ShomaraTokens.ColorInk,
        surface = ShomaraTokens.ColorSurface,
        onSurface = ShomaraTokens.ColorInk,
        surfaceVariant = ShomaraTokens.ColorSurfaceAlt,
        onSurfaceVariant = ShomaraTokens.ColorInk2,
        outline = ShomaraTokens.ColorLine,
        outlineVariant = ShomaraTokens.ColorLine2,
        inverseSurface = ShomaraTokens.ColorInk,
        inverseOnSurface = ShomaraTokens.ColorWhite,
    )
}

/**
 * N08-03 P0 fix: the interface direction is pinned RTL at the ROOT composition, independent of the
 * device locale. Before this, `ShomaraTheme` only called MaterialTheme, so on an en-US device the
 * whole app rendered LTR — `android:supportsRtl="true"` merely means the app *respects* the device
 * direction, it does not make a Persian product RTL. Persian is the product language (AGENTS §3.7),
 * so the shell, navigation, tab order and row layout must be RTL on every device.
 *
 * Math content stays LTR: components that carry mathematical meaning opt in explicitly via
 * [ShomaraManipulativeRules.mathDirection] / `CompositionLocalProvider`, never by inheriting this.
 */
@Composable
fun ShomaraTheme(content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalLayoutDirection provides ShomaraDirections.DefaultInterfaceDirection,
        LocalShomaraInterfaceDirection provides ShomaraDirections.DefaultInterfaceDirection,
        LocalShomaraMathDirection provides ShomaraDirections.DefaultMathDirection,
    ) {
        MaterialTheme(
            colorScheme = ShomaraColorScheme.Light,
            typography = ShomaraTypography.Material,
            shapes = ShomaraShapes.Material,
            content = content,
        )
    }
}
