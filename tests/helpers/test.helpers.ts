import { Page, expect } from '@playwright/test';
import { TestData } from '../data/pokemon.test-data';

export class TestHelpers {
  static async setupPage(page: Page): Promise<void> {
    // Set viewport for consistent testing
    await page.setViewportSize(TestData.ui.viewport);

    // Set longer timeouts for CI environments
    page.setDefaultTimeout(TestData.ui.timeouts.long);

    // Add console log monitoring
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
  }

  static async waitForStableNetwork(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Additional stability wait
  }

  static async verifyNoJavaScriptErrors(page: Page): Promise<void> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // Wait for potential errors to surface
    await page.waitForTimeout(3000);

    // Filter out warnings and focus on critical errors
    const criticalErrors = errors.filter(
      (error) => !error.includes('Warning') && !error.includes('DevTools'),
    );

    expect(criticalErrors).toHaveLength(0);
  }

  static async takeTestScreenshot(page: Page, testName: string, step?: string): Promise<void> {
    const fileName = step ? `${testName}-${step}` : testName;
    await page.screenshot({
      path: `test-results/screenshots/${fileName}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }

  static isCI(): boolean {
    return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  }

  static getTimeout(type: 'short' | 'medium' | 'long'): number {
    const multiplier = this.isCI() ? 2 : 1; // Double timeouts in CI
    return TestData.ui.timeouts[type] * multiplier;
  }

  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}

export class TestAssertions {
  static async verifyElementVisible(
    element: import('@playwright/test').Locator,
    elementName: string,
    timeout?: number,
  ): Promise<void> {
    await expect(element, `${elementName} should be visible`).toBeVisible({
      timeout: timeout || TestHelpers.getTimeout('medium'),
    });
  }

  static async verifyElementHidden(
    element: import('@playwright/test').Locator,
    elementName: string,
    timeout?: number,
  ): Promise<void> {
    await expect(element, `${elementName} should be hidden`).toBeHidden({
      timeout: timeout || TestHelpers.getTimeout('short'),
    });
  }

  static async verifyTextContent(
    element: import('@playwright/test').Locator,
    expectedText: string | RegExp,
    elementName: string,
  ): Promise<void> {
    await expect(element, `${elementName} should contain expected text`).toContainText(
      expectedText,
      { ignoreCase: true },
    );
  }

  static async verifyElementCount(
    elements: import('@playwright/test').Locator,
    expectedCount: number,
    elementName: string,
  ): Promise<void> {
    const actualCount = await elements.count();
    expect(actualCount, `${elementName} count should match expected`).toBe(expectedCount);
  }

  static async verifyMinimumElementCount(
    elements: import('@playwright/test').Locator,
    minCount: number,
    elementName: string,
  ): Promise<void> {
    const actualCount = await elements.count();
    expect(
      actualCount,
      `${elementName} count should be at least ${minCount}`,
    ).toBeGreaterThanOrEqual(minCount);
  }
}
