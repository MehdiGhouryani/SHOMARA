import { spawnSync } from 'node:child_process';

const checks = [
  ['UX-P03', 'scripts/verify-uiux-phase3.mjs'],
  ['UX-P04', 'scripts/verify-uiux-phase4.mjs'],
  ['UX-P05', 'scripts/verify-uiux-phase5.mjs'],
  ['UX-P06', 'scripts/verify-uiux-phase6.mjs'],
  ['UX-P07', 'scripts/verify-uiux-phase7.mjs'],
  ['UX-P07.5', 'scripts/verify-uiux-phase7-5.mjs'],
  ['UX-P08', 'scripts/verify-uiux-phase8.mjs'],
  ['UX-P08.5', 'scripts/verify-uiux-path2.mjs'],
  ['UX-P09', 'scripts/verify-uiux-phase9.mjs'],
  ['Android release', 'scripts/verify-mobile-release.mjs'],
  ['Production static gate', 'scripts/verify-production-readiness-static.mjs'],
  ['Migration static gate', 'scripts/verify-migrations-static.mjs'],
];

for (const [label, file] of checks) {
  const result = spawnSync(process.execPath, [file], { encoding: 'utf8' });
  process.stdout.write(`[${result.status === 0 ? 'PASS' : 'FAIL'}] ${label}\n`);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 2);
  }
}

console.log('UX-P10_FINAL_STATIC_GATE: PASS');
