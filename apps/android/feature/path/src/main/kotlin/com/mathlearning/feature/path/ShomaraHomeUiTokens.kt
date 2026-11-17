package com.mathlearning.feature.path

import androidx.compose.ui.unit.dp
import com.mathlearning.core.designsystem.ShomaraTokens

/**
 * Screen-local token aliases for the Home/Path screen (handoff v3 design).
 * The COLOR values live in the canonical ShomaraTokens (generated from tokens.json) —
 * this object only provides SHORT NAMES for the handoff's field references.

 */
internal object ShomaraHomeUiTokens {
    val Canvas = ShomaraTokens.ColorHomeCanvas
    val Surface = ShomaraTokens.ColorHomeSurface
    val Ink = ShomaraTokens.ColorHomeInk
    val OnViolet = ShomaraTokens.ColorHomeOnViolet
    val OnVioletMuted = ShomaraTokens.ColorHomeOnVioletMuted
    val AmberInk = ShomaraTokens.ColorHomeAmberInk
    val Muted = ShomaraTokens.ColorHomeMuted
    val Violet = ShomaraTokens.ColorHomeViolet
    val VioletDark = ShomaraTokens.ColorHomeVioletDark
    val VioletSoft = ShomaraTokens.ColorHomeVioletSoft
    val PressedSoft = ShomaraTokens.ColorHomePressedSoft
    val Green = ShomaraTokens.ColorHomeGreen
    val GreenSoft = ShomaraTokens.ColorHomeGreenSoft
    val Amber = ShomaraTokens.ColorHomeAmber
    val Border = ShomaraTokens.ColorHomeBorder

    // Structural dimensions (not colors — these stay local per the handoff spec)
    val CardRadius = ShomaraTokens.RadiusLg
    val ScreenInset = ShomaraTokens.Space20
    val MinTouch = ShomaraTokens.ComponentTouchMin
}
