#!/usr/bin/env node
/**
 * UI V2 gate for the onboarding/auth migration (owner decision D-021; playbook pages 01–04).
 * Locks, statically:
 *   1. tokens: views2 + the V2 forms/shell kit read ONLY tokens.v2 — no raw hex, no V1 token
 *      usage (DS./C./UI.), and the container no longer imports the DS design-system theme.
 *   2. auth forms: TextField2 keeps the +98 prefix, LTR digit runs and near-field warm error;
 *      CodeInput2 keeps six cells, OTP autofill (oneTimeCode/sms-otp) and Persian digits.
 *   3. purity: views2 are pure views (no router/state/network); all logic stays in onboarding.tsx.
 *   4. a11y: radios report checked; locked grades report disabled; inputs carry their labels;
 *      touch minimums come from tokens (K2).
 *   5. child-safety: no stars/lives/streaks; warm states only; Persian copy with toFa digits.
 *   6. behavior: flow:onboarding keeps driving the real screen end to end.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

const files = [
  'apps/mobile/src/ui/v2/forms.tsx',
  'apps/mobile/src/ui/v2/shell.tsx',
  'apps/mobile/src/onboarding/views2/WelcomeView2.tsx',
  'apps/mobile/src/onboarding/views2/PhoneView2.tsx',
  'apps/mobile/src/onboarding/views2/CodeView2.tsx',
  'apps/mobile/src/onboarding/views2/ProfileView2.tsx',
  'apps/mobile/app/onboarding.tsx',
];
for (const f of files) if (!fs.existsSync(path.join(root, f))) throw new Error(`missing V2 onboarding file: ${f}`);
must(true, `all ${files.length} V2 onboarding sources exist`);

// 1. tokens-only discipline (container included: the unplanned steps were restyled too)
for (const f of files) {
  const src = read(f);
  const hex = [...src.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map((m) => m[0]);
  if (hex.length) throw new Error(`raw hex in ${f}: ${hex.join(', ')}`);
  const v1 = [...src.matchAll(/\b(?:DS\.color|DS\.radius|C\.|UI\.)[\w.]*/g)];
  if (v1.length) throw new Error(`V1 token usage in ${f}: ${v1.map((m) => m[0]).join(', ')}`);
}
must(true, 'V2 onboarding sources use only tokens.v2 (no raw hex, no V1/DS tokens)');
const screen = read('apps/mobile/app/onboarding.tsx');
must(!/design-system\/theme|DSButton|DSSurface|DSProgress/.test(screen), 'container no longer uses the legacy DS theme/components');
must(/from '\.\.\/src\/onboarding\/views2\//.test(screen), 'container wires the views2 views');

// 2. auth form contracts (playbook 03)
const forms = read('apps/mobile/src/ui/v2/forms.tsx');
must(forms.includes('prefix') && forms.includes("writingDirection: 'ltr'"), 'TextField2 keeps the prefix adornment and LTR digit runs');
must(forms.includes('oneTimeCode') && forms.includes('sms-otp'), 'CodeInput2 keeps OS code autofill');
must(/length = 6/.test(forms), 'CodeInput2 defaults to the six-cell auth contract');
must(forms.includes('toFa('), 'CodeInput2 shows Persian digits');
must(forms.includes("color: error ? C2.danger : C2.muted") && !/C2\.danger[^,}]*background|backgroundColor: C2\.danger/.test(forms), 'error tone stays a near-field warm text/border, never an alarming fill');

// 3. purity: views2 render, the container decides
for (const view of ['WelcomeView2', 'PhoneView2', 'CodeView2', 'ProfileView2']) {
  const src = read(`apps/mobile/src/onboarding/views2/${view}.tsx`);
  if (/expo-router|useAppState|fetch\(|MobileContentManager|authApi/.test(src)) throw new Error(`${view} is not a pure view`);
}
must(true, 'views2 are pure views (no router/state/network)');
must(/function submitPhone[\s\S]*requestOtp/.test(screen) && /function submitOtp[\s\S]*verifyOtp/.test(screen), 'OTP start/verify stay in the container over authApi');
must(screen.includes('isLocalContentPreview()'), 'D-019 local-preview gating stays in the container');

// 4. a11y
must(forms.includes('accessibilityState={{ checked: selected }}') && forms.includes('disabled: locked'), 'radios report checked; locked grades report disabled');
must(forms.includes('accessibilityLabel={label}') || forms.includes('accessibilityLabel={label}'), 'inputs carry their accessible name');
must(forms.includes('K2.buttonH') && forms.includes('K2.touchMin'), 'field/cell/link targets come from the token touch minimums');
must(read('apps/mobile/src/ui/v2/shell.tsx').includes('accessibilityLabel="برگشت"'), 'step-bar back action keeps its Persian accessible name');

// 5. child-safety + Persian digits in the flow copy
for (const f of files.slice(0, 6)) {
  const src = read(f);
  for (const banned of ['ستاره', 'امتیاز جریمه']) {
    if (src.includes(banned)) throw new Error(`banned reward wording in ${f}: ${banned}`);
  }
  if (/\b(streak|lives)\b/i.test(src)) throw new Error(`banned reward wording in ${f}: streak/lives`);
}
must(true, 'no stars/lives/streak wording in the V2 onboarding sources');
must(screen.includes('toFa(') && screen.includes('سؤال {toFa(placementIndex + 1)}'), 'placement counter stays Persian via toFa');

// 6. behavior harness stays wired
const pkg = JSON.parse(read('package.json'));
must(pkg.scripts['flow:onboarding'] === 'node scripts/flow-run.mjs', 'flow:onboarding still drives the real screen');
must(/rgb\(221, 242, 231\)/.test(read('scripts/flow-run.mjs')), 'flow harness asserts the V2 selected-tile fill (primarySoft), not the V1 color');

console.log('UI_V2_ONBOARDING: PASS');
