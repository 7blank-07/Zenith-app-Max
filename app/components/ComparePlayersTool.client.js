'use client';

import { useEffect, useMemo, useState } from 'react';
import { normalizeSearchText } from './search-normalization';
import SquadPlayerCustomizationModal from './SquadPlayerCustomizationModal';
import { buildLegacyStatsModel, resolveLegacyStatValue, toNumber } from './player-skill-stats-utils';

const OUTFIELD_COMPARE_STATS = Object.freeze({
  basic: Object.freeze([
    { key: 'pace', label: 'Pace', source: 'category', categoryKey: 'pace' },
    { key: 'shooting', label: 'Shooting', source: 'category', categoryKey: 'shooting' },
    { key: 'passing', label: 'Passing', source: 'category', categoryKey: 'passing' },
    { key: 'dribbling', label: 'Dribbling', source: 'category', categoryKey: 'dribbling' },
    { key: 'defending', label: 'Defending', source: 'category', categoryKey: 'defending' },
    { key: 'physical', label: 'Physical', source: 'category', categoryKey: 'physical' }
  ]),
  advanced: Object.freeze([
    { key: 'acceleration', label: 'Acceleration', names: ['acceleration'] },
    { key: 'sprintSpeed', label: 'Sprint Speed', names: ['sprint_speed', 'sprintSpeed'] },
    { key: 'finishing', label: 'Finishing', names: ['finishing'] },
    { key: 'positioning', label: 'Positioning', names: ['positioning'] },
    { key: 'shotPower', label: 'Shot Power', names: ['shot_power', 'shotPower'] },
    { key: 'longShot', label: 'Long Shot', names: ['long_shot', 'long_shots', 'longshots', 'longShot'] },
    { key: 'volley', label: 'Volley', names: ['volley', 'volleys'] },
    { key: 'penalties', label: 'Penalties', names: ['penalties'] },
    { key: 'vision', label: 'Vision', names: ['vision'] },
    { key: 'crossing', label: 'Crossing', names: ['crossing'] },
    { key: 'curve', label: 'Curve', names: ['curve'] },
    { key: 'freeKick', label: 'Free Kick', names: ['free_kick', 'fk_accuracy', 'freeKick'] },
    { key: 'shortPassing', label: 'Short Passing', names: ['short_passing', 'shortPassing'] },
    { key: 'longPassing', label: 'Long Passing', names: ['long_passing', 'longPassing'] },
    { key: 'agility', label: 'Agility', names: ['agility'] },
    { key: 'balance', label: 'Balance', names: ['balance'] },
    { key: 'reactions', label: 'Reactions', names: ['reactions'] },
    { key: 'dribbling', label: 'Dribbling', names: ['dribbling'] },
    { key: 'ballControl', label: 'Ball Control', names: ['ball_control', 'ballControl'] },
    { key: 'marking', label: 'Marking', names: ['marking'] },
    { key: 'standingTackle', label: 'Standing Tackle', names: ['standing_tackle', 'standingTackle'] },
    { key: 'slidingTackle', label: 'Sliding Tackle', names: ['sliding_tackle', 'slidingTackle'] },
    { key: 'awareness', label: 'Awareness', names: ['awareness', 'interceptions'] },
    { key: 'heading', label: 'Heading', names: ['heading'] },
    { key: 'aggression', label: 'Aggression', names: ['aggression'] },
    { key: 'jumping', label: 'Jumping', names: ['jumping'] },
    { key: 'strength', label: 'Strength', names: ['strength'] },
    { key: 'stamina', label: 'Stamina', names: ['stamina_stat', 'stamina'] }
  ])
});

const GOALKEEPER_COMPARE_STATS = Object.freeze({
  basic: Object.freeze([
    { key: 'diving', label: 'Diving', source: 'category', categoryKey: 'diving' },
    { key: 'positioning', label: 'Positioning', source: 'category', categoryKey: 'positioning' },
    { key: 'handling', label: 'Handling', source: 'category', categoryKey: 'handling' },
    { key: 'reflexes', label: 'Reflexes', source: 'category', categoryKey: 'reflexes' },
    { key: 'kicking', label: 'Kicking', source: 'category', categoryKey: 'kicking' },
    { key: 'physical', label: 'Physical', source: 'category', categoryKey: 'physical' }
  ]),
  advanced: Object.freeze([
    { key: 'gkDiving', label: 'GK Diving', names: ['gk_diving', 'gkDiving', 'goalkeeperDiving', 'diving'] },
    { key: 'gkHandling', label: 'GK Handling', names: ['gk_handling', 'gkHandling', 'goalkeeperHandling', 'handling'] },
    { key: 'gkKicking', label: 'GK Kicking', names: ['gk_kicking', 'gkKicking', 'goalkeeperKicking', 'kicking'] },
    { key: 'gkPositioning', label: 'GK Positioning', names: ['gk_positioning', 'gkPositioning', 'goalkeeperPositioning', 'positioning'] },
    { key: 'gkReflexes', label: 'GK Reflexes', names: ['gk_reflexes', 'gkReflexes', 'goalkeeperReflexes', 'reflexes'] },
    { key: 'jumping', label: 'Jumping', names: ['jumping'] },
    { key: 'reactions', label: 'Reactions', names: ['reactions'] },
    { key: 'agility', label: 'Agility', names: ['agility'] },
    { key: 'sprintSpeed', label: 'Sprint Speed', names: ['sprint_speed', 'sprintSpeed'] },
    { key: 'strength', label: 'Strength', names: ['strength'] },
    { key: 'longPassing', label: 'Long Passing', names: ['long_passing', 'longPassing'] }
  ])
});

function toText(value) {
  return normalizeSearchText(value);
}

function getPlayerType(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function getValueClass(value, min, max) {
  if (max === min) return 'neutral';
  if (value === max) return 'green';
  if (value === min) return 'red';
  return 'yellow';
}

function activateWithKeyboard(event, callback) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  callback();
}

export default function ComparePlayersTool({ isActive, normalizedPlayers = [], playersById, onClose, onUpdatePlayer }) {
  const [comparePlayerIds, setComparePlayerIds] = useState([]);
  const [compareView, setCompareView] = useState('basic');
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchQuery, setCompareSearchQuery] = useState('');
  const [selectedCustomizationPlayerId, setSelectedCustomizationPlayerId] = useState('');

  const comparePlayers = useMemo(
    () => comparePlayerIds.map((playerId) => playersById.get(playerId)).filter(Boolean),
    [comparePlayerIds, playersById]
  );

  const comparePositionMode = useMemo(() => {
    if (!comparePlayers.length) return null;
    return String(comparePlayers[0]?.position || '').toUpperCase() === 'GK' ? 'gk' : 'outfield';
  }, [comparePlayers]);

  const compareStatsConfig = useMemo(() => {
    const configSet = comparePositionMode === 'gk' ? GOALKEEPER_COMPARE_STATS : OUTFIELD_COMPARE_STATS;
    return compareView === 'advanced' ? configSet.advanced : configSet.basic;
  }, [comparePositionMode, compareView]);

  const compareCategoryMaps = useMemo(
    () =>
      comparePlayers.map((player) => {
        const statsModel = buildLegacyStatsModel(player);
        return new Map(statsModel.categories.map((category) => [category.key, toNumber(category.mainValue, 0)]));
      }),
    [comparePlayers]
  );

  const compareRows = useMemo(() => {
    return compareStatsConfig.map((stat) => {
      const values = comparePlayers.map((player, index) => {
        if (stat.source === 'category') {
          return toNumber(compareCategoryMaps[index]?.get(stat.categoryKey), 0);
        }
        return resolveLegacyStatValue(player, ...(stat.names || [stat.key]));
      });
      const max = values.length ? Math.max(...values) : 0;
      const min = values.length ? Math.min(...values) : 0;
      return {
        key: stat.key,
        label: stat.label,
        values,
        classes: values.map((value) => getValueClass(value, min, max))
      };
    });
  }, [compareCategoryMaps, comparePlayers, compareStatsConfig]);

  const compareTotals = useMemo(() => {
    if (!compareRows.length || !comparePlayers.length) return [];
    const totals = comparePlayers.map((_, playerIndex) => compareRows.reduce((sum, row) => sum + toNumber(row.values[playerIndex], 0), 0));
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    return totals.map((value) => ({ value, className: getValueClass(value, min, max) }));
  }, [comparePlayers, compareRows]);

  const compareSubtitle =
    comparePlayers.length === 0
      ? 'Add at least 2 players to see comparison'
      : comparePlayers.length === 1
        ? 'Add one more player to enable comparison'
        : `Comparing ${comparePlayers.length} players`;

  const selectedPlayerIdSet = useMemo(() => new Set(comparePlayerIds), [comparePlayerIds]);

  const compareSearchResults = useMemo(() => {
    const query = toText(compareSearchQuery);
    if (query.length < 2) return [];
    return normalizedPlayers
      .filter((player) => {
        if (selectedPlayerIdSet.has(player.playerId)) return false;
        if (comparePositionMode === 'gk' && player.position !== 'GK') return false;
        if (comparePositionMode === 'outfield' && player.position === 'GK') return false;
        const searchable = toText(`${player.name} ${player.position} ${player.club} ${player.league} ${player.nation}`);
        return searchable.includes(query);
      })
      .slice(0, 40);
  }, [comparePositionMode, compareSearchQuery, normalizedPlayers, selectedPlayerIdSet]);

  const selectedCustomizationPlayer = selectedCustomizationPlayerId ? playersById.get(selectedCustomizationPlayerId) || null : null;

  useEffect(() => {
    if (isActive) return;
    setCompareSearchOpen(false);
    setCompareSearchQuery('');
    setSelectedCustomizationPlayerId('');
  }, [isActive]);

  useEffect(() => {
    if (!compareSearchOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [compareSearchOpen]);

  useEffect(() => {
    if (!compareSearchOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setCompareSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [compareSearchOpen]);

  const openCompareSearch = () => {
    if (comparePlayers.length >= 5) return;
    setCompareSearchQuery('');
    setCompareSearchOpen(true);
  };

  const addComparePlayer = (playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    const player = playersById.get(normalizedPlayerId);
    if (!player) return;
    if (selectedPlayerIdSet.has(normalizedPlayerId)) return;
    if (comparePlayers.length >= 5) return;
    if (comparePositionMode === 'gk' && player.position !== 'GK') return;
    if (comparePositionMode === 'outfield' && player.position === 'GK') return;

    setComparePlayerIds((current) => [...current, normalizedPlayerId]);
    setCompareSearchOpen(false);
    setCompareSearchQuery('');
  };

  const removeComparePlayer = (playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    setComparePlayerIds((current) => current.filter((entry) => entry !== normalizedPlayerId));
    setSelectedCustomizationPlayerId((current) => (current === normalizedPlayerId ? '' : current));
  };

  const resetComparePlayers = () => {
    setComparePlayerIds([]);
    setCompareView('basic');
    setCompareSearchOpen(false);
    setCompareSearchQuery('');
    setSelectedCustomizationPlayerId('');
  };

  const openComparePlayerCustomizationModal = (playerId) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (!normalizedPlayerId || !playersById.has(normalizedPlayerId)) return;
    setSelectedCustomizationPlayerId(normalizedPlayerId);
  };

  const closeComparePlayerCustomizationModal = () => {
    setSelectedCustomizationPlayerId('');
  };

  const updateComparePlayerCustomization = (payload = {}) => {
    const playerId = String(payload?.playerId || selectedCustomizationPlayerId || '').trim();
    if (!playerId) return;
    if (payload?.removePlayer) {
      removeComparePlayer(playerId);
      return;
    }
    onUpdatePlayer?.({ ...payload, playerId });
  };

  return (
    <>
      <div
        id="compare-players-modal"
        className="compare-modal-overlay compare-modal-overlay--page"
        style={{ display: isActive ? 'flex' : 'none' }}
      >
        <div className="compare-modal compare-modal--page">
          <div className="compare-header">
            <div className="compare-header-left">
              <h2>⚡ Compare Players</h2>
              <span id="compare-count-badge" className="compare-count-badge">
                {comparePlayers.length}/5
              </span>
            </div>
            <button className="compare-close-btn" onClick={onClose} type="button" aria-label="Back to tools">
              ✕
            </button>
          </div>

          <div className="compare-body">
            <div className="compare-stats-column">
              <div className="compare-view-toggle">
                <button
                  id="basic-stats-btn"
                  className={`compare-stats-btn ${compareView === 'basic' ? 'active' : ''}`}
                  onClick={() => setCompareView('basic')}
                  type="button"
                >
                  📊 Basic Stats
                </button>
                <button
                  id="advanced-stats-btn"
                  className={`compare-stats-btn ${compareView === 'advanced' ? 'active' : ''}`}
                  onClick={() => setCompareView('advanced')}
                  type="button"
                >
                  🔧 Advanced Stats
                </button>
              </div>

              <div className="compare-stats-section">
                <div className="compare-stats-header">
                  <h3 id="compare-stats-view-title">{compareView === 'basic' ? 'Major Stats Comparison' : 'Advanced Stats Breakdown'}</h3>
                  <p id="compare-stats-subtitle" className="compare-stats-subtitle">
                    {compareSubtitle}
                  </p>
                </div>

                <div id="compare-stats-grid" className="compare-stats-grid">
                  {compareRows.map((row) => (
                    <div key={row.key} className="stat-row" data-stat-field={row.key}>
                      <div className="stat-name-cell">{row.label}</div>
                      {comparePlayers.map((player, index) => {
                        const playerLabel = player?.name || `Player ${index + 1}`;
                        return (
                          <div
                            key={`${player.playerId}-${row.key}`}
                            className="stat-value-cell"
                            data-player-id={player.playerId}
                            data-player-label={playerLabel}
                          >
                            <span className="stat-player-label">{playerLabel}</span>
                            <span className={`stat-value ${row.classes[index]}`}>{row.values[index]}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {comparePlayers.length >= 2 && (
                    <div className="stat-row total-row" data-total-row="true">
                      <div className="stat-name-cell">🏆 TOTAL STATS</div>
                      {compareTotals.map((entry, index) => {
                        const playerLabel = comparePlayers[index]?.name || `Player ${index + 1}`;
                        return (
                          <div
                            key={`total-${comparePlayers[index]?.playerId || index}`}
                            className="stat-value-cell total-cell"
                            data-player-label={playerLabel}
                          >
                            <span className="stat-player-label">{playerLabel}</span>
                            <span className={`total-stats-value ${entry.className}`}>{entry.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="compare-cards-column">
              <div className="compare-cards-container">
                <div id="compare-cards-grid" className="compare-cards-grid">
                  {comparePlayers.map((player) => {
                    const variant = getPlayerType(player);
                    return (
                      <div
                        key={player.playerId}
                        className="compare-player-card filled-state new-card"
                        data-player-id={player.playerId}
                        onClick={() => openComparePlayerCustomizationModal(player.playerId)}
                        onKeyDown={(event) => activateWithKeyboard(event, () => openComparePlayerCustomizationModal(player.playerId))}
                        role="button"
                        tabIndex={0}
                      >
                        <button
                          className="player-remove-btn"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            removeComparePlayer(player.playerId);
                          }}
                          type="button"
                          aria-label={`Remove ${player.name} from compare`}
                        >
                          ×
                        </button>

                        <div className="compare-card-container">
                          <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card Background" className="compare-card-bg" />
                          {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="compare-player-image" />}
                          <div className="compare-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                            {player.ovr > 0 ? player.ovr : 'NA'}
                          </div>
                          <div className="compare-card-pos" style={{ color: player.colorPosition || '#FFFFFF' }}>
                            {player.position || 'NA'}
                          </div>
                          <div className="compare-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                            {player.name}
                          </div>

                          {!!player.nationFlag && (
                            <img
                              src={player.nationFlag}
                              alt="Nation"
                              className={`compare-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                            />
                          )}
                          {!!player.clubFlag && (
                            <img
                              src={player.clubFlag}
                              alt="Club"
                              className={`compare-club-flag ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                            />
                          )}
                          {variant === 'normal' && !!player.leagueImage && (
                            <img src={player.leagueImage} alt="League" className="compare-league-flag normal-league-flag" />
                          )}

                          {player.isUntradable && (
                            <div className="card-untradable-badge" style={{ right: '40px', pointerEvents: 'none' }}>
                              <img src="/assets/images/untradable_img.png" alt="Untradable" />
                            </div>
                          )}
                        </div>

                        <p className="compare-team-text">{player.club || 'N/A'}</p>
                      </div>
                    );
                  })}

                  {comparePlayers.length < 5 && (
                    <div
                      className="compare-player-card empty-state"
                      onClick={openCompareSearch}
                      onKeyDown={(event) => activateWithKeyboard(event, openCompareSearch)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                      <p className="empty-text">Add Player {comparePlayers.length + 1}</p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn--outline btn--sm" onClick={openCompareSearch} type="button" disabled={comparePlayers.length >= 5}>
                    Add Player
                  </button>
                  <button className="btn btn--outline btn--sm" onClick={resetComparePlayers} type="button">
                    Reset
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div id="compare-search-modal" className="compare-search-overlay" style={{ display: compareSearchOpen ? 'flex' : 'none' }}>
        <div className="compare-search-modal">
          <div className="compare-search-header">
            <h3>🔍 Search Players</h3>
            <button className="compare-search-close" onClick={() => setCompareSearchOpen(false)} type="button">
              ✕
            </button>
          </div>

          <div className="compare-search-body">
            <input
              type="text"
              id="compare-search-input"
              className="compare-search-input"
              value={compareSearchQuery}
              onChange={(event) => setCompareSearchQuery(event.target.value)}
              placeholder="Search player name..."
              autoComplete="off"
            />

            <div id="compare-search-results" className="compare-search-results">
              {toText(compareSearchQuery).length < 2 && (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>
                  Type at least 2 characters...
                </p>
              )}

              {toText(compareSearchQuery).length >= 2 && !compareSearchResults.length && (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>No players found.</p>
              )}

              {compareSearchResults.map((player) => {
                const variant = getPlayerType(player);
                return (
                  <div
                    key={player.playerId}
                    className="compare-search-result-item"
                    onClick={() => addComparePlayer(player.playerId)}
                    onKeyDown={(event) => activateWithKeyboard(event, () => addComparePlayer(player.playerId))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="compare-search-result-image">
                      <div className="picker-card-mini">
                        <img src={player.cardBackground || 'https://via.placeholder.com/120x160'} alt="Card" className="picker-card-bg" />
                        {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="picker-card-player-img" />}
                        <div className="picker-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                          {player.ovr > 0 ? player.ovr : 'NA'}
                        </div>
                        <div className="picker-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                          {player.position || 'NA'}
                        </div>
                        <div className="picker-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                          {player.name}
                        </div>
                        {!!player.nationFlag && (
                          <img
                            src={player.nationFlag}
                            alt="Nation"
                            className={`picker-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                          />
                        )}
                        {!!player.clubFlag && (
                          <img
                            src={player.clubFlag}
                            alt="Club"
                            className={`picker-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                          />
                        )}
                        {variant === 'normal' && !!player.leagueImage && (
                          <img src={player.leagueImage} alt="League" className="picker-card-flag-league-compare normal-league-flag-compare" />
                        )}
                        {player.isUntradable && (
                          <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
                            <img src="/assets/images/untradable_img.png" alt="Untradable" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="compare-search-result-info">
                      <h4>{player.name}</h4>
                      <p>
                        {player.position || 'NA'} • {player.club || 'N/A'}
                      </p>
                    </div>
                    <div className="compare-search-result-ovr">{player.ovr > 0 ? player.ovr : 'NA'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedCustomizationPlayer && (
        <SquadPlayerCustomizationModal
          player={selectedCustomizationPlayer}
          onClose={closeComparePlayerCustomizationModal}
          onUpdatePlayer={updateComparePlayerCustomization}
        />
      )}
    </>
  );
}
