// APK preview readiness (chore/apk-preview, D-019): the internal device-test APK built with the
// EAS `preview` profile must (a) build reproducibly from package-lock.json, (b) run the on-device
// local-content preview when no API base is configured — never localhost, never a faked server
// claim — and (c) leave every production/market-apk fails-closed guarantee untouched. Signing
// material and env secrets must stay untracked by ignore rules.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
let passed = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

const eas = JSON.parse(read('apps/mobile/eas.json'));
const preview = eas.build?.preview ?? {};
const previewEnv = preview.env ?? {};

check('preview-apk-internal', preview.android?.buildType === 'apk' && preview.distribution === 'internal');
check(
  'preview-frozen-lockfile',
  !JSON.stringify(eas).includes('EAS_NO_FROZEN_LOCKFILE'),
  'the cloud build must resolve from package-lock.json',
);
check('preview-channel-env', previewEnv.EXPO_PUBLIC_RELEASE_CHANNEL === 'preview', 'runtime local-content detection reads this inlined var');

const runtime = read('apps/mobile/src/config/runtime.ts');
check('runtime-local-preview-exported', /export function isLocalContentPreview\(\): boolean/.test(runtime));
check('runtime-preview-scoped', /isPreviewRelease\(\) && !API_BASE_URL/.test(runtime), 'preview-only: a production build without a URL still fails closed');
check('runtime-localhost-dev-only', /__DEV__ \? 'http:\/\/localhost:3000' : ''/.test(runtime));

const stationFlow = read('apps/mobile/src/station/StationFlow.tsx');
check(
  'station-gate-allows-local-preview',
  /releaseConfigError && !isLocalContentPreview\(\)/.test(stationFlow),
  'an insecure configured URL still fails closed; no-URL preview enters LOCAL mode',
);
check('station-remote-unavailable-pinned', stationFlow.includes('REMOTE_RUNTIME_UNAVAILABLE'));
check(
  'station-local-never-claims-queue',
  /LOCAL is only a dev\/startup fallback/.test(stationFlow),
  'LOCAL submits show the honest failure line and never a queued/synced claim',
);

const onboarding = read('apps/mobile/app/onboarding.tsx');
check('onboarding-otp-wall-kept', /requestOtp\(/.test(onboarding) && /verifyOtp\(/.test(onboarding), 'every profile with a configured URL keeps the phone-OTP step');
check('onboarding-preview-skips-otp', /isLocalContentPreview\(\) \? 'CHILD' : 'AUTH'/.test(onboarding));
check(
  'onboarding-preview-skips-server-prep',
  /if \(!isLocalContentPreview\(\)\) await prepareGradeContent\(gradeId\)/.test(onboarding),
  'no server manifest fetch is attempted in the preview build',
);

const pathTab = read('apps/mobile/app/(tabs)/index.tsx');
check(
  'path-preview-honest-banner',
  /isLocalContentPreview\(\) \? \(/.test(pathTab) && pathTab.includes('اتصال به سرور در این نسخه فعال نیست'),
  'the path states plainly that this build does not connect to a server',
);
check('path-preview-local-download-set', /G1_STATIONS\.map\(\(station\) => station\.id\)/.test(pathTab), 'on-device content keeps the cursor station enterable');

const gitignore = read('.gitignore');
for (const pattern of ['*.keystore', '*.jks', 'credentials.json', 'google-services.json']) {
  check(`gitignore-${pattern}`, gitignore.includes(pattern));
}
check('gitignore-env', /^\.env$/m.test(gitignore) && /^\.env\.\*$/m.test(gitignore) && /^!\.env\.example$/m.test(gitignore), 'env secrets ignored, the template stays tracked');

const previewDoc = read('docs/release/APK_PREVIEW.md');
check('doc-owner-commands', previewDoc.includes('npx eas-cli@latest whoami') && previewDoc.includes('npx eas-cli@latest login') && previewDoc.includes('build --platform android --profile preview'));
check('doc-profiles-warning', previewDoc.includes('production') && previewDoc.includes('market-apk'), 'the doc must warn against the store profiles');

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  console.error(`VERIFY_APK_PREVIEW: FAIL (${failures.length})`);
  process.exit(1);
}
console.log(`VERIFY_APK_PREVIEW: PASS (${passed} checks)`);
