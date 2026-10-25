# Device test checklist (the owner runs this; emulator results never count as device results)

**Status: DRAFT (phase P1) — completed in P7.** Nothing below has been run on a device by the build agent;
every unchecked box is genuinely unverified. Perform no account actions during the test beyond the child OTP
flow itself with a real phone number you control.

## 0. Preparation (development build)

1. On the dev machine: Node ≥ 22.18 (`node -v`), `npm ci`, `npm run build:packages`, gates green per
   `docs/testing/GATE_RUN_ORDER.md`.
2. Development build for a physical Android device (one of):
   - EAS: `cd apps/mobile`, `npx eas build --profile development --platform android` (needs an EAS account and
     network; sign in is the owner's action), then install the produced APK.
   - Local: `npx expo run:android --device <deviceId>` with the device in developer mode (USB debugging on),
     or `npx expo install expo-dev-client` then `npx expo run:android --device`.
3. The app must point at a backend the owner controls (`EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env` for a
   dev build — never commit that file). Without a backend the app falls back to local content in development
   builds only; the release configuration fails closed.

Device minimums: **Android 8.0 (API 26) or newer** (Expo SDK 57 floor), **360 dp width** class (also spot-check
a 411 dp phone), Persian system language optional (app is Persian-first RTL regardless).

## 1. TalkBack on every app page (01 to 14)

With TalkBack on, walk: welcome 01 → phone 02 → code 03 → profile 04 → path 05 → stage intro 06 → lesson 07 →
question 08/09/10 → stage result 11 → challenge intro 12 → practice 13 → me 14, plus settings, avatar, parent.

- [ ] Every interactive element announces a Persian label; no «button» with no name.
- [ ] The wrong-answer sheet announces politely (never «غلط» / error tone wording).
- [ ] Reading order matches the visual RTL order on each page.
- [ ] The progress bars announce «بخش n از m» (aria labels exist; verify they reach TalkBack).

## 2. Persian speech (TTS)

- [ ] «دوباره بشنو» speaks Persian (`fa-IR`); if the device has no Persian TTS voice, the button stays silent
      without crashing and this is recorded as a finding (U-Q18: device proof was open).
- [ ] Speech stops when leaving the page or pressing continue.

## 3. Offline / airplane mode

- [ ] Airplane mode before the app starts: the app opens on cached content, no crash.
- [ ] Airplane mode **in the middle of a lesson**: the current item stays usable; a submit either queues or
      shows the calm failure message; nothing is lost on reopen.
- [ ] Kill the app mid-lesson and reopen: the station resumes where it was (resume state), no error screen.

## 4. Hardware back button

- [ ] Inside a lesson (07/08): back opens the same «خارج می‌شوی؟» confirmation as ✕ (proved in the browser
      harness in P1; confirm the same on device).
- [ ] «می‌مانم» stays; «خروج» leaves to the path.
- [ ] On the path/tab pages: back follows the app navigation, never quits silently from a lesson.

## 5. RTL and layout

- [ ] Every page lays out right-to-left; icons that imply direction point correctly.
- [ ] The number axis in exercises is not mirrored (numbers increase left→right).

## 6. Large text

- [ ] System font size 130% and 200% (Settings → Accessibility → Font size): no clipped or overlapping text on
      pages 01–14; scroll views still scroll. In-app «متن بزرگ‌تر» toggle also checked.

## 7. Reduced motion from system settings

- [ ] Developer options → remove animations (or Accessibility → reduce motion): node pulse/confetti become
      static, nothing animates endlessly.

## 8. Haptics

- [ ] Haptics on (Settings → لرزش لمسی): light feedback on selection and correct answers; nothing on retry.
- [ ] Haptics off: no vibration anywhere. On a device with no vibrator: no crash either way.

## 9. Sound

- [ ] Sound off in Settings: no lesson speech or cues; visual feedback unchanged.
- [ ] Sound on: only on-demand speech (no autoplay), volume respects the device media channel.

## 10. Cold start and performance (record numbers)

- [ ] Cold start time on the device (stopwatch): ____ s.
- [ ] Path scroll with 25 stations is smooth (no visible jank): yes/no.
- [ ] Any page that redraws slowly: list them.

## 11. Authentication edge cases (with a number you control)

- [ ] OTP code entry, wrong code once, then correct code.
- [ ] Resume flow for a returning child (app killed after login, reopened).

Record every finding with page number, Android version, device model, and a screenshot. Device-verified claims
may only be written into START_HERE after this checklist has real checkmarks and the log is attached under
`docs/archive/evidence/<date>/`.
