package com.mathlearning.core.model

/**
 * UI-001 Launch / bootstrap contract (N04-01, wired for real in N08-15).
 *
 * Every app start resolves through exactly one of these states before any child-facing surface may
 * render. There is no guest state by design — an unauthenticated start is `NewUser`, never a bypass.
 *
 * Who produces them (N08-15, real production wiring):
 *  - `:app` → `ShomaraLaunchController` publishes `Resolving` while it reads the stored session and
 *    verifies it against the server, then [ShomaraLaunchResolver] maps the observation onto a state.
 *  - `RestoringSession` therefore means "a **verified** session exists on this device" — that is the
 *    authenticated destination. `NewUser`/`RecoverIncompleteProfile` enter onboarding.
 *  - `Offline`/`Error` never render a child surface; they render a warm recovery screen with retry.
 */
enum class ShomaraLaunchState {
    Resolving,
    NewUser,
    RestoringSession,
    RecoverIncompleteProfile,
    Offline,
    Error,
}

/**
 * Canonical grade catalog mirrored from `packages/contracts/src/onboarding.ts`
 * (ONBOARDING_GRADE_OPTIONS). Availability is content-driven: only grades whose curriculum
 * content exists may be selected; the rest are explained warmly, never punitively.
 */
data class ShomaraGradeOption(
    val id: String,
    val title: String,
    val subtitle: String,
    val available: Boolean,
)

object ShomaraGradeCatalog {
    val Options: List<ShomaraGradeOption> = listOf(
        ShomaraGradeOption("G1", "پایه اول ابتدایی", "شمارش، الگوها، جمع و تفریق تا ۲۰", available = true),
        ShomaraGradeOption("G2", "پایه دوم ابتدایی", "اعداد سه‌رقمی، جمع و تفریق فرآیندی", available = false),
        ShomaraGradeOption("G3", "پایه سوم ابتدایی", "جدول ضرب، تقسیم، کسر و محیط", available = false),
        ShomaraGradeOption("G4", "پایه چهارم ابتدایی", "اعداد بزرگ، ضرب چندرقمی، زاویه و مساحت", available = false),
        ShomaraGradeOption("G5", "پایه پنجم ابتدایی", "عملیات کسرها، اعداد اعشاری، تقارن و حجم", available = false),
        ShomaraGradeOption("G6", "پایه ششم ابتدایی", "کسر، اعشار، نسبت و تناسب، درصد و آمار", available = false),
    )

    fun option(gradeId: String): ShomaraGradeOption =
        Options.firstOrNull { it.id == gradeId } ?: throw IllegalArgumentException("unknown grade $gradeId")

    /** Warm, actionable explanation for a locked grade — never punitive (AGENTS rule 9). */
    fun lockedReason(gradeId: String): String =
        "«${option(gradeId).title}» به‌زودی اضافه می‌شود؛ فعلاً با پایهٔ اول شروع می‌کنیم."

    val activeDefaultId: String = "G1"
}

/**
 * Canonical child avatar presets mirrored from `packages/contracts/src/onboarding.ts`
 * (CHILD_AVATAR_PRESETS). Colors live in the design-system token surface, not here.
 */
data class ShomaraAvatarOption(
    val id: String,
    val label: String,
)

object ShomaraAvatarCatalog {
    val Options: List<ShomaraAvatarOption> = listOf(
        ShomaraAvatarOption("sun", "خورشیدی"),
        ShomaraAvatarOption("leaf", "برگ"),
        ShomaraAvatarOption("cloud", "ابری"),
        ShomaraAvatarOption("moon", "ماه"),
    )

    fun option(avatarId: String): ShomaraAvatarOption =
        Options.firstOrNull { it.id == avatarId } ?: throw IllegalArgumentException("unknown avatar $avatarId")

    val defaultId: String = Options.first().id
}
