#!/usr/bin/env node
/**
 * UI V2 gate for the migrated path tab and station start (owner decision D-021, batch: Path +
 * Station Start). Locks, statically:
 *   1. tokens: PathView2 / StationStartV2 / clay / Character read ONLY tokens.v2 — no raw hex,
 *      no V1 (DS./C./UI.) token usage.
 *   2. shared primitives: the screens consume ClaySurface/Character (no private depth or
 *      per-screen character loading); the trail reuses the tested buildPathLayout geometry.
 *   3. model + contracts: pathModel (status mapping, world titles, jump rule, hints) stays the
 *      single data source; the navigation logic and honest content states stay in the container.
 *   4. a11y: roles on every Pressable; node labels/hints come from the contract; Persian digits
 *      via toFa; the featured clay level is reserved for the one current node.
 *   5. child-safety: no stars/lives/streaks; warm states only.
 *   6. behavior: flow:path keeps driving the real screen; flow:station asserts the start screen
 *      with the V2-equivalent bar check.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

const files = [
  'apps/mobile/src/path/PathView2.tsx',
  'apps/mobile/src/station/views2/StationStartV2.tsx',
  'apps/mobile/src/ui/v2/clay.tsx',
  'apps/mobile/src/ui/v2/Character.tsx',
  'apps/mobile/src/ui/v2/path.tsx',
];
for (const f of files) if (!fs.existsSync(path.join(root, f))) throw new Error(`missing V2 file: ${f}`);
must(true, `all ${files.length} V2 path/station sources exist`);

// 1. tokens-only discipline
for (const f of files) {
  const src = read(f);
  const hex = [...src.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map((m) => m[0]);
  if (hex.length) throw new Error(`raw hex in ${f}: ${hex.join(', ')}`);
  const v1 = [...src.matchAll(/\b(?:DS\.color|C\.|UI\.)[\w.]*/g)];
  if (v1.length) throw new Error(`V1 token usage in ${f}: ${v1.map((m) => m[0]).join(', ')}`);
}
must(true, 'V2 path/station sources use only tokens.v2 (no raw hex, no V1 tokens)');

// 2. shared primitives + tested geometry
const pathView = read('apps/mobile/src/path/PathView2.tsx');
must(pathView.includes('buildPathLayout(') && pathView.includes("from './layout'"), 'PathView2 reuses the tested trail geometry (buildPathLayout)');
must(pathView.includes('<ClaySurface') && pathView.includes('<Character'), 'PathView2 renders through the shared ClaySurface and Character primitives');
must(pathView.includes('chapterKicker') === false && pathView.includes("from './pathModel'") === false, 'PathView2 stays a pure view: the model feeds it, it does not import it');
const start = read('apps/mobile/app/station/[stationId]/start.tsx');
const startView = read('apps/mobile/src/station/views2/StationStartV2.tsx');
must(startView.includes('<ClaySurface') && startView.includes('<Character'), 'StationStartV2 renders the featured clay hero through shared primitives');
must(!/expo-router|useAppState|fetch\(|MobileContentManager/.test(startView), 'StationStartV2 is a pure view (no navigation/state/network)');

// 3. containers keep logic; model stays authoritative
const screen = read('apps/mobile/app/(tabs)/index.tsx');
must(screen.includes('<PathView2') && screen.includes('buildChapterViews') && screen.includes('jumpOfferUnitIds') && screen.includes('gradeChipLabel'), 'path tab keeps the real path model');
must(screen.includes("/station/${stationId}/play") && screen.includes("/station/${stationId}/start") && screen.includes('/jump?targetStationId='), 'path navigation targets are unchanged');
must(screen.includes('ایستگاه‌های قبل را جلو ببر.') && screen.includes("'offline'"), 'locked-notice and honest offline state stay in the container');
must(start.includes('<StationStartV2') && start.includes('downloadPackage') && start.includes('getCacheEntries'), 'start screen keeps the real content preparation flow');
const model = read('apps/mobile/src/path/pathModel.ts');
must(model.includes('PATH_NODE_STATUS_HINT[status]') && model.includes('worldByUnitId('), 'node labels/hints/world titles still come from the contracts');

// 4. clay discipline + a11y
const v2Path = read('apps/mobile/src/ui/v2/path.tsx');
must(v2Path.includes("state === 'current'") && v2Path.includes('featured'), 'featured clay is bound to the one current node');
must(pathView.includes('accessibilityRole="header"'), 'chapter dividers/band are announced as headings');
must(pathView.includes('toFa('), 'path counters render Persian digits');
for (const f of files) {
  const src = read(f);
  for (const m of src.matchAll(/<Pressable\b/g)) {
    const tag = src.slice(m.index, src.indexOf('>', m.index));
    if (!/accessibilityRole/.test(tag)) throw new Error(`Pressable without accessibilityRole in ${f}`);
  }
}
must(true, 'every Pressable in V2 path/station files declares accessibilityRole');

// 5. child-safety
for (const f of files) {
  const src = read(f);
  const banned = [/ستاره/u, /\bstar\b/i, /\bجان\b/u, /\blives\b/i, /\bstreak\b/i];
  for (const rx of banned) if (rx.test(src)) throw new Error(`banned gamification term ${rx} in ${f}`);
}
must(true, 'no stars/lives/streaks in the V2 path/station sources');

// 6. behavior coverage stayed with the migration (replaced, not deleted)
const flowPath = read('scripts/flow-path-run.mjs');
must(flowPath.includes('گنج، قفل') && flowPath.includes('ایستگاه‌های قبل را جلو ببر.') && flowPath.includes('برو به مرحلهٔ فعلی'), 'flow:path still drives the real V2 screen behaviors');
must(flowPath.includes('v2-path.png'), 'flow:path captures the V2 path screenshot (FLOW_CAPTURE=1)');
const flowStation = read('scripts/flow-station-run.mjs');
must(flowStation.includes('06 (V2): the honest bar is 14px high') && flowStation.includes("'آماده‌سازی'"), 'flow:station asserts the start screen with the V2-equivalent check');

console.log('UI_V2_PATH_STATION_VERIFIER: PASS');
