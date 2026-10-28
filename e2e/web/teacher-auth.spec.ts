import { test, expect } from '@playwright/test';

test.describe('Teacher Authentication & Direct Role Resolution (Prompt 3.5)', () => {
  test('1. API: Rejects invalid credentials and non-teacher accounts, accepts approved teacher and returns database roles', async ({
    request,
  }) => {
    // A. Rejection on missing username/password
    const missingRes = await request.post('/api/v1/teacher/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { username: '' },
    });
    expect(missingRes.status()).toBe(400);

    // B. Rejection on non-existent credentials
    const invalidRes = await request.post('/api/v1/teacher/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { username: 'unknown_user_123', password: 'wrongpassword' },
    });
    expect(invalidRes.status()).toBe(401);

    // C. Rejection on non-teacher account (parent_user has PARENT role, not TEACHER)
    const nonTeacherRes = await request.post('/api/v1/teacher/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { username: 'parent_user', password: 'ParentPass123!' },
    });
    expect(nonTeacherRes.status()).toBe(403);
    const nonTeacherBody = await nonTeacherRes.json();
    expect(nonTeacherBody.code).toBe('FORBIDDEN');

    // D. Successful login with approved teacher credentials
    const teacherRes = await request.post('/api/v1/teacher/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: { username: 'teacher_zahra', password: 'TeacherPass123!' },
    });
    expect(teacherRes.status()).toBe(200);
    const teacherBody = await teacherRes.json();
    expect(teacherBody.success).toBe(true);
    expect(teacherBody.session).toBeDefined();
    expect(teacherBody.session.username).toBe('teacher_zahra');
    expect(teacherBody.session.roles).toContain('TEACHER');
    expect(teacherBody.session.isTeacher).toBe(true);
  });

  // Retired 2026-10-04 (P02-A): teacher web pages were removed by design (docs/reference/ADULT_SURFACE.md).
  // The API lifecycle test above remains active. Re-enable only if a separate Teacher product reintroduces /teacher.
  test.skip('2. Full Browser Journey: Login -> Direct Teacher Area Entrance -> Session Refresh -> Logout', async ({
    page,
    context,
  }) => {
    // Clear cookies to ensure fresh unauthenticated start
    await context.clearCookies();

    // 1. Visit /teacher
    await page.goto('http://127.0.0.1:3000/teacher');
    await page.waitForLoadState('networkidle');

    // 2. Click "ورود به حساب معلمان"
    const loginMenuBtn = page.locator('button:has-text("ورود به حساب معلمان")').first();
    await expect(loginMenuBtn).toBeVisible();
    await loginMenuBtn.click();
    await page.waitForTimeout(300);

    // 3. Verify Login Screen has NO role picker and only username/password
    await expect(page.getByRole('heading', { name: /ورود به حساب معلمان|ورود معلم/ })).toBeVisible();
    
    // Find username & password inputs
    const usernameInput = page.locator('input[placeholder*="teacher"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Ensure no role select or role radio button is present
    await expect(page.locator('select')).toHaveCount(0);

    // 4. Fill credentials of verified teacher
    await usernameInput.fill('teacher_zahra');
    await passwordInput.fill('TeacherPass123!');

    // 5. Submit form
    const submitBtn = page.locator('button:has-text("ورود")').first();
    await submitBtn.click();

    // 6. Must navigate directly to Teacher Area
    await page.waitForURL('**/teacher/area', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Teacher Area' })).toBeVisible();
    await expect(page.locator('text=تأییدشده ✓')).toBeVisible();
    await expect(page.locator('text=TEACHER').first()).toBeVisible();
    await expect(page.locator('text=مریم کریمی')).toBeVisible();

    // 7. Verify session persistence on page reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Teacher Area' })).toBeVisible();
    await expect(page.locator('text=تأییدشده ✓')).toBeVisible();

    // 8. Test Real Logout
    const logoutBtn = page.locator('button:has-text("خروج از حساب")').first();
    await logoutBtn.click();
    await page.waitForTimeout(600);

    // Must navigate back to /teacher
    await expect(page.getByRole('heading', { name: 'معلمان' })).toBeVisible();

    // 9. Unauthorized direct access to /teacher/area should be prevented
    await page.goto('http://127.0.0.1:3000/teacher/area');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=دسترسی غیرمجاز').or(page.getByRole('heading', { name: 'معلمان' }))).toBeVisible();
  });
});
