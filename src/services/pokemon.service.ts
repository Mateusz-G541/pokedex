import axios from 'axios';
import { Pokemon, EvolutionChain, PokemonComparison, Region } from '../types/pokemon';

export class PokemonService {
  private readonly customApiUrl: string;

  constructor() {
    // Use environment variable for API URL, with fallback to remote service
    // CI/CD will set POKEMON_API_URL to local service
    // Production uses remote service for reliability
    this.customApiUrl = process.env.POKEMON_API_URL || 'http://srv36.mikr.us:20275/api/v2';

    console.log(`🔗 Pokemon API configured to use: ${this.customApiUrl}`);
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

  public getRegions(): Region[] {
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

      // Use custom Pokemon API service for suggestions (local JSON data)
      const response = await axios.get(`${this.customApiUrl}/pokemon/suggestions?query=${query}`);

      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Invalid response format from custom Pokemon API for suggestions');
        return this.getFallbackSuggestions(query);
      }

      const suggestions = response.data;
      console.log('Found suggestions from custom API:', suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error fetching Pokemon suggestions from custom API:', error);
      console.log('Falling back to hardcoded Generation 1 suggestions');
      return this.getFallbackSuggestions(query);
    }
  }

  // Fallback suggestions for Generation 1 Pokemon when API is unavailable
  private getFallbackSuggestions(query: string): string[] {
    const gen1Pokemon = [
      'bulbasaur',
      'ivysaur',
      'venusaur',
      'charmander',
      'charmeleon',
      'charizard',
      'squirtle',
      'wartortle',
      'blastoise',
      'caterpie',
      'metapod',
      'butterfree',
      'weedle',
      'kakuna',
      'beedrill',
      'pidgey',
      'pidgeotto',
      'pidgeot',
      'rattata',
      'raticate',
      'spearow',
      'fearow',
      'ekans',
      'arbok',
      'pikachu',
      'raichu',
      'sandshrew',
      'sandslash',
      'nidoran-f',
      'nidorina',
      'nidoqueen',
      'nidoran-m',
      'nidorino',
      'nidoking',
      'clefairy',
      'clefable',
      'vulpix',
      'ninetales',
      'jigglypuff',
      'wigglytuff',
      'zubat',
      'golbat',
      'oddish',
      'gloom',
      'vileplume',
      'paras',
      'parasect',
      'venonat',
      'venomoth',
      'diglett',
      'dugtrio',
      'meowth',
      'persian',
      'psyduck',
      'golduck',
      'mankey',
      'primeape',
      'growlithe',
      'arcanine',
      'poliwag',
      'poliwhirl',
      'poliwrath',
      'abra',
      'kadabra',
      'alakazam',
      'machop',
      'machoke',
      'machamp',
      'bellsprout',
      'weepinbell',
      'victreebel',
      'tentacool',
      'tentacruel',
      'geodude',
      'graveler',
      'golem',
      'ponyta',
      'rapidash',
      'slowpoke',
      'slowbro',
      'magnemite',
      'magneton',
      'farfetchd',
      'doduo',
      'dodrio',
      'seel',
      'dewgong',
      'grimer',
      'muk',
      'shellder',
      'cloyster',
      'gastly',
      'haunter',
      'gengar',
      'onix',
      'drowzee',
      'hypno',
      'krabby',
      'kingler',
      'voltorb',
      'electrode',
      'exeggcute',
      'exeggutor',
      'cubone',
      'marowak',
      'hitmonlee',
      'hitmonchan',
      'lickitung',
      'koffing',
      'weezing',
      'rhyhorn',
      'rhydon',
      'chansey',
      'tangela',
      'kangaskhan',
      'horsea',
      'seadra',
      'goldeen',
      'seaking',
      'staryu',
      'starmie',
      'mr-mime',
      'scyther',
      'jynx',
      'electabuzz',
      'magmar',
      'pinsir',
      'tauros',
      'magikarp',
      'gyarados',
      'lapras',
      'ditto',
      'eevee',
      'vaporeon',
      'jolteon',
      'flareon',
      'porygon',
      'omanyte',
      'omastar',
      'kabuto',
      'kabutops',
      'aerodactyl',
      'snorlax',
      'articuno',
      'zapdos',
      'moltres',
      'dratini',
      'dragonair',
      'dragonite',
      'mewtwo',
      'mew',
    ];

    return gen1Pokemon
      .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }
}
