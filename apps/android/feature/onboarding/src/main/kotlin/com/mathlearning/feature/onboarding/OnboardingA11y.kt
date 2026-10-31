package com.mathlearning.feature.onboarding

import com.mathlearning.core.designsystem.ShomaraOtpLogic

/**
 * N04-06 a11y/traversal contract per onboarding step. The list order IS the intended TalkBack
 * traversal order (Compose announces semantics in declaration order); the composables declare
 * nodes exactly in this order. Real TalkBack validation on a device stays NATIVE_PENDING.
 */
object ShomaraOnboardingA11y {
    data class Node(val role: String, val label: String)

    private fun heading(label: String) = Node(role = "Heading", label = label)
    private fun body(label: String) = Node(role = "Text", label = label)
    private fun button(label: String) = Node(role = "Button", label = label)
    private fun field(label: String) = Node(role = "EditField", label = label)
    private fun status(label: String) = Node(role = "Status", label = label)
    private fun digit(index: Int, total: Int) = Node(role = "DigitCell", label = ShomaraOtpLogic.cellLabel(index, total))

    fun traversalFor(step: OnboardingStep): List<Node> = when (step) {
        OnboardingStep.Welcome -> listOf(
            heading(ShomaraOnboardingStrings.WelcomeTitle),
            body(ShomaraOnboardingStrings.WelcomeBody),
            button(ShomaraOnboardingStrings.Continue),
        )
        OnboardingStep.PhoneInput -> listOf(
            body(ShomaraOnboardingStrings.WelcomeBody),
            field(ShomaraOnboardingStrings.PhoneLabel),
            button(ShomaraOnboardingStrings.Continue),
            button(ShomaraOnboardingStrings.Back),
        )
        OnboardingStep.OtpVerify -> listOf(
            field("کد تأیید"),
            digit(0, 4),
            digit(1, 4),
            digit(2, 4),
            digit(3, 4),
            button(ShomaraOnboardingStrings.Back),
        )
        OnboardingStep.ProfileSetup -> listOf(
            heading(ShomaraProfileStrings.PlacementTitle),
            field(ShomaraProfileStrings.NameLabel),
            body(ShomaraProfileStrings.GradeLabel),
            body(ShomaraProfileStrings.GradeOne),
            button(ShomaraProfileStrings.Save),
        )
        OnboardingStep.GradePlacement -> listOf(
            heading(ShomaraProfileStrings.PlacementTitle),
            status(ShomaraProfileStrings.PlacementPending),
            button(ShomaraProfileStrings.PlacementSkip),
        )
        OnboardingStep.Complete -> emptyList()
    }
}
