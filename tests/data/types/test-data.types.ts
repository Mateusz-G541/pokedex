/**
 * Centralized Test Data Types
 * 
 * WHY: Type safety ensures test data consistency and catches errors at compile time
 */

export interface PokemonTestData {
  id: number;
  name: string;
  displayName: string; // Capitalized version for UI
  type: string;
  types?: string[]; // Multiple types for some Pokemon
  searchTerm: string;
  expectedName: string;
  generation: number;
  isLegendary?: boolean;
  evolutionChain?: string[];
  sprites?: {
    front_default: string;
    front_shiny?: string;
  };
}

export interface RegionTestData {
  name: string;
  displayName: string;
  starters: PokemonTestData[];
  legendaries: PokemonTestData[];
  totalPokemon: number;
}

export interface TeamTestData {
  maxSize: number;
  testTeam: PokemonTestData[];
  duplicateTest: PokemonTestData;
  fullTeamScenario: PokemonTestData[];
}

export interface UITestData {
  viewport: {
    width: number;
    height: number;
  };
  timeouts: {
    short: number;
    medium: number;
    long: number;
    network: number;
  };
  selectors: {
    searchInput: string;
    searchButton: string;
    randomButton: string;
    randomLegendaryButton: string;
    pokemonCard: string;
    pokemonImage: string;
    pokemonName: string;
    teamTab: string;
    addToTeamButton: string;
    removeFromTeamButton: string;
    teamMember: string;
    errorMessage: string;
    loadingIndicator: string;
  };
}

export interface APITestData {
  endpoints: {
    pokemon: string;
    pokemonById: (id: number) => string;
    pokemonByName: (name: string) => string;
    types: string;
    species: (id: number) => string;
    evolutionChain: (id: number) => string;
  };
  validIds: number[];
  invalidIds: number[];
  validNames: string[];
  invalidNames: string[];
  expectedFields: string[];
}

export interface ValidationRules {
  generation1: {
    minId: number;
    maxId: number;
    totalCount: number;
  };
  pokemonName: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
  };
  search: {
    minQueryLength: number;
    maxResults: number;
  };
  team: {
    maxSize: number;
    minSize: number;
  };
}

export interface TestScenarios {
  search: {
    valid: Array<{
      query: string;
      expectedResults: string[];
      description: string;
    }>;
    invalid: Array<{
      query: string;
      expectedError: string;
      description: string;
    }>;
    edge: Array<{
      query: string;
      expectedBehavior: string;
      description: string;
    }>;
  };
  random: {
    standardTests: number; // How many times to test randomness
    legendaryTests: number;
    generation1Validation: boolean;
  };
  team: {
    addScenarios: Array<{
      pokemon: string;
      expectedOutcome: 'success' | 'duplicate' | 'full';
      description: string;
    }>;
    removeScenarios: Array<{
      pokemon: string;
      expectedOutcome: 'success' | 'not_found';
      description: string;
    }>;
  };
}

export interface ErrorMessages {
  pokemon: {
    notFound: string;
    invalidId: string;
    networkError: string;
    loadingFailed: string;
  };
  team: {
    duplicate: string;
    full: string;
    empty: string;
    removeSuccess: string;
    addSuccess: string;
  };
  search: {
    noResults: string;
    tooShort: string;
    invalidCharacters: string;
  };
  api: {
    serverError: string;
    timeout: string;
    unauthorized: string;
    notFound: string;
  };
}

// Utility types for test data generation
export type TestDataCategory = 'pokemon' | 'region' | 'team' | 'ui' | 'api' | 'validation';
export type TestEnvironment = 'local' | 'ci' | 'staging' | 'production';
export type TestType = 'unit' | 'integration' | 'e2e' | 'api';
