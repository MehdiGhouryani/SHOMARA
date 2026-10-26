#!/usr/bin/env node
/**
 * Wave A3/A9 static guard: answer-key boundary + RLS coverage.
 *
 * Verifies (statically, no live database):
 *  1. Every table created in supabase/migrations has an `enable row level security` statement.
 *  2. Every `security definer` function pins `set search_path`.
 *  3. The web layer strips evaluator/answer-key fields from learning encounter responses
 *     (learning-client-content.ts used by both the production RPC path and the in-memory path),
 *     and no API route echoes `evaluatorConfig`/`expectedAnswers` verbatim.
 *
 * Live RLS behaviour (positive/negative with a real JWT) is BLOCKED_LIVE_SUPABASE and is NOT
 * claimed here. This verifier only locks what can be proven from the repository itself.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

// ---------------------------------------------------------------------------
// 1. RLS coverage per table
// ---------------------------------------------------------------------------
const migrationsDir = path.join(root, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
if (migrationFiles.length === 0) throw new Error('No migrations found');

const createdTables = new Set();
const rlsTables = new Set();
for (const file of migrationFiles) {
  const sql = read(path.join('supabase', 'migrations', file));
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-zA-Z0-9_]+)"?\s*\(/gi)) {
    createdTables.add(m[1].toLowerCase());
  }
  for (const m of sql.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(?:public\.)?"?([a-zA-Z0-9_]+)"?\s+enable\s+row\s+level\s+security/gi)) {
    rlsTables.add(m[1].toLowerCase());
  }
}
const withoutRls = [...createdTables].filter((t) => !rlsTables.has(t));
must(createdTables.size > 0, `Collected ${createdTables.size} created tables across ${migrationFiles.length} migrations`);
must(withoutRls.length === 0, `Every created table enables RLS${withoutRls.length ? ` (missing: ${withoutRls.join(', ')})` : ''}`);

// ---------------------------------------------------------------------------
// 2. SECURITY DEFINER functions pin search_path
// ---------------------------------------------------------------------------
let definerCount = 0;
for (const file of migrationFiles) {
  const sql = read(path.join('supabase', 'migrations', file));
  const re = /create\s+(?:or\s+replace\s+)?function[\s\S]*?;\s*$/gim;
  // Split into function blocks: from each "create ... function" to the terminating "$$;" or ";"
  const starts = [...sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s/gi)].map((m) => m.index);
  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i];
    const to = i + 1 < starts.length ? starts[i + 1] : sql.length;
    const block = sql.slice(from, to);
    // The function header ends at the first "as $$"-style body delimiter.
    const headerMatch = /\$\$/.exec(block);
    const header = headerMatch ? block.slice(0, headerMatch.index) : block;
    if (!/security\s+definer/i.test(header)) continue;
    definerCount += 1;
    if (!/set\s+search_path/i.test(header)) {
      throw new Error(`SECURITY DEFINER function without set search_path in ${file}: ${block.slice(0, 120)}...`);
    }
  }
}
must(definerCount > 0, `All ${definerCount} SECURITY DEFINER functions pin set search_path`);

// ---------------------------------------------------------------------------
// 3. Web boundary: evaluator/answer-key fields never leave the server
// ---------------------------------------------------------------------------
const sanitizer = read('apps/web/lib/learning-client-content.ts');
for (const key of ['evaluatorConfig', 'evaluator_config', 'expectedAnswers', 'expected_answers']) {
  must(sanitizer.includes(`'${key}'`), `Sanitizer strips ${key}`);
}
must(sanitizer.includes('export function toClientEncounter'), 'Sanitizer exports toClientEncounter');

const productionRuntime = read('apps/web/lib/learning-runtime-production.ts');
must(
  productionRuntime.includes('toClientEncounter') && productionRuntime.includes("from './learning-client-content'"),
  'Production learning runtime sanitizes the runtime_create_encounter payload before it reaches the client',
);

const encountersRoute = read('apps/web/app/api/v1/learning/sessions/[sessionId]/encounters/route.ts');
must(
  encountersRoute.includes('toClientEncounter(encounter)'),
  'In-memory encounter route applies the same client-boundary sanitizer',
);

const apiDir = path.join(root, 'apps', 'web', 'app', 'api');
const offenders = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(p); continue; }
    if (!entry.name.endsWith('.ts')) continue;
    const src = fs.readFileSync(p, 'utf8');
    if (/evaluatorConfig|expected_answers|expectedAnswers/.test(src)) offenders.push(path.relative(root, p));
  }
})(apiDir);
must(offenders.length === 0, `No API route references evaluator/answer-key fields${offenders.length ? ` (offenders: ${offenders.join(', ')})` : ''}`);

console.log('ANSWER_KEY_BOUNDARY_STATIC_GUARD: PASS');
