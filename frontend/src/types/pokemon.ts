export interface Ability {
  ability: {
    name: string;
  };
}

export interface Type {
  type: {
    name: string;
  };
}

export interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  abilities: Ability[];
  types: Type[];
  stats: Stat[];
  species: {
    url: string;
  };
}

export interface EvolutionChain {
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: EvolvesTo[];
  };
}

export interface EvolvesTo {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolvesTo[];
}

export interface EvolutionData {
  name: string;
  id: number;
  image: string;
}

export interface TypeAnalysis {
  strongAgainst: string[];
  weakAgainst: string[];
  immuneTo: string[];
  resistantTo: string[];
  vulnerableTo: string[];
}

export interface PokemonRecommendation {
  type: string;
  reason: string;
  examples: string[];
}
