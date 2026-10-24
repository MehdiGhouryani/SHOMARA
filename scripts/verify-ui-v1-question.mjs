// Static gate for Stage U5a (question and feedback pages 08 to 10 on UI v1, ADR-0035): the pure views only.
// Wiring into the lesson player waits for the owner decisions U-Q20 to U-Q22 (START_HERE section 5).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const t = JSON.parse(read('packages/design-system/src/tokens.json')).ui;
const q = t.question;
check('tokens-option-from-page', t.control.optionHeight === 88 && t.control.optionRadius === 20 && q.optionsGap === 12 && q.optionEdge === 6 && q.optionDimOpacity === 0.5);
check('tokens-sheet-from-page', t.surface.sheetTopRadius === 28 && q.sheetPadTop === 24 && q.sheetPadX === 24 && q.sheetPadBottom === 32 && q.sheetGap === 16 && q.sheetIcon === 44 && q.sheetGlyph === 26);
check('tokens-tray-bare', q.trayPad === 24 && t.bead.gap === 12);

const files = ['apps/mobile/src/ui/v1/OptionButton.tsx', 'apps/mobile/src/ui/v1/FeedbackSheet.tsx', 'apps/mobile/src/station/views/QuestionView.tsx'];
for (const f of files) {
  const src = read(f);
  const name = path.basename(f);
  check(`pure:${name}`, !/expo-router|useAppState|expo-speech|runtimeApi|fetch\(|submitAttempt/.test(src));
  check(`tokens-only:${name}`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src));
  check(`no-reward-counters:${name}`, !/ستاره|جان|streak|زنجیره/.test(src), 'no stars, lives or streak');
}

// A wrong answer is never red or alarming: the retry look uses the warm neutral container only.
const sheet = read('apps/mobile/src/ui/v1/FeedbackSheet.tsx');
const option = read('apps/mobile/src/ui/v1/OptionButton.tsx');
check('wrong-is-warm-not-red', !/C\.error|errorC|coral/.test(sheet + option) && sheet.includes('C.neutralC') && option.includes('C.neutralC'));
check('sheet-actions-follow-page', sheet.includes("variant={correct ? 'primary' : 'amber'}") && sheet.includes('accessibilityLiveRegion'));

// QuestionView: replay and check exist only while choosing; options lock after checking; check needs a selection.
const view = read('apps/mobile/src/station/views/QuestionView.tsx');
check('view-phases', view.includes("'choose' | 'correct' | 'retry'") && view.includes('choosing ? <Button variant="secondary"') && view.includes('disabled={p.selectedIndex === null}'));
check('view-options-locked-after-check', view.includes('disabled={!choosing ||'));
check('view-reuses-lesson-chrome', view.includes('LessonTopBar') && view.includes('LessonCaption') && view.includes('numbered={false}'));

const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
for (const [id, page] of [['question', '08'], ['correct', '09'], ['retry', '10']]) {
  const e = manifest.find((x) => x.id === id);
  check(`parity:${id}`, Boolean(e) && e.page === page && e.maxDiffPercent <= 0.5 && exists(`docs/design-handoff-2026-10/pages-v1/goldens/${page}.png`));
}

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  console.error(`VERIFY_UI_V1_QUESTION: FAIL (${failures.length})`);
  process.exit(1);
}
console.log('VERIFY_UI_V1_QUESTION: PASS');
