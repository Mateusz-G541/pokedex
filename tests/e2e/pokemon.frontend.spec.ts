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

  test('should navigate regions and display starter Pokemon with suggestions', async ({
    page: _page,
  }) => {
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

  test('should handle invalid search queries', async ({ page: _page }) => {
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
    await TestHelpers.retryAction(
      async () => {
        await pokemonApp.verifyErrorDisplayed();
      },
      3,
      1000,
    );
  });
});

test.describe('Application Smoke Tests', () => {
  test('should initialize application without errors', async ({ page }) => {
    // Setup
    await TestHelpers.setupPage(page);

    // Navigate to application
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify core elements are present
    await TestAssertions.verifyElementVisible(page.locator('body'), 'Application body');

    await TestAssertions.verifyElementVisible(
      page.getByRole('main').or(page.locator('main, .main-content')),
      'Main content area',
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
      'Application body in tablet view',
    );

    // Test basic accessibility
    const searchInput = page
      .getByPlaceholder('Search for a Pokemon...')
      .or(page.locator('input[type="search"]'));

    await TestAssertions.verifyElementVisible(searchInput, 'Search input');

    // Verify search input is focusable
    await searchInput.focus();
    const isFocused = await searchInput.evaluate((el) => el === document.activeElement);
    expect(isFocused, 'Search input should be focusable').toBeTruthy();
  });
});

// Team Management Tests
test.describe('Team Management', () => {
  test('should add Pokemon to team successfully', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Search for a Pokemon
    const testPokemon = TestData.pokemon.pikachu;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.verifyPokemonDisplayed(testPokemon);

    // Act - Add Pokemon to team
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify Pokemon was added to team
    await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);

    // Navigate to team tab and verify Pokemon is there
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyPokemonInTeam(testPokemon.name);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('pokemon-added-to-team');
  });

  test('should remove Pokemon from team successfully', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Add a Pokemon to team first
    const testPokemon = TestData.pokemon.charizard;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.verifyPokemonDisplayed(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);

    // Navigate to team tab
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyPokemonInTeam(testPokemon.name);

    // Act - Remove Pokemon from team
    await pokemonApp.removePokemonFromTeam(testPokemon.name);

    // Assert - Verify Pokemon was removed
    await pokemonApp.verifyTeamMessage(TestData.messages.removedFromTeam);
    await pokemonApp.verifyPokemonNotInTeam(testPokemon.name);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('pokemon-removed-from-team');
  });

  test('should prevent adding duplicate Pokemon to team', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Add a Pokemon to team first
    const testPokemon = TestData.pokemon.blastoise;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.verifyPokemonDisplayed(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);

    // Act - Try to add the same Pokemon again
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify duplicate prevention message
    await pokemonApp.verifyTeamMessage(TestData.messages.alreadyInTeam);

    // Verify team still has only one Pokemon
    await pokemonApp.navigateToTeamTab();
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(1);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('duplicate-pokemon-prevention');
  });

  test('should prevent adding Pokemon when team is full', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Add 6 Pokemon to fill the team
    const teamPokemon = [
      TestData.pokemon.pikachu,
      TestData.pokemon.charizard,
      TestData.pokemon.blastoise,
      TestData.pokemon.venusaur,
      TestData.pokemon.alakazam,
      TestData.pokemon.machamp,
    ];

    for (const pokemon of teamPokemon) {
      await pokemonApp.searchForPokemon(pokemon);
      await pokemonApp.verifyPokemonDisplayed(pokemon);
      await pokemonApp.addPokemonToTeam();
      await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);
    }

    // Verify team is full
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyTeamFull();

    // Act - Try to add another Pokemon
    const extraPokemon = TestData.pokemon.gengar;
    await pokemonApp.searchForPokemon(extraPokemon);
    await pokemonApp.verifyPokemonDisplayed(extraPokemon);
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify team full message
    await pokemonApp.verifyTeamMessage(TestData.messages.teamFull);

    // Verify team size is still 6
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyTeamFull();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-full-prevention');
  });

  test('should handle team management with multiple operations', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Add multiple Pokemon to team
    const teamPokemon = [
      TestData.pokemon.pikachu,
      TestData.pokemon.charizard,
      TestData.pokemon.blastoise,
    ];

    // Add Pokemon to team
    for (const pokemon of teamPokemon) {
      await pokemonApp.searchForPokemon(pokemon);
      await pokemonApp.verifyPokemonDisplayed(pokemon);
      await pokemonApp.addPokemonToTeam();
      await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);
    }

    // Navigate to team and verify all Pokemon are there
    await pokemonApp.navigateToTeamTab();
    for (const pokemon of teamPokemon) {
      await pokemonApp.verifyPokemonInTeam(pokemon.name);
    }

    // Act - Remove one Pokemon
    await pokemonApp.removePokemonFromTeam(teamPokemon[1].name);
    await pokemonApp.verifyTeamMessage(TestData.messages.removedFromTeam);

    // Assert - Verify correct Pokemon was removed
    await pokemonApp.verifyPokemonNotInTeam(teamPokemon[1].name);
    await pokemonApp.verifyPokemonInTeam(teamPokemon[0].name);
    await pokemonApp.verifyPokemonInTeam(teamPokemon[2].name);

    // Verify team size is now 2
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(2);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-multiple-operations');
  });

  test('should handle team navigation and display correctly', async ({ page }) => {
    const pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();

    // Arrange - Start with empty team
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyTeamEmpty();

    // Add a Pokemon to team
    const testPokemon = TestData.pokemon.venusaur;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.verifyPokemonDisplayed(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.addedToTeam);

    // Act - Navigate back to team tab
    await pokemonApp.navigateToTeamTab();

    // Assert - Verify Pokemon is displayed in team
    await pokemonApp.verifyPokemonInTeam(testPokemon.name);

    // Verify team size is 1
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(1);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-navigation-display');
  });
});
