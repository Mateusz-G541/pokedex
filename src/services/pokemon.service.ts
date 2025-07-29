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

  // Get random Pokemon ID from Generation 1 (1-151)
  getRandomPokemonId(): number {
    return Math.floor(Math.random() * 151) + 1;
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

  private getRegions(): Region[] {
    return [
      {
        name: 'kanto',
        generation: 1,
        pokemonRange: { start: 1, end: 151 },
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
    try {
      console.log('Fetching Pokemon suggestions for query:', query);
      
      // Use official Pokémon API for suggestions (Generation 1 only, IDs 1-151)
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151&offset=0');

      if (!response.data || !response.data.results) {
        console.warn('Invalid response format from official Pokemon API for suggestions');
        return this.getFallbackSuggestions(query);
      }

      const pokemonList = response.data.results;
      const suggestions = pokemonList
        .map((p: { name: string }) => p.name)
        .filter((name: string) => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions

      console.log('Found suggestions from official API:', suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error fetching Pokemon suggestions from official API:', error);
      console.log('Falling back to hardcoded Generation 1 suggestions');
      return this.getFallbackSuggestions(query);
    }
  }

  // Fallback suggestions for Generation 1 Pokemon when API is unavailable
  private getFallbackSuggestions(query: string): string[] {
    const gen1Pokemon = [
      'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard',
      'squirtle', 'wartortle', 'blastoise', 'caterpie', 'metapod', 'butterfree',
      'weedle', 'kakuna', 'beedrill', 'pidgey', 'pidgeotto', 'pidgeot',
      'rattata', 'raticate', 'spearow', 'fearow', 'ekans', 'arbok',
      'pikachu', 'raichu', 'sandshrew', 'sandslash', 'nidoran-f', 'nidorina',
      'nidoqueen', 'nidoran-m', 'nidorino', 'nidoking', 'clefairy', 'clefable',
      'vulpix', 'ninetales', 'jigglypuff', 'wigglytuff', 'zubat', 'golbat',
      'oddish', 'gloom', 'vileplume', 'paras', 'parasect', 'venonat',
      'venomoth', 'diglett', 'dugtrio', 'meowth', 'persian', 'psyduck',
      'golduck', 'mankey', 'primeape', 'growlithe', 'arcanine', 'poliwag',
      'poliwhirl', 'poliwrath', 'abra', 'kadabra', 'alakazam', 'machop',
      'machoke', 'machamp', 'bellsprout', 'weepinbell', 'victreebel', 'tentacool',
      'tentacruel', 'geodude', 'graveler', 'golem', 'ponyta', 'rapidash',
      'slowpoke', 'slowbro', 'magnemite', 'magneton', 'farfetchd', 'doduo',
      'dodrio', 'seel', 'dewgong', 'grimer', 'muk', 'shellder',
      'cloyster', 'gastly', 'haunter', 'gengar', 'onix', 'drowzee',
      'hypno', 'krabby', 'kingler', 'voltorb', 'electrode', 'exeggcute',
      'exeggutor', 'cubone', 'marowak', 'hitmonlee', 'hitmonchan', 'lickitung',
      'koffing', 'weezing', 'rhyhorn', 'rhydon', 'chansey', 'tangela',
      'kangaskhan', 'horsea', 'seadra', 'goldeen', 'seaking', 'staryu',
      'starmie', 'mr-mime', 'scyther', 'jynx', 'electabuzz', 'magmar',
      'pinsir', 'tauros', 'magikarp', 'gyarados', 'lapras', 'ditto',
      'eevee', 'vaporeon', 'jolteon', 'flareon', 'porygon', 'omanyte',
      'omastar', 'kabuto', 'kabutops', 'aerodactyl', 'snorlax', 'articuno',
      'zapdos', 'moltres', 'dratini', 'dragonair', 'dragonite', 'mewtwo', 'mew'
    ];
    
    return gen1Pokemon
      .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }
}
