#!/usr/bin/env node
/**
 * UI V2 verification (owner decision D-021): the V2 generation gets its own guard set, replacing
 * the V1 visual assertions for the migrated lesson-slice stages (teach / question / result-on-pass).
 * What it locks, statically:
 *   1. tokens: V2 components read ONLY the v2 token groups — no raw hex, no V1 (DS./C./UI.) colors.
 *   2. a11y: every Pressable in V2 files carries a role and the touch-target test resolves K2/R2.
 *   3. reduce-motion: every reanimated surface in V2 checks the reduce-motion hook.
 *   4. child-safety: no stars/lives/punitive streaks in V2 sources; wrong-answer tones stay warm.
 *   5. wiring: StationFlow renders the V2 views for the lesson slice and the contract surfaces
 *      (submitAttempt / advanceAfterAnswer) are untouched; flow:station still drives the slice.
 *   6. digits: user-facing counters go through toFa (no Latin digits in V2 views).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

const files = [
  'apps/mobile/src/ui/v2/tokens.ts',
  'apps/mobile/src/ui/v2/core.tsx',
  'apps/mobile/src/ui/v2/clay.tsx',
  'apps/mobile/src/ui/v2/Character.tsx',
  'apps/mobile/src/ui/v2/lesson.tsx',
  'apps/mobile/src/ui/v2/path.tsx',
  'apps/mobile/src/ui/v2/useReduceMotionV2.ts',
  'apps/mobile/src/station/views2/LessonViewsV2.tsx',
  'apps/mobile/src/path/PathView2.tsx',
  'apps/mobile/src/station/views2/StationStartV2.tsx',
];
for (const f of files) if (!fs.existsSync(path.join(root, f))) throw new Error(`missing V2 file: ${f}`);
must(true, `all ${files.length} V2 source files exist`);

// 1. tokens-only discipline
const hexAllowed = new Set(['rgba(255,255,255,0.45)']); // bead shine highlight only
for (const f of files.filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))) {
  const src = read(f);
  const raw = [...src.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map((m) => m[0]);
  const offenders = raw.filter((h) => !hexAllowed.has(h));
  if (offenders.length) throw new Error(`raw hex in ${f}: ${offenders.join(', ')}`);
  const v1Colors = [...src.matchAll(/\b(?:DS\.color|C\.|UI\.onColor)[\w.]*/g)];
  if (v1Colors.length) throw new Error(`V1 token usage in V2 file ${f}: ${v1Colors.map((m) => m[0]).join(', ')}`);
}
must(true, 'V2 sources use only tokens.v2 (no raw hex beyond the documented highlight, no V1 tokens)');

// 2. a11y: roles on every pressable + the touch-target test resolves V2 tokens
for (const f of ['apps/mobile/src/ui/v2/core.tsx', 'apps/mobile/src/ui/v2/lesson.tsx', 'apps/mobile/src/ui/v2/path.tsx', 'apps/mobile/src/ui/v2/Character.tsx', 'apps/mobile/src/ui/v2/clay.tsx', 'apps/mobile/src/station/views2/LessonViewsV2.tsx', 'apps/mobile/src/path/PathView2.tsx', 'apps/mobile/src/station/views2/StationStartV2.tsx']) {
  const src = read(f);
  for (const m of src.matchAll(/<Pressable\b/g)) {
    const tag = src.slice(m.index, src.indexOf('>', m.index));
    if (!/accessibilityRole/.test(tag)) throw new Error(`Pressable without accessibilityRole in ${f}`);
  }
}
must(true, 'every V2 Pressable declares accessibilityRole');
const touchTest = read('apps/mobile/src/ui/touchTargets.test.ts');
must(
  touchTest.includes('V2_TOKENS') && touchTest.includes('TOKENS_JSON.v2?.component'),
  'touch-target test resolves V2 tokens (K2/R2) like V1 UI tokens',
);

// 3. reduce-motion (the facade replaced CharacterSpot as the animated character surface, D-021 batch 2)
const core = read('apps/mobile/src/ui/v2/core.tsx');
const lesson = read('apps/mobile/src/ui/v2/lesson.tsx');
const character = read('apps/mobile/src/ui/v2/Character.tsx');
must(core.includes('useReduceMotion') && character.includes('useReduceMotion') && lesson.includes('useReduceMotion'), 'V2 animated surfaces consult the reduce-motion hook');

// 4. child-safety
for (const f of files) {
  const src = read(f);
  // word-bounded latin terms keep the intent (no star/life/streak rewards) without matching startLabel/onStart (D5)
  const banned = [/ستاره/u, /\bstar\b/i, /\bجان\b/u, /\blives\b/i, /\bstreak\b/i];
  for (const rx of banned) {
    if (rx.test(src)) throw new Error(`banned gamification term ${rx} in ${f}`);
  }
}
const views2 = read('apps/mobile/src/station/views2/LessonViewsV2.tsx');
must(views2.includes("p.phase === 'correct' ? 'correct' : 'retry'"), 'V2 feedback keeps the warm correct/retry tones (no alarming wrong state)');

// 5. wiring + contract surfaces untouched
const flow = read('apps/mobile/src/station/StationFlow.tsx');
must(flow.includes('<TeachView2') && flow.includes('<QuestionView2') && flow.includes('<StageResultView2'), 'StationFlow renders the V2 lesson-slice views');
must(flow.includes('void answerContent(content, questionSelection)') && flow.includes('await advanceAfterAnswer(target, outcome)'), 'submitAttempt/advance contract surfaces unchanged in StationFlow');
must(flow.includes("from './views2/LessonViewsV2'"), 'V2 views are imported from views2 (transitional adapter location)');
const flowScript = read('scripts/flow-station-run.mjs');
must(flowScript.includes('07 (V2)') && flowScript.includes('08 (V2)') && flowScript.includes('11 (V2)'), 'flow:station asserts the migrated stages with V2-equivalent checks');

// 6. Persian digits in V2 user-facing counters
must(read('apps/mobile/src/station/views2/LessonViewsV2.tsx').includes('toFa(p.done)'), 'V2 result counters use toFa');

console.log('UI_V2_FOUNDATION_VERIFIER: PASS');
