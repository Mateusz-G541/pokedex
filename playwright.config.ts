import { defineConfig } from '@playwright/test';

// Get the base URLs from environment or use defaults
const apiBaseURL = process.env.CI
  ? 'http://127.0.0.1:3000' // Use IP instead of localhost in CI
  : 'http://localhost:3000'; // Use localhost in local development

const frontendBaseURL = process.env.CI
  ? 'http://127.0.0.1:5173' // Use IP instead of localhost in CI
  : 'http://localhost:5173'; // Frontend Vite server port

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './tests/setup/global-setup-simple.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
  use: {
    baseURL: apiBaseURL,
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
        baseURL: frontendBaseURL,
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
});
