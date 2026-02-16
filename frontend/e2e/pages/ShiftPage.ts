import { Page, Locator, expect } from '@playwright/test';

/**
 * Shift Page Object
 * Handles shift management operations
 */
export class ShiftPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly openShiftButton: Locator;
  readonly closeShiftButton: Locator;
  readonly shiftStatusOpen: Locator;
  readonly shiftStatusClosed: Locator;
  readonly totalSalesCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'إدارة الوردية' });
    this.openShiftButton = page.getByRole('button', { name: /فتح وردية جديدة/i });
    this.closeShiftButton = page.getByRole('button', { name: /إغلاق الوردية/i }).first();
    this.shiftStatusOpen = page.locator('text=🟢 الوردية مفتوحة');
    this.shiftStatusClosed = page.locator('text=🔴 لا توجد وردية مفتوحة');
    this.totalSalesCard = page.locator('text=إجمالي المبيعات').locator('..');
  }

  async goto() {
    await this.page.goto('/shift');
    await this.page.waitForLoadState('networkidle');
    // Wait for page content to load
    await this.page.waitForTimeout(1500);
  }

  async isShiftOpen(): Promise<boolean> {
    await this.page.waitForTimeout(500);
    // Check for open status indicator
    const openIndicator = this.page.locator('text=🟢 الوردية مفتوحة');
    const closedIndicator = this.page.locator('text=🔴 لا توجد وردية مفتوحة');
    
    if (await openIndicator.isVisible()) return true;
    if (await closedIndicator.isVisible()) return false;
    
    // If neither is visible, wait and check again
    await this.page.waitForTimeout(1000);
    return await openIndicator.isVisible();
  }

  async openShift(openingBalance: number = 0) {
    await this.openShiftButton.click();
    // Wait for modal
    await this.page.waitForTimeout(300);
    // Fill opening balance in modal
    const balanceInput = this.page.locator('input[type="number"]').first();
    await balanceInput.fill(openingBalance.toString());
    // Click confirm button in modal (the one inside modal, not the main button)
    const confirmBtn = this.page.getByRole('button', { name: /فتح الوردية/i }).last();
    await confirmBtn.click();
    // Wait for modal to close and status to update
    await this.page.waitForTimeout(1000);
    await expect(this.shiftStatusOpen).toBeVisible({ timeout: 15000 });
  }

  async closeShift(closingBalance: number = 0) {
    // Wait for close button to be visible
    await expect(this.closeShiftButton).toBeVisible({ timeout: 10000 });
    await this.closeShiftButton.click();
    // Wait for modal
    await this.page.waitForTimeout(500);
    // Fill closing balance in modal
    const balanceInput = this.page.locator('input[type="number"]').first();
    await balanceInput.fill(closingBalance.toString());
    // Click confirm button in modal - look for the button inside the modal
    const modal = this.page.locator('[class*="fixed"]').filter({ hasText: 'إغلاق الوردية' });
    const confirmBtn = modal.getByRole('button', { name: /إغلاق الوردية/i });
    await confirmBtn.click();
    // Wait for modal to close and status to update
    await this.page.waitForTimeout(2000);
  }

  async expectShiftOpen() {
    await expect(this.shiftStatusOpen).toBeVisible();
  }

  async expectShiftClosed() {
    await expect(this.shiftStatusClosed).toBeVisible();
  }

  async getTotalSales(): Promise<string> {
    const salesText = await this.totalSalesCard.locator('p.text-xl').textContent();
    return salesText || '0';
  }
}
