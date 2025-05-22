import React from 'react';
import type { Region } from './types';
import StarterPokemon from './StarterPokemon';
import GymLeader from './GymLeader';
import type { Pokemon } from '../../types/pokemon';

interface RegionDetailProps {
  region: Region;
  onBackClick: () => void;
  onViewPokemonDetails: (pokemon: Pokemon) => void;
}

const RegionDetail: React.FC<RegionDetailProps> = ({
  region,
  onBackClick,
  onViewPokemonDetails,
}) => {
  return (
    <div className="region-detail" data-testid="region-detail">
      <button
        className="back-to-regions"
        onClick={onBackClick}
        data-testid="back-to-regions-button"
      >
        ← Back to All Regions
      </button>

      <h2 data-testid="region-detail-title">{region.name} Region</h2>

      <div className="region-main-content" data-testid="region-main-content">
        <div className="region-image-container" data-testid="region-detail-image-container">
          {region.thumbnailPokemon ? (
            <div className="region-starter-showcase" data-testid="region-starter-showcase">
              <img
                src={region.thumbnailPokemon.sprites.front_default}
                alt={`${region.name} starter Pokémon`}
                className="region-detail-image"
                data-testid="region-detail-image"
              />
              <p className="starter-caption" data-testid="starter-caption">
                {region.thumbnailPokemon.name} - First Pokémon of {region.name} region
              </p>
            </div>
          ) : (
            <div className="region-detail-placeholder" data-testid="region-detail-placeholder">
              <p data-testid="region-loading-text">Loading {region.name} starter Pokémon...</p>
            </div>
          )}
        </div>

        <div className="region-info">
          <div className="region-description">
            <h3>About {region.name}</h3>
            <p>{region.description}</p>
            <p>
              <strong>Pokédex:</strong> #{region.pokedexRange.start} - #{region.pokedexRange.end}
            </p>
          </div>

          {/* Starter Pokémon Section */}
          <div className="starter-pokemon-section" data-testid="starter-pokemon-section">
            <h3 data-testid="starter-pokemon-heading">Starter Pokémon</h3>
            <div className="starter-pokemon-grid" data-testid="starter-pokemon-grid">
              {region.starter1Pokemon && (
                <StarterPokemon
                  pokemon={region.starter1Pokemon}
                  index={1}
                  onViewDetails={onViewPokemonDetails}
                />
              )}
              {region.starter2Pokemon && (
                <StarterPokemon
                  pokemon={region.starter2Pokemon}
                  index={2}
                  onViewDetails={onViewPokemonDetails}
                />
              )}
              {region.starter3Pokemon && (
                <StarterPokemon
                  pokemon={region.starter3Pokemon}
                  index={3}
                  onViewDetails={onViewPokemonDetails}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gym Leaders Section */}
      <div className="gym-leaders-section" data-testid="gym-leaders-section">
        <h3 data-testid="gym-leaders-heading">Gym Leaders</h3>
        <div className="gym-leaders-grid" data-testid="gym-leaders-grid">
          {region.gymLeaders.map((leader, index) => (
            <GymLeader key={leader.name} leader={leader} index={index} />
          ))}
        </div>
      </div>

      {/* Notable Locations Section */}
      <div className="locations-section" data-testid="locations-section">
        <h3 data-testid="locations-heading">Notable Locations</h3>
        <div className="locations-grid" data-testid="locations-grid">
          {region.locations.map((location, index) => (
            <div
              key={location.name}
              className="location-card"
              data-testid={`location-card-${index}`}
            >
              <h4 data-testid={`location-name-${index}`}>{location.name}</h4>
              <p data-testid={`location-description-${index}`}>{location.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionDetail;
