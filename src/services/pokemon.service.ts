import axios from 'axios';
import { Pokemon, EvolutionChain, PokemonComparison, Region } from '../types/pokemon';

export class PokemonService {
  private readonly customApiUrl: string;

  constructor() {
    // Use custom Pokemon API service (will be deployed to Mikr.us)
    // Fallback to hardcoded URL if environment variable is not set
    this.customApiUrl = process.env.CUSTOM_POKEMON_API_URL || 'http://srv36.mikr.us:20275/api/v2';
  }

  // Helper method to validate Pokemon ID is within Generation 1 (1-151)
  private isValidPokemonId(id: number): boolean {
    return id >= 1 && id <= 151;
  }

  async getPokemonByTypeAndRegion(type: string, region: string): Promise<Pokemon[]> {
    const regionData = this.getRegionData(region);

    // Get type data from custom API
    const typeResponse = await axios.get(`${this.customApiUrl}/type/${type}`);
    const pokemonList = typeResponse.data.pokemon
      .map((p: { pokemon: { url: string } }) => p.pokemon.url)
      .filter((url: string) => {
        const id = parseInt(url.split('/').slice(-2, -1)[0]);
        return id >= regionData.pokemonRange.start && id <= regionData.pokemonRange.end;
      });

    // Get Pokemon details from custom API
    const pokemonDetails = await Promise.all(
      pokemonList.map((url: string) => {
        const id = url.split('/').slice(-2, -1)[0];
        return axios.get(`${this.customApiUrl}/pokemon/${id}`).then((res) => res.data);
      }),
    );

    return pokemonDetails;
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await axios.get(`${this.customApiUrl}/pokemon/${name.toLowerCase()}`);
    const pokemon = response.data;

    // Validate that Pokemon ID is within Generation 1 (1-151)
    if (!this.isValidPokemonId(pokemon.id)) {
      throw new Error(
        `Pokemon ${name} (ID: ${pokemon.id}) is not available. Only Generation 1 Pokemon (IDs 1-151) are supported.`,
      );
    }

    return pokemon;
  }

  async getPokemonEvolution(name: string): Promise<EvolutionChain> {
    const pokemon = await this.getPokemonByName(name);
    const speciesResponse = await axios.get(`${this.customApiUrl}/pokemon-species/${pokemon.id}`);
    const evolutionChainId = speciesResponse.data.evolution_chain.url.split('/').slice(-2, -1)[0];
    const evolutionChainResponse = await axios.get(
      `${this.customApiUrl}/evolution-chain/${evolutionChainId}`,
    );
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
    const response = await axios.get(`${this.customApiUrl}/type`);
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
    // List of Generation 1 legendary Pokemon IDs only (1-151)
    const legendaryIds = [144, 145, 146, 150, 151]; // Articuno, Zapdos, Moltres, Mewtwo, Mew

    const randomIndex = Math.floor(Math.random() * legendaryIds.length);
    const randomId = legendaryIds[randomIndex];

    const response = await axios.get(`${this.customApiUrl}/pokemon/${randomId}`);
    return response.data;
  }

  async getPokemonSuggestions(query: string): Promise<string[]> {
    console.log('Fetching suggestions for query:', query);
    // Limit to Generation 1 Pokemon only (1-151)
    const response = await axios.get(`${this.customApiUrl}/pokemon?limit=151`);
    const pokemonList = response.data.results;

    const suggestions = pokemonList
      .map((p: { name: string }) => p.name)
      .filter((name: string) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions

    console.log('Found suggestions:', suggestions);
    return suggestions;
  }
}
