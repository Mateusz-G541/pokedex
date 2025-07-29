import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestData } from '../data/pokemon.test-data';
import { TestHelpers } from '../helpers/test.helpers';

test.describe('Pokemon Search Functionality', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    // Setup page with proper configuration
    await TestHelpers.setupPage(page);

    // Initialize Page Object
    pokemonApp = new PokemonAppPage(page);

    // Navigate to application
    await pokemonApp.navigate();
  });

  test('should successfully search for Pokemon and display details', async ({ page: _page }) => {
    // Arrange - Use test data
    const testPokemon = TestData.pokemon.pikachu;

    // Act - Search for Pokemon
    await pokemonApp.searchForPokemon(testPokemon);

    // Assert - Verify Pokemon is displayed correctly
    await pokemonApp.verifyPokemonDisplayed(testPokemon);
    await pokemonApp.verifyNoErrors();

    // Verify image is properly loaded
    const isImageLoaded = await pokemonApp.isPokemonImageLoaded();
    expect(isImageLoaded, 'Pokemon image should be loaded').toBeTruthy();

    // Take screenshot for visual verification
    await pokemonApp.takeScreenshot('pokemon-search-success');
  });

  test('should handle invalid Pokemon search gracefully', async ({ page: _page }) => {
    // Arrange - Use invalid search term
    const invalidPokemon = TestData.search.invalid;

    // Act - Search for invalid Pokemon
    await pokemonApp.searchForPokemon(invalidPokemon);

    // Assert - Verify error handling
    await pokemonApp.verifyErrorDisplayed();
    await pokemonApp.takeScreenshot('pokemon-search-error');
  });

  test('should display search suggestions when typing', async ({ page: _page }) => {
    // Arrange - Use suggestion data
    const suggestionData = TestData.search.suggestions;

    // Act - Type partial Pokemon name
    await pokemonApp.typeInSearchInput(suggestionData.partialName);

    // Assert - Verify suggestions appear
    await pokemonApp.verifySuggestionsDisplayed();
    await pokemonApp.takeScreenshot('pokemon-search-suggestions');
  });
});
