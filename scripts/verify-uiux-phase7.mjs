import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const required = [
  'packages/contracts/src/practice.ts',
  'apps/web/components/PracticeHubView.tsx',
  'apps/web/components/PracticeHubView.module.css',
  'apps/mobile/src/ui/PracticeHubScreen.tsx',
  'docs/reference/PRACTICE_HUB_CONTRACT.md',
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) throw new Error(`MISSING:${file}`);

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/practice.ts'), 'utf8');
const web = fs.readFileSync(path.join(root, 'apps/web/components/PracticeHubView.tsx'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'apps/mobile/src/ui/PracticeHubScreen.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'apps/web/components/PracticeHubView.module.css'), 'utf8');

const checks = [
  ['SINGLE_PRACTICE_SURFACE', contract.includes("export type PracticeSectionId = 'GAMES';") && contract.includes("label: 'بازی‌های کوتاه'")],
  ['CANONICAL_SCREEN_MAPPING', contract.includes("screenId: 'S14'")],
  ['NO_SECOND_PATH_SEMANTICS', contract.includes('one destination with one recommended') && contract.includes('canOpenPracticeStation')],
  ['WEB_GAMES_REAL_STATION_ENTRY', web.includes('/station/${stationId}/')],
  ['MOBILE_GAMES_REAL_STATION_ENTRY', mobile.includes('/station/${stationId}/')],
  ['NO_SKILL_OR_CONCEPT_TABS', !web.includes('PRACTICE_SKILLS.map') && !mobile.includes('PRACTICE_SKILLS.map') && !web.includes('PRACTICE_CONCEPTS.map') && !mobile.includes('PRACTICE_CONCEPTS.map')],
  ['MIN_TOUCH_TARGET', mobile.includes('DS.size.touchPrimary') && mobile.includes('minHeight')],
  ['REDUCED_MOTION_WEB', css.includes('prefers-reduced-motion')],
  ['NO_EMOJI_PRACTICE_UI', !Array.from(web + mobile).some((ch) => { const cp = ch.codePointAt(0) ?? 0; return cp >= 0x1F300 && cp <= 0x1FAFF; })],
];
for (const [name, ok] of checks) if (!ok) throw new Error(`FAIL:${name}`);
console.log(`UX-P07 verifier: PASS (${checks.length}/${checks.length})`);
