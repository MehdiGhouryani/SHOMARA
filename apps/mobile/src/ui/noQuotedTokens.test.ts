import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') walk(p, out); }
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

describe('design tokens are real references, never string literals', () => {
  it("no source file contains a quoted 'DS.<token>' literal (renders as an invalid colour/size)", () => {
    const root = join(__dirname, '..', '..');
    const offenders: string[] = [];
    for (const dir of [join(root, 'app'), join(root, 'src')]) {
      for (const file of walk(dir)) {
        if (/['"`]DS\.[A-Za-z]/.test(readFileSync(file, 'utf8'))) offenders.push(file.replace(root, ''));
      }
    }
    expect(offenders).toEqual([]);
  });
});
