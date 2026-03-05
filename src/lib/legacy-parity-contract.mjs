const LEGACY_PLAYER_ID_KEYS = Object.freeze(['player_id', 'playerId', 'playerid', 'id']);

function normalizeText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const lowered = String(value ?? '').trim().toLowerCase();
  return lowered === 'true' || lowered === '1' || lowered === 'yes';
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.getOwnPropertyNames(value).forEach((key) => deepFreeze(value[key]));
  return value;
}

const contract = {
  shared: {
    requiredSelectors: [
      'header.header',
      '.header-content',
      '.nav-desktop .nav-link[data-link][data-nav-link]',
      'footer.zenith-footer',
      '.zenith-footer-inner',
      '.zenith-footer-center [data-link][data-nav-link]'
    ],
    requiredNavHrefs: ['/', '/players', '/market', '/watchlist']
  },
  views: {
    home: {
      rootId: 'dashboard-view',
      requiredSelectors: [
        '#dashboard-view .search-section',
        '#dashboard-view .hero-banner-section',
        '#latest-players-grid',
        '#recent-events-container',
        '#trending-players-grid'
      ],
      requiredClassStack: [
        'dashboard-player-card',
        'card-container',
        'card-background-img',
        'player-image-img',
        'card-ovr',
        'card-position',
        'card-player-name'
      ]
    },
    players: {
      rootId: 'database-view',
      requiredSelectors: [
        '#database-view .database-layout',
        '#database-view .filters-sidebar',
        '#player-search',
        '#open-stats-modal',
        '#players-grid',
        '#load-more-btn'
      ],
      requiredClassStack: [
        'player-row',
        'player-row-card',
        'player-card-image-container',
        'player-row-info',
        'player-row-stats',
        'stat-pill',
        'player-row-watchlist'
      ]
    },
    playerDetail: {
      rootId: 'player-detail-view',
      requiredSelectors: [
        '#player-detail-view .player-top-section',
        '#player-detail-view .player-detail-mini-card',
        '#player-detail-view .player-skills-section',
        '#player-detail-view .player-stats-section',
        '#player-detail-view .stats-grid-container'
      ],
      requiredClassStack: ['player-top-section', 'player-detail-mini-card', 'stats-grid-container']
    },
    watchlist: {
      rootId: 'watchlist-view',
      requiredSelectors: [
        '#watchlist-view .database-layout',
        '#watchlist-filter-position',
        '#watchlist-search-input',
        '#watchlist-active-filters',
        '#watchlist-players-grid'
      ],
      requiredClassStack: ['watchlist-grid', 'player-row', 'player-row-card', 'player-row-watchlist']
    },
    tools: {
      rootId: 'tools',
      requiredSelectors: [
        '#tools-modal',
        '#tools-sheet',
        '#squad-builder-modal',
        '#compare-players-modal',
        '#roi-calculator-modal',
        '#shard-calculator-view'
      ],
      compatibilityRoutes: ['/squad-builder', '/compare', '/shard-calculator']
    }
  },
  nonNegotiables: {
    preserveClassNames: ['dashboard-player-card', 'player-row-card', 'player-top-section', 'stats-grid-container'],
    preserveDataLinkAttributes: ['data-link', 'data-nav-link'],
    preserveIds: ['latest-players-grid', 'players-grid', 'watchlist-players-grid', 'player-detail-view']
  }
};

export const LEGACY_PARITY_CONTRACT = deepFreeze(contract);

function resolveViewKey(viewName) {
  const normalized = normalizeText(viewName).toLowerCase();
  if (normalized === 'home' || normalized === 'dashboard' || normalized === '/') return 'home';
  if (normalized === 'players' || normalized === 'database' || normalized === '/players') return 'players';
  if (normalized === 'player' || normalized === 'playerdetail' || normalized === '/player/[id]') return 'playerDetail';
  if (normalized === 'watchlist' || normalized === '/watchlist') return 'watchlist';
  if (normalized === 'tools' || normalized === '/tools') return 'tools';
  return null;
}

export function getLegacyViewContract(viewName) {
  const viewKey = resolveViewKey(viewName);
  if (!viewKey) return null;
  return LEGACY_PARITY_CONTRACT.views[viewKey];
}

export function listMissingLegacySelectors(viewName, queryRoot) {
  const viewContract = getLegacyViewContract(viewName);
  if (!viewContract) return [];
  if (!queryRoot || typeof queryRoot.querySelector !== 'function') return [...viewContract.requiredSelectors];
  return viewContract.requiredSelectors.filter((selector) => !queryRoot.querySelector(selector));
}

export function normalizeLegacyPlayerId(playerOrId) {
  if (playerOrId === undefined || playerOrId === null) return '';
  if (typeof playerOrId !== 'object') return normalizeText(playerOrId);
  for (const key of LEGACY_PLAYER_ID_KEYS) {
    const resolved = normalizeText(playerOrId[key]);
    if (resolved) return resolved;
  }
  return '';
}

export function getPlayerUniqueId(playerLike, overrides = {}) {
  const playerId = normalizeLegacyPlayerId(playerLike);
  const rank = normalizeInteger(overrides.rank ?? playerLike?.rank, 0);
  const untradable = normalizeBoolean(overrides.isUntradable ?? playerLike?.is_untradable ?? playerLike?.isuntradable);
  return `${playerId}_${rank}_${untradable ? 1 : 0}`;
}
