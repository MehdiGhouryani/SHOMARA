// GENERATED FILE — DO NOT EDIT DIRECTLY.
// Source of truth: packages/design-system/src/tokens.json (v2 block, canonical per ADR-0037 L6).
// Regenerate with: node tools/token-codegen/generate.mjs   (drift gate: node tools/token-codegen/generate.mjs --check)

package com.mathlearning.core.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Canonical v2 design tokens for the Native client (UI/UX Generation V2, owner decision D-021).
 * Semantic mapping (theme slots, clay tiers) happens in ShomaraTheme (N03-02) and components;
 * feature code must consume these values and never hardcode hex, sizes or durations.
 */
object ShomaraTokens {
  val ColorCanvas = Color(0xFFFFF8EF)
  val ColorSurface = Color(0xFFFFFFFF)
  val ColorSurfaceAlt = Color(0xFFFDF3E3)
  val ColorPrimary = Color(0xFF0C7A54)
  val ColorPrimarySoft = Color(0xFFDDF2E7)
  val ColorPrimaryDark = Color(0xFF0A5C41)
  val ColorAmber = Color(0xFFFFB020)
  val ColorAmberSoft = Color(0xFFFFF1D6)
  val ColorAmberInk = Color(0xFF4A2E00)
  val ColorBerry = Color(0xFFC13A7C)
  val ColorBerrySoft = Color(0xFFFBE3F0)
  val ColorBerryDark = Color(0xFF9E2B60)
  val ColorSky = Color(0xFF1D6FA8)
  val ColorSkySoft = Color(0xFFE1F0FA)
  val ColorInk = Color(0xFF15302B)
  val ColorInk2 = Color(0xFF44594F)
  val ColorMuted = Color(0xFF5E6F68)
  val ColorLine = Color(0xFFE7DED1)
  val ColorLine2 = Color(0xFFD6CCBD)
  val ColorEdge = Color(0xFFD8CDBB)
  val ColorWhite = Color(0xFFFFFFFF)
  val ColorDanger = Color(0xFFB3402F)
  val ColorDangerSoft = Color(0xFFFBE7E2)
  val ColorAmberEdge = Color(0xFFD89513)
  val TypeDisplayFontSize = 32.sp
  val TypeDisplayLineHeight = 40.sp
  val TypeDisplayWeight = FontWeight(800)
  val TypeTitleFontSize = 22.sp
  val TypeTitleLineHeight = 30.sp
  val TypeTitleWeight = FontWeight(800)
  val TypeBodyFontSize = 17.sp
  val TypeBodyLineHeight = 26.sp
  val TypeBodyWeight = FontWeight(600)
  val TypeCaptionFontSize = 13.sp
  val TypeCaptionLineHeight = 20.sp
  val TypeCaptionWeight = FontWeight(700)
  val TypeBignumFontSize = 40.sp
  val TypeBignumLineHeight = 44.sp
  val TypeBignumWeight = FontWeight(800)
  val Space4 = 4.dp
  val Space8 = 8.dp
  val Space12 = 12.dp
  val Space16 = 16.dp
  val Space20 = 20.dp
  val Space24 = 24.dp
  val Space32 = 32.dp
  val Space40 = 40.dp
  val RadiusSm = 12.dp
  val RadiusMd = 18.dp
  val RadiusLg = 24.dp
  val RadiusXl = 32.dp
  val RadiusPill = 999.dp
  val MotionDurationFast = 120 // ms
  val MotionDurationBase = 220 // ms
  val MotionDurationSlow = 340 // ms
  val MotionSpringDamping = 14
  val MotionSpringStiffness = 220
  val MotionSpringMass = 1
  val MotionPressScale = 0.96
  val ShadowColor = Color(0xFF15302B)
  val ShadowOpacity = 0.1
  val ShadowOffsetY = 4.dp
  val ComponentTouchMin = 48.dp
  val ComponentButtonH = 56.dp
  val ComponentNodeSize = 72.dp
  val ComponentNodeCurrent = 84.dp
  val ComponentEdge = 4.dp
  val ComponentTrayBead = 48.dp
  val ComponentProgressH = 14.dp
  val ComponentRowH = 72.dp
  val ComponentTopBarH = 56.dp
  val ClayLevelFlat = 0
  val ClayLevelHint = 1
  val ClayLevelSoft = 2
  val ClayLevelFeatured = 3
  val ClaySoftBorderWidth = 1.5.dp
  val ClaySoftShadowOpacity = 0.08
  val ClaySoftShadowRadius = 10.dp
  val ClaySoftShadowOffsetY = 5.dp
  val ClaySoftHighlightOpacity = 0.68
  val ClaySoftHighlightThickness = 1.dp
  val ClaySoftElevation = 2.dp
  val ClayFeaturedBorderWidth = 3.dp
  val ClayFeaturedShadowOpacity = 0.12
  val ClayFeaturedShadowRadius = 10.dp
  val ClayFeaturedShadowOffsetY = 6.dp
  val ClayFeaturedHighlightOpacity = 0.68
  val ClayFeaturedHighlightThickness = 1.dp
  val ClayFeaturedElevation = 4.dp
  val ClayAnswerTileMinHeight = 64.dp
  val ClayAnswerTileBorderWidth = 2.dp
}
