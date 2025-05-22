import React from 'react';
import type { EvolutionData } from '../../types/pokemon';

interface EvolutionChainProps {
  evolutionChain: EvolutionData[];
  loadingEvolution: boolean;
}

const EvolutionChain: React.FC<EvolutionChainProps> = ({ evolutionChain, loadingEvolution }) => {
  if (loadingEvolution) {
    return (
      <div className="loading-evolution" data-testid="loading-evolution">
        Loading evolution chain...
      </div>
    );
  }

  if (evolutionChain.length <= 1) {
    return <p data-testid="no-evolution-message">This Pokémon does not evolve.</p>;
  }

  return (
    <div className="evolution-chain" data-testid="evolution-chain">
      {evolutionChain.map((evolution, index) => (
        <div
          key={evolution.id}
          className="evolution-stage"
          data-testid={`evolution-stage-${index}`}
        >
          <div className="evolution-pokemon" data-testid={`evolution-pokemon-${index}`}>
            <img
              src={evolution.image}
              alt={evolution.name}
              data-testid={`evolution-image-${index}`}
            />
            <p data-testid={`evolution-name-${index}`}>{evolution.name}</p>
            <span className="evolution-id" data-testid={`evolution-id-${index}`}>
              #{evolution.id}
            </span>
          </div>
          {index < evolutionChain.length - 1 && (
            <div className="evolution-arrow" data-testid={`evolution-arrow-${index}`}>
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EvolutionChain;
