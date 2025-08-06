/**
 * Legacy Test Data Export
 *
 * WHY: Maintains backward compatibility while transitioning to new factory pattern
 * TODO: Gradually migrate all test files to use TestDataFactory directly
 */

// import { TestDataFactory } from './factory/test-data.factory'; // Commented out until used

// Create factory instance for backward compatibility
// const factory = TestDataFactory.getInstance(); // Commented out until used

// Legacy export structure for existing tests
export const TestData = {
  pokemon: {
    pikachu: {
      name: 'pikachu',
      id: 25,
      type: 'electric',
      searchTerm: 'pikachu',
      expectedName: 'pikachu',
    },
    charizard: {
      name: 'charizard',
      id: 6,
      type: 'fire',
      searchTerm: 'charizard',
      expectedName: 'charizard',
    },
    bulbasaur: {
      name: 'bulbasaur',
      id: 1,
      type: 'grass',
      searchTerm: 'bulbasaur',
      expectedName: 'bulbasaur',
    },
    blastoise: {
      name: 'blastoise',
      id: 9,
      type: 'water',
      searchTerm: 'blastoise',
    },
    venusaur: {
      name: 'venusaur',
      id: 3,
      type: 'grass',
      searchTerm: 'venusaur',
    },
    alakazam: {
      name: 'alakazam',
      id: 65,
      type: 'psychic',
      searchTerm: 'alakazam',
    },
    machamp: {
      name: 'machamp',
      id: 68,
      type: 'fighting',
      searchTerm: 'machamp',
    },
    gengar: {
      name: 'gengar',
      id: 94,
      type: 'ghost',
      searchTerm: 'gengar',
    },
  },
  regions: {
    kanto: {
      name: 'kanto',
      generation: 1,
      starters: ['bulbasaur', 'charmander', 'squirtle'],
      pokemonRange: { start: 1, end: 151 },
    },
  },
  search: {
    suggestions: {
      validQuery: 'char',
      expectedResults: ['charmander', 'charizard', 'charmeleon'],
      minResultCount: 1,
    },
    invalid: {
      query: 'invalidpokemon123',
      expectedError: 'Pokemon not found',
    },
  },
  ui: {
    timeouts: {
      short: 5000,
      medium: 10000,
      long: 30000,
    },
    viewport: {
      width: 1280,
      height: 720,
    },
  },
  messages: {
    loading: 'Loading...',
    error: 'Error loading Pokemon data',
    notFound: 'Pokemon not found',
    networkError: 'Network error occurred',
    teamFull: 'Your team is full! Remove a Pokémon to add a new one.',
    alreadyInTeam: 'This Pokémon is already in your team!',
    addedToTeam: 'added to your team!',
    removedFromTeam: 'Pokémon removed from your team.',
    teamCleared: 'All Pokémon released from your team.',
  },
  team: {
    maxSize: 6,
    testTeam: [
      { name: 'pikachu', id: 25 },
      { name: 'charizard', id: 6 },
      { name: 'blastoise', id: 9 },
      { name: 'venusaur', id: 3 },
      { name: 'alakazam', id: 65 },
      { name: 'machamp', id: 68 },
    ],
  },
} as const;

export type PokemonData = (typeof TestData.pokemon)[keyof typeof TestData.pokemon];
export type RegionData = (typeof TestData.regions)[keyof typeof TestData.regions];
