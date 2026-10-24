import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const webDir = path.resolve(rootDir, 'apps/web');

try {
  console.log('[Dev Server] Building workspace packages...');
  execSync('npm run build:packages', { cwd: rootDir, stdio: 'inherit' });
} catch (e) {
  console.warn('[Dev Server] Warning during build:packages:', e.message);
}

const buildIdFile = path.join(webDir, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdFile)) {
  console.log('[Dev Server] Building Next.js web application...');
  execSync('npx next build', {
    cwd: webDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
}

console.log('[Dev Server] Starting Next.js server on 0.0.0.0:3000...');
const child = spawn('npx', ['next', 'start', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: webDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3000',
    HOSTNAME: '0.0.0.0',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
