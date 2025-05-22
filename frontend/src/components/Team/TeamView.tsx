import React from 'react';
import type { Pokemon } from '../../types/pokemon';
import type { TypeAnalysis, PokemonRecommendation } from '../../types/pokemon';

interface TeamViewProps {
  team: Pokemon[];
  teamMessage: string;
  teamAnalysis: TypeAnalysis;
  recommendations: PokemonRecommendation[];
  typeColors: Record<string, string>;
  onViewPokemonDetails: (pokemon: Pokemon) => void;
  onRemoveFromTeam: (id: number) => void;
  onClearTeam: () => void;
  renderTeamAnalysis: () => React.ReactNode;
  renderTeamRecommendations: () => React.ReactNode;
}

const TeamView: React.FC<TeamViewProps> = ({
  team,
  teamMessage,
  teamAnalysis,
  recommendations,
  typeColors,
  onViewPokemonDetails,
  onRemoveFromTeam,
  onClearTeam,
  renderTeamAnalysis,
  renderTeamRecommendations,
}) => {
  return (
    <div className="team-section">
      <h2>My Team ({team.length}/6)</h2>
      {teamMessage && <div className="team-message">{teamMessage}</div>}

      <div className="team-container">
        {team.length === 0 ? (
          <p className="empty-team">Your team is empty. Add Pokémon to your team!</p>
        ) : (
          <>
            <div className="team-grid">
              {team.map((teamPokemon) => (
                <div key={teamPokemon.id} className="team-pokemon">
                  <img
                    src={teamPokemon.sprites.front_default}
                    alt={teamPokemon.name}
                    onClick={() => onViewPokemonDetails(teamPokemon)}
                    className="clickable-pokemon"
                  />
                  <p>{teamPokemon.name}</p>
                  <div className="team-pokemon-types">
                    {teamPokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className="team-type-badge"
                        style={{ backgroundColor: typeColors[type.type.name] }}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                  <button
                    className="remove-pokemon"
                    onClick={() => onRemoveFromTeam(teamPokemon.id)}
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>

            {renderTeamAnalysis()}
            {renderTeamRecommendations()}

            <button className="clear-team" onClick={onClearTeam}>
              Release All
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamView;
