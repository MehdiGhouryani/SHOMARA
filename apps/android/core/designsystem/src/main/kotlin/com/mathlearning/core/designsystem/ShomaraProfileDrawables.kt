package com.mathlearning.core.designsystem

/**
 * R drawable ids for the owner-delivered page-02 profile artwork.
 *
 * The mascot WebP was delivered by the owner (2026-11-06) for the profile
 * step ONLY, as the hero of page 02-profile (design/playbook/IMAGE_REGISTRY.md
 * row P9, status OWNER_DELIVERED). The 16 SVGs from the same pack are NOT
 * binaries: they were transcribed to Compose paths in
 * [ShomaraProfileShapes] (feature:onboarding), so no vector files are needed.
 *
 * The file lives in this module as
 * `drawable-nodpi/shomara_profile_mascot_with_bow.webp`. It is copied into
 * the repo locally by the harness — see the page-02 ASSET_PLACEMENT note —
 * because binary assets cannot be pushed by the snapshot method. Code that
 * references this id does not compile until the WebP is copied; that is
 * expected and documented, not a bug.
 *
 * The purple mascot is owner-supplied artwork for the onboarding pages. It
 * is NOT part of the [ShomaraCharacter] enum / ADR-0035 approved cast, and
 * must never be reused as a guide or avatar on any other page. The same
 * character in its standing pose (page 01) is `shomara_launch_mascot_bow_character`
 * in [ShomaraLaunchDrawables]; this file is the peeking pose, used as-is,
 * never layered with the separate bow file (`03-bow.webp`, not shipped).
 *
 * Naming follows the [ShomaraCharacterDrawables] pattern: one object, one
 * val per file, plus [All] for coverage tests.
 */
object ShomaraProfileDrawables {

    /** Purple blob mascot with a bow, peeking pose (owner-supplied, page 02 only). */
    val MascotWithBow: Int = R.drawable.shomara_profile_mascot_with_bow

    /** Every shipped profile drawable, for coverage tests. */
    val All: List<Int> = listOf(
        MascotWithBow,
    )
}
