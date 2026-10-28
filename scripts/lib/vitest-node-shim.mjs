/**
 * Minimal vitest-compatible shim (describe/it/expect) so vitest-style unit tests can run
 * on plain Node when the vitest dependency is not installed (BUILD_FIRST sandbox, VD-003).
 * It is NOT a replacement for `npm run test:unit`; it only executes the same test files.
 */
import { deepStrictEqual, ok } from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

const queue = [];
const prefix = [];
export function describe(name, fn) { prefix.push(name); try { fn(); } finally { prefix.pop(); } }
export function it(name, fn) { queue.push({ name: [...prefix, name].join(' › '), fn }); }
export const test = it;

function matcher(actual, negate = false) {
  const check = (cond, msg) => { if (negate ? cond : !cond) throw new Error((negate ? 'NOT ' : '') + msg); };
  const api = {
    toBe: (e) => check(Object.is(actual, e), `expected ${JSON.stringify(actual)} to be ${JSON.stringify(e)}`),
    toEqual: (e) => check(isDeepStrictEqual(JSON.parse(JSON.stringify(actual ?? null)), JSON.parse(JSON.stringify(e ?? null))), `expected ${JSON.stringify(actual)} to equal ${JSON.stringify(e)}`),
    toBeNull: () => check(actual === null, `expected ${JSON.stringify(actual)} to be null`),
    toBeTruthy: () => check(Boolean(actual), `expected ${JSON.stringify(actual)} to be truthy`),
    toBeFalsy: () => check(!actual, `expected ${JSON.stringify(actual)} to be falsy`),
    toContain: (e) => check(Array.isArray(actual) || typeof actual === 'string' ? actual.includes(e) : false, `expected ${JSON.stringify(actual)} to contain ${JSON.stringify(e)}`),
    toHaveLength: (n) => check(actual?.length === n, `expected length ${actual?.length} to be ${n}`),
    toBeGreaterThan: (n) => check(actual > n, `expected ${actual} > ${n}`),
    toMatchObject: (e) => check(Object.entries(e).every(([k, v]) => isDeepStrictEqual(actual?.[k], v)), `expected ${JSON.stringify(actual)} to match ${JSON.stringify(e)}`),
    toThrow: (needle) => {
      let threw = false; let message = '';
      try { actual(); } catch (err) { threw = true; message = String(err?.code ?? '') + ' ' + String(err?.message ?? err); }
      check(threw && (!needle || message.includes(needle)), `expected function to throw ${needle ?? ''} (got: ${message || 'no throw'})`);
    },
  };
  return api;
}

export function expect(actual) {
  const base = matcher(actual);
  base.not = matcher(actual, true);
  base.rejects = {
    toThrow: async (needle) => {
      let threw = false; let message = '';
      try { await actual; } catch (err) { threw = true; message = String(err?.code ?? '') + ' ' + String(err?.message ?? err); }
      if (!threw || (needle && !message.includes(needle))) throw new Error(`expected promise to reject with ${needle ?? ''} (got: ${message || 'resolved'})`);
    },
  };
  return base;
}

export async function run() {
  let failed = 0;
  for (const t of queue) {
    try { await t.fn(); console.log(`PASS  ${t.name}`); }
    catch (err) { failed += 1; console.log(`FAIL  ${t.name}\n      ${err?.stack?.split('\n').slice(0, 3).join('\n      ') ?? err}`); }
  }
  console.log(`\n${queue.length - failed}/${queue.length} tests passed`);
  queue.length = 0;
  return failed;
}
void deepStrictEqual; void ok;
