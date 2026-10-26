# Internal preview APK — owner runbook (device testing only)

This build exists for **physical-device testing**. It is not a store submission, it is not signed for
Play, and no account action is taken by the build agent — every command below that touches an Expo
account is run by you, the owner, in your own PowerShell window.

What this APK is: the `preview` profile (internal distribution, `buildType: apk`) of the
`chore/apk-preview` branch. **No API URL is configured in it yet** (the owner supplies one later), so
per **D-019** it runs in the on-device local-content preview: bundled lesson content, no server
contact, no phone-OTP step, answers are never evaluated (the lesson says so honestly), and no station
can be passed. The path screen states plainly that this build does not connect to a server. When a
staging/production URL exists, rebuild with it (see §5) and the full server-authoritative app returns.

## 1. Prerequisites

- Node **22.18.0 or newer** (`node -v`). The repo pins `.nvmrc` to 22; on this Windows machine only
  Node 24 was available, which satisfies the gate — record your actual version when reporting.
- An **Expo account owned by you** (the agent never logs in, never builds, never holds credentials).
- The phone: Android 8.0 (API 26) or newer, 360 dp class width (spot-check 411 dp if available).

## 2. Build (PowerShell, from the repo root)

```powershell
cd apps\mobile
node -v                                # must print v22.18.0 or newer
npx eas-cli@latest whoami              # if it prints your account, skip the next line
npx eas-cli@latest login               # you type the password; nobody else ever does
npx eas-cli@latest build --platform android --profile preview
```

- The cloud build uses the committed `package-lock.json` (frozen lockfile; `EAS_NO_FROZEN_LOCKFILE`
  is not set in the `preview` profile).
- Do **not** run the `production` or `market-apk` profiles. They are store artifacts (AAB / market
  APK) and building them from this branch is out of scope. Nothing here should ever be submitted.

## 3. Install on the phone

1. Wait for the build to finish; the console prints the **build page URL** and the **build ID**
   (also visible at https://expo.dev → your project → Builds).
2. On the build page, scan the QR code or download the APK and copy it to the phone.
3. Open the APK on the phone. Android asks to **allow installs from this source** (browser/file
   manager) — allow it once, then install.
4. Launch «ماجراجویی ریاضی». First run: welcome → (preview build: profile step directly, no phone
   step) → placement → path. The path banner says the build is local and not connected — that is
   expected and correct.

## 4. Test and report back

Run the owner protocol in `docs\testing\DEVICE_TEST_CHECKLIST.md` (that file lives on the
`chore/p8-closing` branch until it is merged to `main`; until then take the checklist from that
branch). Then report back, in one message:

- **Build ID** (from the EAS build page) and the **commit hash** it was built from
  (`git rev-parse HEAD` → expect the `chore/apk-preview` head).
- **Phone model and Android version**.
- **Pass or fail per checklist item** (TalkBack, TTS, airplane mode, large text, reduced motion,
  haptics, RTL — whatever the checklist lists), with screenshots for any fail.

Known honest limitations of this build (not bugs): question «بررسی» shows «الان نتوانستم نتیجه را
ثبت کنم…» because there is no server to evaluate; no station ever passes; «همگام‌سازی»-type claims
do not appear anywhere because nothing syncs; the profile step's progress label may read
«مرحلهٔ ۴ از ۶» because the phone/code steps are skipped in this build only (D-019).

## 4b. expo-doctor findings recorded 2026-10-26 (owner decisions pending, no dependency was changed)

- **Hermes V1 regression**: the build uses React Native 0.86.0, whose Hermes build
  (250829098.0.14) is affected by a known Hermes V1 regression; the fix ships in RN 0.86.2+ /
  expo@57.0.9+. If you see odd JS crashes on device, this is the first suspect. Fixing it means
  `npx expo install --fix` (RN 0.86.3 + several Expo patch bumps) — a dependency change that needs
  its own decision and a full gate re-run.
- **Version drift vs SDK 57**: expo 57.0.26 vs ~57.0.31 expected, expo-router, expo-splash-screen,
  expo-crypto, expo-linking patch drift, react-native 0.86.0 vs 0.86.3, typescript 5.9.3 vs ~6.0.3
  (major), @types/react minor. All recorded in `docs/archive/evidence/2026-10-26/apk-00b-expo-doctor.log`.
- The Expo config schema check could not run here (network `ECONNRESET` to the Expo API), so treat
  the doctor result as 18/21 with one check unexecuted for connectivity, not a config failure.

## 5. When the owner has a real API URL

Do not commit any URL into the repo. Preferred: an EAS secret, injected at build time:

```powershell
npx eas-cli@latest secret:create --name EXPO_PUBLIC_API_BASE_URL --value https://<your-staging-host> --scope project
```

Then rebuild with §2. The app detects the HTTPS base and returns to the full server-authoritative
flow (phone OTP included). A URL that is not `https://` still fails closed everywhere.
