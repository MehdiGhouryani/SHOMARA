import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Touch-target guard (Phase 2 PASS): every style used directly on a <Pressable>
 * must declare height/minHeight >= 48dp (children's guideline; Android minimum).
 * Static check of declared sizes — not a substitute for on-device testing.
 */
const ROOT = join(__dirname, '..', '..');
const MIN = 48;
// Styles that intentionally are not standalone targets (e.g. wrappers whose child supplies the size).
const ALLOW = new Set<string>(['link']);
// Resolve canonical design-system size tokens (DS.size.*) so token-based styles are checked, not skipped.
const TOKENS_JSON = JSON.parse(readFileSync(join(ROOT, '..', '..', 'packages', 'design-system', 'src', 'tokens.json'), 'utf8'));
const SIZE_TOKENS: Record<string, number> = TOKENS_JSON.size ?? {};
// ADR-0035: v1 primitives size themselves from `tokens.ui` (UI.group.key); resolved so they are checked too.
const UI_TOKENS: Record<string, Record<string, unknown>> = TOKENS_JSON.ui ?? {};

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === 'assets' || name === 'plugins') continue;
    if (statSync(p).isDirectory()) files(p, out);
    else if (name.endsWith('.tsx') && !['animation.tsx', 'SemanticAnimationDemo.tsx'].includes(name)) out.push(p);
  }
  return out;
}

function declared(src: string, name: string): { h: number | undefined; w: number | undefined } | null {
  const m = src.match(new RegExp(`\\b${name}:\\s*\\{([^}]*)\\}`));
  if (!m) return null;
  const body = m[1]!;
  const num = (k: string) => {
    const r = body.match(new RegExp(`\\b${k}:\\s*(\\d+)`));
    if (r) return Number(r[1]);
    const t = body.match(new RegExp(`\\b${k}:\\s*DS\\.size\\.(\\w+)`));
    const v = t ? SIZE_TOKENS[t[1]!] : undefined;
    if (typeof v === 'number') return v;
    // UI.group.key and deeper (UI.path.node.size): walk the token tree.
    const u = body.match(new RegExp(`\\b${k}:\\s*UI\\.([\\w.]+)`));
    const uv = u ? u[1]!.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], UI_TOKENS) : undefined;
    return typeof uv === 'number' ? uv : undefined;
  };
  const h = Math.max(num('minHeight') ?? 0, num('height') ?? 0);
  return { h: h || undefined, w: Math.max(num('minWidth') ?? 0, num('width') ?? 0) || undefined };
}

describe('touch targets >= 48dp', () => {
  for (const file of [...files(join(ROOT, 'app')), ...files(join(ROOT, 'src'))]) {
    const src = readFileSync(file, 'utf8');
    const pressables: string[][] = [];
    // Arrow bodies contain ">" — neutralise them so the opening tag ends at its real ">".
    const norm = src.replace(/=>/g, '=_');
    for (const m of norm.matchAll(/<Pressable[\s\S]*?>/g)) {
      pressables.push([...m[0].matchAll(/styles\.(\w+)/g)].map((x) => x[1]!));
    }
    if (pressables.length === 0) continue;
    it(`${file.replace(ROOT, '')}`, () => {
      const bad: string[] = [];
      for (const names of pressables) {
        if (names.some((n) => ALLOW.has(n))) continue;
        // A Pressable may layer state modifiers (on/off/disabled) over a base style:
        // the strongest declared height among them must reach the minimum.
        const best = Math.max(0, ...names.map((n) => declared(src, n)?.h ?? 0));
        if (best < MIN) bad.push(`[${names.join(', ')}] best height ${best}`);
      }
      expect(bad).toEqual([]);
    });
  }
});
