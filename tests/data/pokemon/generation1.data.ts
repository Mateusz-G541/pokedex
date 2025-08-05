/**
 * Generation 1 Pokemon Test Data
 * 
 * WHY: Centralized Generation 1 Pokemon data ensures consistency across all tests
 * and provides a single source of truth for Pokemon validation
 */

import { PokemonTestData } from '../types/test-data.types';

export const Generation1Pokemon: Record<string, PokemonTestData> = {
  // Starter Pokemon - Most commonly used in tests
  bulbasaur: {
    id: 1,
    name: 'bulbasaur',
    displayName: 'Bulbasaur',
    type: 'grass',
    types: ['grass', 'poison'],
    searchTerm: 'bulbasaur',
    expectedName: 'bulbasaur',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['bulbasaur', 'ivysaur', 'venusaur'],
    sprites: {
      front_default: '/images/pokemon/sprites/1.png'
    }
  },
  
  charmander: {
    id: 4,
    name: 'charmander',
    displayName: 'Charmander',
    type: 'fire',
    types: ['fire'],
    searchTerm: 'charmander',
    expectedName: 'charmander',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['charmander', 'charmeleon', 'charizard'],
    sprites: {
      front_default: '/images/pokemon/sprites/4.png'
    }
  },
  
  squirtle: {
    id: 7,
    name: 'squirtle',
    displayName: 'Squirtle',
    type: 'water',
    types: ['water'],
    searchTerm: 'squirtle',
    expectedName: 'squirtle',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['squirtle', 'wartortle', 'blastoise'],
    sprites: {
      front_default: '/images/pokemon/sprites/7.png'
    }
  },

  // Popular Pokemon for testing
  pikachu: {
    id: 25,
    name: 'pikachu',
    displayName: 'Pikachu',
    type: 'electric',
    types: ['electric'],
    searchTerm: 'pikachu',
    expectedName: 'pikachu',
    generation: 1,
    isLegendary: false,
    sprites: {
      front_default: '/images/pokemon/sprites/25.png'
    }
  },

  charizard: {
    id: 6,
    name: 'charizard',
    displayName: 'Charizard',
    type: 'fire',
    types: ['fire', 'flying'],
    searchTerm: 'charizard',
    expectedName: 'charizard',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['charmander', 'charmeleon', 'charizard'],
    sprites: {
      front_default: '/images/pokemon/sprites/6.png'
    }
  },

  blastoise: {
    id: 9,
    name: 'blastoise',
    displayName: 'Blastoise',
    type: 'water',
    types: ['water'],
    searchTerm: 'blastoise',
    expectedName: 'blastoise',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['squirtle', 'wartortle', 'blastoise'],
    sprites: {
      front_default: '/images/pokemon/sprites/9.png'
    }
  },

  venusaur: {
    id: 3,
    name: 'venusaur',
    displayName: 'Venusaur',
    type: 'grass',
    types: ['grass', 'poison'],
    searchTerm: 'venusaur',
    expectedName: 'venusaur',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['bulbasaur', 'ivysaur', 'venusaur'],
    sprites: {
      front_default: '/images/pokemon/sprites/3.png'
    }
  },

  // Psychic Pokemon for type testing
  alakazam: {
    id: 65,
    name: 'alakazam',
    displayName: 'Alakazam',
    type: 'psychic',
    types: ['psychic'],
    searchTerm: 'alakazam',
    expectedName: 'alakazam',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['abra', 'kadabra', 'alakazam'],
    sprites: {
      front_default: '/images/pokemon/sprites/65.png'
    }
  },

  // Fighting Pokemon
  machamp: {
    id: 68,
    name: 'machamp',
    displayName: 'Machamp',
    type: 'fighting',
    types: ['fighting'],
    searchTerm: 'machamp',
    expectedName: 'machamp',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['machop', 'machoke', 'machamp'],
    sprites: {
      front_default: '/images/pokemon/sprites/68.png'
    }
  },

  // Ghost Pokemon
  gengar: {
    id: 94,
    name: 'gengar',
    displayName: 'Gengar',
    type: 'ghost',
    types: ['ghost', 'poison'],
    searchTerm: 'gengar',
    expectedName: 'gengar',
    generation: 1,
    isLegendary: false,
    evolutionChain: ['gastly', 'haunter', 'gengar'],
    sprites: {
      front_default: '/images/pokemon/sprites/94.png'
    }
  },

  // Legendary Pokemon - Critical for random legendary testing
  articuno: {
    id: 144,
    name: 'articuno',
    displayName: 'Articuno',
    type: 'ice',
    types: ['ice', 'flying'],
    searchTerm: 'articuno',
    expectedName: 'articuno',
    generation: 1,
    isLegendary: true,
    sprites: {
      front_default: '/images/pokemon/sprites/144.png'
    }
  },

  zapdos: {
    id: 145,
    name: 'zapdos',
    displayName: 'Zapdos',
    type: 'electric',
    types: ['electric', 'flying'],
    searchTerm: 'zapdos',
    expectedName: 'zapdos',
    generation: 1,
    isLegendary: true,
    sprites: {
      front_default: '/images/pokemon/sprites/145.png'
    }
  },

  moltres: {
    id: 146,
    name: 'moltres',
    displayName: 'Moltres',
    type: 'fire',
    types: ['fire', 'flying'],
    searchTerm: 'moltres',
    expectedName: 'moltres',
    generation: 1,
    isLegendary: true,
    sprites: {
      front_default: '/images/pokemon/sprites/146.png'
    }
  },

  mewtwo: {
    id: 150,
    name: 'mewtwo',
    displayName: 'Mewtwo',
    type: 'psychic',
    types: ['psychic'],
    searchTerm: 'mewtwo',
    expectedName: 'mewtwo',
    generation: 1,
    isLegendary: true,
    sprites: {
      front_default: '/images/pokemon/sprites/150.png'
    }
  },

  mew: {
    id: 151,
    name: 'mew',
    displayName: 'Mew',
    type: 'psychic',
    types: ['psychic'],
    searchTerm: 'mew',
    expectedName: 'mew',
    generation: 1,
    isLegendary: true,
    sprites: {
      front_default: '/images/pokemon/sprites/151.png'
    }
  }
};

// Utility arrays for easy access
export const Gen1Starters = [
  Generation1Pokemon.bulbasaur,
  Generation1Pokemon.charmander,
  Generation1Pokemon.squirtle
];

export const Gen1Legendaries = [
  Generation1Pokemon.articuno,
  Generation1Pokemon.zapdos,
  Generation1Pokemon.moltres,
  Generation1Pokemon.mewtwo,
  Generation1Pokemon.mew
];

export const Gen1Popular = [
  Generation1Pokemon.pikachu,
  Generation1Pokemon.charizard,
  Generation1Pokemon.blastoise,
  Generation1Pokemon.venusaur,
  Generation1Pokemon.alakazam,
  Generation1Pokemon.machamp,
  Generation1Pokemon.gengar
];

// Generation 1 validation constants
export const GEN1_CONSTANTS = {
  MIN_ID: 1,
  MAX_ID: 151,
  TOTAL_COUNT: 151,
  LEGENDARY_IDS: [144, 145, 146, 150, 151],
  STARTER_IDS: [1, 4, 7]
} as const;
