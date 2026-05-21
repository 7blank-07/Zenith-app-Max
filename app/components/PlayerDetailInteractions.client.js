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

    let watchlist = readWatchlist();
    let watchlistPlayers = readWatchlistPlayers();

    const getWatchlistPlayerSnapshot = (button, uniqueId) => {
      if (!button) return null;
      const parsed = parseUniqueId(uniqueId);
      const resolvedPlayerId = button.getAttribute('data-player-id') || parsed.playerId || String(playerId || '');
      const resolvedRecordId = button.getAttribute('data-record-id') || '';
      if (!resolvedPlayerId) return null;
      
      const rankValue = toNumber(button.getAttribute('data-rank'), parsed.rank);
      const isUntradable = String(button.getAttribute('data-untradable') || '')
        .trim()
        .toLowerCase();
      const normalizedUntradable = isUntradable === '1' || isUntradable === 'true' ? 1 : parsed.untradable ? 1 : 0;
      
      const pace = toNumber(button.getAttribute('data-pac'), 0);
      const shooting = toNumber(button.getAttribute('data-sho'), 0);
      const passing = toNumber(button.getAttribute('data-pas'), 0);
      const dribbling = toNumber(button.getAttribute('data-dri'), 0);
      const defending = toNumber(button.getAttribute('data-def'), 0);
      const physical = toNumber(button.getAttribute('data-phy'), 0);
      const resolvedUniqueId = uniqueId || `${resolvedPlayerId}_${rankValue}_${normalizedUntradable}`;

      return {
        unique_id: resolvedUniqueId,
        player_id: resolvedPlayerId,
        record_id: resolvedRecordId,
        playerid: resolvedPlayerId,
        id: resolvedPlayerId,
        name: button.getAttribute('data-player-name') || 'Unknown',
        position: button.getAttribute('data-position') || '',
        team: button.getAttribute('data-team') || button.getAttribute('data-club') || '',
        club: button.getAttribute('data-club') || button.getAttribute('data-team') || '',
        league: button.getAttribute('data-league') || '',
        nation_region: button.getAttribute('data-nation') || '',
        nation: button.getAttribute('data-nation') || '',
        event: button.getAttribute('data-event') || '',
        ovr: toNumber(button.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        overallrating: toNumber(button.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        rating: toNumber(button.getAttribute('data-ovr'), normalizedBaseOvr + normalizedRank),
        rank: rankValue,
        is_untradable: normalizedUntradable === 1,
        isuntradable: normalizedUntradable,
        skill_moves: toNumber(button.getAttribute('data-skill'), 0),
        skillmoves: toNumber(button.getAttribute('data-skill'), 0),
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical,
        price: toNumber(button.getAttribute('data-price'), 0),
        card_background: button.getAttribute('data-card-background') || '',
        cardbackground: button.getAttribute('data-card-background') || '',
        player_image: button.getAttribute('data-player-image') || '',
        playerimage: button.getAttribute('data-player-image') || '',
        nation_flag: button.getAttribute('data-nation-flag') || '',
        nationflag: button.getAttribute('data-nation-flag') || '',
        club_flag: button.getAttribute('data-club-flag') || '',
        clubflag: button.getAttribute('data-club-flag') || '',
        league_image: button.getAttribute('data-league-image') || '',
        color_name: button.getAttribute('data-color-name') || '#FFFFFF',
        colorname: button.getAttribute('data-color-name') || '#FFFFFF',
        color_rating: button.getAttribute('data-color-rating') || '#FFB86B',
        colorrating: button.getAttribute('data-color-rating') || '#FFB86B',
        color_position: button.getAttribute('data-color-position') || '#FFFFFF',
        colorposition: button.getAttribute('data-color-position') || '#FFFFFF',
        alternate_position: button.getAttribute('data-alternate-position') || '',
        alternateposition: button.getAttribute('data-alternate-position') || ''
      };
    };

    const upsertWatchlistPlayer = (button, uniqueId) => {
      const snapshot = getWatchlistPlayerSnapshot(button, uniqueId);
      if (!snapshot) return;
      const existingIndex = watchlistPlayers.findIndex((player) => getStoredPlayerUniqueId(player) === uniqueId);
      if (existingIndex === -1) {
        watchlistPlayers = [...watchlistPlayers, snapshot];
      } else {
        watchlistPlayers = watchlistPlayers.map((player, index) =>
          index === existingIndex ? { ...player, ...snapshot } : player
        );
      }
    };

    const removeWatchlistPlayer = (uniqueId) => {
      watchlistPlayers = watchlistPlayers.filter((player) => getStoredPlayerUniqueId(player) !== uniqueId);
    };

    const syncWatchlistButton = () => {
      const btn = root.querySelector('[data-watchlist-toggle]');
      if (!btn) return;
      const uniqueId = btn.getAttribute('data-unique-id') || '';
      const active = !!uniqueId && watchlist.includes(uniqueId);
      
      btn.style.background = active ? 'rgba(0,194,168,0.15)' : 'transparent';
      btn.style.borderColor = active ? 'var(--color-teal-500, #00C2A8)' : 'rgba(255,255,255,0.15)';
      btn.style.color = active ? 'var(--color-teal-500, #00C2A8)' : 'var(--color-text-muted, #98A0A6)';
      btn.setAttribute('aria-label', active ? 'In watchlist' : 'Add to watchlist');
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      
      const label = btn.querySelector('[data-watchlist-label]');
      if (label) label.textContent = active ? 'In Watchlist' : 'Add to Watchlist';
      
      const icon = btn.querySelector('svg');
      if (icon) icon.setAttribute('fill', active ? 'currentColor' : 'none');
    };

    const handleWatchlistToggle = (event) => {
      const btn = event.target.closest('[data-watchlist-toggle]');
      if (!btn) return;
      
      event.preventDefault();
      const uniqueId = btn.getAttribute('data-unique-id') || '';
      if (!uniqueId) return;
      
      // Always re-read to avoid race conditions with other components
      watchlist = readWatchlist();
      watchlistPlayers = readWatchlistPlayers();

      if (watchlist.includes(uniqueId)) {
        watchlist = watchlist.filter((entry) => entry !== uniqueId);
        removeWatchlistPlayer(uniqueId);
      } else {
        watchlist = [...new Set([...watchlist, uniqueId])];
        upsertWatchlistPlayer(btn, uniqueId);
      }
      
      writeWatchlist(watchlist);
      writeWatchlistPlayers(watchlistPlayers);
      window.dispatchEvent(new Event('watchlist-updated'));
      syncWatchlistButton();
    };

    // Use delegated listener on root to survive re-renders of the button
    root.addEventListener('click', handleWatchlistToggle);
    cleanup.push(() => root.removeEventListener('click', handleWatchlistToggle));

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

    // Initial sync
    syncWatchlistButton();

    const handleBack = (event) => {
      if (event.target.closest('[data-go-back]')) {
        router.push('/players');
      }
    };
    root.addEventListener('click', handleBack);
    cleanup.push(() => root.removeEventListener('click', handleBack));

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, [playerId, currentRank, baseOvr, router]);

  return null;
}

