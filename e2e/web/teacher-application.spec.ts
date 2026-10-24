import { test, expect } from '@playwright/test';

test.describe('Teacher Application Flow & Lifecycle', () => {
  test('1. API: validates input, creates record with strict PENDING status, and serves status by ID', async ({
    request,
  }) => {
    // 1. Rejection on empty payload
    const emptyRes = await request.post('/api/v1/teacher/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(emptyRes.status()).toBe(400);
    const emptyBody = await emptyRes.json();
    expect(emptyBody.code).toBe('VALIDATION_ERROR');

    // 2. Rejection on invalid phone
    const invalidPhoneRes = await request.post('/api/v1/teacher/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        firstName: 'زهرا',
        lastName: 'محمدی',
        phoneNumber: '12345',
        schoolName: 'دبستان شکوفه‌ها',
        city: 'اصفهان',
      },
    });
    expect(invalidPhoneRes.status()).toBe(400);

    // 3. Successful submission
    const validRes = await request.post('/api/v1/teacher/applications', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        firstName: 'زهرا',
        lastName: 'محمدی',
        phoneNumber: '09123456789',
        schoolName: 'دبستان شکوفه‌ها',
        city: 'اصفهان',
        notes: 'آموزگار پایه دوم',
      },
    });
    expect(validRes.status()).toBe(201);
    const validBody = await validRes.json();
    expect(validBody.success).toBe(true);
    expect(validBody.application).toBeDefined();
    expect(validBody.application.id).toBeDefined();
    expect(validBody.application.status).toBe('PENDING');
    expect(validBody.application.firstName).toBe('زهرا');
    expect(validBody.application.lastName).toBe('محمدی');
    expect(validBody.application.schoolName).toBe('دبستان شکوفه‌ها');

    const applicationId = validBody.application.id;

    // 4. Fetch status by ID
    const statusRes = await request.get(`/api/v1/teacher/applications/${applicationId}`);
    expect(statusRes.ok()).toBeTruthy();
    const statusBody = await statusRes.json();
    expect(statusBody.id).toBe(applicationId);
    expect(statusBody.status).toBe('PENDING');
  });

  // Retired 2026-10-04 (P02-A): teacher web pages were removed by design (docs/reference/ADULT_SURFACE.md).
  // The API lifecycle test above remains active. Re-enable only if a separate Teacher product reintroduces /teacher.
  test.skip('2. Web UI: Full submission journey from /teacher with instant confirmation and PENDING state display', async ({
    page,
  }) => {
    await page.goto('http://127.0.0.1:3000/teacher');
    await page.waitForLoadState('networkidle');

    // Verify main page elements
    await expect(page.getByRole('heading', { name: 'معلمان' })).toBeVisible();

    // Click "ثبت درخواست حساب معلم"
    const openFormBtn = page.locator('button:has-text("ثبت درخواست حساب معلم")').first();
    await openFormBtn.click();
    await page.waitForTimeout(400);

    // Form elements must be visible
    await expect(page.getByText(/فرم درخواست همکاری \/ درخواست حساب/)).toBeVisible();
    await expect(page.getByText(/ارسال درخواست به منزله دسترسی فوری نیست/)).toBeVisible();

    // Fill form
    await page.locator('input[placeholder="مثال: مریم"]').fill('مریم');
    await page.locator('input[placeholder="مثال: کریمی"]').fill('کریمی');
    await page.locator('input[placeholder="۰۹۱۲۳۴۵۶۷۸۹"]').fill('09129876543');
    await page.locator('input[placeholder="دبستان شهید بهشتی"]').fill('دبستان آفتاب');
    await page.locator('input[placeholder="تهران - منطقه ۵"]').fill('شیراز - ناحیه ۱');
    await page.locator('textarea').fill('آموزگار ریاضی پایه اول و دوم');

    // Submit form
    const submitBtn = page.locator('button:has-text("ارسال درخواست همکاری و بررسی حساب")').first();
    await submitBtn.click();
    await page.waitForTimeout(600);

    // Verify success confirmation card
    await expect(page.getByText(/درخواست شما با موفقیت ثبت شد/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/در انتظار بررسی \(PENDING\)/)).toBeVisible();
    await expect(page.getByText(/کد پیگیری درخواست:/)).toBeVisible();
    await expect(page.getByText(/مریم کریمی/)).toBeVisible();
    await expect(page.getByText(/دبستان آفتاب \(شیراز - ناحیه ۱\)/)).toBeVisible();
  });
});
