package com.mathlearning.app.di

import com.mathlearning.feature.lesson.ShomaraDiscoverCard
import com.mathlearning.feature.lesson.ShomaraDiscoverStep

/**
 * DEBUG variant wiring (N08R-08): the ST07 pilot's P1 discover steps in their DRAFT
 * published-projection shape (see content-library/originals/shomara-stage7-pilot-ST07.md §2)
 * mounted ONLY for on-device design review of the Teach/Discover experience.
 *
 * Hard rules this wiring honours:
 *  - DRAFT, SOURCE_ONLY content: nothing here is "enabled" — no evaluation, no progression,
 *    no answer/correctness field exists in the projection (CONTENT-008 boundary);
 *  - the OBJ/GLYPH/audio assets are NOT delivered (CONTENT-009/006), so the renderer shows
 *    neutral placeholders and stays silent — nothing is faked;
 *  - the release counterpart of this object returns an empty list, so a release build has
 *    no discover content to reach (fail-closed, same pattern as the simulated OTP wiring).
 */
object LessonContentWiring {
    const val IsDebugBuild: Boolean = true

    val discoverSteps: List<ShomaraDiscoverStep> = listOf(
        ShomaraDiscoverStep(
            stepId = "ST07.P1.s01",
            cards = listOf(
                ShomaraDiscoverCard(assetId = "OBJ.sun", labelAudioId = "ST07.P1.s01.a"),
                ShomaraDiscoverCard(assetId = "OBJ.house", labelAudioId = "ST07.P1.s01.b"),
                ShomaraDiscoverCard(assetId = "OBJ.tree", labelAudioId = "ST07.P1.s01.c"),
            ),
            countPerCard = 1,
            revealGlyphAssetId = "GLYPH.1",
            promptAudioId = "ST07.P1.s01.pr",
            doneAudioId = "ST07.P1.s01.done",
        ),
        ShomaraDiscoverStep(
            stepId = "ST07.P1.s02",
            cards = listOf(
                ShomaraDiscoverCard(assetId = "OBJ.eyes", labelAudioId = "ST07.P1.s02.a"),
                ShomaraDiscoverCard(assetId = "OBJ.shoes", labelAudioId = "ST07.P1.s02.b"),
                ShomaraDiscoverCard(assetId = "OBJ.wheels", labelAudioId = "ST07.P1.s02.c"),
            ),
            countPerCard = 2,
            revealGlyphAssetId = "GLYPH.2",
            promptAudioId = "ST07.P1.s02.pr",
            doneAudioId = "ST07.P1.s02.done",
        ),
    )
}
