import React from 'react';
import type { Pokemon } from '../../types/pokemon';
import { getProxiedImageUrl } from '../../utils/imageProxy';
import { typeColors } from '../../constants/typeColors';

interface StarterPokemonProps {
  pokemon: Pokemon;
  index: number;
  onViewDetails: (pokemon: Pokemon) => void;
}

const StarterPokemon: React.FC<StarterPokemonProps> = ({ pokemon, index, onViewDetails }) => {
  if (!pokemon) return null;

  return (
    <div className="starter-pokemon" data-testid={`starter-pokemon-${index}`}>
      <img
        src={getProxiedImageUrl(`/images/pokemon/${pokemon.id}.png`)}
        alt={pokemon.name}
        data-testid={`starter-pokemon-${index}-image`}
      />
      <p data-testid={`starter-pokemon-${index}-name`}>{pokemon.name}</p>
      <div className="starter-types" data-testid={`starter-pokemon-${index}-types`}>
        {pokemon.types.map((type, typeIndex) => (
          <span
            key={type.type.name}
            className="type-badge-small"
            style={{ backgroundColor: typeColors[type.type.name] }}
            data-testid={`starter-pokemon-${index}-type-${typeIndex}`}
          >
            {type.type.name}
          </span>
        ))}
      </div>
      <button
        className="view-pokemon-details"
        onClick={() => onViewDetails(pokemon)}
        data-testid={`starter-pokemon-${index}-details-button`}
      >
        View Details
      </button>
    </div>
  );
};

export default StarterPokemon;
