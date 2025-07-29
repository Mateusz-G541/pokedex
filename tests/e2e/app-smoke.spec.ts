import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestData } from '../data/pokemon.test-data';
import { TestHelpers } from '../helpers/test.helpers';

test.describe('Application Smoke Tests', () => {
  test('should initialize application without errors', async ({ page }) => {
    // Setup
    await TestHelpers.setupPage(page);
    const pokemonApp = new PokemonAppPage(page);

    // Act - Navigate to application
    await pokemonApp.navigate();

    // Assert - Verify basic elements are present
    await pokemonApp.verifyPageLoaded();
    await pokemonApp.verifyNoErrors();

    // Verify search functionality is available
    const searchInput = page.getByPlaceholder('Search for a Pokemon...');
    await expect(searchInput).toBeVisible();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('app-initialization');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Setup
    await TestHelpers.setupPage(page);
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Simulate network failure
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    // Act - Try to search for Pokemon
    const testPokemon = TestData.pokemon.pikachu;
    await pokemonApp.searchForPokemon(testPokemon);

    // Assert - Verify error is handled gracefully
    await pokemonApp.verifyErrorDisplayed();
    await pokemonApp.takeScreenshot('network-error-handling');
  });

  test('should maintain responsive design on different viewport sizes', async ({ page }) => {
    // Setup
    await TestHelpers.setupPage(page);
    const pokemonApp = new PokemonAppPage(page);

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      // Act - Set viewport and navigate
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await pokemonApp.navigate();

      // Assert - Verify basic functionality works
      await pokemonApp.verifyPageLoaded();
      await pokemonApp.verifyNoErrors();

      // Take screenshot for this viewport
      await pokemonApp.takeScreenshot(`responsive-${viewport.name}`);
    }
  });

  test('should handle JavaScript errors without crashing', async ({ page }) => {
    // Setup error tracking
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await TestHelpers.setupPage(page);
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Perform basic operations
    const testPokemon = TestData.pokemon.pikachu;
    await pokemonApp.searchForPokemon(testPokemon);

    // Assert - Verify no critical JavaScript errors occurred
    const criticalErrors = jsErrors.filter(
      (error) => error.includes('TypeError') || error.includes('ReferenceError'),
    );

    expect(
      criticalErrors.length,
      `Critical JavaScript errors occurred: ${criticalErrors.join(', ')}`,
    ).toBe(0);

    await pokemonApp.takeScreenshot('js-error-handling');
  });
});
