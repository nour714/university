import { test, expect } from '@playwright/test';

test.describe('Routing, 404 & Health Check Endpoints', () => {
  test('1.1 Unauthenticated navigation to / redirects deterministically to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('تسجيل الدخول');
  });

  test('1.2 Nonexistent route /nonexistent-page-test renders custom Arabic 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page-test');
    await expect(page.locator('h1')).toContainText('الصفحة غير موجودة');
    await expect(page.locator('text=خطأ 404')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toContainText('العودة للرئيسية');
  });

  test('1.3 /api/health returns 200 with minimal JSON and hardened security headers', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    // Verify minimal status JSON without leaked internal versions, hostnames or stack traces
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.ok).toBe(true);
    expect(body.timestamp).toBeDefined();
    expect(body.commit).toBe('production');

    // Verify hardened cache-control headers
    const headers = response.headers();
    expect(headers['cache-control']).toContain('no-store');
  });
});
