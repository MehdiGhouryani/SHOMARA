package com.mathlearning.feature.onboarding

import com.mathlearning.core.designsystem.ShomaraDigits

/** Profile/placement copy seeds (warm, actionable; caller may override from the canonical source). */
object ShomaraProfileStrings {
    const val NameLabel: String = "نام کودک"
    const val NameHint: String = "مثلاً آریا"
    const val NameInvalid: String = "نام را کوتاه و بدون عدد وارد کن."
    const val GradeLabel: String = "پایهٔ تحصیلی"
    const val GradeOne: String = "پایهٔ اول"
    const val Save: String = "ذخیره"
    const val SaveFailed: String = "ذخیره نشد؛ دوباره تلاش می‌کنیم."
    const val SaveRetry: String = "ذخیره نشد؛ یک بار دیگر امتحان کن."
    const val PlacementSkip: String = "فعلاً رد می‌کنم"
    const val PlacementPending: String = "در حال آماده‌سازی نقطهٔ شروع…"
    const val PlacementTitle: String = "نقطهٔ شروع را پیدا کنیم"
}

/**
 * Profile draft + save reducer (N04-04): an incomplete draft can never be submitted; a failed
 * save keeps every field and offers a warm retry. The grade comes from the canonical list.
 */
data class ShomaraProfileDraft(
    val name: String = "",
    val gradeId: String = DEFAULT_GRADE_ID,
) {
    init {
        require(gradeId in CANONICAL_GRADE_IDS) { "gradeId must be canonical" }
    }

    val isNameValid: Boolean
        get() = name.isNotBlank() && name.length >= 2 && name.none { it.isDigit() } && name == name.trim()

    val isComplete: Boolean
        get() = isNameValid

    val canSave: Boolean
        get() = isComplete

    /** Placement can only start from a complete profile. */
    val canEnterPlacement: Boolean
        get() = isComplete

    companion object {
        const val DEFAULT_GRADE_ID: String = "G1"
        val CANONICAL_GRADE_IDS: List<String> = listOf("G1")

        fun gradeLabel(gradeId: String): String = when (gradeId) {
            "G1" -> ShomaraProfileStrings.GradeOne
            else -> throw IllegalArgumentException("unknown grade $gradeId")
        }

        fun nameValidationError(name: String): String? =
            if (ShomaraProfileDraft(name = name).isNameValid) null else ShomaraProfileStrings.NameInvalid
        }
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
