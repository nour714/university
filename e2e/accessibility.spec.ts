import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Accessibility Audits', () => {
  test('5.1 /login page has zero critical or serious accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalOrSerious = scanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalOrSerious).toEqual([]);
  });

  test('5.2 Authenticated dashboard (/) has zero critical or serious accessibility violations', async ({ page, isMobile }) => {
    const nationalId = isMobile ? '30504150103428' : '30411182103719';
    await page.goto('/login');
    await page.locator('#loginIdentifier').fill(nationalId);
    await page.locator('#loginPassword').fill('Student@2026');
    await page.locator('button[type="submit"]').click();

    // Deterministically wait for navigation
    await page.waitForURL(/\/(account\/change-password|#.*)?$/, { timeout: 15000 });

    if (page.url().includes('/account/change-password')) {
      await page.locator('#changeCurrentPassword').fill('Student@2026');
      await page.locator('#changeNewPassword').fill('AxePassword2026!');
      await page.locator('#changeConfirmPassword').fill('AxePassword2026!');
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL(/\/(#.*)?$/, { timeout: 15000 });
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalOrSerious = scanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalOrSerious).toEqual([]);
  });
});
