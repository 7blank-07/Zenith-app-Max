'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const STAT_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

let supabaseClient = null;

function toNumber(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function formatPrice(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return '0';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${Math.round(safe / 1000)}K`;
  return String(Math.round(safe));
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

function readWatchlist() {
  try {
    const raw = window.localStorage.getItem('watchlist');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry)) : [];
  } catch (error) {
    console.error('[players] Failed to read watchlist from localStorage:', error);
    return [];
  }
}

function writeWatchlist(values) {
  window.localStorage.setItem('watchlist', JSON.stringify(values));
}

function parseUniqueId(uniqueId) {
  const [playerId = '', rankText = '0', untradableText = '0'] = String(uniqueId || '').split('_');
  return {
    playerId: String(playerId || '').trim(),
    rank: toNumber(rankText, 0),
    untradable: String(untradableText || '').trim() === '1'
  };
}

function readWatchlistPlayers() {
  try {
    const raw = window.localStorage.getItem('watchlistPlayers');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[players] Failed to read watchlistPlayers from localStorage:', error);
    return [];
  }
}

function writeWatchlistPlayers(values) {
  window.localStorage.setItem('watchlistPlayers', JSON.stringify(values));
}

function getStoredPlayerUniqueId(player) {
  if (!player || typeof player !== 'object') return '';
  const stored = String(player.unique_id || player.uniqueId || '').trim();
  if (stored) return stored;
  const playerId = String(player.player_id || player.playerid || player.id || '').trim();
  const rank = toNumber(player.rank, 0);
  const untradable = String(player.is_untradable ?? player.isuntradable ?? '').trim();
  const normalizedUntradable = untradable === '1' || untradable.toLowerCase() === 'true' ? 1 : 0;
  return `${playerId}_${rank}_${normalizedUntradable}`;
}

function getPlayerSnapshotFromRow(row, uniqueId) {
  if (!row) return null;
  const parsedUnique = parseUniqueId(uniqueId);
  const playerId = row.getAttribute('data-player-id') || parsedUnique.playerId;
  if (!playerId) return null;

  const readSrc = (selector) => row.querySelector(selector)?.getAttribute('src') || '';
  const nameNode = row.querySelector('.player-info-name');
  const cardNameNode = row.querySelector('.player-card-name');
  const cardOvrNode = row.querySelector('.player-card-ovr');
  const cardPositionNode = row.querySelector('.player-card-position');
  const alternatePosition = Array.from(row.querySelectorAll('.secondary-position-badge'))
    .map((badge) => String(badge.textContent || '').trim())
    .filter(Boolean)
    .join(',');

  return {
    unique_id: uniqueId,
    player_id: playerId,
    playerid: playerId,
    id: playerId,
    name: row.getAttribute('data-name') || nameNode?.textContent?.trim() || 'Unknown',
    position: row.getAttribute('data-position') || '',
    team: row.getAttribute('data-club') || '',
    club: row.getAttribute('data-club') || '',
    league: row.getAttribute('data-league') || '',
    nation_region: row.getAttribute('data-nation') || '',
    nation: row.getAttribute('data-nation') || '',
    event: row.getAttribute('data-event') || '',
    ovr: toNumber(row.getAttribute('data-ovr'), 0),
    overallrating: toNumber(row.getAttribute('data-ovr'), 0),
    rating: toNumber(row.getAttribute('data-ovr'), 0),
    rank: parsedUnique.rank,
    is_untradable: parsedUnique.untradable,
    isuntradable: parsedUnique.untradable ? 1 : 0,
    skill_moves: toNumber(row.getAttribute('data-skill'), 0),
    skillmoves: toNumber(row.getAttribute('data-skill'), 0),
    pace: toNumber(row.getAttribute('data-pac'), 0),
    shooting: toNumber(row.getAttribute('data-sho'), 0),
    passing: toNumber(row.getAttribute('data-pas'), 0),
    dribbling: toNumber(row.getAttribute('data-dri'), 0),
    defending: toNumber(row.getAttribute('data-def'), 0),
    physical: toNumber(row.getAttribute('data-phy'), 0),
    price: toNumber(row.getAttribute('data-price'), 0),
    card_background: readSrc('.player-card-bg-image'),
    cardbackground: readSrc('.player-card-bg-image'),
    player_image: readSrc('.player-card-main-image'),
    playerimage: readSrc('.player-card-main-image'),
    nation_flag: readSrc('.player-view-card-nation-flag'),
    nationflag: readSrc('.player-view-card-nation-flag'),
    club_flag: readSrc('.player-view-card-club-flag'),
    clubflag: readSrc('.player-view-card-club-flag'),
    league_image: readSrc('.player-view-card-league-flag'),
    color_name: cardNameNode?.style?.color || '#FFFFFF',
    colorname: cardNameNode?.style?.color || '#FFFFFF',
    color_rating: cardOvrNode?.style?.color || '#FFB86B',
    colorrating: cardOvrNode?.style?.color || '#FFB86B',
    color_position: cardPositionNode?.style?.color || '#FFFFFF',
    colorposition: cardPositionNode?.style?.color || '#FFFFFF',
    alternate_position: alternatePosition,
    alternateposition: alternatePosition
  };
}

export default function PlayersDatabaseInteractions() {
  const statFiltersRef = useRef({
    pac: 0,
    sho: 0,
    pas: 0,
    dri: 0,
    def: 0,
    phy: 0
  });

  useEffect(() => {
    const grid = document.getElementById('players-grid');
    if (!grid) return;

    const clearFiltersButton = document.getElementById('clear-filters');
    const playerSearchInput = document.getElementById('player-search');
    const mobileSearchInput = document.getElementById('mobile-player-search');
    const resultsInfo = document.getElementById('players-results-info');
    const sortBySelect = document.getElementById('sort-by');
    const activeFilters = document.getElementById('active-filters');
    const ratingMinInput = document.getElementById('rating-min');
    const ratingMaxInput = document.getElementById('rating-max');
    const ratingLabel = document.getElementById('rating-value');
    const mobileRatingMinInput = document.getElementById('mobile-rating-min');
    const mobileRatingMaxInput = document.getElementById('mobile-rating-max');
    const mobileRatingLabel = document.getElementById('mobile-rating-value');

    const modal = document.getElementById('custom-stats-modal');
    const modalBackdrop = document.getElementById('stats-modal-backdrop');
    const openStatsButton = document.getElementById('open-stats-modal');
    const closeStatsButton = document.getElementById('close-stats-modal');
    const applyStatsButton = document.getElementById('apply-stats-filters');
    const resetStatsButton = document.getElementById('reset-stats-filters');

    const mobileFilterModal = document.getElementById('mobile-filter-modal');
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const mobileFilterBackdrop = document.getElementById('mobile-filter-backdrop');
    const mobileFilterApply = document.getElementById('mobile-apply-filters');
    const mobileFilterClear = document.getElementById('mobile-clear-filters');

    const previewPopup = document.getElementById('player-preview-popup');
    const previewContent = document.getElementById('player-preview-content');

    const cleanup = [];
    let watchlist = readWatchlist();
    let watchlistPlayers = readWatchlistPlayers();

    const getRows = () => Array.from(grid.querySelectorAll('.player-row'));
    const getSelectValue = (id) => document.getElementById(id)?.value || '';
    const getUniqueIdFromRow = (row) => row?.querySelector('.player-row-watchlist')?.getAttribute('data-unique-id') || '';

    const rebuildWatchlistPlayers = () => {
      const existingByUniqueId = new Map();
      watchlistPlayers.forEach((player) => {
        const uniqueId = getStoredPlayerUniqueId(player);
        if (uniqueId && !existingByUniqueId.has(uniqueId)) {
          existingByUniqueId.set(uniqueId, player);
        }
      });

      const rowByUniqueId = new Map();
      getRows().forEach((row) => {
        const uniqueId = getUniqueIdFromRow(row);
        if (uniqueId && !rowByUniqueId.has(uniqueId)) {
          rowByUniqueId.set(uniqueId, row);
        }
      });

      watchlistPlayers = watchlist
        .map((uniqueId) => {
          const row = rowByUniqueId.get(uniqueId);
          const existing = existingByUniqueId.get(uniqueId);
          if (row) {
            const snapshot = getPlayerSnapshotFromRow(row, uniqueId);
            if (snapshot) return existing ? { ...existing, ...snapshot } : snapshot;
          }
          if (existing) return existing;
          const parsed = parseUniqueId(uniqueId);
          if (!parsed.playerId) return null;
          return {
            unique_id: uniqueId,
            player_id: parsed.playerId,
            playerid: parsed.playerId,
            id: parsed.playerId,
            rank: parsed.rank,
            is_untradable: parsed.untradable,
            isuntradable: parsed.untradable ? 1 : 0
          };
        })
        .filter(Boolean);

      writeWatchlistPlayers(watchlistPlayers);
    };

    const updateRatingLabels = () => {
      if (ratingLabel && ratingMinInput && ratingMaxInput) {
        ratingLabel.textContent = `${ratingMinInput.value}-${ratingMaxInput.value}`;
      }
      if (mobileRatingLabel && mobileRatingMinInput && mobileRatingMaxInput) {
        mobileRatingLabel.textContent = `${mobileRatingMinInput.value}-${mobileRatingMaxInput.value}`;
      }
    };

    const resetStatsInputs = () => {
      STAT_KEYS.forEach((key) => {
        const input = document.getElementById(`stats-filter-${key}`);
        if (input) input.value = '0';
      });
    };

    const updateWatchlistButtons = () => {
      getRows().forEach((row) => {
        const button = row.querySelector('.player-row-watchlist');
        if (!button) return;
        const uniqueId = button.getAttribute('data-unique-id') || '';
        const active = watchlist.includes(uniqueId);
        button.classList.toggle('active', active);
        const icon = button.querySelector('svg');
        if (icon) icon.setAttribute('fill', active ? 'currentColor' : 'none');
      });
    };

    const renderActiveFilterChips = (chips) => {
      if (!activeFilters) return;
      if (!chips.length) {
        activeFilters.innerHTML = '';
        return;
      }
      activeFilters.innerHTML = chips
        .map((chip) => `<div class="filter-chip">${chip.label}: ${chip.value}</div>`)
        .join('');
    };

    const applyFilters = () => {
      const rows = getRows();
      const searchQuery = toText(playerSearchInput?.value || mobileSearchInput?.value);

      const position = toText(getSelectValue('filter-position'));
      const league = toText(getSelectValue('filter-league'));
      const club = toText(getSelectValue('filter-club'));
      const nation = toText(getSelectValue('filter-nation'));
      const eventName = toText(getSelectValue('filter-event'));
      const skillMoves = toText(getSelectValue('filter-skill'));

      const minRating = toNumber(ratingMinInput?.value, 40);
      const maxRating = toNumber(ratingMaxInput?.value, 150);
      const chips = [];

      if (position) chips.push({ label: 'Position', value: position.toUpperCase() });
      if (league) chips.push({ label: 'League', value: league });
      if (club) chips.push({ label: 'Club', value: club });
      if (nation) chips.push({ label: 'Nation', value: nation });
      if (eventName) chips.push({ label: 'Event', value: eventName });
      if (skillMoves) chips.push({ label: 'Skill', value: `${skillMoves}★` });
      if (minRating !== 40 || maxRating !== 150) chips.push({ label: 'OVR', value: `${minRating}-${maxRating}` });

      STAT_KEYS.forEach((key) => {
        const value = statFiltersRef.current[key] || 0;
        if (value > 0) chips.push({ label: key.toUpperCase(), value: `>=${value}` });
      });
      renderActiveFilterChips(chips);

      const visibleRows = rows.filter((row) => {
        const rowSearchValue = toText(
          `${row.dataset.name || ''} ${row.dataset.position || ''} ${row.dataset.club || ''} ${row.dataset.league || ''} ${
            row.dataset.nation || ''
          }`
        );
        if (searchQuery && !rowSearchValue.includes(searchQuery)) return false;
        if (position && toText(row.dataset.position) !== position) return false;
        if (league && toText(row.dataset.league) !== league) return false;
        if (club && toText(row.dataset.club) !== club) return false;
        if (nation && toText(row.dataset.nation) !== nation) return false;
        if (eventName && toText(row.dataset.event) !== eventName) return false;
        if (skillMoves && toText(row.dataset.skill) !== skillMoves) return false;

        const rowOvr = toNumber(row.dataset.ovr, 0);
        if (rowOvr < minRating || rowOvr > maxRating) return false;

        return STAT_KEYS.every((key) => {
          const minValue = statFiltersRef.current[key] || 0;
          if (minValue <= 0) return true;
          return toNumber(row.dataset[key], 0) >= minValue;
        });
      });

      const sortBy = sortBySelect?.value || 'name';
      visibleRows.sort((left, right) => {
        if (sortBy === 'rating') return toNumber(right.dataset.ovr, 0) - toNumber(left.dataset.ovr, 0);
        if (sortBy === 'price') return toNumber(right.dataset.price, 0) - toNumber(left.dataset.price, 0);
        return toText(left.dataset.name).localeCompare(toText(right.dataset.name));
      });

      const hiddenRows = rows.filter((row) => !visibleRows.includes(row));
      visibleRows.forEach((row) => {
        row.style.display = '';
        grid.appendChild(row);
      });
      hiddenRows.forEach((row) => {
        row.style.display = 'none';
        grid.appendChild(row);
      });

      if (resultsInfo) {
        resultsInfo.textContent = `${visibleRows.length} players shown`;
      }
      updateWatchlistButtons();
    };

    const resetFilters = () => {
      const resetMap = {
        'filter-position': '',
        'filter-league': '',
        'filter-club': '',
        'filter-nation': '',
        'filter-event': '',
        'filter-skill': ''
      };

      Object.entries(resetMap).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value;
      });
      if (playerSearchInput) playerSearchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
      if (ratingMinInput) ratingMinInput.value = '40';
      if (ratingMaxInput) ratingMaxInput.value = '150';
      if (mobileRatingMinInput) mobileRatingMinInput.value = '40';
      if (mobileRatingMaxInput) mobileRatingMaxInput.value = '150';

      statFiltersRef.current = { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 };
      resetStatsInputs();
      updateRatingLabels();
      applyFilters();
    };

    const openStatsModal = () => modal?.classList.add('open');
    const closeStatsModal = () => modal?.classList.remove('open');

    const openMobileFilters = () => {
      if (!mobileFilterModal) return;
      const syncPairs = [
        ['filter-position', 'mobile-filter-position'],
        ['filter-league', 'mobile-filter-league'],
        ['filter-club', 'mobile-filter-team'],
        ['filter-nation', 'mobile-filter-nation'],
        ['filter-event', 'mobile-filter-event'],
        ['filter-skill', 'mobile-filter-skill'],
        ['rating-min', 'mobile-rating-min'],
        ['rating-max', 'mobile-rating-max']
      ];
      syncPairs.forEach(([desktopId, mobileId]) => {
        const desktop = document.getElementById(desktopId);
        const mobile = document.getElementById(mobileId);
        if (desktop && mobile) mobile.value = desktop.value;
      });
      updateRatingLabels();
      mobileFilterModal.classList.add('active');
    };

    const closeMobileFilters = () => mobileFilterModal?.classList.remove('active');

    const applyMobileFilters = () => {
      const syncPairs = [
        ['mobile-filter-position', 'filter-position'],
        ['mobile-filter-league', 'filter-league'],
        ['mobile-filter-team', 'filter-club'],
        ['mobile-filter-nation', 'filter-nation'],
        ['mobile-filter-event', 'filter-event'],
        ['mobile-filter-skill', 'filter-skill'],
        ['mobile-rating-min', 'rating-min'],
        ['mobile-rating-max', 'rating-max']
      ];
      syncPairs.forEach(([mobileId, desktopId]) => {
        const mobile = document.getElementById(mobileId);
        const desktop = document.getElementById(desktopId);
        if (mobile && desktop) desktop.value = mobile.value;
      });
      updateRatingLabels();
      applyFilters();
      closeMobileFilters();
    };

    const updatePreviewPopup = (event) => {
      if (!previewPopup || !previewContent) return;
      const row = event.target.closest('.player-row');
      if (!row) {
        previewPopup.style.display = 'none';
        return;
      }

      const rowCard = row.querySelector('.player-row-card');
      if (!rowCard) {
        previewPopup.style.display = 'none';
        return;
      }

      previewContent.innerHTML = rowCard.outerHTML;
      previewPopup.style.display = 'block';
      previewPopup.style.left = `${event.clientX + 16}px`;
      previewPopup.style.top = `${event.clientY + 16}px`;
    };

    const hidePreviewPopup = () => {
      if (previewPopup) previewPopup.style.display = 'none';
    };

    const handleGridClick = (event) => {
      const watchlistButton = event.target.closest('.player-row-watchlist');
      if (watchlistButton) {
        event.preventDefault();
        event.stopPropagation();
        const uniqueId = watchlistButton.getAttribute('data-unique-id') || '';
        if (!uniqueId) return;
        if (watchlist.includes(uniqueId)) {
          watchlist = watchlist.filter((entry) => entry !== uniqueId);
        } else {
          watchlist = [...watchlist, uniqueId];
        }
        writeWatchlist(watchlist);
        rebuildWatchlistPlayers();
        window.dispatchEvent(new Event('watchlist-updated'));
        updateWatchlistButtons();
        return;
      }

      const row = event.target.closest('.player-row');
      if (!row) return;
      const playerId = row.getAttribute('data-player-id');
      if (!playerId) return;
      window.location.assign(`/player/${encodeURIComponent(playerId)}`);
    };

    const bindInput = (element, eventName, handler) => {
      if (!element) return;
      element.addEventListener(eventName, handler);
      cleanup.push(() => element.removeEventListener(eventName, handler));
    };

    bindInput(playerSearchInput, 'input', () => {
      if (mobileSearchInput) mobileSearchInput.value = playerSearchInput.value;
      applyFilters();
    });
    bindInput(mobileSearchInput, 'input', () => {
      if (playerSearchInput) playerSearchInput.value = mobileSearchInput.value;
      applyFilters();
    });
    bindInput(sortBySelect, 'change', applyFilters);
    bindInput(ratingMinInput, 'input', () => {
      if (mobileRatingMinInput) mobileRatingMinInput.value = ratingMinInput.value;
      updateRatingLabels();
      applyFilters();
    });
    bindInput(ratingMaxInput, 'input', () => {
      if (mobileRatingMaxInput) mobileRatingMaxInput.value = ratingMaxInput.value;
      updateRatingLabels();
      applyFilters();
    });

    ['filter-position', 'filter-league', 'filter-club', 'filter-nation', 'filter-event', 'filter-skill'].forEach((id) => {
      bindInput(document.getElementById(id), 'change', applyFilters);
    });

    bindInput(clearFiltersButton, 'click', resetFilters);
    bindInput(openStatsButton, 'click', openStatsModal);
    bindInput(closeStatsButton, 'click', closeStatsModal);
    bindInput(modalBackdrop, 'click', closeStatsModal);
    bindInput(resetStatsButton, 'click', () => {
      statFiltersRef.current = { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 };
      resetStatsInputs();
      applyFilters();
      closeStatsModal();
    });
    bindInput(applyStatsButton, 'click', () => {
      const nextFilters = { ...statFiltersRef.current };
      STAT_KEYS.forEach((key) => {
        nextFilters[key] = toNumber(document.getElementById(`stats-filter-${key}`)?.value, 0);
      });
      statFiltersRef.current = nextFilters;
      applyFilters();
      closeStatsModal();
    });

    bindInput(mobileFilterToggle, 'click', openMobileFilters);
    bindInput(mobileFilterClose, 'click', closeMobileFilters);
    bindInput(mobileFilterBackdrop, 'click', closeMobileFilters);
    bindInput(mobileFilterApply, 'click', applyMobileFilters);
    bindInput(mobileFilterClear, 'click', () => {
      resetFilters();
      closeMobileFilters();
    });

    const handleStorageChange = (event) => {
      if (!event.key || (event.key !== 'watchlist' && event.key !== 'watchlistPlayers')) return;
      watchlist = readWatchlist();
      watchlistPlayers = readWatchlistPlayers();
      rebuildWatchlistPlayers();
      updateWatchlistButtons();
      applyFilters();
    };

    const handleWatchlistUpdated = () => {
      watchlist = readWatchlist();
      watchlistPlayers = readWatchlistPlayers();
      rebuildWatchlistPlayers();
      updateWatchlistButtons();
      applyFilters();
    };

    const hydrateMarketPrices = async () => {
      const client = getSupabaseClient();
      if (!client) return;

      const tradableRows = getRows().filter((row) => {
        const uniqueId = getUniqueIdFromRow(row);
        const parsed = parseUniqueId(uniqueId);
        return !!parsed.playerId && !parsed.untradable;
      });
      if (!tradableRows.length) return;

      const playerIds = [...new Set(tradableRows.map((row) => row.getAttribute('data-player-id')).filter(Boolean))];
      if (!playerIds.length) return;

      try {
        const { data, error } = await client.from('price_snapshots').select('asset_id, price0').in('asset_id', playerIds);
        if (error) throw error;

        const priceByPlayerId = new Map();
        (data || []).forEach((entry) => {
          const price = Number(entry?.price0);
          if (!Number.isFinite(price) || price <= 0) return;
          const existing = priceByPlayerId.get(String(entry.asset_id));
          if (!Number.isFinite(existing) || price > existing) {
            priceByPlayerId.set(String(entry.asset_id), price);
          }
        });

        tradableRows.forEach((row) => {
          const rowPlayerId = String(row.getAttribute('data-player-id') || '');
          const resolvedPrice = priceByPlayerId.get(rowPlayerId) || 0;
          row.setAttribute('data-price', String(resolvedPrice));
          const priceTextNode = row.querySelector('.player-price .price-text');
          if (priceTextNode) {
            priceTextNode.textContent = resolvedPrice > 0 ? formatPrice(resolvedPrice) : 'No data';
          }
        });

        rebuildWatchlistPlayers();
        applyFilters();
      } catch (error) {
        console.error('[players] Failed to load market prices:', error);
      }
    };

    grid.addEventListener('click', handleGridClick);
    grid.addEventListener('mousemove', updatePreviewPopup);
    grid.addEventListener('mouseleave', hidePreviewPopup);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('watchlist-updated', handleWatchlistUpdated);
    cleanup.push(() => grid.removeEventListener('click', handleGridClick));
    cleanup.push(() => grid.removeEventListener('mousemove', updatePreviewPopup));
    cleanup.push(() => grid.removeEventListener('mouseleave', hidePreviewPopup));
    cleanup.push(() => window.removeEventListener('storage', handleStorageChange));
    cleanup.push(() => window.removeEventListener('watchlist-updated', handleWatchlistUpdated));

    updateRatingLabels();
    rebuildWatchlistPlayers();
    updateWatchlistButtons();
    applyFilters();
    hydrateMarketPrices();

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, []);

  return null;
}
