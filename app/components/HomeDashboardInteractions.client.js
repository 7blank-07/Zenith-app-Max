'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { normalizeSearchText } from './search-normalization';
import { UNTRADABLE_CARD_BADGE_URL } from './image-asset-urls';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default function HomeDashboardInteractions() {
  const router = useRouter();

  useEffect(() => {
    const cleanup = [];
    const navigate = (path) => {
      if (!path) return;
      router.push(path);
    };

    let searchInitialized = false;

    const setupDeferredSearch = () => {
      if (searchInitialized) return;

      const homeSearchInput = document.getElementById('home-search');
      const searchDropdown = document.getElementById('search-dropdown');
      const searchResultsDropdown = document.getElementById('search-results-dropdown');
      if (homeSearchInput && searchDropdown && searchResultsDropdown) {
        searchInitialized = true;
        let selectedDropdownIndex = -1;
        let activeResults = [];
        let searchTimeoutId = null;
        let searchRequestId = 0;
        let activeController = null;

        const closeDropdown = () => {
          searchDropdown.classList.remove('active');
          selectedDropdownIndex = -1;
        };

        const renderNoResults = (query) => {
          searchResultsDropdown.innerHTML = `
            <div class="dropdown-no-results">
              <p>No players found for "${escapeHtml(query)}"</p>
            </div>
          `;
        };

        const renderDropdownResults = (results) => {
          searchResultsDropdown.innerHTML = '';
          const fragment = document.createDocumentFragment();

          results.forEach((player) => {
            const variant = player.leagueImage ? 'normal' : 'hero';
            const cardBackground = escapeHtml(player.cardBackground || 'https://via.placeholder.com/300x400');
            const playerImage = escapeHtml(player.playerImage || 'https://via.placeholder.com/256');
            const playerName = escapeHtml(player.name || 'Unknown');
            const playerPosition = escapeHtml(player.position || 'N/A');
            const ovrText = escapeHtml(player.ovrText);
            const ratingColor = escapeHtml(player.colorRating || '#FFFFFF');
            const positionColor = escapeHtml(player.colorPosition || '#FFFFFF');
            const nameColor = escapeHtml(player.colorName || '#FFFFFF');
            const untradableBadgeUrl = escapeHtml(UNTRADABLE_CARD_BADGE_URL);
            const row = document.createElement('div');
            row.className = 'dropdown-player-row';
            row.setAttribute('data-player-id', player.playerId);
            row.innerHTML = `
              <div class="dropdown-player-card">
                <div class="dashboard-player-card">
                  <div class="card-container">
                    <img src="${cardBackground}" alt="Card Background" class="card-background-img" width="300" height="400" loading="lazy">
                    <img src="${playerImage}" alt="${playerName}" class="player-image-img" width="256" height="256" loading="lazy">
                    <div class="card-ovr" style="color: ${ratingColor}"><span translate="no" class="notranslate">${ovrText}</span></div>
                    <div class="card-position" style="color: ${positionColor}"><span translate="no" class="notranslate">${playerPosition}</span></div>
                    <div class="card-player-name" style="color: ${nameColor}"><span translate="no" class="notranslate">${playerName}</span></div>
                    ${
                      player.nationFlag
                        ? `<img src="${escapeHtml(player.nationFlag)}" alt="Nation" class="card-nation-flag-home ${
                          variant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
                        }" width="18" height="18" loading="lazy">`
                        : ''
                    }
                    ${
                      player.clubFlag
                        ? `<img src="${escapeHtml(player.clubFlag)}" alt="Club" class="card-club-flag-home ${
                          variant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'
                        }" width="18" height="18" loading="lazy">`
                        : ''
                    }
                    ${
                      variant === 'normal' && player.leagueImage
                        ? `<img src="${escapeHtml(player.leagueImage)}" alt="League" class="card-league-flag-home normal-league-flag-home" width="18" height="18" loading="lazy">`
                        : ''
                    }
                    ${
                      player.isUntradable
                        ? `<div class="card-untradable-badge card-untradable-badge--players">
                            <img src="${untradableBadgeUrl}" alt="Untradable" width="16" height="16" loading="lazy">
                          </div>`
                        : ''
                    }
                  </div>
                </div>
              </div>
              <div class="dropdown-player-info">
                <div class="dropdown-player-name">${playerName}</div>
                <span class="dropdown-player-badge ${player.isUntradable ? 'non-auctionable' : 'auctionable'}">
                  ${player.isUntradable ? '🔴 Non-auctionable' : '✅ Auctionable'}
                </span>
              </div>
               <div class="dropdown-player-stats">
                 <div class="dropdown-player-ovr">${ovrText}</div>
                 <div class="dropdown-player-position">${playerPosition}</div>
               </div>
             `;

            row.addEventListener('click', () => {
              if (!player.playerPath) return;
              closeDropdown();
              homeSearchInput.value = '';
              navigate(player.playerPath);
            });

            fragment.appendChild(row);
          });
          searchResultsDropdown.appendChild(fragment);
        };

        const toText = (value, fallback = '') => {
          if (value === null || value === undefined) return fallback;
          const text = String(value).trim();
          return text || fallback;
        };

        const toNumber = (value, fallback = 0) => {
          const number = Number(value);
          return Number.isFinite(number) ? number : fallback;
        };

        const toPlayerCard = (player) => {
          const playerId = toText(player?.playerId || player?.player_id || player?.playerid || player?.id);
          if (!playerId) return null;

          const recordId = toText(player?.recordId || player?.record_id || player?.recordId || player?.id || playerId);
          const name = toText(player?.name, 'Unknown Player');
          const ovr = toNumber(player?.ovr || player?.rating, 0);
          const position = toText(player?.position, 'N/A');
          const isUntradableText = toText(player?.isUntradable ?? player?.is_untradable ?? player?.isuntradable).toLowerCase();
          const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
          const ovrText = ovr > 0 ? String(ovr) : 'N/A';

          return {
            playerId,
            recordId,
            name,
            ovr,
            position,
            playerPath: buildPlayerPath({ playerId, recordId, name, ovr }),
            cardBackground: toText(player?.cardBackground || player?.card_background || player?.cardbackground),
            playerImage: toText(player?.playerImage || player?.player_image || player?.playerimage || player?.image),
            nationFlag: toText(player?.nationFlag || player?.nation_flag),
            clubFlag: toText(player?.clubFlag || player?.club_flag),
            leagueImage: toText(player?.leagueImage || player?.league_image),
            colorRating: toText(player?.colorRating || player?.color_rating || '#FFFFFF', '#FFFFFF'),
            colorPosition: toText(player?.colorPosition || player?.color_position || '#FFFFFF', '#FFFFFF'),
            colorName: toText(player?.colorName || player?.color_name || '#FFFFFF', '#FFFFFF'),
            ovrText,
            isUntradable
          };
        };

        const loadSearchResults = async (rawQuery, requestId) => {
          if (activeController) activeController.abort();
          activeController = new AbortController();

          const params = new URLSearchParams({
            q: rawQuery,
            limit: '20',
            offset: '0',
            rank: '0'
          });

          const response = await fetch(`/internal-api/players/search?${params.toString()}`, {
            cache: 'no-store',
            signal: activeController.signal
          });

          let payload = {};
          try {
            payload = await response.json();
          } catch {
            payload = {};
          }

          if (!response.ok) {
            const message = toText(payload?.error || payload?.detail, `Search failed (${response.status})`);
            throw new Error(message);
          }

          if (requestId !== searchRequestId) return;

          const rows = Array.isArray(payload?.players)
            ? payload.players
            : Array.isArray(payload?.results)
              ? payload.results
              : Array.isArray(payload)
                ? payload
                : [];
          activeResults = rows.map(toPlayerCard).filter(Boolean);
          selectedDropdownIndex = -1;

          if (!activeResults.length) {
            renderNoResults(rawQuery);
            return;
          }

          renderDropdownResults(activeResults);
        };

        const updateSelection = () => {
          const rows = searchResultsDropdown.children;
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (i === selectedDropdownIndex) {
              row.style.background = 'rgba(0, 194, 168, 0.08)';
              row.style.borderColor = 'var(--color-teal-500)';
            } else {
              row.style.background = '';
              row.style.borderColor = '';
            }
          }
        };

        const applySearch = () => {
          const rawQuery = String(homeSearchInput.value || '').trim();
          const normalizedQuery = normalizeSearchText(rawQuery);
          if (normalizedQuery.length < 2) {
            searchResultsDropdown.innerHTML = '';
            closeDropdown();
            activeResults = [];
            if (activeController) activeController.abort();
            if (searchTimeoutId) window.clearTimeout(searchTimeoutId);
            return;
          }

          searchDropdown.classList.add('active');
          searchResultsDropdown.innerHTML = `
            <div class="dropdown-loading">
              <p style="color: var(--color-text-muted); font-size: 13px;">Searching...</p>
            </div>
          `;

          if (searchTimeoutId) window.clearTimeout(searchTimeoutId);
          const requestId = ++searchRequestId;
          searchTimeoutId = window.setTimeout(async () => {
            try {
              await loadSearchResults(rawQuery, requestId);
            } catch (error) {
              if (error?.name === 'AbortError') return;
              searchResultsDropdown.innerHTML = `
                <div class="dropdown-no-results">
                  <p style="color: var(--color-status-error);">Search error. Please try again.</p>
                </div>
              `;
            }
          }, 300);
        };

        const onSearchKeydown = (event) => {
          if (!searchDropdown.classList.contains('active')) return;
          const rows = Array.from(searchResultsDropdown.querySelectorAll('.dropdown-player-row'));
          if (!rows.length) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedDropdownIndex = selectedDropdownIndex < rows.length - 1 ? selectedDropdownIndex + 1 : 0;
            updateSelection();
            return;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedDropdownIndex = selectedDropdownIndex > 0 ? selectedDropdownIndex - 1 : rows.length - 1;
            updateSelection();
            return;
          }
          if (event.key === 'Enter' && selectedDropdownIndex >= 0) {
            event.preventDefault();
            rows[selectedDropdownIndex]?.click();
          }
        };

        const onSearchFocus = () => {
          if (normalizeSearchText(homeSearchInput.value).length >= 2) {
            applySearch();
          }
        };

        const onClickOutside = (event) => {
          if (searchDropdown.contains(event.target) || homeSearchInput.contains(event.target)) return;
          closeDropdown();
        };

        homeSearchInput.addEventListener('input', applySearch);
        homeSearchInput.addEventListener('focus', onSearchFocus);
        homeSearchInput.addEventListener('keydown', onSearchKeydown);
        document.addEventListener('click', onClickOutside);

        cleanup.push(() => homeSearchInput.removeEventListener('input', applySearch));
        cleanup.push(() => homeSearchInput.removeEventListener('focus', onSearchFocus));
        cleanup.push(() => homeSearchInput.removeEventListener('keydown', onSearchKeydown));
        cleanup.push(() => document.removeEventListener('click', onClickOutside));
        cleanup.push(() => {
          if (searchTimeoutId) window.clearTimeout(searchTimeoutId);
          if (activeController) activeController.abort();
        });

        // Trigger search if focus happens and input already exists
        if (document.activeElement === homeSearchInput && normalizeSearchText(homeSearchInput.value).length >= 2) {
          applySearch();
        }
      }
    };

    // Setup critical path: Card clicks + Search trigger
    const setupCritical = () => {
      const handleCardClick = (event) => {
        const card = event.target?.closest?.('.dashboard-player-card[data-player-id]');
        if (!card) return;
        const playerPath = card.getAttribute('data-player-link');
        if (playerPath) {
          navigate(playerPath);
          return;
        }
        const playerId = card.getAttribute('data-player-id');
        if (!playerId) return;
        navigate(
          buildPlayerPath({
            playerId,
            recordId: card.getAttribute('data-record-id') || '',
            name: card.getAttribute('data-player-name') || '',
            ovr: Number.parseInt(card.getAttribute('data-player-ovr') || '0', 10) || 0
          })
        );
      };
      document.addEventListener('click', handleCardClick);
      cleanup.push(() => document.removeEventListener('click', handleCardClick));

      const homeSearchInput = document.getElementById('home-search');
      if (homeSearchInput) {
        const onFirstInteraction = () => {
          setupDeferredSearch();
          homeSearchInput.removeEventListener('focus', onFirstInteraction);
          homeSearchInput.removeEventListener('input', onFirstInteraction);
        };
        homeSearchInput.addEventListener('focus', onFirstInteraction);
        homeSearchInput.addEventListener('input', onFirstInteraction);
        cleanup.push(() => {
          homeSearchInput.removeEventListener('focus', onFirstInteraction);
          homeSearchInput.removeEventListener('input', onFirstInteraction);
        });
      }
    };

    setupCritical();

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, [router]);

  return null;
}
