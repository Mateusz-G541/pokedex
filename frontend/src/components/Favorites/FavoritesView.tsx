import React from 'react';
import type { Pokemon } from '../../types/pokemon';
import { getProxiedImageUrl } from '../../utils/imageProxy';

interface FavoritesViewProps {
  favorites: Pokemon[];
  favoriteMessage: string;
  typeColors: Record<string, string>;
  onViewPokemonDetails: (pokemon: Pokemon) => void;
  onRemoveFromFavorites: (id: number) => void;
  onClearFavorites: () => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  favoriteMessage,
  typeColors,
  onViewPokemonDetails,
  onRemoveFromFavorites,
  onClearFavorites,
}) => {
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
                    src={getProxiedImageUrl(favoritePokemon.sprites.front_default)}
                    alt={favoritePokemon.name}
                    onClick={() => onViewPokemonDetails(favoritePokemon)}
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
                    onClick={() => onRemoveFromFavorites(favoritePokemon.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className="clear-favorites" onClick={onClearFavorites}>
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
