import { test, expect } from '@playwright/test';

test.describe('End-to-End Auth, mustChangePassword Gate, Portal Navigation & Logout Flow', () => {
  test('3 & 4 Full Auth Lifecycle: mustChangePassword isolation -> update password -> portal navigation -> clean logout', async ({ page, isMobile }) => {
    // Monitor console errors and 4xx/5xx network failures during portal session
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless browser/extension logs if any
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      if (status >= 400 && !url.includes('/api/auth/clear') && !url.includes('/favicon.ico')) {
        failedRequests.push(`${status} ${url}`);
      }
    });

    // 1. Visit Login
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    const initialPassword = 'Student@2026';
    const updatedPassword = 'NewSecurePassword2026!';

    // 1.5 Verify that attempting login with 8-digit Academic ID is rejected
    await page.locator('#loginIdentifier').fill('20230815');
    await page.locator('#loginPassword').fill(initialPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#loginIdentifierError')).toBeVisible();
    await expect(page.locator('#loginIdentifierError')).toContainText('يرجى إدخال الرقم القومي المكوّن من 14 رقماً');

    // 2. Login with seeded must_change_password=true student
    const testNationalId = isMobile ? '30409230104226' : '30405120102513';
    const studentName = isMobile ? 'ساره نبيل ابوالمجد' : 'نور الدين وائل عبدالرؤف';

    await page.locator('#loginIdentifier').fill(testNationalId);
    await page.locator('#loginPassword').fill(initialPassword);
    await page.locator('button[type="submit"]').click();

    // 3. Enforce deterministic redirection to /account/change-password
    await expect(page).toHaveURL(/\/account\/change-password/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('تحديث كلمة المرور');

    // 4. Verify that trying to jump to / while mustChangePassword=true redirects back to change-password
    await page.goto('/');
    await expect(page).toHaveURL(/\/account\/change-password/);

    // 5. Submit password change
    await page.locator('#changeCurrentPassword').fill(initialPassword);
    await page.locator('#changeNewPassword').fill(updatedPassword);
    await page.locator('#changeConfirmPassword').fill(updatedPassword);
    await page.locator('button[type="submit"]').click();

    // 6. Verify successful password update and redirection to dashboard (/)
    await expect(page).toHaveURL(/\/(#.*)?$/, { timeout: 15000 });
    await expect(page.locator('header h2').filter({ hasText: 'كلية الذكاء الاصطناعي' })).toBeVisible();
    await expect(page.locator('main h1').filter({ hasText: studentName })).toBeVisible();

    // Verify sidebar/header logo has valid dimensions (not broken)
    const logoImg = page.locator('img[alt*="شعار"]:visible').first();
    await expect(logoImg).toBeVisible();
    const logoWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(logoWidth).toBeGreaterThan(0);

    // 7. Navigate through all academic portal routes
    const routesToTest = ['/courses', '/exams', '/codes', '/settings'];
    for (const route of routesToTest) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route));
      await page.waitForLoadState('networkidle');
    }

    // Verify zero console errors and zero failed network requests during authenticated browsing
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);

    // 8. Intentional Logout
    if (isMobile) {
      // On mobile, open more menu and click logout
      const moreBtn = page.locator('button[aria-label="المزيد من الخيارات"]').first();
      await expect(moreBtn).toBeVisible();
      await moreBtn.click();
      const logoutBtn = page.locator('button:has-text("تسجيل الخروج")');
      await expect(logoutBtn).toBeVisible();
      await logoutBtn.click();
    } else {
      // On desktop, click sidebar logout button
      const logoutBtn = page.locator('button[aria-label="تسجيل الخروج من البوابة الأكاديمية"]');
      await expect(logoutBtn).toBeVisible();
      await logoutBtn.click();
    }

    // 9. Verify redirected to /login with reason=logged_out and Arabic success message
    await expect(page).toHaveURL(/\/login\?reason=logged_out/, { timeout: 10000 });
    await expect(page.locator('text=تم تسجيل الخروج بنجاح')).toBeVisible();

    // 10. Attempting to revisit protected route (/) redirects to /login
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
