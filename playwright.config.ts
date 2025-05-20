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
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      timeout: 60000,
    },
  ],
});
