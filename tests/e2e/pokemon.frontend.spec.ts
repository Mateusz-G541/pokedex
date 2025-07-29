import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestData } from '../data/pokemon.test-data';
import { TestHelpers, TestAssertions } from '../helpers/test.helpers';

test.describe('Pokemon Frontend E2E Tests', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    // Setup page with proper configuration
    await TestHelpers.setupPage(page);
    
    // Initialize Page Object
    pokemonApp = new PokemonAppPage(page);
    
    // Navigate to application
    await pokemonApp.navigate();
  });

  test('should successfully search for Pokemon and display details', async ({ page }) => {
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

  test('should navigate regions and display starter Pokemon with suggestions', async ({ page }) => {
    // Arrange - Use test data
    const kantoRegion = TestData.regions.kanto;
    const suggestionData = TestData.search.suggestions;
    
    // Act & Assert - Verify Kanto region is available
    const isKantoVisible = await pokemonApp.isRegionTabVisible(kantoRegion.name);
    expect(isKantoVisible, 'Kanto region tab should be visible').toBeTruthy();
    
    // Act - Select Kanto region
    await pokemonApp.selectRegion(kantoRegion);
    
    // Assert - Verify starter Pokemon are displayed
    await pokemonApp.verifyStartersDisplayed(kantoRegion);
    
    // Act - Test search suggestions
    await pokemonApp.typeSearchQuery(suggestionData.validQuery);
    
    // Assert - Verify suggestions appear
    await pokemonApp.verifySuggestionsDisplayed(suggestionData.minResultCount);
    
    // Act - Select first suggestion
    await pokemonApp.selectFirstSuggestion();
    
    // Assert - Verify Pokemon loads after suggestion selection
    const displayedName = await pokemonApp.getDisplayedPokemonName();
    expect(displayedName.length, 'Pokemon name should be displayed').toBeGreaterThan(0);
    
    // Take screenshot for visual verification
    await pokemonApp.takeScreenshot('kanto-region-navigation');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Arrange - Simulate network failure
    await pokemonApp.simulateNetworkError();
    
    // Act - Attempt to search for Pokemon
    const testPokemon = TestData.pokemon.pikachu;
    await pokemonApp.searchForPokemon(testPokemon);
    
    // Assert - Verify error handling
    await pokemonApp.verifyErrorDisplayed();
    
    // Verify app stability
    await TestHelpers.verifyNoJavaScriptErrors(page);
  });

  test('should handle invalid search queries', async ({ page }) => {
    // Arrange - Use invalid search data
    const invalidSearch = TestData.search.invalid;
    const invalidPokemon = {
      name: invalidSearch.query,
      id: 0,
      type: 'unknown',
      searchTerm: invalidSearch.query,
      expectedName: invalidSearch.query,
    };
    
    // Act - Search for invalid Pokemon
    await pokemonApp.searchForPokemon(invalidPokemon);
    
    // Assert - Verify appropriate error handling
    await TestHelpers.retryAction(async () => {
      await pokemonApp.verifyErrorDisplayed();
    }, 3, 1000);
  });
});

test.describe('Application Smoke Tests', () => {
  test('should initialize application without errors', async ({ page }) => {
    // Setup
    await TestHelpers.setupPage(page);
    
    // Navigate to application
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Verify core elements are present
    await TestAssertions.verifyElementVisible(
      page.locator('body'), 
      'Application body'
    );
    
    await TestAssertions.verifyElementVisible(
      page.getByRole('main').or(page.locator('main, .main-content')), 
      'Main content area'
    );
    
    // Verify no critical JavaScript errors
    await TestHelpers.verifyNoJavaScriptErrors(page);
    
    // Take screenshot for documentation
    await TestHelpers.takeTestScreenshot(page, 'app-initialization');
  });

  test('should be responsive and accessible', async ({ page }) => {
    // Setup with different viewport for responsive testing
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();
    
    // Verify app is responsive
    await TestAssertions.verifyElementVisible(
      page.locator('body'), 
      'Application body in tablet view'
    );
    
    // Test basic accessibility
    const searchInput = page.getByPlaceholder('Search for a Pokemon...').or(
      page.locator('input[type="search"]')
    );
    
    await TestAssertions.verifyElementVisible(searchInput, 'Search input');
    
    // Verify search input is focusable
    await searchInput.focus();
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    expect(isFocused, 'Search input should be focusable').toBeTruthy();
  });
});
