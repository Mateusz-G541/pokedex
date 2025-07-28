import fs from 'fs';
import path from 'path';
import { Pokemon, EvolutionChain, PokemonComparison, Region } from '../types/pokemon';

interface LocalPokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  order: number;
  is_default: boolean;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    front_female: string | null;
    front_shiny_female: string | null;
    back_default: string | null;
    back_shiny: string | null;
    back_female: string | null;
    back_shiny_female: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  species: {
    name: string;
    url: string;
  };
}

interface LocalSpeciesData {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }>;
}

interface LocalEvolutionChainData {
  id: number;
  chain: {
    is_baby: boolean;
    species: {
      name: string;
      url: string;
    };
    evolution_details: Array<{
      item: any | null;
      trigger: {
        name: string;
        url: string;
      };
      gender: number | null;
      held_item: any | null;
      known_move: any | null;
      known_move_type: any | null;
      location: any | null;
      min_level: number | null;
      min_happiness: number | null;
      min_beauty: number | null;
      min_affection: number | null;
      needs_overworld_rain: boolean;
      party_species: any | null;
      party_type: any | null;
      relative_physical_stats: number | null;
      time_of_day: string;
      trade_species: any | null;
      turn_upside_down: boolean;
    }>;
    evolves_to: Array<any>;
  };
}

interface LocalTypeData {
  id: number;
  name: string;
  damage_relations: {
    no_damage_to: Array<{ name: string; url: string }>;
    half_damage_to: Array<{ name: string; url: string }>;
    double_damage_to: Array<{ name: string; url: string }>;
    no_damage_from: Array<{ name: string; url: string }>;
    half_damage_from: Array<{ name: string; url: string }>;
    double_damage_from: Array<{ name: string; url: string }>;
  };
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
}

export class LocalPokemonService {
  private readonly dataDir: string;
  private pokemonData: LocalPokemonData[] = [];
  private speciesData: LocalSpeciesData[] = [];
  private evolutionChains: LocalEvolutionChainData[] = [];
  private typeData: LocalTypeData[] = [];

  constructor() {
    this.dataDir = path.join(__dirname, '..', '..', 'data');
    this.loadData();
  }

  private loadData(): void {
    try {
      // Load Pokemon data
      const pokemonPath = path.join(this.dataDir, 'pokemon.json');
      if (fs.existsSync(pokemonPath)) {
        this.pokemonData = JSON.parse(fs.readFileSync(pokemonPath, 'utf-8'));
      }

      // Load species data
      const speciesPath = path.join(this.dataDir, 'species.json');
      if (fs.existsSync(speciesPath)) {
        this.speciesData = JSON.parse(fs.readFileSync(speciesPath, 'utf-8'));
      }

      // Load evolution chains
      const evolutionPath = path.join(this.dataDir, 'evolution-chains.json');
      if (fs.existsSync(evolutionPath)) {
        this.evolutionChains = JSON.parse(fs.readFileSync(evolutionPath, 'utf-8'));
      }

      // Load type data
      const typePath = path.join(this.dataDir, 'types.json');
      if (fs.existsSync(typePath)) {
        this.typeData = JSON.parse(fs.readFileSync(typePath, 'utf-8'));
      }

      console.log(
        `Loaded ${this.pokemonData.length} Pokemon, ${this.typeData.length} types, ${this.evolutionChains.length} evolution chains`,
      );
    } catch (error) {
      console.error('Error loading local Pokemon data:', error);
    }
  }

  async getPokemonByTypeAndRegion(type: string, region: string): Promise<Pokemon[]> {
    const regionData = this.getRegionData(region);

    // Find the type data
    const typeInfo = this.typeData.find((t) => t.name.toLowerCase() === type.toLowerCase());
    if (!typeInfo) {
      return [];
    }

    // Get Pokemon IDs from type data
    const pokemonInType = typeInfo.pokemon.map((p) => {
      const urlParts = p.pokemon.url.split('/');
      return parseInt(urlParts[urlParts.length - 2]);
    });

    // Filter by region
    const filteredPokemon = this.pokemonData.filter((pokemon) => {
      const inType = pokemonInType.includes(pokemon.id);
      const inRegion =
        pokemon.id >= regionData.pokemonRange.start && pokemon.id <= regionData.pokemonRange.end;
      return inType && inRegion;
    });

    return filteredPokemon as Pokemon[];
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const pokemon = this.pokemonData.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() || p.id.toString() === name,
    );

    if (!pokemon) {
      throw new Error(`Pokemon ${name} not found`);
    }

    return pokemon as Pokemon;
  }

  async getPokemonEvolution(name: string): Promise<EvolutionChain> {
    const pokemon = await this.getPokemonByName(name);

    // Find species data
    const species = this.speciesData.find((s) => s.id === pokemon.id);
    if (!species) {
      throw new Error(`Species data for ${name} not found`);
    }

    // Extract evolution chain ID from URL
    const evolutionChainId = parseInt(species.evolution_chain.url.split('/').slice(-2, -1)[0]);

    // Find evolution chain
    const evolutionChain = this.evolutionChains.find((ec) => ec.id === evolutionChainId);
    if (!evolutionChain) {
      throw new Error(`Evolution chain for ${name} not found`);
    }

    return evolutionChain.chain as EvolutionChain;
  }

  async comparePokemon(first: string, second: string): Promise<PokemonComparison> {
    const [firstPokemon, secondPokemon] = await Promise.all([
      this.getPokemonByName(first),
      this.getPokemonByName(second),
    ]);

    const differences: { [key: string]: number } = {};
    firstPokemon.stats.forEach((stat, index) => {
      differences[stat.stat.name] = stat.base_stat - secondPokemon.stats[index].base_stat;
    });

    return {
      first: firstPokemon,
      second: secondPokemon,
      differences,
    };
  }

  private getRegionData(region: string): Region {
    const regions: { [key: string]: Region } = {
      kanto: {
        name: 'Kanto',
        pokemonRange: { start: 1, end: 151 },
      },
      johto: {
        name: 'Johto',
        pokemonRange: { start: 152, end: 251 },
      },
      hoenn: {
        name: 'Hoenn',
        pokemonRange: { start: 252, end: 386 },
      },
      sinnoh: {
        name: 'Sinnoh',
        pokemonRange: { start: 387, end: 493 },
      },
      unova: {
        name: 'Unova',
        pokemonRange: { start: 494, end: 649 },
      },
      kalos: {
        name: 'Kalos',
        pokemonRange: { start: 650, end: 721 },
      },
      alola: {
        name: 'Alola',
        pokemonRange: { start: 722, end: 809 },
      },
      galar: {
        name: 'Galar',
        pokemonRange: { start: 810, end: 898 },
      },
      paldea: {
        name: 'Paldea',
        pokemonRange: { start: 899, end: 1010 },
      },
    };

    return regions[region.toLowerCase()] || regions.kanto;
  }

  // Method to get all Pokemon (useful for testing)
  async getAllPokemon(): Promise<Pokemon[]> {
    return this.pokemonData as Pokemon[];
  }

  // Method to get Pokemon by ID
  async getPokemonById(id: number): Promise<Pokemon> {
    const pokemon = this.pokemonData.find((p) => p.id === id);
    if (!pokemon) {
      throw new Error(`Pokemon with ID ${id} not found`);
    }
    return pokemon as Pokemon;
  }

  // Method to search Pokemon by partial name
  async searchPokemon(query: string): Promise<Pokemon[]> {
    const searchTerm = query.toLowerCase();
    return this.pokemonData.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm),
    ) as Pokemon[];
  }

  // Method to get Pokemon by type (without region filter)
  async getPokemonByType(type: string): Promise<Pokemon[]> {
    const typeInfo = this.typeData.find((t) => t.name.toLowerCase() === type.toLowerCase());
    if (!typeInfo) {
      return [];
    }

    const pokemonInType = typeInfo.pokemon.map((p) => {
      const urlParts = p.pokemon.url.split('/');
      return parseInt(urlParts[urlParts.length - 2]);
    });

    return this.pokemonData.filter((pokemon) => pokemonInType.includes(pokemon.id)) as Pokemon[];
  }

  // Method to get all types
  async getAllTypes(): Promise<string[]> {
    return this.typeData.map((type) => type.name);
  }
}
