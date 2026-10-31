import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertSchema,
  generateAll,
  generateKotlin,
  generateTypeScript,
  loadTokens,
} from '../../../tools/token-codegen/generate.mjs';

/**
 * N03-01 generated-files drift gate: the committed generated outputs must stay byte-identical
 * to what the canonical token JSON produces. Any tokens.json edit requires re-running
 * `node tools/token-codegen/generate.mjs` in the same change set.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('token codegen (N03-01)', () => {
  it('single canonical JSON: only packages/design-system/src/tokens.json drives all targets', () => {
    const tokens = loadTokens();
    expect(tokens.schemaVersion).toBe('2.0.0');
    expect(() => assertSchema(tokens)).not.toThrow();
  });

  it('committed generated files match the generator byte-for-byte (drift gate)', () => {
    for (const target of generateAll()) {
      const committed = fs.readFileSync(target.path, 'utf8');
      expect(committed).toBe(target.content);
    }
  });

  it('generator output is deterministic', () => {
    const tokens = loadTokens();
    expect(generateTypeScript(tokens)).toBe(generateTypeScript(loadTokens()));
    expect(generateKotlin(tokens)).toBe(generateKotlin(loadTokens()));
  });

  it('Kotlin surface covers every v2 token and uses no lowercase hex', () => {
    const tokens = loadTokens();
    const kotlin = generateKotlin(tokens);
    for (const key of Object.keys(tokens.v2.color)) {
      expect(kotlin).toContain(`Color${key.charAt(0).toUpperCase()}${key.slice(1)}`);
    }
    for (const key of Object.keys(tokens.v2.component)) {
      expect(kotlin).toContain(`Component${key.charAt(0).toUpperCase()}${key.slice(1)}`);
    }
    expect(kotlin).not.toMatch(/0xFF[0-9a-f]*[a-f][0-9a-f]*/);
    expect(kotlin).toContain('val ClayLevelFeatured = 3');
  });

  it('schema guard rejects schema, hex, spacing, touch-floor and clay-level drift', () => {
    const base = loadTokens();
    const tamper = (mutate: (t: Record<string, any>) => void) => {
      const copy: Record<string, any> = JSON.parse(JSON.stringify(base));
      mutate(copy);
      return () => expect(() => assertSchema(copy)).toThrow();
    };
    tamper((t) => { t.schemaVersion = '1.0.0'; })();
    tamper((t) => { t.v2.color.canvas = '#FFF8EG'; })();
    tamper((t) => { t.v2.component.touchMin = 44; })();
    tamper((t) => { t.v2.clay.levels.featured = 9; })();
    tamper((t) => { t.v2.space = [8, 4]; })();
    tamper((t) => { delete t.v2.clay; })();
  });

  it('outputs never contain v1-only token groups (v2 is the Native canonical per ADR-0037 L6)', () => {
    const tokens = loadTokens();
    const ts = generateTypeScript(tokens);
    // v1-only groups: brand/state palettes, size scale and ui block are not part of the v2 block.
    for (const v1Only of ['"brand"', '"state"', '"size"', '"ui"']) {
      expect(ts).not.toContain(v1Only);
    }
    // The generated surface mirrors the v2 block exactly: same key set, nothing added.
    const parsed = JSON.parse(ts.slice(ts.indexOf('{'), ts.lastIndexOf('}') + 1).replace(/\s+as const;$/, '').replace(/\n/g, '\n'));
    expect(Object.keys(parsed).sort()).toEqual(Object.keys(tokens.v2).sort());
  });
});
