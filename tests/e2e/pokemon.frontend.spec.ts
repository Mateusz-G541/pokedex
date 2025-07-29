import { test, expect, Page } from '@playwright/test';

// Page Object Model for better maintainability
class PokemonAppPage {
  constructor(private page: Page) {}

  // Locators
  get searchInput() {
    return this.page.getByPlaceholder('Search for a Pokemon...');
  }

  get searchButton() {
    return this.page.getByRole('button', { name: /search/i });
  }

  get pokemonCard() {
    return this.page.locator('[data-testid="pokemon-card"]').first();
  }

  get pokemonName() {
    return this.page.locator('[data-testid="pokemon-name"]').first();
  }

  get pokemonImage() {
    return this.page.locator('[data-testid="pokemon-image"]').first();
  }

  get regionTabs() {
    return this.page.locator('[data-testid="region-tab"]');
  }

  get kantoTab() {
    return this.page.getByRole('button', { name: /kanto/i });
  }

  get starterPokemon() {
    return this.page.locator('[data-testid="starter-pokemon"]');
  }

  get loadingSpinner() {
    return this.page.locator('[data-testid="loading"]');
  }

  get errorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  get suggestionsList() {
    return this.page.locator('[data-testid="suggestions-list"]');
  }

  get suggestionItem() {
    return this.page.locator('[data-testid="suggestion-item"]');
  }

  // Actions
  async searchForPokemon(pokemonName: string) {
    await this.searchInput.fill(pokemonName);
    await this.searchButton.click();
  }

  async waitForPokemonToLoad() {
    // Wait for loading to disappear and pokemon data to appear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    await this.pokemonCard.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectRegion(regionName: string) {
    await this.page.getByRole('button', { name: new RegExp(regionName, 'i') }).click();
  }

  async typeInSearchWithSuggestions(query: string) {
    await this.searchInput.fill(query);
    // Wait for suggestions to appear
    await this.suggestionsList.waitFor({ state: 'visible', timeout: 5000 });
  }
}

test.describe('Pokemon Frontend E2E Tests', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    pokemonApp = new PokemonAppPage(page);
    
    // Navigate to the app with proper error handling
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for the app to be fully loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Set longer timeout for CI environments
    test.setTimeout(30000);
  });

  test('should successfully search for a Pokemon and display its details', async ({ page }) => {
    // Test Case 1: Pokemon Search and Display
    
    // Step 1: Search for a well-known Pokemon (Pikachu)
    await pokemonApp.searchForPokemon('pikachu');
    
    // Step 2: Wait for the Pokemon data to load
    await pokemonApp.waitForPokemonToLoad();
    
    // Step 3: Verify Pokemon details are displayed correctly
    await expect(pokemonApp.pokemonName).toContainText('pikachu', { ignoreCase: true });
    
    // Step 4: Verify Pokemon image is loaded
    await expect(pokemonApp.pokemonImage).toBeVisible();
    
    // Step 5: Verify image has proper src attribute
    const imageElement = pokemonApp.pokemonImage;
    await expect(imageElement).toHaveAttribute('src', /.+/); // Has some src value
    
    // Step 6: Verify no error messages are displayed
    await expect(pokemonApp.errorMessage).not.toBeVisible();
    
    // Step 7: Take screenshot for visual verification (CI-friendly)
    await page.screenshot({ 
      path: 'test-results/pokemon-search-success.png',
      fullPage: true 
    });
  });

  test('should display Kanto region with starter Pokemon and handle navigation', async ({ page }) => {
    // Test Case 2: Region Navigation and Starter Pokemon Display
    
    // Step 1: Verify Kanto region is available (default region)
    await expect(pokemonApp.kantoTab).toBeVisible();
    
    // Step 2: Click on Kanto region tab
    await pokemonApp.selectRegion('kanto');
    
    // Step 3: Wait for region content to load
    await page.waitForTimeout(2000); // Allow time for region switch
    
    // Step 4: Verify starter Pokemon are displayed
    const starterCount = await pokemonApp.starterPokemon.count();
    expect(starterCount).toBeGreaterThan(0);
    
    // Step 5: Verify Generation 1 starters are present
    // Check for Bulbasaur, Charmander, or Squirtle
    const pageContent = await page.textContent('body');
    const hasGen1Starters = /bulbasaur|charmander|squirtle/i.test(pageContent || '');
    expect(hasGen1Starters).toBeTruthy();
    
    // Step 6: Test search suggestions functionality
    await pokemonApp.typeInSearchWithSuggestions('char');
    
    // Step 7: Verify suggestions appear
    await expect(pokemonApp.suggestionsList).toBeVisible();
    
    // Step 8: Verify suggestions contain relevant Pokemon
    const suggestionsCount = await pokemonApp.suggestionItem.count();
    expect(suggestionsCount).toBeGreaterThan(0);
    
    // Step 9: Click on first suggestion
    if (suggestionsCount > 0) {
      await pokemonApp.suggestionItem.first().click();
      
      // Step 10: Verify Pokemon loads after suggestion selection
      await pokemonApp.waitForPokemonToLoad();
      await expect(pokemonApp.pokemonCard).toBeVisible();
    }
    
    // Step 11: Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/kanto-region-navigation.png',
      fullPage: true 
    });
  });

  // Error handling test for CI robustness
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests to simulate API failures
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Attempt to search for Pokemon
    await pokemonApp.searchForPokemon('pikachu');
    
    // Verify error handling
    await expect(pokemonApp.errorMessage).toBeVisible({ timeout: 10000 });
    
    // Verify app doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});

// Additional helper test for CI/CD reliability
test.describe('App Initialization', () => {
  test('should load the application successfully', async ({ page }) => {
    // Basic smoke test to ensure app loads
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Verify core elements are present
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    
    // Verify no JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(3000);
    
    // Assert no critical errors occurred
    expect(errors.filter(error => !error.includes('Warning'))).toHaveLength(0);
  });
});
