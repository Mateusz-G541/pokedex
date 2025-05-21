import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get the API URL from environment variables, fallback to localhost for development
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Add this console log to help debug the API URL
console.log('API URL:', API_URL);

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
      const response = await axios.get(`${API_URL}/api/pokemon/random/legendary`);
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

  return (
    <div className="container">
      <h1>Pokédex</h1>
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
        <button onClick={handleRandomLegendary}>Random Legendary</button>
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
              <strong>Abilities:</strong> {pokemon.abilities.map((a) => a.ability.name).join(', ')}
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
    </div>
  );
}

export default App;
