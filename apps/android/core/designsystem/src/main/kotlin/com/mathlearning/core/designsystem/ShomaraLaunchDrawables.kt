package com.mathlearning.core.designsystem

/**
 * R drawable ids for the owner-delivered page-01 launch artwork.
 *
 * The 12 transparent RGBA PNGs were delivered by the owner (2026-11-05) for
 * the Welcome screen ONLY, as the hero composition of page 01-launch
 * (design/playbook/IMAGE_REGISTRY.md row P1, status OWNER_DELIVERED).
 *
 * The files live in this module as `drawable-nodpi/shomara_launch_*.png`.
 * They are copied into the repo locally by the harness — see the page-01
 * ASSET_PLACEMENT note — because binary assets cannot be pushed by the
 * snapshot method. Code that references these ids does not compile until
 * the PNGs are copied; that is expected and documented, not a bug.
 *
 * The purple mascot is owner-supplied artwork for this page only. It is
 * NOT part of the [ShomaraCharacter] enum / ADR-0035 approved cast, and
 * must never be reused as a guide or avatar on any other page. The splash
 * artwork (`shomara_splash_artwork.png`) is untouched by this holder.
 *
 * Naming follows the [ShomaraCharacterDrawables] pattern: one object,
 * one val per file, plus [All] for coverage tests.
 */
object ShomaraLaunchDrawables {

    /** Purple blob mascot with a bow (owner-supplied, page 01 only). */
    val MascotBowCharacter: Int = R.drawable.shomara_launch_mascot_bow_character

    /** Three yellow dashes fanning up-right, near the mascot's bow. */
    val TopYellowSpark: Int = R.drawable.shomara_launch_top_yellow_spark

    /** Amber 3D number "1" (upper-left of the hero). */
    val Number1: Int = R.drawable.shomara_launch_number_1

    /** Blue 3D number "2" (upper-right of the hero). */
    val Number2: Int = R.drawable.shomara_launch_number_2

    /** Green 3D plus sign. */
    val PlusSign: Int = R.drawable.shomara_launch_plus_sign

    /** Orange 3D division sign. */
    val DivisionSign: Int = R.drawable.shomara_launch_division_sign

    /** Small yellow four-point shape (`SmallYellowStar`, decorative, part of the hero artwork). */
    val SmallYellowStar: Int = R.drawable.shomara_launch_small_yellow_star

    /** Large yellow four-point shape (`LargeYellowStar`, decorative, part of the hero artwork). */
    val LargeYellowStar: Int = R.drawable.shomara_launch_large_yellow_star

    /** Three yellow dashes fanning up-right (title flanks, right as-is, left mirrored). */
    val BottomYellowSpark: Int = R.drawable.shomara_launch_bottom_yellow_spark

    /** Soft white cloud (used three times on the page). */
    val WhiteCloud: Int = R.drawable.shomara_launch_white_cloud

    /** Green plant, bottom-left of the hero zone (also reused small at screen bottom). */
    val LeftGreenPlant: Int = R.drawable.shomara_launch_left_green_plant

    /** Green plant, bottom-right of the hero zone (also reused small at screen bottom). */
    val RightGreenPlant: Int = R.drawable.shomara_launch_right_green_plant

    /** Every shipped launch drawable, for coverage tests. */
    val All: List<Int> = listOf(
        MascotBowCharacter,
        TopYellowSpark,
        Number1,
        Number2,
        PlusSign,
        DivisionSign,
        SmallYellowStar,
        LargeYellowStar,
        BottomYellowSpark,
        WhiteCloud,
        LeftGreenPlant,
        RightGreenPlant,
    )
}
