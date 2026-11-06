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
 * Grade placement: the DECISION is server-authoritative; the client only reports the user's
 * skip choice and renders whatever the server returns (placement is never guessed client-side).
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

    fun withServerDecision(decision: String): ShomaraPlacementState = copy(serverDecision = decision, skippedByUser = false)

    companion object {
        fun skip(): ShomaraPlacementState = ShomaraPlacementState(skippedByUser = true)
    }
}
