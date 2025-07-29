import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestData } from '../data/pokemon.test-data';
import { TestHelpers } from '../helpers/test.helpers';

test.describe('Region Navigation', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    await TestHelpers.setupPage(page);
    pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();
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
    await pokemonApp.selectRegion(kantoRegion.name);

    // Assert - Verify starter Pokemon are displayed
    for (const starter of kantoRegion.starters) {
      const isStarterVisible = await pokemonApp.isStarterPokemonVisible(starter);
      expect(isStarterVisible, `Starter Pokemon ${starter} should be visible`).toBeTruthy();
    }

    // Test search suggestions functionality
    await pokemonApp.typeInSearchInput(suggestionData.partialName);
    await pokemonApp.verifySuggestionsDisplayed();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('region-navigation-kanto');
  });

  test('should display correct starter Pokemon for each region', async ({ page: _page }) => {
    // Test each available region
    for (const [regionName, regionData] of Object.entries(TestData.regions)) {
      // Skip if region is not available in current implementation
      const isRegionVisible = await pokemonApp.isRegionTabVisible(regionData.name);
      if (!isRegionVisible) {
        console.log(`Skipping ${regionName} - not available in current implementation`);
        continue;
      }

      // Act - Select region
      await pokemonApp.selectRegion(regionData.name);

      // Assert - Verify starter Pokemon are displayed
      for (const starter of regionData.starters) {
        const isStarterVisible = await pokemonApp.isStarterPokemonVisible(starter);
        expect(
          isStarterVisible,
          `Starter Pokemon ${starter} should be visible in ${regionData.name}`,
        ).toBeTruthy();
      }

      // Take screenshot for this region
      await pokemonApp.takeScreenshot(`region-${regionName.toLowerCase()}`);
    }
  });

  test('should handle region switching without errors', async ({ page: _page }) => {
    // Arrange - Get available regions
    const availableRegions = Object.values(TestData.regions).filter(async (region) => {
      return await pokemonApp.isRegionTabVisible(region.name);
    });

    // Act - Switch between regions multiple times
    for (let i = 0; i < 3; i++) {
      for (const region of availableRegions) {
        const isVisible = await pokemonApp.isRegionTabVisible(region.name);
        if (isVisible) {
          await pokemonApp.selectRegion(region.name);
          
          // Verify no errors occurred
          await pokemonApp.verifyNoErrors();
          
          // Small delay between switches
          await pokemonApp.waitForTimeout(500);
        }
      }
    }

    // Assert - Verify application is still functional
    await pokemonApp.verifyNoErrors();
    await pokemonApp.takeScreenshot('region-switching-stability');
  });
});
