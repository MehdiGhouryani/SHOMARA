// ST07 ingestion adapter (phase P4): maps the content-spec YAML station format onto the repo's DEV_ONLY
// content-package shape (content/dev-packs/*), proven on the ST07 pilot only. Deliberate-only: writing the
// pack requires CONTENT_ST07_DEVPACK=1 (D-018); nothing in the app imports it, so production exports stay
// free of the ST07 marker (proved by grepping the expo export in the P4 evidence).
// Provisional mappings recorded in D-018 (owner reviews before any station beyond the pilot):
//   - skills keep the spec ids (SK-ST07-k) — the G1-SK### taxonomy is R-01, an owner decision;
//   - templates map to experience forms/interactions (T13/T15→PUZZLE/TAP, T05→MINI_GAME, T01→INSTRUCTION);
//   - mastery follows the REPO runtime (5 items, 4 required, two sessions), NOT the spec's 3-of-4 (R-03).
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const PILOT = path.join(ROOT, 'docs/content-spec/grade1/shomara-stage7-pilot-ST07.md');
const OUT = path.join(ROOT, 'content/dev-packs/g1-st07-v1');

if (process.env.CONTENT_ST07_DEVPACK !== '1') {
  console.error('build-st07-devpack writes a dev content pack; set CONTENT_ST07_DEVPACK=1 to run it deliberately (D-018).');
  process.exit(1);
}

const md = fs.readFileSync(PILOT, 'utf8');
const blocks = [...md.matchAll(/```yaml\r?\n([\s\S]*?)```/g)].map((m) => yaml.load(m[1]));
const [identity, p1, p2, p3, , poolBlockRaw, p5] = [blocks[0], blocks[1], blocks[2], blocks[3], blocks[4], blocks[5], blocks[6]];
const poolItems = (() => {
  const raw = [...md.matchAll(/```yaml\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  const poolRaw = raw.find((r) => r.includes('ST07.F1.'));
  return poolRaw ? yaml.load(poolRaw) : [];
})();

const FORM_BY_TEMPLATE = {
  T01: { experienceForm: 'CONVERSATION_EXPLANATION', interactionType: 'TAP' },
  T05: { experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME' },
  T08: { experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME' },
  T13: { experienceForm: 'PUZZLE', interactionType: 'TAP' },
  T15: { experienceForm: 'PUZZLE', interactionType: 'TAP' },
};
const formFor = (template) => FORM_BY_TEMPLATE[template] ?? { experienceForm: 'MINI_GAME', interactionType: 'MINI_GAME' };

let n = 0;
const id = () => `G1-ST07-E${String(++n).padStart(2, '0')}`;
const encounters = [];
const items = [];
const push = (learningRole, template, skillId, extra = {}) => {
  const contentVersionId = id();
  const { experienceForm, interactionType } = formFor(template);
  encounters.push({ contentVersionId, learningRole, experienceForm, skillId, ...extra });
  items.push({ contentVersionId, learningRole, experienceForm, interactionType, status: 'ACTIVE' });
};

// Part 1 discovery steps → one INSTRUCTION encounter each (no evaluation, per the spec).
for (const step of p1 ?? []) push('INSTRUCTION', step.template ?? 'T01', 'SK-ST07-1');
// Part 2 guided items → GUIDED_PRACTICE puzzles with the spec's answer as options metadata.
for (const item of p2 ?? []) push('GUIDED_PRACTICE', item.template, item.skill?.[0] ?? 'SK-ST07-1', { specItem: item.id, answer: item.answer ?? null });
// Part 3 game rounds → GUIDED_PRACTICE mini-game encounters.
for (const round of p3?.rounds ?? []) push('GUIDED_PRACTICE', p3?.game?.template ?? round.template, round.skill?.[0] ?? 'SK-ST07-1', { specItem: round.id });
// Part 4 pool: the first two items preview as INDEPENDENT_PRACTICE (the pool itself feeds the check draw).
push('INDEPENDENT_PRACTICE', poolItems[0]?.template ?? 'T13', poolItems[0]?.skill?.[0] ?? 'SK-ST07-1', { specItem: poolItems[0]?.id });
// Part 5 challenge items → one 5-item MASTERY_CHECK (repo numbers: 4 of 5, two sessions — D-018/R-03).
push('MASTERY_CHECK', p5?.[0]?.template ?? 'T13', p5?.[0]?.skill?.[0] ?? 'SK-ST07-1', {
  checkContract: { requiredCorrect: 4, totalItems: 5, separateSession: true },
  specItems: (p5 ?? []).map((i) => i.id),
});

fs.mkdirSync(OUT, { recursive: true });
const header = {
  schema: 'math-content-package/v1',
  environment: 'DEV_ONLY',
  gradeId: 'G1',
  stationId: 'G1-ST07',
  packageVersion: '0.1.0-provisional',
  note: 'generated from docs/content-spec/grade1/shomara-stage7-pilot-ST07.md by scripts/build-st07-devpack.mjs (D-018): skills keep spec ids (R-01 open), mastery follows the repo runtime (R-03)',
};
fs.writeFileSync(path.join(OUT, 'package.json'), `${JSON.stringify({ ...header, items }, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, 'content.json'), `${JSON.stringify({ ...header, encounters }, null, 2)}\n`);
console.log(`ST07 dev pack written: ${items.length} encounters → ${path.relative(ROOT, OUT)} (DEV_ONLY; production exports must not contain it)`);
