# Onboarding Contract — S01–S07

## Canonical sequence

`S01 Welcome → S02 Phone → S03 OTP → S04 Grade → S05 Child Profile → S06 Optional Placement → S07 Path`

Phone OTP is the only authentication method in the current mobile-first release. There is no separate parent/adult authentication gate in onboarding.

The placement result is a starting-point suggestion only. It does not grant stars, mastery, or other rewards.

## Data boundary

No child profile field is durably persisted before phone verification and completion of onboarding. The short-lived form/session state may remain in memory or session scope only. `consentAt` is retained for compatibility as a timestamp for onboarding terms acceptance; it is not evidence of parent authentication.

## Authentication truth

Phone OTP is provider-backed. The UI must never accept a locally invented OTP or report success when the provider is unavailable. Guest, Google, and email are not part of the current onboarding UI.

## Grade truth

The onboarding catalog currently exposes only grades with published content in the staged environment. At the current baseline that is G1. Future grade selection is visibly unavailable rather than navigable to empty content.

## Avatar truth

The child avatar is an identity preset owned by the child profile. It is not a companion character. Companion characters (Aria, Qbo, Dana, Jiko) remain contextual learning guides.

## Accessibility

RTL is mandatory. Phone/OTP fields are LTR. Primary actions are at least 52dp/56px depending on platform. Selected state is not communicated by color alone. Reduced motion must not block access to any action.

## Required states

`default, loading, invalid, provider unavailable, expired OTP, rate limit, offline, retry, empty, save failure, returning, recover`
