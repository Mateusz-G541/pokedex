/**
 * Test Data Factory
 *
 * WHY: Centralized factory provides a single entry point for all test data,
 * making it easy to access and maintain test data across all test files
 */

import {
  PokemonTestData,
  RegionTestData,
  TeamTestData,
  TestEnvironment,
  TestType,
} from '../types/test-data.types';

import {
  Generation1Pokemon,
  Gen1Starters,
  Gen1Legendaries,
  GEN1_CONSTANTS,
} from '../pokemon/generation1.data';
import { UIData, ValidationRules, ErrorMessages, EnvironmentConfig } from '../ui/interface.data';
import { TestScenarios, APITestData, TestGenerators } from '../scenarios/test-scenarios.data';

/**
 * Main Test Data Factory
 * Provides centralized access to all test data with environment-aware configuration
 */
export class TestDataFactory {
  private static instance: TestDataFactory;
  private environment: TestEnvironment;
  private testType: TestType;

  private constructor(environment: TestEnvironment = 'local', testType: TestType = 'e2e') {
    this.environment = environment;
    this.testType = testType;
  }

  public static getInstance(
    environment: TestEnvironment = 'local',
    testType: TestType = 'e2e',
  ): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory(environment, testType);
    }
    return TestDataFactory.instance;
  }

  // Pokemon Data Access
  public getPokemon(): Record<string, PokemonTestData> {
    return Generation1Pokemon;
  }

  public getPokemonByName(name: string): PokemonTestData | undefined {
    return Generation1Pokemon[name.toLowerCase()];
  }

  public getPokemonById(id: number): PokemonTestData | undefined {
    return Object.values(Generation1Pokemon).find((pokemon) => pokemon.id === id);
  }

  public getStarters(): PokemonTestData[] {
    return Gen1Starters;
  }

  public getLegendaries(): PokemonTestData[] {
    return Gen1Legendaries;
  }

  public getRandomPokemon(): PokemonTestData {
    const allPokemon = Object.values(Generation1Pokemon);
    return allPokemon[Math.floor(Math.random() * allPokemon.length)];
  }

  public getRandomLegendary(): PokemonTestData {
    return Gen1Legendaries[Math.floor(Math.random() * Gen1Legendaries.length)];
  }

  // UI Data Access
  public getUIData() {
    return UIData;
  }

  public getSelectors() {
    return UIData.selectors;
  }

  public getTimeouts() {
    // Adjust timeouts based on environment
    const baseTimeouts = UIData.timeouts;
    const multiplier = this.environment === 'ci' ? 2 : 1;

    return {
      short: baseTimeouts.short * multiplier,
      medium: baseTimeouts.medium * multiplier,
      long: baseTimeouts.long * multiplier,
      network: baseTimeouts.network * multiplier,
    };
  }

  public getViewport() {
    return UIData.viewport;
  }

  // Validation Rules
  public getValidationRules() {
    return ValidationRules;
  }

  public getErrorMessages() {
    return ErrorMessages;
  }

  // Test Scenarios
  public getTestScenarios() {
    return TestScenarios;
  }

  public getSearchScenarios() {
    return TestScenarios.search;
  }

  public getTeamScenarios() {
    return TestScenarios.team;
  }

  public getRandomTestConfig() {
    return TestScenarios.random;
  }

  // API Test Data
  public getAPIData() {
    return APITestData;
  }

  public getAPIEndpoints() {
    return APITestData.endpoints;
  }

  public getValidIds() {
    return APITestData.validIds;
  }

  public getInvalidIds() {
    return APITestData.invalidIds;
  }

  // Environment Configuration
  public getEnvironmentConfig() {
    return EnvironmentConfig[this.environment];
  }

  public getBaseUrl(): string {
    return EnvironmentConfig[this.environment].baseUrl;
  }

  public getAPIUrl(): string {
    return EnvironmentConfig[this.environment].apiUrl;
  }

  // Team Test Data
  public getTeamTestData(): TeamTestData {
    return {
      maxSize: ValidationRules.team.maxSize,
      testTeam: [
        Generation1Pokemon.pikachu,
        Generation1Pokemon.charizard,
        Generation1Pokemon.blastoise,
        Generation1Pokemon.venusaur,
      ],
      duplicateTest: Generation1Pokemon.pikachu,
      fullTeamScenario: [
        Generation1Pokemon.pikachu,
        Generation1Pokemon.charizard,
        Generation1Pokemon.blastoise,
        Generation1Pokemon.venusaur,
        Generation1Pokemon.alakazam,
        Generation1Pokemon.machamp,
        Generation1Pokemon.gengar, // 7th Pokemon to test full team
      ],
    };
  }

  // Region Test Data
  public getKantoRegion(): RegionTestData {
    return {
      name: 'kanto',
      displayName: 'Kanto',
      starters: Gen1Starters,
      legendaries: Gen1Legendaries,
      totalPokemon: GEN1_CONSTANTS.TOTAL_COUNT,
    };
  }

  // Generation 1 Constants
  public getGen1Constants() {
    return GEN1_CONSTANTS;
  }

  // Test Generators
  public generateSearchTests(count?: number) {
    return TestGenerators.generateSearchTests(count);
  }

  public generateRandomTests(count?: number) {
    return TestGenerators.generateRandomTests(count);
  }

  public generateTeamTests(maxTeamSize?: number) {
    return TestGenerators.generateTeamTests(maxTeamSize);
  }

  // Utility Methods
  public isValidGen1Id(id: number): boolean {
    return id >= GEN1_CONSTANTS.MIN_ID && id <= GEN1_CONSTANTS.MAX_ID;
  }

  public isLegendaryId(id: number): boolean {
    return GEN1_CONSTANTS.LEGENDARY_IDS.includes(id);
  }

  public isStarterId(id: number): boolean {
    return GEN1_CONSTANTS.STARTER_IDS.includes(id);
  }

  // Test Data Validation
  public validatePokemonData(pokemon: any): pokemon is PokemonTestData {
    return (
      typeof pokemon === 'object' &&
      typeof pokemon.id === 'number' &&
      typeof pokemon.name === 'string' &&
      typeof pokemon.displayName === 'string' &&
      typeof pokemon.type === 'string' &&
      typeof pokemon.generation === 'number' &&
      this.isValidGen1Id(pokemon.id)
    );
  }

  // Environment Detection
  public isCI(): boolean {
    return (
      this.environment === 'ci' ||
      process.env.CI === 'true' ||
      process.env.GITHUB_ACTIONS === 'true'
    );
  }

  public isLocal(): boolean {
    return this.environment === 'local';
  }

  // Test Type Specific Data
  public getTestTypeSpecificData() {
    const testDataByType = {
      unit: {
        pokemon: [Generation1Pokemon.pikachu, Generation1Pokemon.charizard],
        timeout: this.getTimeouts().short,
        retries: 0,
      },
      integration: {
        pokemon: Object.values(Generation1Pokemon).slice(0, 5),
        timeout: this.getTimeouts().medium,
        retries: 1,
      },
      e2e: {
        pokemon: Object.values(Generation1Pokemon),
        timeout: this.getTimeouts().long,
        retries: 2,
      },
      api: {
        pokemon: [Generation1Pokemon.pikachu, Generation1Pokemon.mewtwo],
        timeout: this.getTimeouts().network,
        retries: 3,
      },
    };

    return testDataByType[this.testType];
  }
}

// Convenience exports for direct access
export const TestData = TestDataFactory.getInstance();

// Environment-specific factories
export const LocalTestData = TestDataFactory.getInstance('local', 'e2e');
export const CITestData = TestDataFactory.getInstance('ci', 'e2e');

// Type-specific factories
export const UnitTestData = TestDataFactory.getInstance('local', 'unit');
export const IntegrationTestData = TestDataFactory.getInstance('local', 'integration');
export const E2ETestData = TestDataFactory.getInstance('local', 'e2e');
export const APITestData = TestDataFactory.getInstance('local', 'api');
