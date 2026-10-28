import { spawnSync } from 'node:child_process';

function run(command, args, expected = 0) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  if (result.status !== expected) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}; expected ${expected}`);
  }
}

run(process.execPath, ['scripts/verify-migrations-static.mjs']);
run(process.execPath, ['scripts/verify-phase15-deep-remediation.mjs']);
run(process.execPath, ['scripts/runtime-tests.mjs']);
run(process.execPath, ['scripts/verify-production-readiness-static.mjs'], 0);
console.log('[PASS] Legacy deep-audit regression suite: static checks passed. Current roadmap pilot/release readiness remains gated by P02, P13 and P14.');
