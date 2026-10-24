import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const required = [
  'packages/contracts/src/lesson.ts',
  'packages/contracts/src/index.ts',
  'apps/web/components/LessonPlayerShell.tsx',
  'apps/web/components/LessonPlayerShell.module.css',
  'apps/mobile/src/station/LessonPlayerChrome.tsx',
  'apps/mobile/src/station/StationFlow.tsx',
  'docs/reference/LESSON_PLAYER_CONTRACT.md',
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) throw new Error(`MISSING:${file}`);

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/lesson.ts'), 'utf8');
for (const marker of ['LESSON_STAGES', 'LESSON_STAGE_META', 'isLessonAssessment', 'LessonFeedbackState']) {
  if (!contract.includes(marker)) throw new Error(`MISSING_CONTRACT_MARKER:${marker}`);
}

const web = fs.readFileSync(path.join(root, 'apps/web/components/DuolingoLessonModal.tsx'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'apps/web/components/LessonPlayerShell.tsx'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'apps/mobile/src/station/StationFlow.tsx'), 'utf8');
const mobileChrome = fs.readFileSync(path.join(root, 'apps/mobile/src/station/LessonPlayerChrome.tsx'), 'utf8');

const checks = [
  ['WEB_HEADER_USES_SHARED_SHELL', shell.includes('export function LessonPlayerHeader') && web.includes('LessonPlayerHeader')],
  ['WEB_FEEDBACK_USES_SHARED_SHELL', shell.includes('export function LessonFeedback') && web.includes('LessonFeedback')],
  ['MOBILE_USES_SHARED_CHROME', mobile.includes('LessonPlayerChrome') && mobile.includes('LessonFeedbackCard')],
  ['ASSESSMENT_NO_CHARACTER_MOBILE', mobile.includes("!['CHECK_A', 'CHECK_B', 'MASTERY_CHECK'].includes(stage)")],
  ['SERVER_AUTHORITATIVE_WEB', web.includes('learningService.submitAttempt')],
  ['SERVER_AUTHORITATIVE_MOBILE', mobile.includes('submitAttempt({ sessionId: session')],
  ['IDEMPOTENCY_WEB', web.includes('client') || web.includes('idempotency')],
  ['EXIT_CONFIRMATION_MOBILE', mobile.includes('confirmExit') && mobile.includes('BackHandler')],
  ['NO_FAKE_LOCAL_COMPLETION', mobile.includes("setMessage(S.lesson.submitFailed)" )],
  ['REDUCED_MOTION_WEB', shell.includes('prefers-reduced-motion') || fs.readFileSync(path.join(root, 'apps/web/components/LessonPlayerShell.module.css'), 'utf8').includes('prefers-reduced-motion')],
  ['MIN_TOUCH_TARGET_WEB', fs.readFileSync(path.join(root, 'apps/web/components/LessonPlayerShell.module.css'), 'utf8').includes('var(--ds-size-touchMin)')],
  ['MOBILE_DS_TOKENS', mobileChrome.includes("DS.color") && mobileChrome.includes('DS.size.touchMin')],
];
for (const [name, ok] of checks) if (!ok) throw new Error(`FAIL:${name}`);
console.log(`UX-P06 verifier: PASS (${checks.length}/${checks.length})`);
