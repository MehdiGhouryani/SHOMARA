/**
 * SHOMARA token codegen (N03-01).
 *
 * Single canonical source: packages/design-system/src/tokens.json (schemaVersion 2.0.0).
 * Per ADR-0037 L6 the `v2` block is the canonical palette/shape for the Native client; this
 * generator therefore reads ONLY the v2 block and emits:
 *   1. TypeScript: packages/design-system/src/tokens.generated.ts
 *   2. Kotlin:     apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraTokens.kt
 *
 * Never hand-edit the generated files. Never introduce a second token JSON.
 *
 * Usage:
 *   node tools/token-codegen/generate.mjs          # write both targets
 *   node tools/token-codegen/generate.mjs --check  # drift gate: exit 1 if committed output differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOKENS_FILE = path.join(ROOT, 'packages', 'design-system', 'src', 'tokens.json');
const TS_TARGET = path.join(ROOT, 'packages', 'design-system', 'src', 'tokens.generated.ts');
const KOTLIN_TARGET = path.join(ROOT, 'apps', 'android', 'core', 'designsystem', 'src', 'main', 'kotlin', 'com', 'mathlearning', 'core', 'designsystem', 'ShomaraTokens.kt');

export const TARGETS = [
  { id: 'typescript', path: TS_TARGET },
  { id: 'kotlin', path: KOTLIN_TARGET },
];

export function loadTokens() {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  assertSchema(tokens);
  return tokens;
}

/** Guards the single-canonical-JSON contract; the drift gate depends on these invariants. */
export function assertSchema(tokens) {
  if (tokens.schemaVersion !== '2.0.0') throw new Error(`token schemaVersion drift: ${tokens.schemaVersion}`);
  const v2 = tokens.v2;
  if (!v2 || typeof v2 !== 'object') throw new Error('canonical v2 block missing');
  for (const group of ['color', 'type', 'space', 'radius', 'shadow', 'motion', 'component', 'clay']) {
    if (!v2[group]) throw new Error(`canonical v2.${group} group missing`);
  }
  for (const [key, value] of Object.entries(v2.color)) {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`v2.color.${key} is not #RRGGBB: ${value}`);
  }
  const spaces = v2.space;
  if (!Array.isArray(spaces) || spaces.some((n) => typeof n !== 'number')) throw new Error('v2.space must be an array of numbers');
  for (let i = 1; i < spaces.length; i += 1) {
    if (spaces[i] <= spaces[i - 1]) throw new Error(`v2.space must strictly ascend at index ${i}`);
  }
  if (v2.component.touchMin < 48) throw new Error('v2.component.touchMin violates the 48dp child floor');
  const expectedLevels = { flat: 0, hint: 1, soft: 2, featured: 3 };
  if (JSON.stringify(v2.clay.levels) !== JSON.stringify(expectedLevels)) throw new Error('v2.clay.levels drift from the MASTER four-tier contract');
}

const GEN_HEADER = (sourceRel, toolRel) =>
  [
    '// GENERATED FILE — DO NOT EDIT DIRECTLY.',
    `// Source of truth: ${sourceRel} (v2 block, canonical per ADR-0037 L6).`,
    `// Regenerate with: node ${toolRel}   (drift gate: node ${toolRel} --check)`,
  ].join('\n');

const SOURCE_REL = 'packages/design-system/src/tokens.json';
const TOOL_REL = 'tools/token-codegen/generate.mjs';

export function generateTypeScript(tokens) {
  const bodyLines = JSON.stringify(tokens.v2, null, 2).split('\n');
  bodyLines[bodyLines.length - 1] = `${bodyLines[bodyLines.length - 1]} as const;`;
  const body = bodyLines
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join('\n');
  return [
    GEN_HEADER(SOURCE_REL, TOOL_REL),
    '',
    '/**',
    ' * Canonical v2 design tokens for TypeScript consumers (UI/UX Generation V2, owner decision',
    ' * D-021). Shape mirrors the v2 block one-to-one; semantic mapping happens in components.',
    ' */',
    'export const V2_TOKENS =',
    body,
    '',
    'export type V2Tokens = typeof V2_TOKENS;',
    '',
  ].join('\n');
}

const pascal = (key) => key.charAt(0).toUpperCase() + key.slice(1);

export function generateKotlin(tokens) {
  const v2 = tokens.v2;
  const lines = [];

  for (const [key, hex] of Object.entries(v2.color)) {
    lines.push(`  val Color${pascal(key)} = Color(0xFF${hex.slice(1).toUpperCase()})`);
  }
  for (const [scale, spec] of Object.entries(v2.type)) {
    lines.push(`  val Type${pascal(scale)}FontSize = ${spec.fontSize}.sp`);
    lines.push(`  val Type${pascal(scale)}LineHeight = ${spec.lineHeight}.sp`);
    lines.push(`  val Type${pascal(scale)}Weight = FontWeight(${Number(spec.weight)})`);
  }
  for (const value of v2.space) lines.push(`  val Space${value} = ${value}.dp`);
  for (const [key, value] of Object.entries(v2.radius)) lines.push(`  val Radius${pascal(key)} = ${value}.dp`);
  for (const [key, value] of Object.entries(v2.motion.duration)) lines.push(`  val MotionDuration${pascal(key)} = ${value} // ms`);
  for (const [key, value] of Object.entries(v2.motion.spring)) lines.push(`  val MotionSpring${pascal(key)} = ${value}`);
  lines.push(`  val MotionPressScale = ${v2.motion.pressScale}`);
  lines.push(`  val ShadowColor = Color(0xFF${v2.shadow.color.slice(1).toUpperCase()})`);
  lines.push(`  val ShadowOpacity = ${v2.shadow.opacity}`);
  lines.push(`  val ShadowOffsetY = ${v2.shadow.offsetY}.dp`);
  for (const [key, value] of Object.entries(v2.component)) {
    lines.push(`  val Component${pascal(key)} = ${value}.dp`);
  }
  for (const [level, value] of Object.entries(v2.clay.levels)) lines.push(`  val ClayLevel${pascal(level)} = ${value}`);
  for (const [tier, spec] of Object.entries(v2.clay)) {
    if (tier === 'note' || tier === 'levels' || !spec || typeof spec !== 'object') continue;
    for (const [key, value] of Object.entries(spec)) {
      const unit = /Opacity/.test(key) ? '' : '.dp';
      lines.push(`  val Clay${pascal(tier)}${pascal(key)} = ${value}${unit}`);
    }
  }

  return [
    GEN_HEADER(SOURCE_REL, TOOL_REL),
    '',
    'package com.mathlearning.core.designsystem',
    '',
    'import androidx.compose.ui.graphics.Color',
    'import androidx.compose.ui.text.font.FontWeight',
    'import androidx.compose.ui.unit.dp',
    'import androidx.compose.ui.unit.sp',
    '',
    '/**',
    ' * Canonical v2 design tokens for the Native client (UI/UX Generation V2, owner decision D-021).',
    ' * Semantic mapping (theme slots, clay tiers) happens in ShomaraTheme (N03-02) and components;',
    ' * feature code must consume these values and never hardcode hex, sizes or durations.',
    ' */',
    'object ShomaraTokens {',
    ...lines,
    '}',
    '',
  ].join('\n');
}

/** @returns {{ id: 'typescript' | 'kotlin', path: string, content: string }[]} */
export function generateAll() {
  const tokens = loadTokens();
  return [
    { ...TARGETS[0], content: generateTypeScript(tokens) },
    { ...TARGETS[1], content: generateKotlin(tokens) },
  ];
}

function run() {
  const check = process.argv.includes('--check');
  const targets = generateAll();
  let drift = false;
  for (const target of targets) {
    const committed = fs.existsSync(target.path) ? fs.readFileSync(target.path, 'utf8') : null;
    if (committed === target.content) {
      console.log(`OK  ${path.relative(ROOT, target.path)} (no drift)`);
      continue;
    }
    if (check) {
      drift = true;
      console.log(`DRIFT  ${path.relative(ROOT, target.path)} — regenerate with: node ${TOOL_REL}`);
    } else {
      fs.mkdirSync(path.dirname(target.path), { recursive: true });
      fs.writeFileSync(target.path, target.content);
      console.log(`WROTE  ${path.relative(ROOT, target.path)}`);
    }
  }
  if (check && drift) {
    console.log('TOKEN_DRIFT: FAIL');
    process.exit(1);
  }
  console.log(check ? 'TOKEN_DRIFT: PASS' : 'TOKEN_CODEGEN: DONE');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
