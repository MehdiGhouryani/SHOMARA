package com.mathlearning.app.di

import com.mathlearning.feature.lesson.ShomaraDiscoverCard
import com.mathlearning.feature.lesson.ShomaraDiscoverStep
import com.mathlearning.feature.lesson.ShomaraGuidedEvaluator
import com.mathlearning.feature.lesson.ShomaraGuidedItem
import com.mathlearning.feature.lesson.ShomaraGuidedOption
import com.mathlearning.feature.lesson.ShomaraGuidedOptionDisplay

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

    // N08R-09: the ST07 P2 guided items in their DRAFT child-projection shape — the four
    // T15 choice items only (trace T13 and tray T01 need stroke/tray evaluation, recorded
    // as gaps). The DRAFT answers live HERE, in the debug evaluator layer — never in the
    // projection models — exactly as ADR-0039 §2 demands for the local evaluator.
    val guidedItems: List<ShomaraGuidedItem> = listOf(
        ShomaraGuidedItem(
            itemId = "ST07.P2.i01",
            promptText = "چند توپ می‌بینی؟ جواب را انتخاب کن.",
            stimulusObjectKind = "OBJ.ball",
            stimulusCount = 1,
            options = listOf(
                ShomaraGuidedOption("i01.opt1", ShomaraGuidedOptionDisplay.Numeral(1)),
                ShomaraGuidedOption("i01.opt2", ShomaraGuidedOptionDisplay.Numeral(2)),
            ),
            hintTexts = listOf("به شکل‌ها نگاه کن و مقایسه کن.", "یکی از گزینه‌ها کنار رفت.", "ببین؛ این گزینه درست است."),
            okText = "همین‌طور است؛ یک توپ.",
            retryText = "یک بار دیگر امتحان کنیم.",
        ),
        ShomaraGuidedItem(
            itemId = "ST07.P2.i02",
            promptText = "چند کفش می‌بینی؟ جواب را انتخاب کن.",
            stimulusObjectKind = "OBJ.shoe",
            stimulusCount = 2,
            options = listOf(
                ShomaraGuidedOption("i02.opt1", ShomaraGuidedOptionDisplay.Numeral(1)),
                ShomaraGuidedOption("i02.opt2", ShomaraGuidedOptionDisplay.Numeral(2)),
            ),
            hintTexts = listOf("به شکل‌ها نگاه کن و مقایسه کن.", "یکی از گزینه‌ها کنار رفت.", "ببین؛ این گزینه درست است."),
            okText = "همین‌طور است؛ دو کفش.",
            retryText = "بیا دوباره نگاه کنیم.",
        ),
        ShomaraGuidedItem(
            itemId = "ST07.P2.i05",
            promptText = "کدام کارت دو گل دارد؟",
            stimulusObjectKind = "OBJ.flower",
            stimulusCount = 2,
            options = listOf(
                ShomaraGuidedOption("i05.opt1", ShomaraGuidedOptionDisplay.Pictures("OBJ.flower", 1)),
                ShomaraGuidedOption("i05.opt2", ShomaraGuidedOptionDisplay.Pictures("OBJ.flower", 2)),
                ShomaraGuidedOption("i05.opt3", ShomaraGuidedOptionDisplay.Pictures("OBJ.flower", 3)),
            ),
            hintTexts = listOf("به شکل‌ها نگاه کن و مقایسه کن.", "یکی از گزینه‌ها کنار رفت.", "ببین؛ این گزینه درست است."),
            okText = "دقیق بود؛ دو گل.",
            retryText = "کمی دقیق‌تر نگاه کن.",
        ),
        ShomaraGuidedItem(
            itemId = "ST07.P2.i06",
            promptText = "کدام کارت یک ماهی دارد؟",
            stimulusObjectKind = "OBJ.fish",
            stimulusCount = 1,
            options = listOf(
                ShomaraGuidedOption("i06.opt1", ShomaraGuidedOptionDisplay.Pictures("OBJ.fish", 2)),
                ShomaraGuidedOption("i06.opt2", ShomaraGuidedOptionDisplay.Pictures("OBJ.fish", 1)),
                ShomaraGuidedOption("i06.opt3", ShomaraGuidedOptionDisplay.Pictures("OBJ.fish", 3)),
            ),
            hintTexts = listOf("به شکل‌ها نگاه کن و مقایسه کن.", "یکی از گزینه‌ها کنار رفت.", "ببین؛ این گزینه درست است."),
            okText = "خوب فکر کردی؛ یک ماهی.",
            retryText = "یک بار دیگر امتحان کنیم.",
        ),
    )

    /**
     * The DEBUG draft evaluator: it alone knows the draft answers (from the pilot's
     * `correct:`/`answer.value:` fields). Wrong answers NEVER fail — they return Retry
     * (with the ladder level the item may show), and the child re-counts the same scene.
     */
    val guidedEvaluator: ShomaraGuidedEvaluator = object : ShomaraGuidedEvaluator {
        private val draftAnswers = mapOf(
            "ST07.P2.i01" to "i01.opt1",
            "ST07.P2.i02" to "i02.opt2",
            "ST07.P2.i05" to "i05.opt2",
            "ST07.P2.i06" to "i06.opt2",
        )

        override fun evaluate(itemId: String, chosenOptionId: String): ShomaraGuidedEvaluator.Outcome {
            val correct = draftAnswers[itemId] ?: error("draft evaluator lacks $itemId")
            return if (chosenOptionId == correct) {
                ShomaraGuidedEvaluator.Outcome.Correct
            } else {
                ShomaraGuidedEvaluator.Outcome.Retry(hintLevelShown = null)
            }
        }
    }

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
