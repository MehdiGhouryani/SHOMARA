# Design-system review checklist

Load this reference only for component/token implementation or review.

## Before code

- Confirm active harness task permits the changed paths.
- List current consumers and migration impact.
- Link the canonical token(s) and component readiness row.
- Declare purpose, non-use cases, states and source of truth.

## Static review

- No raw visual values in feature code.
- No duplicated semantic token with a different name.
- State is immutable; component emits events and does not decide learning truth.
- Pressed/disabled/loading keep layout stable.
- Color, depth, sound or motion is never the only signal.
- RTL does not mirror semantic mathematics.

## Evidence routing

| claim | minimum evidence |
|---|---|
| generated | schema validation + drift check |
| implemented | compile + focused unit/semantics tests |
| visually reviewed | comparable screenshots at required widths/states |
| accessible | semantics checks plus pending/real TalkBack evidence |
| tested native | emulator/device journey and exact command |

Mark unavailable device evidence `NATIVE_PENDING`; never infer it from source or browser output.
