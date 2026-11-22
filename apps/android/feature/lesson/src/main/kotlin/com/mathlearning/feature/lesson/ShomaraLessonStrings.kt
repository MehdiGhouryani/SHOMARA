package com.mathlearning.feature.lesson

import com.mathlearning.core.designsystem.ShomaraDigits

/**
 * S0 (STATION_EXPERIENCE_BLUEPRINT §1, finding A3): the ONE canonical list of every Persian
 * sentence the lesson surface renders. Before this object, child-facing copy was scattered as
 * inline literals across the host, guided and discover composables, so it could not be reviewed
 * as a set, asserted from a test, or reworded without a code hunt (AGENTS §10).
 *
 * Wording policy: this is a MOVE of the existing words plus the new exit-sheet copy from the
 * blueprint (§2.1) — no opportunistic rewrites. Formatted strings are pure functions so tests
 * can assert them. Stage names stay owned by [ShomaraLessonStageLabels] (display) and are only
 * REFERENCED here; they are not duplicated.
 */
object ShomaraLessonStrings {
    // ------------------------------------------------------------------ exit sheet (§2.1)
    /** Exit icon spoken label (TopBar). */
    const val ExitContentDescription: String = "خروج از ایستگاه"

    /** Sheet heading — a question, not a verdict. */
    const val ExitTitle: String = "بازی را رها می‌کنی؟"

    /** Sheet body — the promise that makes staying safe and leaving safe. */
    const val ExitBody: String = "جای تو همین‌جا ذخیره می‌شود."

    /** The PRIMARY action of the sheet: staying is always the easiest choice for a child. */
    const val ExitStayPrimary: String = "ادامه می‌دهم"

    /** The secondary action — a plain text button, never the big one. */
    const val ExitSecondary: String = "خروج به نقشه"

    /** Extra warning only while the quiet assessment stage is running (blueprint §2.1). */
    const val ExitAssessmentWarning: String = "این آزمون کوتاه است؛ با خروج از اول شروع می‌شود."

    // ------------------------------------------------------------------ stage chips (§2.2)
    /** Spoken ordinal of the five macro stages (no numerals on the chip row itself). */
    private val stageOrdinalFa = listOf("اول", "دوم", "سوم", "چهارم", "پنجم")

    /** «مرحلهٔ دوم از پنج: تمرین هدایت‌شده» — one TalkBack stop for the whole chip row. */
    fun stageChipsAnnouncement(stageIndex: Int, stageLabel: String): String =
        "مرحلهٔ " + stageOrdinalFa[stageIndex.coerceIn(0, 4)] + " از پنج: " + stageLabel

    // ------------------------------------------------------------------ shared CTA copy
    const val Continue: String = "ادامه"
    const val Check: String = "بررسی"
    const val SubmitAnswer: String = "ثبت پاسخ"
    const val PreviewEnd: String = "این پیش‌نمایش همین‌جا تمام می‌شود؛ ادامهٔ درس به‌زودی فعال می‌شود."

    // ------------------------------------------------------------------ host status copy
    const val GatewayMissing: String = "سرور آموزش هنوز وصل نیست؛ درس به‌زودی فعال می‌شود."
    const val AwaitingServer: String = "منتظر تأیید سرور هستیم؛ همین‌جا می‌مانیم."
    const val Resumed: String = "از همون‌جا ادامه می‌دهیم."
    const val OptionsUnavailable: String = "گزینه‌های این تمرین هنوز از سرور نیامده‌اند؛ به‌زودی فعال می‌شود."
    const val SyncingWithServer: String = "در حال همگام‌سازی با سرور"

    fun progressStepAnnouncement(stepIndex: Int, totalSteps: Int): String =
        "گام " + ShomaraDigits.toFa(stepIndex) + " از " + ShomaraDigits.toFa(totalSteps)

    // ------------------------------------------------------------------ guided option copy
    const val SelectedState: String = "انتخاب شد"
    const val UnselectedState: String = "انتخاب نشده"

    fun numeralOptionLabel(value: Int): String = "عدد " + ShomaraDigits.toFa(value)

    fun picturesOptionLabel(count: Int): String = ShomaraDigits.toFa(count) + " شیء"

    /** The visible selection mark beyond colour (ADR-0040); a glyph, not copy, but owned here. */
    const val SelectedMarkGlyph: String = "✓"

    // ------------------------------------------------------------------ discover copy
    fun countObjectLabel(ordinal: Int): String = "شیء شمارش " + ShomaraDigits.toFa(ordinal)

    const val CountedState: String = "شمرده شد"
    const val NotCountedState: String = "لمس نکرده"

    // ------------------------------------------------------------------ S5 celebration copy
    /** The only mark the celebration may show (stage5: the check mark and the retry arrow). */
    const val CelebrationMark: String = "✓"
    const val IntroCardHint: String = "برای شروع، یک بار ضربه بزن"

    // ------------------------------------------------------------------ S4 audio + hint copy
    /** «دوباره بشنو» — replay is a hearing aid, so the label states the action, not a penalty. */
    const val ReplayNarration: String = "دوباره بشنو"
    const val ReplayNarrationState: String = "پرسش دوباره خوانده می‌شود"
    /** The hint control names what it gives («یک راهنما»), never what the child failed at. */
    const val HintRequest: String = "یک راهنما"
    const val HintRequestState: String = "راهنما نمایش داده می‌شود"
    /** Silence is announced too: no sound is not the same as a broken button. */
    const val AudioSilentState: String = "این ایستگاه صدا ندارد"

    // ------------------------------------------------------------------ skeleton region labels
    // Owned here since S0 so the whole lesson copy is one reviewable list; the skeleton's own
    // label object delegates to these constants (wording unchanged — a move, not an edit).
    const val OptionsPlaceholder: String = "جای گزینه‌ها"
    const val AnswerPlaceholder: String = "جای پاسخ"
    const val PatternPlaceholder: String = "جای الگو"
    const val OptionTray: String = "سینی گزینه‌ها"
    const val NumberLinePlaceholder: String = "محل نوشتن مسیر"
}
