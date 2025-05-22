import React from 'react';
import type { GymLeader as GymLeaderType } from './types';
// import { typeColors } from '../../constants/typeColors';

interface GymLeaderProps {
  leader: GymLeaderType;
  index: number;
}

const GymLeader: React.FC<GymLeaderProps> = ({ leader, index }) => {
  return (
    <div key={leader.name} className="gym-leader-card" data-testid={`gym-leader-card-${index}`}>
      <h4 data-testid={`gym-leader-name-${index}`}>{leader.name}</h4>
      <p data-testid={`gym-leader-type-container-${index}`}>
        <span
          className="type-badge-small"
          style={{ backgroundColor: typeColors[leader.specialtyType] }}
          data-testid={`gym-leader-type-${index}`}
        >
          {leader.specialtyType}
        </span>
      </p>
      <p data-testid={`gym-leader-badge-${index}`}>
        <strong>Badge:</strong> {leader.badge}
      </p>
      <div className="leader-pokemon" data-testid={`leader-pokemon-${index}`}>
        <strong>Pokémon:</strong>
        <p>{leader.pokemon.join(', ')}</p>
      </div>
    </div>
  );
};

export default GymLeader;
