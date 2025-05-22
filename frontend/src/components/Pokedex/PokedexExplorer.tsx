import React from 'react';
import type { Pokemon, EvolutionData } from '../../types/pokemon';
import { PokemonCard } from './index';
import EvolutionChain from './EvolutionChain';

// Define proper types for search filters
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
  searchFilters: SearchFilters; // Use the proper type
  // Props needed for compatibility with App.tsx but not used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLoadingFiltered: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  typeColors: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allTypes: string[];

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
  // Methods needed for compatibility with App.tsx but not used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleTypeFilter: (type: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyFilters: (filters?: SearchFilters) => void; // Use the proper type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetFilters: () => void;
  setShowFilters: (show: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSearchFilters: (filters: SearchFilters) => void; // Use the proper type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewPokemonDetails: (pokemon: Pokemon) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderEvolutionChain: () => React.ReactNode;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLoadingFiltered,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  typeColors,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allTypes,

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleTypeFilter,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyFilters,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetFilters,
  setShowFilters,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSearchFilters,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewPokemonDetails,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderEvolutionChain,
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
