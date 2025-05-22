import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get the API URL from environment variables, fallback to localhost for development
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Add this console log to help debug the API URL
console.log('API URL:', API_URL);

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

// Interface for evolution chain
interface EvolutionChain {
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: EvolvesTo[];
  };
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

function App() {
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

  const fetchPokemon = async (search: string | number) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/pokemon/${search}`);
      setPokemon(response.data);

      // Fetch description
      const speciesResponse = await axios.get(response.data.species.url);
      const flavorText = speciesResponse.data.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'en',
      );
      setDescription(flavorText?.flavor_text || 'No description available.');
    } catch (err) {
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
      const speciesResponse = await axios.get(speciesUrl);
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

      // Fetch the evolution chain
      const evolutionResponse = await axios.get(evolutionChainUrl);
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
    const traverseEvolutionChain = async (chain: any) => {
      try {
        // Extract the species ID from the URL
        const speciesId = chain.species.url.split('/').slice(-2, -1)[0];

        // Fetch the pokemon data to get the sprite
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);

        result.push({
          name: chain.species.name,
          id: parseInt(speciesId),
          image: pokemonResponse.data.sprites.front_default,
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
    const randomId = Math.floor(Math.random() * 898) + 1; // There are 898 Pokémon in the API
    setSearchTerm(randomId.toString());
    fetchPokemon(randomId);
  };

  const handleRandomLegendary = async () => {
    try {
      setLoading(true);
      setError('');

      // Using a hardcoded URL for testing
      console.log('Trying direct URL request');
      const directUrl = 'https://pokedex-n7cs.vercel.app/api/pokemon/random/legendary';
      console.log('Direct URL:', directUrl);

      const response = await axios.get(directUrl);
      setPokemon(response.data);

      // Fetch description
      const speciesResponse = await axios.get(response.data.species.url);
      const flavorText = speciesResponse.data.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'en',
      );
      setDescription(flavorText?.flavor_text || 'No description available.');
    } catch (err) {
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
        const speciesResponse = await axios.get(pokemon.species.url);
        const flavorText = speciesResponse.data.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'en',
        );
        setDescription(flavorText?.flavor_text || 'No description available.');
      } catch (err) {
        console.error('Error fetching description:', err);
        setDescription('No description available.');
      }
    };

    fetchDescription();
  };

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
              <img src={evolution.image} alt={evolution.name} />
              <p>{evolution.name}</p>
              <span className="evolution-id">#{evolution.id}</span>
            </div>
            {index < evolutionChain.length - 1 && <div className="evolution-arrow">→</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.POKEDEX:
        return (
          <>
            <div className="search-container">
              <div className="search-input-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-container">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleSearch}>Search</button>
              <button onClick={handleRandom}>Random</button>
              <button onClick={handleRandomLegendary}>Legendary</button>
            </div>

            {error && <div className="error">{error}</div>}
            {loading && <div className="loading">Loading...</div>}
            {pokemon && (
              <div className="pokemon-card">
                <div className="pokemon-image">
                  <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                </div>
                <h2>{pokemon.name}</h2>
                <div className="pokemon-types">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="type-badge"
                      style={{ backgroundColor: typeColors[type.type.name] }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
                <div className="action-buttons">
                  <button className="add-to-team" onClick={addToTeam}>
                    Add to Team
                  </button>
                  {isPokemonFavorite(pokemon.id) ? (
                    <button
                      className="remove-favorite"
                      onClick={() => removeFromFavorites(pokemon.id)}
                    >
                      Remove from Favorites
                    </button>
                  ) : (
                    <button className="add-to-favorites" onClick={addToFavorites}>
                      Add to Favorites
                    </button>
                  )}
                </div>
                <div className="pokemon-details">
                  <p>
                    <strong>ID:</strong> #{pokemon.id}
                  </p>
                  <p>
                    <strong>Height:</strong> {pokemon.height / 10}m
                  </p>
                  <p>
                    <strong>Weight:</strong> {pokemon.weight / 10}kg
                  </p>
                  <p>
                    <strong>Abilities:</strong>{' '}
                    {pokemon.abilities.map((a) => a.ability.name).join(', ')}
                  </p>
                  <div className="stats-container">
                    <h3>Base Stats</h3>
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name} className="stat-bar">
                        <span className="stat-name">{stat.stat.name}:</span>
                        <div className="stat-bar-container">
                          <div
                            className="stat-bar-fill"
                            style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                          />
                        </div>
                        <span className="stat-value">{stat.base_stat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="evolution-container">
                    <h3>Evolution Chain</h3>
                    {renderEvolutionChain()}
                  </div>
                  <div className="description">
                    <h3>Description</h3>
                    <p>{description}</p>
                  </div>
                </div>
                <div className="navigation-buttons">
                  <button onClick={handlePrevious} disabled={pokemon.id <= 1}>
                    Previous
                  </button>
                  <button onClick={handleNext} disabled={pokemon.id >= 898}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        );

      case TABS.TEAM:
        return (
          <div className="team-section">
            <h2>My Team ({team.length}/6)</h2>
            {teamMessage && <div className="team-message">{teamMessage}</div>}

            <div className="team-container">
              {team.length === 0 ? (
                <p className="empty-team">Your team is empty. Add Pokémon to your team!</p>
              ) : (
                <>
                  <div className="team-grid">
                    {team.map((teamPokemon) => (
                      <div key={teamPokemon.id} className="team-pokemon">
                        <img
                          src={teamPokemon.sprites.front_default}
                          alt={teamPokemon.name}
                          onClick={() => viewPokemonDetails(teamPokemon)}
                          className="clickable-pokemon"
                        />
                        <p>{teamPokemon.name}</p>
                        <div className="team-pokemon-types">
                          {teamPokemon.types.map((type) => (
                            <span
                              key={type.type.name}
                              className="team-type-badge"
                              style={{ backgroundColor: typeColors[type.type.name] }}
                            >
                              {type.type.name}
                            </span>
                          ))}
                        </div>
                        <button
                          className="remove-pokemon"
                          onClick={() => removeFromTeam(teamPokemon.id)}
                        >
                          Release
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="clear-team" onClick={clearTeam}>
                    Release All
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case TABS.FAVORITES:
        return (
          <div className="favorites-section">
            <h2>My Favorites ({favorites.length})</h2>
            {favoriteMessage && <div className="favorite-message">{favoriteMessage}</div>}

            <div className="favorites-container">
              {favorites.length === 0 ? (
                <p className="empty-favorites">
                  Your favorites list is empty. Add Pokémon to your favorites!
                </p>
              ) : (
                <>
                  <div className="favorites-grid">
                    {favorites.map((favoritePokemon) => (
                      <div key={favoritePokemon.id} className="favorite-pokemon">
                        <img
                          src={favoritePokemon.sprites.front_default}
                          alt={favoritePokemon.name}
                          onClick={() => viewPokemonDetails(favoritePokemon)}
                          className="clickable-pokemon"
                        />
                        <p>{favoritePokemon.name}</p>
                        <div className="favorite-pokemon-types">
                          {favoritePokemon.types.map((type) => (
                            <span
                              key={type.type.name}
                              className="favorite-type-badge"
                              style={{ backgroundColor: typeColors[type.type.name] }}
                            >
                              {type.type.name}
                            </span>
                          ))}
                        </div>
                        <button
                          className="remove-favorite"
                          onClick={() => removeFromFavorites(favoritePokemon.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="clear-favorites" onClick={clearFavorites}>
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1>Pokédex</h1>

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
      </div>

      {renderTabContent()}
    </div>
  );
}

export default App;
