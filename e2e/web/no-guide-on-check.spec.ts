import { test, expect } from '@playwright/test';
// P01: character bible v2 §5. Assessment (CHECK) never renders a guide.
test('CHECK node renders no .sh-char inside the lesson', async ({ page }) => {
  await page.goto('/');
  const check = page.locator('[data-node-type="CHECK"]').first();
  test.skip(!(await check.count()), 'CHECK node not reachable in this build');
  await check.click();
  await expect(page.locator('[role="dialog"] .sh-char')).toHaveCount(0);
});
