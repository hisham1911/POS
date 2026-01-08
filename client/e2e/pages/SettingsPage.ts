import { Page, Locator, expect } from '@playwright/test';

/**
 * Settings Page Object
 * Handles company settings and tax configuration
 */
export class SettingsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly taxRateInput: Locator;
  readonly taxToggle: Locator;
  readonly saveButton: Locator;
  readonly companyNameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'إعدادات الشركة' });
    this.taxRateInput = page.locator('input[type="number"][min="0"][max="100"]');
    this.taxToggle = page.locator('button').filter({ has: page.locator('svg.w-8.h-8') });
    this.saveButton = page.getByRole('button', { name: /حفظ الإعدادات/i });
    this.companyNameInput = page.locator('input[placeholder="اسم الشركة"]');
  }

  async goto() {
    await this.page.goto('/settings');
    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
    // Check if we're on settings page
    await expect(this.page).toHaveURL(/\/settings/);
  }

  async getTaxRate(): Promise<string> {
    return await this.taxRateInput.inputValue();
  }

  async setTaxRate(rate: number) {
    await this.taxRateInput.clear();
    await this.taxRateInput.fill(rate.toString());
  }

  async save() {
    await this.saveButton.click();
  }

  async expectSuccessToast() {
    // Wait for success toast (sonner toast)
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: /تم|حفظ|بنجاح/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
  }

  async expectTaxRateToBe(rate: number) {
    await expect(this.taxRateInput).toHaveValue(rate.toString());
  }
}
