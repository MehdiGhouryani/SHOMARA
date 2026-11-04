package com.mathlearning.core.designsystem

/**
 * R drawable ids for the approved character artwork shipped with the design system.
 *
 * A generated R class cannot be referenced from the design system for poses that are only
 * conditionally relevant, so this file is the single, explicit whitelist: the set of character
 * images that exist as committed drawables. `ShomaraCharacterPoses.assetPath` derives the pose
 * catalogue from the design handoff, while `ShomaraCharacterDrawables` proves which of those
 * actual files were shipped. A pose present in the handoff but not shipped renders the honest
 * missing-art placeholder ([ShomaraCharacterImage]).
 *
 * Files (lossless copies of the approved WebP artwork, `drawable-nodpi/`):
 *  - shomara_char_number_01.webp  ← Number/Number_01_front_app_800.webp
 *  - shomara_char_number_17.webp  ← Number/Number_17_pose_pointing_app_800.webp
 *  - shomara_char_main_01.webp    ← Main/Main_01_front_app_800.webp
 *  - shomara_char_main_10.webp    ← Main/Main_10_pose_wave_app_800.webp
 */
object ShomaraCharacterDrawables {
    val Number01: Int = R.drawable.shomara_char_number_01
    val Number17: Int = R.drawable.shomara_char_number_17
    val Main01: Int = R.drawable.shomara_char_main_01
    val Main10: Int = R.drawable.shomara_char_main_10

    /** Every shipped character drawable, for coverage tests. */
    val All: List<Int> = listOf(Number01, Number17, Main01, Main10)

    /**
     * The drawable for one approved pose, or null when the handoff catalog knows the pose but this
     * build shipped no artwork for it. Null is an honest answer; the caller shows a placeholder.
     */
    fun poseFor(character: ShomaraCharacter, poseId: Int): Int? = when (character) {
        ShomaraCharacter.Number -> when (poseId) {
            1 -> Number01
            17 -> Number17
            else -> null
        }
        ShomaraCharacter.Main -> when (poseId) {
            1 -> Main01
            10 -> Main10
            else -> null
        }
    }
}
