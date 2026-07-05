'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdsenseAd from './AdsenseAd';
import { getPlayerUniqueId } from '../../src/lib/legacy-parity-contract.mjs';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { UNTRADABLE_CARD_BADGE_URL, UNTRADABLE_PRICE_FLAG_URL } from './image-asset-urls';
import { normalizeSearchText } from './search-normalization';

const SEARCH_PAGE_SIZE = 50;
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
const CUSTOM_ATTRIBUTE_KEYS = Object.freeze(
  [...new Set(CUSTOM_STATS.flatMap((entry) => entry.attributeKeys || []))]
);
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
const DEFAULT_QUERY_PARAMS = Object.freeze({
  search: '',
  page: 0,
  ...DEFAULT_FILTERS
});
const SQUAD_BUILDER_PENDING_PICK_KEY = 'squad_builder_pending_pick';
const DEFAULT_SQUAD_PICK_CONTEXT = Object.freeze({
  enabled: false,
  slotId: '',
  benchIndex: null,
  position: '',
  formationId: '',
  returnTo: '/tools/squad-builder'
});

function normalizeSquadPickContext(context) {
  if (!context || typeof context !== 'object') {
    return { ...DEFAULT_SQUAD_PICK_CONTEXT };
  }
  return {
    enabled: context.enabled === true,
    slotId: toText(context.slotId),
    benchIndex: (() => {
      const parsed = Number.parseInt(toText(context.benchIndex), 10);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed >= 7) return null;
      return parsed;
    })(),
    position: toText(context.position).toUpperCase(),
    formationId: toText(context.formationId),
    returnTo: toText(context.returnTo, DEFAULT_SQUAD_PICK_CONTEXT.returnTo)
  };
}

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

function parseIntegerInput(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeRatingInput(value) {
  return String(value ?? '')
    .replace(/[^0-9]/g, '')
    .slice(0, 3);
}

function normalizeRatingRange(minValue, maxValue) {
  const minBound = DEFAULT_FILTERS.ratingMin;
  const maxBound = DEFAULT_FILTERS.ratingMax;
  const boundedMin = clamp(toNumber(minValue, minBound), minBound, maxBound);
  const boundedMax = clamp(toNumber(maxValue, maxBound), minBound, maxBound);
  return {
    ratingMin: Math.min(boundedMin, boundedMax),
    ratingMax: Math.max(boundedMin, boundedMax)
  };
}

function extractFilterParams(queryParams) {
  const normalizedRating = normalizeRatingRange(queryParams?.ratingMin, queryParams?.ratingMax);
  return {
    position: toText(queryParams?.position),
    league: toText(queryParams?.league),
    club: toText(queryParams?.club),
    nation: toText(queryParams?.nation),
    event: toText(queryParams?.event),
    skill: toText(queryParams?.skill),
    ratingMin: normalizedRating.ratingMin,
    ratingMax: normalizedRating.ratingMax,
    auctionable: queryParams?.auctionable === true
  };
}

function buildPlayersQueryParams(queryParams, sortQuery) {
  const filters = extractFilterParams(queryParams);
  const parsedPage = Number.parseInt(String(queryParams?.page ?? 0), 10);
  const safePage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 0;
  const params = new URLSearchParams({
    limit: String(SEARCH_PAGE_SIZE),
    offset: String(safePage),
    rank: '0',
    sort_by: sortQuery.sortBy,
    order: sortQuery.order
  });

  const searchValue = toText(queryParams?.search);
  if (searchValue) params.set('q', searchValue);
  if (filters.position) params.set('position', filters.position);
  if (filters.league) params.set('league', filters.league);
  if (filters.club) params.set('team', filters.club);
  if (filters.nation) params.set('nation', filters.nation);
  if (filters.event) params.set('event', filters.event);
  if (filters.skill) params.set('skill_moves', String(filters.skill));
  if (filters.ratingMin > DEFAULT_FILTERS.ratingMin) params.set('min_ovr', String(filters.ratingMin));
  if (filters.ratingMax < DEFAULT_FILTERS.ratingMax) params.set('max_ovr', String(filters.ratingMax));
  if (filters.auctionable) params.set('is_untradable', '0');
  return params;
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

function toDateTimestamp(value) {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 9999999999 ? value : value * 1000;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
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

function normalizeAttributes(attributes, fallbackSource = null) {
  const normalized = {};
  const sourceAttributes = (() => {
    if (!attributes) return null;
    if (typeof attributes === 'string') {
      try {
        const parsed = JSON.parse(attributes);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    }
    return typeof attributes === 'object' ? attributes : null;
  })();

  if (sourceAttributes) {
    for (const [key, rawValue] of Object.entries(sourceAttributes)) {
      if (rawValue === null || rawValue === '') continue;
      const numeric = Number(rawValue);
      if (Number.isFinite(numeric)) {
        normalized[key] = numeric;
      }
    }
  }

  for (const key of CUSTOM_ATTRIBUTE_KEYS) {
    if (Object.hasOwn(normalized, key)) continue;
    const numeric = Number(fallbackSource?.[key]);
    if (Number.isFinite(numeric)) {
      normalized[key] = numeric;
    }
  }

  return normalized;
}

function extractApiErrorMessage(payload) {
  const detail = payload?.detail;
  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (!entry || typeof entry !== 'object') return '';
        const location = Array.isArray(entry.loc) ? entry.loc.join('.') : '';
        const message = toText(entry.msg);
        if (!message) return '';
        return location ? `${location}: ${message}` : message;
      })
      .filter(Boolean);

    if (messages.length) return messages.join('; ');
  }

  return '';
}

function normalizePlayer(player) {
  const playerId = toText(player?.playerId || player?.player_id || player?.playerid || player?.id);
  const recordId = toText(player?.recordId || player?.record_id || player?.id);
  const attributes = normalizeAttributes(player?.attributes, player);
  const isUntradable =
    player?.isUntradable === true ||
    player?.is_untradable === true ||
    String(player?.is_untradable || '').trim().toLowerCase() === 'true' ||
    String(player?.isuntradable || '').trim() === '1';
  const rawDateAdded = player?.dateAdded || player?.date_added || player?.createdAt || player?.created_at;
  const dateAdded = toText(rawDateAdded);
  const uniqueId = getPlayerUniqueId({
    playerId,
    rank: 0,
    is_untradable: isUntradable
  });
  return {
    playerId,
    recordId,
    uniqueId,
    name: toText(player?.name, 'Unknown Player'),
    ovr: toNumber(player?.ovr || player?.overallrating || player?.rating, 0),
    position: toText(player?.position),
    league: toText(player?.league),
    club: toText(player?.club || player?.team),
    nation: toText(player?.nation || player?.nation_region),
    event: resolvePlayerEvent(player),
    skillMoves: toNumber(player?.skillMoves || player?.skill_moves_stars || player?.skill_moves, 0),
    weakFoot: toNumber(player?.weakFoot || player?.weak_foot_stars, 0),
    heightCm: toNumber(player?.heightCm ?? player?.height_cm, 0),
    weightKg: toNumber(player?.weightKg ?? player?.weight_kg, 0),
    dateAdded,
    dateAddedTimestamp: toDateTimestamp(rawDateAdded),
    isUntradable,
    price: toNumber(player?.price, 0),
    cardBackground: toText(player?.cardBackground || player?.card_background),
    playerImage: toText(player?.playerImage || player?.player_image || player?.image),
    nationFlag: toText(player?.nationFlag || player?.nation_flag),
    clubFlag: toText(player?.clubFlag || player?.club_flag),
    leagueImage: toText(player?.leagueImage || player?.league_image),
    colorName: toText(player?.colorName || player?.color_name, '#FFFFFF') || '#FFFFFF',
    colorRating: toText(player?.colorRating || player?.color_rating, '#FFB86B') || '#FFB86B',
    colorPosition: toText(player?.colorPosition || player?.color_position, '#FFFFFF') || '#FFFFFF',
    alternatePositions: parseAlternatePositions(player?.alternatePosition || player?.alternate_position || player?.alternateposition),
    pac: toNumber(attributes?.pace ?? player?.pace, 0),
    sho: toNumber(attributes?.shooting ?? player?.shooting, 0),
    pas: toNumber(attributes?.passing ?? player?.passing, 0),
    dri: toNumber(attributes?.dribbling_head ?? player?.dribbling_head ?? attributes?.dribbling ?? player?.dribbling, 0),
    def: toNumber(attributes?.defending ?? player?.defending, 0),
    phy: toNumber(attributes?.physical ?? player?.physical, 0),
    attributes,
    searchText: normalizeSearchText(`${player?.name || ''} ${player?.position || ''} ${player?.club || ''} ${player?.league || ''} ${player?.nation || ''}`)
  };
}

function getStoredPlayerUniqueId(player) {
  const stored = toText(player?.unique_id || player?.uniqueId);
  if (stored) return stored;
  const playerId = toText(player?.playerId || player?.player_id || player?.playerid || player?.id);
  const rank = toNumber(player?.rank, 0);
  const untradable = !!(player?.is_untradable || player?.isuntradable === 1 || player?.isUntradable);
  return `${playerId}_${rank}_${untradable ? 1 : 0}`;
}

function buildWatchlistSnapshot(player, resolvedPrice) {
  const recordId = toText(player.recordId || player.record_id || player.id);
  return {
    unique_id: player.uniqueId,
    player_id: player.playerId,
    record_id: recordId || player.playerId,
    playerid: player.playerId,
    id: recordId || player.playerId,
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
    const value = Number(source?.[key] ?? player?.[key]);
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
  const hasPlayerImage = !!player.playerImage;
  return (
    <div className="player-row-card players-db-row-card">
      <div className="player-card-image-placeholder">
        {player.cardBackground ? <img src={player.cardBackground} alt="Card Background" className="player-row-card-bg" /> : null}
        {hasPlayerImage ? (
          <>
            <img src={player.playerImage} alt={player.name} className="player-row-main-img" />
            <span className="player-initials player-initials-hidden">{getInitials(player.name)}</span>
          </>
        ) : (
          <span className="player-initials">{getInitials(player.name)}</span>
        )}



        {player.nationFlag ? (
          <img
            src={player.nationFlag}
            alt="Nation"
            className={`player-card-nation-flag ${playerType === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
          />
        ) : null}
        {player.clubFlag ? (
          <img
            src={player.clubFlag}
            alt="Club"
            className={`player-card-club-flag ${playerType === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
          />
        ) : null}
        {playerType === 'normal' && player.leagueImage ? (
          <img src={player.leagueImage} alt="League" className="player-card-league-watchlist-flag normal-league-watchlist-flag" />
        ) : null}

        {player.isUntradable && (
          <div className="card-untradable-badge card-untradable-badge--players" style={{ pointerEvents: 'none' }}>
            <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" />
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
  events = [],
  skillMoves = [],
  initialSquadPickContext = DEFAULT_SQUAD_PICK_CONTEXT
}) {
  const router = useRouter();
  const [queriedPlayers, setQueriedPlayers] = useState(() => players);
  const [queryParams, setQueryParams] = useState(() => ({ ...DEFAULT_QUERY_PARAMS }));
  const [serverPagination, setServerPagination] = useState({
    total: 0,
    limit: SEARCH_PAGE_SIZE,
    offset: 0,
    hasMore: false
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const normalizedPlayers = useMemo(() => queriedPlayers.map(normalizePlayer).filter((player) => !!player.playerId), [queriedPlayers]);
  const playerByUniqueId = useMemo(() => new Map(normalizedPlayers.map((player) => [player.uniqueId, player])), [normalizedPlayers]);

  const eventOptions = useMemo(
    () => uniqueSorted([...events, ...normalizedPlayers.map((player) => player.event)]),
    [events, normalizedPlayers]
  );
  const filters = useMemo(
    () => extractFilterParams(queryParams),
    [
      queryParams.position,
      queryParams.league,
      queryParams.club,
      queryParams.nation,
      queryParams.event,
      queryParams.skill,
      queryParams.ratingMin,
      queryParams.ratingMax,
      queryParams.auctionable
    ]
  );
  const searchQuery = queryParams.search;
  const searchOffset = queryParams.page;
  const [mobileFilters, setMobileFilters] = useState({ ...DEFAULT_FILTERS });
  const [ratingDraft, setRatingDraft] = useState(() => ({
    ratingMin: String(DEFAULT_FILTERS.ratingMin),
    ratingMax: String(DEFAULT_FILTERS.ratingMax)
  }));
  const [mobileRatingDraft, setMobileRatingDraft] = useState(() => ({
    ratingMin: String(DEFAULT_FILTERS.ratingMin),
    ratingMax: String(DEFAULT_FILTERS.ratingMax)
  }));
  const [sortBy, setSortBy] = useState('latest');
  const setSearchQuery = useCallback((nextSearch) => {
    setQueryParams((current) => {
      const resolved = typeof nextSearch === 'function' ? nextSearch(current.search) : nextSearch;
      const normalized = String(resolved ?? '');
      return current.search === normalized ? current : { ...current, search: normalized };
    });
  }, []);
  const setSearchOffset = useCallback((nextPage) => {
    setQueryParams((current) => {
      const resolved = typeof nextPage === 'function' ? nextPage(current.page) : nextPage;
      const parsed = Number.parseInt(String(resolved ?? 0), 10);
      const normalized = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
      return current.page === normalized ? current : { ...current, page: normalized };
    });
  }, []);
  const setFilters = useCallback((nextFilters) => {
    setQueryParams((current) => {
      const currentFilters = extractFilterParams(current);
      const resolved = typeof nextFilters === 'function' ? nextFilters(currentFilters) : nextFilters;
      if (!resolved || typeof resolved !== 'object') return current;
      const merged = extractFilterParams({ ...currentFilters, ...resolved });
      if (
        currentFilters.position === merged.position &&
        currentFilters.league === merged.league &&
        currentFilters.club === merged.club &&
        currentFilters.nation === merged.nation &&
        currentFilters.event === merged.event &&
        currentFilters.skill === merged.skill &&
        currentFilters.ratingMin === merged.ratingMin &&
        currentFilters.ratingMax === merged.ratingMax &&
        currentFilters.auctionable === merged.auctionable
      ) {
        return current;
      }
      return {
        ...current,
        ...merged
      };
    });
  }, []);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState([]);
  const [statsDraftSelected, setStatsDraftSelected] = useState([]);
  const [statsSearchQuery, setStatsSearchQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistPlayers, setWatchlistPlayers] = useState([]);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const normalizedInitialSquadPickContext = useMemo(
    () => normalizeSquadPickContext(initialSquadPickContext),
    [
      initialSquadPickContext?.enabled,
      initialSquadPickContext?.slotId,
      initialSquadPickContext?.benchIndex,
      initialSquadPickContext?.position,
      initialSquadPickContext?.formationId,
      initialSquadPickContext?.returnTo
    ]
  );
  const [squadPickContext, setSquadPickContext] = useState(() => normalizedInitialSquadPickContext);

  useEffect(() => {
    setSquadPickContext((current) => {
      if (
        current.enabled === normalizedInitialSquadPickContext.enabled &&
        current.slotId === normalizedInitialSquadPickContext.slotId &&
        current.benchIndex === normalizedInitialSquadPickContext.benchIndex &&
        current.position === normalizedInitialSquadPickContext.position &&
        current.formationId === normalizedInitialSquadPickContext.formationId &&
        current.returnTo === normalizedInitialSquadPickContext.returnTo
      ) {
        return current;
      }
      return normalizedInitialSquadPickContext;
    });

    if (!normalizedInitialSquadPickContext.enabled || !normalizedInitialSquadPickContext.position) return;
    setFilters((current) =>
      current.position === normalizedInitialSquadPickContext.position
        ? current
        : { ...current, position: normalizedInitialSquadPickContext.position }
    );
    setMobileFilters((current) =>
      current.position === normalizedInitialSquadPickContext.position
        ? current
        : { ...current, position: normalizedInitialSquadPickContext.position }
    );
  }, [
    normalizedInitialSquadPickContext.enabled,
    normalizedInitialSquadPickContext.slotId,
    normalizedInitialSquadPickContext.benchIndex,
    normalizedInitialSquadPickContext.position,
    normalizedInitialSquadPickContext.formationId,
    normalizedInitialSquadPickContext.returnTo
  ]);

  useEffect(() => {
    const hydrate = () => {
      setWatchlist(readArrayStorage('watchlist').map((entry) => toText(entry)).filter(Boolean));
      setWatchlistPlayers(readArrayStorage('watchlistPlayers'));
      setStorageHydrated(true);
    };
    hydrate();

    window.addEventListener('watchlist-updated', hydrate);
    window.addEventListener('storage', (event) => {
      if (event.key === 'watchlist' || event.key === 'watchlistPlayers') hydrate();
    });
    return () => {
      window.removeEventListener('watchlist-updated', hydrate);
    };
  }, []);

  useEffect(() => {
    setQueriedPlayers(players);
  }, [players]);

  useEffect(() => {
    setRatingDraft({
      ratingMin: String(filters.ratingMin),
      ratingMax: String(filters.ratingMax)
    });
  }, [filters.ratingMin, filters.ratingMax]);

  useEffect(() => {
    setMobileRatingDraft({
      ratingMin: String(mobileFilters.ratingMin),
      ratingMax: String(mobileFilters.ratingMax)
    });
  }, [mobileFilters.ratingMin, mobileFilters.ratingMax]);

  // Combined effect for persisting state to avoid redundant writes and ensure sync
  useEffect(() => {
    if (!storageHydrated) return;
    
    const storedWatchlist = readArrayStorage('watchlist');
    const storedPlayers = readArrayStorage('watchlistPlayers');
    
    // Only write if there's a meaningful change to avoid infinite loops with other components
    const watchlistChanged = JSON.stringify(storedWatchlist) !== JSON.stringify(watchlist);
    const playersChanged = JSON.stringify(storedPlayers) !== JSON.stringify(watchlistPlayers);
    
    if (watchlistChanged || playersChanged) {
      writeArrayStorage('watchlist', watchlist);
      writeArrayStorage('watchlistPlayers', watchlistPlayers);
      window.dispatchEvent(new Event('watchlist-updated'));
    }
  }, [storageHydrated, watchlist, watchlistPlayers]);

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

  const updateDesktopRatingDraft = useCallback((field, rawValue) => {
    const normalized = sanitizeRatingInput(rawValue);
    setRatingDraft((current) => ({
      ...current,
      [field]: normalized
    }));
  }, []);

  const updateMobileRatingDraft = useCallback((field, rawValue) => {
    const normalized = sanitizeRatingInput(rawValue);
    setMobileRatingDraft((current) => ({
      ...current,
      [field]: normalized
    }));
  }, []);

  const commitDesktopRatingDraft = useCallback(() => {
    const normalized = normalizeRatingRange(
      parseIntegerInput(ratingDraft.ratingMin) ?? DEFAULT_FILTERS.ratingMin,
      parseIntegerInput(ratingDraft.ratingMax) ?? DEFAULT_FILTERS.ratingMax
    );
    setFilters((current) => ({
      ...current,
      ratingMin: normalized.ratingMin,
      ratingMax: normalized.ratingMax
    }));
    setRatingDraft({
      ratingMin: String(normalized.ratingMin),
      ratingMax: String(normalized.ratingMax)
    });
  }, [ratingDraft.ratingMax, ratingDraft.ratingMin]);

  const commitMobileRatingDraft = useCallback(() => {
    const normalized = normalizeRatingRange(
      parseIntegerInput(mobileRatingDraft.ratingMin) ?? DEFAULT_FILTERS.ratingMin,
      parseIntegerInput(mobileRatingDraft.ratingMax) ?? DEFAULT_FILTERS.ratingMax
    );
    setMobileFilters((current) => ({
      ...current,
      ratingMin: normalized.ratingMin,
      ratingMax: normalized.ratingMax
    }));
    setMobileRatingDraft({
      ratingMin: String(normalized.ratingMin),
      ratingMax: String(normalized.ratingMax)
    });
  }, [mobileRatingDraft.ratingMax, mobileRatingDraft.ratingMin]);

  const visiblePlayers = useMemo(() => {
    const next = [...normalizedPlayers];
    if (sortBy === 'name') {
      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    }

    if (sortBy === 'price') {
      next.sort((a, b) => getResolvedPrice(b) - getResolvedPrice(a));
      return next;
    }

    if (sortBy === 'rating') {
      next.sort((a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name));
      return next;
    }

    next.sort((a, b) => b.dateAddedTimestamp - a.dateAddedTimestamp || b.ovr - a.ovr || a.name.localeCompare(b.name));
    return next;
  }, [getResolvedPrice, normalizedPlayers, sortBy]);
  const hasPreviousPage = serverPagination.offset > 0;
  const hasNextPage = serverPagination.hasMore;

  const sortQuery = useMemo(() => {
    return { sortBy: 'ovr', order: 'desc' };
  }, []);
  const searchRequestParams = useMemo(
    () => buildPlayersQueryParams(queryParams, sortQuery),
    [
      queryParams.search,
      queryParams.page,
      queryParams.position,
      queryParams.league,
      queryParams.club,
      queryParams.nation,
      queryParams.event,
      queryParams.skill,
      queryParams.ratingMin,
      queryParams.ratingMax,
      queryParams.auctionable,
      sortQuery.order,
      sortQuery.sortBy
    ]
  );

  useEffect(() => {
    setSearchOffset(0);
  }, [
    queryParams.search,
    sortBy,
    queryParams.auctionable,
    queryParams.position,
    queryParams.league,
    queryParams.club,
    queryParams.nation,
    queryParams.event,
    queryParams.skill,
    queryParams.ratingMin,
    queryParams.ratingMax
  ]);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams(searchRequestParams);
      const requestOffset = Number.parseInt(params.get('offset') || '0', 10) || 0;

      setIsSearching(true);
      setSearchError('');
      try {
        const response = await fetch(`/internal-api/players/search?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) {
          const message = extractApiErrorMessage(payload);
          throw new Error(message || `Player search failed (${response.status})`);
        }

        const rows = Array.isArray(payload?.players)
          ? payload.players
          : Array.isArray(payload?.results)
            ? payload.results
            : [];
        const pagination = payload?.pagination && typeof payload.pagination === 'object'
          ? payload.pagination
          : {
              total: toNumber(payload?.total, rows.length),
              limit: SEARCH_PAGE_SIZE,
              offset: requestOffset,
              has_more: payload?.has_more === true
            };

        if (disposed) return;
        setLivePrices({});
        setQueriedPlayers(rows);
        setServerPagination({
          total: toNumber(pagination.total, rows.length),
          limit: toNumber(pagination.limit, SEARCH_PAGE_SIZE),
          offset: toNumber(pagination.offset, requestOffset),
          hasMore: pagination.has_more === true
        });
      } catch (error) {
        if (error?.name === 'AbortError') return;
        if (disposed) return;
        setQueriedPlayers([]);
        setServerPagination({
          total: 0,
          limit: SEARCH_PAGE_SIZE,
          offset: requestOffset,
          hasMore: false
        });
        setSearchError(error instanceof Error ? error.message : 'Player search request failed');
      } finally {
        if (disposed) return;
        setIsSearching(false);
      }
    }, 350);

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      try { controller.abort(); } catch (e) {}
    };
  }, [searchRequestParams]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.position) chips.push({ key: 'position', label: 'Position', value: filters.position.toUpperCase() });
    if (filters.league) chips.push({ key: 'league', label: 'League', value: filters.league });
    if (filters.club) chips.push({ key: 'club', label: 'Club', value: filters.club });
    if (filters.nation) chips.push({ key: 'nation', label: 'Nation', value: filters.nation });
    if (filters.event) chips.push({ key: 'event', label: 'Event', value: filters.event });
    if (filters.skill) chips.push({ key: 'skill', label: 'Skill', value: `${filters.skill}★` });
    if (filters.auctionable) chips.push({ key: 'auctionable', label: 'Auction', value: 'Only With Prices' });
    if (filters.ratingMin !== 40 || filters.ratingMax !== 150) chips.push({ key: 'ovr', label: 'OVR', value: `${filters.ratingMin}-${filters.ratingMax}` });
    if (selectedStats.length) chips.push({ key: 'stats', label: 'Stats', value: `${selectedStats.length} selected` });
    return chips;
  }, [filters, selectedStats.length]);

  const removeFilterChip = useCallback((chipKey) => {
    if (chipKey === 'stats') {
      setSelectedStats([]);
      setStatsDraftSelected([]);
      return;
    }

    if (chipKey === 'ovr') {
      setFilters((current) => ({ ...current, ratingMin: DEFAULT_FILTERS.ratingMin, ratingMax: DEFAULT_FILTERS.ratingMax }));
      setMobileFilters((current) => ({ ...current, ratingMin: DEFAULT_FILTERS.ratingMin, ratingMax: DEFAULT_FILTERS.ratingMax }));
      setRatingDraft({
        ratingMin: String(DEFAULT_FILTERS.ratingMin),
        ratingMax: String(DEFAULT_FILTERS.ratingMax)
      });
      setMobileRatingDraft({
        ratingMin: String(DEFAULT_FILTERS.ratingMin),
        ratingMax: String(DEFAULT_FILTERS.ratingMax)
      });
      return;
    }

    if (chipKey === 'auctionable') {
      setFilters((current) => ({ ...current, auctionable: false }));
      setMobileFilters((current) => ({ ...current, auctionable: false }));
      return;
    }

    if (chipKey === 'position' || chipKey === 'league' || chipKey === 'club' || chipKey === 'nation' || chipKey === 'event' || chipKey === 'skill') {
      setFilters((current) => ({ ...current, [chipKey]: '' }));
      setMobileFilters((current) => ({ ...current, [chipKey]: '' }));
    }
  }, []);

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
    setSortBy('latest');
    setQueryParams({ ...DEFAULT_QUERY_PARAMS });
    setMobileFilters({ ...DEFAULT_FILTERS });
    setRatingDraft({
      ratingMin: String(DEFAULT_FILTERS.ratingMin),
      ratingMax: String(DEFAULT_FILTERS.ratingMax)
    });
    setMobileRatingDraft({
      ratingMin: String(DEFAULT_FILTERS.ratingMin),
      ratingMax: String(DEFAULT_FILTERS.ratingMax)
    });
  };

  const toggleWatchlist = (event, player) => {
    event.preventDefault();
    event.stopPropagation();
    const uniqueId = player.uniqueId;
    const resolvedPrice = getResolvedPrice(player);

    if (watchedIds.has(uniqueId)) {
      setWatchlist((prev) => prev.filter((entry) => entry !== uniqueId));
      setWatchlistPlayers((prev) => prev.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId));
    } else {
      setWatchlist((prev) => [...new Set([...prev, uniqueId])]);
      setWatchlistPlayers((prev) => [
        ...prev.filter((entry) => getStoredPlayerUniqueId(entry) !== uniqueId),
        buildWatchlistSnapshot(player, resolvedPrice)
      ]);
    }
  };


  const openMobileFilters = () => {
    setMobileFilters({ ...filters });
    setMobileRatingDraft({
      ratingMin: String(filters.ratingMin),
      ratingMax: String(filters.ratingMax)
    });
    setMobileFilterOpen(true);
  };

  const applyMobileFilters = () => {
    const normalizedRating = normalizeRatingRange(
      parseIntegerInput(mobileRatingDraft.ratingMin) ?? DEFAULT_FILTERS.ratingMin,
      parseIntegerInput(mobileRatingDraft.ratingMax) ?? DEFAULT_FILTERS.ratingMax
    );
    const nextMobileFilters = {
      ...mobileFilters,
      ratingMin: normalizedRating.ratingMin,
      ratingMax: normalizedRating.ratingMax
    };
    setMobileFilters(nextMobileFilters);
    setFilters((current) => ({
      ...current,
      ...nextMobileFilters,
      ratingMin: normalizedRating.ratingMin,
      ratingMax: normalizedRating.ratingMax
    }));
    setMobileRatingDraft({
      ratingMin: String(normalizedRating.ratingMin),
      ratingMax: String(normalizedRating.ratingMax)
    });
    setMobileFilterOpen(false);
  };

  const handlePlayerRowClick = (player) => {
    if (!player?.playerId) return;
    if (squadPickContext.enabled) {
      try {
        window.sessionStorage.setItem(
          SQUAD_BUILDER_PENDING_PICK_KEY,
          JSON.stringify({
              playerId: player.playerId,
              slotId: squadPickContext.slotId,
              benchIndex: squadPickContext.benchIndex,
              position: squadPickContext.position,
              formationId: squadPickContext.formationId,
            player: {
              playerId: player.playerId,
              name: player.name,
              ovr: player.ovr,
              position: player.position,
              alternatePosition: player.alternatePositions.join(','),
              nation: player.nation,
              club: player.club,
              league: player.league,
              cardBackground: player.cardBackground,
              playerImage: player.playerImage,
              nationFlag: player.nationFlag,
              clubFlag: player.clubFlag,
              leagueImage: player.leagueImage,
              colorRating: player.colorRating,
              colorPosition: player.colorPosition,
              colorName: player.colorName,
              skillMoves: player.skillMoves,
              isUntradable: player.isUntradable,
              attributes: player.attributes,
              price: player.price
            }
          })
        );
      } catch (error) {
        console.error('[players] Failed to persist squad picker selection:', error);
      }
      router.push(squadPickContext.returnTo || '/tools/squad-builder');
      return;
    }
    router.push(buildPlayerPath(player));
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

  const resultStart = serverPagination.total > 0 ? serverPagination.offset + 1 : 0;
  const resultEnd = serverPagination.total > 0
    ? Math.min(serverPagination.offset + visiblePlayers.length, serverPagination.total)
    : 0;
  const resultsCountText = isSearching
    ? 'Searching players...'
    : `${resultStart}-${resultEnd} of ${serverPagination.total} players`;

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
                Overall Rating:{' '}
                <span id="rating-value">
                  {`${clamp(toNumber(ratingDraft.ratingMin, DEFAULT_FILTERS.ratingMin), DEFAULT_FILTERS.ratingMin, DEFAULT_FILTERS.ratingMax)}-${clamp(
                    toNumber(ratingDraft.ratingMax, DEFAULT_FILTERS.ratingMax),
                    DEFAULT_FILTERS.ratingMin,
                    DEFAULT_FILTERS.ratingMax
                  )}`}
                </span>
              </label>
              <div className="range-inputs">
                <input
                  type="number"
                  id="rating-min"
                  value={ratingDraft.ratingMin}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) => updateDesktopRatingDraft('ratingMin', event.target.value)}
                  onBlur={commitDesktopRatingDraft}
                />
                <span>-</span>
                <input
                  type="number"
                  id="rating-max"
                  value={ratingDraft.ratingMax}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) => updateDesktopRatingDraft('ratingMax', event.target.value)}
                  onBlur={commitDesktopRatingDraft}
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
                <option value="">Any Skill Moves</option>
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
                  <option value="latest">Sort by Latest</option>
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>
            </div>

            <div className="active-filters" id="active-filters">
              {activeFilterChips.map((chip) => (
                <div
                  key={chip.key}
                  className="filter-chip filter-chip--removable"
                  role="button"
                  tabIndex={0}
                  onClick={() => removeFilterChip(chip.key)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      removeFilterChip(chip.key);
                    }
                  }}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <span>
                    {chip.label}: {chip.value}
                  </span>
                  <button
                    type="button"
                    className="filter-chip-remove-btn"
                    aria-label={`Remove ${chip.label} filter`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFilterChip(chip.key);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="results-info" id="players-results-info" style={{ marginBottom: '1rem', color: '#d4d4d4', fontSize: '1.1rem', marginLeft: '8px' }}>
              {resultsCountText}
            </div>
            {searchError ? (
              <div style={{ margin: '0 8px 16px', color: '#ff8f8f', fontSize: '0.95rem' }}>
                {searchError}
              </div>
            ) : null}
            {!isSearching && !searchError && !visiblePlayers.length ? (
              <div style={{ margin: '0 8px 16px', color: 'var(--color-text-muted, #98A0A6)', fontSize: '0.95rem' }}>
                No players matched your filters.
              </div>
            ) : null}

            <div className="players-grid players-grid--database" id="players-grid" style={{ background: 'transparent', minHeight: '60vh' }}>
              {visiblePlayers.map((player, index) => {
                const resolvedPrice = getResolvedPrice(player);
                const hasPrice = resolvedPrice > 0;
                const isWatchlisted = watchedIds.has(player.uniqueId);
                return (
                  <React.Fragment key={player.uniqueId}>
                    <div
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
                      onClick={() => handlePlayerRowClick(player)}
                    >
                      {renderPlayerCard(player)}

                      <div className="player-row-info">
                        <div className="player-row-info-desktop">
                          <div className="player-info-name">{player.name}</div>
                          <div className="player-info-meta">
                            {player.ovr || 'N/A'} • {player.position || 'N/A'}
                          </div>
                        </div>
                        <div className="player-price player-row-price">
                          {player.isUntradable ? (
                            <img
                              src={UNTRADABLE_PRICE_FLAG_URL}
                              alt="Non-auctionable"
                              className="player-row-tradability-icon"
                              title="Non-auctionable"
                            />
                          ) : (
                            <span className="price-inline player-row-price-inline">
                              <img src="/assets/images/background/fc coin img.webp" alt="coin" className="price-icon" />
                              <span className="price-text">{hasPrice ? formatPrice(resolvedPrice) : 'No data'}</span>
                            </span>
                          )}
                        </div>
                        {!!player.alternatePositions.length && (
                          <div className="player-info-secondary player-info-secondary--desktop">
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
                    {(index + 1) % 15 === 0 && (
                      <div 
                        className="player-row adsense-row" 
                        style={{ 
                          minHeight: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: 'rgba(20,24,28,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          padding: '12px',
                          cursor: 'default',
                          gridColumn: '1 / -1'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AdsenseAd 
                          slot="1523077644" 
                          format="fluid" 
                          layoutKey="-fb+5w+4e-db+86" 
                          style={{ margin: '0', minHeight: '100px', width: '100%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="load-more-wrapper">
              <button
                id="load-more-btn"
                className="btn btn-primary load-more-btn"
                style={{ display: 'inline-block', marginRight: '10px', opacity: hasPreviousPage && !isSearching ? 1 : 0.6 }}
                type="button"
                disabled={!hasPreviousPage || isSearching}
                onClick={() => setSearchOffset((current) => Math.max(0, current - serverPagination.limit))}
              >
                Previous
              </button>
              <button
                id="load-more-next-btn"
                className="btn btn-primary load-more-btn"
                style={{ display: 'inline-block', opacity: hasNextPage && !isSearching ? 1 : 0.6 }}
                type="button"
                disabled={!hasNextPage || isSearching}
                onClick={() => setSearchOffset((current) => current + serverPagination.limit)}
              >
                Next
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
                Overall Rating{' '}
                <span id="mobile-rating-value">
                  {`${clamp(toNumber(mobileRatingDraft.ratingMin, DEFAULT_FILTERS.ratingMin), DEFAULT_FILTERS.ratingMin, DEFAULT_FILTERS.ratingMax)}-${clamp(
                    toNumber(mobileRatingDraft.ratingMax, DEFAULT_FILTERS.ratingMax),
                    DEFAULT_FILTERS.ratingMin,
                    DEFAULT_FILTERS.ratingMax
                  )}`}
                </span>
              </label>
              <div className="range-inputs">
                <input
                  type="number"
                  id="mobile-rating-min"
                  value={mobileRatingDraft.ratingMin}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) => updateMobileRatingDraft('ratingMin', event.target.value)}
                  onBlur={commitMobileRatingDraft}
                />
                <span>-</span>
                <input
                  type="number"
                  id="mobile-rating-max"
                  value={mobileRatingDraft.ratingMax}
                  min="40"
                  max="150"
                  className="range-input"
                  onChange={(event) => updateMobileRatingDraft('ratingMax', event.target.value)}
                  onBlur={commitMobileRatingDraft}
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
                <option value="">Any Skill Moves</option>
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
