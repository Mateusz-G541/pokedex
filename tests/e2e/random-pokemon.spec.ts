import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestHelpers } from '../helpers/test.helpers';

test.describe('Random Pokemon Functionality', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    await TestHelpers.setupPage(page);
    pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();
  });

  test('should generate random Pokemon from Generation 1 only (IDs 1-151)', async ({
    page: _page,
  }) => {
    // Arrange - Track multiple random Pokemon to verify range
    const randomPokemonIds: number[] = [];
    const maxAttempts = 10; // Test multiple random selections

    // Act - Generate multiple random Pokemon
    for (let i = 0; i < maxAttempts; i++) {
      // Click random button
      await pokemonApp.clickRandomButton();

      // Wait for Pokemon to load
      await pokemonApp.waitForPokemonLoad();

      // Get the Pokemon ID from the displayed Pokemon
      const pokemonId = await pokemonApp.getCurrentPokemonId();
      randomPokemonIds.push(pokemonId);

      // Take screenshot for this iteration
      await pokemonApp.takeScreenshot(`random-pokemon-${i + 1}`);

      // Small delay between requests to avoid overwhelming the API
      await pokemonApp.waitForTimeout(500);
    }

    // Assert - Verify all Pokemon IDs are within Generation 1 range (1-151)
    for (const pokemonId of randomPokemonIds) {
      expect(
        pokemonId,
        `Pokemon ID ${pokemonId} should be between 1 and 151`,
      ).toBeGreaterThanOrEqual(1);
      expect(pokemonId, `Pokemon ID ${pokemonId} should be between 1 and 151`).toBeLessThanOrEqual(
        151,
      );
    }

    // Assert - Verify we got different Pokemon (randomness check)
    const uniqueIds = new Set(randomPokemonIds);
    expect(uniqueIds.size, 'Should generate different Pokemon (randomness check)').toBeGreaterThan(
      1,
    );

    // Assert - Verify no errors occurred during random generation
    await pokemonApp.verifyNoErrors();

    console.log(`Generated Pokemon IDs: ${randomPokemonIds.join(', ')}`);
    console.log(`Unique Pokemon count: ${uniqueIds.size}/${maxAttempts}`);
  });

  test('should display valid Pokemon data when using random function', async ({ page: _page }) => {
    // Act - Click random button
    await pokemonApp.clickRandomButton();

    // Wait for Pokemon to load
    await pokemonApp.waitForPokemonLoad();

    // Assert - Verify Pokemon data is displayed correctly
    const pokemonName = await pokemonApp.getPokemonName();
    expect(pokemonName, 'Pokemon name should be displayed').toBeTruthy();
    expect(pokemonName.length, 'Pokemon name should not be empty').toBeGreaterThan(0);

    // Verify Pokemon ID is within Generation 1 range
    const pokemonId = await pokemonApp.getCurrentPokemonId();
    expect(pokemonId, 'Pokemon ID should be within Generation 1 range').toBeGreaterThanOrEqual(1);
    expect(pokemonId, 'Pokemon ID should be within Generation 1 range').toBeLessThanOrEqual(151);

    // Verify image is loaded
    const isImageLoaded = await pokemonApp.isPokemonImageLoaded();
    expect(isImageLoaded, 'Pokemon image should be loaded').toBeTruthy();

    // Verify no errors
    await pokemonApp.verifyNoErrors();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('random-pokemon-display');
  });

  test('should handle random legendary Pokemon correctly', async ({ page: _page }) => {
    // Act - Click random legendary button
    await pokemonApp.clickRandomLegendaryButton();

    // Wait for Pokemon to load
    await pokemonApp.waitForPokemonLoad();

    // Assert - Verify legendary Pokemon is displayed
    const pokemonName = await pokemonApp.getPokemonName();
    expect(pokemonName, 'Legendary Pokemon name should be displayed').toBeTruthy();

    // Verify Pokemon ID is within Generation 1 range (legendary Pokemon)
    const pokemonId = await pokemonApp.getCurrentPokemonId();
    expect(
      pokemonId,
      'Legendary Pokemon ID should be within Generation 1 range',
    ).toBeGreaterThanOrEqual(1);
    expect(
      pokemonId,
      'Legendary Pokemon ID should be within Generation 1 range',
    ).toBeLessThanOrEqual(151);

    // Verify it's actually a legendary Pokemon from Generation 1
    const gen1LegendaryIds = [144, 145, 146, 150, 151]; // Articuno, Zapdos, Moltres, Mewtwo, Mew
    expect(
      gen1LegendaryIds,
      `Pokemon ID ${pokemonId} should be a Generation 1 legendary`,
    ).toContain(pokemonId);

    // Verify image is loaded
    const isImageLoaded = await pokemonApp.isPokemonImageLoaded();
    expect(isImageLoaded, 'Legendary Pokemon image should be loaded').toBeTruthy();

    // Verify no errors
    await pokemonApp.verifyNoErrors();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('random-legendary-pokemon');
  });
});
