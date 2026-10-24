import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/web',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'fa-IR',
    ...devices['Desktop Chrome'],
  },
  webServer: process.env.E2E_START_SERVER === '1'
    ? {
        command: 'npm --workspace @math/web run dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: true,
        env: { ALLOW_DEV_PRINCIPAL: '1' },
        timeout: 120_000,
      }
    : undefined,
});
