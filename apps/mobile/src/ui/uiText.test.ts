import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Child-facing copy guard (Phase 2 PASS): no system jargon / raw enums / English
 * sentences may appear in string literals or JSX text of the child UI.
 * Dev-only screens and the character bible's internal ids are excluded.
 */
const ROOT = join(__dirname, '..', '..');
const SKIP = new Set(['animation.tsx', 'SemanticAnimationDemo.tsx']); // dev-only animation lab (hidden from release builds)

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === 'assets' || name === 'plugins') continue;
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(tsx)$/.test(name) && !SKIP.has(name)) out.push(p);
  }
  return out;
}

const BANNED = [
  /Learning\s*(Runtime|Truth|Engine)/i,
  /Station\s*Pass/i,
  /\bUNKNOWN\b/,
  /\bNEEDS_REVIEW\b|\bBUILDING\b|\bMASTERED\b/,
  /مسترشدن/,
  /\bCheck\s*[AB]\b/,
  /fetch failed|REMOTE_RUNTIME/i,
  /اشتباه است|رد شد|بازنده|ضعیف/,
];

const PERSIAN = /[\u0600-\u06FF]/;

/**
 * "Visible" = anything a child could read: JSX text, and any string literal that
 * contains Persian letters (internal ids/enums/error codes never do).
 */
function visibleStrings(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)) if (PERSIAN.test(m[2]!)) out.push(m[2]!);
  for (const m of src.matchAll(/>([^<>{}=;]+)</g)) out.push(m[1]!);
  return out;
}

describe('child UI copy guard', () => {
  const targets = [...files(join(ROOT, 'app')), ...files(join(ROOT, 'src'))];
  it('scans a meaningful number of files', () => expect(targets.length).toBeGreaterThan(8));
  for (const file of targets) {
    it(`no jargon / English leaks in ${file.replace(ROOT, '')}`, () => {
      const strings = visibleStrings(readFileSync(file, 'utf8'));
      const hits = strings.filter((t) => BANNED.some((re) => re.test(t)));
      expect(hits).toEqual([]);
    });
  }
});

describe('strings module', () => {
  it('has Persian copy only (no Latin words except placeholders)', async () => {
    const { S } = await import('./strings.fa');
    const flat: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === 'string') flat.push(v);
      else if (typeof v === 'function') flat.push((v as (...a: string[]) => string)('نام', 'ب'));
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(S);
    expect(flat.filter((t) => /[A-Za-z]{3,}/.test(t))).toEqual([]);
  });
});
