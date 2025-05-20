import axios from 'axios';
import { Pokemon, EvolutionChain, PokemonComparison, Region } from '../types/pokemon';

export class PokemonService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.POKE_API_BASE_URL || 'https://pokeapi.co/api/v2';
  }

  async getPokemonByTypeAndRegion(type: string, region: string): Promise<Pokemon[]> {
    const regionData = this.getRegionData(region);
    const response = await axios.get(`${this.baseUrl}/type/${type}`);
    const pokemonList = response.data.pokemon
      .map((p: { pokemon: { url: string } }) => p.pokemon.url)
      .filter((url: string) => {
        const id = parseInt(url.split('/').slice(-2, -1)[0]);
        return id >= regionData.pokemonRange.start && id <= regionData.pokemonRange.end;
      });

    const pokemonDetails = await Promise.all(
      pokemonList.map((url: string) => axios.get(url).then((res) => res.data)),
    );

    return pokemonDetails;
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await axios.get(`${this.baseUrl}/pokemon/${name.toLowerCase()}`);
    return response.data;
  }

  async getPokemonEvolution(name: string): Promise<EvolutionChain> {
    const pokemon = await this.getPokemonByName(name);
    const speciesResponse = await axios.get(`${this.baseUrl}/pokemon-species/${pokemon.id}`);
    const evolutionChainResponse = await axios.get(speciesResponse.data.evolution_chain.url);
    return evolutionChainResponse.data.chain;
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

  async getAllTypes(): Promise<string[]> {
    const response = await axios.get(`${this.baseUrl}/type`);
    return response.data.results.map((type: { name: string }) => type.name);
  }

  getRegions(): Region[] {
    return [
      {
        name: 'kanto',
        generation: 1,
        pokemonRange: { start: 1, end: 151 },
      },
      {
        name: 'johto',
        generation: 2,
        pokemonRange: { start: 152, end: 251 },
      },
      {
        name: 'hoenn',
        generation: 3,
        pokemonRange: { start: 252, end: 386 },
      },
      {
        name: 'sinnoh',
        generation: 4,
        pokemonRange: { start: 387, end: 493 },
      },
      {
        name: 'unova',
        generation: 5,
        pokemonRange: { start: 494, end: 649 },
      },
      {
        name: 'kalos',
        generation: 6,
        pokemonRange: { start: 650, end: 721 },
      },
      {
        name: 'alola',
        generation: 7,
        pokemonRange: { start: 722, end: 809 },
      },
      {
        name: 'galar',
        generation: 8,
        pokemonRange: { start: 810, end: 898 },
      },
    ];
  }

  private getRegionData(region: string): Region {
    const regionData = this.getRegions().find((r) => r.name.toLowerCase() === region.toLowerCase());
    if (!regionData) {
      throw new Error(`Region ${region} not found`);
    }
    return regionData;
  }

  async getRandomLegendaryPokemon(): Promise<Pokemon> {
    // List of legendary Pokemon IDs
    const legendaryIds = [
      144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384,
      385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 643, 644,
      646, 716, 717, 718, 719, 720, 721, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796,
      797, 798, 799, 800, 801, 802, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    ];

    const randomIndex = Math.floor(Math.random() * legendaryIds.length);
    const randomId = legendaryIds[randomIndex];

    const response = await axios.get(`${this.baseUrl}/pokemon/${randomId}`);
    return response.data;
  }

  async getPokemonSuggestions(query: string): Promise<string[]> {
    console.log('Fetching suggestions for query:', query);
    const response = await axios.get(`${this.baseUrl}/pokemon?limit=898`);
    const pokemonList = response.data.results;

    const suggestions = pokemonList
      .map((p: { name: string }) => p.name)
      .filter((name: string) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions

    console.log('Found suggestions:', suggestions);
    return suggestions;
  }
}
