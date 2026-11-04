package com.mathlearning.core.designsystem

/**
 * Splash visual constants (N08-15).
 *
 * These are the only non-token values the splash adds, and each is a property of the delivered
 * artwork or of the progress mechanism — not a styling choice:
 *
 *  - [ArtworkAspectRatio] is the intrinsic aspect of the owner-supplied artwork (941 × 1672), so the
 *    hero box can reserve the right space before the bitmap decodes (no layout jump).
 *  - [AdvanceSteps] is how many token-length tween segments the determinate bar walks; the segment
 *    duration itself comes from `ShomaraTokens.MotionDurationSlow`.
 *
 * Everything visual — the artwork's warm cream, text styles, spacing, radii, ink colours — resolves
 * through [ShomaraTokens], so the design-system verifier stays authoritative and this file never
 * introduces a second source of truth for a colour.
 */
object ShomaraSplashSpec {
    /** 941 / 1672 — the delivered artwork's aspect ratio. */
    const val ArtworkAspectRatio: Float = 941f / 1672f

    /** Brand name in Persian — live Compose text, never baked into the artwork. */
    const val BrandName: String = "شمارا"

    /** Warm line under the brand name; tells the child what is happening, without pressure. */
    const val LoadingLine: String = "کمی صبر کن، داریم آماده می‌شویم…"

    /** What the picture is, for TalkBack (the artwork has no baked-in label). */
    const val ArtworkDescription: String = "نمبر و دوستانش در باغ شومارا"

    /** Opening fraction and honest ceiling of the determinate bar (never 100% before resolution). */
    const val AdvanceStart: Float = 0.3f
    const val AdvanceCeiling: Float = 0.9f

    /** Number of token-length tween segments that walk from [AdvanceStart] to [AdvanceCeiling]. */
    const val AdvanceSteps: Int = 3

    /** Merged announcement for the whole splash surface. */
    const val Announcement: String = "در حال آماده‌سازی شومارا"
}