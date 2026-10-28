import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { '@': path.resolve(root, 'apps/web') } },
  test: {
    include: [
      'packages/contracts/src/**/*.test.ts',
      'packages/learning-runtime/src/__tests__/**/*.test.ts',
      'packages/offline-sync/src/**/*.test.ts',
      'packages/assignment-runtime/src/**/*.test.ts',
      'packages/challenge-runtime/src/**/*.test.ts',
      'packages/design-system/src/**/*.test.ts',
      'apps/mobile/src/**/*.test.ts',
      'apps/web/lib/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    globals: true,
  },
});
