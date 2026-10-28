// Static gate for the onboarding area (Stage U2 historical half + D-021 real-screen half).
// The four parity specimens still render the V1 views (historical goldens, untouched). The REAL
// screen renders the V2 views (playbook pages 01–04); behavior is proven by `npm run flow:onboarding`.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const screen = read('apps/mobile/app/onboarding.tsx');
const steps = read('apps/mobile/src/onboarding/steps.ts');

// The real screen renders the V2 views (D-021 replacement, not deletion).
for (const view of ['WelcomeView2', 'PhoneView2', 'CodeView2', 'ProfileView2']) {
  check(`screen-uses:${view}`, screen.includes(`<${view}`) && screen.includes(`views2/${view}`));
}
// The parity specimens keep rendering the historical V1 views (goldens are pinned; never re-generated here).
for (const view of ['WelcomeView', 'PhoneView', 'CodeView', 'ProfileView']) {
  check(`parity-specimen-uses:${view}`, read('apps/mobile/parity/specimens/onboarding.tsx').includes(view));
}

// Legacy components and the old cast are gone from this flow.
for (const legacy of ['OtpBoxes', 'PhoneInput', 'CharacterAvatar', 'CharacterSays', 'ChildAvatar']) {
  check(`screen-without-legacy:${legacy}`, !new RegExp(`\\b${legacy}\\b`).test(screen));
}
check('screen-without-old-cast-ids', !/['"](aria|jiko|qbo)['"]/.test(screen));

// GRADE is merged into the profile page: the mobile flow never visits the contract's GRADE step.
check('flow-otp-goes-to-profile', /next\('CHILD'\)/.test(screen) && !/next\('GRADE'\)/.test(screen));
check('flow-back-uses-stepBack', screen.includes('stepBack(') && !screen.includes('previousStep('));
check('steps-back-skips-grade', /case 'GRADE':\s*case 'CHILD':\s*return 'OTP'/.test(steps));
check('steps-six-total', /FLOW_STEP_TOTAL = 6/.test(steps));

// Regression guard: placement used to start at -1 and render a blank page with no way forward.
check('placement-starts-at-first-question', /setPlacementIndex\(0\);\s*\n\s*next\('PLACEMENT'\)/.test(screen) && !/setPlacementIndex\(-1\);\s*\n\s*next\('PLACEMENT'\)/.test(screen));

// Consent: the legal line stays visible and the tap on start records the time; finishing requires it.
check('consent-line-shown', screen.includes('LEGAL_LINE') && screen.includes('شرایط استفاده و حریم خصوصی را می‌پذیری'));
check('consent-recorded-on-start', /function begin\(\)[\s\S]{0,200}setTermsAcceptedAt\(/.test(screen));
check('consent-required-to-finish', /termsAcceptedAt/.test(screen) && /consentAt/.test(screen));

// Approved code page confirmation format.
check('mask-format-approved', /\*\*\*/.test(read('apps/mobile/src/auth/phone.ts')));

// Accessible names from the playbook pages (V2 shell + code view).
check('view-back-labelled', read('apps/mobile/src/ui/v2/shell.tsx').includes('accessibilityLabel="برگشت"'));
check('code-group-labelled', read('apps/mobile/src/onboarding/views2/CodeView2.tsx').includes('کد تأیید شش رقمی'));
check('radios-use-checked-state', read('apps/mobile/src/ui/v2/forms.tsx').includes('checked: selected') && read('apps/mobile/src/ui/v2/forms.tsx').includes('disabled: locked'));

// Tools exist and are wired.
const pkg = JSON.parse(read('package.json'));
check('scripts-wired', pkg.scripts['flow:onboarding'] === 'node scripts/flow-run.mjs' && pkg.scripts.parity === 'node scripts/parity-run.mjs');
const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
for (const [id, page] of [['welcome', '01'], ['phone', '02'], ['code', '03'], ['profile', '04']]) {
  check(`parity-manifest:${id}`, manifest.some((s) => s.id === id && s.page === page && s.maxDiffPercent <= 0.5));
}

if (failures.length) {
  console.error(`FAIL ${failures.length} check(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('UI_V1_ONBOARDING: PASS');
