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
    this.searchInput = page
      .getByPlaceholder('Search for a Pokemon...')
      .or(page.locator('input[type="search"]'));
    this.searchButton = page
      .getByRole('button', { name: /search/i })
      .or(page.locator('button[type="submit"]'));
    this.pokemonCard = page
      .locator('[data-testid="pokemon-card"]')
      .or(page.locator('.pokemon-card').first());
    this.pokemonName = page
      .locator('[data-testid="pokemon-name"]')
      .or(page.locator('.pokemon-name').first());
    this.pokemonImage = page
      .locator('[data-testid="pokemon-image"]')
      .or(page.locator('img[alt*="pokemon"]').first());
    this.pokemonType = page
      .locator('[data-testid="pokemon-type"]')
      .or(page.locator('.pokemon-type').first());
    this.regionTabs = page.locator('[data-testid="region-tab"]').or(page.locator('.region-tab'));
    this.starterPokemon = page
      .locator('[data-testid="starter-pokemon"]')
      .or(page.locator('.starter-pokemon'));
    this.loadingSpinner = page
      .locator('[data-testid="loading"]')
      .or(page.locator('.loading, .spinner'));
    this.errorMessage = page
      .locator('[data-testid="error-message"]')
      .or(page.locator('.error, .error-message'));
    this.suggestionsList = page
      .locator('[data-testid="suggestions-list"]')
      .or(page.locator('.suggestions, .autocomplete'));
    this.suggestionItems = page
      .locator('[data-testid="suggestion-item"]')
      .or(page.locator('.suggestion-item, .autocomplete-item'));
    this.mainContent = page.getByRole('main').or(page.locator('main, .main-content'));
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
      timeout: TestData.ui.timeouts.medium,
    });

    // Wait for either pokemon card or error message
    await Promise.race([
      this.pokemonCard.waitFor({
        state: 'visible',
        timeout: TestData.ui.timeouts.medium,
      }),
      this.errorMessage.waitFor({
        state: 'visible',
        timeout: TestData.ui.timeouts.short,
      }),
    ]);
  }

  // Search suggestions
  async typeSearchQuery(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.suggestionsList.waitFor({
      state: 'visible',
      timeout: TestData.ui.timeouts.short,
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
      name: new RegExp(regionData.name, 'i'),
    });
    await regionTab.click();
    await this.waitForRegionLoad();
  }

  async waitForRegionLoad(): Promise<void> {
    await this.page.waitForTimeout(2000); // Allow time for region switch
    await this.starterPokemon.first().waitFor({
      state: 'visible',
      timeout: TestData.ui.timeouts.medium,
    });
  }

  // Verification methods
  async verifyPokemonDisplayed(pokemonData: PokemonData): Promise<void> {
    await expect(this.pokemonCard).toBeVisible();
    await expect(this.pokemonName).toContainText(pokemonData.expectedName, { ignoreCase: true });
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
    const hasExpectedStarters = regionData.starters.some((starter) =>
      new RegExp(starter, 'i').test(pageContent || ''),
    );
    expect(hasExpectedStarters).toBeTruthy();
  }

  async verifySuggestionsDisplayed(minCount: number = 1): Promise<void> {
    await expect(this.suggestionsList).toBeVisible();
    const suggestionCount = await this.getSuggestionCount();
    expect(suggestionCount).toBeGreaterThanOrEqual(minCount);
  }

  // Team management methods
  async navigateToTeamTab(): Promise<void> {
    await this.page.click(
      '[data-testid="team-tab"], button:has-text("Team"), .tab:has-text("Team")',
    );
    await this.page.waitForLoadState('networkidle');
  }

  async addPokemonToTeam(): Promise<void> {
    const addButton = this.page
      .locator('[data-testid="add-to-team-button"], button:has-text("Add to Team"), .add-to-team')
      .first();
    await expect(addButton).toBeVisible({ timeout: TestData.ui.timeout });
    await addButton.click();
    await this.page.waitForTimeout(500); // Wait for team update
  }

  async removePokemonFromTeam(pokemonName?: string): Promise<void> {
    if (pokemonName) {
      // Remove specific Pokemon by name
      const removeButton = this.page
        .locator(
          `[data-testid="remove-${pokemonName.toLowerCase()}"], button[data-pokemon="${pokemonName.toLowerCase()}"]`,
        )
        .first();
      await expect(removeButton).toBeVisible({ timeout: TestData.ui.timeout });
      await removeButton.click();
    } else {
      // Remove first Pokemon in team
      const removeButton = this.page
        .locator('[data-testid*="remove-"], .remove-from-team, button:has-text("Remove")')
        .first();
      await expect(removeButton).toBeVisible({ timeout: TestData.ui.timeout });
      await removeButton.click();
    }
    await this.page.waitForTimeout(500); // Wait for team update
  }

  async getTeamSize(): Promise<number> {
    const teamMembers = this.page
      .locator('[data-testid="team-member"], .team-pokemon, .pokemon-card')
      .all();
    return (await teamMembers).length;
  }

  async verifyPokemonInTeam(pokemonName: string): Promise<void> {
    const teamMember = this.page
      .locator(
        `[data-testid="team-${pokemonName.toLowerCase()}"], .team-pokemon:has-text("${pokemonName}"), .pokemon-card:has-text("${pokemonName}")`,
      )
      .first();
    await expect(teamMember).toBeVisible({ timeout: TestData.ui.timeout });
  }

  async verifyPokemonNotInTeam(pokemonName: string): Promise<void> {
    const teamMember = this.page
      .locator(
        `[data-testid="team-${pokemonName.toLowerCase()}"], .team-pokemon:has-text("${pokemonName}"), .pokemon-card:has-text("${pokemonName}")`,
      )
      .first();
    await expect(teamMember).not.toBeVisible();
  }

  async verifyTeamMessage(expectedMessage: string): Promise<void> {
    const messageElement = this.page
      .locator('[data-testid="team-message"], .team-message, .message, .notification')
      .first();
    await expect(messageElement).toBeVisible({ timeout: TestData.ui.timeout });
    await expect(messageElement).toContainText(expectedMessage);
  }

  async verifyTeamFull(): Promise<void> {
    const teamSize = await this.getTeamSize();
    expect(teamSize).toBe(TestData.team.maxSize);
  }

  async verifyTeamEmpty(): Promise<void> {
    const teamSize = await this.getTeamSize();
    expect(teamSize).toBe(0);
  }

  // Utility methods
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  async simulateNetworkError(): Promise<void> {
    await this.page.route('**/api/**', (route) => {
      route.abort('failed');
    });
  }

  async verifyErrorDisplayed(): Promise<void> {
    const errorElement = this.page
      .locator('[data-testid="error-message"], .error, [class*="error"]')
      .first();
    await expect(errorElement).toBeVisible({ timeout: TestData.ui.timeout });
  }

  async getPageErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('pageerror', (error) => errors.push(error.message));
    await this.page.waitForTimeout(3000);
    return errors.filter((error) => !error.includes('Warning'));
  }

  // Region-specific methods
  async isRegionTabVisible(regionName: string): Promise<boolean> {
    const regionTab = this.page.getByRole('button', {
      name: new RegExp(regionName, 'i'),
    });
    return await regionTab.isVisible();
  }

  async getDisplayedPokemonName(): Promise<string> {
    return (await this.pokemonName.textContent()) || '';
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

  // Random Pokemon functionality
  async clickRandomButton(): Promise<void> {
    const randomButton = this.page.getByTestId('random-button')
      .or(this.page.getByRole('button', { name: /random/i }));
    await randomButton.click();
  }

  async clickRandomLegendaryButton(): Promise<void> {
    const legendaryButton = this.page.getByTestId('legendary-button')
      .or(this.page.getByRole('button', { name: /legendary/i }));
    await legendaryButton.click();
  }

  async waitForPokemonLoad(): Promise<void> {
    // Wait for loading to disappear and Pokemon to be displayed
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: TestData.ui.timeouts.medium });
    await this.pokemonCard.waitFor({ state: 'visible', timeout: TestData.ui.timeouts.medium });
  }

  async getCurrentPokemonId(): Promise<number> {
    // Extract Pokemon ID from the displayed Pokemon data
    const pokemonIdElement = this.page.locator('[data-testid="pokemon-id"]')
      .or(this.page.locator('.pokemon-id'));
    
    if (await pokemonIdElement.isVisible()) {
      const idText = await pokemonIdElement.textContent();
      return parseInt(idText?.replace(/\D/g, '') || '0', 10);
    }
    
    // Fallback: extract from URL or other sources
    const currentUrl = this.page.url();
    const idMatch = currentUrl.match(/pokemon\/(\d+)/);
    if (idMatch) {
      return parseInt(idMatch[1], 10);
    }
    
    // Last resort: extract from Pokemon name if it's a known Pokemon
    const pokemonName = await this.getPokemonName();
    const knownPokemon = Object.values(TestData.pokemon);
    const foundPokemon = knownPokemon.find(p => p.name.toLowerCase() === pokemonName.toLowerCase());
    return foundPokemon ? parseInt(foundPokemon.searchTerm) : 0;
  }

  async getPokemonName(): Promise<string> {
    await expect(this.pokemonName).toBeVisible();
    return (await this.pokemonName.textContent()) || '';
  }

  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // Additional helper methods for new test files
  async typeInSearchInput(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async verifyErrorDisplayed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
