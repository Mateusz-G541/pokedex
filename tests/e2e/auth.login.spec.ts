import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';

// Basic login tests using static credentials (test/test)
// These tests validate the simple auth gating added to the frontend

const VALID_USERNAME = 'test';
const VALID_PASSWORD = 'test';

const INVALID_USERNAME = 'wrong';
const INVALID_PASSWORD = 'bad';

test.describe('Authentication - Static Login', () => {
  test('logs in successfully with valid credentials', async ({ page }) => {
    const app = new PokemonAppPage(page);

    // Go to app root; do not use app.navigate() because main content is gated by auth
    await page.goto('/', { waitUntil: 'networkidle' });

    // Perform login
    await app.login(VALID_USERNAME, VALID_PASSWORD);

    // Verify logged-in state
    await app.expectLoggedIn(VALID_USERNAME);

    // After login, the app tabs should be visible
    await expect(page.locator('.tabs')).toBeVisible();
  });

  test('shows error for invalid credentials and remains gated', async ({ page }) => {
    const app = new PokemonAppPage(page);

    await page.goto('/', { waitUntil: 'networkidle' });

    await app.login(INVALID_USERNAME, INVALID_PASSWORD);

    await app.expectLoginError();

    // Ensure user is not logged in
    await expect(page.getByTestId('login-status')).toHaveCount(0);
  });
});
