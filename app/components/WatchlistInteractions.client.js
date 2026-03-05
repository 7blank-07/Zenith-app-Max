'use client';

import { useEffect } from 'react';
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
  return toText(player?.player_id || player?.playerid || player?.id);
}

function getPlayerUniqueId(player) {
  const stored = toText(player?.unique_id || player?.uniqueId);
  if (stored) return stored;
  const playerId = getPlayerId(player);
  const rank = toNumber(player?.rank, 0);
  const untradable = normalizeBoolean(player?.is_untradable ?? player?.isuntradable);
  return `${playerId}_${rank}_${untradable ? 1 : 0}`;
}

function getInitials(name) {
  const words = toText(name)
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatPrice(price) {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return 'NA';
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
  const uniqueId = getPlayerUniqueId(parsedPlayer);
  const parsedUnique = parseUniqueId(uniqueId);
  return {
    unique_id: uniqueId,
    player_id: playerId || parsedUnique.playerId,
    playerid: playerId || parsedUnique.playerId,
    id: playerId || parsedUnique.playerId,
    name: toText(parsedPlayer.name) || `Player ${playerId || parsedUnique.playerId}`,
    position: toText(parsedPlayer.position),
    team: toText(parsedPlayer.team || parsedPlayer.club),
    league: toText(parsedPlayer.league),
    nation: toText(parsedPlayer.nation || parsedPlayer.nation_region),
    event: toText(parsedPlayer.event),
    ovr: toNumber(parsedPlayer.ovr || parsedPlayer.overallrating || parsedPlayer.rating, 0),
    overallrating: toNumber(parsedPlayer.ovr || parsedPlayer.overallrating || parsedPlayer.rating, 0),
    rank: toNumber(parsedPlayer.rank ?? parsedUnique.rank, 0),
    is_untradable: normalizeBoolean(parsedPlayer.is_untradable ?? parsedPlayer.isuntradable ?? parsedUnique.untradable),
    skillmoves: toNumber(parsedPlayer.skillmoves || parsedPlayer.skill_moves || parsedPlayer.skill, 0),
    pace: toNumber(parsedPlayer.pace, 0),
    shooting: toNumber(parsedPlayer.shooting, 0),
    passing: toNumber(parsedPlayer.passing, 0),
    dribbling: toNumber(parsedPlayer.dribbling, 0),
    defending: toNumber(parsedPlayer.defending, 0),
    physical: toNumber(parsedPlayer.physical, 0),
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

function renderPlayerRow(player) {
  const uniqueId = getPlayerUniqueId(player);
  const playerType = getPlayerType(player);
  const alternatePositions = toText(player.alternate_position)
    .split(',')
    .map((entry) => toText(entry).toUpperCase())
    .filter(Boolean);
  const untradableBadge = player.is_untradable
    ? '<div class="card-untradable-badge" style="pointer-events: none;"><img src="/assets/images/untradable_img.png" alt="Untradable"></div>'
    : '';

  return `
    <div
      class="player-row"
      data-player-id="${escapeHtml(player.player_id)}"
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
        <div class="player-card-image-placeholder">
          ${player.card_background ? `<img src="${escapeHtml(player.card_background)}" alt="Card Background" class="player-row-card-bg">` : ''}
          ${
            player.player_image
              ? `<img src="${escapeHtml(player.player_image)}" alt="${escapeHtml(player.name)}" class="player-row-main-img"><span class="player-initials player-initials-hidden">${escapeHtml(getInitials(player.name))}</span>`
              : `<span class="player-initials">${escapeHtml(getInitials(player.name))}</span>`
          }

          <div class="player-row-name" style="color: ${escapeHtml(player.color_name || '#FFFFFF')}">${escapeHtml(player.name)}</div>
          <div class="player-row-ovr" style="color: ${escapeHtml(player.color_rating || '#FFB86B')}">${escapeHtml(player.ovr || '?')}</div>
          <div class="player-row-position" style="color: ${escapeHtml(player.color_position || '#FFFFFF')}">${escapeHtml(player.position || '?')}</div>

          ${
            player.nation_flag
              ? `<img src="${escapeHtml(player.nation_flag)}" alt="Nation" class="player-card-nation-flag ${
                  playerType === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'
                }">`
              : ''
          }
          ${
            player.club_flag
              ? `<img src="${escapeHtml(player.club_flag)}" alt="Club" class="player-card-club-flag ${
                  playerType === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'
                }">`
              : ''
          }
          ${
            playerType === 'normal' && player.league_image
              ? `<img src="${escapeHtml(player.league_image)}" alt="League" class="player-card-league-watchlist-flag normal-league-watchlist-flag">`
              : ''
          }
          ${untradableBadge}
        </div>
      </div>

      <div class="player-row-info">
        <div class="player-info-name">${escapeHtml(player.name)}</div>
        <div class="player-info-meta">${escapeHtml(player.team || 'NA')} • ${escapeHtml(player.league || 'NA')}</div>
        ${
          alternatePositions.length
            ? `<div class="player-info-secondary">${alternatePositions
                .map((position) => `<span class="secondary-position-badge">${escapeHtml(position)}</span>`)
                .join('')}</div>`
            : ''
        }
      </div>

      <div class="player-row-stats">
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.pace)}</div><div class="stat-pill-label">PAC</div></div>
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.shooting)}</div><div class="stat-pill-label">SHO</div></div>
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.passing)}</div><div class="stat-pill-label">PAS</div></div>
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.dribbling)}</div><div class="stat-pill-label">DRI</div></div>
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.defending)}</div><div class="stat-pill-label">DEF</div></div>
        <div class="stat-pill"><div class="stat-pill-value">${escapeHtml(player.physical)}</div><div class="stat-pill-label">PHY</div></div>
      </div>

      <div class="player-price" style="min-width: 68px; text-align: right; color: #fbbf24; font-weight: 700;">
        ${escapeHtml(formatPrice(player.price))}
      </div>

      <button class="player-row-watchlist active" data-unique-id="${escapeHtml(uniqueId)}" type="button" aria-label="Remove from watchlist">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
  `;
}

export default function WatchlistInteractions() {
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

    const previewPopup = document.getElementById('watchlist-preview-popup');
    const previewContent = document.getElementById('watchlist-preview-content');

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
      if (ratingValue) ratingValue.textContent = `${filters.minOvr}-${filters.maxOvr}`;
      if (mobileRatingValue) mobileRatingValue.textContent = `${filters.minOvr}-${filters.maxOvr}`;
    };

    const syncSources = () => {
      const idSet = new Set(watchlistIds);
      const idList = [...idSet];
      watchlistPlayers = watchlistPlayers.filter((player) => {
        const uniqueId = getPlayerUniqueId(player);
        if (idSet.has(uniqueId)) return true;
        const playerId = getPlayerId(player);
        if (!playerId) return false;
        return idList.some((watchlistId) => watchlistId.startsWith(`${playerId}_`));
      });

      const represented = new Set(watchlistPlayers.map((player) => getPlayerUniqueId(player)));
      idList.forEach((watchlistId) => {
        if (represented.has(watchlistId)) return;
        watchlistPlayers.push(buildPlaceholderPlayer(watchlistId));
      });

      writeArrayStorage('watchlist', [...idSet]);
      writeArrayStorage('watchlistPlayers', watchlistPlayers);
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
        grid.innerHTML = filteredPlayers.map(renderPlayerRow).join('');
        if (emptyState) emptyState.style.display = 'none';
      }

      if (resultsCount) {
        resultsCount.textContent = `${filteredPlayers.length} player${filteredPlayers.length === 1 ? '' : 's'} in watchlist`;
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

      const sortBy = toText(sortSelect?.value || 'Name');
      filteredPlayers.sort((left, right) => {
        if (sortBy === 'rating') return toNumber(right.ovr, 0) - toNumber(left.ovr, 0);
        if (sortBy === 'price') return Number(right.price || 0) - Number(left.price || 0);
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
      if (sortSelect) sortSelect.value = 'Name';
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
      watchlistIds = readArrayStorage('watchlist').map((entry) => toText(entry)).filter(Boolean);
      watchlistPlayers = readArrayStorage('watchlistPlayers').map(normalizeWatchlistPlayer);
      syncSources();
      updateFilterOptions();
      applyFilters();
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
      const playerId = toText(row.getAttribute('data-player-id'));
      if (!playerId) return;
      window.location.assign(`/player/${encodeURIComponent(playerId)}`);
    };

    const handleGridPreview = (event) => {
      if (!previewPopup || !previewContent) return;
      const row = event.target.closest('.player-row');
      if (!row) {
        previewPopup.style.display = 'none';
        return;
      }
      const card = row.querySelector('.player-row-card');
      if (!card) {
        previewPopup.style.display = 'none';
        return;
      }
      previewContent.innerHTML = card.outerHTML;
      previewPopup.style.display = 'block';
      previewPopup.style.left = `${event.clientX + 16}px`;
      previewPopup.style.top = `${event.clientY + 16}px`;
    };

    const hideGridPreview = () => {
      if (previewPopup) previewPopup.style.display = 'none';
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
    bind(browsePlayersButton, 'click', () => window.location.assign('/players'));

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
    bind(grid, 'mousemove', handleGridPreview);
    bind(grid, 'mouseleave', hideGridPreview);
    bind(window, 'watchlist-updated', refreshFromStorage);
    bind(window, 'storage', (event) => {
      if (!event.key || (event.key !== 'watchlist' && event.key !== 'watchlistPlayers')) return;
      refreshFromStorage();
    });

    refreshFromStorage();

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, []);

  return null;
}
