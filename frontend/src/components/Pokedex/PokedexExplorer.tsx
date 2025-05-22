import React from 'react';
import type { Pokemon, EvolutionData } from '../../types/pokemon';
import { PokemonCard } from './index';
import EvolutionChain from './EvolutionChain';

interface PokedexExplorerProps {
  pokemon: Pokemon | null;
  searchTerm: string;
  error: string;
  loading: boolean;
  description: string;
  suggestions: string[];
  showSuggestions: boolean;
  evolutionChain: EvolutionData[];
  loadingEvolution: boolean;
  filteredPokemon: Pokemon[];
  showFilters: boolean;
  searchFilters: any;

  // Methods
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  handleRandom: () => void;
  handleRandomLegendary: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleSuggestionClick: (suggestion: string) => void;
  addToTeam: () => void;
  addToFavorites: () => void;
  removeFromFavorites: (id: number) => void;
  isPokemonFavorite: (id: number) => boolean;
  setShowFilters: (show: boolean) => void;
  renderAdvancedFilters: () => React.ReactNode;
  renderFilteredResults: () => React.ReactNode;
}

const PokedexExplorer: React.FC<PokedexExplorerProps> = ({
  pokemon,
  searchTerm,
  error,
  loading,
  description,
  suggestions,
  showSuggestions,
  evolutionChain,
  loadingEvolution,
  filteredPokemon,
  showFilters,
  searchFilters,

  // Methods
  setSearchTerm,
  handleSearch,
  handleRandom,
  handleRandomLegendary,
  handlePrevious,
  handleNext,
  handleSuggestionClick,
  addToTeam,
  addToFavorites,
  removeFromFavorites,
  isPokemonFavorite,
  setShowFilters,
  renderAdvancedFilters,
  renderFilteredResults,
}) => {
  return (
    <>
      <div className="search-container" data-testid="search-container">
        <div className="search-input-container" data-testid="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => searchTerm.length >= 3 && showSuggestions}
            onBlur={() => setTimeout(() => showSuggestions, 200)}
            data-testid="search-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-container" data-testid="suggestions-container">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`suggestion-item-${index}`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSearch} data-testid="search-button">
          Search
        </button>
        <button onClick={handleRandom} data-testid="random-button">
          Random
        </button>
        <button onClick={handleRandomLegendary} data-testid="legendary-button">
          Legendary
        </button>
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''} ${searchFilters.types.length > 0 || filteredPokemon.length > 0 ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          data-testid="filter-toggle-button"
        >
          {filteredPokemon.length > 0 ? `Filters (${filteredPokemon.length})` : 'Filters'}
        </button>
      </div>

      {showFilters && renderAdvancedFilters()}
      {filteredPokemon.length > 0 && renderFilteredResults()}

      {error && (
        <div className="error" data-testid="error-message">
          {error}
        </div>
      )}
      {loading && (
        <div className="loading" data-testid="loading-indicator">
          Loading...
        </div>
      )}

      {pokemon && !filteredPokemon.length && (
        <PokemonCard
          pokemon={pokemon}
          description={description}
          evolutionChain={evolutionChain}
          loadingEvolution={loadingEvolution}
          isPokemonFavorite={isPokemonFavorite}
          onAddToTeam={addToTeam}
          onAddToFavorites={addToFavorites}
          onRemoveFromFavorites={removeFromFavorites}
          onPrevious={handlePrevious}
          onNext={handleNext}
          renderEvolutionChain={() => (
            <EvolutionChain evolutionChain={evolutionChain} loadingEvolution={loadingEvolution} />
          )}
        />
      )}
    </>
  );
};

export default PokedexExplorer;
