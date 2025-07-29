// Test data for Pokemon E2E tests
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
    error: 'Error',
    notFound: 'Pokemon not found',
  },
} as const;

export type PokemonData = typeof TestData.pokemon[keyof typeof TestData.pokemon];
export type RegionData = typeof TestData.regions[keyof typeof TestData.regions];
