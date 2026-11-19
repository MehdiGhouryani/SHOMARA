package com.mathlearning.feature.path

import androidx.compose.runtime.Immutable
import com.mathlearning.core.designsystem.ShomaraEntryState

/**
 * Immutable Home presentation input. The shell owns navigation and the future identity-backed
 * ViewModel/repository; this renderer never resolves identity, unlocks or learning progress.
 */
@Immutable
data class ShomaraHomeUiState(
    val progress: ShomaraPathProgress = ShomaraPathProgress.unresolved(),
    val entryState: ShomaraEntryState? = null,
    val savedChapter: Int? = null,
    /** True only when the caller has a real operation that can be retried. */
    val retryAvailable: Boolean = false,
)

/** User intents emitted by the stateless Home renderer; no navigation happens inside it. */
sealed interface ShomaraHomeAction {
    data object OpenSettings : ShomaraHomeAction
    data class OpenStation(val stationId: String) : ShomaraHomeAction
    data object Retry : ShomaraHomeAction
}

/** Canonical Home copy shared by the screen, previews and Compose assertions. */
object ShomaraHomeStrings {
    const val Title = "مسیر یادگیری"
    const val Subtitle = "قدم‌به‌قدم جلو می‌ریم"
    const val Settings = "باز کردن تنظیمات"
    const val LoadingTitle = "در حال آماده‌سازی مسیر"
    const val LoadingBody = "مسیر در حال آماده شدن است."
    const val ErrorTitle = "مسیر باز نشد"
    const val ErrorBody = "نتوانستیم مسیر را باز کنیم. دوباره تلاش کن."
    const val Retry = "تلاش دوباره"
    const val EmptyTitle = "مسیر خالی است"
    const val EmptyBody = "فعلاً ایستگاهی برای نمایش نیست."
    const val PathComplete = "مسیر کامل شد"
    const val Offline = "اینترنت وصل نیست؛ مسیر آفلاین دیده می‌شود."
    const val ReturnCurrent = "بازگشت به ایستگاه فعلی"
    // DT-40: the two handoff cards (C04 chapter progress, C05 continue station) need their own
    // canonical labels. The owner relaxed the inline-copy rule, but shared strings still live here
    // so a screen never hides a literal inside a card.
    const val Continue = "ادامه"
    const val ContinueEyebrow = "گام بعدی"

    /** DT-76 (handoff C05 fresh state): the first-ready invitation for a fresh learner. */
    const val ContinueEyebrowFresh: String = "اولین ایستگاه آماده است"
    const val ContinueFresh: String = "شروع ایستگاه"

    fun continueSupport(chapterLabel: String) = "از $chapterLabel"
    const val ReturnStart = "بازگشت به نقطهٔ شروع"

    fun remaining(countFa: String) = "ایستگاه‌های باقی‌مانده: $countFa"
    fun nextStep(title: String) = "گام بعدی: $title"
    fun startHere(title: String) = "از اینجا شروع کن: $title"
}
