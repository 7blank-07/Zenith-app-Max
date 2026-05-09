'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildPlayerPath } from '../../src/lib/player-slug.mjs';
import { normalizeSearchText } from './search-normalization';

const TOOL_ROUTE_MAP = Object.freeze({
  compare: '/tools/player-compare',
  squadbuilder: '/tools/squad-builder'
});

const VIEW_ROUTE_MAP = Object.freeze({
  dashboard: '/',
  database: '/players',
  players: '/players',
  market: '/market',
  watchlist: '/tools/watchlist'
});

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getInitials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function HomeDashboardInteractions() {
  const router = useRouter();

  useEffect(() => {
    const cleanup = [];
    const navigate = (path) => {
      if (!path) return;
      router.push(path);
    };

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

    const slides = Array.from(document.querySelectorAll('.hero-banner-slider .banner-slide'));
    const bannerSlider = document.querySelector('.hero-banner-slider');
    const dots = Array.from(document.querySelectorAll('.banner-dot'));
    const prevButton = document.querySelector('.banner-prev');
    const nextButton = document.querySelector('.banner-next');
    let currentSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
    let intervalId = null;
    let suppressBannerClickUntil = 0;
    let swipeStartPoint = null;
    let swipeCurrentPoint = null;

    const showSlide = (index) => {
      if (!slides.length) return;
      const bounded = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === bounded);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === bounded);
      });
      currentSlide = bounded;
    };

    const restartAutoPlay = () => {
      if (intervalId) window.clearInterval(intervalId);
      if (!slides.length) return;
      intervalId = window.setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
    };

    const handlePrev = () => {
      showSlide(currentSlide - 1);
      restartAutoPlay();
    };
    const handleNext = () => {
      showSlide(currentSlide + 1);
      restartAutoPlay();
    };

    if (prevButton) {
      prevButton.addEventListener('click', handlePrev);
      cleanup.push(() => prevButton.removeEventListener('click', handlePrev));
    }
    if (nextButton) {
      nextButton.addEventListener('click', handleNext);
      cleanup.push(() => nextButton.removeEventListener('click', handleNext));
    }

    dots.forEach((dot, index) => {
      const handleDotClick = () => {
        showSlide(index);
        restartAutoPlay();
      };
      dot.addEventListener('click', handleDotClick);
      cleanup.push(() => dot.removeEventListener('click', handleDotClick));
    });

    slides.forEach((slide) => {
      const handleSlideClick = () => {
        if (Date.now() < suppressBannerClickUntil) return;
        const redirectType = slide.getAttribute('data-redirect');
        const target = slide.getAttribute('data-target');
        if (!redirectType || !target) return;

        if (redirectType === 'view') {
          navigate(VIEW_ROUTE_MAP[target] || '/');
          return;
        }
        if (redirectType === 'tool') {
          navigate(TOOL_ROUTE_MAP[target] || '/tools');
          return;
        }
        if (redirectType === 'external') {
          window.open(target, '_blank', 'noopener,noreferrer');
        }
      };
      slide.addEventListener('click', handleSlideClick);
      cleanup.push(() => slide.removeEventListener('click', handleSlideClick));
    });

    if (bannerSlider) {
      const SWIPE_THRESHOLD = 35;

      const handleSwipe = (deltaX, deltaY) => {
        const horizontalSwipe = Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY);
        if (!horizontalSwipe) return;
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
        suppressBannerClickUntil = Date.now() + 250;
      };

      if ('PointerEvent' in window) {
        const handlePointerDown = (event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          swipeStartPoint = { x: event.clientX, y: event.clientY };
          swipeCurrentPoint = { x: event.clientX, y: event.clientY };
          if (typeof bannerSlider.setPointerCapture === 'function') {
            bannerSlider.setPointerCapture(event.pointerId);
          }
        };

        const handlePointerMove = (event) => {
          if (!swipeStartPoint) return;
          swipeCurrentPoint = { x: event.clientX, y: event.clientY };
        };

        const handlePointerEnd = (event) => {
          if (!swipeStartPoint) return;
          const endPoint = swipeCurrentPoint || { x: event.clientX, y: event.clientY };
          const deltaX = endPoint.x - swipeStartPoint.x;
          const deltaY = endPoint.y - swipeStartPoint.y;
          handleSwipe(deltaX, deltaY);
          swipeStartPoint = null;
          swipeCurrentPoint = null;
          if (typeof bannerSlider.releasePointerCapture === 'function') {
            bannerSlider.releasePointerCapture(event.pointerId);
          }
        };

        const handlePointerCancel = (event) => {
          swipeStartPoint = null;
          swipeCurrentPoint = null;
          if (typeof bannerSlider.releasePointerCapture === 'function' && bannerSlider.hasPointerCapture?.(event.pointerId)) {
            bannerSlider.releasePointerCapture(event.pointerId);
          }
        };

        bannerSlider.addEventListener('pointerdown', handlePointerDown, { passive: true });
        bannerSlider.addEventListener('pointermove', handlePointerMove, { passive: true });
        bannerSlider.addEventListener('pointerup', handlePointerEnd, { passive: true });
        bannerSlider.addEventListener('pointercancel', handlePointerCancel, { passive: true });
        cleanup.push(() => bannerSlider.removeEventListener('pointerdown', handlePointerDown));
        cleanup.push(() => bannerSlider.removeEventListener('pointermove', handlePointerMove));
        cleanup.push(() => bannerSlider.removeEventListener('pointerup', handlePointerEnd));
        cleanup.push(() => bannerSlider.removeEventListener('pointercancel', handlePointerCancel));
      } else {
        const handleTouchStart = (event) => {
          const touch = event.touches?.[0];
          if (!touch) return;
          swipeStartPoint = { x: touch.clientX, y: touch.clientY };
          swipeCurrentPoint = { x: touch.clientX, y: touch.clientY };
        };

        const handleTouchMove = (event) => {
          const touch = event.touches?.[0];
          if (!swipeStartPoint || !touch) return;
          swipeCurrentPoint = { x: touch.clientX, y: touch.clientY };
        };

        const handleTouchEnd = (event) => {
          const touch = event.changedTouches?.[0];
          const endPoint = touch
            ? { x: touch.clientX, y: touch.clientY }
            : swipeCurrentPoint;
          if (!swipeStartPoint || !endPoint) {
            swipeStartPoint = null;
            swipeCurrentPoint = null;
            return;
          }
          const deltaX = endPoint.x - swipeStartPoint.x;
          const deltaY = endPoint.y - swipeStartPoint.y;
          handleSwipe(deltaX, deltaY);
          swipeStartPoint = null;
          swipeCurrentPoint = null;
        };

        const handleTouchCancel = () => {
          swipeStartPoint = null;
          swipeCurrentPoint = null;
        };

        bannerSlider.addEventListener('touchstart', handleTouchStart, { passive: true });
        bannerSlider.addEventListener('touchmove', handleTouchMove, { passive: true });
        bannerSlider.addEventListener('touchend', handleTouchEnd, { passive: true });
        bannerSlider.addEventListener('touchcancel', handleTouchCancel, { passive: true });
        cleanup.push(() => bannerSlider.removeEventListener('touchstart', handleTouchStart));
        cleanup.push(() => bannerSlider.removeEventListener('touchmove', handleTouchMove));
        cleanup.push(() => bannerSlider.removeEventListener('touchend', handleTouchEnd));
        cleanup.push(() => bannerSlider.removeEventListener('touchcancel', handleTouchCancel));
      }
    }

    showSlide(currentSlide);
    restartAutoPlay();
    cleanup.push(() => {
      if (intervalId) window.clearInterval(intervalId);
    });

    const homeSearchInput = document.getElementById('home-search');
    const searchDropdown = document.getElementById('search-dropdown');
    const searchResultsDropdown = document.getElementById('search-results-dropdown');
    if (homeSearchInput && searchDropdown && searchResultsDropdown) {
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
        results.forEach((player) => {
          const variant = player.leagueImage ? 'normal' : 'hero';
          const row = document.createElement('div');
          row.className = 'dropdown-player-row';
          row.setAttribute('data-player-id', player.playerId);
          row.innerHTML = `
            <div class="dropdown-player-card">
              <div class="squad-custom-mini-card dropdown-mini-card">
                 <img src="${escapeHtml(player.cardBackground || 'https://via.placeholder.com/120x160')}" alt="Card Background" class="squad-custom-card-bg">
                 ${
                   player.playerImage
                     ? `<img src="${escapeHtml(player.playerImage)}" alt="${escapeHtml(player.name)}" class="squad-custom-card-player-img">
                        <span class="player-initials" style="display:none">${escapeHtml(getInitials(player.name))}</span>`
                    : `<span class="player-initials">${escapeHtml(getInitials(player.name))}</span>`
                }
                <div class="squad-custom-card-ovr" style="color: ${escapeHtml(player.colorRating || '#FFFFFF')}">${escapeHtml(player.ovrText)}</div>
                <div class="squad-custom-card-position" style="color: ${escapeHtml(player.colorPosition || '#FFFFFF')}">${escapeHtml(player.position || 'N/A')}</div>
                <div class="squad-custom-card-name" style="color: ${escapeHtml(player.colorName || '#FFFFFF')}">${escapeHtml(player.name || 'Unknown')}</div>
                ${
                  player.nationFlag
                    ? `<img src="${escapeHtml(player.nationFlag)}" alt="Nation" class="dropdown-card-flag-nation ${variant === 'normal' ? 'normal-dropdown-nation-flag' : 'hero-icon-dropdown-nation-flag'}">`
                    : ''
                }
                ${
                  player.clubFlag
                    ? `<img src="${escapeHtml(player.clubFlag)}" alt="Club" class="dropdown-card-flag-club ${variant === 'normal' ? 'normal-dropdown-club-flag' : 'hero-icon-dropdown-club-flag'}">`
                    : ''
                }
                ${
                  variant === 'normal' && player.leagueImage
                    ? `<img src="${escapeHtml(player.leagueImage)}" alt="League" class="dropdown-card-flag-league normal-dropdown-league-flag">`
                    : ''
                }
              </div>
            </div>
            <div class="dropdown-player-info">
              <div class="dropdown-player-name">${escapeHtml(player.name || 'Unknown')}</div>
              <span class="dropdown-player-badge ${player.isUntradable ? 'non-auctionable' : 'auctionable'}">
                ${player.isUntradable ? '🔴 Non-auctionable' : '✅ Auctionable'}
              </span>
            </div>
             <div class="dropdown-player-stats">
               <div class="dropdown-player-ovr">${escapeHtml(player.ovrText)}</div>
               <div class="dropdown-player-position">${escapeHtml(player.position || 'N/A')}</div>
             </div>
           `;

          row.addEventListener('click', () => {
            if (!player.playerPath) return;
            closeDropdown();
            homeSearchInput.value = '';
            navigate(player.playerPath);
          });

          searchResultsDropdown.appendChild(row);
        });
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
        const playerId = toText(player?.player_id || player?.playerid || player?.id);
        if (!playerId) return null;

        const recordId = toText(player?.record_id || player?.recordId || player?.id || playerId);
        const name = toText(player?.name, 'Unknown Player');
        const ovr = toNumber(player?.ovr, 0);
        const position = toText(player?.position, 'N/A');
        const isUntradableText = toText(player?.is_untradable || player?.isuntradable).toLowerCase();
        const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
        const ovrText = ovr > 0 ? String(ovr) : 'N/A';

        return {
          playerId,
          recordId,
          name,
          ovr,
          position,
          playerPath: buildPlayerPath({ playerId, recordId, name, ovr }),
          cardBackground: toText(player?.card_background || player?.cardBackground || player?.cardbackground),
          playerImage: toText(player?.player_image || player?.playerImage || player?.playerimage || player?.image),
          nationFlag: toText(player?.nation_flag || player?.nationFlag),
          clubFlag: toText(player?.club_flag || player?.clubFlag),
          leagueImage: toText(player?.league_image || player?.leagueImage),
          colorRating: toText(player?.color_rating || player?.colorRating || '#FFFFFF', '#FFFFFF'),
          colorPosition: toText(player?.color_position || player?.colorPosition || '#FFFFFF', '#FFFFFF'),
          colorName: toText(player?.color_name || player?.colorName || '#FFFFFF', '#FFFFFF'),
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
        const rows = Array.from(searchResultsDropdown.querySelectorAll('.dropdown-player-row'));
        rows.forEach((row, index) => {
          if (index === selectedDropdownIndex) {
            row.style.background = 'rgba(0, 194, 168, 0.08)';
            row.style.borderColor = 'var(--color-teal-500)';
          } else {
            row.style.background = '';
            row.style.borderColor = '';
          }
        });
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
    }

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, [router]);

  return null;
}
