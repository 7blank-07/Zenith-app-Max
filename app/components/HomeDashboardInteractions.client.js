'use client';

import { useEffect } from 'react';
import { normalizeSearchText } from './search-normalization';

const TOOL_ROUTE_MAP = Object.freeze({
  compare: '/tools?tool=compare',
  squadbuilder: '/tools?tool=squadbuilder',
  'shard-calculator': '/tools?tool=shard-calculator'
});

const VIEW_ROUTE_MAP = Object.freeze({
  dashboard: '/',
  database: '/players',
  players: '/players',
  market: '/market',
  watchlist: '/watchlist'
});

function navigate(path) {
  if (!path) return;
  window.location.assign(path);
}

function readCardText(card) {
  const textParts = [
    card?.dataset?.playerName,
    card?.dataset?.playerPosition,
    card?.dataset?.playerClub,
    card?.dataset?.playerNation
  ];
  return textParts
    .map((value) => normalizeSearchText(value))
    .filter(Boolean)
    .join(' ');
}

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
  useEffect(() => {
    const cleanup = [];

    const handleCardClick = (event) => {
      const card = event.target?.closest?.('.dashboard-player-card[data-player-id]');
      if (!card) return;
      const playerId = card.getAttribute('data-player-id');
      if (!playerId) return;
      navigate(`/player/${encodeURIComponent(playerId)}`);
    };
    document.addEventListener('click', handleCardClick);
    cleanup.push(() => document.removeEventListener('click', handleCardClick));

    const slides = Array.from(document.querySelectorAll('.hero-banner-slider .banner-slide'));
    const dots = Array.from(document.querySelectorAll('.banner-dot'));
    const prevButton = document.querySelector('.banner-prev');
    const nextButton = document.querySelector('.banner-next');
    let currentSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
    let intervalId = null;

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

    showSlide(currentSlide);
    restartAutoPlay();
    cleanup.push(() => {
      if (intervalId) window.clearInterval(intervalId);
    });

    const homeSearchInput = document.getElementById('home-search');
    const searchDropdown = document.getElementById('search-dropdown');
    const searchResultsDropdown = document.getElementById('search-results-dropdown');
    const allCards = Array.from(document.querySelectorAll('.dashboard-player-card[data-player-id]'));

    if (homeSearchInput && searchDropdown && searchResultsDropdown && allCards.length) {
      let selectedDropdownIndex = -1;
      let activeResults = [];
      const homePlayers = allCards.map((card) => ({
        playerId: card.getAttribute('data-player-id') || '',
        name: card.getAttribute('data-player-name') || '',
        position: card.getAttribute('data-player-position') || '',
        searchableText: readCardText(card),
        cardBackground: card.querySelector('.card-background-img')?.getAttribute('src') || '',
        playerImage: card.querySelector('.player-image-img')?.getAttribute('src') || '',
        ovr: String(card.querySelector('.card-ovr')?.textContent || '').trim() || 'N/A',
        isUntradable: !!card.querySelector('.card-untradable-badge')
      }));

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
                <div class="squad-custom-card-ovr">${escapeHtml(player.ovr)}</div>
                <div class="squad-custom-card-position">${escapeHtml(player.position || 'N/A')}</div>
                <div class="squad-custom-card-name">${escapeHtml(player.name || 'Unknown')}</div>
              </div>
            </div>
            <div class="dropdown-player-info">
              <div class="dropdown-player-name">${escapeHtml(player.name || 'Unknown')}</div>
              <span class="dropdown-player-badge ${player.isUntradable ? 'non-auctionable' : 'auctionable'}">
                ${player.isUntradable ? '🔴 Non-auctionable' : '✅ Auctionable'}
              </span>
            </div>
            <div class="dropdown-player-stats">
              <div class="dropdown-player-ovr">${escapeHtml(player.ovr)}</div>
              <div class="dropdown-player-position">${escapeHtml(player.position || 'N/A')}</div>
            </div>
          `;

          row.addEventListener('click', () => {
            if (!player.playerId) return;
            closeDropdown();
            homeSearchInput.value = '';
            navigate(`/player/${encodeURIComponent(player.playerId)}`);
          });

          searchResultsDropdown.appendChild(row);
        });
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
          return;
        }

        activeResults = homePlayers.filter((player) => player.searchableText.includes(normalizedQuery)).slice(0, 20);
        selectedDropdownIndex = -1;
        if (!activeResults.length) {
          renderNoResults(rawQuery);
        } else {
          renderDropdownResults(activeResults);
        }
        searchDropdown.classList.add('active');
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
    }

    return () => {
      cleanup.forEach((dispose) => dispose());
    };
  }, []);

  return null;
}
