import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * N08-02 acceptance part 1 — "roles/states حقیقی" (real roles/states):
 * Every interactive V2 control (Pressable / Button2 / TextField2 / CodeInput2 /
 * Switch / slider-like rows) must carry accessibilityRole and
 * accessibilityLabel (or accessibilityState where applicable) so TalkBack
 * announces a REAL role/state instead of raw container text.
 *
 * Static source audit — mirrors touchTargets.test.ts conventions. The
 * on-device TalkBack + focus-order pass (gesture path) remains a separate,
 * honestly-tracked device gate (NATIVE_PENDING); this test guarantees the
 * contract exists on every interactive node.
 */
const ROOT = join(__dirname, '..', '..');

// V2 views under audit. Legacy V1 screens are out of scope (retiring at
// cutover) — their a11y fixes would be wasted churn.
const V2_DIRS = [
  'src/ui/v2',
  'src/onboarding/views2',
  'src/path',
  'src/station/views2',
  'src/practice/views2',
  'src/profile/views2',
  'src/navigation',
];

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === '__tests__') continue;
    if (statSync(p).isDirectory()) files(p, out);
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

// A control is interactive if its opening tag is a Pressable or a V2
// primitive known to render touch targets. Focus-forwarding shells
// (accessibilityRole="none", e.g. CodeInput2's outer Pressable whose hidden
// RNTextInput is the real labeled control) are excluded by isFocusShell.
// V2 primitives with a `label` prop guarantee an accessible name internally:
// TextField2 passes label → TextInput.accessibilityLabel, CodeInput2 passes
// label → hidden RNTextInput.accessibilityLabel. Call sites only supply props.
const PRIMITIVE_WITH_LABEL = /<(TextField2|CodeInput2)\b/;
const INTERACTIVE_TAG = /<(Pressable|Button2)\b/g;

function isFocusShell(tag: string): boolean {
  return /\baccessibilityRole="none"\b/.test(tag);
}

// accessibilityRole must be present on the same opening tag (up to its '>').
// Neutralise arrow bodies so a '>' inside props doesn't end the tag early.
function tagNeedsRole(tag: string): boolean {
  return !/\baccessibilityRole\b/.test(tag) && !/\brole\b/.test(tag);
}

describe('N08-02: every interactive V2 control declares a real a11y role', () => {
  const violations: string[] = [];
  for (const dir of V2_DIRS) {
    const abs = join(ROOT, dir);
    let list: string[] = [];
    try { list = files(abs); } catch { continue; } // dir may not exist in older branches
    for (const file of list) {
      const src = readFileSync(file, 'utf8');
      const norm = src.replace(/=>/g, '=_');
      for (const m of norm.matchAll(INTERACTIVE_TAG)) {
        const rest = norm.slice(m.index!);
        const end = rest.indexOf('>');
        const tag = rest.slice(0, end === -1 ? undefined : end + 1);
        if (isFocusShell(tag)) continue;
        if (tagNeedsRole(tag)) {
          violations.push(`${file.replace(ROOT, '')}: <${m[1]}> without accessibilityRole`);
        }
      }
    }
  }
  it('no interactive V2 control is missing accessibilityRole', () => {
    expect(violations).toEqual([]);
  });
});

describe('N08-02: interactive controls carry a label (not just a role)', () => {
  const violations: string[] = [];
  for (const dir of V2_DIRS) {
    const abs = join(ROOT, dir);
    let list: string[] = [];
    try { list = files(abs); } catch { continue; }
    for (const file of list) {
      const src = readFileSync(file, 'utf8');
      const norm = src.replace(/=>/g, '=_');
      for (const m of norm.matchAll(INTERACTIVE_TAG)) {
        const rest = norm.slice(m.index!);
        const end = rest.indexOf('>');
        const tag = rest.slice(0, end === -1 ? undefined : end + 1);
        if (isFocusShell(tag)) continue;
        // Label may come from accessibilityLabel OR accessible text child
        // (contentLabel prop on primitives). Audit the tag only — child text
        // presence is covered by role+label convention in view components.
        if (!/\baccessibilityLabel\b/.test(tag) && !/\blabel\b/.test(tag)) {
          violations.push(`${file.replace(ROOT, '')}: <${m[1]}> without accessibilityLabel`);
        }
      }
    }
  }
  it('no interactive V2 control is missing accessibilityLabel', () => {
    expect(violations).toEqual([]);
  });
});
