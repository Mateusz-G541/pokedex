/**
 * Test Scenarios Data
 * 
 * WHY: Centralized test scenarios ensure comprehensive coverage and maintainable test cases
 */

import { TestScenarios, APITestData } from '../types/test-data.types';
import { Generation1Pokemon, GEN1_CONSTANTS } from '../pokemon/generation1.data';

export const TestScenarios: TestScenarios = {
  search: {
    valid: [
      {
        query: 'pik',
        expectedResults: ['pikachu'],
        description: 'Should find Pikachu with partial name'
      },
      {
        query: 'char',
        expectedResults: ['charmander', 'charmeleon', 'charizard'],
        description: 'Should find Charmander evolution line'
      },
      {
        query: 'bulbasaur',
        expectedResults: ['bulbasaur'],
        description: 'Should find exact match for Bulbasaur'
      },
      {
        query: 'fire',
        expectedResults: ['charmander', 'charmeleon', 'charizard', 'vulpix', 'ninetales', 'growlithe', 'arcanine', 'ponyta', 'rapidash', 'magmar'],
        description: 'Should find Pokemon by type'
      }
    ],
    
    invalid: [
      {
        query: '',
        expectedError: 'Search query too short',
        description: 'Empty search should show error'
      },
      {
        query: 'xyz123',
        expectedError: 'No Pokemon found matching your search',
        description: 'Non-existent Pokemon should show no results'
      },
      {
        query: '!@#$%',
        expectedError: 'Invalid characters in search query',
        description: 'Special characters should be handled gracefully'
      }
    ],
    
    edge: [
      {
        query: 'a',
        expectedBehavior: 'Should handle single character search',
        description: 'Single character search edge case'
      },
      {
        query: 'nidoran',
        expectedBehavior: 'Should handle Pokemon with gender variations',
        description: 'Gender variation handling'
      },
      {
        query: 'mr. mime',
        expectedBehavior: 'Should handle Pokemon with special characters',
        description: 'Special character handling in names'
      }
    ]
  },
  
  random: {
    standardTests: 5, // Test randomness 5 times
    legendaryTests: 3, // Test legendary randomness 3 times
    generation1Validation: true
  },
  
  team: {
    addScenarios: [
      {
        pokemon: 'pikachu',
        expectedOutcome: 'success',
        description: 'Should successfully add Pikachu to empty team'
      },
      {
        pokemon: 'pikachu', // Same Pokemon again
        expectedOutcome: 'duplicate',
        description: 'Should prevent adding duplicate Pokemon'
      },
      {
        pokemon: 'charizard',
        expectedOutcome: 'success',
        description: 'Should add different Pokemon to team'
      }
    ],
    
    removeScenarios: [
      {
        pokemon: 'pikachu',
        expectedOutcome: 'success',
        description: 'Should successfully remove Pokemon from team'
      },
      {
        pokemon: 'nonexistent',
        expectedOutcome: 'not_found',
        description: 'Should handle removing non-existent Pokemon gracefully'
      }
    ]
  }
};

export const APITestData: APITestData = {
  endpoints: {
    pokemon: '/api/pokemon',
    pokemonById: (id: number) => `/api/pokemon/${id}`,
    pokemonByName: (name: string) => `/api/pokemon/${name}`,
    types: '/api/pokemon/types',
    species: (id: number) => `/api/pokemon/species/${id}`,
    evolutionChain: (id: number) => `/api/pokemon/evolution-chain/${id}`
  },
  
  validIds: [1, 25, 6, 9, 3, 65, 68, 94, 144, 145, 146, 150, 151],
  invalidIds: [0, -1, 152, 999, 1000],
  
  validNames: [
    'bulbasaur', 'charmander', 'squirtle', 'pikachu', 'charizard',
    'blastoise', 'venusaur', 'alakazam', 'machamp', 'gengar',
    'articuno', 'zapdos', 'moltres', 'mewtwo', 'mew'
  ],
  
  invalidNames: [
    '', 'nonexistent', '123', 'pokemon-that-does-not-exist',
    'special!@#characters', 'toolongpokemonname' + 'x'.repeat(100)
  ],
  
  expectedFields: [
    'id', 'name', 'types', 'sprites', 'height', 'weight',
    'base_experience', 'species', 'stats'
  ]
};

// Test data for different test types
export const TestDataByType = {
  unit: {
    pokemon: [
      Generation1Pokemon.pikachu,
      Generation1Pokemon.charizard,
      Generation1Pokemon.bulbasaur
    ],
    scenarios: ['basic functionality', 'error handling', 'edge cases']
  },
  
  integration: {
    pokemon: [
      Generation1Pokemon.pikachu,
      Generation1Pokemon.charizard,
      Generation1Pokemon.alakazam,
      Generation1Pokemon.gengar
    ],
    scenarios: ['API integration', 'data transformation', 'error propagation']
  },
  
  e2e: {
    pokemon: [
      Generation1Pokemon.pikachu,
      Generation1Pokemon.charizard,
      Generation1Pokemon.bulbasaur,
      Generation1Pokemon.squirtle,
      Generation1Pokemon.charmander
    ],
    scenarios: ['user workflows', 'full feature testing', 'cross-browser compatibility']
  },
  
  api: {
    pokemon: [
      Generation1Pokemon.pikachu,
      Generation1Pokemon.charizard,
      Generation1Pokemon.mewtwo,
      Generation1Pokemon.mew
    ],
    scenarios: ['endpoint testing', 'data validation', 'error responses']
  }
};

// Performance testing data
export const PerformanceTestData = {
  loadTesting: {
    concurrentUsers: 10,
    requestsPerSecond: 50,
    testDuration: 60000, // 1 minute
    acceptableResponseTime: 2000 // 2 seconds
  },
  
  stressTestScenarios: [
    {
      name: 'Heavy search load',
      requests: TestScenarios.search.valid.map(s => s.query),
      expectedMaxResponseTime: 3000
    },
    {
      name: 'Random Pokemon generation',
      requests: Array(20).fill('random'),
      expectedMaxResponseTime: 1000
    },
    {
      name: 'Team operations',
      requests: ['add', 'remove', 'add', 'remove'],
      expectedMaxResponseTime: 1500
    }
  ]
};

// Data-driven test generators
export const TestGenerators = {
  generateSearchTests: (count: number = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      query: Object.keys(Generation1Pokemon)[i % Object.keys(Generation1Pokemon).length],
      expectedResult: Object.values(Generation1Pokemon)[i % Object.values(Generation1Pokemon).length],
      testId: `search-test-${i + 1}`
    }));
  },
  
  generateRandomTests: (count: number = 5) => {
    return Array.from({ length: count }, (_, i) => ({
      testId: `random-test-${i + 1}`,
      expectedIdRange: { min: GEN1_CONSTANTS.MIN_ID, max: GEN1_CONSTANTS.MAX_ID },
      validationRules: ['generation1', 'validId', 'hasName']
    }));
  },
  
  generateTeamTests: (maxTeamSize: number = 6) => {
    const testPokemon = Object.values(Generation1Pokemon).slice(0, maxTeamSize + 2);
    return testPokemon.map((pokemon, i) => ({
      testId: `team-test-${i + 1}`,
      pokemon,
      expectedOutcome: i < maxTeamSize ? 'success' : 'full',
      teamSizeBefore: Math.min(i, maxTeamSize),
      teamSizeAfter: Math.min(i + 1, maxTeamSize)
    }));
  }
};
