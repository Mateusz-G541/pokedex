import { Page, Locator, expect } from '@playwright/test';
import { TestData, PokemonData, RegionData } from '../data/pokemon.test-data';

export class PokemonAppPage {
  private readonly page: Page;

  // Locators - using data-testid for reliable element targeting
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly pokemonCard: Locator;
  private readonly pokemonName: Locator;
  private readonly pokemonImage: Locator;
  private readonly pokemonType: Locator;
  private readonly regionTabs: Locator;
  private readonly starterPokemon: Locator;
  private readonly loadingSpinner: Locator;
  private readonly errorMessage: Locator;
  private readonly suggestionsList: Locator;
  private readonly suggestionItems: Locator;
  private readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators with fallback strategies
    this.searchInput = page.getByPlaceholder('Search for a Pokemon...').or(
      page.locator('input[type="search"]')
    );
    this.searchButton = page.getByRole('button', { name: /search/i }).or(
      page.locator('button[type="submit"]')
    );
    this.pokemonCard = page.locator('[data-testid="pokemon-card"]').or(
      page.locator('.pokemon-card').first()
    );
    this.pokemonName = page.locator('[data-testid="pokemon-name"]').or(
      page.locator('.pokemon-name').first()
    );
    this.pokemonImage = page.locator('[data-testid="pokemon-image"]').or(
      page.locator('img[alt*="pokemon"]').first()
    );
    this.pokemonType = page.locator('[data-testid="pokemon-type"]').or(
      page.locator('.pokemon-type').first()
    );
    this.regionTabs = page.locator('[data-testid="region-tab"]').or(
      page.locator('.region-tab')
    );
    this.starterPokemon = page.locator('[data-testid="starter-pokemon"]').or(
      page.locator('.starter-pokemon')
    );
    this.loadingSpinner = page.locator('[data-testid="loading"]').or(
      page.locator('.loading, .spinner')
    );
    this.errorMessage = page.locator('[data-testid="error-message"]').or(
      page.locator('.error, .error-message')
    );
    this.suggestionsList = page.locator('[data-testid="suggestions-list"]').or(
      page.locator('.suggestions, .autocomplete')
    );
    this.suggestionItems = page.locator('[data-testid="suggestion-item"]').or(
      page.locator('.suggestion-item, .autocomplete-item')
    );
    this.mainContent = page.getByRole('main').or(
      page.locator('main, .main-content')
    );
  }

  // Navigation methods
  async navigate(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();
    await expect(this.mainContent).toBeVisible();
    // Wait for any initial loading to complete
    await this.page.waitForLoadState('networkidle');
  }

  // Search functionality
  async searchForPokemon(pokemonData: PokemonData): Promise<void> {
    await this.searchInput.fill(pokemonData.searchTerm);
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  async waitForSearchResults(): Promise<void> {
    // Wait for loading to disappear
    await this.loadingSpinner.waitFor({ 
      state: 'hidden', 
      timeout: TestData.ui.timeouts.medium 
    });
    
    // Wait for either pokemon card or error message
    await Promise.race([
      this.pokemonCard.waitFor({ 
        state: 'visible', 
        timeout: TestData.ui.timeouts.medium 
      }),
      this.errorMessage.waitFor({ 
        state: 'visible', 
        timeout: TestData.ui.timeouts.short 
      })
    ]);
  }

  // Search suggestions
  async typeSearchQuery(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.suggestionsList.waitFor({ 
      state: 'visible', 
      timeout: TestData.ui.timeouts.short 
    });
  }

  async selectFirstSuggestion(): Promise<void> {
    const firstSuggestion = this.suggestionItems.first();
    await firstSuggestion.click();
    await this.waitForSearchResults();
  }

  async getSuggestionCount(): Promise<number> {
    return await this.suggestionItems.count();
  }

  // Region navigation
  async selectRegion(regionData: RegionData): Promise<void> {
    const regionTab = this.page.getByRole('button', { 
      name: new RegExp(regionData.name, 'i') 
    });
    await regionTab.click();
    await this.waitForRegionLoad();
  }

  async waitForRegionLoad(): Promise<void> {
    await this.page.waitForTimeout(2000); // Allow time for region switch
    await this.starterPokemon.first().waitFor({ 
      state: 'visible', 
      timeout: TestData.ui.timeouts.medium 
    });
  }

  // Verification methods
  async verifyPokemonDisplayed(pokemonData: PokemonData): Promise<void> {
    await expect(this.pokemonCard).toBeVisible();
    await expect(this.pokemonName).toContainText(
      pokemonData.expectedName, 
      { ignoreCase: true }
    );
    await expect(this.pokemonImage).toBeVisible();
    await expect(this.pokemonImage).toHaveAttribute('src', /.+/);
  }

  async verifyNoErrors(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async verifyErrorDisplayed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyStartersDisplayed(regionData: RegionData): Promise<void> {
    const starterCount = await this.starterPokemon.count();
    expect(starterCount).toBeGreaterThan(0);

    const pageContent = await this.page.textContent('body');
    const hasExpectedStarters = regionData.starters.some(starter => 
      new RegExp(starter, 'i').test(pageContent || '')
    );
    expect(hasExpectedStarters).toBeTruthy();
  }

  async verifySuggestionsDisplayed(minCount: number = 1): Promise<void> {
    await expect(this.suggestionsList).toBeVisible();
    const suggestionCount = await this.getSuggestionCount();
    expect(suggestionCount).toBeGreaterThanOrEqual(minCount);
  }

  // Utility methods
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`,
      fullPage: true 
    });
  }

  async simulateNetworkError(): Promise<void> {
    await this.page.route('**/api/**', (route) => {
      route.abort('failed');
    });
  }

  async getPageErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('pageerror', (error) => errors.push(error.message));
    await this.page.waitForTimeout(3000);
    return errors.filter(error => !error.includes('Warning'));
  }

  // Region-specific methods
  async isRegionTabVisible(regionName: string): Promise<boolean> {
    const regionTab = this.page.getByRole('button', { 
      name: new RegExp(regionName, 'i') 
    });
    return await regionTab.isVisible();
  }

  async getDisplayedPokemonName(): Promise<string> {
    return await this.pokemonName.textContent() || '';
  }

  async isPokemonImageLoaded(): Promise<boolean> {
    try {
      await expect(this.pokemonImage).toBeVisible();
      const src = await this.pokemonImage.getAttribute('src');
      return !!src && src.length > 0;
    } catch {
      return false;
    }
  }
}
