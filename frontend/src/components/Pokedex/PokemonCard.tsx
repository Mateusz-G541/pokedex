import React from 'react';
import type { Pokemon } from '../../types/pokemon';
import { typeColors } from '../../constants/typeColors';
import type { EvolutionData } from '../../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  description: string;
  evolutionChain: EvolutionData[];
  loadingEvolution: boolean;
  isPokemonFavorite: (id: number) => boolean;
  onAddToTeam: () => void;
  onAddToFavorites: () => void;
  onRemoveFromFavorites: (id: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  renderEvolutionChain: () => React.ReactNode;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  description,
  evolutionChain,
  loadingEvolution,
  isPokemonFavorite,
  onAddToTeam,
  onAddToFavorites,
  onRemoveFromFavorites,
  onPrevious,
  onNext,
  renderEvolutionChain,
}) => {
  return (
    <div className="pokemon-card" data-testid="pokemon-card">
      <div className="pokemon-image" data-testid="pokemon-image-container">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} data-testid="pokemon-image" />
      </div>
      <h2 data-testid="pokemon-name">{pokemon.name}</h2>
      <div className="pokemon-types" data-testid="pokemon-types">
        {pokemon.types.map((type, index) => (
          <span
            key={type.type.name}
            className="type-badge"
            style={{ backgroundColor: typeColors[type.type.name] }}
            data-testid={`pokemon-type-${index}`}
          >
            {type.type.name}
          </span>
        ))}
      </div>
      <div className="action-buttons" data-testid="action-buttons">
        <button className="add-to-team" onClick={onAddToTeam} data-testid="add-to-team-button">
          Add to Team
        </button>
        {isPokemonFavorite(pokemon.id) ? (
          <button
            className="remove-favorite"
            onClick={() => onRemoveFromFavorites(pokemon.id)}
            data-testid="remove-from-favorites-button"
          >
            Remove from Favorites
          </button>
        ) : (
          <button
            className="add-to-favorites"
            onClick={onAddToFavorites}
            data-testid="add-to-favorites-button"
          >
            Add to Favorites
          </button>
        )}
      </div>
      <div className="pokemon-details" data-testid="pokemon-details">
        <p data-testid="pokemon-id">
          <strong>ID:</strong> #{pokemon.id}
        </p>
        <p data-testid="pokemon-height">
          <strong>Height:</strong> {pokemon.height / 10}m
        </p>
        <p data-testid="pokemon-weight">
          <strong>Weight:</strong> {pokemon.weight / 10}kg
        </p>
        <p data-testid="pokemon-abilities">
          <strong>Abilities:</strong> {pokemon.abilities.map((a) => a.ability.name).join(', ')}
        </p>
        <div className="stats-container" data-testid="stats-container">
          <h3 data-testid="stats-heading">Base Stats</h3>
          {pokemon.stats.map((stat, index) => (
            <div key={stat.stat.name} className="stat-bar" data-testid={`stat-bar-${index}`}>
              <span className="stat-name" data-testid={`stat-name-${index}`}>
                {stat.stat.name}:
              </span>
              <div className="stat-bar-container" data-testid={`stat-bar-container-${index}`}>
                <div
                  className="stat-bar-fill"
                  style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                  data-testid={`stat-bar-fill-${index}`}
                />
              </div>
              <span className="stat-value" data-testid={`stat-value-${index}`}>
                {stat.base_stat}
              </span>
            </div>
          ))}
        </div>
        <div className="evolution-container" data-testid="evolution-container">
          <h3 data-testid="evolution-heading">Evolution Chain</h3>
          {renderEvolutionChain()}
        </div>
        <div className="description" data-testid="description-container">
          <h3 data-testid="description-heading">Description</h3>
          <p data-testid="description-text">{description}</p>
        </div>
      </div>
      <div className="navigation-buttons" data-testid="navigation-buttons">
        <button onClick={onPrevious} disabled={pokemon.id <= 1} data-testid="previous-button">
          Previous
        </button>
        <button onClick={onNext} disabled={pokemon.id >= 898} data-testid="next-button">
          Next
        </button>
      </div>
    </div>
  );
};

export default PokemonCard;
