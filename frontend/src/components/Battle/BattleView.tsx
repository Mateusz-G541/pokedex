import React from 'react';
import type { Pokemon } from '../../types/pokemon';

interface BattleState {
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  currentPlayerPokemon: Pokemon | null;
  currentOpponentPokemon: Pokemon | null;
  playerHP: number;
  opponentHP: number;
  battleLog: string[];
  isBattleActive: boolean;
  battleResult: 'ongoing' | 'win' | 'lose' | null;
  turn: 'player' | 'opponent' | 'selection';
}

interface BattleViewProps {
  battleState: BattleState;
  team: Pokemon[];
  executeAttack: (isPlayerAttacking: boolean) => void;
  switchPokemon: (pokemon: Pokemon) => void;
  resetBattle: () => void;
  getMaxHP: (pokemon: Pokemon) => number;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState>>;
}

const BattleView: React.FC<BattleViewProps> = ({
  battleState,
  team,
  executeAttack,
  switchPokemon,
  resetBattle,
  getMaxHP,
  setBattleState,
}) => {
  if (team.length === 0) {
    return (
      <div className="battle-section">
        <div className="battle-message">
          <h3>Battle Simulator</h3>
          <p>You need to add Pokémon to your team before you can battle!</p>
        </div>
      </div>
    );
  }

  if (!battleState.playerTeam.length || !battleState.opponentTeam.length) {
    return <div className="loading">Preparing for battle...</div>;
  }

  return (
    <div className="battle-section">
      <h2>Battle Simulator</h2>

      {battleState.battleResult && (
        <div className={`battle-result ${battleState.battleResult}`}>
          <h3>{battleState.battleResult === 'win' ? 'Victory!' : 'Defeat!'}</h3>
          <button className="battle-again" onClick={resetBattle}>
            Battle Again
          </button>
        </div>
      )}

      {!battleState.battleResult && (
        <div className="battle-arena">
          <div className="battle-log">
            {battleState.battleLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>

          {battleState.currentOpponentPokemon && (
            <div className="opponent-area">
              <div className="pokemon-battle">
                <img
                  src={battleState.currentOpponentPokemon.sprites.front_default}
                  alt={battleState.currentOpponentPokemon.name}
                />
                <div className="battle-info">
                  <p>{battleState.currentOpponentPokemon.name}</p>
                  <div className="hp-bar">
                    <div
                      className="hp-fill"
                      style={{
                        width: `${(battleState.opponentHP / getMaxHP(battleState.currentOpponentPokemon)) * 100}%`,
                        backgroundColor:
                          battleState.opponentHP <
                          getMaxHP(battleState.currentOpponentPokemon) * 0.2
                            ? '#e74c3c'
                            : battleState.opponentHP <
                                getMaxHP(battleState.currentOpponentPokemon) * 0.5
                              ? '#f39c12'
                              : '#2ecc71',
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {battleState.isBattleActive &&
                battleState.turn === 'player' &&
                !battleState.battleResult && (
                  <div className="battle-controls">
                    <button className="attack-button" onClick={() => executeAttack(true)}>
                      Attack
                    </button>
                    <button
                      className="switch-button"
                      onClick={() => setBattleState((prev) => ({ ...prev, turn: 'selection' }))}
                    >
                      Switch
                    </button>
                  </div>
                )}
            </div>
          )}

          <div className="player-area">
            <div className="player-team">
              {battleState.playerTeam.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`player-pokemon ${pokemon.id === battleState.currentPlayerPokemon?.id ? 'active' : ''} ${battleState.turn === 'selection' ? 'selectable' : ''}`}
                  onClick={() => battleState.turn === 'selection' && switchPokemon(pokemon)}
                >
                  <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                  <p>{pokemon.name}</p>
                  {pokemon.id === battleState.currentPlayerPokemon?.id && (
                    <div className="hp-bar">
                      <div
                        className="hp-fill"
                        style={{
                          width: `${(battleState.playerHP / getMaxHP(pokemon)) * 100}%`,
                          backgroundColor:
                            battleState.playerHP < getMaxHP(pokemon) * 0.2
                              ? '#e74c3c'
                              : battleState.playerHP < getMaxHP(pokemon) * 0.5
                                ? '#f39c12'
                                : '#2ecc71',
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!battleState.isBattleActive && !battleState.battleResult && (
              <div className="battle-start">
                <p>Select your first Pokémon to start the battle!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-attack for opponent's turn */}
      {battleState.turn === 'opponent' &&
        battleState.isBattleActive &&
        !battleState.battleResult && (
          <div style={{ display: 'none' }}>
            {setTimeout(() => executeAttack(false), 1500) && null}
          </div>
        )}
    </div>
  );
};

export default BattleView;
