import { Page, Locator, expect } from '@playwright/test';

/**
 * Reports Page Object
 * Handles daily report viewing
 */
export class ReportsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly dateInput: Locator;
  readonly totalSalesCard: Locator;
  readonly completedOrdersCard: Locator;
  readonly taxCard: Locator;
  readonly cashCard: Locator;
  readonly cardCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('text=التقرير اليومي');
    this.dateInput = page.locator('input[type="date"]');
    this.totalSalesCard = page.locator('text=إجمالي المبيعات').locator('..').locator('..');
    this.completedOrdersCard = page.locator('text=الطلبات المكتملة').locator('..').locator('..');
    this.taxCard = page.locator('text=الضرائب').locator('..').locator('..');
    this.cashCard = page.locator('text=نقدي').first().locator('..').locator('..');
    this.cardCard = page.locator('text=بطاقة').first().locator('..').locator('..');
  }

  async goto() {
    await this.page.goto('/reports');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async selectDate(date: string) {
    await this.dateInput.fill(date);
    // Wait for report to reload
    await this.page.waitForLoadState('networkidle');
  }

  async getTotalSales(): Promise<string> {
    const salesText = await this.totalSalesCard.locator('p.text-2xl').textContent();
    return salesText || '0';
  }

  async getCompletedOrders(): Promise<string> {
    const ordersText = await this.completedOrdersCard.locator('p.text-2xl').textContent();
    return ordersText || '0';
  }

  async getTotalTax(): Promise<string> {
    const taxText = await this.taxCard.locator('p.text-2xl').textContent();
    return taxText || '0';
  }

  async getCashTotal(): Promise<string> {
    const cashText = await this.cashCard.locator('p.text-xl').textContent();
    return cashText || '0';
  }

  async expectTotalSales(expectedAmount: string) {
    const totalSales = await this.getTotalSales();
    expect(totalSales).toContain(expectedAmount);
  }

  async expectCompletedOrders(count: string) {
    const orders = await this.getCompletedOrders();
    expect(orders).toBe(count);
  }
}
