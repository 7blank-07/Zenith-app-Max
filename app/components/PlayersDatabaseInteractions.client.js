'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerUniqueId } from '../../src/lib/legacy-parity-contract.mjs';
import { normalizeSearchText } from './search-normalization';

const PAGE_SIZE = 70;
const STAT_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
const DEFAULT_STAT_FILTERS = Object.freeze({
  pac: 0,
  sho: 0,
  pas: 0,
  dri: 0,
  def: 0,
  phy: 0
});
const DEFAULT_FILTERS = Object.freeze({
  position: '',
  league: '',
  club: '',
  nation: '',
  event: '',
  skill: '',
  ratingMin: 40,
  ratingMax: 150,
  auctionable: false
});

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => toText(value)).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function formatPrice(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return 'No data';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${Math.round(safe / 1000)}K`;
  return String(Math.round(safe));
}

function getInitials(name) {
  const words = toText(name)
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function readArrayStorage(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[players] Failed to read ${key}:`, error);
    return [];
  }
}

function writeArrayStorage(key, values) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(values));
}

function parseAlternatePositions(value) {
  return toText(value)
    .split(',')
    .map((entry) => entry.trim().toUpperCase())
    .filter((entry) => entry && entry !== '0');
}

function normalizePlayer(player) {
  const playerId = toText(player?.playerId);
  const pace = toNumber(player?.attributes?.pace, 0);
  const shooting = toNumber(player?.attributes?.shooting, 0);
  const passing = toNumber(player?.attributes?.passing, 0);
  const dribbling = toNumber(player?.attributes?.dribbling, 0);
  const defending = toNumber(player?.attributes?.defending, 0);
  const physical = toNumber(player?.attributes?.physical, 0);
  const isUntradable = !!player?.isUntradable;
  const uniqueId = getPlayerUniqueId({
    playerId,
    rank: 0,
    is_untradable: isUntradable
  });
  return {
    playerId,
    uniqueId,
    name: toText(player?.name, 'Unknown Player'),
    ovr: toNumber(player?.ovr, 0),
    position: toText(player?.position),
    league: toText(player?.league),
    club: toText(player?.club),
    nation: toText(player?.nation),
    event: toText(player?.event || player?.eventName),
    skillMoves: toNumber(player?.skillMoves, 0),
    isUntradable,
    price: toNumber(player?.price, 0),
    cardBackground: toText(player?.cardBackground),
    playerImage: toText(player?.playerImage || player?.image),
    nationFlag: toText(player?.nationFlag),
    clubFlag: toText(player?.clubFlag),
    leagueImage: toText(player?.leagueImage),
    colorName: toText(player?.colorName, '#FFFFFF') || '#FFFFFF',
    colorRating: toText(player?.colorRating, '#FFB86B') || '#FFB86B',
    colorPosition: toText(player?.colorPosition, '#FFFFFF') || '#FFFFFF',
    alternatePositions: parseAlternatePositions(player?.alternatePosition),
    pac: pace,
    sho: shooting,
    pas: passing,
    dri: dribbling,
    def: defending,
    phy: physical,
    searchText: normalizeSearchText(`${player?.name || ''} ${player?.position || ''} ${player?.club || ''} ${player?.league || ''} ${player?.nation || ''}`)
  };
}

function getStoredPlayerUniqueId(player) {
  const stored = toText(player?.unique_id || player?.uniqueId);
  if (stored) return stored;
  const playerId = toText(player?.player_id || player?.playerid || player?.id);
  const rank = toNumber(player?.rank, 0);
  const untradable = !!player?.is_untradable || player?.isuntradable === 1;
  return `${playerId}_${rank}_${untradable ? 1 : 0}`;
}

function buildWatchlistSnapshot(player, resolvedPrice) {
  return {
    unique_id: player.uniqueId,
    player_id: player.playerId,
    playerid: player.playerId,
    id: player.playerId,
    name: player.name,
    position: player.position,
    team: player.club,
    club: player.club,
    league: player.league,
    nation_region: player.nation,
    nation: player.nation,
    event: player.event,
    ovr: player.ovr,
    overallrating: player.ovr,
    rating: player.ovr,
    rank: 0,
    is_untradable: player.isUntradable,
    isuntradable: player.isUntradable ? 1 : 0,
    skill_moves: player.skillMoves,
    skillmoves: player.skillMoves,
    pace: player.pac,
    shooting: player.sho,
    passing: player.pas,
    dribbling: player.dri,
    defending: player.def,
    physical: player.phy,
    price: resolvedPrice,
    card_background: player.cardBackground,
    cardbackground: player.cardBackground,
    player_image: player.playerImage,
    playerimage: player.playerImage,
    nation_flag: player.nationFlag,
    nationflag: player.nationFlag,
    club_flag: player.clubFlag,
    clubflag: player.clubFlag,
    league_image: player.leagueImage,
    color_name: player.colorName,
    colorname: player.colorName,
    color_rating: player.colorRating,
    colorrating: player.colorRating,
    color_position: player.colorPosition,
    colorposition: player.colorPosition,
    alternate_position: player.alternatePositions.join(','),
    alternateposition: player.alternatePositions.join(',')
  };
}

function renderPlayerCard(player) {
  const playerType = player.leagueImage ? 'normal' : 'hero';
  return (
    <div className="player-row-card">
      <div className="player-card-image-container">
        <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card Background" className="player-card-bg-image" />
        <img src={player.playerImage || 'https://via.placeholder.com/200x300'} alt={player.name} className="player-card-main-image" />
        <span className="player-initials">{getInitials(player.name)}</span>

        <div className="player-card-name" style={{ color: player.colorName }}>
          {player.name}
        </div>
        <div className="player-card-ovr" style={{ color: player.colorRating }}>
          {player.ovr || '?'}
        </div>
        <div className="player-card-position" style={{ color: player.colorPosition }}>
          {player.position || '?'}
        </div>

        <img
          src={player.nationFlag || ''}
          alt="Nation"
          className={`player-view-card-nation-flag ${playerType === 'normal' ? 'normal-players-nation-flag' : 'hero-icon-players-nation-flag'}`}
        />
        <img
          src={player.clubFlag || ''}
          alt="Club"
          className={`player-view-card-club-flag ${playerType === 'normal' ? 'normal-club-players-flag' : 'hero-icon-club-players-flag'}`}
        />
        {playerType === 'normal' && !!player.leagueImage && (
          <img src={player.leagueImage} alt="League" className="player-view-card-league-flag normal-league-players-flag" />
        )}

        {player.isUntradable && (
          <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
            <img src="/assets/images/untradable_img.png" alt="Untradable" />
          </div>
        )}
      </div>
    </div>
  );
}

function statDisplay(value) {
  return value > 0 ? value : '-';
}

export default function PlayersDatabaseInteractions({
  players = [],
  positions = [],
  leagues = [],
  clubs = [],
  nations = [],
  skillMoves = []
}) {
  const router = useRouter();
  const normalizedPlayers = useMemo(() => players.map(normalizePlayer).filter((player) => !!player.playerId), [players]);
  const playerByUniqueId = useMemo(() => new Map(normalizedPlayers.map((player) => [player.uniqueId, player])), [normalizedPlayers]);

  const eventOptions = useMemo(() => uniqueSorted(normalizedPlayers.map((player) => player.event)), [normalizedPlayers]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mobileFilters, setMobileFilters] = useState(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statFilters, setStatFilters] = useState(DEFAULT_STAT_FILTERS);
  const [statDraft, setStatDraft] = useState(DEFAULT_STAT_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [preview, setPreview] = useState({ player: null, x: 0, y: 0 });
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistPlayers, setWatchlistPlayers] = useState([]);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    setWatchlist(readArrayStorage('watchlist').map((entry) => toText(entry)).filter(Boolean));
    setWatchlistPlayers(readArrayStorage('watchlistPlayers'));
    setStorageHydrated(true);
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    writeArrayStorage('watchlist', watchlist);
    window.dispatchEvent(new Event('watchlist-updated'));
  }, [storageHydrated, watchlist]);

  useEffect(() => {
    if (!storageHydrated) return;
    writeArrayStorage('watchlistPlayers', watchlistPlayers);
  }, [storageHydrated, watchlistPlayers]);

  const watchedIds = useMemo(() => new Set(watchlist), [watchlist]);

  const getResolvedPrice = (player) => {
    const livePrice = toNumber(livePrices[player.playerId], 0);
    if (livePrice > 0) return livePrice;
    const fallbackPrice = toNumber(player.price, 0);
    return fallbackPrice > 0 ? fallbackPrice : 0;
  };

  useEffect(() => {
    const tradableIds = normalizedPlayers.filter((player) => !player.isUntradable).map((player) => player.playerId);
    if (!tradableIds.length) return;

    let cancelled = false;
    const updates = {};

    async function hydratePrices() {
      const batchSize = 25;
      for (let index = 0; index < tradableIds.length; index += batchSize) {
        const batch = tradableIds.slice(index, index + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (playerId) => {
            try {
              const response = await fetch(`/api/player-price?id=${encodeURIComponent(playerId)}&rank=0`, {
                cache: 'no-store'
              });
              if (!response.ok) return [playerId, 0];
              const payload = await response.json();
              return [playerId, toNumber(payload?.price, 0)];
            } catch {
              return [playerId, 0];
            }
          })
        );
        batchResults.forEach(([playerId, price]) => {
          if (price > 0) updates[playerId] = price;
        });
        if (cancelled) return;
      }

      if (!cancelled && Object.keys(updates).length) {
        setLivePrices((previous) => ({ ...previous, ...updates }));
      }
    }

    hydratePrices();
    return () => {
      cancelled = true;
    };
  }, [normalizedPlayers]);

  useEffect(() => {
    if (!watchlistPlayers.length) return;
    setWatchlistPlayers((current) => {
      let changed = false;
      const next = current
        .filter((entry) => watchedIds.has(getStoredPlayerUniqueId(entry)))
        .map((entry) => {
          const uniqueId = getStoredPlayerUniqueId(entry);
          const player = playerByUniqueId.get(uniqueId);
          if (!player) return entry;
          const resolvedPrice = getResolvedPrice(player);
          if (toNumber(entry?.price, 0) === resolvedPrice) return entry;
          changed = true;
          return { ...entry, price: resolvedPrice };
        });
      return changed || next.length !== current.length ? next : current;
    });
  }, [livePrices, playerByUniqueId, watchlistPlayers.length, watchedIds]);

  const normalizedSearchQuery = useMemo(() => normalizeSearchText(searchQuery), [searchQuery]);

  const filteredPlayers = useMemo(() => {
    const next = normalizedPlayers.filter((player) => {
      if (normalizedSearchQuery && !player.searchText.includes(normalizedSearchQuery)) return false;
      if (filters.auctionable && player.isUntradable) return false;
      if (filters.position && normalizeSearchText(player.position) !== normalizeSearchText(filters.position)) return false;
      if (filters.league && normalizeSearchText(player.league) !== normalizeSearchText(filters.league)) return false;
      if (filters.club && normalizeSearchText(player.club) !== normalizeSearchText(filters.club)) return false;
      if (filters.nation && normalizeSearchText(player.nation) !== normalizeSearchText(filters.nation)) return false;
      if (filters.event && normalizeSearchText(player.event) !== normalizeSearchText(filters.event)) return false;
      if (filters.skill && String(player.skillMoves) !== String(filters.skill)) return false;
      if (player.ovr < filters.ratingMin || player.ovr > filters.ratingMax) return false;
      return STAT_KEYS.every((key) => {
        const threshold = toNumber(statFilters[key], 0);
        if (threshold <= 0) return true;
        return toNumber(player[key], 0) >= threshold;
      });
    });

    next.sort((left, right) => {
      if (sortBy === 'rating') return right.ovr - left.ovr;
      if (sortBy === 'price') return getResolvedPrice(right) - getResolvedPrice(left);
      return normalizeSearchText(left.name).localeCompare(normalizeSearchText(right.name));
    });

    return next;
  }, [filters, getResolvedPrice, normalizedPlayers, normalizedSearchQuery, sortBy, statFilters]);

  const visiblePlayers = useMemo(() => filteredPlayers.slice(0, visibleCount), [filteredPlayers, visibleCount]);
  const hasMorePlayers = visibleCount < filteredPlayers.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, normalizedSearchQuery, sortBy, statFilters]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.position) chips.push({ label: 'Position', value: filters.position.toUpperCase() });
    if (filters.league) chips.push({ label: 'League', value: filters.league });
    if (filters.club) chips.push({ label: 'Club', value: filters.club });
    if (filters.nation) chips.push({ label: 'Nation', value: filters.nation });
    if (filters.event) chips.push({ label: 'Event', value: filters.event });
    if (filters.skill) chips.push({ label: 'Skill', value: `${filters.skill}★` });
    if (filters.auctionable) chips.push({ label: 'Auction', value: 'Only With Prices' });
    if (filters.ratingMin !== 40 || filters.ratingMax !== 150) chips.push({ label: 'OVR', value: `${filters.ratingMin}-${filters.ratingMax}` });
    STAT_KEYS.forEach((key) => {
      if (toNumber(statFilters[key], 0) > 0) chips.push({ label: key.toUpperCase(), value: `>=${statFilters[key]}` });
    });
    return chips;
  }, [filters, statFilters]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilters(DEFAULT_FILTERS);
    setMobileFilters(DEFAULT_FILTERS);
    setStatFilters(DEFAULT_STAT_FILTERS);
    setStatDraft(DEFAULT_STAT_FILTERS);
  };

  const toggleWatchlist = (event, player) => {
    event.preventDefault();
    event.stopPropagation();
    const uniqueId = player.uniqueId;
    const resolvedPrice = getResolvedPrice(player);

    if (watchedIds.has(uniqueId)) {
      setWatchlist((current) => current.filter((entry) => entry !== uniqueId));
      setWatchlistPlayers((current) => current.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId));
      return;
    }

    setWatchlist((current) => [...current, uniqueId]);
    setWatchlistPlayers((current) => {
      const next = current.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId);
      next.push(buildWatchlistSnapshot(player, resolvedPrice));
      return next;
    });
  };

  const openMobileFilters = () => {
    setMobileFilters(filters);
    setMobileFilterOpen(true);
  };

  const applyMobileFilters = () => {
    setFilters(mobileFilters);
    setMobileFilterOpen(false);
  };

  const closeMobileFilters = () => {
    setMobileFilterOpen(false);
  };

  const updatePreviewPosition = (event, player) => {
    setPreview({
      player,
      x: event.clientX + 16,
      y: event.clientY + 16
    });
  };

  const hidePreview = () => {
    setPreview((current) => (current.player ? { player: null, x: 0, y: 0 } : current));
  };

  const resultsCountText = `${visiblePlayers.length} players shown`;

  return (
    <>
      <div id="database-view" className="view active">
        <div className="mobile-search-container">
          <button className="mobile-filter-icon" id="mobile-filter-toggle" aria-label="Open Filters" type="button" onClick={openMobileFilters}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2" fill="currentColor" />
              <circle cx="16" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
          <input
            type="text"
            id="mobile-player-search"
            className="mobile-search-input"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button className="mobile-search-icon" aria-label="Search" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        <div className="database-layout" style={{ position: 'relative', zIndex: 2, minHeight: '100vh', padding: '2rem 0', background: 'transparent' }}>
          <aside
            className="filters-sidebar"
            style={{
              background: 'rgba(20,24,28,0.5)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255,255,255,0.15)',
              zIndex: 3
            }}
          >
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="btn btn-text btn-sm" id="clear-filters" type="button" onClick={resetAllFilters}>
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="filter-label">Auction Status</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="auctionable-toggle"
                    checked={filters.auctionable}
                    onChange={(event) => setFilters((current) => ({ ...current, auctionable: event.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-4px', marginBottom: 0 }}>
                <span id="auction-status-text">{filters.auctionable ? 'Only With Prices' : 'All Players'}</span>
              </p>
            </div>

            <div className="filter-group">
              <label className="filter-label">Position</label>
              <select
                id="filter-position"
                className="filter-select"
                value={filters.position}
                onChange={(event) => setFilters((current) => ({ ...current, position: event.target.value }))}
              >
                <option value="">All Positions</option>
                {positions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                Overall Rating: <span id="rating-value">{`${filters.ratingMin}-${filters.ratingMax}`}</span>
              </label>
              <div className="range-inputs">
                <input
                  type="number"
                  id="rating-min"
                  value={filters.ratingMin}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      ratingMin: clamp(toNumber(event.target.value, 40), 40, current.ratingMax)
                    }))
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  id="rating-max"
                  value={filters.ratingMax}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      ratingMax: clamp(toNumber(event.target.value, 150), current.ratingMin, 150)
                    }))
                  }
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">League</label>
              <select
                id="filter-league"
                className="filter-select"
                value={filters.league}
                onChange={(event) => setFilters((current) => ({ ...current, league: event.target.value }))}
              >
                <option value="">All Leagues</option>
                {leagues.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Club</label>
              <select
                id="filter-club"
                className="filter-select"
                value={filters.club}
                onChange={(event) => setFilters((current) => ({ ...current, club: event.target.value }))}
              >
                <option value="">All Clubs</option>
                {clubs.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Nation</label>
              <select
                id="filter-nation"
                className="filter-select"
                value={filters.nation}
                onChange={(event) => setFilters((current) => ({ ...current, nation: event.target.value }))}
              >
                <option value="">All Nations</option>
                {nations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Event</label>
              <select
                id="filter-event"
                className="filter-select"
                value={filters.event}
                onChange={(event) => setFilters((current) => ({ ...current, event: event.target.value }))}
              >
                <option value="">All Events</option>
                {eventOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Skill Moves</label>
              <select
                id="filter-skill"
                className="filter-select"
                value={filters.skill}
                onChange={(event) => setFilters((current) => ({ ...current, skill: event.target.value }))}
              >
                <option value="">Any</option>
                {skillMoves.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <div className="database-content" style={{ background: 'transparent', zIndex: 3 }}>
            <div className="database-toolbar">
              <div className="search-container">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  id="player-search"
                  placeholder="Search by name..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="toolbar-actions">
                <button id="open-stats-modal" className="stats-btn" type="button" onClick={() => setStatsModalOpen(true)}>
                  <span className="stats-icon" />
                  Stats
                </button>
              </div>

              <div className="toolbar-actions">
                <select id="sort-by" className="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>
            </div>

            <div className="active-filters" id="active-filters">
              {activeFilterChips.map((chip) => (
                <div key={`${chip.label}-${chip.value}`} className="filter-chip">
                  {chip.label}: {chip.value}
                </div>
              ))}
            </div>

            <div className="results-info" id="players-results-info" style={{ marginBottom: '1rem', color: '#d4d4d4', fontSize: '1.1rem', marginLeft: '8px' }}>
              {resultsCountText}
            </div>

            <div className="players-grid" id="players-grid" style={{ background: 'transparent', minHeight: '60vh' }} onMouseLeave={hidePreview}>
              {visiblePlayers.map((player) => {
                const resolvedPrice = getResolvedPrice(player);
                const hasPrice = resolvedPrice > 0;
                const isWatchlisted = watchedIds.has(player.uniqueId);
                return (
                  <div
                    key={player.uniqueId}
                    className="player-row"
                    data-player-id={player.playerId}
                    data-unique-id={player.uniqueId}
                    data-name={player.name}
                    data-position={player.position}
                    data-league={player.league}
                    data-club={player.club}
                    data-nation={player.nation}
                    data-event={player.event}
                    data-ovr={player.ovr}
                    data-skill={player.skillMoves}
                    data-pac={player.pac}
                    data-sho={player.sho}
                    data-pas={player.pas}
                    data-dri={player.dri}
                    data-def={player.def}
                    data-phy={player.phy}
                    data-price={resolvedPrice}
                    onClick={() => router.push(`/player/${encodeURIComponent(player.playerId)}`)}
                    onMouseMove={(event) => updatePreviewPosition(event, player)}
                  >
                    <div className="player-card-scale">{renderPlayerCard(player)}</div>

                    <div className="player-row-info">
                      <div className="player-info-name">{player.name}</div>
                      <div className="player-info-meta">
                        {player.ovr || 'N/A'} • {player.position || 'N/A'}
                      </div>
                      <div
                        className="player-price"
                        style={{ color: '#fbbf24', fontWeight: 500, fontSize: '0.9rem', marginTop: '4px', minHeight: '20px', display: 'flex', alignItems: 'center' }}
                      >
                        {player.isUntradable ? (
                          <img
                            src="/assets/images/untradable-red-flag.png"
                            alt="Non-auctionable"
                            style={{ height: '18px', width: 'auto', verticalAlign: 'middle', opacity: 0.95, marginLeft: '6px' }}
                            title="Non-auctionable"
                          />
                        ) : (
                          <span className="price-inline">
                            <img src="/assets/images/background/fc coin img.webp" alt="coin" className="price-icon" />
                            <span className="price-text">{hasPrice ? formatPrice(resolvedPrice) : 'No data'}</span>
                          </span>
                        )}
                      </div>
                      {!!player.alternatePositions.length && (
                        <div className="player-info-secondary">
                          {player.alternatePositions.map((position) => (
                            <span key={`${player.uniqueId}-${position}`} className="secondary-position-badge">
                              {position}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="player-row-stats player-card-stats-row">
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.pac)}</div>
                        <div className="stat-pill-label">PAC</div>
                      </div>
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.sho)}</div>
                        <div className="stat-pill-label">SHO</div>
                      </div>
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.pas)}</div>
                        <div className="stat-pill-label">PAS</div>
                      </div>
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.dri)}</div>
                        <div className="stat-pill-label">DRI</div>
                      </div>
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.def)}</div>
                        <div className="stat-pill-label">DEF</div>
                      </div>
                      <div className="stat-pill">
                        <div className="stat-pill-value">{statDisplay(player.phy)}</div>
                        <div className="stat-pill-label">PHY</div>
                      </div>
                    </div>

                    <button
                      className="player-row-watchlist"
                      data-unique-id={player.uniqueId}
                      aria-label={`Toggle watchlist for ${player.name}`}
                      type="button"
                      onClick={(event) => toggleWatchlist(event, player)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isWatchlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="load-more-wrapper">
              <button
                id="load-more-btn"
                className="btn btn-primary load-more-btn"
                style={{ display: hasMorePlayers ? 'block' : 'none' }}
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              >
                Load More Players
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`stats-modal-wrapper${statsModalOpen ? ' open' : ''}`} id="custom-stats-modal">
        <div className="stats-modal-backdrop" id="stats-modal-backdrop" onClick={() => setStatsModalOpen(false)} />
        <div className="stats-modal-container">
          <div className="stats-modal-header">
            <div className="stats-modal-title-group">
              <h2 className="stats-modal-title">Advanced Stats Filter</h2>
            </div>
            <button className="stats-modal-close" id="close-stats-modal" type="button" onClick={() => setStatsModalOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="stats-modal-content">
            <div className="stats-section">
              <div className="section-header">
                <h3 className="section-title">Minimum Stat Thresholds</h3>
              </div>
              <div className="price-tiers-grid">
                {STAT_KEYS.map((key) => (
                  <label key={key} className="price-tier-btn">
                    {key.toUpperCase()}
                    <input
                      id={`stats-filter-${key}`}
                      type="number"
                      min="0"
                      max="200"
                      value={statDraft[key]}
                      onChange={(event) =>
                        setStatDraft((current) => ({
                          ...current,
                          [key]: clamp(toNumber(event.target.value, 0), 0, 200)
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="stats-modal-footer">
            <div className="footer-actions">
              <button
                className="btn-secondary"
                id="reset-stats-filters"
                type="button"
                onClick={() => {
                  setStatDraft(DEFAULT_STAT_FILTERS);
                  setStatFilters(DEFAULT_STAT_FILTERS);
                  setStatsModalOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="btn-primary"
                id="apply-stats-filters"
                type="button"
                onClick={() => {
                  setStatFilters(statDraft);
                  setStatsModalOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`mobile-filter-modal${mobileFilterOpen ? ' active' : ''}`} id="mobile-filter-modal">
        <div className="mobile-filter-backdrop" id="mobile-filter-backdrop" onClick={closeMobileFilters} />
        <div className="mobile-filter-drawer">
          <div className="mobile-filter-header">
            <h3>Filters</h3>
            <button className="mobile-filter-close" id="mobile-filter-close" type="button" onClick={closeMobileFilters}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mobile-filter-content">
            <div className="filter-group">
              <label className="filter-label">Position</label>
              <select
                id="mobile-filter-position"
                className="filter-select"
                value={mobileFilters.position}
                onChange={(event) => setMobileFilters((current) => ({ ...current, position: event.target.value }))}
              >
                <option value="">All Positions</option>
                {positions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                Overall Rating <span id="mobile-rating-value">{`${mobileFilters.ratingMin}-${mobileFilters.ratingMax}`}</span>
              </label>
              <div className="range-inputs">
                <input
                  type="number"
                  id="mobile-rating-min"
                  value={mobileFilters.ratingMin}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) =>
                    setMobileFilters((current) => ({
                      ...current,
                      ratingMin: clamp(toNumber(event.target.value, 40), 40, current.ratingMax)
                    }))
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  id="mobile-rating-max"
                  value={mobileFilters.ratingMax}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) =>
                    setMobileFilters((current) => ({
                      ...current,
                      ratingMax: clamp(toNumber(event.target.value, 150), current.ratingMin, 150)
                    }))
                  }
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Auction Status</label>
              <select
                id="mobile-filter-auctionable"
                className="filter-select"
                value={mobileFilters.auctionable ? 'auctionable' : ''}
                onChange={(event) => setMobileFilters((current) => ({ ...current, auctionable: event.target.value === 'auctionable' }))}
              >
                <option value="">All Players</option>
                <option value="auctionable">Auctionable Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">League</label>
              <select
                id="mobile-filter-league"
                className="filter-select"
                value={mobileFilters.league}
                onChange={(event) => setMobileFilters((current) => ({ ...current, league: event.target.value }))}
              >
                <option value="">All Leagues</option>
                {leagues.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Club</label>
              <select
                id="mobile-filter-team"
                className="filter-select"
                value={mobileFilters.club}
                onChange={(event) => setMobileFilters((current) => ({ ...current, club: event.target.value }))}
              >
                <option value="">All Clubs</option>
                {clubs.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Nation</label>
              <select
                id="mobile-filter-nation"
                className="filter-select"
                value={mobileFilters.nation}
                onChange={(event) => setMobileFilters((current) => ({ ...current, nation: event.target.value }))}
              >
                <option value="">All Nations</option>
                {nations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Event</label>
              <select
                id="mobile-filter-event"
                className="filter-select"
                value={mobileFilters.event}
                onChange={(event) => setMobileFilters((current) => ({ ...current, event: event.target.value }))}
              >
                <option value="">All Events</option>
                {eventOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Skill Moves</label>
              <select
                id="mobile-filter-skill"
                className="filter-select"
                value={mobileFilters.skill}
                onChange={(event) => setMobileFilters((current) => ({ ...current, skill: event.target.value }))}
              >
                <option value="">Any</option>
                {skillMoves.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mobile-filter-footer">
            <button
              className="btn-secondary"
              id="mobile-clear-filters"
              type="button"
              onClick={() => {
                resetAllFilters();
                setMobileFilterOpen(false);
              }}
            >
              Clear All
            </button>
            <button className="btn-primary" id="mobile-apply-filters" type="button" onClick={applyMobileFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div
        id="player-preview-popup"
        style={{
          position: 'fixed',
          zIndex: 1200,
          display: preview.player ? 'block' : 'none',
          pointerEvents: 'none',
          width: '120px',
          left: `${preview.x}px`,
          top: `${preview.y}px`
        }}
      >
        <div id="player-preview-content">{preview.player ? renderPlayerCard(preview.player) : null}</div>
      </div>
    </>
  );
}
