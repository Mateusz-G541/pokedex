import React, { useState } from 'react';
import axios from 'axios';
import type { Region } from './types';
import RegionCard from './RegionCard';
import RegionDetail from './RegionDetail';
import type { Pokemon } from '../../types/pokemon';

interface RegionExplorerProps {
  regions: Region[];
  loading: boolean;
  onViewPokemonDetails: (pokemon: Pokemon) => void;
  API_URL: string;
}

const RegionExplorer: React.FC<RegionExplorerProps> = ({
  regions,
  loading,
  onViewPokemonDetails,
  API_URL,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Function to fetch starter Pokémon data
  const fetchRegionStarters = async (region: Region) => {
    try {
      // Create a copy of the region to update
      const updatedRegion = { ...region };

      // Fetch starter Pokémon data if they have starter IDs
      if (region.starter1) {
        try {
          const starter1Response = await axios.get(`${API_URL}/api/pokemon/${region.starter1}`);
          updatedRegion.starter1Pokemon = starter1Response.data;

          // Also use the first starter as the region thumbnail
          updatedRegion.thumbnailPokemon = starter1Response.data;
        } catch (err) {
          console.error(`Error fetching starter1 for region ${region.name}:`, err);
        }
      }

      if (region.starter2) {
        try {
          const starter2Response = await axios.get(`${API_URL}/api/pokemon/${region.starter2}`);
          updatedRegion.starter2Pokemon = starter2Response.data;
        } catch (err) {
          console.error(`Error fetching starter2 for region ${region.name}:`, err);
        }
      }

      if (region.starter3) {
        try {
          const starter3Response = await axios.get(`${API_URL}/api/pokemon/${region.starter3}`);
          updatedRegion.starter3Pokemon = starter3Response.data;
        } catch (err) {
          console.error(`Error fetching starter3 for region ${region.name}:`, err);
        }
      }

      // Update the selected region with the starter Pokémon data
      setSelectedRegion(updatedRegion);
    } catch (err) {
      console.error('Error fetching starter Pokémon:', err);
    }
  };

  // Function to select a region
  const selectRegion = (region: Region) => {
    setSelectedRegion(region);
    fetchRegionStarters(region);
  };

  if (loading) {
    return (
      <div className="loading" data-testid="regions-loading">
        Loading region data...
      </div>
    );
  }

  if (!selectedRegion) {
    return (
      <div className="regions-list" data-testid="regions-list">
        <h2 data-testid="regions-title">Pokémon Regions</h2>
        <p className="regions-intro" data-testid="regions-intro">
          Explore the different regions of the Pokémon world, each with their own unique Pokémon,
          Gym Leaders, and landmarks.
        </p>
        <div className="regions-grid" data-testid="regions-grid">
          {regions.map((region, index) => (
            <RegionCard
              key={region.id}
              region={region}
              index={index}
              onSelectRegion={selectRegion}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render detailed view of selected region
  return (
    <RegionDetail
      region={selectedRegion}
      onBackClick={() => setSelectedRegion(null)}
      onViewPokemonDetails={onViewPokemonDetails}
    />
  );
};

export default RegionExplorer;
