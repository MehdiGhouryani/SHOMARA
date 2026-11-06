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
        // Page-03 restructure: the compact decorative hero is silent, and the
        // body line renders under the title again. The real rendered order is
        // title → body → phone field card → «ادامه» → «بازگشت». The
        // DEBUG-only «عبور آزمایشی» ghost (N08-15) renders after «بازگشت» and
        // is not part of the release contract.
        OnboardingStep.PhoneInput -> listOf(
            heading(ShomaraOnboardingStrings.PhoneLabel),
            body(ShomaraOnboardingStrings.WelcomeBody),
            field(ShomaraOnboardingStrings.PhoneLabel),
            button(ShomaraOnboardingStrings.Continue),
            button(ShomaraOnboardingStrings.Back),
        )
        // Page-03 alignment: the old standalone «کد تأیید» field node never
        // existed as a rendered label. The real rendered order is title →
        // sent-to → the four LTR cells → the keypad's own buttons →
        // «تأیید کد» → resend → paste → «بازگشت». The sent-to line carries
        // the actual phone between the two canonical fragments. The
        // DEBUG-only simulation buttons render before «تأیید کد» and are not
        // part of the release contract.
        OnboardingStep.OtpVerify -> buildList {
            add(heading(ShomaraOtpStepStrings.Title))
            add(body("${ShomaraOtpStepStrings.SentToPrefix} ${ShomaraOtpStepStrings.SentToSuffix}"))
            add(digit(0, 4))
            add(digit(1, 4))
            add(digit(2, 4))
            add(digit(3, 4))
            // The keypad announces its own buttons — digits 1..9 in LTR cell
            // order, then backspace and 0, exactly the keys ShomaraOtpKeypad
            // renders.
            for (d in 1..9) add(button(d.toString()))
            add(button("⌫"))
            add(button("0"))
            add(button(ShomaraOtpStepStrings.Confirm))
            add(button(ShomaraOtpStepStrings.Resend))
            add(button(ShomaraOtpStepStrings.Paste))
            add(button(ShomaraOtpStepStrings.Back))
        }
        // Page 02-profile (2026-11-06): the avatar rows and the body subtitle are gone; the
        // grade section is a second heading and the CTA reads «ادامه». The six grade cards
        // are RadioButton nodes inside the grid (not listed individually here).
        OnboardingStep.ProfileSetup -> listOf(
            heading(ShomaraProfileStrings.ProfileTitle),
            field(ShomaraProfileStrings.NameLabel),
            heading(ShomaraProfileStrings.GradeSectionTitle),
            button(ShomaraProfileStrings.Continue),
        )
        OnboardingStep.GradePlacement -> listOf(
            heading(ShomaraProfileStrings.PlacementTitle),
            status(ShomaraProfileStrings.PlacementPending),
            button(ShomaraProfileStrings.PlacementSkip),
        )
        OnboardingStep.Complete -> emptyList()
    }
}
