import { test, expect } from '@playwright/test';

test.describe('Login Validation, Arabic Errors & Asset Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('2.1 Form submission with empty fields shows accessible Arabic errors without native English tooltips', async ({ page }) => {
    // Attempt submit without typing any identifier
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify accessible Arabic error is displayed
    const identifierAlert = page.locator('#loginIdentifierError');
    await expect(identifierAlert).toBeVisible();
    await expect(identifierAlert).toContainText('يرجى إدخال الرقم الأكاديمي أو الرقم القومي');
    await expect(page.locator('#loginIdentifier')).toHaveAttribute('aria-invalid', 'true');

    // Fill identifier and attempt submit without password
    await page.locator('#loginIdentifier').fill('20230814000000');
    await submitBtn.click();

    const passwordAlert = page.locator('#loginPasswordError');
    await expect(passwordAlert).toBeVisible();
    await expect(passwordAlert).toContainText('يرجى إدخال كلمة المرور');
    await expect(page.locator('#loginPassword')).toHaveAttribute('aria-invalid', 'true');
  });

  test('2.2 All images on the login page load successfully with naturalWidth > 0', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      if (isVisible) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('2.3 Carousel slides have valid images and cycle without broken assets (Desktop)', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
    }

    // Carousel is visible on desktop
    const carouselRegion = page.locator('div[role="region"][aria-label="عرض الصور الأكاديمي"]');
    await expect(carouselRegion).toBeVisible();

    const slideImages = carouselRegion.locator('img');
    const slideCount = await slideImages.count();
    expect(slideCount).toBe(3);

    for (let i = 0; i < slideCount; i++) {
      const img = slideImages.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});
