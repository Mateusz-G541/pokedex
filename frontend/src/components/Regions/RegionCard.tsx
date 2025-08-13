import React from 'react';
import type { Region } from './types';
// import { typeColors } from '../../constants/typeColors';
import { getProxiedImageUrl } from '../../utils/imageProxy';

interface RegionCardProps {
  region: Region;
  index: number;
  onSelectRegion: (region: Region) => void;
}

const RegionCard: React.FC<RegionCardProps> = ({ region, index, onSelectRegion }) => {
  return (
    <div
      key={region.id}
      className="region-card"
      onClick={() => onSelectRegion(region)}
      data-testid={`region-card-${index}`}
    >
      {region.thumbnailPokemon ? (
        <div className="region-image-container" data-testid={`region-image-container-${index}`}>
          <img
            src={getProxiedImageUrl(region.thumbnailPokemon.sprites.front_default)}
            alt={region.thumbnailPokemon.name}
            className="region-image pokemon-image"
            data-testid={`region-thumbnail-image-${index}`}
          />
          <p className="pokemon-name" data-testid={`region-pokemon-name-${index}`}>
            {region.thumbnailPokemon.name}
          </p>
          <small className="pokemon-id" data-testid={`region-pokemon-id-${index}`}>
            #{region.thumbnailPokemon.id}
          </small>
        </div>
      ) : (
        <div className="region-image-placeholder" data-testid={`region-image-placeholder-${index}`}>
          <p data-testid={`region-placeholder-name-${index}`}>{region.name} Region</p>
          <small data-testid={`region-placeholder-id-${index}`}>
            First Pokémon: #{region.starter1}
          </small>
        </div>
      )}
      <h3 data-testid={`region-name-${index}`}>{region.name}</h3>
      <p data-testid={`region-description-${index}`}>{region.description.substring(0, 100)}...</p>
      <button className="explore-button" data-testid={`explore-region-button-${index}`}>
        Explore Region
      </button>
    </div>
  );
};

export default RegionCard;
