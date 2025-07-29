import { test, expect } from '@playwright/test';
import { PokemonAppPage } from '../pages/pokemon-app.page';
import { TestData } from '../data/pokemon.test-data';
import { TestHelpers } from '../helpers/test.helpers';

test.describe('Team Management', () => {
  let pokemonApp: PokemonAppPage;

  test.beforeEach(async ({ page }) => {
    await TestHelpers.setupPage(page);
    pokemonApp = new PokemonAppPage(page);
    await pokemonApp.navigate();
  });

  test('should add Pokemon to team successfully', async ({ page: _page }) => {
    // Arrange - Search for a Pokemon first
    const testPokemon = TestData.pokemon.pikachu;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.verifyPokemonDisplayed(testPokemon);

    // Act - Add Pokemon to team
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify success message
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Navigate to team and verify Pokemon is there
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyPokemonInTeam(testPokemon.name);

    // Verify team size is 1
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(1);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-add-pokemon');
  });

  test('should remove Pokemon from team successfully', async ({ page: _page }) => {
    // Arrange - Add a Pokemon to team first
    const testPokemon = TestData.pokemon.charizard;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Navigate to team tab
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyPokemonInTeam(testPokemon.name);

    // Act - Remove Pokemon from team
    await pokemonApp.removePokemonFromTeam(testPokemon.name);

    // Assert - Verify removal message
    await pokemonApp.verifyTeamMessage(TestData.messages.team.removed);

    // Verify Pokemon is no longer in team
    await pokemonApp.verifyPokemonNotInTeam(testPokemon.name);

    // Verify team is empty
    await pokemonApp.verifyTeamEmpty();

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-remove-pokemon');
  });

  test('should prevent adding duplicate Pokemon to team', async ({ page: _page }) => {
    // Arrange - Add a Pokemon to team first
    const testPokemon = TestData.pokemon.blastoise;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Act - Try to add the same Pokemon again
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify duplicate prevention message
    await pokemonApp.verifyTeamMessage(TestData.messages.team.duplicate);

    // Verify team size is still 1
    await pokemonApp.navigateToTeamTab();
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(1);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-duplicate-prevention');
  });

  test('should prevent adding Pokemon when team is full (6 Pokemon)', async ({ page: _page }) => {
    // Arrange - Add 6 Pokemon to fill the team
    const testTeam = TestData.team.testTeam;
    
    for (const pokemon of testTeam) {
      await pokemonApp.searchForPokemon(pokemon);
      await pokemonApp.addPokemonToTeam();
      await pokemonApp.verifyTeamMessage(TestData.messages.team.added);
    }

    // Verify team is full
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyTeamFull();

    // Act - Try to add another Pokemon
    const extraPokemon = TestData.pokemon.mew;
    await pokemonApp.searchForPokemon(extraPokemon);
    await pokemonApp.addPokemonToTeam();

    // Assert - Verify team full message
    await pokemonApp.verifyTeamMessage(TestData.messages.team.full);

    // Verify team size is still 6
    await pokemonApp.navigateToTeamTab();
    const teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(TestData.team.maxSize);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-full-prevention');
  });

  test('should handle team management with multiple operations', async ({ page: _page }) => {
    // Arrange - Add multiple Pokemon to team
    const pokemon1 = TestData.pokemon.pikachu;
    const pokemon2 = TestData.pokemon.charizard;
    const pokemon3 = TestData.pokemon.blastoise;

    // Add first Pokemon
    await pokemonApp.searchForPokemon(pokemon1);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Add second Pokemon
    await pokemonApp.searchForPokemon(pokemon2);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Add third Pokemon
    await pokemonApp.searchForPokemon(pokemon3);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Navigate to team and verify all Pokemon are there
    await pokemonApp.navigateToTeamTab();
    await pokemonApp.verifyPokemonInTeam(pokemon1.name);
    await pokemonApp.verifyPokemonInTeam(pokemon2.name);
    await pokemonApp.verifyPokemonInTeam(pokemon3.name);

    // Verify team size is 3
    let teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(3);

    // Act - Remove middle Pokemon
    await pokemonApp.removePokemonFromTeam(pokemon2.name);
    await pokemonApp.verifyTeamMessage(TestData.messages.team.removed);

    // Assert - Verify team state after removal
    await pokemonApp.verifyPokemonInTeam(pokemon1.name);
    await pokemonApp.verifyPokemonNotInTeam(pokemon2.name);
    await pokemonApp.verifyPokemonInTeam(pokemon3.name);

    // Verify team size is now 2
    teamSize = await pokemonApp.getTeamSize();
    expect(teamSize).toBe(2);

    // Take screenshot for verification
    await pokemonApp.takeScreenshot('team-multiple-operations');
  });

  test('should navigate between tabs and display team correctly', async ({ page: _page }) => {
    // Arrange - Add a Pokemon to team
    const testPokemon = TestData.pokemon.venusaur;
    await pokemonApp.searchForPokemon(testPokemon);
    await pokemonApp.addPokemonToTeam();
    await pokemonApp.verifyTeamMessage(TestData.messages.team.added);

    // Act - Navigate to team tab
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
