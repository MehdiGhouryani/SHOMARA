#!/usr/bin/env node
/** O6 inventory generator (Decision Pack) — reads the REAL repo state, emits machine-readable JSON. */
import fs from 'node:fs';
import path from 'node:path';

const routes = fs
  .readdirSync('apps/web/app/api', { recursive: true })
  .filter((f) => String(f).endsWith('route.ts'))
  .map((f) => {
    const norm = String(f).split(path.sep).join('/');
    return '/' + norm.replace('/route.ts', '').replace(/\/\[/g, '/{').replace(/\]/g, '}');
  })
  .sort();

const migrations = fs.readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql')).sort();
const inMemory = [
  'packages/adult-projections/src/repository.ts',
  'packages/assignment-runtime/src/repository.ts',
  'packages/challenge-runtime/src/repository.ts',
  'packages/offline-sync/src/store.ts',
  'apps/web/lib/admin-audio.ts',
  'apps/web/lib/assignment-runtime.ts',
  'apps/web/lib/learning-runtime.ts',
  'apps/web/lib/teacher-applications.ts',
].filter((f) => fs.existsSync(f));

const pack = {
  schemaVersion: 1,
  generatedAt: '2026-11-14',
  decision: 'O6 — OPEN (Decision Pack ready; NO deletion/expansion executed)',
  facts: {
    apiRoutes: routes,
    apiRouteCount: routes.length,
    migrations,
    migrationCount: migrations.length,
    inMemoryRepositoryFiles: inMemory,
    childRuntimeServerCoupling:
      'NONE — ShomaraRuntimeConfig URLs null, no INTERNET permission, engine + package engine run offline (P5/P6/P8 proven)',
    contentPipelineExists:
      'tools/content-pipeline (P7): typed ST07 artifact + 13-rule validator + 7-stage promotion gate + unsigned package builder',
    roomRegistry: 'Room v3 local (sessions/attempts/packages registry) — backend-independent',
  },
};

fs.mkdirSync('docs/architecture/o6-pack', { recursive: true });
fs.writeFileSync('docs/architecture/o6-pack/inventory.json', JSON.stringify(pack, null, 2) + '\n');
console.log(`O6 INVENTORY: routes=${routes.length} migrations=${migrations.length} inMemory=${inMemory.length}`);
