# Android Store Release Checklist

This checklist is intentionally a release gate, not a claim that the current snapshot has already been published.

## Binary
- [ ] Production EAS build generated as AAB.
- [ ] Internal/QA APK generated from `preview` profile.
- [ ] Direct-market APK generated from `market-apk` profile only when that distribution channel is intended.
- [ ] Release build uses HTTPS production API URL.
- [ ] Release build has no Guest entry point.
- [ ] Release build cannot fall back to local demo learning/runtime.

## Android configuration
- [x] Package id is `com.mathlearning.app`.
- [x] Expo SDK 57 baseline targets Android 36.
- [x] Portrait baseline is explicit.
- [x] Light theme is explicit until a complete dark theme exists.
- [x] INTERNET / ACCESS_NETWORK_STATE are the only declared Android permissions in the current snapshot.
- [x] Adaptive icon and splash assets exist.
- [ ] Version code increased for the first actual store upload as required by the chosen release number.

## Google Play declarations
- [ ] Target audience declaration completed accurately.
- [ ] Families policy review completed because children are part of the target audience.
- [ ] Data Safety form completed from actual runtime/network/SDK behavior.
- [ ] Privacy policy URL published and reachable.
- [ ] IARC/content rating completed.
- [ ] App access instructions prepared for review if required.
- [ ] Store listing screenshots, short description and full description reviewed.

## Real-device QA
- [ ] Android 13/14/15/16 device coverage.
- [ ] 360dp and 412dp-ish widths.
- [ ] RTL on clean install.
- [ ] Large text.
- [ ] Reduce motion at OS level.
- [ ] Settings motion toggle persists across restart.
- [ ] Login/OTP/re-auth/restart.
- [ ] Offline start + reconnect.
- [ ] Jump pass and Jump fail.
- [ ] Long Path scroll and current-location return.
- [ ] Back button during lesson prompts before leaving.
- [ ] Screen-reader labels and focus order.
- [ ] Cold start, warm start and low-memory recreation.

## External constraints
Google Play currently requires new apps and app updates submitted from 31 Aug 2026 to target Android 16 / API 36 or higher; new Play apps are published using Android App Bundles. These requirements must be rechecked immediately before submission because store policies can change.

## Architecture guard

The Android product uses the current React Native / Expo runtime and does not use Unity.

No Unity dependency is permitted in the Android runtime.
