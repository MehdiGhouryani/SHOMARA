import { test, expect } from '@playwright/test';

test.describe('V1 critical web path', () => {
  test('web shell is RTL and reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: 'Math Learning Product' })).toBeVisible();
  });

  test('content manifest is independently addressable', async ({ request }) => {
    const response = await request.get('/api/v1/content/manifest?gradeId=G1', { headers: { 'x-dev-learning-identity-id': 'child-dev-01' } });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.gradeId).toBe('G1');
    const packages = [...(body.current ?? []), ...(body.next ?? []), ...(body.recent ?? []), ...(body.future ?? [])];
    expect(packages.length).toBeGreaterThan(0);
    expect(packages.every((item: any) => item.id && item.version && item.checksum && item.cacheClass)).toBeTruthy();
  });

  test('teacher assignment path exposes a bounded objective', async ({ page }) => {
    await page.goto('/teacher/assignments');
    await expect(page.getByRole('heading', { name: 'تکلیف کلاس' })).toBeVisible();
    await expect(page.getByText('Teacher فقط هدف و محدوده را تعیین می‌کند')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ساخت و انتشار تکلیف ST01' })).toBeVisible();
  });

  test('parent projection route is separate from learning runtime', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByText('Parent Lite')).toBeVisible();
  });
});
