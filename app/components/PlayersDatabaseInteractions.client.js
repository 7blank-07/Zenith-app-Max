'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPlayerUniqueId } from '../../src/lib/legacy-parity-contract.mjs';
import { normalizeSearchText } from './search-normalization';

const PAGE_SIZE = 70;
const BASE_ROW_STATS = Object.freeze([
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' }
]);
const STAT_CATEGORY_ORDER = Object.freeze(['Offense', 'Defense', 'Physical', 'Goalkeeper', 'Other']);
const CUSTOM_STATS = Object.freeze([
  { id: 'acceleration', label: 'Acceleration', pillLabel: 'ACC', category: 'Offense', attributeKeys: ['acceleration'] },
  { id: 'agility', label: 'Agility', pillLabel: 'AGI', category: 'Offense', attributeKeys: ['agility'] },
  { id: 'ballControl', label: 'Ball Control', pillLabel: 'BLC', category: 'Offense', attributeKeys: ['ballControl', 'ball_control'] },
  { id: 'crossing', label: 'Crossing', pillLabel: 'CRS', category: 'Offense', attributeKeys: ['crossing'] },
  { id: 'curve', label: 'Curve', pillLabel: 'CRV', category: 'Offense', attributeKeys: ['curve'] },
  { id: 'dribbling', label: 'Dribbling', pillLabel: 'DRI', category: 'Offense', attributeKeys: ['dribbling'] },
  { id: 'finishing', label: 'Finishing', pillLabel: 'FIN', category: 'Offense', attributeKeys: ['finishing'] },
  { id: 'freeKick', label: 'Free Kick', pillLabel: 'FK', category: 'Offense', attributeKeys: ['freeKick', 'free_kick'] },
  { id: 'longPassing', label: 'Long Passing', pillLabel: 'LPA', category: 'Offense', attributeKeys: ['longPassing', 'long_passing'] },
  { id: 'longShot', label: 'Long Shot', pillLabel: 'LSH', category: 'Offense', attributeKeys: ['longShot', 'long_shot'] },
  { id: 'penalties', label: 'Penalties', pillLabel: 'PEN', category: 'Offense', attributeKeys: ['penalties'] },
  { id: 'shortPassing', label: 'Short Passing', pillLabel: 'SPA', category: 'Offense', attributeKeys: ['shortPassing', 'short_passing'] },
  { id: 'shotPower', label: 'Shot Power', pillLabel: 'SPO', category: 'Offense', attributeKeys: ['shotPower', 'shot_power'] },
  { id: 'sprintSpeed', label: 'Sprint Speed', pillLabel: 'SPR', category: 'Offense', attributeKeys: ['sprintSpeed', 'sprint_speed'] },
  { id: 'vision', label: 'Vision', pillLabel: 'VIS', category: 'Offense', attributeKeys: ['vision'] },
  { id: 'volley', label: 'Volley', pillLabel: 'VOL', category: 'Offense', attributeKeys: ['volley'] },
  { id: 'aggression', label: 'Aggression', pillLabel: 'AGR', category: 'Defense', attributeKeys: ['aggression'] },
  { id: 'awareness', label: 'Awareness', pillLabel: 'AWR', category: 'Defense', attributeKeys: ['awareness'] },
  { id: 'heading', label: 'Heading', pillLabel: 'HEA', category: 'Defense', attributeKeys: ['heading'] },
  { id: 'marking', label: 'Marking', pillLabel: 'MRK', category: 'Defense', attributeKeys: ['marking'] },
  { id: 'positioning', label: 'Positioning', pillLabel: 'POS', category: 'Defense', attributeKeys: ['positioning'] },
  { id: 'reactions', label: 'Reactions', pillLabel: 'REA', category: 'Defense', attributeKeys: ['reactions'] },
  { id: 'slidingTackle', label: 'Sliding Tackle', pillLabel: 'SLT', category: 'Defense', attributeKeys: ['slidingTackle', 'sliding_tackle'] },
  { id: 'standingTackle', label: 'Standing Tackle', pillLabel: 'STT', category: 'Defense', attributeKeys: ['standingTackle', 'standing_tackle'] },
  { id: 'balance', label: 'Balance', pillLabel: 'BAL', category: 'Physical', attributeKeys: ['balance'] },
  { id: 'jumping', label: 'Jumping', pillLabel: 'JMP', category: 'Physical', attributeKeys: ['jumping'] },
  { id: 'stamina', label: 'Stamina', pillLabel: 'STA', category: 'Physical', attributeKeys: ['stamina', 'stamina_stat'] },
  { id: 'strength', label: 'Strength', pillLabel: 'STR', category: 'Physical', attributeKeys: ['strength'] },
  { id: 'gkDiving', label: 'GK Diving', pillLabel: 'GKD', category: 'Goalkeeper', attributeKeys: ['gkDiving', 'gk_diving', 'goalkeeperDiving'] },
  { id: 'gkHandling', label: 'GK Handling', pillLabel: 'GKH', category: 'Goalkeeper', attributeKeys: ['gkHandling', 'gk_handling', 'goalkeeperHandling'] },
  { id: 'gkKicking', label: 'GK Kicking', pillLabel: 'GKK', category: 'Goalkeeper', attributeKeys: ['gkKicking', 'gk_kicking', 'goalkeeperKicking'] },
  { id: 'gkPositioning', label: 'GK Positioning', pillLabel: 'GKP', category: 'Goalkeeper', attributeKeys: ['gkPositioning', 'gk_positioning', 'goalkeeperPositioning'] },
  { id: 'gkReflexes', label: 'GK Reflexes', pillLabel: 'GKR', category: 'Goalkeeper', attributeKeys: ['gkReflexes', 'gk_reflexes', 'goalkeeperReflexes'] },
  { id: 'dateAdded', label: 'Date Added', pillLabel: 'DATE', category: 'Other', valueType: 'dateAdded' },
  { id: 'overall', label: 'Overall', pillLabel: 'OVR', category: 'Other', valueType: 'overall' },
  { id: 'skillMoves', label: 'Skill Moves', pillLabel: 'SKL', category: 'Other', valueType: 'skillMoves' },
  { id: 'weakFoot', label: 'Weak Foot', pillLabel: 'WF', category: 'Other', valueType: 'weakFoot' },
  { id: 'height', label: 'Height', pillLabel: 'HGT', category: 'Other', valueType: 'height' },
  { id: 'weight', label: 'Weight', pillLabel: 'WGT', category: 'Other', valueType: 'weight' },
  { id: 'totalStats', label: 'Total Stats', pillLabel: 'TOT', category: 'Other', valueType: 'totalStats' }
]);
const CUSTOM_STATS_BY_ID = new Map(CUSTOM_STATS.map((entry) => [entry.id, entry]));
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

function toFileName(value) {
  const text = toText(value);
  if (!text) return '';
  const segments = text.split('/');
  return toText(segments[segments.length - 1]);
}

function normalizeEventCode(value) {
  return toText(value)
    .replace(/\.(png|webp|jpg|jpeg)$/i, '')
    .replace(/_NAME\d+$/i, '')
    .replace(/_STATIC$/i, '')
    .replace(/_LIVEHIGH$/i, '_LIVE')
    .replace(/_BASELIVE$/i, '_LIVE')
    .replace(/^\d+_[A-Z]_/, '');
}

function extractEventCodeFromPlayerImage(imageUrl) {
  const fileName = toFileName(imageUrl);
  if (!fileName) return '';
  const segments = fileName.split('_');
  if (segments[0]?.toLowerCase() !== 'player' || segments.length < 5) return '';
  return normalizeEventCode(segments.slice(3, -1).join('_'));
}

function extractEventCodeFromCardBackground(cardBackgroundUrl) {
  const fileName = toFileName(cardBackgroundUrl);
  if (!fileName) return '';
  const match = fileName.match(/^bg_\d+_[A-Z]_(.+)$/i);
  return match ? normalizeEventCode(match[1]) : '';
}

function formatEventLabel(eventCode) {
  return toText(eventCode).replaceAll('_', ' ').replace(/\s+/g, ' ').trim();
}

function resolvePlayerEvent(player) {
  const explicit = toText(
    player?.event ||
      player?.eventName ||
      player?.event_name ||
      player?.eventname ||
      player?.program ||
      player?.programName ||
      player?.program_name
  );
  if (explicit) return explicit;
  const imageCode = extractEventCodeFromPlayerImage(player?.playerImage || player?.image);
  if (imageCode) return formatEventLabel(imageCode);
  const cardBackgroundCode = extractEventCodeFromCardBackground(player?.cardBackground);
  if (cardBackgroundCode) return formatEventLabel(cardBackgroundCode);
  return '';
}

function formatPrice(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return 'No data';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${Math.round(safe / 1000)}K`;
  return String(Math.round(safe));
}

function formatStatValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '-';
  return numeric > 0 ? Math.round(numeric) : '-';
}

function formatDate(value) {
  const text = toText(value);
  if (!text) return '-';
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return text;
  return new Date(parsed).toLocaleDateString();
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

function normalizeAttributes(attributes) {
  if (!attributes || typeof attributes !== 'object') return {};
  return attributes;
}

function normalizePlayer(player) {
  const playerId = toText(player?.playerId);
  const attributes = normalizeAttributes(player?.attributes);
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
    event: resolvePlayerEvent(player),
    skillMoves: toNumber(player?.skillMoves, 0),
    weakFoot: toNumber(player?.weakFoot, 0),
    heightCm: toNumber(player?.heightCm, 0),
    weightKg: toNumber(player?.weightKg, 0),
    dateAdded: toText(player?.dateAdded || player?.date_added || player?.createdAt || player?.created_at),
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
    pac: toNumber(attributes?.pace, 0),
    sho: toNumber(attributes?.shooting, 0),
    pas: toNumber(attributes?.passing, 0),
    dri: toNumber(attributes?.dribbling, 0),
    def: toNumber(attributes?.defending, 0),
    phy: toNumber(attributes?.physical, 0),
    attributes,
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
    event_name: player.event,
    eventName: player.event,
    eventname: player.event,
    ovr: player.ovr,
    overallrating: player.ovr,
    rating: player.ovr,
    rank: 0,
    is_untradable: player.isUntradable,
    isuntradable: player.isUntradable ? 1 : 0,
    skill_moves: player.skillMoves,
    skillmoves: player.skillMoves,
    weak_foot_stars: player.weakFoot,
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

function readAttributeValue(player, keys) {
  const source = player?.attributes || {};
  for (const key of keys || []) {
    const value = Number(source?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return Number.NaN;
}

function getCustomStatValue(player, statDefinition) {
  if (!statDefinition) return '-';
  if (statDefinition.attributeKeys) {
    return formatStatValue(readAttributeValue(player, statDefinition.attributeKeys));
  }
  switch (statDefinition.valueType) {
    case 'dateAdded':
      return formatDate(player.dateAdded);
    case 'overall':
      return formatStatValue(player.ovr);
    case 'skillMoves':
      return formatStatValue(player.skillMoves);
    case 'weakFoot':
      return formatStatValue(player.weakFoot);
    case 'height':
      return player.heightCm > 0 ? `${Math.round(player.heightCm)}cm` : '-';
    case 'weight':
      return player.weightKg > 0 ? `${Math.round(player.weightKg)}kg` : '-';
    case 'totalStats': {
      const total = Object.values(player.attributes || {}).reduce((sum, value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? sum + numeric : sum;
      }, 0);
      return total > 0 ? Math.round(total) : '-';
    }
    default:
      return '-';
  }
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
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [mobileFilters, setMobileFilters] = useState({ ...DEFAULT_FILTERS });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState([]);
  const [statsDraftSelected, setStatsDraftSelected] = useState([]);
  const [statsSearchQuery, setStatsSearchQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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

  const getResolvedPrice = useCallback(
    (player) => {
      const livePrice = toNumber(livePrices[player.playerId], 0);
      if (livePrice > 0) return livePrice;
      const fallbackPrice = toNumber(player.price, 0);
      return fallbackPrice > 0 ? fallbackPrice : 0;
    },
    [livePrices]
  );

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
  }, [getResolvedPrice, playerByUniqueId, watchlistPlayers.length, watchedIds]);

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
      return !(player.ovr < filters.ratingMin || player.ovr > filters.ratingMax);
    });

    next.sort((left, right) => {
      if (sortBy === 'rating') return right.ovr - left.ovr;
      if (sortBy === 'price') return getResolvedPrice(right) - getResolvedPrice(left);
      return normalizeSearchText(left.name).localeCompare(normalizeSearchText(right.name));
    });

    return next;
  }, [filters, getResolvedPrice, normalizedPlayers, normalizedSearchQuery, sortBy]);

  const visiblePlayers = useMemo(() => filteredPlayers.slice(0, visibleCount), [filteredPlayers, visibleCount]);
  const hasMorePlayers = visibleCount < filteredPlayers.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, normalizedSearchQuery, sortBy]);

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
    if (selectedStats.length) chips.push({ label: 'Stats', value: `${selectedStats.length} selected` });
    return chips;
  }, [filters, selectedStats.length]);

  const selectedStatDefinitions = useMemo(
    () => selectedStats.map((statId) => CUSTOM_STATS_BY_ID.get(statId)).filter(Boolean),
    [selectedStats]
  );
  const allCustomStatIds = useMemo(() => CUSTOM_STATS.map((stat) => stat.id), []);
  const allStatsSelected = statsDraftSelected.length === allCustomStatIds.length && allCustomStatIds.length > 0;
  const filteredModalStats = useMemo(() => {
    const query = normalizeSearchText(statsSearchQuery);
    if (!query) return CUSTOM_STATS;
    return CUSTOM_STATS.filter((stat) => normalizeSearchText(`${stat.label} ${stat.category}`).includes(query));
  }, [statsSearchQuery]);
  const modalStatsByCategory = useMemo(() => {
    const grouped = new Map(STAT_CATEGORY_ORDER.map((category) => [category, []]));
    filteredModalStats.forEach((stat) => {
      grouped.get(stat.category)?.push(stat);
    });
    return grouped;
  }, [filteredModalStats]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilters({ ...DEFAULT_FILTERS });
    setMobileFilters({ ...DEFAULT_FILTERS });
  };

  const persistWatchlistState = useCallback((nextWatchlist, nextWatchlistPlayers) => {
    writeArrayStorage('watchlist', nextWatchlist);
    writeArrayStorage('watchlistPlayers', nextWatchlistPlayers);
    window.dispatchEvent(new Event('watchlist-updated'));
  }, []);

  const toggleWatchlist = (event, player) => {
    event.preventDefault();
    event.stopPropagation();
    const uniqueId = player.uniqueId;
    const resolvedPrice = getResolvedPrice(player);

    if (watchedIds.has(uniqueId)) {
      const nextWatchlist = watchlist.filter((entry) => entry !== uniqueId);
      const nextWatchlistPlayers = watchlistPlayers.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId);
      setWatchlist(nextWatchlist);
      setWatchlistPlayers(nextWatchlistPlayers);
      persistWatchlistState(nextWatchlist, nextWatchlistPlayers);
      return;
    }

    const nextWatchlist = [...new Set([...watchlist, uniqueId])];
    const nextWatchlistPlayers = [
      ...watchlistPlayers.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId),
      buildWatchlistSnapshot(player, resolvedPrice)
    ];
    setWatchlist(nextWatchlist);
    setWatchlistPlayers(nextWatchlistPlayers);
    persistWatchlistState(nextWatchlist, nextWatchlistPlayers);
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

  const openStatsModal = () => {
    setStatsDraftSelected(selectedStats);
    setStatsSearchQuery('');
    setStatsModalOpen(true);
  };

  const toggleDraftStat = (statId) => {
    setStatsDraftSelected((current) =>
      current.includes(statId) ? current.filter((entry) => entry !== statId) : [...current, statId]
    );
  };

  const toggleSelectAllStats = () => {
    setStatsDraftSelected((current) => (current.length === allCustomStatIds.length ? [] : allCustomStatIds));
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
                <button id="open-stats-modal" className="stats-btn" type="button" onClick={openStatsModal}>
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

            <div className="players-grid" id="players-grid" style={{ background: 'transparent', minHeight: '60vh' }}>
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
                      {BASE_ROW_STATS.map((stat) => (
                        <div key={`${player.uniqueId}-${stat.key}`} className="stat-pill">
                          <div className="stat-pill-value">{formatStatValue(player[stat.key])}</div>
                          <div className="stat-pill-label">{stat.label}</div>
                        </div>
                      ))}
                      {selectedStatDefinitions.map((statDefinition) => (
                        <div key={`${player.uniqueId}-${statDefinition.id}`} className="stat-pill">
                          <div className="stat-pill-value">{getCustomStatValue(player, statDefinition)}</div>
                          <div className="stat-pill-label">{statDefinition.pillLabel || statDefinition.label}</div>
                        </div>
                      ))}
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
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title">Select table stats</h3>
                <span id="selected-stats-count">{statsDraftSelected.length} selected</span>
              </div>
              <div className="search-container" style={{ marginBottom: '12px' }}>
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  id="stats-search-input"
                  type="text"
                  className="search-input"
                  placeholder="Search stats..."
                  value={statsSearchQuery}
                  onChange={(event) => setStatsSearchQuery(event.target.value)}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <button className="btn-secondary" id="select-all-stats" type="button" onClick={toggleSelectAllStats}>
                  {allStatsSelected ? 'Clear All' : 'Select All'}
                </button>
              </div>
              {STAT_CATEGORY_ORDER.map((category) => {
                const entries = modalStatsByCategory.get(category) || [];
                if (!entries.length) return null;
                return (
                  <div key={category} className="stats-section" style={{ marginBottom: '12px' }}>
                    <div className="section-header">
                      <h3 className="section-title">{category}</h3>
                    </div>
                    <div className="price-tiers-grid">
                      {entries.map((stat) => (
                        <label key={stat.id} className="price-tier-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            id={`stats-filter-${stat.id}`}
                            type="checkbox"
                            checked={statsDraftSelected.includes(stat.id)}
                            onChange={() => toggleDraftStat(stat.id)}
                          />
                          <span>{stat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stats-modal-footer">
            <div className="footer-actions">
              <button
                className="btn-secondary"
                id="reset-stats-filters"
                type="button"
                onClick={() => {
                  setStatsDraftSelected([]);
                  setSelectedStats([]);
                }}
              >
                Reset
              </button>
              <button
                className="btn-primary"
                id="apply-stats-filters"
                type="button"
                onClick={() => {
                  setSelectedStats(statsDraftSelected);
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

    </>
  );
}
