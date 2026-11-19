package com.mathlearning.feature.onboarding

import com.mathlearning.core.designsystem.ShomaraDigits

/** Profile/placement copy seeds (warm, actionable; caller may override from the canonical source). */
object ShomaraProfileStrings {
    const val NameLabel: String = "نام کودک"
    const val NameHint: String = "مثلاً آریا"
    const val NameInvalid: String = "نام را کوتاه و بدون عدد وارد کن."
    /** Page 02-profile title (owner-supplied, 2026-11-06; replaces PlacementTitle on this page only). */
    const val ProfileTitle: String = "نام کودک را وارد کنید"
    /** Page 02-profile grade section title (owner-supplied, 2026-11-06). */
    const val GradeSectionTitle: String = "پایه تحصیلی را انتخاب کنید"
    const val GradeOne: String = "پایه اول ابتدایی"
    /** Page 02-profile CTA label (owner-supplied, 2026-11-06; replaces «ذخیره» as the button text). */
    const val Continue: String = "ادامه"
    const val SaveFailed: String = "ذخیره نشد؛ دوباره تلاش می‌کنیم."
    const val SaveRetry: String = "ذخیره نشد؛ یک بار دیگر امتحان کن."
    const val PlacementSkip: String = "فعلاً رد می‌کنم"
    const val PlacementPending: String = "در حال آماده‌سازی نقطهٔ شروع…"
    const val PlacementTitle: String = "نقطهٔ شروع را پیدا کنیم"
    /** DT-75: primary CTA once a local placement decision exists (offline-first, ADR-0039). */
    const val PlacementStart: String = "شروع مسیر"
    /** DT-75: the locally resolved start point copy (the chosen grade's beginning). */
    val PlacementLocalStartTemplate: String = "از ابتدای مسیر %s شروع می‌کنیم"
}

/** Pure save reducer: bounded warm retries, state kept verbatim for resubmission. */
data class ShomaraProfileSaveState(
    val draft: ShomaraProfileDraft = ShomaraProfileDraft(),
    val inFlight: Boolean = false,
    val failureMessage: String? = null,
    val attempt: Int = 0,
    val saved: Boolean = false,
) {
    val canSubmit: Boolean
        get() = !inFlight && !saved && draft.canSave

    fun startSave(): ShomaraProfileSaveState {
        require(canSubmit) { "save started from an invalid state" }
        return copy(inFlight = true, failureMessage = null)
    }

    fun onSaveSuccess(): ShomaraProfileSaveState = copy(inFlight = false, saved = true, failureMessage = null)

    fun onSaveFailure(retryable: Boolean = true): ShomaraProfileSaveState = copy(
        inFlight = false,
        attempt = attempt + 1,
        failureMessage = if (retryable && attempt + 1 > 1) ShomaraProfileStrings.SaveRetry else ShomaraProfileStrings.SaveFailed,
    )

    companion object {
        /** Restart resume (N04-04): a saved incomplete draft re-enters with Resume semantics. */
        fun resumed(draft: ShomaraProfileDraft): ShomaraProfileSaveState = ShomaraProfileSaveState(draft = draft)
    }

    /** Deterministic Persian progress note for TalkBack. */
    fun announcement(): String = when {
        saved -> "ذخیره شد"
        inFlight -> "در حال ذخیره"
        failureMessage != null -> failureMessage!!
        else -> ""
    }

    fun attemptFa(): String = ShomaraDigits.toFa(attempt)
}

/**
 * Grade placement (DT-75, revision of the server-authoritative note).
 *
 * The original contract waited for a server decision that no endpoint has ever produced, which
 * made `isPending` an infinite spinner (AGENTS §6 violation) and — in a release build with no
 * skip affordance — a permanent dead end between the profile step and the child shell. ADR-0039
 * governs here: the child's path has NO network dependency, so placement resolves LOCALLY.
 *
 * The local resolution is not a guess of mastery (that stays with the versioned local evaluator):
 * it reads the grade the child explicitly picked in the profile step and starts at that grade's
 * beginning — exactly what the domain's fresh/noCurrent state already renders. A server decision,
 * if one ever exists, still wins: `withServerDecision` remains the explicit override.
 */
data class ShomaraPlacementState(
    val serverDecision: String? = null,
    val skippedByUser: Boolean = false,
) {
    init {
        require(!(serverDecision != null && skippedByUser)) { "a skipped placement has no server decision" }
    }

    val isPending: Boolean
        get() = serverDecision == null && !skippedByUser

    val isSkipped: Boolean
        get() = skippedByUser

    val hasDecision: Boolean
        get() = serverDecision != null

    fun withServerDecision(decision: String): ShomaraPlacementState = copy(serverDecision = decision, skippedByUser = false)

    /**
     * DT-75 local resolution for the offline-first build: the start point is the chosen grade's
     * beginning. Pure — the caller supplies the label so this stays testable without a catalog.
     * Idempotent: an existing decision (server or local) is never overwritten by a re-resolve.
     */
    fun resolveLocally(gradeLabel: String): ShomaraPlacementState =
        if (isPending) withServerDecision(ShomaraProfileStrings.PlacementLocalStartTemplate.format(gradeLabel)) else this

    companion object {
        fun skip(): ShomaraPlacementState = ShomaraPlacementState(skippedByUser = true)
    }
}
