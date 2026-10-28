# Mobile Local State Contract

The Android app stores a device-local projection for onboarding, resume, avatar and UI preferences.

## Schema

`apps/mobile/src/state/appStateCore.ts` is the source of truth. The current local schema is `3`.

Schema 3 adds:

```text
preferences.sound
preferences.motion
preferences.largeText
```

When a schema 1/2 file is read, missing preferences migrate in memory to the safe defaults:

- sound: on
- motion: on
- large text: off

The app then persists the next state write at schema 3.

## Security boundary

Authentication tokens are not stored in this document. Access tokens are persisted with Expo SecureStore. Learning truth, station pass and Jump authorization remain server-authoritative; the local document is only a UI/progress projection.

## Recovery

Unknown future schema versions are preserved as a backup and put through the recovery/first-run path. Corrupt documents are also backed up before reset.
