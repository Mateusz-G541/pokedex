import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { RegionExplorer } from './components/Regions';
import { PokedexExplorer } from './components/Pokedex';
import { TeamView } from './components/Team';
import { FavoritesView } from './components/Favorites';
import { BattleView } from './components/Battle';
import { getProxiedImageUrl } from './utils/imageProxy';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Get the API URL from environment variables, fallback to VPS for production
const API_URL = (import.meta.env.VITE_API_URL || 'http://srv36.mikr.us:3000').replace(/\/+$/, '');

// Frontend version marker – update when deploying to verify latest build is live
const APP_VERSION = 'frontend-v2025-11-19-1';

// Add this console log to help debug the API URL
console.log('API URL:', API_URL);

// Create a separate axios instance for external API calls (PokeAPI) without credentials
// This avoids CORS issues when the global axios has withCredentials: true
const externalAxios = axios.create({
  withCredentials: false,
});

// Configure axios for better debugging
axios.interceptors.request.use((request) => {
  console.log('Starting API Request:', request.url);
  return request;
});

axios.interceptors.response.use(
  (response) => {
    console.log('Successful API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    console.error('API Error Config:', error.config);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  },
);

// Define tabs for navigation as string constants instead of enum
const TABS = {
  POKEDEX: 'pokedex',
  TEAM: 'team',
  FAVORITES: 'favorites',
  BATTLE: 'battle',
  REGIONS: 'regions',
} as const;

// Type for tabs
type TabType = (typeof TABS)[keyof typeof TABS];

interface Ability {
  ability: {
    name: string;
  };
}

interface Type {
  type: {
    name: string;
  };
}

interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Pokemon {
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

interface EvolutionSpecies {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionSpecies[];
}

interface EvolutionChain {
  chain: EvolutionSpecies;
}

interface EvolvesTo {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolvesTo[];
}

// Interface for evolution data displayed to user
interface EvolutionData {
  name: string;
  id: number;
  image: string;
}

const typeColors: { [key: string]: string } = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Define type effectiveness relationships
const typeEffectiveness: Record<string, Record<string, number>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5,
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
    fairy: 0,
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

// List all Pokémon types
const allTypes = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

// Add interface for type analysis
interface TypeAnalysis {
  strongAgainst: string[];
  weakAgainst: string[];
  immuneTo: string[];
  resistantTo: string[];
  vulnerableTo: string[];
}

// Add interface for team recommendation
interface PokemonRecommendation {
  type: string;
  reason: string;
  examples: string[];
}

// Interface for battle state
interface BattleState {
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  currentPlayerPokemon: Pokemon | null;
  currentOpponentPokemon: Pokemon | null;
  playerHP: number;
  opponentHP: number;
  battleLog: string[];
  isBattleActive: boolean;
  battleResult: 'ongoing' | 'win' | 'lose' | null;
  turn: 'player' | 'opponent' | 'selection';
}

// Interface for advanced search filters
interface SearchFilters {
  types: string[];
  minAttack?: number;
  maxAttack?: number;
  minDefense?: number;
  maxDefense?: number;
  minHP?: number;
  maxHP?: number;
  minSpeed?: number;
  maxSpeed?: number;
}

// Interface for region data
interface GymLeader {
  name: string;
  specialtyType: string;
  badge: string;
  image?: string;
  pokemon: string[];
}

interface RegionLocation {
  name: string;
  description: string;
  image?: string;
}

interface Region {
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

function App() {
  // Auth context
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [teamMessage, setTeamMessage] = useState('');
  const [favorites, setFavorites] = useState<Pokemon[]>([]);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(TABS.POKEDEX);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionData[]>([]);
  const [loadingEvolution, setLoadingEvolution] = useState(false);

  // Add new state variables for team analysis and recommendations
  const [teamAnalysis, setTeamAnalysis] = useState<TypeAnalysis>({
    strongAgainst: [],
    weakAgainst: [],
    immuneTo: [],
    resistantTo: [],
    vulnerableTo: [],
  });
  const [recommendations, setRecommendations] = useState<PokemonRecommendation[]>([]);

  // Add new state variables for battle simulator
  const [battleState, setBattleState] = useState<BattleState>({
    playerTeam: [],
    opponentTeam: [],
    currentPlayerPokemon: null,
    currentOpponentPokemon: null,
    playerHP: 0,
    opponentHP: 0,
    battleLog: [],
    isBattleActive: false,
    battleResult: null,
    turn: 'player',
  });

  // Add state for advanced search filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    types: [],
    minAttack: 0,
    maxAttack: 255,
    minDefense: 0,
    maxDefense: 255,
    minHP: 0,
    maxHP: 255,
    minSpeed: 0,
    maxSpeed: 255,
  });
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);

  // Add state for regions with predefined data
  const [regions, setRegions] = useState<Region[]>([
    {
      id: 1,
      name: 'Kanto',
      description:
        'The first Pokémon region, home to the original 151 Pokémon. A traditional Japanese-inspired region with diverse landscapes from mountains to seas.',

      pokedexRange: { start: 1, end: 151 },
      gymLeaders: [
        {
          name: 'Brock',
          specialtyType: 'rock',
          badge: 'Boulder Badge',
          pokemon: ['Geodude', 'Onix'],
        },
        {
          name: 'Misty',
          specialtyType: 'water',
          badge: 'Cascade Badge',
          pokemon: ['Staryu', 'Starmie'],
        },
        {
          name: 'Lt. Surge',
          specialtyType: 'electric',
          badge: 'Thunder Badge',
          pokemon: ['Voltorb', 'Pikachu', 'Raichu'],
        },
        {
          name: 'Erika',
          specialtyType: 'grass',
          badge: 'Rainbow Badge',
          pokemon: ['Victreebel', 'Tangela', 'Vileplume'],
        },
        {
          name: 'Koga',
          specialtyType: 'poison',
          badge: 'Soul Badge',
          pokemon: ['Koffing', 'Muk', 'Weezing'],
        },
        {
          name: 'Sabrina',
          specialtyType: 'psychic',
          badge: 'Marsh Badge',
          pokemon: ['Kadabra', 'Mr. Mime', 'Alakazam'],
        },
        {
          name: 'Blaine',
          specialtyType: 'fire',
          badge: 'Volcano Badge',
          pokemon: ['Growlithe', 'Ponyta', 'Rapidash', 'Arcanine'],
        },
        {
          name: 'Giovanni',
          specialtyType: 'ground',
          badge: 'Earth Badge',
          pokemon: ['Rhyhorn', 'Dugtrio', 'Nidoqueen', 'Nidoking', 'Rhydon'],
        },
      ],
      locations: [
        {
          name: 'Pallet Town',
          description: 'A small, quiet town where the player character begins their journey.',
        },
        {
          name: 'Viridian City',
          description: 'The first major city the player visits, home to the eighth gym.',
        },
        {
          name: 'Mt. Moon',
          description:
            'A mountain connecting Route 3 and Route 4, known for Moon Stone and Fossil Pokémon.',
        },
        {
          name: 'Cerulean City',
          description: "The water-themed city, home to Misty's Gym.",
        },
        {
          name: 'Lavender Town',
          description: 'A small town with the haunting Pokémon Tower, home to ghost Pokémon.',
        },
      ],
      starter1: 1, // Bulbasaur
      starter2: 4, // Charmander
      starter3: 7, // Squirtle
    },
  ]);
  // selectedRegion state is now in the RegionExplorer component

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 3) {
        try {
          console.log('Fetching suggestions for:', searchTerm);
          const response = await axios.get(
            `${API_URL}/api/pokemon/suggestions?query=${searchTerm}`,
          );
          console.log('Received suggestions:', response.data);
          setSuggestions(response.data);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Save team to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
  }, [team]);

  // Load team from localStorage on initial render
  useEffect(() => {
    const savedTeam = localStorage.getItem('pokemonTeam');
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam));
      } catch (e) {
        console.error('Error parsing saved team:', e);
      }
    }
  }, []);

  // Note: Auth persistence is now handled by AuthContext

  // Save favorites to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pokemonFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing saved favorites:', e);
      }
    }
  }, []);

  // Fetch pokemon evolution chain when pokemon changes
  useEffect(() => {
    if (pokemon) {
      fetchEvolutionChain(pokemon.species.url);
    }
  }, [pokemon]);

  // Add effect to analyze team whenever it changes
  useEffect(() => {
    if (team.length > 0) {
      const analysis = analyzeTeam(team);
      setTeamAnalysis(analysis);

      const recommendations = generateRecommendations(analysis);
      setRecommendations(recommendations);
    } else {
      // Reset analysis when team is empty
      setTeamAnalysis({
        strongAgainst: [],
        weakAgainst: [],
        immuneTo: [],
        resistantTo: [],
        vulnerableTo: [],
      });
      setRecommendations([]);
    }
  }, [team]);

  // Set battle state when navigating to battle tab
  useEffect(() => {
    if (activeTab === TABS.BATTLE && !battleState.isBattleActive && team.length > 0) {
      prepareForBattle();
    }
  }, [activeTab, team]);

  // Pre-load starter Pokémon images for region cards
  useEffect(() => {
    const loadStarterPokemonForRegions = async () => {
      try {
        setLoading(true);

        // Create a new array to hold the updated regions
        const updatedRegions = [...regions];

        // Fetch starter Pokémon for each region
        for (let i = 0; i < updatedRegions.length; i++) {
          const region = updatedRegions[i];
          if (region.starter1) {
            try {
              const response = await axios.get(`${API_URL}/api/pokemon/${region.starter1}`);
              updatedRegions[i] = {
                ...region,
                thumbnailPokemon: response.data,
              };
            } catch (err) {
              console.error(`Error fetching starter for region ${region.name}:`, err);
            }
          }
        }

        // Update the regions state with the Pokémon data
        setRegions(updatedRegions);
      } catch (err) {
        console.error('Error loading starter Pokémon for regions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStarterPokemonForRegions();
  }, []);

  const fetchPokemon = async (search: string | number) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/pokemon/${search}`);
      setPokemon(response.data);

      // Fetch description
      const speciesResponse = await externalAxios.get(response.data.species.url);
      const flavorText = speciesResponse.data.flavor_text_entries.find(
        (entry: { language: { name: string }; flavor_text: string }) =>
          entry.language.name === 'en',
      );
      setDescription(flavorText?.flavor_text || 'No description available.');
    } catch (err) {
      // Log error and set error state
      console.error('Error fetching Pokemon:', err);
      setError('Pokemon not found. Try another ID or name.');
      setPokemon(null);
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvolutionChain = async (speciesUrl: string) => {
    try {
      setLoadingEvolution(true);
      setEvolutionChain([]);

      // Fetch the species data to get the evolution chain URL
      const speciesResponse = await externalAxios.get(speciesUrl);
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

      // Fetch the evolution chain
      const evolutionResponse = await externalAxios.get(evolutionChainUrl);
      const evolutionData = evolutionResponse.data;

      // Process the evolution chain
      const processedChain = await processEvolutionChain(evolutionData);
      setEvolutionChain(processedChain);
    } catch (err) {
      console.error('Error fetching evolution chain:', err);
    } finally {
      setLoadingEvolution(false);
    }
  };

  const processEvolutionChain = async (data: EvolutionChain): Promise<EvolutionData[]> => {
    const result: EvolutionData[] = [];

    // Helper function to traverse the evolution chain recursively
    const traverseEvolutionChain = async (chain: {
      species: { name: string; url: string };
      evolves_to: EvolvesTo[];
    }) => {
      try {
        // Extract the species ID from the URL
        const speciesId = chain.species.url.split('/').slice(-2, -1)[0];

        // Fetch the pokemon data to get the sprite
        const pokemonResponse = await externalAxios.get(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);

        result.push({
          name: chain.species.name,
          id: parseInt(speciesId),
          image: getProxiedImageUrl(pokemonResponse.data.sprites.front_default),
        });

        // Recursively process the next evolution stage if it exists
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          for (const evolution of chain.evolves_to) {
            await traverseEvolutionChain(evolution);
          }
        }
      } catch (err) {
        console.error('Error processing evolution chain:', err);
      }
    };

    await traverseEvolutionChain(data.chain);
    return result;
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchPokemon(searchTerm.trim().toLowerCase());
    }
  };

  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 151) + 1; // Generation 1 Pokémon only (1-151)
    setSearchTerm(randomId.toString());
    fetchPokemon(randomId);
  };

  const handleRandomLegendary = async () => {
    try {
      setLoading(true);
      // Use the configurable API_URL instead of hardcoded URL
      const url = `${API_URL}/api/pokemon/random/legendary`;
      console.log('Random Legendary URL:', url);

      const response = await axios.get(url);
      setPokemon(response.data);

      // Fetch description
      const speciesResponse = await externalAxios.get(response.data.species.url);
      const flavorText = speciesResponse.data.flavor_text_entries.find(
        (entry: { language: { name: string }; flavor_text: string }) =>
          entry.language.name === 'en',
      );
      setDescription(flavorText?.flavor_text || 'No description available.');
    } catch (err) {
      // Log error and set error state
      console.error('Error fetching legendary Pokemon:', err);
      setError('Failed to fetch legendary Pokemon. Please try again.');
      setPokemon(null);
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pokemon && pokemon.id > 1) {
      const prevId = pokemon.id - 1;
      setSearchTerm(prevId.toString());
      fetchPokemon(prevId);
    }
  };

  const handleNext = () => {
    if (pokemon && pokemon.id < 898) {
      const nextId = pokemon.id + 1;
      setSearchTerm(nextId.toString());
      fetchPokemon(nextId);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    fetchPokemon(suggestion);
  };

  // --- Auth handlers ---
  const handleLogout = async () => {
    await logout();
    // Stay on the same page - guest access is allowed
  };

  const addToTeam = () => {
    if (!pokemon) return;

    // Check if team already has 6 Pokemon
    if (team.length >= 6) {
      setTeamMessage('Your team is full! Remove a Pokémon to add a new one.');
      setTimeout(() => setTeamMessage(''), 3000);
      return;
    }

    // Check if Pokemon is already in team
    if (team.some((p) => p.id === pokemon.id)) {
      setTeamMessage('This Pokémon is already in your team!');
      setTimeout(() => setTeamMessage(''), 3000);
      return;
    }

    // Add Pokemon to team
    setTeam([...team, pokemon]);
    setTeamMessage(`${pokemon.name} added to your team!`);
    setTimeout(() => setTeamMessage(''), 3000);
  };

  const removeFromTeam = (id: number) => {
    setTeam(team.filter((p) => p.id !== id));
    setTeamMessage('Pokémon removed from your team.');
    setTimeout(() => setTeamMessage(''), 3000);
  };

  const clearTeam = () => {
    if (team.length === 0) return;

    if (confirm('Are you sure you want to release all your Pokémon?')) {
      setTeam([]);
      setTeamMessage('Your team has been cleared.');
      setTimeout(() => setTeamMessage(''), 3000);
    }
  };

  const addToFavorites = () => {
    if (!pokemon) return;

    // Check if Pokemon is already in favorites
    if (favorites.some((p) => p.id === pokemon.id)) {
      setFavoriteMessage('This Pokémon is already in your favorites!');
      setTimeout(() => setFavoriteMessage(''), 3000);
      return;
    }

    // Add Pokemon to favorites
    setFavorites([...favorites, pokemon]);
    setFavoriteMessage(`${pokemon.name} added to your favorites!`);
    setTimeout(() => setFavoriteMessage(''), 3000);
  };

  const removeFromFavorites = (id: number) => {
    setFavorites(favorites.filter((p) => p.id !== id));
    setFavoriteMessage('Pokémon removed from your favorites.');
    setTimeout(() => setFavoriteMessage(''), 3000);
  };

  const clearFavorites = () => {
    if (favorites.length === 0) return;

    if (confirm('Are you sure you want to clear all your favorites?')) {
      setFavorites([]);
      setFavoriteMessage('Your favorites have been cleared.');
      setTimeout(() => setFavoriteMessage(''), 3000);
    }
  };

  const isPokemonFavorite = (id: number) => {
    return favorites.some((p) => p.id === id);
  };

  const viewPokemonDetails = (pokemon: Pokemon) => {
    setSearchTerm(pokemon.name);
    setPokemon(pokemon);
    setActiveTab(TABS.POKEDEX);

    // Fetch description for the pokemon
    const fetchDescription = async () => {
      try {
        const speciesResponse = await externalAxios.get(pokemon.species.url);
        const flavorText = speciesResponse.data.flavor_text_entries.find(
          (entry: { language: { name: string }; flavor_text: string }) =>
            entry.language.name === 'en',
        );
        setDescription(flavorText?.flavor_text || 'No description available.');
      } catch (err) {
        // Log error and set error state
        console.error('Error fetching Pokemon:', err);
        setError('Pokemon not found. Try another ID or name.');
        setPokemon(null);
        setDescription('');
      } finally {
        setLoading(false);
      }
    };

    fetchDescription();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderEvolutionChain = () => {
    if (loadingEvolution) {
      return <div className="loading-evolution">Loading evolution chain...</div>;
    }

    if (evolutionChain.length <= 1) {
      return <p>This Pokémon does not evolve.</p>;
    }

    return (
      <div className="evolution-chain">
        {evolutionChain.map((evolution, index) => (
          <div key={evolution.id} className="evolution-stage">
            <div className="evolution-pokemon">
              <img src={getProxiedImageUrl(evolution.image)} alt={evolution.name} />

              <p>{evolution.name}</p>
              <span className="evolution-id">#{evolution.id}</span>
            </div>
            {index < evolutionChain.length - 1 && <div className="evolution-arrow">→</div>}
          </div>
        ))}
      </div>
    );
  };

  // Add function to analyze team type coverage
  const analyzeTeam = (team: Pokemon[]): TypeAnalysis => {
    // Initialize type effectiveness counters
    const typeScores: Record<string, { offense: number; defense: number }> = {};

    allTypes.forEach((type) => {
      typeScores[type] = { offense: 0, defense: 0 };
    });

    // Analyze each Pokémon in the team
    team.forEach((pokemon) => {
      // Get the Pokémon's types
      const pokemonTypes = pokemon.types.map((t) => t.type.name);

      // Analyze offensive coverage (what types this Pokémon is strong against)
      pokemonTypes.forEach((pokemonType) => {
        if (typeEffectiveness[pokemonType]) {
          Object.entries(typeEffectiveness[pokemonType]).forEach(([targetType, effectiveness]) => {
            if (effectiveness > 1) {
              typeScores[targetType].offense += 1;
            }
          });
        }
      });

      // Analyze defensive coverage (how this Pokémon resists types)
      allTypes.forEach((attackingType) => {
        let totalEffectiveness = 1;

        // Calculate combined type effectiveness
        pokemonTypes.forEach((defenderType) => {
          const effectiveness = typeEffectiveness[attackingType]?.[defenderType] || 1;
          totalEffectiveness *= effectiveness;
        });

        if (totalEffectiveness === 0) {
          typeScores[attackingType].defense -= 2; // Immune
        } else if (totalEffectiveness < 1) {
          typeScores[attackingType].defense -= 1; // Resistant
        } else if (totalEffectiveness > 1) {
          typeScores[attackingType].defense += 1; // Vulnerable
        }
      });
    });

    // Categorize types based on scores
    const strongAgainst = allTypes.filter((type) => typeScores[type].offense >= 2);
    const weakAgainst = allTypes.filter((type) => typeScores[type].offense === 0);

    const immuneTo = allTypes.filter((type) => typeScores[type].defense <= -4);
    const resistantTo = allTypes.filter(
      (type) => typeScores[type].defense < 0 && typeScores[type].defense > -4,
    );
    const vulnerableTo = allTypes.filter((type) => typeScores[type].defense > 0);

    return {
      strongAgainst,
      weakAgainst,
      immuneTo,
      resistantTo,
      vulnerableTo,
    };
  };

  // Add function to generate team recommendations
  const generateRecommendations = (analysis: TypeAnalysis): PokemonRecommendation[] => {
    const recommendations: PokemonRecommendation[] = [];

    // Recommend types to cover weaknesses
    if (analysis.weakAgainst.length > 0) {
      // Find types that are strong against what the team is weak against
      allTypes.forEach((type) => {
        const counters = analysis.weakAgainst.filter(
          (weakType) => typeEffectiveness[type]?.[weakType] > 1,
        );

        if (counters.length >= 2) {
          const alreadyHasType = team.some((pokemon) =>
            pokemon.types.some((t) => t.type.name === type),
          );

          if (!alreadyHasType) {
            const examples = getExamplePokemon(type);
            recommendations.push({
              type,
              reason: `Strong against ${counters.join(', ')} types`,
              examples,
            });
          }
        }
      });
    }

    // Recommend types to resist vulnerabilities
    if (analysis.vulnerableTo.length > 0) {
      const criticalVulnerabilities = analysis.vulnerableTo.filter(
        (type) => !analysis.resistantTo.includes(type) && !analysis.immuneTo.includes(type),
      );

      allTypes.forEach((type) => {
        const resists = criticalVulnerabilities.filter(
          (vulnType) => (typeEffectiveness[vulnType]?.[type] || 1) < 1,
        );

        if (resists.length >= 2) {
          const alreadyHasType = team.some((pokemon) =>
            pokemon.types.some((t) => t.type.name === type),
          );

          if (!alreadyHasType) {
            const examples = getExamplePokemon(type);
            recommendations.push({
              type,
              reason: `Resists ${resists.join(', ')} types`,
              examples,
            });
          }
        }
      });
    }

    // Limit to top 3 recommendations
    return recommendations.slice(0, 3);
  };

  // Function to get example Pokémon for a type
  const getExamplePokemon = (type: string): string[] => {
    // Example Pokémon for each type (these are just common examples)
    const examplesByType: Record<string, string[]> = {
      normal: ['Snorlax', 'Tauros', 'Eevee'],
      fire: ['Charizard', 'Arcanine', 'Ninetales'],
      water: ['Blastoise', 'Vaporeon', 'Gyarados'],
      electric: ['Pikachu', 'Jolteon', 'Electabuzz'],
      grass: ['Venusaur', 'Exeggutor', 'Tangela'],
      ice: ['Lapras', 'Articuno', 'Jynx'],
      fighting: ['Machamp', 'Hitmonlee', 'Hitmonchan'],
      poison: ['Gengar', 'Muk', 'Venomoth'],
      ground: ['Golem', 'Dugtrio', 'Rhydon'],
      flying: ['Pidgeot', 'Scyther', 'Dragonite'],
      psychic: ['Alakazam', 'Mewtwo', 'Espeon'],
      bug: ['Scyther', 'Pinsir', 'Heracross'],
      rock: ['Golem', 'Onix', 'Kabutops'],
      ghost: ['Gengar', 'Haunter', 'Misdreavus'],
      dragon: ['Dragonite', 'Salamence', 'Garchomp'],
      dark: ['Tyranitar', 'Umbreon', 'Houndoom'],
      steel: ['Steelix', 'Scizor', 'Metagross'],
      fairy: ['Clefable', 'Togekiss', 'Sylveon'],
    };

    return examplesByType[type] || ['Unknown'];
  };

  const renderTeamAnalysis = () => {
    if (team.length === 0) {
      return null;
    }

    return (
      <div className="team-analysis">
        <h3>Team Analysis</h3>
        <div className="type-coverage">
          <div className="coverage-section">
            <h4>Offensive Coverage</h4>
            <div className="coverage-row">
              <p>
                <strong>Strong against:</strong>
              </p>
              <div className="type-tags">
                {teamAnalysis.strongAgainst.length > 0 ? (
                  teamAnalysis.strongAgainst.map((type) => (
                    <span
                      key={type}
                      className="type-tag"
                      style={{ backgroundColor: typeColors[type] }}
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="no-types">None</span>
                )}
              </div>
            </div>
            <div className="coverage-row">
              <p>
                <strong>Weak against:</strong>
              </p>
              <div className="type-tags">
                {teamAnalysis.weakAgainst.length > 0 ? (
                  teamAnalysis.weakAgainst.map((type) => (
                    <span
                      key={type}
                      className="type-tag"
                      style={{ backgroundColor: typeColors[type] }}
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="no-types">None</span>
                )}
              </div>
            </div>
          </div>

          <div className="coverage-section">
            <h4>Defensive Coverage</h4>
            <div className="coverage-row">
              <p>
                <strong>Immune to:</strong>
              </p>
              <div className="type-tags">
                {teamAnalysis.immuneTo.length > 0 ? (
                  teamAnalysis.immuneTo.map((type) => (
                    <span
                      key={type}
                      className="type-tag"
                      style={{ backgroundColor: typeColors[type] }}
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="no-types">None</span>
                )}
              </div>
            </div>
            <div className="coverage-row">
              <p>
                <strong>Resistant to:</strong>
              </p>
              <div className="type-tags">
                {teamAnalysis.resistantTo.length > 0 ? (
                  teamAnalysis.resistantTo.map((type) => (
                    <span
                      key={type}
                      className="type-tag"
                      style={{ backgroundColor: typeColors[type] }}
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="no-types">None</span>
                )}
              </div>
            </div>
            <div className="coverage-row">
              <p>
                <strong>Vulnerable to:</strong>
              </p>
              <div className="type-tags">
                {teamAnalysis.vulnerableTo.length > 0 ? (
                  teamAnalysis.vulnerableTo.map((type) => (
                    <span
                      key={type}
                      className="type-tag"
                      style={{ backgroundColor: typeColors[type] }}
                    >
                      {type}
                    </span>
                  ))
                ) : (
                  <span className="no-types">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamRecommendations = () => {
    if (team.length === 0 || recommendations.length === 0) {
      return null;
    }

    return (
      <div className="team-recommendations">
        <h3>Recommended Types</h3>
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-type">
                <span className="type-tag large" style={{ backgroundColor: typeColors[rec.type] }}>
                  {rec.type}
                </span>
              </div>
              <div className="recommendation-details">
                <p className="recommendation-reason">{rec.reason}</p>
                <div className="recommendation-examples">
                  <p>
                    <strong>Examples:</strong> {rec.examples.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to prepare for battle
  const prepareForBattle = async () => {
    if (team.length === 0) return;

    // Reset battle state
    setBattleState({
      ...battleState,
      playerTeam: [...team],
      opponentTeam: [],
      currentPlayerPokemon: null,
      currentOpponentPokemon: null,
      playerHP: 0,
      opponentHP: 0,
      battleLog: ['Battle is about to begin!'],
      isBattleActive: false,
      battleResult: null,
      turn: 'player',
    });

    // Generate random opponent team (3 random Pokémon)
    const opponentTeam: Pokemon[] = [];

    setIsLoadingFiltered(true);
    try {
      for (let i = 0; i < 3; i++) {
        const randomId = Math.floor(Math.random() * 151) + 1; // Generation 1 only
        const response = await axios.get(`${API_URL}/api/pokemon/${randomId}`);
        opponentTeam.push(response.data);
      }

      setBattleState((prev) => ({
        ...prev,
        opponentTeam,
        currentPlayerPokemon: team[0],
        currentOpponentPokemon: opponentTeam[0],
        playerHP: getMaxHP(team[0]),
        opponentHP: getMaxHP(opponentTeam[0]),
        battleLog: [...prev.battleLog, 'Choose your first Pokémon!'],
      }));
    } catch (error) {
      console.error('Error generating opponent team:', error);
    } finally {
      setIsLoadingFiltered(false);
    }
  };

  // Start battle with selected Pokémon
  const startBattle = (playerPokemon: Pokemon) => {
    if (!battleState.opponentTeam.length) return;

    setBattleState((prev) => ({
      ...prev,
      currentPlayerPokemon: playerPokemon,
      playerHP: getMaxHP(playerPokemon),
      isBattleActive: true,
      battleLog: [
        ...prev.battleLog,
        `Go ${playerPokemon.name}!`,
        `Opponent sends out ${prev.currentOpponentPokemon?.name}!`,
      ],
    }));
  };

  // Helper function to get max HP
  const getMaxHP = (pokemon: Pokemon): number => {
    const hpStat = pokemon.stats.find((stat) => stat.stat.name === 'hp');
    return hpStat ? hpStat.base_stat * 2 : 100; // Double the base HP for longer battles
  };

  // Helper function to get attack stat
  const getAttackStat = (pokemon: Pokemon): number => {
    const attackStat = pokemon.stats.find((stat) => stat.stat.name === 'attack');
    return attackStat ? attackStat.base_stat : 50;
  };

  // Helper function to get defense stat
  const getDefenseStat = (pokemon: Pokemon): number => {
    const defenseStat = pokemon.stats.find((stat) => stat.stat.name === 'defense');
    return defenseStat ? defenseStat.base_stat : 50;
  };

  // Helper function to get speed stat - removed for now as it's unused
  /* 
  const getSpeedStat = (pokemon: Pokemon): number => {
    const speedStat = pokemon.stats.find((stat) => stat.stat.name === 'speed');
    return speedStat ? speedStat.base_stat : 50;
  };
  */

  // Calculate type effectiveness for battle
  const calculateTypeEffectiveness = (attackerTypes: string[], defenderTypes: string[]): number => {
    let effectiveness = 1;

    attackerTypes.forEach((attackType) => {
      defenderTypes.forEach((defendType) => {
        const multiplier = typeEffectiveness[attackType]?.[defendType] || 1;
        effectiveness *= multiplier;
      });
    });

    return effectiveness;
  };

  // Execute a battle attack
  const executeAttack = (isPlayerAttacking: boolean) => {
    if (!battleState.currentPlayerPokemon || !battleState.currentOpponentPokemon) return;

    const attacker = isPlayerAttacking
      ? battleState.currentPlayerPokemon
      : battleState.currentOpponentPokemon;
    const defender = isPlayerAttacking
      ? battleState.currentOpponentPokemon
      : battleState.currentPlayerPokemon;

    const attackerTypes = attacker.types.map((t) => t.type.name);
    const defenderTypes = defender.types.map((t) => t.type.name);

    const effectiveness = calculateTypeEffectiveness(attackerTypes, defenderTypes);
    const attackStat = getAttackStat(attacker);
    const defenseStat = getDefenseStat(defender);

    // Calculate damage with some randomness
    let damage = Math.floor(
      (attackStat / defenseStat) * 20 * effectiveness * (0.85 + Math.random() * 0.3),
    );
    damage = Math.max(1, damage); // Minimum 1 damage

    let effectivenessText = '';
    if (effectiveness > 1) {
      effectivenessText = "It's super effective!";
    } else if (effectiveness < 1 && effectiveness > 0) {
      effectivenessText = "It's not very effective...";
    } else if (effectiveness === 0) {
      effectivenessText = 'It has no effect!';
      damage = 0;
    }

    const newLogs = [`${attacker.name} attacks!`];
    if (effectivenessText) newLogs.push(effectivenessText);
    newLogs.push(`${defender.name} takes ${damage} damage!`);

    setBattleState((prev) => {
      let newPlayerHP = prev.playerHP;
      let newOpponentHP = prev.opponentHP;
      let newTurn = prev.turn;
      let battleResult = prev.battleResult;
      const currentPlayerPokemon = prev.currentPlayerPokemon;
      let currentOpponentPokemon = prev.currentOpponentPokemon;
      let playerTeam = [...prev.playerTeam];
      let opponentTeam = [...prev.opponentTeam];

      // Update HP based on who is attacking
      if (isPlayerAttacking) {
        newOpponentHP = Math.max(0, prev.opponentHP - damage);
        newTurn = 'opponent';
      } else {
        newPlayerHP = Math.max(0, prev.playerHP - damage);
        newTurn = 'player';
      }

      // Check if a Pokémon fainted
      const additionalLogs: string[] = [];

      if (newOpponentHP === 0) {
        additionalLogs.push(`${prev.currentOpponentPokemon?.name} fainted!`);

        // Remove fainted Pokémon from opponent team
        const newOpponentTeam = opponentTeam.filter((p) => p.id !== currentOpponentPokemon?.id);
        opponentTeam = newOpponentTeam;

        // Check if battle is over
        if (newOpponentTeam.length === 0) {
          additionalLogs.push('You won the battle!');
          battleResult = 'win';
        } else {
          // Send out next opponent Pokémon
          currentOpponentPokemon = newOpponentTeam[0];
          newOpponentHP = getMaxHP(newOpponentTeam[0]);
          additionalLogs.push(`Opponent sends out ${newOpponentTeam[0].name}!`);
        }
      }

      if (newPlayerHP === 0) {
        additionalLogs.push(`${prev.currentPlayerPokemon?.name} fainted!`);

        // Remove fainted Pokémon from player team
        const newPlayerTeam = playerTeam.filter((p) => p.id !== currentPlayerPokemon?.id);
        playerTeam = newPlayerTeam;

        // Check if battle is over
        if (newPlayerTeam.length === 0) {
          additionalLogs.push('You lost the battle!');
          battleResult = 'lose';
        } else {
          // Player needs to select next Pokémon
          newTurn = 'selection';
          additionalLogs.push('Select your next Pokémon!');
        }
      }

      return {
        ...prev,
        playerHP: newPlayerHP,
        opponentHP: newOpponentHP,
        turn: newTurn,
        battleLog: [...prev.battleLog, ...newLogs, ...additionalLogs],
        battleResult,
        currentPlayerPokemon,
        currentOpponentPokemon,
        playerTeam,
        opponentTeam,
      };
    });
  };

  // Switch player's Pokémon
  const switchPokemon = (newPokemon: Pokemon) => {
    if (!battleState.isBattleActive) {
      startBattle(newPokemon);
      return;
    }

    setBattleState((prev) => ({
      ...prev,
      currentPlayerPokemon: newPokemon,
      playerHP: getMaxHP(newPokemon),
      battleLog: [
        ...prev.battleLog,
        `You withdrew ${prev.currentPlayerPokemon?.name}!`,
        `Go ${newPokemon.name}!`,
      ],
      turn: 'opponent',
    }));

    // Opponent attacks after player switches
    setTimeout(() => {
      executeAttack(false);
    }, 1500);
  };

  // Reset battle
  const resetBattle = () => {
    setBattleState({
      playerTeam: [],
      opponentTeam: [],
      currentPlayerPokemon: null,
      currentOpponentPokemon: null,
      playerHP: 0,
      opponentHP: 0,
      battleLog: [],
      isBattleActive: false,
      battleResult: null,
      turn: 'player',
    });

    prepareForBattle();
  };

  // Function to apply advanced search filters
  // Create a state variable to cache all Pokémon data
  const [allPokemonCache, setAllPokemonCache] = useState<Pokemon[]>([]);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // Load Pokémon cache once on component mount
  useEffect(() => {
    const loadPokemonCache = async () => {
      if (allPokemonCache.length > 0) return; // Skip if already loaded

      setIsLoadingFiltered(true);
      try {
        // The bulk loading API call is causing 500 errors
        // Instead of trying to load all Pokémon at once, we'll set cache as loaded
        // and load Pokémon individually when needed

        // Create a small initial cache with known starter Pokémon
        const starterIds = [1, 4, 7, 25]; // Bulbasaur, Charmander, Squirtle, Pikachu
        const pokemonDetails: Pokemon[] = [];

        for (const id of starterIds) {
          try {
            const response = await axios.get(`${API_URL}/api/pokemon/${id}`);
            pokemonDetails.push(response.data);
          } catch (err) {
            console.error(`Error fetching starter Pokémon ${id}:`, err);
          }
        }

        setAllPokemonCache(pokemonDetails);
        setIsCacheLoaded(true);
      } catch (error) {
        console.error('Error loading Pokémon cache:', error);
        // Even if there's an error, mark cache as loaded to prevent repeated attempts
        setIsCacheLoaded(true);
      } finally {
        setIsLoadingFiltered(false);
      }
    };

    loadPokemonCache();
  }, []);

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSearchFilters((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];

      // Return updated filters
      const updated = {
        ...prev,
        types: newTypes,
      };

      // Apply filters immediately when types change
      if (newTypes.length > 0) {
        setTimeout(() => applyFilters(updated), 0);
      } else if (prev.types.length > 0 && newTypes.length === 0) {
        // Clear filtered results when all type filters are removed
        setFilteredPokemon([]);
      }

      return updated;
    });
  };

  // Apply filters
  const applyFilters = (filters = searchFilters) => {
    // If no type filters are selected, don't filter
    if (filters.types.length === 0) {
      setFilteredPokemon([]);
      return;
    }

    if (!isCacheLoaded) {
      setIsLoadingFiltered(true);
      return; // Wait for cache to load
    }

    setIsLoadingFiltered(true);

    try {
      // Apply filters to cached data
      const filtered = allPokemonCache.filter((pokemon) => {
        // Filter by type if types are selected
        if (filters.types.length > 0) {
          const pokemonTypes = pokemon.types.map((t) => t.type.name);
          const hasMatchingType = pokemonTypes.some((type) => filters.types.includes(type));
          if (!hasMatchingType) return false;
        }

        // Filter by stats
        const attackStat =
          pokemon.stats.find((stat) => stat.stat.name === 'attack')?.base_stat || 0;
        if (
          (filters.minAttack !== undefined && attackStat < filters.minAttack) ||
          (filters.maxAttack !== undefined && attackStat > filters.maxAttack)
        )
          return false;

        const defenseStat =
          pokemon.stats.find((stat) => stat.stat.name === 'defense')?.base_stat || 0;
        if (
          (filters.minDefense !== undefined && defenseStat < filters.minDefense) ||
          (filters.maxDefense !== undefined && defenseStat > filters.maxDefense)
        )
          return false;

        const hpStat = pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 0;
        if (
          (filters.minHP !== undefined && hpStat < filters.minHP) ||
          (filters.maxHP !== undefined && hpStat > filters.maxHP)
        )
          return false;

        const speedStat = pokemon.stats.find((stat) => stat.stat.name === 'speed')?.base_stat || 0;
        if (
          (filters.minSpeed !== undefined && speedStat < filters.minSpeed) ||
          (filters.maxSpeed !== undefined && speedStat > filters.maxSpeed)
        )
          return false;

        return true;
      });

      setFilteredPokemon(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoadingFiltered(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchFilters({
      types: [],
      minAttack: 0,
      maxAttack: 255,
      minDefense: 0,
      maxDefense: 255,
      minHP: 0,
      maxHP: 255,
      minSpeed: 0,
      maxSpeed: 255,
    });
    setFilteredPokemon([]);
  };

  // Render advanced search filters
  const renderAdvancedFilters = () => {
    return (
      <div className="advanced-filters">
        <div className="filters-header">
          <h3>Advanced Filters</h3>
          <button className="reset-filters" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="filter-section">
          <h4>Types</h4>
          <div className="type-filter-grid">
            {allTypes.map((type) => (
              <div
                key={type}
                className={`type-filter ${searchFilters.types.includes(type) ? 'active' : ''}`}
                style={{
                  backgroundColor: searchFilters.types.includes(type)
                    ? typeColors[type]
                    : '#f0f0f0',
                  color: searchFilters.types.includes(type) ? 'white' : '#333',
                }}
              >
                <label className="type-checkbox-label">
                  <input
                    type="checkbox"
                    checked={searchFilters.types.includes(type)}
                    onChange={() => toggleTypeFilter(type)}
                  />
                  <span className="type-name">{type}</span>
                </label>
              </div>
            ))}
          </div>
          {searchFilters.types.length > 0 && (
            <div className="selected-types">
              <p>Selected types: {searchFilters.types.length}</p>
              <button
                onClick={() => {
                  setSearchFilters((prev) => ({ ...prev, types: [] }));
                  setFilteredPokemon([]);
                }}
              >
                Clear types
              </button>
            </div>
          )}
        </div>

        <div className="filter-section">
          <h4>Stats</h4>

          <div className="stat-filter">
            <span>HP:</span>
            <div className="stat-range">
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.minHP}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, minHP: parseInt(e.target.value) }))
                }
              />
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.maxHP}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, maxHP: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="stat-values">
              <span>{searchFilters.minHP}</span>
              <span>{searchFilters.maxHP}</span>
            </div>
          </div>

          <div className="stat-filter">
            <span>Attack:</span>
            <div className="stat-range">
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.minAttack}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, minAttack: parseInt(e.target.value) }))
                }
              />
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.maxAttack}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, maxAttack: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="stat-values">
              <span>{searchFilters.minAttack}</span>
              <span>{searchFilters.maxAttack}</span>
            </div>
          </div>

          <div className="stat-filter">
            <span>Defense:</span>
            <div className="stat-range">
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.minDefense}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, minDefense: parseInt(e.target.value) }))
                }
              />
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.maxDefense}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, maxDefense: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="stat-values">
              <span>{searchFilters.minDefense}</span>
              <span>{searchFilters.maxDefense}</span>
            </div>
          </div>

          <div className="stat-filter">
            <span>Speed:</span>
            <div className="stat-range">
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.minSpeed}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, minSpeed: parseInt(e.target.value) }))
                }
              />
              <input
                type="range"
                min="0"
                max="255"
                value={searchFilters.maxSpeed}
                onChange={(e) =>
                  setSearchFilters((prev) => ({ ...prev, maxSpeed: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="stat-values">
              <span>{searchFilters.minSpeed}</span>
              <span>{searchFilters.maxSpeed}</span>
            </div>
          </div>
        </div>

        <button className="apply-filters" onClick={() => applyFilters()}>
          Apply Stat Filters
        </button>
      </div>
    );
  };

  // Render the filtered Pokémon results
  const renderFilteredResults = () => {
    if (isLoadingFiltered) {
      return <div className="loading">Loading filtered results...</div>;
    }

    if (filteredPokemon.length === 0) {
      return (
        <p className="no-results">No Pokémon match your filters. Try adjusting your criteria.</p>
      );
    }

    return (
      <div className="filtered-results">
        <h3>Results ({filteredPokemon.length} Pokémon)</h3>
        <div className="pokemon-grid">
          {filteredPokemon.map((pokemon) => (
            <div
              key={pokemon.id}
              className="pokemon-card-small"
              onClick={() => viewPokemonDetails(pokemon)}
            >
              <img src={getProxiedImageUrl(pokemon.sprites.front_default)} alt={pokemon.name} />

              <p>{pokemon.name}</p>
              <div className="pokemon-types-small">
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className="type-badge-small"
                    style={{ backgroundColor: typeColors[type.type.name] }}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Functions for fetching region starters and selecting regions are now in the RegionExplorer component

  // Function to fetch starter Pokémon data - this is now in the RegionExplorer component

  // Update the renderTabContent function to include the regions tab
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.POKEDEX:
        return (
          <PokedexExplorer
            pokemon={pokemon}
            searchTerm={searchTerm}
            error={error}
            loading={loading}
            description={description}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            evolutionChain={evolutionChain}
            loadingEvolution={loadingEvolution}
            filteredPokemon={filteredPokemon}
            showFilters={showFilters}
            searchFilters={searchFilters}
            // Methods
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            handleRandom={handleRandom}
            handleRandomLegendary={handleRandomLegendary}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            handleSuggestionClick={handleSuggestionClick}
            addToTeam={addToTeam}
            addToFavorites={addToFavorites}
            removeFromFavorites={removeFromFavorites}
            isPokemonFavorite={isPokemonFavorite}
            setShowFilters={setShowFilters}
            renderAdvancedFilters={renderAdvancedFilters}
            renderFilteredResults={renderFilteredResults}
          />
        );

      case TABS.TEAM:
        return (
          <TeamView
            team={team}
            teamMessage={teamMessage}
            teamAnalysis={teamAnalysis}
            recommendations={recommendations}
            typeColors={typeColors}
            onViewPokemonDetails={viewPokemonDetails}
            onRemoveFromTeam={removeFromTeam}
            onClearTeam={clearTeam}
            renderTeamAnalysis={renderTeamAnalysis}
            renderTeamRecommendations={renderTeamRecommendations}
          />
        );

      case TABS.FAVORITES:
        return (
          <FavoritesView
            favorites={favorites}
            favoriteMessage={favoriteMessage}
            typeColors={typeColors}
            onViewPokemonDetails={viewPokemonDetails}
            onRemoveFromFavorites={removeFromFavorites}
            onClearFavorites={clearFavorites}
          />
        );

      case TABS.BATTLE:
        return (
          <BattleView
            battleState={battleState}
            team={team}
            executeAttack={executeAttack}
            switchPokemon={switchPokemon}
            resetBattle={resetBattle}
            getMaxHP={getMaxHP}
            setBattleState={setBattleState}
          />
        );

      case TABS.REGIONS:
        return (
          <RegionExplorer
            regions={regions}
            loading={loading}
            onViewPokemonDetails={viewPokemonDetails}
            API_URL={API_URL}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0 }}>Pokédex</h1>
          <span style={{ fontSize: '11px', color: '#888' }}>version: {APP_VERSION}</span>
        </div>

        {/* Auth status/buttons */}
        <div className="auth-header" data-testid="auth-header" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span data-testid="user-email" style={{ marginRight: '10px' }}>
                👤 Zalogowany jako {user?.email} ({user?.role})
              </span>
              {user?.role === 'ADMINISTRATOR' && (
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: '#2563eb', // niebieski
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#4b5563', // ciemny szary
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Profile
              </button>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#dc2626', // czerwony
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <span style={{ color: '#666', marginRight: '10px' }}>
                🎮 Guest Mode
              </span>
              <button
                data-testid="login-button"
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#22c55e', // jasna zieleń
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Login
              </button>
              <button
                data-testid="register-button"
                onClick={() => navigate('/register')}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#3b82f6', // niebieski
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === TABS.POKEDEX ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.POKEDEX)}
        >
          Pokédex
        </button>
        <button
          className={`tab ${activeTab === TABS.TEAM ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.TEAM)}
        >
          Team ({team.length})
        </button>
        <button
          className={`tab ${activeTab === TABS.FAVORITES ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.FAVORITES)}
        >
          Favorites ({favorites.length})
        </button>
        <button
          className={`tab ${activeTab === TABS.BATTLE ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.BATTLE)}
        >
          Battle
        </button>
        <button
          className={`tab ${activeTab === TABS.REGIONS ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.REGIONS)}
        >
          Regions
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
}

export default App;
