import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
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
