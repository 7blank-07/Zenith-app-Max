'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function toNumber(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readWatchlist() {
  try {
    const raw = window.localStorage.getItem('watchlist');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry)) : [];
  } catch (error) {
    console.error('[player-detail] Failed to read watchlist:', error);
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
    console.error('[player-detail] Failed to read watchlistPlayers:', error);
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

export default function PlayerDetailInteractions({ playerId, currentRank = 0, baseOvr = 0 }) {
  const router = useRouter();

  useEffect(() => {
    const root = document.getElementById('player-detail-view');
    if (!root) return;

    const cleanup = [];
    const normalizedRank = toNumber(currentRank, 0);
    const normalizedBaseOvr = toNumber(baseOvr, 0);

    const watchlistButton = root.querySelector('[data-watchlist-toggle]');
    let watchlist = readWatchlist();
    let watchlistPlayers = readWatchlistPlayers();

    const getWatchlistPlayerSnapshot = (uniqueId) => {
      if (!watchlistButton) return null;
      const parsed = parseUniqueId(uniqueId);
      const resolvedPlayerId = watchlistButton.getAttribute('data-player-id') || parsed.playerId || String(playerId || '');
      if (!resolvedPlayerId) return null;
      const rankValue = toNumber(watchlistButton.getAttribute('data-rank'), parsed.rank);
      const isUntradable = String(watchlistButton.getAttribute('data-untradable') || '')
        .trim()
        .toLowerCase();
      const normalizedUntradable = isUntradable === '1' || isUntradable === 'true' ? 1 : parsed.untradable ? 1 : 0;
      const resolvedUniqueId = uniqueId || `${resolvedPlayerId}_${rankValue}_${normalizedUntradable}`;

      return {
        unique_id: resolvedUniqueId,
        player_id: resolvedPlayerId,
        playerid: resolvedPlayerId,
        id: resolvedPlayerId,
        name: watchlistButton.getAttribute('data-player-name') || 'Unknown',
        position: watchlistButton.getAttribute('data-position') || '',
        team: watchlistButton.getAttribute('data-team') || watchlistButton.getAttribute('data-club') || '',
        club: watchlistButton.getAttribute('data-club') || watchlistButton.getAttribute('data-team') || '',
        league: watchlistButton.getAttribute('data-league') || '',
        nation_region: watchlistButton.getAttribute('data-nation') || '',
        nation: watchlistButton.getAttribute('data-nation') || '',
        event: watchlistButton.getAttribute('data-event') || '',
        ovr: toNumber(watchlistButton.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        overallrating: toNumber(watchlistButton.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        rating: toNumber(watchlistButton.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        rank: rankValue,
        is_untradable: normalizedUntradable === 1,
        isuntradable: normalizedUntradable,
        skill_moves: toNumber(watchlistButton.getAttribute('data-skill'), 0),
        skillmoves: toNumber(watchlistButton.getAttribute('data-skill'), 0),
        price: toNumber(watchlistButton.getAttribute('data-price'), 0),
        card_background: watchlistButton.getAttribute('data-card-background') || '',
        cardbackground: watchlistButton.getAttribute('data-card-background') || '',
        player_image: watchlistButton.getAttribute('data-player-image') || '',
        playerimage: watchlistButton.getAttribute('data-player-image') || '',
        nation_flag: watchlistButton.getAttribute('data-nation-flag') || '',
        nationflag: watchlistButton.getAttribute('data-nation-flag') || '',
        club_flag: watchlistButton.getAttribute('data-club-flag') || '',
        clubflag: watchlistButton.getAttribute('data-club-flag') || '',
        league_image: watchlistButton.getAttribute('data-league-image') || '',
        color_name: watchlistButton.getAttribute('data-color-name') || '#FFFFFF',
        colorname: watchlistButton.getAttribute('data-color-name') || '#FFFFFF',
        color_rating: watchlistButton.getAttribute('data-color-rating') || '#FFB86B',
        colorrating: watchlistButton.getAttribute('data-color-rating') || '#FFB86B',
        color_position: watchlistButton.getAttribute('data-color-position') || '#FFFFFF',
        colorposition: watchlistButton.getAttribute('data-color-position') || '#FFFFFF',
        alternate_position: watchlistButton.getAttribute('data-alternate-position') || '',
        alternateposition: watchlistButton.getAttribute('data-alternate-position') || ''
      };
    };

    const upsertWatchlistPlayer = (uniqueId) => {
      const snapshot = getWatchlistPlayerSnapshot(uniqueId);
      if (!snapshot) return;
      const existingIndex = watchlistPlayers.findIndex((player) => getStoredPlayerUniqueId(player) === uniqueId);
      if (existingIndex === -1) {
        watchlistPlayers = [...watchlistPlayers, snapshot];
        return;
      }
      watchlistPlayers = watchlistPlayers.map((player, index) =>
        index === existingIndex ? { ...player, ...snapshot } : player
      );
    };

    const removeWatchlistPlayer = (uniqueId) => {
      watchlistPlayers = watchlistPlayers.filter((player) => getStoredPlayerUniqueId(player) !== uniqueId);
    };

    const syncWatchlistButton = () => {
      if (!watchlistButton) return;
      const uniqueId = watchlistButton.getAttribute('data-unique-id') || '';
      const active = !!uniqueId && watchlist.includes(uniqueId);
      watchlistButton.style.background = active ? 'rgba(0,194,168,0.15)' : 'transparent';
      watchlistButton.style.borderColor = active ? 'var(--color-teal-500, #00C2A8)' : 'rgba(255,255,255,0.15)';
      watchlistButton.style.color = active ? 'var(--color-teal-500, #00C2A8)' : 'var(--color-text-muted, #98A0A6)';
      watchlistButton.setAttribute('aria-label', active ? 'In watchlist' : 'Add to watchlist');
      watchlistButton.setAttribute('aria-pressed', active ? 'true' : 'false');
      const label = watchlistButton.querySelector('[data-watchlist-label]');
      if (label) label.textContent = active ? 'In Watchlist' : 'Add to Watchlist';
      const icon = watchlistButton.querySelector('svg');
      if (icon) icon.setAttribute('fill', active ? 'currentColor' : 'none');
    };

    const handleWatchlistToggle = (event) => {
      event.preventDefault();
      if (!watchlistButton) return;
      const uniqueId = watchlistButton.getAttribute('data-unique-id') || '';
      if (!uniqueId) return;
      if (watchlist.includes(uniqueId)) {
        watchlist = watchlist.filter((entry) => entry !== uniqueId);
        removeWatchlistPlayer(uniqueId);
      } else {
        watchlist = [...watchlist, uniqueId];
        upsertWatchlistPlayer(uniqueId);
      }
      writeWatchlist(watchlist);
      writeWatchlistPlayers(watchlistPlayers);
      window.dispatchEvent(new Event('watchlist-updated'));
      syncWatchlistButton();
    };

    if (watchlistButton) {
      watchlistButton.addEventListener('click', handleWatchlistToggle);
      cleanup.push(() => watchlistButton.removeEventListener('click', handleWatchlistToggle));
      syncWatchlistButton();
    }

    const handleStorageChange = (event) => {
      if (!event.key || (event.key !== 'watchlist' && event.key !== 'watchlistPlayers')) return;
      watchlist = readWatchlist();
      watchlistPlayers = readWatchlistPlayers();
      syncWatchlistButton();
    };
    const handleWatchlistUpdated = () => {
      watchlist = readWatchlist();
      watchlistPlayers = readWatchlistPlayers();
      syncWatchlistButton();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('watchlist-updated', handleWatchlistUpdated);
    cleanup.push(() => window.removeEventListener('storage', handleStorageChange));
    cleanup.push(() => window.removeEventListener('watchlist-updated', handleWatchlistUpdated));

    const handleBack = () => router.push('/players');
    const backButton = root.querySelector('[data-go-back]');
    if (backButton) {
      backButton.addEventListener('click', handleBack);
      cleanup.push(() => backButton.removeEventListener('click', handleBack));
    }

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, [playerId, currentRank, baseOvr, router]);

  return null;
}
