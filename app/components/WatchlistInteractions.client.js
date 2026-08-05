'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { UNTRADABLE_CARD_BADGE_URL, UNTRADABLE_PRICE_FLAG_URL } from './image-asset-urls';
import { normalizeSearchText } from './search-normalization';

function toNumber(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value) {
  return String(value ?? '').trim();
}

function toLowerText(value) {
  return normalizeSearchText(value);
}

function readAttributeStatValue(player, key, fallbackKey) {
  const attributes = player?.attributes && typeof player.attributes === 'object' ? player.attributes : {};
  const value = attributes?.[key] ?? player?.[key] ?? attributes?.[fallbackKey] ?? player?.[fallbackKey];
  return toNumber(value, 0);
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

function resolveWatchlistEvent(player) {
  const explicit = toText(
    player?.event ||
      player?.event_name ||
      player?.eventName ||
      player?.eventname ||
      player?.program ||
      player?.programName ||
      player?.program_name
  );
  if (explicit) return explicit;
  const imageCode = extractEventCodeFromPlayerImage(player?.player_image || player?.playerimage || player?.playerImage || player?.image);
  if (imageCode) return formatEventLabel(imageCode);
  const cardBackgroundCode = extractEventCodeFromCardBackground(player?.card_background || player?.cardbackground || player?.cardBackground);
  if (cardBackgroundCode) return formatEventLabel(cardBackgroundCode);
  return '';
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const lowered = toLowerText(value);
  return lowered === 'true' || lowered === '1' || lowered === 'yes';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseUniqueId(uniqueId) {
  const [playerId = '', rankText = '0', untradableText = '0'] = String(uniqueId || '').split('_');
  return {
    playerId: toText(playerId),
    rank: toNumber(rankText, 0),
    untradable: toText(untradableText) === '1'
  };
}

function readArrayStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[watchlist] Failed to read ${key}:`, error);
    return [];
  }
}

function writeArrayStorage(key, values) {
  window.localStorage.setItem(key, JSON.stringify(values));
}

function getPlayerId(player) {
  return toText(player?.playerId || player?.player_id || player?.playerid || player?.id);
}

function getPlayerUniqueId(player) {
  const stored = toText(player?.unique_id || player?.uniqueId);
  if (stored) return stored;
  const playerId = getPlayerId(player);
  const rank = toNumber(player?.rank, 0);
  const untradable = normalizeBoolean(player?.is_untradable ?? player?.isuntradable);
  return `${playerId}_${rank}_${untradable ? 1 : 0}`;
}

function formatPrice(price) {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function getPlayerType(player) {
  return player.league_image ? 'normal' : 'hero';
}

function normalizeWatchlistPlayer(player) {
  const parsedPlayer = player && typeof player === 'object' ? player : {};
  const playerId = getPlayerId(parsedPlayer);
  const recordId = toText(parsedPlayer.record_id || parsedPlayer.recordId || parsedPlayer.id);
  const uniqueId = getPlayerUniqueId(parsedPlayer);
  const parsedUnique = parseUniqueId(uniqueId);
  return {
    unique_id: uniqueId,
    player_id: playerId || parsedUnique.playerId,
    record_id: recordId,
    playerid: playerId || parsedUnique.playerId,
    id: recordId || playerId || parsedUnique.playerId,
    name: toText(parsedPlayer.name) || `Player ${playerId || parsedUnique.playerId}`,
    position: toText(parsedPlayer.position),
    team: toText(parsedPlayer.team || parsedPlayer.club),
    league: toText(parsedPlayer.league),
    nation: toText(parsedPlayer.nation || parsedPlayer.nation_region),
    event: resolveWatchlistEvent(parsedPlayer),
    ovr: toNumber(parsedPlayer.ovr || parsedPlayer.overallrating || parsedPlayer.rating, 0),
    overallrating: toNumber(parsedPlayer.ovr || parsedPlayer.overallrating || parsedPlayer.rating, 0),
    rank: toNumber(parsedPlayer.rank ?? parsedUnique.rank, 0),
    is_untradable: normalizeBoolean(parsedPlayer.is_untradable ?? parsedPlayer.isuntradable ?? parsedUnique.untradable),
    skillmoves: toNumber(parsedPlayer.skillmoves || parsedPlayer.skill_moves || parsedPlayer.skill, 0),
    pace: readAttributeStatValue(parsedPlayer, 'pace', 'pac'),
    shooting: readAttributeStatValue(parsedPlayer, 'shooting', 'sho'),
    passing: readAttributeStatValue(parsedPlayer, 'passing', 'pas'),
    dribbling: readAttributeStatValue(parsedPlayer, 'dribbling_head', 'dribbling'),
    defending: readAttributeStatValue(parsedPlayer, 'defending', 'def'),
    physical: readAttributeStatValue(parsedPlayer, 'physical', 'phy'),
    price: Number(parsedPlayer.price) || 0,
    card_background: toText(parsedPlayer.card_background || parsedPlayer.cardbackground),
    player_image: toText(parsedPlayer.player_image || parsedPlayer.playerimage),
    nation_flag: toText(parsedPlayer.nation_flag || parsedPlayer.nationflag),
    club_flag: toText(parsedPlayer.club_flag || parsedPlayer.clubflag),
    league_image: toText(parsedPlayer.league_image),
    color_name: toText(parsedPlayer.color_name || parsedPlayer.colorname) || '#FFFFFF',
    color_rating: toText(parsedPlayer.color_rating || parsedPlayer.colorrating) || '#FFB86B',
    color_position: toText(parsedPlayer.color_position || parsedPlayer.colorposition) || '#FFFFFF',
    alternate_position: toText(parsedPlayer.alternate_position || parsedPlayer.alternateposition)
  };
}

function buildPlaceholderPlayer(uniqueId) {
  const parsed = parseUniqueId(uniqueId);
  return normalizeWatchlistPlayer({
    unique_id: uniqueId,
    player_id: parsed.playerId,
    name: `Player ${parsed.playerId}`,
    rank: parsed.rank,
    is_untradable: parsed.untradable
  });
}

function uniqueSorted(values) {
  return [...new Set(values.map((entry) => toText(entry)).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function buildPrimaryStatPatch(player) {
  return {
    pace: readAttributeStatValue(player, 'pace', 'pac'),
    shooting: readAttributeStatValue(player, 'shooting', 'sho'),
    passing: readAttributeStatValue(player, 'passing', 'pas'),
    dribbling: readAttributeStatValue(player, 'dribbling_head', 'dribbling'),
    defending: readAttributeStatValue(player, 'defending', 'def'),
    physical: readAttributeStatValue(player, 'physical', 'phy')
  };
}

function renderPlayerRow(player) {
  const uniqueId = getPlayerUniqueId(player);
  const playerType = getPlayerType(player);
  const playerPath = buildPlayerPath({
    playerId: player.player_id,
    recordId: player.record_id,
    name: player.name,
    ovr: player.ovr
  });
  const metaParts = [toText(player.team), toText(player.league)].filter(Boolean);
  const metaText = metaParts.length ? metaParts.join(' • ') : toText(player.position || 'Unknown');
  const alternatePositions = toText(player.alternate_position)
    .split(',')
    .map((entry) => toText(entry).toUpperCase())
    .filter(Boolean);
  const cardBackground = escapeHtml(player.card_background || 'https://via.placeholder.com/300x400');
  const playerImage = escapeHtml(player.player_image || 'https://via.placeholder.com/256');
  const playerName = escapeHtml(player.name || 'Unknown');
  const playerPosition = escapeHtml(player.position || '?');
  const playerOvr = escapeHtml(player.ovr || '?');
  const playerNameColor = escapeHtml(player.color_name || '#FFFFFF');
  const playerOvrColor = escapeHtml(player.color_rating || '#FFB86B');
  const playerPositionColor = escapeHtml(player.color_position || '#FFFFFF');
  const untradableBadge = player.is_untradable
    ? `<div class="card-untradable-badge card-untradable-badge--players" style="pointer-events: none;">
        <img src="${UNTRADABLE_CARD_BADGE_URL}" alt="Untradable" width="16" height="16" loading="lazy">
      </div>`
    : '';

  return `
    <div
      class="player-row"
      data-player-id="${escapeHtml(player.player_id)}"
      data-record-id="${escapeHtml(player.record_id || '')}"
      data-player-path="${escapeHtml(playerPath)}"
      data-unique-id="${escapeHtml(uniqueId)}"
      data-name="${escapeHtml(player.name)}"
      data-position="${escapeHtml(player.position)}"
      data-league="${escapeHtml(player.league)}"
      data-club="${escapeHtml(player.team)}"
      data-nation="${escapeHtml(player.nation)}"
      data-event="${escapeHtml(player.event)}"
      data-ovr="${escapeHtml(player.ovr)}"
      data-skill="${escapeHtml(player.skillmoves)}"
      data-price="${escapeHtml(player.price)}"
      data-pac="${escapeHtml(player.pace)}"
      data-sho="${escapeHtml(player.shooting)}"
      data-pas="${escapeHtml(player.passing)}"
      data-dri="${escapeHtml(player.dribbling)}"
      data-def="${escapeHtml(player.defending)}"
      data-phy="${escapeHtml(player.physical)}"
    >
      <div class="player-row-card">
        <div class="dashboard-player-card">
          <div class="card-container">
            <img src="${cardBackground}" alt="Card Background" class="card-background-img" width="300" height="400" loading="lazy">
            <img src="${playerImage}" alt="${playerName}" class="player-image-img" width="256" height="256" loading="lazy">
            <div class="card-ovr" style="color: ${playerOvrColor}"><span translate="no" class="notranslate">${playerOvr}</span></div>
            <div class="card-position" style="color: ${playerPositionColor}"><span translate="no" class="notranslate">${playerPosition}</span></div>
            <div class="card-player-name" style="color: ${playerNameColor}"><span translate="no" class="notranslate">${playerName}</span></div>
            ${
              player.nation_flag
                ? `<img src="${escapeHtml(player.nation_flag)}" alt="Nation" class="card-nation-flag-home ${
                    playerType === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
                  }" width="18" height="18" loading="lazy">`
                : ''
            }
            ${
              player.club_flag
                ? `<img src="${escapeHtml(player.club_flag)}" alt="Club" class="card-club-flag-home ${
                    playerType === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'
                  }" width="18" height="18" loading="lazy">`
                : ''
            }
            ${
              playerType === 'normal' && player.league_image
                ? `<img src="${escapeHtml(player.league_image)}" alt="League" class="card-league-flag-home normal-league-flag-home" width="18" height="18" loading="lazy">`
                : ''
            }
            ${untradableBadge}
          </div>
        </div>
      </div>

      <div class="player-row-info">
        <div class="player-info-name"><span translate="no" class="notranslate">${escapeHtml(player.name)}</span></div>
        <div class="player-info-meta">${escapeHtml(metaText)}</div>
        ${
          alternatePositions.length
            ? `<div class="player-info-secondary">${alternatePositions
                .map((position) => `<span class="secondary-position-badge">${escapeHtml(position)}</span>`)
                .join('')}</div>`
            : ''
        }
      </div>

      <div class="player-row-stats player-card-stats-row">
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.pace)}</span></div><div class="stat-pill-label">PAC</div></div>
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.shooting)}</span></div><div class="stat-pill-label">SHO</div></div>
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.passing)}</span></div><div class="stat-pill-label">PAS</div></div>
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.dribbling)}</span></div><div class="stat-pill-label">DRI</div></div>
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.defending)}</span></div><div class="stat-pill-label">DEF</div></div>
        <div class="stat-pill"><div class="stat-pill-value"><span translate="no" class="notranslate">${escapeHtml(player.physical)}</span></div><div class="stat-pill-label">PHY</div></div>
      </div>

      <button class="player-row-watchlist active" data-unique-id="${escapeHtml(uniqueId)}" type="button" aria-label="Remove from watchlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
  `;
}

export default function WatchlistInteractions() {
  const router = useRouter();

  useEffect(() => {
    const root = document.getElementById('watchlist-view');
    const grid = document.getElementById('watchlist-players-grid');
    if (!root || !grid) return;

    const activeFilters = document.getElementById('watchlist-active-filters');
    const resultsCount = document.getElementById('watchlist-results-count');
    const emptyState = document.getElementById('watchlist-empty-state');
    const browsePlayersButton = document.getElementById('browse-players-btn');
    const filterBadge = document.getElementById('watchlist-filter-badge');

    const searchInput = document.getElementById('watchlist-search-input');
    const mobileSearchInput = document.getElementById('watchlist-mobile-search');
    const sortSelect = document.getElementById('watchlist-sort-select');

    const positionSelect = document.getElementById('watchlist-filter-position');
    const leagueSelect = document.getElementById('watchlist-filter-league');
    const teamSelect = document.getElementById('watchlist-filter-team');
    const nationSelect = document.getElementById('watchlist-filter-nation');
    const eventSelect = document.getElementById('watchlist-filter-event');
    const skillSelect = document.getElementById('watchlist-filter-skill');
    const ratingMinInput = document.getElementById('watchlist-rating-min');
    const ratingMaxInput = document.getElementById('watchlist-rating-max');
    const ratingValue = document.getElementById('watchlist-rating-value');

    const mobileFilterModal = document.getElementById('mobile-filter-modal');
    const mobileFilterOpen = document.getElementById('watchlist-mobile-filter-toggle');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const mobileFilterBackdrop = document.getElementById('mobile-filter-backdrop');
    const mobileFilterApply = document.getElementById('mobile-apply-filters');
    const mobileFilterClear = document.getElementById('mobile-clear-filters');

    const mobilePositionSelect = document.getElementById('mobile-filter-position');
    const mobileLeagueSelect = document.getElementById('mobile-filter-league');
    const mobileTeamSelect = document.getElementById('mobile-filter-team');
    const mobileNationSelect = document.getElementById('mobile-filter-nation');
    const mobileEventSelect = document.getElementById('mobile-filter-event');
    const mobileSkillSelect = document.getElementById('mobile-filter-skill');
    const mobileRatingMinInput = document.getElementById('mobile-rating-min');
    const mobileRatingMaxInput = document.getElementById('mobile-rating-max');
    const mobileRatingValue = document.getElementById('mobile-watchlist-rating-value');

    const cleanup = [];
    const filters = {
      position: '',
      league: '',
      team: '',
      nation: '',
      event: '',
      skill: '',
      minOvr: 40,
      maxOvr: 150,
      searchQuery: ''
    };

    let watchlistIds = readArrayStorage('watchlist').map((entry) => toText(entry)).filter(Boolean);
    let watchlistPlayers = readArrayStorage('watchlistPlayers').map(normalizeWatchlistPlayer);
    let filteredPlayers = [];
    let priceHydrationRun = 0;
    let statsHydrationRun = 0;

    const getActiveFilterCount = () => {
      let count = 0;
      if (filters.position) count += 1;
      if (filters.league) count += 1;
      if (filters.team) count += 1;
      if (filters.nation) count += 1;
      if (filters.event) count += 1;
      if (filters.skill) count += 1;
      if (filters.searchQuery) count += 1;
      if (filters.minOvr !== 40 || filters.maxOvr !== 150) count += 1;
      return count;
    };

    const updateFilterBadge = () => {
      if (!filterBadge) return;
      const count = getActiveFilterCount();
      if (!count) {
        filterBadge.style.display = 'none';
        filterBadge.textContent = '';
        return;
      }
      filterBadge.style.display = 'inline-flex';
      filterBadge.textContent = String(count);
    };

    const updateRatingLabels = () => {
      if (ratingValue) ratingValue.innerHTML = `<span translate="no" class="notranslate">${filters.minOvr}-${filters.maxOvr}</span>`;
      if (mobileRatingValue) mobileRatingValue.innerHTML = `<span translate="no" class="notranslate">${filters.minOvr}-${filters.maxOvr}</span>`;
    };

    const syncSources = () => {
      const idSet = new Set(watchlistIds);
      const idList = [...idSet];
      
      // Filter out players no longer in the ID list
      let nextWatchlistPlayers = watchlistPlayers.filter((player) => {
        const uniqueId = getPlayerUniqueId(player);
        return idSet.has(uniqueId);
      });

      // Add placeholders for IDs that don't have player objects
      const represented = new Set(nextWatchlistPlayers.map((player) => getPlayerUniqueId(player)));
      let changed = nextWatchlistPlayers.length !== watchlistPlayers.length;

      idList.forEach((watchlistId) => {
        if (!represented.has(watchlistId)) {
          nextWatchlistPlayers.push(buildPlaceholderPlayer(watchlistId));
          changed = true;
        }
      });

      watchlistPlayers = nextWatchlistPlayers;

      // Only write if something actually changed to avoid event loops
      const storedWatchlist = readArrayStorage('watchlist');
      const storedPlayers = readArrayStorage('watchlistPlayers');
      
      const watchlistChanged = JSON.stringify(storedWatchlist) !== JSON.stringify(idList);
      const playersChanged = JSON.stringify(storedPlayers) !== JSON.stringify(watchlistPlayers);

      if (watchlistChanged || playersChanged) {
        if (watchlistChanged) writeArrayStorage('watchlist', idList);
        if (playersChanged) writeArrayStorage('watchlistPlayers', watchlistPlayers);
      }
    };


    const updateFilterOptions = () => {
      const positions = uniqueSorted(watchlistPlayers.map((player) => player.position));
      const leagues = uniqueSorted(watchlistPlayers.map((player) => player.league));
      const teams = uniqueSorted(watchlistPlayers.map((player) => player.team));
      const nations = uniqueSorted(watchlistPlayers.map((player) => player.nation));
      const events = uniqueSorted(watchlistPlayers.map((player) => player.event));
      const skills = uniqueSorted(watchlistPlayers.map((player) => player.skillmoves).filter((value) => Number(value) > 0)).sort(
        (left, right) => Number(right) - Number(left)
      );

      const renderOptions = (select, label, options, currentValue) => {
        if (!select) return;
        select.innerHTML = `<option value="">All ${label}</option>${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}`;
        select.value = currentValue || '';
      };

      renderOptions(positionSelect, 'Positions', positions, filters.position);
      renderOptions(leagueSelect, 'Leagues', leagues, filters.league);
      renderOptions(teamSelect, 'Clubs', teams, filters.team);
      renderOptions(nationSelect, 'Nations', nations, filters.nation);
      renderOptions(eventSelect, 'Events', events, filters.event);
      renderOptions(skillSelect, 'Skills', skills, filters.skill);

      renderOptions(mobilePositionSelect, 'Positions', positions, filters.position);
      renderOptions(mobileLeagueSelect, 'Leagues', leagues, filters.league);
      renderOptions(mobileTeamSelect, 'Clubs', teams, filters.team);
      renderOptions(mobileNationSelect, 'Nations', nations, filters.nation);
      renderOptions(mobileEventSelect, 'Events', events, filters.event);
      renderOptions(mobileSkillSelect, 'Skills', skills, filters.skill);
    };

    const hydrateTradablePrices = async () => {
      const runId = ++priceHydrationRun;
      const tradablePlayers = watchlistPlayers.filter((player) => !player.is_untradable && getPlayerId(player));
      if (!tradablePlayers.length) return;

      const priceByUniqueId = {};
      const batchSize = 20;

      for (let index = 0; index < tradablePlayers.length; index += batchSize) {
        const batch = tradablePlayers.slice(index, index + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (player) => {
            const playerId = getPlayerId(player);
            const rank = toNumber(player.rank, 0);
            const uniqueId = getPlayerUniqueId(player);
            try {
              const response = await fetch(
                `/api/player-price?id=${encodeURIComponent(playerId)}&rank=${encodeURIComponent(rank)}`,
                { cache: 'no-store' }
              );
              if (!response.ok) return [uniqueId, 0];
              const payload = await response.json();
              return [uniqueId, toNumber(payload?.price, 0)];
            } catch {
              return [uniqueId, 0];
            }
          })
        );

        if (runId !== priceHydrationRun) return;
        batchResults.forEach(([uniqueId, price]) => {
          if (price > 0) priceByUniqueId[uniqueId] = price;
        });
      }

      if (runId !== priceHydrationRun || !Object.keys(priceByUniqueId).length) return;

      let changed = false;
      watchlistPlayers = watchlistPlayers.map((player) => {
        if (player.is_untradable) return player;
        const uniqueId = getPlayerUniqueId(player);
        const nextPrice = toNumber(priceByUniqueId[uniqueId], 0);
        if (!nextPrice || toNumber(player.price, 0) === nextPrice) return player;
        changed = true;
        return { ...player, price: nextPrice };
      });

      if (changed) {
        writeArrayStorage('watchlistPlayers', watchlistPlayers);
        applyFilters();
      }
    };

    const hasMissingPrimaryStats = (player) => {
      const attributes = player?.attributes && typeof player.attributes === 'object' ? player.attributes : {};
      if (toNumber(attributes?.dribbling_head, 0) <= 0) return true;
      const stats = buildPrimaryStatPatch(player);
      return Object.values(stats).every((value) => value <= 0);
    };

    const hydrateMissingStats = async () => {
      const runId = ++statsHydrationRun;
      const targets = watchlistPlayers.filter((player) => getPlayerId(player) && hasMissingPrimaryStats(player));
      if (!targets.length) return;

      const updates = new Map();
      const batchSize = 10;

      for (let index = 0; index < targets.length; index += batchSize) {
        const batch = targets.slice(index, index + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (player) => {
            const playerId = getPlayerId(player);
            if (!playerId) return null;
            const rank = toNumber(player.rank, 0);
            try {
              const response = await fetch(
                `/api/player-detail?id=${encodeURIComponent(playerId)}&rank=${encodeURIComponent(rank)}`,
                { cache: 'no-store' }
              );
              if (!response.ok) return null;
              const payload = await response.json();
              const record = payload?.record;
              if (!record) return null;
              const statsPatch = buildPrimaryStatPatch(record);
              if (!Object.values(statsPatch).some((value) => value > 0)) return null;
              return [getPlayerUniqueId(player), statsPatch];
            } catch {
              return null;
            }
          })
        );

        if (runId !== statsHydrationRun) return;
        batchResults.forEach((entry) => {
          if (!entry) return;
          const [uniqueId, statsPatch] = entry;
          updates.set(uniqueId, statsPatch);
        });
      }

      if (!updates.size || runId !== statsHydrationRun) return;

      let changed = false;
      watchlistPlayers = watchlistPlayers.map((player) => {
        const uniqueId = getPlayerUniqueId(player);
        const patch = updates.get(uniqueId);
        if (!patch) return player;
        changed = true;
        return { ...player, ...patch };
      });

      if (changed) {
        writeArrayStorage('watchlistPlayers', watchlistPlayers);
        applyFilters();
      }
    };

    const renderActiveChips = () => {
      if (!activeFilters) return;
      const chips = [];
      if (filters.position) chips.push({ type: 'position', label: 'Position', value: filters.position });
      if (filters.league) chips.push({ type: 'league', label: 'League', value: filters.league });
      if (filters.team) chips.push({ type: 'team', label: 'Club', value: filters.team });
      if (filters.nation) chips.push({ type: 'nation', label: 'Nation', value: filters.nation });
      if (filters.event) chips.push({ type: 'event', label: 'Event', value: filters.event });
      if (filters.skill) chips.push({ type: 'skill', label: 'Skill', value: `${filters.skill}★` });
      if (filters.minOvr !== 40 || filters.maxOvr !== 150) chips.push({ type: 'ovr', label: 'OVR', value: `${filters.minOvr}-${filters.maxOvr}` });

      activeFilters.innerHTML = chips
        .map((chip) => `<div class="filter-chip">${escapeHtml(chip.label)}: ${escapeHtml(chip.value)} <button data-filter-type="${escapeHtml(chip.type)}" type="button">×</button></div>`)
        .join('');
    };

    const renderGrid = () => {
      if (!filteredPlayers.length) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
      } else {
        grid.innerHTML = filteredPlayers.map((player, index) => {
          let html = renderPlayerRow(player);
          if ((index + 1) % 3 === 0) {
            html += `
              <div class="watchlist-ad-container" style="grid-column: 1 / -1; margin: 16px 0; width: 100%; text-align: center; overflow: hidden; min-height: 120px;">
                <ins class="adsbygoogle"
                     style="display:block; min-width:250px;"
                     data-ad-client="ca-pub-4474200951186936"
                     data-ad-slot="9548907329"
                     data-ad-format="fluid"
                     data-ad-layout-key="-6t+ed+2i-1n-4w"
                     data-full-width-responsive="true"></ins>
              </div>
            `;
          }
          return html;
        }).join('');
        
        setTimeout(() => {
          const ads = grid.querySelectorAll('.watchlist-ad-container ins.adsbygoogle:not([data-adsbygoogle-status])');
          ads.forEach(() => {
            try {
              if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
              }
            } catch (e) {}
          });
        }, 100);

        if (emptyState) emptyState.style.display = 'none';
      }

      if (resultsCount) {
        resultsCount.innerHTML = `<span translate="no" class="notranslate">${filteredPlayers.length}</span> player${filteredPlayers.length === 1 ? '' : 's'} in watchlist`;
      }
    };

    const applyFilters = () => {
      filteredPlayers = watchlistPlayers.filter((player) => {
        if (filters.searchQuery) {
          const searchSource = normalizeSearchText(
            `${player.name} ${player.position} ${player.team} ${player.league} ${player.nation}`
          );
          if (!searchSource.includes(filters.searchQuery)) return false;
        }
        if (filters.position && toLowerText(player.position) !== toLowerText(filters.position)) return false;
        if (filters.league && toLowerText(player.league) !== toLowerText(filters.league)) return false;
        if (filters.team && toLowerText(player.team) !== toLowerText(filters.team)) return false;
        if (filters.nation && toLowerText(player.nation) !== toLowerText(filters.nation)) return false;
        if (filters.event && toLowerText(player.event) !== toLowerText(filters.event)) return false;
        if (filters.skill && String(player.skillmoves) !== String(filters.skill)) return false;

        const ovr = toNumber(player.ovr, 0);
        if (ovr < filters.minOvr || ovr > filters.maxOvr) return false;
        return true;
      });

      const sortBy = toLowerText(sortSelect?.value || 'name');
      filteredPlayers.sort((left, right) => {
        if (sortBy === 'ovr' || sortBy === 'rating') return toNumber(right.ovr, 0) - toNumber(left.ovr, 0);
        if (sortBy === 'price') return toNumber(right.price, 0) - toNumber(left.price, 0);
        return toLowerText(left.name).localeCompare(toLowerText(right.name));
      });

      updateRatingLabels();
      renderActiveChips();
      renderGrid();
      updateFilterBadge();
    };

    const clearFilters = () => {
      filters.position = '';
      filters.league = '';
      filters.team = '';
      filters.nation = '';
      filters.event = '';
      filters.skill = '';
      filters.minOvr = 40;
      filters.maxOvr = 150;
      filters.searchQuery = '';

      if (searchInput) searchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
      if (sortSelect) sortSelect.value = 'name';
      if (ratingMinInput) ratingMinInput.value = '40';
      if (ratingMaxInput) ratingMaxInput.value = '150';
      if (mobileRatingMinInput) mobileRatingMinInput.value = '40';
      if (mobileRatingMaxInput) mobileRatingMaxInput.value = '150';

      updateFilterOptions();
      applyFilters();
    };

    const closeMobileFilters = () => mobileFilterModal?.classList.remove('active');
    const openMobileFilters = () => {
      if (!mobileFilterModal) return;
      if (mobilePositionSelect) mobilePositionSelect.value = filters.position;
      if (mobileLeagueSelect) mobileLeagueSelect.value = filters.league;
      if (mobileTeamSelect) mobileTeamSelect.value = filters.team;
      if (mobileNationSelect) mobileNationSelect.value = filters.nation;
      if (mobileEventSelect) mobileEventSelect.value = filters.event;
      if (mobileSkillSelect) mobileSkillSelect.value = filters.skill;
      if (mobileRatingMinInput) mobileRatingMinInput.value = String(filters.minOvr);
      if (mobileRatingMaxInput) mobileRatingMaxInput.value = String(filters.maxOvr);
      updateRatingLabels();
      mobileFilterModal.classList.add('active');
    };

    const removeFromWatchlist = (uniqueId) => {
      watchlistIds = watchlistIds.filter((entry) => entry !== uniqueId);
      watchlistPlayers = watchlistPlayers.filter((player) => getPlayerUniqueId(player) !== uniqueId);
      writeArrayStorage('watchlist', watchlistIds);
      writeArrayStorage('watchlistPlayers', watchlistPlayers);
      window.dispatchEvent(new Event('watchlist-updated'));
      updateFilterOptions();
      applyFilters();
    };

    const refreshFromStorage = () => {
      const nextIds = readArrayStorage('watchlist').map((entry) => toText(entry)).filter(Boolean);
      const nextPlayers = readArrayStorage('watchlistPlayers').map(normalizeWatchlistPlayer);
      
      const idsChanged = JSON.stringify(watchlistIds) !== JSON.stringify(nextIds);
      const playersChanged = JSON.stringify(watchlistPlayers) !== JSON.stringify(nextPlayers);
      
      if (!idsChanged && !playersChanged && filteredPlayers.length > 0) return;

      watchlistIds = nextIds;
      watchlistPlayers = nextPlayers;
      
      syncSources();
      updateFilterOptions();
      applyFilters();
      hydrateTradablePrices();
      hydrateMissingStats();
    };


    const handleGridClick = (event) => {
      const watchlistButton = event.target.closest('.player-row-watchlist');
      if (watchlistButton) {
        event.preventDefault();
        event.stopPropagation();
        const uniqueId = toText(watchlistButton.getAttribute('data-unique-id'));
        if (!uniqueId) return;
        removeFromWatchlist(uniqueId);
        return;
      }

      const row = event.target.closest('.player-row');
      if (!row) return;
      const playerPath = toText(row.getAttribute('data-player-path'));
      if (playerPath) {
        router.push(playerPath);
        return;
      }
      const playerId = toText(row.getAttribute('data-player-id'));
      if (!playerId) return;
      router.push(
        buildPlayerPath({
          playerId,
          recordId: toText(row.getAttribute('data-record-id')),
          name: toText(row.getAttribute('data-name')),
          ovr: toNumber(row.getAttribute('data-ovr'), 0)
        })
      );
    };

    const bind = (element, eventName, handler) => {
      if (!element) return;
      element.addEventListener(eventName, handler);
      cleanup.push(() => element.removeEventListener(eventName, handler));
    };

    bind(searchInput, 'input', () => {
      filters.searchQuery = normalizeSearchText(searchInput.value);
      if (mobileSearchInput) mobileSearchInput.value = searchInput.value;
      applyFilters();
    });

    bind(mobileSearchInput, 'input', () => {
      filters.searchQuery = normalizeSearchText(mobileSearchInput.value);
      if (searchInput) searchInput.value = mobileSearchInput.value;
      applyFilters();
    });

    bind(sortSelect, 'change', applyFilters);

    bind(positionSelect, 'change', () => {
      filters.position = toText(positionSelect.value);
      applyFilters();
    });
    bind(leagueSelect, 'change', () => {
      filters.league = toText(leagueSelect.value);
      applyFilters();
    });
    bind(teamSelect, 'change', () => {
      filters.team = toText(teamSelect.value);
      applyFilters();
    });
    bind(nationSelect, 'change', () => {
      filters.nation = toText(nationSelect.value);
      applyFilters();
    });
    bind(eventSelect, 'change', () => {
      filters.event = toText(eventSelect.value);
      applyFilters();
    });
    bind(skillSelect, 'change', () => {
      filters.skill = toText(skillSelect.value);
      applyFilters();
    });

    bind(ratingMinInput, 'input', () => {
      filters.minOvr = toNumber(ratingMinInput.value, 40);
      if (mobileRatingMinInput) mobileRatingMinInput.value = String(filters.minOvr);
      applyFilters();
    });
    bind(ratingMaxInput, 'input', () => {
      filters.maxOvr = toNumber(ratingMaxInput.value, 150);
      if (mobileRatingMaxInput) mobileRatingMaxInput.value = String(filters.maxOvr);
      applyFilters();
    });

    bind(activeFilters, 'click', (event) => {
      const button = event.target.closest('button[data-filter-type]');
      if (!button) return;
      const filterType = toText(button.getAttribute('data-filter-type'));
      if (filterType === 'position') filters.position = '';
      if (filterType === 'league') filters.league = '';
      if (filterType === 'team') filters.team = '';
      if (filterType === 'nation') filters.nation = '';
      if (filterType === 'event') filters.event = '';
      if (filterType === 'skill') filters.skill = '';
      if (filterType === 'ovr') {
        filters.minOvr = 40;
        filters.maxOvr = 150;
        if (ratingMinInput) ratingMinInput.value = '40';
        if (ratingMaxInput) ratingMaxInput.value = '150';
      }
      updateFilterOptions();
      applyFilters();
    });

    bind(document.getElementById('clear-watchlist-filters'), 'click', clearFilters);
    bind(browsePlayersButton, 'click', () => router.push('/players'));

    bind(mobileFilterOpen, 'click', openMobileFilters);
    bind(mobileFilterClose, 'click', closeMobileFilters);
    bind(mobileFilterBackdrop, 'click', closeMobileFilters);
    bind(mobileFilterClear, 'click', () => {
      clearFilters();
      closeMobileFilters();
    });
    bind(mobileFilterApply, 'click', () => {
      filters.position = toText(mobilePositionSelect?.value);
      filters.league = toText(mobileLeagueSelect?.value);
      filters.team = toText(mobileTeamSelect?.value);
      filters.nation = toText(mobileNationSelect?.value);
      filters.event = toText(mobileEventSelect?.value);
      filters.skill = toText(mobileSkillSelect?.value);
      filters.minOvr = toNumber(mobileRatingMinInput?.value, 40);
      filters.maxOvr = toNumber(mobileRatingMaxInput?.value, 150);

      if (positionSelect) positionSelect.value = filters.position;
      if (leagueSelect) leagueSelect.value = filters.league;
      if (teamSelect) teamSelect.value = filters.team;
      if (nationSelect) nationSelect.value = filters.nation;
      if (eventSelect) eventSelect.value = filters.event;
      if (skillSelect) skillSelect.value = filters.skill;
      if (ratingMinInput) ratingMinInput.value = String(filters.minOvr);
      if (ratingMaxInput) ratingMaxInput.value = String(filters.maxOvr);

      applyFilters();
      closeMobileFilters();
    });

    bind(grid, 'click', handleGridClick);
    bind(window, 'watchlist-updated', refreshFromStorage);
    bind(window, 'storage', (event) => {
      if (!event.key || (event.key !== 'watchlist' && event.key !== 'watchlistPlayers')) return;
      refreshFromStorage();
    });
    bind(window, 'focus', refreshFromStorage);
    bind(window, 'pageshow', refreshFromStorage);
    bind(document, 'visibilitychange', () => {
      if (document.hidden) return;
      refreshFromStorage();
    });

    refreshFromStorage();

    return () => {
      priceHydrationRun += 1;
      cleanup.forEach((dispose) => dispose());
    };
  }, [router]);

  return null;
}
