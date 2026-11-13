#!/usr/bin/env node
/**
 * Content pipeline CLI (P7) — repeatable entrypoint (npm run content:pipeline -- <cmd>).
 *   validate       run the ContentValidator over an authoring artifact (default ST07)
 *   promote        attempt a lifecycle transition (gates + evidence enforced)
 *   build-package  build published/child/asset-manifest/manifest/diff artifacts
 *   status         print the current lifecycle position for a station
 */
import path from 'node:path';
import { AUTHORING, validateStation } from './lib/context.mjs';
import { promote, currentState } from './promote.mjs';
import { buildPackage } from './build-package.mjs';
import fs from 'node:fs';

const [cmd, arg, extra] = process.argv.slice(2);
const stationId = arg ?? 'ST07';

async function main() {
  switch (cmd) {
    case 'validate': {
      const file = path.join(AUTHORING, 'stations', `${stationId}.json`);
      const result = await validateStation(file);
      const machineOnly = process.argv.includes('--machine-only');
      const machineViolations = result.violations.filter((v) => !['review-roles', 'rights-moderation'].includes(v.rule));
      const effective = machineOnly ? { ok: machineViolations.length === 0, violations: machineViolations, warnings: result.violations.filter((v) => ['review-roles', 'rights-moderation'].includes(v.rule)) } : result;
      console.log(JSON.stringify({ stationId, machineOnly, ok: effective.ok, violations: effective.violations, ...(effective.warnings ? { warnings: effective.warnings } : {}) }, null, 2));
      process.exit(effective.ok ? 0 : 1);
      return;
    }
    case 'promote': {
      const result = await promote(stationId, extra ?? 'STAGED', { actor: 'cli' });
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
      return;
    }
    case 'build-package': {
      const result = await buildPackage(stationId, Number(process.argv[4] ?? 1));
      console.log(JSON.stringify({ ok: result.ok, outDir: result.outDir, leakClean: result.diffReport?.leakClean, reason: result.reason }, null, 2));
      process.exit(result.ok ? 0 : 1);
      return;
    }
    case 'status': {
      const { currentState, loadLedger } = await import('./promote.mjs');
      console.log(JSON.stringify({ stationId, stage: currentState(loadLedger(), stationId) }, null, 2));
      return;
    }
    default: {
      console.log('commands: validate | promote <STAGE> | build-package | status');
      console.log('(fs check) authoring dir exists:', fs.existsSync(AUTHORING));
      process.exit(2);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
