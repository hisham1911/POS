import { Page, Locator, expect } from '@playwright/test';

/**
 * Login Page Object
 * Handles authentication flows for Admin and Cashier users
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logo: Locator;

  // Test credentials
  static readonly ADMIN_EMAIL = 'admin@kasserpro.com';
  static readonly ADMIN_PASSWORD = 'Admin@123';
  static readonly CASHIER_EMAIL = 'ahmed@kasserpro.com';
  static readonly CASHIER_PASSWORD = '123456';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: /تسجيل الدخول/i });
    this.logo = page.getByRole('heading', { name: 'KasserPro' });
  }

  async goto() {
    // First check if we're already on login page
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('/login')) {
      // Already on login page, just wait for it to load
      await expect(this.logo).toBeVisible();
      return;
    }
    
    // Navigate to login
    await this.page.goto('/login');
    
    // Check if we got redirected (already logged in)
    await this.page.waitForLoadState('networkidle');
    
    if (!this.page.url().includes('/login')) {
      // We're logged in, need to logout
      // Clear localStorage to force logout
      await this.page.evaluate(() => localStorage.clear());
      await this.page.goto('/login');
    }
    
    await expect(this.logo).toBeVisible();
  }

  async loginAsAdmin() {
    await this.login(LoginPage.ADMIN_EMAIL, LoginPage.ADMIN_PASSWORD);
  }

  async loginAsCashier() {
    await this.login(LoginPage.CASHIER_EMAIL, LoginPage.CASHIER_PASSWORD);
  }

  async login(email: string, password: string) {
    console.log(`Attempting login with: ${email}`);
    
    // Clear any existing values first
    await this.emailInput.clear();
    await this.passwordInput.clear();
    
    // Fill credentials
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    console.log('Credentials filled, clicking login button...');
    
    // Click login button
    await this.loginButton.click();
    
    // Wait a bit for the request to process
    await this.page.waitForTimeout(3000);
    
    console.log(`Current URL after login: ${this.page.url()}`);
    
    // Wait for navigation to complete - could go to /pos or /shift or /settings
    try {
      await this.page.waitForURL(/\/(pos|shift|settings)/, { timeout: 15000 });
      console.log('Login successful, navigated to:', this.page.url());
    } catch {
      // If navigation didn't happen, check for error toast
      const errorToast = this.page.locator('[data-sonner-toast]');
      if (await errorToast.isVisible()) {
        const toastText = await errorToast.textContent();
        throw new Error(`Login failed: ${toastText}`);
      }
      throw new Error(`Login failed: Navigation timeout. Current URL: ${this.page.url()}`);
    }
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.logo).toBeVisible();
  }
}
