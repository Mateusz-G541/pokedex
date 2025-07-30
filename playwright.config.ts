import { defineConfig } from '@playwright/test';

// Get the base URL from environment or use default
const baseURL = process.env.CI
  ? 'http://127.0.0.1:3000' // Use IP instead of localhost in CI
  : 'http://localhost:3000'; // Use localhost in local development

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'API Tests',
      testDir: './tests/api',
      testMatch: '**/*.api.spec.ts',
      timeout: 60000,
    },
    {
      name: 'E2E Tests',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.ts',
      timeout: 60000,
      use: {
        baseURL,
        trace: 'on-first-retry',
        actionTimeout: 30000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
});
