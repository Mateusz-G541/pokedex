import type { Pokemon } from '../../types/pokemon';

export interface GymLeader {
  name: string;
  specialtyType: string;
  badge: string;
  image?: string;
  pokemon: string[];
}

export interface RegionLocation {
  name: string;
  description: string;
  image?: string;
}

export interface Region {
  id: number;
  name: string;
  description: string;
  mapImage?: string;
  pokedexRange: {
    start: number;
    end: number;
  };
  gymLeaders: GymLeader[];
  locations: RegionLocation[];
  starter1?: number;
  starter2?: number;
  starter3?: number;
  starter1Pokemon?: Pokemon;
  starter2Pokemon?: Pokemon;
  starter3Pokemon?: Pokemon;
  thumbnailPokemon?: Pokemon;
}
