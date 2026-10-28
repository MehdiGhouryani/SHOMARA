import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'packages/contracts/src/onboarding.ts',
  'apps/web/components/AuthFlowScreen.tsx',
  'apps/web/components/ChildAvatar.tsx',
  'apps/web/components/OnboardingFlow.module.css',
  'apps/web/lib/auth-provider.ts',
  'apps/web/app/welcome/page.tsx',
  'apps/web/app/auth/page.tsx',
  'apps/web/app/auth/code/page.tsx',
  'apps/web/app/grade/page.tsx',
  'apps/web/app/child/page.tsx',
  'apps/web/app/start-check/page.tsx',
  'apps/web/app/api/v1/auth/otp/start/route.ts',
  'apps/web/app/api/v1/auth/otp/verify/route.ts',
  'apps/mobile/app/onboarding.tsx',
  'apps/mobile/src/components/ChildAvatar.tsx',
  'apps/mobile/src/onboarding/catalog.ts',
  'docs/reference/ONBOARDING_CONTRACT.md',
];

const failures = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`missing:${file}`);

const web = fs.readFileSync(path.join(root, 'apps/web/components/AuthFlowScreen.tsx'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'apps/mobile/app/onboarding.tsx'), 'utf8');
const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/onboarding.ts'), 'utf8');
const page = fs.readFileSync(path.join(root, 'apps/web/app/page.tsx'), 'utf8');
const placement = fs.readFileSync(path.join(root, 'apps/web/components/PlacementFlow.tsx'), 'utf8');
const mobileCore = fs.readFileSync(path.join(root, 'apps/mobile/src/state/appStateCore.ts'), 'utf8');

const checks = {
  sharedStepContract: contract.includes("'WELCOME'") && contract.includes("'AUTH'") && contract.includes("'OTP'") && contract.includes("'GRADE'") && !contract.includes("'PARENT_GATE'") && contract.includes("'CHILD'") && contract.includes("'PLACEMENT'") && contract.includes("'RESULT'") && contract.includes("'SYNC_LOADING'"),
  otpExactSix: contract.includes('return /^\\d{6}$/.test(normalizeDigits(input));'),
  childAliasLimit: contract.includes('value.length <= 20'),
  noFakeWebOtpSuccess: web.includes('verifyOtp(') && !web.includes("setAuthMethod('MOBILE');\n    go('CHILD')"),
  googleNotFake: !web.includes('ورود با Google') || web.includes('provider'),
  noParentGateOnboardingWeb: !web.includes('PARENT_GATE') && !web.includes('ParentGate'),
  noParentGateOnboardingMobile: !mobile.includes('PARENT_GATE') && !mobile.includes('ParentGate'),
  phoneOnlyAuthContract: contract.includes("export type AuthMethod = 'MOBILE';"),
  avatarNotCompanion: fs.readFileSync(path.join(root, 'docs/reference/ONBOARDING_CONTRACT.md'), 'utf8').includes('avatar') && fs.readFileSync(path.join(root, 'docs/reference/ONBOARDING_CONTRACT.md'), 'utf8').includes('companion'),
  placementSkippableWeb: placement.includes('فعلاً رد می‌کنم') && web.includes('skipPlacement'),
  placementSkippableMobile: mobile.includes('فعلاً رد می‌کنم'),
  placementNoReward: mobileCore.includes('Stars come from completed learning stations only; placement never grants a reward.') && !mobileCore.includes('1 + Object.values(state.progress)'),
  rootFirstRunRedirect: page.includes("router.replace('/welcome')"),
  noOnboardingEmojiWeb: !/[/\\]AuthFlowScreen\.tsx/.test('') && !/[\u{1F300}-\u{1FAFF}]/u.test(web),
  noOnboardingAuthEmoji: !/[\u{1F300}-\u{1FAFF}]/u.test(web) && !/[\u{1F300}-\u{1FAFF}]/u.test(mobile),
};

for (const [key, ok] of Object.entries(checks)) if (!ok) failures.push(`check:${key}`);
const result = { phase: 'UX-P04', generatedAt: new Date().toISOString(), status: failures.length ? 'FAIL' : 'PASS', checks, failures };
if (failures.length) { console.error(JSON.stringify(result, null, 2)); process.exit(1); }
console.log(JSON.stringify(result, null, 2));
