/* Generated legacy ES module bundle. */

/* ===== DOMContentLoaded compatibility shim =====
 * When this bundle is injected dynamically (e.g. via Next.js useEffect),
 * DOMContentLoaded has already fired. This shim captures any
 * document.addEventListener('DOMContentLoaded', handler) calls made
 * while the bundle executes and runs them immediately afterward.
 */
const __legacyDCLQueue = [];
const __legacyOrigAddEventListener = document.addEventListener.bind(document);
if (document.readyState !== 'loading') {
  document.addEventListener = function legacyShimAddEventListener(type, handler, ...args) {
    if (type === 'DOMContentLoaded') {
      __legacyDCLQueue.push({ handler, args });
    } else {
      return __legacyOrigAddEventListener(type, handler, ...args);
    }
  };
}


/* ===== assets/js/data/config.js ===== */

// Check if ENV already exists to prevent "already declared" errors
window.ENV = window.ENV || {
    SUPABASE_URL: 'https://ugszalubwvartwalsejx.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k'
};



/* ===== assets/js/data/api-client.js ===== */

// Zenith API Client (updated & perfected)
// Based on your uploaded api-client.js (keeps same base URL and routes)
const API_BASE_URL = 'https://zenithfcm.com/api';


class ZenithAPIClient {
  constructor(baseURL = API_BASE_URL, options = {}) {
    this.baseURL = baseURL.replace(/\/+$/, ''); // no trailing slash
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL ?? 5 * 60 * 1000; // default 5 minutes
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    this.debug = options.debug ?? false;
  }

  // Internal: log when debug enabled
  _log(...args) {
    if (this.debug) console.log(...args);
  }

  // Build full URL from endpoint (endpoint may start with /)
  _url(endpoint) {
    if (!endpoint) throw new Error('Missing endpoint');
    return `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  // Flexible fetch with caching
  // options: { method, headers, body, cache: true/false, cacheTTL }
  async fetchWithCache(endpoint, options = {}) {
    const { cache = true, cacheTTL = this.cacheTTL, ...fetchOptions } = options;
    const cacheKey = `${endpoint}::${JSON.stringify(fetchOptions)}`;

    // Try cache
    if (cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        this._log(`[API] Cache hit: ${endpoint}`);
        return cached.data;
      }
    }

    const url = this._url(endpoint);
    this._log(`[API] Fetching: ${url}`);

    // Merge headers
    fetchOptions.headers = {
      ...this.defaultHeaders,
      ...(fetchOptions.headers || {})
    };

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        // attempt to parse JSON error, otherwise throw status text
        let errText;
        try {
          const errJson = await response.json();
          errText = JSON.stringify(errJson);
        } catch (e) {
          errText = await response.text();
        }
        throw new Error(`API Error: ${response.status} ${response.statusText} — ${errText}`);
      }

      // parse JSON safely
      const data = await response.json();

      if (cache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      this._log(`[API] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Clear entire cache
  clearCache() {
    this._log('[API] Cache cleared');
    this.cache.clear();
  }

  // Remove a single cache entry (helpful after updates)
  clearCacheEntry(endpoint, options = {}) {
    const key = `${endpoint}::${JSON.stringify(options)}`;
    this.cache.delete(key);
  }

  // ---------- Players / list ----------
  async getPlayers(filters = {}, opts = {}) {
      const params = new URLSearchParams();

      if (filters.limit !== undefined) params.append('limit', filters.limit);
      if (filters.offset !== undefined) params.append('offset', filters.offset);
      if (filters.position) params.append('position', filters.position);
      if (filters.min_ovr !== undefined) params.append('min_ovr', filters.min_ovr);
      if (filters.max_ovr !== undefined) params.append('max_ovr', filters.max_ovr);
      if (filters.team) params.append('team', filters.team);
      if (filters.league) params.append('league', filters.league);
      if (filters.nation) params.append('nation', filters.nation);
      if (filters.event) params.append('event', filters.event);
      if (filters.rank !== undefined) params.append('rank', filters.rank);
      if (filters.name_starts_with) params.append('name_starts_with', filters.name_starts_with);
      if (filters.skill_moves !== undefined) params.append('skill_moves', filters.skill_moves);
      if (filters.is_untradable !== undefined) params.append('is_untradable', filters.is_untradable);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.order) params.append('order', filters.order);

      const endpoint = `/players?${params.toString()}`;
      return this.fetchWithCache(endpoint, { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
    }


  // ---------- Search (lightweight) ----------
  // IMPORTANT: this returns a light object suitable for autocomplete/search UI
  async searchPlayers(params = {}, opts = {}) {
    const q = new URLSearchParams();
    if (params.q) q.append('q', params.q);
    if (params.limit !== undefined) q.append('limit', params.limit);
    if (params.offset !== undefined) q.append('offset', params.offset);
    if (params.rank !== undefined) q.append('rank', params.rank);

    // Use the search endpoint which should return small objects (id, name, ovr, position, image, team, league)
    const endpoint = `/players/search?${q.toString()}`;
    return this.fetchWithCache(endpoint, { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  // ---------- Player detail (full payload) ----------
  async getPlayerDetails(playerId, rank = 0, opts = {}) {
    if (playerId === undefined || playerId === null) throw new Error('playerId is required');
    const endpoint = `/players/${encodeURIComponent(playerId)}?rank=${encodeURIComponent(rank)}`;
    // Detailed endpoint may be used less frequently; still cacheable
    return this.fetchWithCache(endpoint, { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  // ---------- Skills ----------
  async getSkills(opts = {}) {
    return this.fetchWithCache('/skills', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  async getSkillBoosts(skillId, opts = {}) {
    if (skillId === undefined || skillId === null) throw new Error('skillId is required');
    return this.fetchWithCache(`/skill-boosts/${encodeURIComponent(skillId)}`, { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  // ==================== USER SKILL ALLOCATIONS ====================

  /**
   * Get user's skill allocations for a player at a specific rank
   */
  async getUserSkillAllocations(userId, playerId, rank = 0, opts = {}) {
    if (userId === undefined || userId === null) throw new Error('userId is required');
    if (playerId === undefined || playerId === null) throw new Error('playerId is required');
    
    const { allowLocalOverride = true, updateCache = true, ...requestOpts } = opts;
    if (allowLocalOverride && typeof window !== 'undefined' && typeof window.getSkillAllocationsCacheEntry === 'function') {
      const cachedEntry = window.getSkillAllocationsCacheEntry(userId, playerId, rank);
      if (cachedEntry && cachedEntry.source === 'local') {
        return { allocations: cachedEntry.allocations || [], source: 'local', cached: true };
      }
    }

    const endpoint = `skills/allocations/${encodeURIComponent(userId)}/${encodeURIComponent(playerId)}?rank=${encodeURIComponent(rank)}`;
    
    // Don't cache allocations - they change frequently
    const response = await this.fetchWithCache(endpoint, { 
      cache: false,  // Always fetch fresh
      ...requestOpts 
    });
    if (updateCache && typeof window !== 'undefined' && typeof window.setSkillAllocationsCacheEntry === 'function' && response?.allocations) {
      window.setSkillAllocationsCacheEntry(userId, playerId, rank, response.allocations, 'server');
    }
    return response;
  }

  /**
   * Upgrade a skill for a user's player
   */
  async upgradeSkill(userId, playerId, rank, skillId, newLevel, opts = {}) {
    if (!userId || !playerId || rank === undefined || skillId === undefined || skillId === null || newLevel === undefined || newLevel === null) {
      throw new Error('userId, playerId, rank, skillId, and newLevel are required');
    }
    
    const params = new URLSearchParams({
      user_id: userId,
      player_id: playerId,
      rank: rank,
      skill_id: skillId,
      new_level: newLevel
    });
    
    const endpoint = `skills/upgrade?${params.toString()}`;
    
    // POST request
    const response = await this.fetchWithCache(endpoint, {
      method: 'POST',
      cache: false,  // Don't cache POST requests
      ...opts
    });
    
    // Clear player detail cache after upgrade (stats changed)
    this.clearCacheEntry(`players/${playerId}?rank=${rank}`);
    
    return response;
  }

  /**
   * Reset all skill allocations for a user's player at a rank
   */
  async resetSkills(userId, playerId, rank, opts = {}) {
    if (!userId || !playerId || rank === undefined) {
      throw new Error('userId, playerId, and rank are required');
    }
    
    const params = new URLSearchParams({
      user_id: userId,
      player_id: playerId,
      rank: rank
    });
    
    const endpoint = `skills/reset?${params.toString()}`;
    
    // DELETE request
    const response = await this.fetchWithCache(endpoint, {
      method: 'DELETE',
      cache: false,
      ...opts
    });
    
    // Clear player detail cache after reset
    this.clearCacheEntry(`players/${playerId}?rank=${rank}`);
    
    return response;
  }


  // ---------- Filters ----------
  async getPositions(opts = {}) {
    return this.fetchWithCache('/filters/positions', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  async getTeams(opts = {}) {
    return this.fetchWithCache('/filters/teams', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  async getLeagues(opts = {}) {
    return this.fetchWithCache('/filters/leagues', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  async getNations(opts = {}) {
    return this.fetchWithCache('/filters/nations', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  async getEvents(opts = {}) {
    return this.fetchWithCache('/filters/events', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  // Convenience aliases (for backwards compatibility)
  async getTeamsWithFlags(opts = {}) {
    return this.getTeams(opts);
  }
  async getLeaguesWithFlags(opts = {}) {
    return this.getLeagues(opts);
  }

  // ---------- Stats ----------
  async getStatsSummary(opts = {}) {
    return this.fetchWithCache('/stats/summary', { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL });
  }

  // ---------- Training Boosts ----------
  async getTrainingBoosts(position, level, opts = {}) {
      if (!position || level === undefined) {
          throw new Error('position and level are required');
      }
      const endpoint = `/training/boosts?position=${encodeURIComponent(position)}&level=${encodeURIComponent(level)}`;
      return this.fetchWithCache(endpoint, { cache: opts.cache ?? true, cacheTTL: opts.cacheTTL ?? 60000 });
  }


  
  // ---------- Health ----------
  async checkHealth() {
    // Build base (without /api)
    const rootBase = this.baseURL.replace(/\/api$/, '').replace(/\/api\/$/, '');
    const url = `${rootBase}/health`;
    try {
      const resp = await fetch(url, { headers: this.defaultHeaders });
      if (!resp.ok) {
        throw new Error(`Health check failed: ${resp.status} ${resp.statusText}`);
      }
      return resp.json();
    } catch (err) {
      this._log('[API] Health check error:', err);
      throw err;
    }
  }
}

// Export an instance for app-wide usage
const apiClient = new ZenithAPIClient(API_BASE_URL, { debug: false });

// If you use modules, export default
// export default apiClient;




/* ===== assets/js/data/supabase-provider.js ===== */

// assets/js/data/supabase-provider.js
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
}

window.supabaseProvider = {
  async syncPrices(players) {
    console.log("[DEBUG] syncPrices started for:", players.length, "players");
    if (!players || players.length === 0) return players;

    // 🔥 FIX: Use 'player_id' instead of 'id' to match your API data structure
    const playerIds = players
        .map(p => p.player_id) 
        .filter(id => id != null);

    console.log("[CRITICAL DEBUG] Sending these IDs to Supabase:", playerIds);

    if (playerIds.length === 0) {
        console.error("[ERROR] No valid player_ids found in the player list!");
        return players;
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('price_snapshots')
        .select('asset_id, price0, price1, price2, price3, price4, price5')
        .in('asset_id', playerIds)
        .order('captured_at', { ascending: false });

      if (error) throw error;

      console.log(`[DEBUG] Supabase returned ${data?.length || 0} matches.`);

      players.forEach(zenithPlayer => {
        const snapshot = data.find(
          s => String(s.asset_id) === String(zenithPlayer.player_id)
        );

        if (snapshot) {
          const rank = parseInt(zenithPlayer.rank || 0);
          const priceKey = `price${rank}`;

          zenithPlayer.price = snapshot[priceKey] ?? null;
        } else {
          zenithPlayer.price = null;
        }
      });

      return players;
    } catch (err) {
      console.error('[DEBUG] Supabase Sync Fail:', err);
      return players;
    }
  },
  async fetchPriceHistory({ playerId, startTime, endTime, priceColumn }) {
    if (!playerId && playerId !== 0) {
      throw new Error('playerId is required');
    }
    if (!priceColumn || !/^price[0-5]$/.test(priceColumn)) {
      throw new Error('Valid priceColumn is required');
    }
    if (!window.supabaseClient) {
      throw new Error('Supabase client not available');
    }

    console.log('[PRICE HISTORY] Supabase query params:', { playerId, startTime, endTime, priceColumn });

    let query = window.supabaseClient
      .from('price_snapshots')
      .select(`asset_id, captured_at, ${priceColumn}`)
      .eq('asset_id', playerId)
      .order('captured_at', { ascending: true });

    if (startTime) {
      query = query.gte('captured_at', startTime);
    }
    if (endTime) {
      query = query.lte('captured_at', endTime);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }
};




/* ===== assets/js/utils/helpers.js ===== */

// FC Market Pro - Utility Helper Functions
// Reusable functions used across the application

// Format price to display (e.g., 2450000 → "2.45M")
function formatPrice(price) {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M';
  }
  return (price / 1000).toFixed(0) + 'K';
}

// Format number with commas (e.g., 31847 → "31,847")
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get initials from player name (e.g., "Lionel Messi" → "LM")
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Show toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? 
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : 
        '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Generate realistic price history data for charts
function generatePriceHistory(basePrice, days = 30) {
  const history = [];
  let currentPrice = basePrice * 0.8;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random price fluctuation
    const change = (Math.random() - 0.5) * 0.1 * currentPrice;
    currentPrice += change;
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice)
    });
  }
  
  // Ensure last price matches current price
  history[history.length - 1].price = basePrice;
  
  return history;
}

// Animate number counting up
function animateNumber(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const duration = 1000;
  const steps = 30;
  const increment = target / steps;
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, duration / steps);
}

const RANK_OVERLAY_IMAGE_MAP = {
  1: 'assets/images/rank_single_frame/single_green_rank.png',
  2: 'assets/images/rank_single_frame/single_blue_rank.png',
  3: 'assets/images/rank_single_frame/single_purple_rank.png',
  4: 'assets/images/rank_single_frame/single_red_rank.png',
  5: 'assets/images/rank_single_frame/single_gold_rank.png',
  green: 'assets/images/rank_single_frame/single_green_rank.png',
  blue: 'assets/images/rank_single_frame/single_blue_rank.png',
  purple: 'assets/images/rank_single_frame/single_purple_rank.png',
  red: 'assets/images/rank_single_frame/single_red_rank.png',
  gold: 'assets/images/rank_single_frame/single_gold_rank.png',
  orange: 'assets/images/rank_single_frame/single_gold_rank.png',
};

function getRankOverlaySrc(rank) {
  if (rank === null || rank === undefined) return '';
  if (typeof rank === 'string') {
    const key = rank.trim().toLowerCase();
    return RANK_OVERLAY_IMAGE_MAP[key] || RANK_OVERLAY_IMAGE_MAP[parseInt(key, 10)] || '';
  }
  const normalized = parseInt(rank, 10);
  return RANK_OVERLAY_IMAGE_MAP[normalized] || '';
}

const DEV_LOGGING_ENABLED = window.location.protocol === 'file:' ||
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

function devLog(label, details) {
  if (!DEV_LOGGING_ENABLED) return;
  if (details !== undefined) {
    console.log(label, details);
    return;
  }
  console.log(label);
}

function applyRankOverlay(container, rank, options = {}) {
  if (!container) return;
  const src = getRankOverlaySrc(rank);
  const modifierClass = options.modifierClass || '';
  const scope = options.scope || 'squad-builder';
  let overlay = container.querySelector('.rank-diamond-overlay');

  if (!src) {
    if (overlay) overlay.remove();
    return;
  }

  if (!overlay) {
    overlay = document.createElement('img');
    container.appendChild(overlay);
  }

  devLog('RANK_OVERLAY_APPLIED', {
    scope,
    modifierClass,
    rank,
    targetId: container.id || '',
    targetClass: container.className || '',
    playerId: container.dataset ? container.dataset.playerId || '' : ''
  });

  overlay.className = ['rank-diamond-overlay', modifierClass].filter(Boolean).join(' ');
  overlay.src = src;
  overlay.alt = 'Rank';
  overlay.dataset.rank = String(rank);
  overlay.setAttribute('aria-hidden', 'true');
}

window.getRankOverlaySrc = getRankOverlaySrc;
window.applyRankOverlay = applyRankOverlay;
window.devLog = devLog;


function getPlayerType(player) {
  const event = (player.event || '').toLowerCase();
  if (event.includes('icon')) return 'icon';
  if (event.includes('hero')) return 'hero';
  return 'normal';
}



/* ===== assets/js/views/dashboard.js ===== */

// FC Market Pro - Dashboard View
// Handles the main dashboard/homepage functionality

function loadDashboard() {
  // Animate stats
  animateNumber('total-players', marketStats.totalPlayers);

  const marketVolumeEl = document.getElementById('market-volume');
  if (marketVolumeEl) marketVolumeEl.textContent = marketStats.marketVolume;

  // Top gainer and loser
  const sorted = [...players].sort((a, b) => b.priceChange - a.priceChange);
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];

  const topGainerEl = document.getElementById('top-gainer');
  const topGainerChangeEl = document.getElementById('top-gainer-change');
  const topLoserEl = document.getElementById('top-loser');
  const topLoserChangeEl = document.getElementById('top-loser-change');

  if (topGainerEl) topGainerEl.textContent = topGainer.name;
  if (topGainerChangeEl) topGainerChangeEl.textContent = `+${topGainer.priceChange.toFixed(1)}%`;
  if (topLoserEl) topLoserEl.textContent = topLoser.name;
  if (topLoserChangeEl) topLoserChangeEl.textContent = `${topLoser.priceChange.toFixed(1)}%`;

  // Load Latest Players Section
  loadLatestPlayers();

  // Load Trending Players Section
  loadTrendingPlayers();

  // Recent updates
  const updatesContainer = document.getElementById('recent-updates');
  if (updatesContainer) {
    updatesContainer.innerHTML = '';
    const recentPlayers = [...players]
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
      .slice(0, 5);

    recentPlayers.forEach(player => {
      const updateItem = document.createElement('div');
      updateItem.className = 'update-item';
      updateItem.style.cursor = 'pointer';
      updateItem.onclick = () => viewPlayerDetail(player.id);

      const changeClass = player.priceChange >= 0 ? 'up' : 'down';
      const changeSymbol = player.priceChange >= 0 ? '↑' : '↓';

      updateItem.innerHTML = `
                <div class="update-player">
                    <div class="update-avatar">${getInitials(player.name)}</div>
                    <div class="update-info">
                        <h4>${player.name}</h4>
                        <p>${player.position} • ${player.club}</p>
                    </div>
                </div>
                <div class="update-price">
                    <div class="price-value">${formatPrice(player.price)}</div>
                    <div class="price-change ${changeClass}">
                        ${changeSymbol} ${Math.abs(player.priceChange).toFixed(1)}%
                    </div>
                </div>
            `;

      updatesContainer.appendChild(updateItem);
    });
  }
}


// Load Trending Players Section
function loadTrendingPlayers() {
  const grid = document.getElementById('trending-players-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Trending: top 6 most volatile (highest absolute price change)
  const trendingPlayers = [...players]
    .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
    .slice(0, 6);    


const sliderText = "Trade, Build, Dominate – Massive Rewards Await on Zenith!";
document.querySelector(".slider span").textContent = sliderText;


  trendingPlayers.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = 'latest-player-card';
    const rank = index + 1;

    // Watchlist status
    const isWatchlisted = state.watchlist.includes(player.id);
    const heartIcon = isWatchlisted ? '♥' : '♡';

    // Rank badge class
    let rankClass = '';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';

    card.innerHTML = `
            <div class="trending-rank ${rankClass}">#${rank}</div>
            <button class="latest-watchlist${isWatchlisted ? ' active' : ''}" title="Add to Watchlist" onclick="event.stopPropagation(); toggleTrendingWatchlist(${player.id}, this);">${heartIcon}</button>
            
            <div class="latest-player-top">
                <div class="trending-avatar">${getInitials(player.name)}</div>
            </div>
            
            <div class="latest-player-center">
                <div class="latest-player-name">${player.name}</div>
                <div class="latest-position-badge">${player.position}</div>
                
                <div class="latest-player-stats">
                    <div class="stat-item">
                        <div class="stat-value">${player.pace}</div>
                        <div class="stat-label">PAC</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.shooting}</div>
                        <div class="stat-label">SHO</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.passing}</div>
                        <div class="stat-label">PAS</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.dribbling}</div>
                        <div class="stat-label">DRI</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.defending}</div>
                        <div class="stat-label">DEF</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.physical}</div>
                        <div class="stat-label">PHY</div>
                    </div>
                </div>
            </div>
            
            <div class="latest-player-bottom">
                <div class="latest-price">${formatPrice(player.price)}</div>
                <div class="latest-change ${player.priceChange < 0 ? 'down' : 'up'}">
                    ${player.priceChange > 0 ? '↑' : '↓'} ${Math.abs(player.priceChange).toFixed(1)}%
                </div>
            </div>
            
            <button class="latest-details-btn" onclick="viewPlayerDetail(${player.id})">View Details</button>
        `;

    grid.appendChild(card);
  });
}

// Watchlist toggle function for latest players section
function toggleLatestWatchlist(id, btn) {
  // Use the main toggleWatchlist function if available
  if (typeof window.toggleWatchlist === 'function') {
    window.toggleWatchlist(id);
    // UI update is handled by updateAllWatchlistButtons() in the main function
  } else {
    // Fallback to inline implementation with localStorage save
    const idx = state.watchlist.indexOf(id);
    if (idx === -1) {
      state.watchlist.push(id);
      btn.classList.add('active');
      btn.innerHTML = '♥';
    } else {
      state.watchlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.innerHTML = '♡';
    }
    // Save to localStorage
    localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
  }
}

// Watchlist toggle for trending section
function toggleTrendingWatchlist(id, btn) {
  // Use the main toggleWatchlist function if available
  if (typeof window.toggleWatchlist === 'function') {
    window.toggleWatchlist(id);
    // UI update is handled by updateAllWatchlistButtons() in the main function
  } else {
    // Fallback to inline implementation with localStorage save
    const idx = state.watchlist.indexOf(id);
    if (idx === -1) {
      state.watchlist.push(id);
      btn.classList.add('active');
      btn.innerHTML = '♥';
    } else {
      state.watchlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.innerHTML = '♡';
    }
    // Save to localStorage
    localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
  }
}

// Animate number counter
function animateNumber(elementId, targetValue, duration = 1000) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Search ALL players on home page
function searchAllPlayersOnHome(searchTerm) {
  const latestGrid = document.getElementById('latest-players-grid');
  const trendingGrid = document.getElementById('trending-players-grid');

  if (!latestGrid || !trendingGrid) return;

  // If search is empty, reload normal dashboard
  if (!searchTerm.trim()) {
    loadLatestPlayers();
    loadTrendingPlayers();
    return;
  }

  // Filter ALL players by search term (case-insensitive)
  const search = searchTerm.toLowerCase().trim();
  const filteredPlayers = players.filter(player => {
    const name = (player.name || '').toLowerCase();
    const position = (player.position || '').toLowerCase();
    const club = (player.club || '').toLowerCase();
    const nation = (player.nation || '').toLowerCase();

    return name.includes(search) ||
      position.includes(search) ||
      club.includes(search) ||
      nation.includes(search);
  });

  // Clear both grids
  latestGrid.innerHTML = '';
  trendingGrid.innerHTML = '';

  // Hide trending section header when searching
  const trendingSection = document.querySelector('.section-header:has(+ #trending-players-grid)');
  if (trendingSection) trendingSection.style.display = 'none';

  // Update Latest section header to show search results
  const latestHeader = document.querySelector('.section-header:has(+ #latest-players-grid)');
  if (latestHeader) {
    const headerTitle = latestHeader.querySelector('h2');
    if (headerTitle) headerTitle.innerHTML = `⚡ Search Results (${filteredPlayers.length})`;
  }

  // Show results in latest grid
  if (filteredPlayers.length === 0) {
    latestGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 0.5rem;">
          No players found for "${searchTerm}"
        </p>
        <p style="color: var(--text-tertiary); font-size: 0.9rem;">
          Try searching by player name, position, club, or nation
        </p>
      </div>
    `;
  } else {
    filteredPlayers.forEach(player => {
      const card = createLatestPlayerCard(player);
      latestGrid.appendChild(card);
    });
  }
}

// ===== BANNER SLIDER FUNCTIONALITY =====

// ===== BANNER SLIDER WITH REDIRECTS =====

function initBannerSlider() {
  const slider = document.querySelector('.hero-banner-slider');
  if (!slider) return;

  if (window.innerWidth < 1024 && !window.__zenithBannerResponsiveLogged) {
    console.info('[BANNER] Responsive scaling applied for mobile/tablet');
    window.__zenithBannerResponsiveLogged = true;
  }

  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  const prevBtn = document.querySelector('.banner-prev');
  const nextBtn = document.querySelector('.banner-next');

  let currentSlide = 0;
  let autoplayInterval;

  // Show specific slide
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentSlide = index;
  }

  // Next slide
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  // Previous slide
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Start autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  // Stop autoplay
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  function handleBannerClick(banner) {
    const redirectType = banner.getAttribute('data-redirect');
    const target = banner.getAttribute('data-target');

    if (!redirectType || !target) {
      return;
    }

    stopAutoplay();

    switch (redirectType) {
      case 'view':
        if (typeof switchView === 'function') {
          switchView(target);
        }
        break;

      case 'tool':
        const toolButton = document.querySelector(`[onclick*="${target}"]`);

        if (typeof openTool === 'function') {
          openTool(target);
        } else if (toolButton) {
          toolButton.click();
        }
        break;

      case 'external':
        window.open(target, '_blank', 'noopener,noreferrer');
        startAutoplay();
        break;
    }
  }




  // ===== NEW: ADD CLICK HANDLERS TO BANNERS =====
  slides.forEach((banner) => {
    banner.style.cursor = 'pointer';

    banner.addEventListener('click', (e) => {
      // Don't trigger if clicking arrows or dots
      if (e.target.closest('.banner-arrow') || e.target.closest('.banner-dot')) {
        return;
      }
      handleBannerClick(banner);
    });

    // Add hover effect
    banner.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.01)';
      this.style.transition = 'transform 0.3s ease';
    });

    banner.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
  });

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  // Touch swipe for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    }
    if (touchEndX > touchStartX + 50) {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    }
  }

  // Pause on hover
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Start
  startAutoplay();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initBannerSlider();
});


// Initialize banner when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
  initBannerSlider();
});




/* ===== assets/js/views/database.js ===== */

// FC Market Pro - Database View
// Handles player database, filtering, and sorting

async function fetchPlayersSortedByPrice(order = 'desc', limit = 20, offset = 0) {
    console.log('[DB] Fetching top priced players from Supabase...');

    const rank = state.currentRank || 0;
    const priceColumn = `price${rank}`;

    const { data: priceData, error } = await window.supabaseClient
        .from('price_snapshots')
        .select(`asset_id, ${priceColumn}`)
        .not(priceColumn, 'is', null)
        .gt(priceColumn, 0)
        .order(priceColumn, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[DB] Supabase price fetch failed:', error);
        return [];
    }

    console.log('[DB] Supabase returned:', priceData.length, 'entries');
    if (priceData.length === 0) return [];

    const ids = priceData.map(p => p.asset_id).join(',');

    const response = await apiClient.fetchWithCache(
        `/players/by-ids?ids=${ids}&rank=${rank}`,
        { cache: false }
    );

    const players = response.players || [];

    // Merge price onto each player
    players.forEach(player => {
        const priceEntry = priceData.find(p => String(p.asset_id) === String(player.player_id));
        if (priceEntry) player.price = priceEntry[priceColumn];
    });

    // Re-sort by price (backend returns in DB order)
    players.sort((a, b) =>
        order === 'desc' ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0)
    );

    console.log('[DB] Final merged players:', players.length);
    return players;
}


function loadDatabase() {
    renderPlayers();
}

function renderSortHeader() {
    const grid = document.getElementById('players-grid');
    if (!grid) return;

    // Check if header already exists
    let header = document.querySelector('.database-sort-header');
    if (!header) {
        header = document.createElement('div');
        header.className = 'database-sort-header';
        header.innerHTML = `
            <div class="sort-card-spacer"></div>
            <div class="sort-info-spacer"></div>
            <div class="sort-label-group">
                <div class="sort-label ${state.sortBy === 'pace' ? 'active' : ''}" onclick="setSortBy('pace')">
                    PAC ${state.sortBy === 'pace' ? '↓' : ''}
                </div>

                <div class="sort-label ${state.sortBy === 'shooting' ? 'active' : ''}" onclick="setSortBy('shooting')">
                    SHO ${state.sortBy === 'shooting' ? '↓' : ''}
                </div>

                <div class="sort-label ${state.sortBy === 'passing' ? 'active' : ''}" onclick="setSortBy('passing')">
                    PAS ${state.sortBy === 'passing' ? '↓' : ''}
                </div>

                <div class="sort-label ${state.sortBy === 'dribbling' ? 'active' : ''}" onclick="setSortBy('dribbling')">
                    DRI ${state.sortBy === 'dribbling' ? '↓' : ''}
                </div>

                <div class="sort-label ${state.sortBy === 'defending' ? 'active' : ''}" onclick="setSortBy('defending')">
                    DEF ${state.sortBy === 'defending' ? '↓' : ''}
                </div>

                <div class="sort-label ${state.sortBy === 'physical' ? 'active' : ''}" onclick="setSortBy('physical')">
                    PHY ${state.sortBy === 'physical' ? '↓' : ''}
                </div>
                
            </div>
            <div class="sort-watchlist-spacer"></div>
        `;
        grid.parentElement.insertBefore(header, grid);
    } else {
        // Update existing header
        header.innerHTML = `
            <div class="sort-card-spacer"></div>
            <div class="sort-info-spacer"></div>
            <div class="sort-label-group">
                <div class="sort-label ${state.sortBy === 'shooting' ? 'active' : ''}" onclick="setSortBy('shooting')">
                    SHO ${state.sortBy === 'shooting' ? '↓' : ''}
                </div>
                <div class="sort-label ${state.sortBy === 'passing' ? 'active' : ''}" onclick="setSortBy('passing')">
                    PAS ${state.sortBy === 'passing' ? '↓' : ''}
                </div>
                <div class="sort-label ${state.sortBy === 'dribbling' ? 'active' : ''}" onclick="setSortBy('dribbling')">
                    DRI ${state.sortBy === 'dribbling' ? '↓' : ''}
                </div>
                <div class="sort-label ${state.sortBy === 'defending' ? 'active' : ''}" onclick="setSortBy('defending')">
                    DEF ${state.sortBy === 'defending' ? '↓' : ''}
                </div>
                <div class="sort-label ${state.sortBy === 'physical' ? 'active' : ''}" onclick="setSortBy('physical')">
                    PHY ${state.sortBy === 'physical' ? '↓' : ''}
                </div>
                <div class="sort-label ${state.sortBy === 'pace' ? 'active' : ''}" onclick="setSortBy('pace')">
                    PAC ${state.sortBy === 'pace' ? '↓' : ''}
                </div>
            </div>
            <div class="sort-watchlist-spacer"></div>
        `;
    }
}

function setSortBy(stat) {
    state.sortBy = stat;
    state.sortDirection = 'desc';
    if (state.pagination) state.pagination.page = 1;
    renderPlayers();
    renderSortHeader();
}


async function renderPlayers() {
    const grid = document.getElementById('players-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">Loading...</div>';

    let players;

    try {
        if (state.sortBy === 'price') {
            const limit = state.pagination?.limit || 20;
            const offset = ((state.pagination?.page || 1) - 1) * limit;
            players = await fetchPlayersSortedByPrice(
                state.sortDirection || 'desc',
                limit,
                offset
            );
        } else {
            players = await fetchPlayersFromBackend();

            // Frontend sort for stat columns only
            const statSorts = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
            if (statSorts.includes(state.sortBy)) {
                players.sort((a, b) => {
                    const aVal = a[state.sortBy] || 0;
                    const bVal = b[state.sortBy] || 0;
                    return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                });
            }
        }
    } catch (err) {
        console.error('[DB] renderPlayers error:', err);
        players = [];
    }

    if (!players || players.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary);">No players found.</div>';
        return;
    }

    grid.innerHTML = '';
    players.forEach(player => grid.appendChild(createPlayerCard(player)));
    renderSortHeader();
}


function filterPlayers() {
    return players.filter(player => {
        // Search filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            const matchName = player.name.toLowerCase().includes(query);
            const matchPosition = player.position.toLowerCase().includes(query);
            const matchClub = player.club.toLowerCase().includes(query);
            const matchLeague = player.league.toLowerCase().includes(query);
            const matchNation = player.nation.toLowerCase().includes(query);
            if (!matchName && !matchPosition && !matchClub && !matchLeague && !matchNation) {
                return false;
            }
        }

        // Position filter
        if (state.filters.position && player.position !== state.filters.position) {
            return false;
        }

        // Rating filter
        if (player.overall < state.filters.ratingMin || player.overall > state.filters.ratingMax) {
            return false;
        }

        // Price filter
        if (state.filters.priceMin && player.price < state.filters.priceMin) {
            return false;
        }
        if (state.filters.priceMax && player.price > state.filters.priceMax) {
            return false;
        }

        // League filter
        if (state.filters.league && player.league !== state.filters.league) {
            return false;
        }

        // Nation filter
        if (state.filters.nation && player.nation !== state.filters.nation) {
            return false;
        }

        // Skill moves filter
        if (state.filters.skillMoves && player.skillMoves < parseInt(state.filters.skillMoves)) {
            return false;
        }

        return true;
    });
}





/* ===== assets/js/views/market.js ===== */

// FC Market Pro - Market View
// Handles market tracker with top gainers and losers

function loadMarket() {
  // Market overview
  const marketIndexEl = document.getElementById('market-index');
  const avgChangeEl = document.getElementById('avg-change');
  const volumeTradedEl = document.getElementById('volume-traded');
  const activeListingsEl = document.getElementById('active-listings');
  
  if (marketIndexEl) marketIndexEl.textContent = '1,247';
  if (avgChangeEl) avgChangeEl.textContent = `+${marketStats.avgPriceChange}%`;
  if (volumeTradedEl) volumeTradedEl.textContent = marketStats.marketVolume;
  if (activeListingsEl) activeListingsEl.textContent = formatNumber(marketStats.activeListings);
  
  // Top gainers
  const gainersTable = document.getElementById('gainers-table');
  if (gainersTable) {
    gainersTable.innerHTML = '';
    const gainers = [...players].sort((a, b) => b.priceChange - a.priceChange).slice(0, 5);
    gainers.forEach(player => {
      gainersTable.appendChild(createMarketRow(player));
    });
  }
  
  // Top losers
  const losersTable = document.getElementById('losers-table');
  if (losersTable) {
    losersTable.innerHTML = '';
    const losers = [...players]
      .filter(p => p.priceChange < 0)  // Only players with negative change
      .sort((a, b) => a.priceChange - b.priceChange)  // Sort ascending (most negative first)
      .slice(0, 5);
    losers.forEach(player => {
      losersTable.appendChild(createMarketRow(player));
    });
  }
}

function createMarketRow(player) {
  const row = document.createElement('div');
  row.className = 'market-row';
  row.style.cursor = 'pointer';
  row.onclick = () => viewPlayerDetail(player.id);
  row.innerHTML = `
    <div class="market-player">
      <div class="market-player-avatar">${getInitials(player.name)}</div>
      <div class="market-player-info">
        <h4>${player.name}</h4>
        <p>${player.position} • ${player.club}</p>
      </div>
    </div>
    <div class="market-ovr">${player.overall}</div>
    <div class="market-price">${formatPrice(player.price)}</div>
    <div class="market-change ${player.priceChange >= 0 ? 'positive' : 'negative'}">
      ${player.priceChange >= 0 ? '+' : ''}${player.priceChange.toFixed(1)}%
    </div>
  `;
  return row;
}




/* ===== assets/js/views/history.js ===== */

// FC Market Pro - Price History View
// Handles price history charts and statistics

function loadPriceHistory() {
  const select = document.getElementById('history-player');
  if (!select) return;
  
  select.innerHTML = '';
  
  players.forEach(player => {
    const option = document.createElement('option');
    option.value = player.id;
    option.textContent = `${player.name} (${player.position})`;
    select.appendChild(option);
  });
  
  // Set dates
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dateToEl = document.getElementById('date-to');
  const dateFromEl = document.getElementById('date-from');
  if (dateToEl) dateToEl.valueAsDate = today;
  if (dateFromEl) dateFromEl.valueAsDate = thirtyDaysAgo;
  
  // Load first player
  if (players.length > 0) {
    updatePriceHistoryChart(players[0].id);
  }
}

function updatePriceHistoryChart(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  
  const canvas = document.getElementById('price-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const history = generatePriceHistory(player.price, 30);
  const prices = history.map(h => h.price);
  
  // Update stats
  const highest = Math.max(...prices);
  const lowest = Math.min(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const volatility = ((highest - lowest) / average * 100).toFixed(1);
  
  const elements = {
    'highest-price': formatPrice(highest),
    'lowest-price': formatPrice(lowest),
    'average-price': formatPrice(Math.round(average)),
    'current-price': formatPrice(player.price),
    'volatility': volatility + '%'
  };
  
  Object.keys(elements).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = elements[id];
  });
  
  // Destroy existing chart
  if (state.priceHistoryChart) {
    state.priceHistoryChart.destroy();
  }
  
  // Create new chart
  state.priceHistoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.date),
      datasets: [{
        label: player.name,
        data: prices,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1E242E',
          borderColor: '#6366F1',
          borderWidth: 1,
          titleColor: '#F9FAFB',
          bodyColor: '#9CA3AF',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return 'Price: ' + formatPrice(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { color: 'rgba(99, 102, 241, 0.1)' },
          ticks: { color: '#6B7280', maxTicksLimit: 10 }
        },
        y: {
          display: true,
          grid: { color: 'rgba(99, 102, 241, 0.1)' },
          ticks: {
            color: '#6B7280',
            callback: function(value) {
              return formatPrice(value);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}



/* ===== assets/js/views/stats-modal.js ===== */

// FC Market Pro - Enhanced Custom Stats Modal
// Comprehensive stat filtering with smooth UX and all options

const customStatsState = {
  activeTab: 'player', // 'player' or 'goalkeeper'
  selectedTemplates: [],
  selectedPrices: [],
  selectedAllStats: [],
  searchAllStats: ''
};

// Player stat templates with descriptive names
const playerStatTemplates = {
  'pace': { label: 'Pace', icon: '⚡', stats: ['acceleration', 'sprint-speed'] },
  'shooting': { label: 'Shooting', icon: '🎯', stats: ['finishing', 'shot-power', 'long-shot', 'penalties'] },
  'passing': { label: 'Passing', icon: '📍', stats: ['short-passing', 'crossing', 'long-passing', 'vision'] },
  'dribbling': { label: 'Dribbling', icon: '🎪', stats: ['agility', 'balance', 'ball-control', 'curve'] },
  'defending': { label: 'Defending', icon: '🛡️', stats: ['marking', 'sliding-tackle', 'standing-tackle', 'reactions'] },
  'physical': { label: 'Physical', icon: '💪', stats: ['strength', 'jumping', 'stamina', 'aggression'] }
};

// Goalkeeper stat templates with descriptive names
const gkStatTemplates = {
  'gk-diving': { label: 'Diving', icon: '🤿', stats: ['gk-diving'] },
  'gk-positioning': { label: 'Positioning', icon: '📍', stats: ['gk-positioning'] },
  'gk-handling': { label: 'Handling', icon: '✋', stats: ['gk-handling'] },
  'gk-reflexes': { label: 'Reflexes', icon: '⚡', stats: ['gk-reflexes'] },
  'gk-kicking': { label: 'Kicking', icon: '⚽', stats: ['gk-kicking'] },
  'physical': { label: 'Physical', icon: '💪', stats: ['strength', 'jumping', 'stamina', 'aggression'] }
};

// Price/value tiers with better labels
const priceTiers = [
  { id: 'Base', label: 'Base', color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.1)' },
  { id: 'Green', label: 'Green', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { id: 'Blue', label: 'Blue', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { id: 'Purple', label: 'Purple', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  { id: 'Red', label: 'Red', color: '#EF4444', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { id: 'Gold', label: 'Gold', color: '#F59E0B', bgColor: 'rgba(239, 68, 68, 0.1)' }
];

// All available stats organized by category
const allStatsOptions = {
  'offense': [
    { id: 'acceleration', label: 'Acceleration' },
    { id: 'agility', label: 'Agility' },
    { id: 'ball-control', label: 'Ball Control' },
    { id: 'crossing', label: 'Crossing' },
    { id: 'curve', label: 'Curve' },
    { id: 'dribbling', label: 'Dribbling' },
    { id: 'finishing', label: 'Finishing' },
    { id: 'free-kick', label: 'Free Kick' },
    { id: 'long-passing', label: 'Long Passing' },
    { id: 'long-shot', label: 'Long Shot' },
    { id: 'penalties', label: 'Penalties' },
    { id: 'short-passing', label: 'Short Passing' },
    { id: 'shot-power', label: 'Shot Power' },
    { id: 'sprint-speed', label: 'Sprint Speed' },
    { id: 'vision', label: 'Vision' },
    { id: 'volley', label: 'Volley' }
  ],
  'defense': [
    { id: 'aggression', label: 'Aggression' },
    { id: 'awareness', label: 'Awareness' },
    { id: 'heading', label: 'Heading' },
    { id: 'marking', label: 'Marking' },
    { id: 'positioning', label: 'Positioning' },
    { id: 'reactions', label: 'Reactions' },
    { id: 'sliding-tackle', label: 'Sliding Tackle' },
    { id: 'standing-tackle', label: 'Standing Tackle' }
  ],
  'physical': [
    { id: 'balance', label: 'Balance' },
    { id: 'jumping', label: 'Jumping' },
    { id: 'stamina', label: 'Stamina' },
    { id: 'strength', label: 'Strength' }
  ],
  'goalkeeper': [
    { id: 'gk-diving', label: 'GK Diving' },
    { id: 'gk-handling', label: 'GK Handling' },
    { id: 'gk-kicking', label: 'GK Kicking' },
    { id: 'gk-positioning', label: 'GK Positioning' },
    { id: 'gk-reflexes', label: 'GK Reflexes' }
  ],
  'other': [
    { id: 'date-added', label: 'Date Added' },
    { id: 'ovr', label: 'Overall' },
    { id: 'skill-moves', label: 'Skill Moves' },
    { id: 'weak-foot', label: 'Weak Foot' },
    { id: 'height', label: 'Height' },
    { id: 'weight', label: 'Weight' },
    { id: 'total-stats', label: 'Total Stats' }
  ]
};

// Flatten all stats for searching
const allStatsFlat = Object.values(allStatsOptions).flat();

// ========== MODAL CONTROL FUNCTIONS ==========

window.openStatsModal = function () {
  const modal = document.getElementById('custom-stats-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // ✅ RENDER ALL STATS (DISPLAY THEM) WITHOUT SELECTING
    renderStatTemplates();
    renderPriceTiers();
    renderAllStats();
    updateSelectionCounters();
  }
};

window.closeStatsModal = function () {
  const modal = document.getElementById('custom-stats-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close on background click
document.addEventListener('DOMContentLoaded', function () {
  const backdrop = document.getElementById('stats-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeStatsModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('custom-stats-modal')?.classList.contains('open')) {
      closeStatsModal();
    }
  });
});

// ========== TAB SWITCHING ==========

window.switchStatsTab = function (tab) {
  customStatsState.activeTab = tab;
  document.querySelectorAll('.stats-tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  renderStatTemplates();
  renderAllStats();
};

// ========== TEMPLATE SELECTION ==========

window.toggleTemplate = function (template, event) {
  event?.stopPropagation();
  const index = customStatsState.selectedTemplates.indexOf(template);
  if (index === -1) {
    customStatsState.selectedTemplates.push(template);
  } else {
    customStatsState.selectedTemplates.splice(index, 1);
  }
  updateTemplateButtons();
  updateSelectionCounters();
};

window.selectAllTemplates = function (event) {
  event?.stopPropagation();
  const templates = customStatsState.activeTab === 'player'
    ? Object.keys(playerStatTemplates)
    : Object.keys(gkStatTemplates);

  if (customStatsState.selectedTemplates.length === templates.length) {
    customStatsState.selectedTemplates = [];
  } else {
    customStatsState.selectedTemplates = [...templates];
  }
  updateTemplateButtons();
  updateSelectionCounters();
};

function updateTemplateButtons() {
  customStatsState.selectedTemplates.forEach(template => {
    const btn = document.querySelector(`[data-template="${template}"]`);
    if (btn) btn.classList.add('selected');
  });

  Object.keys(customStatsState.activeTab === 'player' ? playerStatTemplates : gkStatTemplates).forEach(template => {
    if (!customStatsState.selectedTemplates.includes(template)) {
      const btn = document.querySelector(`[data-template="${template}"]`);
      if (btn) btn.classList.remove('selected');
    }
  });

  // Update "Select All" checkbox
  const templates = customStatsState.activeTab === 'player'
    ? Object.keys(playerStatTemplates)
    : Object.keys(gkStatTemplates);
  const selectAllBtn = document.querySelector('.template-select-all');
  if (selectAllBtn) {
    selectAllBtn.classList.toggle('selected', customStatsState.selectedTemplates.length === templates.length);
  }
}

// ========== PRICE TIER SELECTION ==========

window.togglePrice = function (priceId, event) {
  event?.stopPropagation();
  const index = customStatsState.selectedPrices.indexOf(priceId);
  if (index === -1) {
    customStatsState.selectedPrices.push(priceId);
  } else {
    customStatsState.selectedPrices.splice(index, 1);
  }
  updatePriceButtons();
  updateSelectionCounters();
};

window.selectAllPrices = function (event) {
  event?.stopPropagation();
  if (customStatsState.selectedPrices.length === priceTiers.length) {
    customStatsState.selectedPrices = [];
  } else {
    customStatsState.selectedPrices = priceTiers.map(p => p.id);
  }
  updatePriceButtons();
  updateSelectionCounters();
};

function updatePriceButtons() {
  priceTiers.forEach(tier => {
    const btn = document.querySelector(`[data-price="${tier.id}"]`);
    if (btn) {
      btn.classList.toggle('selected', customStatsState.selectedPrices.includes(tier.id));
    }
  });

  const selectAllBtn = document.querySelector('.price-select-all');
  if (selectAllBtn) {
    selectAllBtn.classList.toggle('selected', customStatsState.selectedPrices.length === priceTiers.length);
  }
}

// ========== ALL STATS SELECTION ==========

window.toggleAllStat = function (stat, event) {
  event?.stopPropagation();
  const index = customStatsState.selectedAllStats.indexOf(stat);
  if (index === -1) {
    customStatsState.selectedAllStats.push(stat);
  } else {
    customStatsState.selectedAllStats.splice(index, 1);
  }
  updateAllStatButtons();
  updateSelectionCounters();
};

window.selectAllStats = function (event) {
  event?.stopPropagation();
  const allStats = allStatsFlat.map(s => s.id);
  if (customStatsState.selectedAllStats.length === allStats.length) {
    customStatsState.selectedAllStats = [];
  } else {
    customStatsState.selectedAllStats = [...allStats];
  }
  updateAllStatButtons();
  updateSelectionCounters();
};

function updateAllStatButtons() {
  allStatsFlat.forEach(stat => {
    const btn = document.querySelector(`[data-stat="${stat.id}"]`);
    if (btn) {
      btn.classList.toggle('selected', customStatsState.selectedAllStats.includes(stat.id));
    }
  });

  const selectAllBtn = document.querySelector('.allstats-select-all');
  if (selectAllBtn) {
    selectAllBtn.classList.toggle('selected', customStatsState.selectedAllStats.length === allStatsFlat.length);
  }
}

// ========== SEARCH ALL STATS ==========

window.searchAllStats = function (query) {
  customStatsState.searchAllStats = query.toLowerCase();
  renderAllStats();
};

// ========== SELECTION COUNTER ==========

function updateSelectionCounters() {
  const templateCount = document.querySelector('.template-count');
  if (templateCount) templateCount.textContent = customStatsState.selectedTemplates.length;

  const priceCount = document.querySelector('.price-count');
  if (priceCount) priceCount.textContent = customStatsState.selectedPrices.length;

  const statCount = document.querySelector('.stat-count');
  if (statCount) statCount.textContent = customStatsState.selectedAllStats.length;
}

// ========== RENDER FUNCTIONS ==========

function renderStatTemplates() {
  const container = document.getElementById('stat-templates-grid');
  if (!container) return;

  const templates = customStatsState.activeTab === 'player' ? playerStatTemplates : gkStatTemplates;
  const html = Object.entries(templates).map(([key, template]) => `
    <button class="stat-template-btn${customStatsState.selectedTemplates.includes(key) ? ' selected' : ''}" 
            data-template="${key}" 
            onclick="toggleTemplate('${key}', event)">
      <span class="template-icon">${template.icon}</span>
      <span class="template-label">${template.label}</span>
    </button>
  `).join('');

  container.innerHTML = html;
}

function renderPriceTiers() {
  const container = document.getElementById('price-tiers-grid');
  if (!container) return;

  const html = priceTiers.map(tier => `
    <button class="price-tier-btn${customStatsState.selectedPrices.includes(tier.id) ? ' selected' : ''}" 
            data-price="${tier.id}" 
            onclick="togglePrice('${tier.id}', event)"
            style="border-color: ${tier.color};">
      <span class="price-dot" style="background-color: ${tier.color};"></span>
      <span class="price-label">${tier.label}</span>
    </button>
  `).join('');

  container.innerHTML = html;
}

function renderAllStats() {
  const container = document.getElementById('all-stats-grid');
  if (!container) return;

  const query = customStatsState.searchAllStats;
  const html = Object.entries(allStatsOptions).map(([category, stats]) => {
    const filteredStats = stats.filter(s =>
      !query || s.label.toLowerCase().includes(query) || s.id.includes(query)
    );

    if (filteredStats.length === 0) return '';

    return `
      <div class="stats-category">
        <div class="category-header">
          <span class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <span class="category-count">${filteredStats.length}</span>
        </div>
        <div class="stats-category-items">
          ${filteredStats.map(stat => `
            <button class="stat-item-btn${customStatsState.selectedAllStats.includes(stat.id) ? ' selected' : ''}"
                    data-stat="${stat.id}"
                    onclick="toggleAllStat('${stat.id}', event)">
              ${stat.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html || '<div class="no-results">No stats found matching your search</div>';
}

// ========== ACTION BUTTONS ==========

window.resetStatsFilters = function() {
    customStatsState.selectedTemplates = [];
    customStatsState.selectedPrices = [];
    customStatsState.selectedAllStats = [];
    customStatsState.searchAllStats = '';
    
    document.getElementById('all-stats-search').value = '';
    
    // Clear global and localStorage
    window.customSelectedStats = [];
    localStorage.removeItem('customSelectedStats');
    
    updateTemplateButtons();
    updatePriceButtons();
    updateAllStatButtons();
    updateSelectionCounters();
    renderAllStats();
    
    console.log('🧹 Reset custom stats filters');
    
    // Reload current view
    if (window.state && window.state.currentView === 'database') {
        window.loadDatabase();
    } else if (window.state && window.state.currentView === 'watchlist') {
        window.loadWatchlist();
    }
};


window.applyStatsFilters = function() {
    // Save selected stats globally for app.js to access
    window.customSelectedStats = [...customStatsState.selectedAllStats];
    
    // Also save to localStorage for persistence
    localStorage.setItem('customSelectedStats', JSON.stringify(customStatsState.selectedAllStats));
    
    console.log('✅ Applied custom stats filters:', customStatsState.selectedAllStats);
    
    // Reload the current view to apply changes
    if (window.state && window.state.currentView === 'database') {
        window.loadDatabase();
    } else if (window.state && window.state.currentView === 'watchlist') {
        window.loadWatchlist();
    }
    
    // Close the modal
    window.closeStatsModal();
};


// Initialize from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('customSelectedStats');
    if (saved) {
        try {
            window.customSelectedStats = JSON.parse(saved);
            console.log('📦 Loaded custom stats from localStorage:', window.customSelectedStats);
        } catch (e) {
            window.customSelectedStats = [];
        }
    } else {
        window.customSelectedStats = [];
    }
});




/* ===== assets/js/views/roiCalculator.js ===== */

// FC Market Pro - ROI Calculator Modal
// Handles investment ROI calculations with beautiful modal UI

/**
 * Open ROI Calculator Modal
 */
function openROIModal() {
  const modal = document.getElementById('roi-calculator-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Focus on buying price input
    setTimeout(() => {
      document.getElementById('roi-buying-price')?.focus();
    }, 100);
  }
}

/**
 * Close ROI Calculator Modal
 */
function closeROIModal() {
  const modal = document.getElementById('roi-calculator-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Calculate ROI and display results
 */
function calculateROIModal() {
  const buyingPrice = parseFloat(document.getElementById('roi-buying-price')?.value) || 0;
  const sellingPrice = parseFloat(document.getElementById('roi-selling-price')?.value) || 0;
  const quantity = parseInt(document.getElementById('roi-quantity')?.value) || 1;
  const taxRate = parseFloat(document.getElementById('roi-tax-rate')?.value) || 10;

  // Validation
  if (buyingPrice <= 0) {
    document.getElementById('roi-buying-price').focus();
    return;
  }

  if (sellingPrice <= 0) {
    document.getElementById('roi-selling-price').focus();
    return;
  }

  if (quantity <= 0) {
    return;
  }

  if (taxRate < 0 || taxRate > 100) {
    return;
  }

  // Calculate metrics
  const totalInvestment = buyingPrice * quantity;
  const totalRevenue = sellingPrice * quantity;
  const grossProfit = totalRevenue - totalInvestment;
  const taxAmount = totalRevenue * (taxRate / 100);
  const netProfit = grossProfit - taxAmount;
  const roiPercent = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  // Update results display
  document.getElementById('roi-result-tax').textContent = formatPrice(taxAmount);
  document.getElementById('roi-result-profit').textContent = formatPrice(netProfit);
  document.getElementById('roi-result-roi-percent').textContent = roiPercent.toFixed(2) + '%';

  // Show results section with animation
  const resultsSection = document.getElementById('roi-results-section');
  if (resultsSection) {
    resultsSection.style.display = 'block';
  }

  // Change profit color based on positive/negative
  const profitElement = document.getElementById('roi-result-profit');
  if (netProfit < 0) {
    profitElement.style.color = '#ff6b9d';
  } else if (netProfit === 0) {
    profitElement.style.color = '#a0aec0';
  } else {
    profitElement.style.color = '#4ade80';
  }

  // Change ROI% color based on value
  const roiElement = document.getElementById('roi-result-roi-percent');
  if (roiPercent < 0) {
    roiElement.style.color = '#ff6b9d';
  } else if (roiPercent === 0) {
    roiElement.style.color = '#a0aec0';
  } else {
    roiElement.style.color = '#ffd700';
  }

}

/**
 * Reset ROI Calculator
 */
function resetROIModal() {
  document.getElementById('roi-buying-price').value = '';
  document.getElementById('roi-selling-price').value = '';
  document.getElementById('roi-quantity').value = '1';
  document.getElementById('roi-tax-rate').value = '10';

  const resultsSection = document.getElementById('roi-results-section');
  if (resultsSection) {
    resultsSection.style.display = 'none';
  }

  document.getElementById('roi-buying-price').focus();
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Allow Enter key to calculate in all ROI inputs
  ['roi-buying-price', 'roi-selling-price', 'roi-quantity', 'roi-tax-rate'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          calculateROIModal();
        }
      });
    }
  });

  // Close modal when clicking outside
  const modal = document.getElementById('roi-calculator-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeROIModal();
      }
    });
  }

  // Allow Tab navigation in the form
  const taxRateInput = document.getElementById('roi-tax-rate');
  if (taxRateInput) {
    taxRateInput.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        document.querySelector('.roi-calculate-btn')?.focus();
      }
    });
  }
});




/* ===== assets/js/views/themeSelector.js ===== */

// ===== FIELD THEME SYSTEM =====

// Define all themes
const fieldThemes = {
  'stadium-blue': {
    id: 'stadium-blue',
    name: 'fc-stadium',
    background: 'url(assets/images/background/squad_builder_1.webp) center/cover no-repeat',
  },

  'camp-nou': {
    id: 'camp-nou',
    name: 'Camp Nou',
    background: 'url(assets/images/background/squad_builder_2.webp) center/cover no-repeat',
  },

  'old-trafford': {
    id: 'old-trafford',
    name: 'Old Trafford',
    background: 'url(assets/images/background/squad_builder_3.webp) center/cover no-repeat',
  },

  'santiago-bernabeu': {
    id: 'santiago-bernabeu',
    name: 'Santiago Bernabeu',
    background: 'url(assets/images/background/squad_builder_4.webp) center/cover no-repeat',
  },

  'anfield': {
    id: 'anfield',
    name: 'Anfield',
    background: 'url(assets/images/background/squad_builder_5.webp) center/cover no-repeat',
  }
};

// Initialize theme state
let currentTheme = localStorage.getItem('selectedFieldTheme') || 'camp-nou';

// ===== OPEN/CLOSE THEME MODAL =====

function openThemeSelector() {
  const overlay = document.getElementById('theme-selector-overlay');
  if (!overlay) {
    console.warn('Theme overlay not found');
    return;
  }
  overlay.style.display = 'flex';
  renderThemeGallery();
}

function closeThemeSelector() {
  const overlay = document.getElementById('theme-selector-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
}

// ===== RENDER THEME GALLERY =====

function renderThemeGallery() {
  const gallery = document.getElementById('theme-gallery');
  if (!gallery) {
    console.warn('Theme gallery not found');
    return;
  }

  gallery.innerHTML = '';

  Object.values(fieldThemes).forEach(theme => {
    const option = document.createElement('div');
    option.className = 'theme-option' + (currentTheme === theme.id ? ' active' : '');
    option.dataset.themeId = theme.id;

    option.innerHTML = `
      <div class="theme-option-preview" style="background: ${theme.background}; background-attachment: fixed;">
        <div class="theme-option-name">${theme.name}</div>
      </div>
    `;

    option.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(el => {
        el.classList.remove('active');
      });
      option.classList.add('active');
      currentTheme = theme.id;
    });

    gallery.appendChild(option);
  });
}

// ===== APPLY THEME (FIXED) =====

function applyTheme(themeId) {
  const theme = fieldThemes[themeId];

  if (!theme) {
    console.error('❌ Theme not found:', themeId);
    return;
  }

  // FIXED: Use correct element ID
  const fieldContainer = document.getElementById('squad-field');

  if (!fieldContainer) {
    console.error('❌ Field element with id="squad-field" NOT found!');
    return;
  }

  // Remove all old theme classes
  Object.keys(fieldThemes).forEach(key => {
    fieldContainer.classList.remove(`theme-${key}`);
  });

  // Apply new theme class
  fieldContainer.classList.add(`theme-${themeId}`);

  // Apply inline style
  fieldContainer.style.background = theme.background;

  // Save to localStorage
  localStorage.setItem('selectedFieldTheme', themeId);

  // Close modal
  closeThemeSelector();

}

// ===== LOAD SAVED THEME =====

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedFieldTheme') || 'classic-green';
  currentTheme = savedTheme;

  // Wait for DOM to be ready
  setTimeout(() => {
    applyTheme(savedTheme);
  }, 100);
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', () => {


  // Theme button click
  const themeButtons = [
    document.getElementById('squad-theme-btn'),
    document.getElementById('squad-theme-btn-mobile-tablet')
  ].filter(Boolean);
  if (themeButtons.length) {
    themeButtons.forEach((themeBtn) => {
      themeBtn.addEventListener('click', () => {
        openThemeSelector();
      });
    });
  } else {
    console.warn('⚠️ Theme button not found');
  }

  // Close button
  const closeBtn = document.getElementById('close-theme-selector');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeThemeSelector);
  }

  // Apply button - THIS IS THE KEY!
  const applyBtn = document.getElementById('apply-theme-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {

      applyTheme(currentTheme);
    });
  } else {
    console.warn('⚠️ Apply button not found');
  }

  // Close on overlay click
  const overlay = document.getElementById('theme-selector-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeThemeSelector();
      }
    });
  }
});




/* ===== assets/js/views/squadBuilder.js ===== */

// squadBuilder.js - FIXED: API Search Error & Database Redirect
// FC Market Pro - Squad Builder

// squadBuilder.js - FIXED: API Search Error & Database Redirect
// FC Market Pro - Squad Builder

// ============ DEVICE DETECTION & RESPONSIVE FORMATIONS ============
function isMobileDevice() {
  const isMobileWidth = window.innerWidth <= 480;
  return isMobileWidth; // Only phones (≤480px) use mobile formations
}

function isTabletDevice() {
  const isTabletWidth = window.innerWidth > 480 && window.innerWidth <= 1024;
  const isPortrait = window.innerHeight > window.innerWidth;
  return isTabletWidth && isPortrait; // Portrait tablets (481-1024px)
}

function getFormations() {
  if (isMobileDevice()) {
    console.log('📱 MOBILE - Using mobileFormations');
    console.log('First slot coords:', mobileFormations['3-4-1-2'].slots[0]);
    return mobileFormations;
  } else if (isTabletDevice()) {
    console.log('📱 TABLET - Using tabletFormations');
    return tabletFormations;
  } else {
    console.log('💻 DESKTOP - Using formations');
    return formations;
  }
}


let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const currentView = document.querySelector('.view.active');
    if (currentView && currentView.id === 'squad-builder-view') {
      renderSquadBuilder(); // ✅ CORRECT: This function clears field.innerHTML = '' first
    }
  }, 250);
});



// ------- Local state -------
window.squadState = {
  name: 'My Squad',
  formationId: '4-3-3',
  starters: {},
  bench: [],
  playerCustomizations: {},
  dragging: null,
  dragSource: null,
  searchQuery: '',
  activeSlot: null,
  pendingDatabaseAssign: false,
  badges: {
        badge1: false,
        badge2: false,
        badge3: false
    }
};


let squadCustomizationState = window.squadCustomizationState = {
    
    playerId: null,
    slotId: null,
    selectedRank: 0,
    trainingLevel: 0,
    selectedSkills: [],
    baseOvr: null,
    basePosition: null,
    baseName: null,
    baseColors: null,
    savedByPlayer: {}
};


// Local players cache for squad builder
let players = [];

function resolveSquadPlayerId(playerOrId) {
  if (!playerOrId) return null;
  if (typeof playerOrId === 'object') {
    return playerOrId.player_id || playerOrId.id || playerOrId.playerid || null;
  }
  return playerOrId;
}

function getSquadPlayerById(playerId) {
  if (!playerId) return null;
  return getPlayers().find(p =>
    p.id === playerId || p.playerid === playerId || p.player_id === playerId
  ) || null;
}

function getSquadPlayerCustomization(playerId) {
  if (!playerId || !squadState.playerCustomizations) return null;
  return squadState.playerCustomizations[playerId] || null;
}

function setSquadPlayerCustomization(playerId, updates = {}, reason = 'update') {
  if (!playerId) return;
  if (!squadState.playerCustomizations) squadState.playerCustomizations = {};
  const current = squadState.playerCustomizations[playerId] || {};
  const next = { ...current, ...updates };
  squadState.playerCustomizations[playerId] = next;
  console.log('[SQUAD CUSTOM] Synced to squad state', { playerId, reason, updates: Object.keys(updates) });
}

function getSquadPlayerSelectedRank(playerId, playerFallback) {
  const customization = getSquadPlayerCustomization(playerId);
  if (customization && customization.selectedRank !== undefined && customization.selectedRank !== null) {
    const normalized = parseInt(customization.selectedRank, 10);
    return Number.isFinite(normalized) ? normalized : 0;
  }
  const fallbackRank = parseInt(playerFallback?.rank ?? 0, 10);
  return Number.isFinite(fallbackRank) ? fallbackRank : 0;
}

function updateSquadCardRankOverlay(playerId, rankValue) {
  if (typeof applyRankOverlay !== 'function') return;
  const resolvedId = resolveSquadPlayerId(playerId);
  if (!resolvedId) return;
  const previewTarget = document.querySelector(
    `.player-preview-card[data-player-id="${resolvedId}"] .preview-card-inner`
  );
  const benchTarget = document.querySelector(
    `.bench-preview-card[data-player-id="${resolvedId}"] .bench-card-inner`
  );
  const target = previewTarget || benchTarget;
  if (!target) return;
  applyRankOverlay(target, rankValue, {
    scope: 'squad-builder',
    modifierClass: 'rank-overlay--squad-field'
  });
}

function parseAlternatePositions(player) {
  const raw = player?.alternate_position || player?.alternatePosition || player?.alternate_positions || '';
  if (!raw) return [];
  return raw
    .split(',')
    .map(pos => pos.trim())
    .filter(pos => pos.length > 0 && pos !== '0')
    .map(pos => pos.toUpperCase());
}

function getSquadPlayerAltPositions(player) {
  const playerId = resolveSquadPlayerId(player);
  const customization = getSquadPlayerCustomization(playerId);
  if (customization?.altPositions) return customization.altPositions;
  return parseAlternatePositions(player);
}

function isPlayerInSquad(playerId) {
  if (!playerId) return false;
  const starters = Object.values(squadState.starters || {});
  return starters.includes(playerId) || (squadState.bench || []).includes(playerId);
}

function getSquadPlayerBoostedOVR(player) {
  if (!player) return 0;
  const playerId = resolveSquadPlayerId(player);
  const customization = getSquadPlayerCustomization(playerId);
  if (customization && Number.isFinite(customization.boostedOvr) && isPlayerInSquad(playerId)) {
    return customization.boostedOvr;
  }
  return player.ovr || player.overall || 0;
}

function isAltPositionUnlocked(player, slotLabel) {
  const playerId = resolveSquadPlayerId(player);
  const customization = getSquadPlayerCustomization(playerId);
  const unlocked = customization?.altPositionsUnlocked || [];
  if (!unlocked.length) return false;
  const normalizedSlot = (slotLabel || '').toUpperCase().trim();
  return unlocked.includes(normalizedSlot);
}



// ============================================================
// POSITION OVR PENALTY SYSTEM
// ============================================================
const POSITION_PENALTIES = {
  'GK': {
    'gk': 0, 'lb': -18, 'cb': -18, 'rb': -18, 'lwb': -18, 'rwb': -18,
    'cdm': -18, 'cm': -18, 'cam': -18, 'lm': -18, 'rm': -18,
    'lw': -18, 'rw': -18, 'cf': -18, 'st': -18
  },
  'ST': {
    'st': 0, 'rw': -6, 'lw': -6, 'cf': 0,
    'cm': -18, 'rm': -18, 'lm': -18, 'cdm': -18, 'cb': -18, 'lb': -18, 'rb': -18, 'lwb': -18, 'rwb': -18,
    'cam': -9, 'gk': -18
  },
  'LW': {
    'lw': 0, 'st': -6, 'cf': -6, 'lwb': -6, 'rw': -4, 'lm': -4,
    'rm': -18, 'cm': -18, 'cdm': -18, 'cb': -18, 'rb': -18, 'rwb': -18, 'cam': -18,
    'lb': -9, 'gk': -18
  },
  'RW': {
    'rw': 0, 'lw': -4, 'rm': -4, 'st': -6, 'cf': -6, 'rwb': -6,
    'lm': -18, 'cm': -18, 'cdm': -18, 'lb': -18, 'cb': -18, 'lwb': -18, 'cam': -18,
    'rb': -9, 'gk': -18
  },
  'CAM': {
    'cam': 0, 'cf': 0, 'cm': -4, 'lm': -6, 'rm': -6, 'st': -9, 'cdm': -9,
    'lw': -18, 'rw': -18, 'lb': -18, 'cb': -18, 'rb': -18, 'lwb': -18, 'rwb': -18, 'gk': -18
  },
  'CM': {
    'cm': 0, 'cdm': -4, 'cam': -4, 'lm': -4, 'rm': -4,
    'cf': -9, 'lb': -9, 'cb': -9, 'rb': -9, 'lwb': -9, 'rwb': -9,
    'lw': -18, 'st': -18, 'rw': -18, 'gk': -18
  },
  'CDM': {
    'cdm': 0, 'cm': -4, 'cb': -4, 'lm': -6, 'rm': -6, 'lb': -6, 'rb': -6, 'lwb': -6, 'rwb': -6,
    'cam': -9, 'lw': -18, 'st': -18, 'rw': -18, 'cf': -18, 'gk': -18
  },
  'LM': {
    'lm': 0, 'rm': -4, 'lw': -4, 'lwb': -4, 'cdm': -6, 'lb': -6, 'cam': -6, 'cm': -6,
    'cb': -9, 'rb': -9, 'rwb': -9, 'st': -18, 'rw': -18, 'cf': -18, 'gk': -18
  },
  'RM': {
    'rm': 0, 'rw': -4, 'rwb': -4, 'cam': -5, 'cm': -5, 'cdm': -5, 'rb': -5,
    'lb': -7, 'cb': -7, 'lwb': -8, 'cf': -8, 'st': -17, 'lw': -18, 'lm': -17, 'gk': -18
  },
  'LB': {
    'lb': 0, 'lwb': 0, 'cb': -4, 'rb': -4, 'rwb': -4, 'cdm': -6, 'lm': -6,
    'lw': -9, 'cm': -9, 'cam': -9, 'rm': -9, 'st': -18, 'rw': -18, 'cf': -18, 'gk': -18
  },
  'CB': {
    'cb': 0, 'lb': -4, 'rb': -4, 'cdm': -4, 'cm': -9, 'lm': -9, 'rm': -9, 'lwb': -9, 'rwb': -9,
    'lw': -18, 'st': -18, 'rw': -18, 'cam': -18, 'cf': -18, 'gk': -18
  },
  'RB': {
    'rb': 0, 'rwb': 0, 'lb': -4, 'cb': -4, 'lwb': -4, 'cdm': -6, 'rm': -6,
    'rw': -9, 'cm': -9, 'lm': -9, 'lw': -18, 'st': -18, 'cf': -18, 'cam': -18, 'gk': -18
  },
  'LWB': {
    'lwb': 0, 'lb': 0, 'rb': -3, 'rwb': -3, 'lm': -3, 'lw': -5, 'cdm': -5,
    'cm': -7, 'cb': -7, 'rm': -7, 'st': -15, 'cf': -15, 'cam': -15, 'rw': -15, 'gk': -18
  },
  'RWB': {
    'rwb': 0, 'rb': 0, 'lb': -3, 'lwb': -3, 'rm': -5, 'cdm': -5, 'rw': -5,
    'lm': -7, 'cm': -7, 'cb': -7, 'lw': -15, 'st': -15, 'cf': -15, 'cam': -15, 'gk': -18
  },
  'CF': {
    'cf': 0, 'cam': -4, 'st': -4, 'cm': -4, 'lm': -4, 'rm': -4, 'lw': -6, 'rw': -6,
    'cdm': -15, 'lb': -15, 'cb': -15, 'rb': -15, 'lwb': -15, 'rwb': -15, 'gk': -18
  }
};

function getPositionAdjustedOVR(player, slotPosition, options = {}) {
  const playerPos = (player?.position || '').toUpperCase().trim();
  const slotPosKey = (slotPosition || '').toLowerCase().trim();
  const slotPosLabel = (slotPosition || '').toUpperCase().trim();
  const useSquadOverrides = options.useSquadOverrides === true;
  const baseOVR = useSquadOverrides ? getSquadPlayerBoostedOVR(player) : (player?.ovr || player?.overall || 0);
  
  if (!playerPos || !slotPosKey) return baseOVR;
  
  if (useSquadOverrides && isAltPositionUnlocked(player, slotPosLabel)) {
    console.log('[SQUAD OVR] Alt position unlocked, no penalty', {
      playerId: resolveSquadPlayerId(player),
      slot: slotPosLabel,
      baseOVR
    });
    return baseOVR;
  }
  
  const penalty = POSITION_PENALTIES[playerPos]?.[slotPosKey] ?? -18;
  const adjusted = Math.max(0, baseOVR + penalty);
  if (useSquadOverrides) {
    console.log('[SQUAD OVR] Effective OVR calculated', {
      playerId: resolveSquadPlayerId(player),
      slot: slotPosLabel,
      baseOVR,
      penalty,
      adjusted
    });
  }
  return adjusted;
}

// Function to get players from global state or API
function getPlayers() {
  // Try to get from global state first
  if (window.state && window.state.allPlayers && window.state.allPlayers.length > 0) {
    return window.state.allPlayers;
  }
  // Fallback to local cache
  return players;
}

// Function to add player to local cache
function addPlayerToCache(player) {
  const existingIndex = players.findIndex(p => p.id === player.id || p.player_id === player.id);
  if (existingIndex === -1) {
    players.push(player);
    console.log('✅ Player added to cache:', player.name);
  } else {
    players[existingIndex] = { ...players[existingIndex], ...player };
  }
}


// ========================================
// TEAM OVR CALCULATOR (FIXED LOGIC)
// ========================================
// ========================================
// TEAM OVR CALCULATOR (CORRECT BENCH LOGIC)
// ========================================
function calculateTeamOVR() {
  let totalOVR = 0;
  let filledBenchCount = 0;
  
  // Get formation slots (11 starters with positions)
  const currentFormation = getFormations()[squadState.formationId];
  if (!currentFormation) return 0;
  
  // ---- Calculate STARTERS with position penalties ----
  currentFormation.slots.forEach(slot => {
    const pid = squadState.starters[slot.id];
    if (!pid) return;
    
    const player = getPlayers().find(p => 
      p.id === pid || p.playerid === pid || p.player_id === pid
    );
    
    if (player) {
      const adjustedOVR = getPositionAdjustedOVR(player, slot.position, { useSquadOverrides: true });
      totalOVR += adjustedOVR;
    }
  });
  
  // ---- Calculate BENCH (no position penalties) ----
  squadState.bench.forEach(pid => {
    if (!pid) return;
    const player = getPlayers().find(p => 
      p.id === pid || p.playerid === pid || p.player_id === pid
    );
    if (player) {
      totalOVR += getSquadPlayerBoostedOVR(player);
      filledBenchCount++;
    }
  });
  
  const denominator = 11 + filledBenchCount;
  if (totalOVR === 0) return 0;
  
  return Math.ceil(totalOVR / denominator);
}


// ========================================
// FINAL TEAM OVR (with badges)
// ========================================
function getFinalTeamOVR() {
    const baseOVR = calculateTeamOVR();
    
    // Count active badges
    const activeBadges = Object.values(squadState.badges).filter(b => b === true).length;
    
    // Each badge adds +1 OVR
    return baseOVR + activeBadges;
}




// State for API results
let pickerSearchResults = [];
let pickerSearchTimer = null;

// ============ FIXED SEARCH & FILTER LOGIC ============

// 1. Fetch players from API (Using getPlayers for stability)
async function fetchPlayersForPicker() {
    const list = document.getElementById('squad-player-list');
    
    // Only show loading if we are actually searching/filtering in the picker view
    if (list && squadState.searchQuery) {
        list.innerHTML = `<div class="picker-loading" style="padding:20px;text-align:center;color:#888">Searching database...</div>`;
    }
    
    try {
        const query = squadState.searchQuery;
        
        // Build API params correctly for the getPlayers endpoint
        const params = {
            limit: 50,
            rank: 0
        };

        // Map the search query to name_starts_with
        if (query) params.name_starts_with = query;

        // ========== ✅ AUCTIONABLE FILTER ==========
        const auctionableToggle = document.getElementById('squad-auctionable-toggle');
        const auctionableOnly = auctionableToggle?.checked ?? false;
        if (auctionableOnly) {
            // Only show tradable players (is_untradable = 0)
            params.is_untradable = 0;
            console.log('🏷️ [SQUAD FILTER] Auctionable ON - Showing only tradable players');
        } else {
            console.log('🏷️ [SQUAD FILTER] Auctionable OFF - Showing all players');
        }

        // Apply active filters from global state
        if (state.filters.position) params.position = state.filters.position;

        console.log('🔍 FETCH DEBUG: state.filters.ratingMin:', state.filters.ratingMin);
        console.log('🔍 FETCH DEBUG: state.filters.ratingMax:', state.filters.ratingMax);

        if (state.filters.ratingMin > 40) params.min_ovr = state.filters.ratingMin;
        if (state.filters.ratingMax < 150) params.max_ovr = state.filters.ratingMax;

        console.log('🔍 FETCH DEBUG: Final params sent to API:', params);

        if (state.filters.priceMin) params.min_price = state.filters.priceMin;
        if (state.filters.priceMax) params.max_price = state.filters.priceMax;
        if (state.filters.league) params.league = state.filters.league;
        if (state.filters.nation) params.nation = state.filters.nation;
        if (state.filters.skillMoves) params.skill_moves = state.filters.skillMoves;
        if (state.filters.club) params.team = state.filters.club; // CLUB FILTER
        if (state.filters.event) params.event = state.filters.event; // EVENT FILTER

        
        // Map the search query to 'namestartswith' so it works with filters
        if (query) {
            params.namestartswith = query;
        }
        
        // Apply active filters from global state
        if (state.filters.position) params.position = state.filters.position;

        console.log('🔍 FETCH DEBUG: state.filters.ratingMin:', state.filters.ratingMin);
        console.log('🔍 FETCH DEBUG: state.filters.ratingMax:', state.filters.ratingMax);
        if (state.filters.ratingMin > 40) params.min_ovr = state.filters.ratingMin;
        if (state.filters.ratingMax < 150) params.max_ovr = state.filters.ratingMax;
        console.log('🔍 FETCH DEBUG: Final params sent to API:', params);
        if (state.filters.priceMin) params.minprice = state.filters.priceMin;
        if (state.filters.priceMax) params.maxprice = state.filters.priceMax;
        if (state.filters.league) params.league = state.filters.league;
        if (state.filters.nation) params.nation = state.filters.nation;
        if (state.filters.skillMoves) params.skillmoves = state.filters.skillMoves;
        if (state.filters.club) params.team = state.filters.club;  // ✅ CLUB FILTER
        if (state.filters.event) params.event = state.filters.event;  // ✅ EVENT FILTER
        
        console.log('[SQUAD BUILDER] Fetching with params:', params);

        // Use getPlayers instead of searchPlayers to ensure filters like Position are respected
        const data = await window.apiClient.getPlayers(params);
        let players = data.players || [];

        if (window.supabaseProvider && typeof window.supabaseProvider.syncPrices === 'function') {
            console.log('[SQUAD BUILDER] Syncing prices for picker players:', players.length);
            players = await window.supabaseProvider.syncPrices(players);
            console.log('[SQUAD BUILDER] Picker price sync complete. Sample:', players.slice(0, 3).map(p => ({
                id: p.player_id || p.id,
                price: p.price
            })));
        }

        pickerSearchResults = players;

        // 🔍 DEBUG: Check what API returned
        console.log('🔍 API RESPONSE: Total players received:', pickerSearchResults.length);
        console.log('🔍 API RESPONSE: First 5 players OVR:', pickerSearchResults.slice(0, 5).map(p => ({ name: p.name, ovr: p.ovr || p.overall })));
        console.log('🔍 API RESPONSE: All players OVR range:', {
            min: Math.min(...pickerSearchResults.map(p => p.ovr || p.overall || 0)),
            max: Math.max(...pickerSearchResults.map(p => p.ovr || p.overall || 0))
        });

        // Render the results
        renderPlayerPicker();



    } catch (error) {
        console.error('[Squad Search Error]', error);
        if (list) {
            list.innerHTML = `<div style="padding:20px;text-align:center;color:red">Error loading players. API may be offline.</div>`;
        }
    }
}


// 2. Triggered by Filters (Sidebar)
function applyFiltersToPickerPlayers() {
  if (pickerSearchTimer) clearTimeout(pickerSearchTimer);
  fetchPlayersForPicker();
}

// 3. Triggered by Search Input (Debounced)
function updatePickerSearch(query) {
  squadState.searchQuery = query;
  
  if (pickerSearchTimer) clearTimeout(pickerSearchTimer);
  
  // Wait 500ms before hitting the API to prevent spamming
  pickerSearchTimer = setTimeout(() => {
    fetchPlayersForPicker();
  }, 500);
}

// 4. Render the Picker List
function renderPlayerPicker() {
  const list = document.getElementById('squad-player-list');
  const hint = document.getElementById('squad-player-hint');

  if (!list) return;

  const playersToRender = pickerSearchResults.length > 0 ? pickerSearchResults : [];

  list.innerHTML = '';
  
  if (playersToRender.length === 0) {
    if (hint) hint.textContent = 'No players match your search.';
    // Attempt a default fetch if empty and no query
    if (!squadState.searchQuery && !pickerSearchTimer) {
         fetchPlayersForPicker(); 
    }
    return;
  } else {
    if (hint) hint.textContent = '🖱️ Drag players to field or click to assign.';
  }

  playersToRender.forEach(p => {
    const row = document.createElement('div');
    row.className = 'picker-row';
    row.setAttribute('draggable', 'true');
    
    // Normalize Data
    const pid = p.player_id || p.id;
    const overall = p.ovr || p.overall || 0;
    const position = p.position || 'N/A';
    const price = p.price || 0;
    const club = p.club || p.team || 'Unknown Club';
    const isUntradableText = String(p.is_untradable ?? p.isuntradable ?? '').toLowerCase();
    const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
    const untradableBadgeHTML = isUntradable
      ? `<div class="card-untradable-badge" style="pointer-events: none;">
           <img src="assets/images/untradable_img.png" alt="Untradable">
         </div>`
      : '';

    row.innerHTML = `
        <div class="picker-card-mini">
            <img src="${p.card_background || 'https://via.placeholder.com/300x400'}"
                alt="Card Background"
                class="picker-card-bg"
                onerror="this.src='https://via.placeholder.com/300x400'">

            <img src="${p.player_image || 'https://via.placeholder.com/200x300'}"
                alt="${p.name}"
                class="picker-card-player-img"
                onerror="this.src='https://via.placeholder.com/200x300'">

            <div class="picker-card-ovr" style="color: ${p.color_rating || '#FFFFFF'}">
                ${overall > 0 ? overall : 'N/A'}
            </div>

            <div class="picker-card-position" style="color: ${p.color_position || '#FFFFFF'}">
                ${position}
            </div>

            <div class="picker-card-name" style="color: ${p.color_name || '#FFFFFF'}">
                ${p.name}
            </div>

            <img src="${p.nation_flag}" alt="Nation" class="picker-squad-card-flag-nation ${getPlayerType(p) === 'normal' ? 'normal-squad-nation-flag' : 'hero-icon-squad-nation-flag'}" onerror="this.style.display='none'">
            <img src="${p.club_flag}" alt="Club" class="picker-squad-card-flag-club ${getPlayerType(p) === 'normal' ? 'normal-squad-club-flag' : 'hero-icon-squad-club-flag'}" onerror="this.style.display='none'">
            ${getPlayerType(p) === 'normal' && p.league_image ? `
                <img src="${p.league_image}" 
                     alt="League" 
                     class="picker-squad-card-flag-league normal-squad-league-flag" 
                     onerror="this.style.display='none'">
            ` : ''}
            ${untradableBadgeHTML}
        </div>

        <div class="picker-main">
            <div class="picker-name">${p.name}</div>
            <div class="picker-meta">${position} • ${club}</div>
        </div>

        <div class="picker-ovr-right">${overall > 0 ? overall : 'N/A'}</div>
    `;

    
    // Drag Start
    // Drag Start - Create custom drag image of the entire card
    row.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        
        // Create a clone of the picker-card-mini for drag preview
        const cardMini = row.querySelector('.picker-card-mini');
        if (cardMini) {
            const clone = cardMini.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.width = cardMini.offsetWidth + 'px';
            clone.style.height = cardMini.offsetHeight + 'px';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.9';
            clone.style.transform = 'rotate(0deg)'; // Remove any transforms
            document.body.appendChild(clone);
            
            // Set the clone as drag image
            e.dataTransfer.setDragImage(clone, cardMini.offsetWidth / 2, cardMini.offsetHeight / 2);
            
            // Remove clone after drag starts
            setTimeout(() => {
                document.body.removeChild(clone);
            }, 0);
        }
        
        handleCardDragStart(e, pid, 'picker', null);
        ensurePlayerInGlobalList(p, pid, overall);
    });

    row.addEventListener('pointerdown', (e) => {
        queuePointerDrag(e, pid, 'picker', null, () => ensurePlayerInGlobalList(p, pid, overall));
    });

    
    row.addEventListener('dragend', clearDragState);
    
    // Click to Assign
    row.addEventListener('click', () => {
      if (!squadState.activeSlot) {
        return;
      }
      
      ensurePlayerInGlobalList(p, pid, overall);

      if (squadState.activeSlot.startsWith('BENCH_')) {
        const index = parseInt(squadState.activeSlot.split('_')[1], 10);
        if (isPlayerAlreadyInSquad(pid, null)) {
          return;
        }
        removeIfAssigned(pid);
        squadState.bench[index] = pid;
        renderSquadBuilder();
      } else {
        if (!validateAssignment(p, squadState.activeSlot)) {
          return;
        }
        if (isPlayerAlreadyInSquad(pid, squadState.activeSlot)) {
          return;
        }
        removeIfAssigned(pid);
        squadState.starters[squadState.activeSlot] = pid;
        renderSquadBuilder();
      }
    });
    
    list.appendChild(row);
  });
}

function resolveSquadPlayerPrice(player) {
    if (!player) return 0;

    const candidates = [];
    const rank = parseInt(player.rank ?? player.selectedRank ?? player.rank_level ?? player.rankLevel ?? 0, 10);
    const rankKey = Number.isFinite(rank) ? `price${rank}` : null;

    if (rankKey && player[rankKey] !== undefined) {
        candidates.push(player[rankKey]);
    }

    for (let i = 0; i <= 5; i++) {
        const key = `price${i}`;
        if (player[key] !== undefined) {
            candidates.push(player[key]);
        }
    }

    candidates.push(
        player.price,
        player.market_price,
        player.current_price,
        player.latest_price,
        player.min_price,
        player.max_price,
        player.value,
        player.buy_now_price
    );

    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined) continue;
        const normalized = typeof candidate === 'string' ? candidate.replace(/,/g, '') : candidate;
        const numeric = Number(normalized);
        if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
        }
    }

    return 0;
}

// Helper: Add player to global list so they appear correctly on the pitch
function ensurePlayerInGlobalList(p, pid, overall) {
  console.log('📦 Ensuring player in list:', p.name, pid);
  
  const resolvedId = p.player_id || pid || p.id;
  const pickMediaValue = (...values) => {
    for (const value of values) {
      if (value === undefined || value === null) continue;
      if (typeof value === 'string' && value.trim() === '') continue;
      return value;
    }
    return null;
  };
  const cardBackground = pickMediaValue(
    p.card_background, p.cardbackground, p.cardBackground, p.card_bg, p.cardBg,
    p.card_image, p.cardImage, p.cardimg, p.card
  );
  const playerImage = pickMediaValue(
    p.player_image, p.playerimage, p.playerImage, p.playerimg, p.playerImg, p.player_img,
    p.image, p.image_url, p.imageUrl, p.imageurl, p.player_face, p.playerFace
  );
  const nationFlag = pickMediaValue(
    p.nation_flag, p.nationflag, p.nationFlag, p.nationflagurl, p.country_flag, p.countryFlag
  );
  const clubFlag = pickMediaValue(
    p.club_flag, p.clubflag, p.clubFlag, p.clublogourl, p.club_logo, p.clubLogo, p.team_flag, p.teamFlag
  );
  const leagueFlag = pickMediaValue(
    p.league_flag, p.leagueflag, p.leagueFlag, p.leagueflagurl, p.league_logo, p.leagueLogo
  );
  const normalizedPlayer = {
    ...p,
    id: resolvedId,
    player_id: resolvedId,
    overall: overall || p.ovr || p.overall || 0,
    ovr: overall || p.ovr || p.overall || 0,
    name: p.name,
    position: p.position,
    team: p.club || p.team,
    club: p.club || p.team,
    price: resolveSquadPlayerPrice(p),
    ...(cardBackground ? {
      card_background: cardBackground,
      cardbackground: cardBackground,
      cardBackground
    } : {}),
    ...(playerImage ? {
      player_image: playerImage,
      playerimage: playerImage,
      player_img: playerImage,
      playerImg: playerImage
    } : {}),
    ...(nationFlag ? {
      nation_flag: nationFlag,
      nationflag: nationFlag,
      nationFlag
    } : {}),
    ...(clubFlag ? {
      club_flag: clubFlag,
      clubflag: clubFlag,
      clubFlag
    } : {}),
    ...(leagueFlag ? {
      league_flag: leagueFlag,
      leagueflag: leagueFlag,
      leagueFlag
    } : {})
  };
  
  addPlayerToCache(normalizedPlayer);
  console.info('[SQUAD MEDIA] Normalized player media', {
    playerId: resolvedId,
    hasCardBackground: Boolean(cardBackground),
    hasPlayerImage: Boolean(playerImage),
    hasNationFlag: Boolean(nationFlag),
    hasClubFlag: Boolean(clubFlag),
    hasLeagueFlag: Boolean(leagueFlag)
  });
  
  // Also add to global state if available
  if (window.state && window.state.allPlayers) {
    const exists = window.state.allPlayers.find(existing => 
      existing.id === normalizedPlayer.id || 
      existing.player_id === normalizedPlayer.id
    );
    if (!exists) {
      window.state.allPlayers.push(normalizedPlayer);
      console.log('✅ Added to global state');
    } else {
      Object.assign(exists, normalizedPlayer);
    }
  }
}

// Clear filters
function clearSquadFilters() {
    // Reset filter state
    state.filters = {
        position: '',
        ratingMin: 40,
        ratingMax: 150,
        priceMin: null,
        priceMax: null,
        league: '',
        nation: '',
        club: '',
        event: '',
        skillMoves: ''
    };
    
    // Clear search query
    squadState.searchQuery = '';
    const searchInput = document.getElementById('squad-picker-search');
    if (searchInput) searchInput.value = '';
    
    // Reset all filter UI elements
    document.querySelectorAll('.filter-input, .filter-select').forEach(el => {
        el.value = '';
    });
    
    // Reset OVR range inputs
    const ratingMin = document.getElementById('squad-rating-min');
    const ratingMax = document.getElementById('squad-rating-max');
    if (ratingMin) ratingMin.value = '40';
    if (ratingMax) ratingMax.value = '150';
    
    // Update rating display
    const ratingValue = document.getElementById('squad-rating-value');
    if (ratingValue) ratingValue.textContent = '40-150';
    
    // Re-fetch players with cleared filters
    applyFiltersToPickerPlayers();
}

// ============ END OF SEARCH LOGIC ============
// ============ END OF NEW CODE ============

// ============ END OF NEW CODE ============


// ------- ALL 37 FORMATIONS -------
const formations = {
  '3-4-1-2': {
    label: '3-4-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 55, y: 83 },
      { id: 'LCB', label: 'CB', x: 28, y: 65 },
      { id: 'CB', label: 'CB', x: 55, y: 65 },
      { id: 'RCB', label: 'CB', x: 82, y: 65 },
      { id: 'LM', label: 'LM', x: 20, y: 36 },
      { id: 'LCM', label: 'CM', x: 40, y: 46 },
      { id: 'RCM', label: 'CM', x: 70, y: 46 },
      { id: 'RM', label: 'RM', x: 90, y: 36 },
      { id: 'CAM', label: 'CAM', x: 55, y: 31 },  
      { id: 'LS', label: 'ST', x: 43, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
    ]
},
  '3-4-2-1': {
    label: '3-4-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LCB', label: 'LCB', x: 31, y: 69 },
      { id: 'CB', label: 'CB', x: 53, y: 61 },
      { id: 'RCB', label: 'RCB', x: 72, y: 69 },
      { id: 'LM', label: 'LM', x: 19, y: 39 },
      { id: 'LCM', label: 'LCM', x: 36, y: 49 },
      { id: 'RCM', label: 'RCM', x: 68, y: 49 },
      { id: 'RM', label: 'RM', x: 85, y: 39 },
      { id: 'LAM', label: 'CAM', x: 36, y: 26 },
      { id: 'RAM', label: 'CAM', x: 68, y: 26 },
      { id: 'ST', label: 'ST', x: 53, y: 14 }
    ]
},
  '3-4-3-DIAMOND': {
    label: '3-4-3 Diamond',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 30, y: 66 },
      { id: 'CB', label: 'CB', x: 53, y: 66 },
      { id: 'RCB', label: 'RCB', x: 77, y: 66 },
      { id: 'LM', label: 'LM', x: 25, y: 40 },
      { id: 'CDM', label: 'CDM', x: 43, y: 47 },
      { id: 'CAM', label: 'CAM', x: 63, y: 42 },
      { id: 'RM', label: 'RM', x: 83, y: 40 },
      { id: 'LW', label: 'LW', x: 35, y: 22 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 72, y: 22 }
    ]
  },
  '3-4-3-FLAT': {
    label: '3-4-3 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 84 },
      { id: 'LCB', label: 'LCB', x: 29, y: 67 },
      { id: 'CB', label: 'CB', x: 53, y: 67 },
      { id: 'RCB', label: 'RCB', x: 76, y: 67 },
      { id: 'LM', label: 'LM', x: 20, y: 43 },
      { id: 'LCM', label: 'CM', x: 42, y: 43 },
      { id: 'RCM', label: 'CM', x: 64, y: 43 },
      { id: 'RM', label: 'RM', x: 86, y: 43 },
      { id: 'LW', label: 'LW', x: 32, y: 16 },
      { id: 'ST', label: 'ST', x: 53, y: 15 },
      { id: 'RW', label: 'RW', x: 74, y: 16 }
    ]
  },
  '3-5-1-1': {
    label: '3-5-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 25, y: 61 },
      { id: 'CB', label: 'CB', x: 53, y: 61 },
      { id: 'RCB', label: 'RCB', x: 78, y: 61 },
      { id: 'LM', label: 'LM', x: 21, y: 32 },
      { id: 'LDM', label: 'CDM', x: 43, y: 47 },
      { id: 'CM', label: 'CM', x: 53, y: 33 },
      { id: 'RDM', label: 'CDM', x: 65, y: 47 },
      { id: 'RM', label: 'RM', x: 85, y: 32 },
      { id: 'LST', label: 'ST', x: 42, y: 17 },
      { id: 'RST', label: 'ST', x: 66, y: 17 }
    ]
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 27, y: 63 },
      { id: 'CB', label: 'CB', x: 53, y: 63 },
      { id: 'RCB', label: 'RCB', x: 78, y: 63 },
      { id: 'LM', label: 'LM', x: 20, y: 39 },
      { id: 'LDM', label: 'CDM', x: 41, y: 47 },
      { id: 'CAM', label: 'CAM', x: 53, y: 33 },
      { id: 'RDM', label: 'CDM', x: 64, y: 47 },
      { id: 'RM', label: 'RM', x: 85, y: 39 },
      { id: 'LS', label: 'ST', x: 41, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
    ]
  },
  '4-1-2-1-2-NARROW': {
    label: '4-1-2-1-2 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 69, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'CDM', label: 'CDM', x: 54, y: 54 },
      { id: 'LCM', label: 'CM', x: 37, y: 42 },
      { id: 'RCM', label: 'CM', x: 72, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 28 },
      { id: 'LS', label: 'ST', x: 43, y: 12 },
      { id: 'RS', label: 'ST', x: 66, y: 12 }
    ]
  },
  '4-1-2-1-2-WIDE': {
    label: '4-1-2-1-2 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 69 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 72, y: 70 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'CDM', label: 'CDM', x: 54, y: 54 },
      { id: 'LM', label: 'LM', x: 25, y: 39 },
      { id: 'RM', label: 'RM', x: 78, y: 39 },
      { id: 'CAM', label: 'CAM', x: 54, y: 28 },
      { id: 'LS', label: 'ST', x: 42, y: 17 },
      { id: 'RS', label: 'ST', x: 66, y: 17 }
    ]
  },
  '4-1-3-2': {
    label: '4-1-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 37, y: 68 },
      { id: 'RCB', label: 'CB', x: 73, y: 68 },
      { id: 'RB', label: 'RB', x: 91, y: 66 },
      { id: 'CDM', label: 'CDM', x: 53, y: 54 },
      { id: 'LM', label: 'LM', x: 24, y: 34 },
      { id: 'CM', label: 'CM', x: 53, y: 34 },
      { id: 'RM', label: 'RM', x: 80, y: 34 },
      { id: 'LS', label: 'ST', x: 42, y: 17 },
      { id: 'RS', label: 'ST', x: 66, y: 17 }
    ]
  },
  '4-1-4-1': {
    label: '4-1-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 68 },
      { id: 'LCB', label: 'CB', x: 38, y: 68 },
      { id: 'RCB', label: 'CB', x: 66, y: 68 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'CDM', label: 'CDM', x: 52, y: 53 },
      { id: 'LM', label: 'LM', x: 22, y: 37 },
      { id: 'LCM', label: 'CM', x: 42, y: 37 },
      { id: 'RCM', label: 'CM', x: 62, y: 37 },
      { id: 'RM', label: 'RM', x: 82, y: 37 },
      { id: 'ST', label: 'ST', x: 52, y: 18 }
    ]
  },
  '4-2-1-3': {
    label: '4-2-1-3',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 70, y: 68 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LDM', label: 'CDM', x: 37, y: 47 },
      { id: 'RDM', label: 'CDM', x: 68, y: 47 },
      { id: 'CAM', label: 'CAM', x: 53, y: 37 },
      { id: 'LW', label: 'LW', x: 32, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 73, y: 19 }
    ]
  },
  '4-2-1-3-WIDE': {
    label: '4-2-1-3 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 86 },
      { id: 'LB', label: 'LB', x: 17, y: 66 },
      { id: 'LCB', label: 'CB', x: 40, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 87, y: 66 },
      { id: 'LDM', label: 'CDM', x: 44, y: 54 },
      { id: 'RDM', label: 'CDM', x: 64, y: 54 },
      { id: 'CAM', label: 'CAM', x: 54, y: 34 },
      { id: 'LW', label: 'LW', x: 27, y: 22 },
      { id: 'ST', label: 'ST', x: 54, y: 15 },
      { id: 'RW', label: 'RW', x: 80, y: 22 }
    ]
  },
  '4-2-2-2': {
    label: '4-2-2-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 70 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 71, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 70 },
      { id: 'LDM', label: 'CDM', x: 46, y: 50 },
      { id: 'RDM', label: 'CDM', x: 64, y: 50 },
      { id: 'LAM', label: 'CAM', x: 33, y: 33 },
      { id: 'RAM', label: 'CAM', x: 76, y: 33 },
      { id: 'LS', label: 'ST', x: 44, y: 17 },
      { id: 'RS', label: 'ST', x: 64, y: 17 }
    ]
  },
  '4-2-3-1-NARROW': {
    label: '4-2-3-1 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 18, y: 64 },
      { id: 'LCB', label: 'CB', x: 38, y: 68 },
      { id: 'RCB', label: 'CB', x: 66, y: 68 },
      { id: 'RB', label: 'RB', x: 85, y: 64 },
      { id: 'LDM', label: 'CDM', x: 30, y: 46 },
      { id: 'RDM', label: 'CDM', x: 73, y: 46 },
      { id: 'LAM', label: 'CAM', x: 38, y: 29 },
      { id: 'CAM', label: 'CAM', x: 52, y: 39 },
      { id: 'RAM', label: 'CAM', x: 66, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 12 }
    ]
  },
  '3-1-4-2': {
    label: '3-1-4-2',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'CB', x: 35, y: 68 },
      { id: 'CB', label: 'CB', x: 53, y: 58 },
      { id: 'RCB', label: 'CB', x: 72, y: 68 },
      { id: 'CDM', label: 'CDM', x: 53, y: 37 },
      { id: 'LCM', label: 'CM', x:37, y: 37 },
      { id: 'RCM', label: 'CM', x: 70, y: 37 },
      { id: 'LM', label: 'LM', x: 22, y: 40 },
      { id: 'RM', label: 'RM', x: 86, y: 40 },
      { id: 'LST', label: 'ST', x: 43, y: 17 },
      { id: 'RST', label: 'ST', x: 66, y: 17 }
    ]
  },
  '4-2-3-1-WIDE': {
    label: '4-2-3-1 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'LDM', label: 'CDM', x: 38, y: 46 },
      { id: 'RDM', label: 'CDM', x: 65, y: 46 },
      { id: 'LM', label: 'LM', x: 22, y: 37 },
      { id: 'CAM', label: 'CAM', x: 53, y: 33 },
      { id: 'RM', label: 'RM', x: 80, y: 37 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
    ]
  },
  '4-2-4': {
    label: '4-2-4',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 65 },
      { id: 'LCB', label: 'CB', x: 35, y: 67 },
      { id: 'RCB', label: 'CB', x: 72, y: 67 },
      { id: 'RB', label: 'RB', x: 90, y: 65 },
      { id: 'LDM', label: 'CDM', x: 40, y: 42 },
      { id: 'RDM', label: 'CDM', x: 68, y: 42 },
      { id: 'LW', label: 'LW', x: 28, y: 24 },
      { id: 'LS', label: 'ST', x: 44, y: 17 },
      { id: 'RS', label: 'ST', x: 65, y: 17 },
      { id: 'RW', label: 'RW', x: 80, y: 24 }
    ]
  },
  '4-3-1-2': {
    label: '4-3-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 68 },
      { id: 'LCB', label: 'CB', x: 37, y: 70 },
      { id: 'RCB', label: 'CB', x: 70, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'LCM', label: 'CM', x: 33, y: 42 },
      { id: 'CM', label: 'CM', x: 54, y: 51 },
      { id: 'RCM', label: 'CM', x: 76, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 31 },
      { id: 'LS', label: 'ST', x: 42, y: 16 },
      { id: 'RS', label: 'ST', x: 66, y: 16 }
    ]
  },
  '4-3-2-1': {
    label: '4-3-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 66 },
      { id: 'LCB', label: 'CB', x: 39, y: 68 },
      { id: 'RCB', label: 'CB', x: 67, y: 68 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LCM', label: 'CM', x: 32, y: 48 },
      { id: 'CM', label: 'CM', x: 53, y: 48 },
      { id: 'RCM', label: 'CM', x: 77, y: 48 },
      { id: 'LAM', label: 'CAM', x: 38, y: 26 },
      { id: 'RAM', label: 'CAM', x: 68, y: 26 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
    ]
  },
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 66, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'LCM', label: 'CM', x: 34, y: 49 },
      { id: 'CM', label: 'CM', x: 53, y: 44 },
      { id: 'RCM', label: 'CM', x: 73, y: 49 },
      { id: 'LW', label: 'LW', x: 34, y: 21 },
      { id: 'ST', label: 'ST', x: 53, y: 18 },
      { id: 'RW', label: 'RW', x: 71, y: 21 }
    ]
  },
  '4-3-3-ATTACK': {
    label: '4-3-3 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 68, y: 68 },
      { id: 'RB', label: 'RB', x: 87, y: 66 },
      { id: 'LCM', label: 'CM', x: 32, y: 43 },
      { id: 'CAM', label: 'CAM', x: 53, y: 40 },
      { id: 'RCM', label: 'CM', x: 76, y: 43 },
      { id: 'LW', label: 'LW', x: 32, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 76, y: 19 }
    ]
  },
  '4-3-3-DEFEND': {
    label: '4-3-3 Defend',  
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 67 },
      { id: 'LCB', label: 'CB', x: 37, y: 68 },
      { id: 'RCB', label: 'CB', x: 67, y: 68 },
      { id: 'RB', label: 'RB', x: 87, y: 67 },
      { id: 'LDM', label: 'CDM', x: 29, y: 46 },
      { id: 'CM', label: 'CM', x: 53, y: 44 },
      { id: 'RDM', label: 'CDM', x: 78, y: 46 },
      { id: 'LW', label: 'LW', x: 31, y: 23 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 76, y: 23 }
    ]
  },
  '4-3-3-FALSE9': {
    label: '4-3-3 False 9',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 66 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 69, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LCM', label: 'CM', x: 35, y: 44 },
      { id: 'CM', label: 'CM', x: 54, y: 49 },
      { id: 'RCM', label: 'CM', x: 75, y: 44 },
      { id: 'LW', label: 'LW', x: 37, y: 19 },
      { id: 'CF', label: 'CF', x: 54, y: 24 },
      { id: 'RW', label: 'RW', x: 72, y: 19 }
    ]
  },
  '4-3-3-HOLDING': {
    label: '4-3-3 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 67, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'CDM', label: 'CDM', x: 53, y: 47 },
      { id: 'LCM', label: 'CM', x: 33, y: 44 },
      { id: 'RCM', label: 'CM', x: 72, y: 44 },
      { id: 'LW', label: 'LW', x: 36, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 69, y: 19 }
    ]
  },
  '4-4-1-1': {
    label: '4-4-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 39, y: 70 },
      { id: 'RCB', label: 'CB', x: 67, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LM', label: 'LM', x: 25, y: 44 },
      { id: 'LCM', label: 'CM', x: 43, y: 46 },
      { id: 'RCM', label: 'CM', x: 63, y: 46 },
      { id: 'RM', label: 'RM', x: 81, y: 44 },
      { id: 'CAM', label: 'CAM', x: 53, y: 28 },
      { id: 'ST', label: 'ST', x: 53, y: 13 }
    ]
  },
  '4-4-1-1-ATTACK': {
    label: '4-4-1-1 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 71, y: 68 },
      { id: 'RB', label: 'RB', x: 89, y: 66 },
      { id: 'LM', label: 'LM', x: 20, y: 42 },
      { id: 'LCM', label: 'CM', x: 38, y: 41 },
      { id: 'RCM', label: 'CM', x: 69, y: 41 },
      { id: 'RM', label: 'RM', x: 87, y: 42 },
      { id: 'CAM', label: 'CAM', x: 53, y: 34 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
    ]
  },
  '4-4-2-FLAT': {
    label: '4-4-2 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 55, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 64 },
      { id: 'LCB', label: 'CB', x: 41, y: 66 },
      { id: 'RCB', label: 'CB', x: 66, y: 66 },
      { id: 'RB', label: 'RB', x: 90, y: 64 },
      { id: 'LM', label: 'LM', x: 15, y: 40 },
      { id: 'LCM', label: 'CM', x: 41, y: 42 },
      { id: 'RCM', label: 'CM', x: 66, y: 42 },
      { id: 'RM', label: 'RM', x: 90, y: 40 },
      { id: 'LS', label: 'ST', x: 40, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
    ]
  },
  '4-4-2-HOLDING': {
    label: '4-4-2 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 65 },
      { id: 'LCB', label: 'CB', x: 43, y: 67 },
      { id: 'RCB', label: 'CB', x: 64, y: 67 },
      { id: 'RB', label: 'RB', x: 85, y: 65 },
      { id: 'LM', label: 'LM', x: 22, y: 38 },
      { id: 'LDM', label: 'CDM', x: 43, y: 43 },
      { id: 'RDM', label: 'CDM', x: 64, y: 43 },
      { id: 'RM', label: 'RM', x: 82, y: 38 },
      { id: 'LS', label: 'ST', x: 43, y: 16 },
      { id: 'RS', label: 'ST', x: 64, y: 16 }
    ]
  },
  '4-5-1': {
    label: '4-5-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 66 },
      { id: 'LM', label: 'LM', x: 18, y: 42 },
      { id: 'LAM', label: 'CAM', x: 35, y: 33 },
      { id: 'CM', label: 'CM', x: 52, y: 46 },
      { id: 'RAM', label: 'CAM', x: 67, y: 33 },
      { id: 'RM', label: 'RM', x: 85, y: 42 },
      { id: 'ST', label: 'ST', x: 52, y: 14 }
    ]
  },
  '4-5-1-FLAT': {
    label: '4-5-1 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 68 },
      { id: 'LCB', label: 'CB', x: 34, y: 70 },
      { id: 'RCB', label: 'CB', x: 72, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'LM', label: 'LM', x: 20, y: 42 },
      { id: 'LCM', label: 'CM', x: 37, y: 44 },
      { id: 'CM', label: 'CM', x: 53, y: 46 },
      { id: 'RCM', label: 'CM', x: 69, y: 44 },
      { id: 'RM', label: 'RM', x: 84, y: 42 },
      { id: 'ST', label: 'ST', x: 53, y: 17 }
    ]
  },
  '5-2-1-2': {
    label: '5-2-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LWB', label: 'LWB', x: 18, y: 61 },
      { id: 'LCB', label: 'CB', x: 37, y: 63},
      { id: 'CB', label: 'CB', x: 54, y: 63},
      { id: 'RCB', label: 'CB', x: 70, y: 63 },
      { id: 'RWB', label: 'RWB', x: 88, y: 61 },
      { id: 'LCM', label: 'CM', x: 34, y: 42 },
      { id: 'RCM', label: 'CM', x: 72, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 30 },
      { id: 'LS', label: 'ST', x: 42, y: 16 },
      { id: 'RS', label: 'ST', x: 66, y: 16 }
    ]
  },
  '5-2-2-1': {
    label: '5-2-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LWB', label: 'LWB', x: 12, y: 56 },
      { id: 'LCB', label: 'CB', x: 33, y: 59 },
      { id: 'CB', label: 'CB', x: 52, y: 59 },
      { id: 'RCB', label: 'CB', x: 70, y: 59 },
      { id: 'RWB', label: 'RWB', x: 89, y: 56 },
      { id: 'LCM', label: 'CM', x: 42, y: 38 },
      { id: 'RCM', label: 'CM', x: 61, y: 38 },
      { id: 'LW', label: 'LW', x: 33, y: 20 },
      { id: 'RW', label: 'RW', x: 71, y: 20 },
      { id: 'ST', label: 'ST', x: 52, y: 16 }
    ]
  },
  '5-3-2': {
    label: '5-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LWB', label: 'LWB', x: 17, y: 61 },
      { id: 'LCB', label: 'CB', x: 36, y: 63 },
      { id: 'CB', label: 'CB', x: 54, y: 63 },
      { id: 'RCB', label: 'CB', x: 71, y: 63 },
      { id: 'RWB', label: 'RWB', x: 88, y: 61 },
      { id: 'LCM', label: 'CM', x: 29, y: 37 },
      { id: 'CM', label: 'CM', x: 54, y: 37 },
      { id: 'RCM', label: 'CM', x: 77, y: 37 },
      { id: 'LS', label: 'ST', x: 41, y: 17 },
      { id: 'RS', label: 'ST', x: 67, y: 17 }
    ]
  },
  '5-4-1': {
    label: '5-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LWB', label: 'LWB', x: 15, y: 57 },
      { id: 'LCB', label: 'CB', x: 33, y: 63 },
      { id: 'CB', label: 'CB', x: 53, y: 67 },
      { id: 'RCB', label: 'CB', x: 73, y: 63 },
      { id: 'RWB', label: 'RWB', x: 91, y: 57 },
      { id: 'LM', label: 'LM', x: 28, y: 36 },
      { id: 'LCM', label: 'CM', x: 45, y: 39 },
      { id: 'RCM', label: 'CM', x: 61, y: 39 },
      { id: 'RM', label: 'RM', x: 78, y: 35 },
      { id: 'ST', label: 'ST', x: 53, y: 14 }
    ]
  },
  '5-4-1-HOLDING': {
    label: '5-4-1-HOLDING',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LWB', label: 'LWB', x: 14, y: 61 },
      { id: 'LCB', label: 'CB', x: 33, y: 64 },
      { id: 'CB', label: 'CB', x: 53, y: 64 },
      { id: 'RCB', label: 'CB', x: 72, y: 64 },
      { id: 'RWB', label: 'RWB', x: 89, y: 61 },
      { id: 'LM', label: 'LM', x: 29, y: 31 },
      { id: 'CDM', label: 'CDM', x: 44, y: 38 },
      { id: 'CAM', label: 'CAM', x: 66, y: 25 },
      { id: 'RM', label: 'RM', x: 78, y: 33 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
    ]
  },
  '5-4-1-DEFEND': {
    label: '5-4-1-DEFEND',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 16, y: 67 },
      { id: 'LCB', label: 'CB', x: 33, y: 60 },
      { id: 'CB', label: 'CB', x: 53, y: 57 },
      { id: 'RCB', label: 'CB', x: 72, y: 60 },
      { id: 'RB', label: 'RB', x: 89, y: 67 },
      { id: 'LM', label: 'LM', x: 23, y: 36 },
      { id: 'LCM', label: 'CM', x: 41, y: 33 },
      { id: 'RCM', label: 'CM', x: 68, y: 33 },
      { id: 'RM', label: 'RM', x: 84, y: 36 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
    ]
  },
  '4-4-1-1-FLAT': {
    label: '4-4-1-1-FLAT',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 61 },
      { id: 'LCB', label: 'CB', x: 38, y: 64 },
      { id: 'RCB', label: 'CB', x: 69, y: 64 },
      { id: 'RB', label: 'RB', x: 88, y: 64 },
      { id: 'RCM', label: 'CM', x: 66, y: 41 },
      { id: 'LM', label: 'LM', x: 25, y: 34 },
      { id: 'LCM', label: 'CM', x: 40, y: 41 },
      { id: 'CF', label: 'CF', x: 53, y: 34 },
      { id: 'RM', label: 'RM', x: 82, y: 34 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
    ]
  }
};


// ------- MOBILE FORMATIONS (Optimized for Portrait View) -------
const mobileFormations = {
  '3-4-1-2': {
    label: '3-4-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 51, y: 84 },
      { id: 'LCB', label: 'CB', x: 22, y: 65 },
      { id: 'CB', label: 'CB', x: 51, y: 65 },
      { id: 'RCB', label: 'CB', x: 81, y: 65 },
      { id: 'LM', label: 'LM', x: 13, y: 41 },
      { id: 'LCM', label: 'CM', x: 36, y: 49 },
      { id: 'RCM', label: 'CM', x: 66, y: 49 },
      { id: 'RM', label: 'RM', x: 89, y: 41 },
      { id: 'CAM', label: 'CAM', x: 51, y: 29 },
      { id: 'LS', label: 'ST', x: 39, y: 11 },
      { id: 'RS', label: 'ST', x: 63, y: 11 }
    ]
  },
  '3-4-2-1': {
    label: '3-4-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 50, y: 84 },
      { id: 'LCB', label: 'LCB', x: 22, y: 71 },
      { id: 'CB', label: 'CB', x: 50, y: 67 },
      { id: 'RCB', label: 'RCB', x: 78, y: 71 },
      { id: 'LM', label: 'LM', x: 12, y: 47 },
      { id: 'LCM', label: 'LCM', x: 32, y: 55 },
      { id: 'RCM', label: 'RCM', x: 68, y: 55 },
      { id: 'RM', label: 'RM', x: 88, y: 47 },
      { id: 'LAM', label: 'CAM', x: 32, y: 31 },
      { id: 'RAM', label: 'CAM', x: 68, y: 31 },
      { id: 'ST', label: 'ST', x: 50, y: 13 }
    ]
  },
  '3-4-3-DIAMOND': {
    label: '3-4-3 Diamond',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LCB', label: 'LCB', x: 24, y: 66 },
      { id: 'CB', label: 'CB', x: 52, y: 66 },
      { id: 'RCB', label: 'RCB', x: 80, y: 66 },
      { id: 'LM', label: 'LM', x: 17, y: 43 },
      { id: 'CDM', label: 'CDM', x: 40, y: 51 },
      { id: 'CAM', label: 'CAM', x: 64, y: 43 },
      { id: 'RM', label: 'RM', x: 87, y: 43 },
      { id: 'LW', label: 'LW', x: 30, y: 21 },
      { id: 'ST', label: 'ST', x: 52, y: 13 },
      { id: 'RW', label: 'RW', x: 74, y: 21 }
    ]
  },
  '3-4-3-FLAT': {
    label: '3-4-3 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LCB', label: 'LCB', x: 22, y: 69 },
      { id: 'CB', label: 'CB', x: 52, y: 69 },
      { id: 'RCB', label: 'RCB', x: 82, y: 69 },
      { id: 'LM', label: 'LM', x: 14, y: 46 },
      { id: 'LCM', label: 'CM', x: 37, y: 46 },
      { id: 'RCM', label: 'CM', x: 67, y: 46 },
      { id: 'RM', label: 'RM', x: 90, y: 46 },
      { id: 'LW', label: 'LW', x: 27, y: 19 },
      { id: 'ST', label: 'ST', x: 52, y: 13 },
      { id: 'RW', label: 'RW', x: 77, y: 19 }
    ]
  },
  '3-5-1-1': {
    label: '3-5-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LCB', label: 'LCB', x: 20, y: 68 },
      { id: 'CB', label: 'CB', x: 52, y: 68 },
      { id: 'RCB', label: 'RCB', x: 84, y: 68 },
      { id: 'LM', label: 'LM', x: 14, y: 40 },
      { id: 'LDM', label: 'CDM', x: 37, y: 54 },
      { id: 'CM', label: 'CM', x: 52, y: 40 },
      { id: 'RDM', label: 'CDM', x: 67, y: 54 },
      { id: 'RM', label: 'RM', x: 90, y: 40 },
      { id: 'LST', label: 'ST', x: 40, y: 16 },
      { id: 'RST', label: 'ST', x: 64, y: 16 }
    ]
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LCB', label: 'LCB', x: 22, y: 67 },
      { id: 'CB', label: 'CB', x: 52, y: 67 },
      { id: 'RCB', label: 'RCB', x: 82, y: 67 },
      { id: 'LM', label: 'LM', x: 14, y: 42 },
      { id: 'LDM', label: 'CDM', x: 34, y: 53 },
      { id: 'CAM', label: 'CAM', x: 52, y: 33 },
      { id: 'RDM', label: 'CDM', x: 70, y: 53 },
      { id: 'RM', label: 'RM', x: 90, y: 42 },
      { id: 'LS', label: 'ST', x: 40, y: 15 },
      { id: 'RS', label: 'ST', x: 64, y: 15 }
    ]
  },
  '4-1-2-1-2-NARROW': {
    label: '4-1-2-1-2 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 12, y: 71 },
      { id: 'LCB', label: 'CB', x: 35, y: 73 },
      { id: 'RCB', label: 'CB', x: 69, y: 73 },
      { id: 'RB', label: 'RB', x: 92, y: 71 },
      { id: 'CDM', label: 'CDM', x: 52, y: 57 },
      { id: 'LCM', label: 'CM', x: 34, y: 43 },
      { id: 'RCM', label: 'CM', x: 70, y: 43 },
      { id: 'CAM', label: 'CAM', x: 52, y: 27 },
      { id: 'LS', label: 'ST', x: 40, y: 11 },
      { id: 'RS', label: 'ST', x: 64, y: 11 }
    ]
  },
  '4-1-2-1-2-WIDE': {
    label: '4-1-2-1-2 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 12, y: 71 },
      { id: 'LCB', label: 'CB', x: 35, y: 73 },
      { id: 'RCB', label: 'CB', x: 69, y: 73 },
      { id: 'RB', label: 'RB', x: 92, y: 71 },
      { id: 'CDM', label: 'CDM', x: 52, y: 57 },
      { id: 'LM', label: 'LM', x: 17, y: 43 },
      { id: 'RM', label: 'RM', x: 87, y: 43 },
      { id: 'CAM', label: 'CAM', x: 52, y: 29 },
      { id: 'LS', label: 'ST', x: 40, y: 13 },
      { id: 'RS', label: 'ST', x: 64, y: 13 }
    ]
  },
  '4-1-3-2': {
    label: '4-1-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'CDM', label: 'CDM', x: 52, y: 55 },
      { id: 'LM', label: 'LM', x: 20, y: 37 },
      { id: 'CM', label: 'CM', x: 52, y: 37 },
      { id: 'RM', label: 'RM', x: 84, y: 37 },
      { id: 'LS', label: 'ST', x: 40, y: 15 },
      { id: 'RS', label: 'ST', x: 64, y: 15 }
    ]
  },
  '4-1-4-1': {
    label: '4-1-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 12, y: 68 },
      { id: 'LCB', label: 'CB', x: 33, y: 68 },
      { id: 'RCB', label: 'CB', x: 67, y: 68 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'CDM', label: 'CDM', x: 50, y: 52 },
      { id: 'LM', label: 'LM', x: 15, y: 36 },
      { id: 'LCM', label: 'CM', x: 36, y: 36 },
      { id: 'RCM', label: 'CM', x: 64, y: 36 },
      { id: 'RM', label: 'RM', x: 85, y: 36 },
      { id: 'ST', label: 'ST', x: 50, y: 15 }
    ]
  },
  '4-2-1-3': {
    label: '4-2-1-3',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 12, y: 70 },
      { id: 'LCB', label: 'CB', x: 32, y: 72 },
      { id: 'RCB', label: 'CB', x: 68, y: 72 },
      { id: 'RB', label: 'RB', x: 90, y: 70 },
      { id: 'LDM', label: 'CDM', x: 32, y: 54 },
      { id: 'RDM', label: 'CDM', x: 68, y: 54 },
      { id: 'CAM', label: 'CAM', x: 50, y: 38 },
      { id: 'LW', label: 'LW', x: 25, y: 18 },
      { id: 'ST', label: 'ST', x: 50, y: 12 },
      { id: 'RW', label: 'RW', x: 75, y: 18 }
    ]
  },
  '4-2-1-3-WIDE': {
    label: '4-2-1-3 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 51, y: 85 },
      { id: 'LB', label: 'LB', x: 13, y: 65 },
      { id: 'LCB', label: 'CB', x: 35, y: 66 },
      { id: 'RCB', label: 'CB', x: 67, y: 66 },
      { id: 'RB', label: 'RB', x: 89, y: 64 },
      { id: 'LDM', label: 'CDM', x: 35, y: 48 },
      { id: 'RDM', label: 'CDM', x: 67, y: 48 },
      { id: 'CAM', label: 'CAM', x: 51, y: 32 },
      { id: 'LW', label: 'LW', x: 19, y: 25 },
      { id: 'ST', label: 'ST', x: 51, y: 15 },
      { id: 'RW', label: 'RW', x: 83, y: 25 }
    ]
  },
  '4-2-2-2': {
    label: '4-2-2-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 10, y: 71 },
      { id: 'LCB', label: 'CB', x: 33, y: 71 },
      { id: 'RCB', label: 'CB', x: 67, y: 71 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LDM', label: 'CDM', x: 35, y: 53 },
      { id: 'RDM', label: 'CDM', x: 65, y: 53 },
      { id: 'LAM', label: 'CAM', x: 27, y: 33 },
      { id: 'RAM', label: 'CAM', x: 72, y: 33 },
      { id: 'LS', label: 'ST', x: 38, y: 13 },
      { id: 'RS', label: 'ST', x: 62, y: 13 }
    ]
  },
  '4-2-3-1-NARROW': {
    label: '4-2-3-1 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 35, y: 71 },
      { id: 'RCB', label: 'CB', x: 69, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LDM', label: 'CDM', x: 27, y: 51 },
      { id: 'RDM', label: 'CDM', x: 77, y: 51 },
      { id: 'LAM', label: 'CAM', x: 32, y: 31 },
      { id: 'CAM', label: 'CAM', x: 52, y: 39 },
      { id: 'RAM', label: 'CAM', x: 72, y: 31 },
      { id: 'ST', label: 'ST', x: 52, y: 13 }
    ]
  },
  '3-1-4-2': {
    label: '3-1-4-2',
    slots: [
      { id: 'GK', label: 'GK', x: 54, y: 77 },
      { id: 'LCB', label: 'CB', x: 27, y: 60 },
      { id: 'CB', label: 'CB', x: 52, y: 54 },
      { id: 'RCB', label: 'CB', x: 77, y: 60 },
      { id: 'CDM', label: 'CDM', x: 52, y: 36 },
      { id: 'LCM', label: 'CM', x: 32, y: 36 },
      { id: 'RCM', label: 'CM', x: 72, y: 36 },
      { id: 'LM', label: 'LM', x: 14, y: 38 },
      { id: 'RM', label: 'RM', x: 90, y: 38 },
      { id: 'LST', label: 'ST', x: 40, y: 13 },
      { id: 'RST', label: 'ST', x: 64, y: 13 }
    ]
  },
  '4-2-3-1-WIDE': {
    label: '4-2-3-1 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 71 },
      { id: 'LCB', label: 'CB', x: 34, y: 73 },
      { id: 'RCB', label: 'CB', x: 70, y: 73 },
      { id: 'RB', label: 'RB', x: 92, y: 71 },
      { id: 'LDM', label: 'CDM', x: 34, y: 53 },
      { id: 'RDM', label: 'CDM', x: 70, y: 53 },
      { id: 'LM', label: 'LM', x: 17, y: 39 },
      { id: 'CAM', label: 'CAM', x: 52, y: 35 },
      { id: 'RM', label: 'RM', x: 87, y: 39 },
      { id: 'ST', label: 'ST', x: 52, y: 15 }
    ]
  },
  '4-2-4': {
    label: '4-2-4',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 10, y: 69 },
      { id: 'LCB', label: 'CB', x: 30, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'LDM', label: 'CDM', x: 32, y: 49 },
      { id: 'RDM', label: 'CDM', x: 68, y: 49 },
      { id: 'LW', label: 'LW', x: 18, y: 25 },
      { id: 'LS', label: 'ST', x: 38, y: 13 },
      { id: 'RS', label: 'ST', x: 62, y: 13 },
      { id: 'RW', label: 'RW', x: 82, y: 25 }
    ]
  },
  '4-3-1-2': {
    label: '4-3-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 50, y: 84 },
      { id: 'LB', label: 'LB', x: 10, y: 71 },
      { id: 'LCB', label: 'CB', x: 32, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LCM', label: 'CM', x: 28, y: 49 },
      { id: 'CM', label: 'CM', x: 50, y: 55 },
      { id: 'RCM', label: 'CM', x: 72, y: 49 },
      { id: 'CAM', label: 'CAM', x: 50, y: 33 },
      { id: 'LS', label: 'ST', x: 38, y: 13 },
      { id: 'RS', label: 'ST', x: 62, y: 13 }
    ]
  },
  '4-3-2-1': {
    label: '4-3-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 14, y: 69 },
      { id: 'LCB', label: 'CB', x: 35, y: 71 },
      { id: 'RCB', label: 'CB', x: 69, y: 71 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'LCM', label: 'CM', x: 27, y: 51 },
      { id: 'CM', label: 'CM', x: 52, y: 51 },
      { id: 'RCM', label: 'CM', x: 77, y: 51 },
      { id: 'LAM', label: 'CAM', x: 34, y: 29 },
      { id: 'RAM', label: 'CAM', x: 70, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 11 }
    ]
  },
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 12, y: 62 },
      { id: 'LCB', label: 'CB', x: 34, y: 64 },
      { id: 'RCB', label: 'CB', x: 70, y: 64 },
      { id: 'RB', label: 'RB', x: 92, y: 62 },
      { id: 'LCM', label: 'CM', x: 30, y: 35 },
      { id: 'CM', label: 'CM', x: 52, y: 31 },
      { id: 'RCM', label: 'CM', x: 74, y: 35 },
      { id: 'LW', label: 'LW', x: 27, y: 18 },
      { id: 'ST', label: 'ST', x: 52, y: 12 },
      { id: 'RW', label: 'RW', x: 77, y: 18 }
    ]
  },
  '4-3-3-ATTACK': {
    label: '4-3-3 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LCM', label: 'CM', x: 27, y: 49 },
      { id: 'CAM', label: 'CAM', x: 52, y: 35 },
      { id: 'RCM', label: 'CM', x: 77, y: 49 },
      { id: 'LW', label: 'LW', x: 27, y: 19 },
      { id: 'ST', label: 'ST', x: 52, y: 13 },
      { id: 'RW', label: 'RW', x: 77, y: 19 }
    ]
  },
  '4-3-3-DEFEND': {
    label: '4-3-3 Defend',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LDM', label: 'CDM', x: 24, y: 48 },
      { id: 'CM', label: 'CM', x: 52, y: 44 },
      { id: 'RDM', label: 'CDM', x: 80, y: 48 },
      { id: 'LW', label: 'LW', x: 26, y: 25 },
      { id: 'ST', label: 'ST', x: 52, y: 15 },
      { id: 'RW', label: 'RW', x: 78, y: 25 }
    ]
  },
  '4-3-3-FALSE9': {
    label: '4-3-3 False 9',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 14, y: 66 },
      { id: 'LCB', label: 'CB', x: 35, y: 70 },
      { id: 'RCB', label: 'CB', x: 69, y: 70 },
      { id: 'RB', label: 'RB', x: 90, y: 66 },
      { id: 'LCM', label: 'CM', x: 30, y: 44 },
      { id: 'CM', label: 'CM', x: 52, y: 48 },
      { id: 'RCM', label: 'CM', x: 74, y: 44 },
      { id: 'LW', label: 'LW', x: 30, y: 18 },
      { id: 'CF', label: 'CF', x: 52, y: 24 },
      { id: 'RW', label: 'RW', x: 74, y: 18 }
    ]
  },
  '4-3-3-HOLDING': {
    label: '4-3-3 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'CDM', label: 'CDM', x: 52, y: 47 },
      { id: 'LCM', label: 'CM', x: 30, y: 43 },
      { id: 'RCM', label: 'CM', x: 74, y: 43 },
      { id: 'LW', label: 'LW', x: 30, y: 21 },
      { id: 'ST', label: 'ST', x: 52, y: 13 },
      { id: 'RW', label: 'RW', x: 74, y: 21 }
    ]
  },
  '4-4-1-1': {
    label: '4-4-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 73 },
      { id: 'RCB', label: 'CB', x: 70, y: 73 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LM', label: 'LM', x: 17, y: 49 },
      { id: 'LCM', label: 'CM', x: 37, y: 53 },
      { id: 'RCM', label: 'CM', x: 67, y: 53 },
      { id: 'RM', label: 'RM', x: 87, y: 49 },
      { id: 'CAM', label: 'CAM', x: 52, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 12 }
    ]
  },
  '4-4-1-1-ATTACK': {
    label: '4-4-1-1 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 34, y: 71 },
      { id: 'RCB', label: 'CB', x: 70, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LM', label: 'LM', x: 14, y: 44 },
      { id: 'LCM', label: 'CM', x: 35, y: 46 },
      { id: 'RCM', label: 'CM', x: 69, y: 46 },
      { id: 'RM', label: 'RM', x: 90, y: 44 },
      { id: 'CAM', label: 'CAM', x: 52, y: 33 },
      { id: 'ST', label: 'ST', x: 52, y: 13 }
    ]
  },
  '4-4-2-FLAT': {
    label: '4-4-2 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 69 },
      { id: 'LCB', label: 'CB', x: 37, y: 71 },
      { id: 'RCB', label: 'CB', x: 67, y: 71 },
      { id: 'RB', label: 'RB', x: 92, y: 69 },
      { id: 'LM', label: 'LM', x: 12, y: 45 },
      { id: 'LCM', label: 'CM', x: 37, y: 47 },
      { id: 'RCM', label: 'CM', x: 67, y: 47 },
      { id: 'RM', label: 'RM', x: 92, y: 45 },
      { id: 'LS', label: 'ST', x: 37, y: 17 },
      { id: 'RS', label: 'ST', x: 67, y: 17 }
    ]
  },
  '4-4-2-HOLDING': {
    label: '4-4-2 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 14, y: 65 },
      { id: 'LCB', label: 'CB', x: 38, y: 67 },
      { id: 'RCB', label: 'CB', x: 66, y: 67 },
      { id: 'RB', label: 'RB', x: 90, y: 65 },
      { id: 'LM', label: 'LM', x: 17, y: 41 },
      { id: 'LDM', label: 'CDM', x: 38, y: 47 },
      { id: 'RDM', label: 'CDM', x: 66, y: 47 },
      { id: 'RM', label: 'RM', x: 87, y: 41 },
      { id: 'LS', label: 'ST', x: 38, y: 19 },
      { id: 'RS', label: 'ST', x: 66, y: 19 }
    ]
  },
  '4-5-1': {
    label: '4-5-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 65 },
      { id: 'LCB', label: 'CB', x: 34, y: 69 },
      { id: 'RCB', label: 'CB', x: 70, y: 69 },
      { id: 'RB', label: 'RB', x: 92, y: 65 },
      { id: 'LM', label: 'LM', x: 14, y: 43 },
      { id: 'LAM', label: 'CAM', x: 32, y: 33 },
      { id: 'CM', label: 'CM', x: 52, y: 47 },
      { id: 'RAM', label: 'CAM', x: 72, y: 33 },
      { id: 'RM', label: 'RM', x: 90, y: 43 },
      { id: 'ST', label: 'ST', x: 52, y: 15 }
    ]
  },
  '4-5-1-FLAT': {
    label: '4-5-1 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 12, y: 65 },
      { id: 'LCB', label: 'CB', x: 32, y: 67 },
      { id: 'RCB', label: 'CB', x: 72, y: 67 },
      { id: 'RB', label: 'RB', x: 92, y: 65 },
      { id: 'LM', label: 'LM', x: 14, y: 39 },
      { id: 'LCM', label: 'CM', x: 34, y: 43 },
      { id: 'CM', label: 'CM', x: 52, y: 45 },
      { id: 'RCM', label: 'CM', x: 70, y: 43 },
      { id: 'RM', label: 'RM', x: 90, y: 39 },
      { id: 'ST', label: 'ST', x: 52, y: 15 }
    ]
  },
  '5-2-1-2': {
    label: '5-2-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LWB', label: 'LWB', x: 14, y: 65 },
      { id: 'LCB', label: 'CB', x: 34, y: 69 },
      { id: 'CB', label: 'CB', x: 52, y: 69 },
      { id: 'RCB', label: 'CB', x: 70, y: 69 },
      { id: 'RWB', label: 'RWB', x: 90, y: 65 },
      { id: 'LCM', label: 'CM', x: 32, y: 47 },
      { id: 'RCM', label: 'CM', x: 72, y: 47 },
      { id: 'CAM', label: 'CAM', x: 52, y: 31 },
      { id: 'LS', label: 'ST', x: 40, y: 13 },
      { id: 'RS', label: 'ST', x: 64, y: 13 }
    ]
  },
  '5-2-2-1': {
    label: '5-2-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 50, y: 84 },
      { id: 'LWB', label: 'LWB', x: 8, y: 61 },
      { id: 'LCB', label: 'CB', x: 28, y: 67 },
      { id: 'CB', label: 'CB', x: 50, y: 67 },
      { id: 'RCB', label: 'CB', x: 72, y: 67 },
      { id: 'RWB', label: 'RWB', x: 92, y: 61 },
      { id: 'LCM', label: 'CM', x: 36, y: 45 },
      { id: 'RCM', label: 'CM', x: 64, y: 45 },
      { id: 'LW', label: 'LW', x: 28, y: 23 },
      { id: 'RW', label: 'RW', x: 72, y: 23 },
      { id: 'ST', label: 'ST', x: 50, y: 11 }
    ]
  },
  '5-3-2': {
    label: '5-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LWB', label: 'LWB', x: 12, y: 65 },
      { id: 'LCB', label: 'CB', x: 34, y: 69 },
      { id: 'CB', label: 'CB', x: 52, y: 69 },
      { id: 'RCB', label: 'CB', x: 70, y: 69 },
      { id: 'RWB', label: 'RWB', x: 92, y: 65 },
      { id: 'LCM', label: 'CM', x: 24, y: 43 },
      { id: 'CM', label: 'CM', x: 52, y: 43 },
      { id: 'RCM', label: 'CM', x: 80, y: 43 },
      { id: 'LS', label: 'ST', x: 38, y: 17 },
      { id: 'RS', label: 'ST', x: 66, y: 17 }
    ]
  },
  '5-4-1': {
    label: '5-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 50, y: 82 },
      { id: 'LWB', label: 'LWB', x: 8, y: 55 },
      { id: 'LCB', label: 'CB', x: 26, y: 61 },
      { id: 'CB', label: 'CB', x: 50, y: 65 },
      { id: 'RCB', label: 'CB', x: 74, y: 61 },
      { id: 'RWB', label: 'RWB', x: 92, y: 55 },
      { id: 'LM', label: 'LM', x: 18, y: 35 },
      { id: 'LCM', label: 'CM', x: 36, y: 41 },
      { id: 'RCM', label: 'CM', x: 64, y: 41 },
      { id: 'RM', label: 'RM', x: 82, y: 35 },
      { id: 'ST', label: 'ST', x: 50, y: 15 }
    ]
  },
  '5-4-1-HOLDING': {
    label: '5-4-1-HOLDING',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LWB', label: 'LWB', x: 12, y: 65 },
      { id: 'LCB', label: 'CB', x: 30, y: 69 },
      { id: 'CB', label: 'CB', x: 52, y: 69 },
      { id: 'RCB', label: 'CB', x: 74, y: 69 },
      { id: 'RWB', label: 'RWB', x: 92, y: 65 },
      { id: 'LM', label: 'LM', x: 24, y: 39 },
      { id: 'CDM', label: 'CDM', x: 40, y: 47 },
      { id: 'CAM', label: 'CAM', x: 64, y: 33 },
      { id: 'RM', label: 'RM', x: 80, y: 41 },
      { id: 'ST', label: 'ST', x: 52, y: 15 }
    ]
  },
  '5-4-1-DEFEND': {
    label: '5-4-1-DEFEND',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 12, y: 71 },
      { id: 'LCB', label: 'CB', x: 30, y: 65 },
      { id: 'CB', label: 'CB', x: 52, y: 61 },
      { id: 'RCB', label: 'CB', x: 74, y: 65 },
      { id: 'RB', label: 'RB', x: 92, y: 71 },
      { id: 'LM', label: 'LM', x: 18, y: 43 },
      { id: 'LCM', label: 'CM', x: 37, y: 39 },
      { id: 'RCM', label: 'CM', x: 67, y: 39 },
      { id: 'RM', label: 'RM', x: 86, y: 43 },
      { id: 'ST', label: 'ST', x: 52, y: 17 }
    ]
  },
  '4-4-1-1-FLAT': {
    label: '4-4-1-1-FLAT',
    slots: [
      { id: 'GK', label: 'GK', x: 48, y: 82 },
      { id: 'LB', label: 'LB', x: 10, y: 63 },
      { id: 'LCB', label: 'CB', x: 31, y: 67 },
      { id: 'RCB', label: 'CB', x: 65, y: 67 },
      { id: 'RB', label: 'RB', x: 86, y: 63 },
      { id: 'RCM', label: 'CM', x: 60, y: 45 },
      { id: 'LM', label: 'LM', x: 16, y: 35 },
      { id: 'LCM', label: 'CM', x: 33, y: 45 },
      { id: 'CF', label: 'CF', x: 48, y: 35 },
      { id: 'RM', label: 'RM', x: 80, y: 35 },
      { id: 'ST', label: 'ST', x: 48, y: 15 }
    ]
  },
};


// ------- TABLET FORMATIONS (Optimized for Portrait Tablets 481-1024px) -------
const tabletFormations = {
  '3-4-1-2': {
    label: '3-4-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 88 },
      { id: 'LCB', label: 'CB', x: 24, y: 70 },
      { id: 'CB', label: 'CB', x: 52, y: 70 },
      { id: 'RCB', label: 'CB', x: 80, y: 70 },
      { id: 'LM', label: 'LM', x: 17, y: 45 },
      { id: 'LCM', label: 'CM', x: 37, y: 54 },
      { id: 'RCM', label: 'CM', x: 67, y: 54 },
      { id: 'RM', label: 'RM', x: 87, y: 45 },
      { id: 'CAM', label: 'CAM', x: 52, y: 36 },
      { id: 'LS', label: 'ST', x: 42, y: 20 },
      { id: 'RS', label: 'ST', x: 62, y: 20 }
    ]
  },
  '3-4-2-1': {
    label: '3-4-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 55, y: 86 },
      { id: 'LCB', label: 'LCB', x: 29, y: 70 },
      { id: 'CB', label: 'CB', x: 55, y: 66 },
      { id: 'RCB', label: 'RCB', x: 81, y: 70 },
      { id: 'LM', label: 'LM', x: 20, y: 46 },
      { id: 'LCM', label: 'LCM', x: 39, y: 54 },
      { id: 'RCM', label: 'RCM', x: 71, y: 54 },
      { id: 'RM', label: 'RM', x: 90, y: 46 },
      { id: 'LAM', label: 'CAM', x: 39, y: 32 },
      { id: 'RAM', label: 'CAM', x: 71, y: 32 },
      { id: 'ST', label: 'ST', x: 55, y: 20 }
    ]
  },
  '3-4-3-DIAMOND': {
    label: '3-4-3 Diamond',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 87 },
      { id: 'LCB', label: 'LCB', x: 27, y: 69 },
      { id: 'CB', label: 'CB', x: 53, y: 70 },
      { id: 'RCB', label: 'RCB', x: 79, y: 70 },
      { id: 'LM', label: 'LM', x: 21, y: 49 },
      { id: 'CDM', label: 'CDM', x: 43, y: 57 },
      { id: 'CAM', label: 'CAM', x: 63, y: 49 },
      { id: 'RM', label: 'RM', x: 85, y: 49 },
      { id: 'LW', label: 'LW', x: 33, y: 27 },
      { id: 'ST', label: 'ST', x: 53, y: 27 },
      { id: 'RW', label: 'RW', x: 73, y: 27 }
    ]
  },
  '3-4-3-FLAT': {
    label: '3-4-3 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LCB', label: 'LCB', x: 25, y: 70 },
      { id: 'CB', label: 'CB', x: 53, y: 70 },
      { id: 'RCB', label: 'RCB', x: 81, y: 70 },
      { id: 'LM', label: 'LM', x: 18, y: 48 },
      { id: 'LCM', label: 'CM', x: 38, y: 48 },
      { id: 'RCM', label: 'CM', x: 68, y: 48 },
      { id: 'RM', label: 'RM', x: 88, y: 48 },
      { id: 'LW', label: 'LW', x: 31, y: 24 },
      { id: 'ST', label: 'ST', x: 53, y: 20 },
      { id: 'RW', label: 'RW', x: 75, y: 24 }
    ]
  },
  '3-5-1-1': {
    label: '3-5-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LCB', label: 'LCB', x: 22, y: 68 },
      { id: 'CB', label: 'CB', x: 52, y: 68 },
      { id: 'RCB', label: 'RCB', x: 82, y: 68 },
      { id: 'LM', label: 'LM', x: 17, y: 42 },
      { id: 'LDM', label: 'CDM', x: 35, y: 56 },
      { id: 'CM', label: 'CM', x: 52, y: 42 },
      { id: 'RDM', label: 'CDM', x: 66, y: 56 },
      { id: 'RM', label: 'RM', x: 87, y: 42 },
      { id: 'LST', label: 'ST', x: 42, y: 22 },
      { id: 'RST', label: 'ST', x: 64, y: 22 }
    ]
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { id: 'GK', label: 'GK', x: 50, y: 88 },
      { id: 'LCB', label: 'LCB', x: 22, y: 72 },
      { id: 'CB', label: 'CB', x: 50, y: 72 },
      { id: 'RCB', label: 'RCB', x: 78, y: 72 },
      { id: 'LM', label: 'LM', x: 15, y: 50 },
      { id: 'LDM', label: 'CDM', x: 35, y: 58 },
      { id: 'CAM', label: 'CAM', x: 50, y: 44 },
      { id: 'RDM', label: 'CDM', x: 65, y: 58 },
      { id: 'RM', label: 'RM', x: 85, y: 50 },
      { id: 'LS', label: 'ST', x: 40, y: 24 },
      { id: 'RS', label: 'ST', x: 60, y: 24 }
    ]
  },
  '4-1-2-1-2-NARROW': {
    label: '4-1-2-1-2 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 87 },
      { id: 'LB', label: 'LB', x: 15, y: 73 },
      { id: 'LCB', label: 'CB', x: 38, y: 75 },
      { id: 'RCB', label: 'CB', x: 68, y: 75 },
      { id: 'RB', label: 'RB', x: 91, y: 73 },
      { id: 'CDM', label: 'CDM', x: 53, y: 60 },
      { id: 'LCM', label: 'CM', x: 37, y: 47 },
      { id: 'RCM', label: 'CM', x: 69, y: 47 },
      { id: 'CAM', label: 'CAM', x: 53, y: 33 },
      { id: 'LS', label: 'ST', x: 43, y: 18 },
      { id: 'RS', label: 'ST', x: 63, y: 18 }
    ]
  },
  '4-1-2-1-2-WIDE': {
    label: '4-1-2-1-2 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 74 },
      { id: 'LCB', label: 'CB', x: 37, y: 74 },
      { id: 'RCB', label: 'CB', x: 67, y: 76 },
      { id: 'RB', label: 'RB', x: 90, y: 74 },
      { id: 'CDM', label: 'CDM', x: 52, y: 57 },
      { id: 'LM', label: 'LM', x: 21, y: 46 },
      { id: 'RM', label: 'RM', x: 84, y: 46 },
      { id: 'CAM', label: 'CAM', x: 52, y: 34 },
      { id: 'LS', label: 'ST', x: 42, y: 20 },
      { id: 'RS', label: 'ST', x: 62, y: 20 }
    ]
  },
  '4-1-3-2': {
    label: '4-1-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'CDM', label: 'CDM', x: 52, y: 57 },
      { id: 'LM', label: 'LM', x: 22, y: 43 },
      { id: 'CM', label: 'CM', x: 52, y: 43 },
      { id: 'RM', label: 'RM', x: 82, y: 43 },
      { id: 'LS', label: 'ST', x: 42, y: 21 },
      { id: 'RS', label: 'ST', x: 62, y: 21 }
    ]
  },
  '4-1-4-1': {
    label: '4-1-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 16, y: 73 },
      { id: 'LCB', label: 'CB', x: 37, y: 73 },
      { id: 'RCB', label: 'CB', x: 67, y: 73 },
      { id: 'RB', label: 'RB', x: 88, y: 73 },
      { id: 'CDM', label: 'CDM', x: 52, y: 56 },
      { id: 'LM', label: 'LM', x: 20, y: 41 },
      { id: 'LCM', label: 'CM', x: 40, y: 41 },
      { id: 'RCM', label: 'CM', x: 64, y: 41 },
      { id: 'RM', label: 'RM', x: 84, y: 41 },
      { id: 'ST', label: 'ST', x: 52, y: 21 }
    ]
  },
  '4-2-1-3': {
    label: '4-2-1-3',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 72 },
      { id: 'LCB', label: 'CB', x: 36, y: 74 },
      { id: 'RCB', label: 'CB', x: 68, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 72 },
      { id: 'LDM', label: 'CDM', x: 36, y: 56 },
      { id: 'RDM', label: 'CDM', x: 68, y: 56 },
      { id: 'CAM', label: 'CAM', x: 52, y: 42 },
      { id: 'LW', label: 'LW', x: 30, y: 24 },
      { id: 'ST', label: 'ST', x: 52, y: 20 },
      { id: 'RW', label: 'RW', x: 74, y: 24 }
    ]
  },
  '4-2-1-3-WIDE': {
    label: '4-2-1-3 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 84 },
      { id: 'LB', label: 'LB', x: 15, y: 72 },
      { id: 'LCB', label: 'CB', x: 37, y: 74 },
      { id: 'RCB', label: 'CB', x: 69, y: 74 },
      { id: 'RB', label: 'RB', x: 91, y: 72 },
      { id: 'LDM', label: 'CDM', x: 37, y: 56 },
      { id: 'RDM', label: 'CDM', x: 69, y: 56 },
      { id: 'CAM', label: 'CAM', x: 53, y: 40 },
      { id: 'LW', label: 'LW', x: 21  , y: 26 },
      { id: 'ST', label: 'ST', x: 53, y: 18 },
      { id: 'RW', label: 'RW', x: 85, y: 26 }
    ]
  },
  '4-2-2-2': {
    label: '4-2-2-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 74 },
      { id: 'LCB', label: 'CB', x: 37, y: 74 },
      { id: 'RCB', label: 'CB', x: 67, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 74 },
      { id: 'LDM', label: 'CDM', x: 40, y: 56 },
      { id: 'RDM', label: 'CDM', x: 64, y: 56 },
      { id: 'LAM', label: 'CAM', x: 32, y: 38 },
      { id: 'RAM', label: 'CAM', x: 72, y: 38 },
      { id: 'LS', label: 'ST', x: 42, y: 20 },
      { id: 'RS', label: 'ST', x: 62, y: 20 }
    ]
  },
  '4-2-3-1-NARROW': {
    label: '4-2-3-1 Narrow',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 72 },
      { id: 'LCB', label: 'CB', x: 37, y: 74 },
      { id: 'RCB', label: 'CB', x: 67, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 72 },
      { id: 'LDM', label: 'CDM', x: 30, y: 54 },
      { id: 'RDM', label: 'CDM', x: 74, y: 54 },
      { id: 'LAM', label: 'CAM', x: 34, y: 36 },
      { id: 'CAM', label: 'CAM', x: 52, y: 44 },
      { id: 'RAM', label: 'CAM', x: 70, y: 36 },
      { id: 'ST', label: 'ST', x: 52, y: 20 }
    ]
  },
  '3-1-4-2': {
    label: '3-1-4-2',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 82 },
      { id: 'LCB', label: 'CB', x: 31, y: 68 },
      { id: 'CB', label: 'CB', x: 53, y: 62 },
      { id: 'RCB', label: 'CB', x: 75, y: 68 },
      { id: 'CDM', label: 'CDM', x: 53, y: 44 },
      { id: 'LCM', label: 'CM', x: 35, y: 44 },
      { id: 'RCM', label: 'CM', x: 71, y: 44 },
      { id: 'LM', label: 'LM', x: 18, y: 46 },
      { id: 'RM', label: 'RM', x: 88, y: 46 },
      { id: 'LST', label: 'ST', x: 43, y: 20 },
      { id: 'RST', label: 'ST', x: 63, y: 20 }
    ]
  },
  '4-2-3-1-WIDE': {
    label: '4-2-3-1 Wide',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 71 },
      { id: 'LCB', label: 'CB', x: 37, y: 73 },
      { id: 'RCB', label: 'CB', x: 69, y: 73 },
      { id: 'RB', label: 'RB', x: 91, y: 71 },
      { id: 'LDM', label: 'CDM', x: 37, y: 53 },
      { id: 'RDM', label: 'CDM', x: 69, y: 53 },
      { id: 'LM', label: 'LM', x: 21, y: 41 },
      { id: 'CAM', label: 'CAM', x: 53, y: 37 },
      { id: 'RM', label: 'RM', x: 86, y: 41 },
      { id: 'ST', label: 'ST', x: 53, y: 19 }
    ]
  },
  '4-2-4': {
    label: '4-2-4',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 72 },
      { id: 'LCB', label: 'CB', x: 34, y: 74 },
      { id: 'RCB', label: 'CB', x: 70, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 72 },
      { id: 'LDM', label: 'CDM', x: 36, y: 54 },
      { id: 'RDM', label: 'CDM', x: 68, y: 54 },
      { id: 'LW', label: 'LW', x: 22, y: 32 },
      { id: 'LS', label: 'ST', x: 42, y: 20 },
      { id: 'RS', label: 'ST', x: 62, y: 20 },
      { id: 'RW', label: 'RW', x: 82, y: 32 }
    ]
  },
  '4-3-1-2': {
    label: '4-3-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 74 },
      { id: 'LCB', label: 'CB', x: 36, y: 76 },
      { id: 'RCB', label: 'CB', x: 68, y: 76 },
      { id: 'RB', label: 'RB', x: 90, y: 74 },
      { id: 'LCM', label: 'CM', x: 32, y: 53 },
      { id: 'CM', label: 'CM', x: 52, y: 58 },
      { id: 'RCM', label: 'CM', x: 72, y: 54 },
      { id: 'CAM', label: 'CAM', x: 52, y: 38 },
      { id: 'LS', label: 'ST', x: 42, y: 20 },
      { id: 'RS', label: 'ST', x: 62, y: 20 }
    ]
  },
  '4-3-2-1': {
    label: '4-3-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 16, y: 72 },
      { id: 'LCB', label: 'CB', x: 37, y: 74 },
      { id: 'RCB', label: 'CB', x: 67, y: 74 },
      { id: 'RB', label: 'RB', x: 88, y: 72 },
      { id: 'LCM', label: 'CM', x: 30, y: 54 },
      { id: 'CM', label: 'CM', x: 52, y: 54 },
      { id: 'RCM', label: 'CM', x: 74, y: 54 },
      { id: 'LAM', label: 'CAM', x: 36, y: 34 },
      { id: 'RAM', label: 'CAM', x: 68, y: 34 },
      { id: 'ST', label: 'ST', x: 52, y: 20 }
    ]
  },
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 84 },
      { id: 'LB', label: 'LB', x: 14, y: 72 },
      { id: 'LCB', label: 'CB', x: 36, y: 74 },
      { id: 'RCB', label: 'CB', x: 68, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 72 },
      { id: 'LCM', label: 'CM', x: 32, y: 54 },
      { id: 'CM', label: 'CM', x: 52, y: 50 },
      { id: 'RCM', label: 'CM', x: 72, y: 54 },
      { id: 'LW', label: 'LW', x: 30, y: 26 },
      { id: 'ST', label: 'ST', x: 52, y: 20 },
      { id: 'RW', label: 'RW', x: 74, y: 26 }
    ]
  },
  '4-3-3-ATTACK': {
    label: '4-3-3 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LCM', label: 'CM', x: 30, y: 53 },
      { id: 'CAM', label: 'CAM', x: 52, y: 47 },
      { id: 'RCM', label: 'CM', x: 74, y: 53 },
      { id: 'LW', label: 'LW', x: 30, y: 25 },
      { id: 'ST', label: 'ST', x: 52, y: 19 },
      { id: 'RW', label: 'RW', x: 74, y: 25 }
    ]
  },
  '4-3-3-DEFEND': {
    label: '4-3-3 Defend',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LDM', label: 'CDM', x: 26, y: 52 },
      { id: 'CM', label: 'CM', x: 52, y: 48 },
      { id: 'RDM', label: 'CDM', x: 78, y: 52 },
      { id: 'LW', label: 'LW', x: 28, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 21 },
      { id: 'RW', label: 'RW', x: 76, y: 29 }
    ]
  },
  '4-3-3-FALSE9': {
    label: '4-3-3 False 9',
    slots: [
      { id: 'GK', label: 'GK', x: 53, y: 84 },
      { id: 'LB', label: 'LB', x: 17, y: 65 },
      { id: 'LCB', label: 'CB', x: 38, y: 69 },
      { id: 'RCB', label: 'CB', x: 68, y: 69 },
      { id: 'RB', label: 'RB', x: 89, y: 65 },
      { id: 'LCM', label: 'CM', x: 33, y: 47 },
      { id: 'CM', label: 'CM', x: 53, y: 51 },
      { id: 'RCM', label: 'CM', x: 73, y: 47 },
      { id: 'LW', label: 'LW', x: 33, y: 23 },
      { id: 'CF', label: 'CF', x: 53, y: 29 },
      { id: 'RW', label: 'RW', x: 73, y: 23 }
    ]
  },
  '4-3-3-HOLDING': {
    label: '4-3-3 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 36, y: 74 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'CDM', label: 'CDM', x: 52, y: 53 },
      { id: 'LCM', label: 'CM', x: 32, y: 49 },
      { id: 'RCM', label: 'CM', x: 72, y: 49 },
      { id: 'LW', label: 'LW', x: 32, y: 27 },
      { id: 'ST', label: 'ST', x: 52, y: 19 },
      { id: 'RW', label: 'RW', x: 72, y: 27 }
    ]
  },
  '4-4-1-1': {
    label: '4-4-1-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 69 },
      { id: 'LCB', label: 'CB', x: 36, y: 74 },
      { id: 'RCB', label: 'CB', x: 68, y: 74 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'LM', label: 'LM', x: 20, y: 48 },
      { id: 'LCM', label: 'CM', x: 40, y: 52 },
      { id: 'RCM', label: 'CM', x: 64, y: 52 },
      { id: 'RM', label: 'RM', x: 84, y: 48 },
      { id: 'CAM', label: 'CAM', x: 52, y: 33 },
      { id: 'ST', label: 'ST', x: 52, y: 18 }
    ]
  },
  '4-4-1-1-ATTACK': {
    label: '4-4-1-1 Attack',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 87 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LM', label: 'LM', x: 17, y: 51 },
      { id: 'LCM', label: 'CM', x: 37, y: 55 },
      { id: 'RCM', label: 'CM', x: 67, y: 55 },
      { id: 'RM', label: 'RM', x: 87, y: 51 },
      { id: 'CAM', label: 'CAM', x: 52, y: 37 },
      { id: 'ST', label: 'ST', x: 52, y: 19 }
    ]
  },
  '4-4-2-FLAT': {
    label: '4-4-2 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 87 },
      { id: 'LB', label: 'LB', x: 14, y: 68 },
      { id: 'LCB', label: 'CB', x: 40, y: 70 },
      { id: 'RCB', label: 'CB', x: 64, y: 70 },
      { id: 'RB', label: 'RB', x: 90, y: 68 },
      { id: 'LM', label: 'LM', x: 14, y: 44 },
      { id: 'LCM', label: 'CM', x: 40, y: 48 },
      { id: 'RCM', label: 'CM', x: 64, y: 48 },
      { id: 'RM', label: 'RM', x: 90, y: 44 },
      { id: 'LST', label: 'ST', x: 40, y: 22 },
      { id: 'RST', label: 'ST', x: 64, y: 22 }
    ]
  },
  '4-4-2-HOLDING': {
    label: '4-4-2 Holding',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 16, y: 68 },
      { id: 'LCB', label: 'CB', x: 40, y: 70 },
      { id: 'RCB', label: 'CB', x: 64, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'LM', label: 'LM', x: 20, y: 44 },
      { id: 'LDM', label: 'CDM', x: 40, y: 50 },
      { id: 'RDM', label: 'CDM', x: 64, y: 50 },
      { id: 'RM', label: 'RM', x: 84, y: 46 },
      { id: 'LS', label: 'ST', x: 40, y: 22 },
      { id: 'RS', label: 'ST', x: 64, y: 22 }
    ]
  },
  '4-5-1': {
    label: '4-5-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LB', label: 'LB', x: 14, y: 69 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'LM', label: 'LM', x: 17, y: 49 },
      { id: 'LAM', label: 'CAM', x: 34, y: 39 },
      { id: 'CM', label: 'CM', x: 52, y: 53 },
      { id: 'RAM', label: 'CAM', x: 70, y: 39 },
      { id: 'RM', label: 'RM', x: 87, y: 49 },
      { id: 'ST', label: 'ST', x: 52, y: 39 }
    ]
  },
  '4-5-1-FLAT': {
    label: '4-5-1 Flat',
    slots: [
      { id: 'GK', label: 'GK', x: 51, y: 85 },
      { id: 'LB', label: 'LB', x: 13, y: 69 },
      { id: 'LCB', label: 'CB', x: 33, y: 71 },
      { id: 'RCB', label: 'CB', x: 69, y: 71 },
      { id: 'RB', label: 'RB', x: 89, y: 69 },
      { id: 'LM', label: 'LM', x: 16, y: 47 },
      { id: 'LCM', label: 'CM', x: 35, y: 49 },
      { id: 'CM', label: 'CM', x: 51, y: 51 },
      { id: 'RCM', label: 'CM', x: 67, y: 49 },
      { id: 'RM', label: 'RM', x: 86, y: 47 },
      { id: 'ST', label: 'ST', x: 51, y: 23 }
    ]
  },
  '5-2-1-2': {
    label: '5-2-1-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LWB', label: 'LWB', x: 16, y: 69 },
      { id: 'LCB', label: 'CB', x: 36, y: 73 },
      { id: 'CB', label: 'CB', x: 52, y: 73 },
      { id: 'RCB', label: 'CB', x: 68, y: 73 },
      { id: 'RWB', label: 'RWB', x: 88, y: 69 },
      { id: 'LCM', label: 'CM', x: 34, y: 51 },
      { id: 'RCM', label: 'CM', x: 70, y: 51 },
      { id: 'CAM', label: 'CAM', x: 52, y: 35 },
      { id: 'LS', label: 'ST', x: 42, y: 19 },
      { id: 'RS', label: 'ST', x: 62, y: 19 }
    ]
  },
  '5-2-2-1': {
    label: '5-2-2-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LWB', label: 'LWB', x: 13, y: 65 },
      { id: 'LCB', label: 'CB', x: 32, y: 71 },
      { id: 'CB', label: 'CB', x: 52, y: 71 },
      { id: 'RCB', label: 'CB', x: 72, y: 71 },
      { id: 'RWB', label: 'RWB', x: 92, y: 65 },
      { id: 'LCM', label: 'CM', x: 40, y: 49 },
      { id: 'RCM', label: 'CM', x: 64, y: 49 },
      { id: 'LW', label: 'LW', x: 32, y: 29 },
      { id: 'RW', label: 'RW', x: 72, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 19 }
    ]
  },
  '5-3-2': {
    label: '5-3-2',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 87 },
      { id: 'LWB', label: 'LWB', x: 14, y: 65 },
      { id: 'LCB', label: 'CB', x: 36, y: 69 },
      { id: 'CB', label: 'CB', x: 52, y: 69 },
      { id: 'RCB', label: 'CB', x: 68, y: 69 },
      { id: 'RWB', label: 'RWB', x: 90, y: 65 },
      { id: 'LCM', label: 'CM', x: 26, y: 45 },
      { id: 'CM', label: 'CM', x: 52, y: 45 },
      { id: 'RCM', label: 'CM', x: 78, y: 45 },
      { id: 'LS', label: 'ST', x: 40, y: 21 },
      { id: 'RS', label: 'ST', x: 64, y: 21 }
    ]
  },
  '5-4-1': {
    label: '5-4-1',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LWB', label: 'LWB', x: 12, y: 64 },
      { id: 'LCB', label: 'CB', x: 30, y: 70 },
      { id: 'CB', label: 'CB', x: 52, y: 72 },
      { id: 'RCB', label: 'CB', x: 74, y: 70 },
      { id: 'RWB', label: 'RWB', x: 92, y: 64 },
      { id: 'LM', label: 'LM', x: 22, y: 43 },
      { id: 'LCM', label: 'CM', x: 40, y: 50 },
      { id: 'RCM', label: 'CM', x: 64, y: 50 },
      { id: 'RM', label: 'RM', x: 82, y: 43 },
      { id: 'ST', label: 'ST', x: 52, y: 21 }
    ]
  },
  '5-4-1-HOLDING': {
    label: '5-4-1-HOLDING',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 86 },
      { id: 'LWB', label: 'LWB', x: 14, y: 68 },
      { id: 'LCB', label: 'CB', x: 32, y: 72 },
      { id: 'CB', label: 'CB', x: 52, y: 72 },
      { id: 'RCB', label: 'CB', x: 72, y: 72 },
      { id: 'RWB', label: 'RWB', x: 90, y: 68 },
      { id: 'LM', label: 'LM', x: 26, y: 42 },
      { id: 'CDM', label: 'CDM', x: 42, y: 50 },
      { id: 'CAM', label: 'CAM', x: 62, y: 36 },
      { id: 'RM', label: 'RM', x: 78, y: 44 },
      { id: 'ST', label: 'ST', x: 52, y: 20 }
    ]
  },
  '5-4-1-DEFEND': {
    label: '5-4-1-DEFEND',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 14, y: 71 },
      { id: 'LCB', label: 'CB', x: 32, y: 67 },
      { id: 'CB', label: 'CB', x: 52, y: 63 },
      { id: 'RCB', label: 'CB', x: 72, y: 67 },
      { id: 'RB', label: 'RB', x: 90, y: 71 },
      { id: 'LM', label: 'LM', x: 20, y: 45 },
      { id: 'LCM', label: 'CM', x: 40, y: 41 },
      { id: 'RCM', label: 'CM', x: 64, y: 41 },
      { id: 'RM', label: 'RM', x: 84, y: 45 },
      { id: 'ST', label: 'ST', x: 52, y: 23 }
    ]
  },
  '4-4-1-1-FLAT': {
    label: '4-4-1-1-FLAT',
    slots: [
      { id: 'GK', label: 'GK', x: 52, y: 85 },
      { id: 'LB', label: 'LB', x: 16, y: 67 },
      { id: 'LCB', label: 'CB', x: 37, y: 71 },
      { id: 'RCB', label: 'CB', x: 67, y: 71 },
      { id: 'RB', label: 'RB', x: 88, y: 67 },
      { id: 'RCM', label: 'CM', x: 62, y: 49 },
      { id: 'LM', label: 'LM', x: 22, y: 39 },
      { id: 'LCM', label: 'CM', x: 40, y: 51 },
      { id: 'CF', label: 'CF', x: 52, y: 39 },
      { id: 'RM', label: 'RM', x: 82, y: 39 },
      { id: 'ST', label: 'ST', x: 52, y: 23 }
    ]
  }
};


// Modal functions
function openSquadBuilderModal() {
  const modal = document.getElementById('squad-builder-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Ensure formations are loaded if not defined above
  if(Object.keys(getFormations()).length === 1 && typeof window.formations !== 'undefined') {
      Object.assign(formations, window.formations);
  }

  setTimeout(() => {
    applyTheme(localStorage.getItem('selectedFieldTheme') || 'stadium-blue');
  }, 100);
  
  if (typeof renderSquadBuilder === 'function') {
    renderSquadBuilder();
  }
}

function closeSquadBuilderModal() {
  const modal = document.getElementById('squad-builder-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Drag handlers (Standard implementation)
function handleCardDragStart(e, playerId, sourceType, sourceId) {
  e.stopPropagation();
  squadState.dragging = playerId;
  squadState.dragSource = { type: sourceType, id: sourceId };
  const element = e.target.closest('.squad-card, .bench-cell, .picker-row');
  if (element) element.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

const POINTER_DRAG_THRESHOLD = 6;
const pointerDragState = {
  pending: null,
  active: null
};

function queuePointerDrag(e, playerId, sourceType, sourceId, onStart) {
  if (!e || e.pointerType === 'mouse') return;
  if (pointerDragState.pending || pointerDragState.active) return;

  const element = e.target.closest('.player-preview-card, .bench-preview-card, .picker-row');
  if (!element) return;

  pointerDragState.pending = {
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    playerId,
    sourceType,
    sourceId,
    element,
    onStart
  };

  document.addEventListener('pointermove', handlePointerDragMove);
  document.addEventListener('pointerup', handlePointerDragEnd);
  document.addEventListener('pointercancel', handlePointerDragCancel);
}

function beginPointerDrag(pending) {
  pointerDragState.pending = null;
  pointerDragState.active = {
    pointerId: pending.pointerId,
    lastHover: null
  };

  squadState.dragging = pending.playerId;
  squadState.dragSource = { type: pending.sourceType, id: pending.sourceId };

  if (pending.element) {
    pending.element.classList.add('dragging');
    if (pending.element.setPointerCapture) {
      pending.element.setPointerCapture(pending.pointerId);
    }
  }

  if (typeof pending.onStart === 'function') {
    pending.onStart();
  }
}

function handlePointerDragMove(e) {
  const pending = pointerDragState.pending;
  if (pending && pending.pointerId === e.pointerId) {
    const deltaX = e.clientX - pending.startX;
    const deltaY = e.clientY - pending.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (pending.sourceType === 'picker' && absX < absY) {
      return;
    }
    if (Math.hypot(deltaX, deltaY) >= POINTER_DRAG_THRESHOLD) {
      beginPointerDrag(pending);
    } else {
      return;
    }
  }

  const active = pointerDragState.active;
  if (!active || active.pointerId !== e.pointerId) return;

  e.preventDefault();

  const target = document.elementFromPoint(e.clientX, e.clientY);
  const slot = target ? target.closest('.squad-slot') : null;
  const benchCell = target ? target.closest('.bench-cell') : null;
  const nextHover = slot || benchCell;

  if (active.lastHover && active.lastHover !== nextHover) {
    active.lastHover.classList.remove('drag-over');
  }

  if (nextHover && nextHover !== active.lastHover) {
    nextHover.classList.add('drag-over');
  }

  active.lastHover = nextHover;
}

function handlePointerDragEnd(e) {
  const pending = pointerDragState.pending;
  if (pending && pending.pointerId === e.pointerId) {
    pointerDragState.pending = null;
    cleanupPointerDragListeners();
    return;
  }

  const active = pointerDragState.active;
  if (!active || active.pointerId !== e.pointerId) return;

  e.preventDefault();

  const target = document.elementFromPoint(e.clientX, e.clientY);
  const slot = target ? target.closest('.squad-slot') : null;
  const benchCell = target ? target.closest('.bench-cell') : null;

  if (slot && slot.dataset.slotId) {
    handleSlotDrop(createPointerDropEvent(), slot.dataset.slotId);
  } else if (benchCell) {
    const benchIndex = parseInt(benchCell.dataset.benchIndex, 10);
    if (Number.isFinite(benchIndex)) {
      handleBenchDrop(createPointerDropEvent(), benchIndex);
    } else {
      clearDragState();
    }
  } else {
    clearDragState();
  }

  pointerDragState.active = null;
  cleanupPointerDragListeners();
}

function handlePointerDragCancel(e) {
  if (pointerDragState.pending && pointerDragState.pending.pointerId === e.pointerId) {
    pointerDragState.pending = null;
  }

  if (pointerDragState.active && pointerDragState.active.pointerId === e.pointerId) {
    clearDragState();
    pointerDragState.active = null;
  }

  cleanupPointerDragListeners();
}

function cleanupPointerDragListeners() {
  document.removeEventListener('pointermove', handlePointerDragMove);
  document.removeEventListener('pointerup', handlePointerDragEnd);
  document.removeEventListener('pointercancel', handlePointerDragCancel);
}

function createPointerDropEvent() {
  return {
    preventDefault: () => {},
    stopPropagation: () => {}
  };
}

function handleSlotDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  if (squadState.dragging) {
    const slot = e.target.closest('.squad-slot');
    if (slot) {
      console.log('👆 Drag over slot:', slot.dataset.slotId);
      slot.classList.add('drag-over');
    }
  }
}

function handleSlotDragLeave(e) {
  const slot = e.target.closest('.squad-slot');
  if (slot) slot.classList.remove('drag-over');
}

function handleSlotDrop(e, targetSlotId) {
    console.log('🎯 DROP EVENT TRIGGERED');
    console.log('Target Slot ID:', targetSlotId);
    console.log('Dragging Player ID:', squadState.dragging);
    console.log('Drag Source:', squadState.dragSource);

    e.preventDefault();
    e.stopPropagation();

    if (!squadState.dragging) {
        console.log('❌ No dragging state, exiting');
        return;
    }

    const draggedId = squadState.dragging;
    const source = squadState.dragSource;

    const draggedPlayer = getPlayers().find(p => 
        p.id === draggedId || p.playerid === draggedId || p.player_id === draggedId
    );

    console.log('🔍 Looking for player:', draggedId);
    console.log('🔍 Total players in cache:', getPlayers().length);
    console.log('🔍 Found player:', draggedPlayer);

    if (!draggedPlayer) {
        console.log('❌ ERROR: Player not found in cache!');
        clearDragState();
        return;
    }

    console.log('✅ Dragged Player:', draggedPlayer);

    // Check if target slot already has a player (for SWAPPING)
    const targetPlayerId = squadState.starters[targetSlotId] || null;

    // ========================================
    // CASE 1: Dragging from PICKER (right side list)
    // ========================================
    if (source.type === 'picker') {
        console.log('🔵 Drag from PICKER to SLOT');

        // Validate position compatibility
        if (!validateAssignment(draggedPlayer, targetSlotId)) {
            console.log('❌ Validation FAILED');
            clearDragState();
            return;
        }

        // Check if player already exists somewhere in squad
        if (isPlayerAlreadyInSquad(draggedId, targetSlotId)) {
            console.log('⚠️ Player already in squad');
            clearDragState();
            return;
        }

        console.log('✅ Assigning player to slot:', targetSlotId);
        
        // Remove from any existing position
        removeIfAssigned(draggedId);
        
        // Assign to target slot
        squadState.starters[targetSlotId] = draggedId;
    }
    
    // ========================================
    // CASE 2: Dragging from SLOT to SLOT (swapping positions)
    // ========================================
    else if (source.type === 'slot') {
        console.log('🔄 Drag from SLOT to SLOT');
        
        const sourceSlotId = source.id;


        // If swapping with bench player, validate bench player can go to slot
        if (targetPlayerId) {
            const targetPlayer = getPlayers().find(p => 
                p.id === targetPlayerId || p.playerid === targetPlayerId || p.player_id === targetPlayerId
            );
            
            if (targetPlayer && !validateAssignment(targetPlayer, sourceSlotId)) {
                console.log('❌ Swap validation FAILED - bench player cannot go to that position');
                clearDragState();
                return;
            }
        }

        
        // If target slot is EMPTY - just move
        if (!targetPlayerId) {
            console.log('➡️ Moving to empty slot');
            squadState.starters[targetSlotId] = draggedId;
            delete squadState.starters[sourceSlotId];
        }
        // If target slot has a player - SWAP positions
        else {
            console.log('🔁 SWAPPING slot positions');
            console.log(`   Source: ${sourceSlotId} = ${draggedId}`);
            console.log(`   Target: ${targetSlotId} = ${targetPlayerId}`);
            
            // Perform the swap
            squadState.starters[targetSlotId] = draggedId;       // Dragged player to target
            squadState.starters[sourceSlotId] = targetPlayerId;  // Target player to source
            
            console.log('✅ SWAP COMPLETE');
            console.log(`   New Source: ${sourceSlotId} = ${squadState.starters[sourceSlotId]}`);
            console.log(`   New Target: ${targetSlotId} = ${squadState.starters[targetSlotId]}`);
        }
    }
    
    // ========================================
    // CASE 3: Dragging from BENCH to SLOT 🆕
    // ========================================
    else if (source.type === 'bench') {
        console.log('🔄 Drag from BENCH to SLOT');
        
        const sourceBenchIndex = source.id;

        // Validate position (optional - you can remove this if you want any position)
        if (!validateAssignment(draggedPlayer, targetSlotId)) {
            console.log('❌ Validation FAILED');
            clearDragState();
            return;
        }

        // If target slot is EMPTY - move from bench to slot
        if (!targetPlayerId) {
            console.log('➡️ Moving from bench to empty slot');
            squadState.starters[targetSlotId] = draggedId;
            squadState.bench[sourceBenchIndex] = null; // Remove from bench
        }
        // If target slot has a player - SWAP bench with slot
        else {
            console.log('🔁 SWAPPING bench player with slot player');
            console.log(`   Bench[${sourceBenchIndex}]: ${draggedId} → Slot[${targetSlotId}]`);
            console.log(`   Slot[${targetSlotId}]: ${targetPlayerId} → Bench[${sourceBenchIndex}]`);
            
            squadState.starters[targetSlotId] = draggedId;         // Bench player to slot
            squadState.bench[sourceBenchIndex] = targetPlayerId;   // Slot player to bench
            
            console.log('✅ BENCH ↔ SLOT SWAP COMPLETE');
        }
    }

    console.log('🔄 Before clearDragState');
    clearDragState();
    
    console.log('🔄 Before renderSquadBuilder');
    renderSquadBuilder();
    
    console.log('✅ DROP COMPLETE');
}


function handleBenchDrop(e, targetBenchIndex) {
    console.log('🎯 BENCH DROP EVENT TRIGGERED');
    console.log('Target Bench Index:', targetBenchIndex);
    console.log('Dragging Player ID:', squadState.dragging);
    console.log('Drag Source:', squadState.dragSource);

    e.preventDefault();
    e.stopPropagation();

    if (!squadState.dragging) return;

    const draggedId = squadState.dragging;
    const source = squadState.dragSource;

    const draggedPlayer = getPlayers().find(p => 
        p.id === draggedId || p.playerid === draggedId || p.player_id === draggedId
    );

    if (!draggedPlayer) {
        clearDragState();
        return;
    }

    const targetPlayerId = squadState.bench[targetBenchIndex] || null;

    // ========================================
    // CASE 1: From PICKER to BENCH
    // ========================================
    if (source.type === 'picker') {
        console.log('🔵 Drag from PICKER to BENCH');

        // Check if player already in squad
        if (isPlayerAlreadyInSquad(draggedId, null)) {
            clearDragState();
            return;
        }

        // Remove from any existing position
        removeIfAssigned(draggedId);

        // Assign to bench
        squadState.bench[targetBenchIndex] = draggedId;
    }
    
    // ========================================
    // CASE 2: From SLOT to BENCH (move from formation to bench) 🆕
    else if (source.type === 'slot') {
        console.log('🔄 Drag from SLOT to BENCH');
        
        const sourceSlotId = source.id;

        // If target bench slot is EMPTY - NO validation needed (bench accepts all)
        if (!targetPlayerId) {
            console.log('➡️ Moving from slot to empty bench - NO VALIDATION');
            squadState.bench[targetBenchIndex] = draggedId;
            delete squadState.starters[sourceSlotId]; // Remove from formation
        }
        // If target bench has a player - VALIDATE the swap (bench player going to formation)
        else {
            const targetPlayer = getPlayers().find(p => 
                p.id === targetPlayerId || p.playerid === targetPlayerId || p.player_id === targetPlayerId
            );
            
            // Validate if bench player can go to the formation slot
            if (targetPlayer && !validateAssignment(targetPlayer, sourceSlotId)) {
                console.log('❌ Swap validation FAILED - bench player cannot go to that position');
                clearDragState();
                return;
            }
            
            console.log('🔁 SWAPPING slot with bench');
            console.log(`   Slot[${sourceSlotId}]: ${draggedId} → Bench[${targetBenchIndex}]`);
            console.log(`   Bench[${targetBenchIndex}]: ${targetPlayerId} → Slot[${sourceSlotId}]`);
            
            squadState.bench[targetBenchIndex] = draggedId;       // Slot player to bench
            squadState.starters[sourceSlotId] = targetPlayerId;   // Bench player to slot
            console.log('✅ SLOT ↔ BENCH SWAP COMPLETE');
        }
    }

    
    // ========================================
    // CASE 3: From BENCH to BENCH (swap bench positions)
    // ========================================
    else if (source.type === 'bench') {
        console.log('🔄 Drag from BENCH to BENCH');
        
        const sourceBenchIndex = source.id;

        // Don't allow dropping on same position
        if (sourceBenchIndex === targetBenchIndex) {
            clearDragState();
            return;
        }

        // If target is empty - just move
        if (!targetPlayerId) {
            console.log('➡️ Moving bench position');
            squadState.bench[targetBenchIndex] = draggedId;
            squadState.bench[sourceBenchIndex] = null;
        }
        // If target has player - SWAP
        else {
            console.log('🔁 SWAPPING bench positions');
            squadState.bench[targetBenchIndex] = draggedId;
            squadState.bench[sourceBenchIndex] = targetPlayerId;
        }
    }

    clearDragState();
    renderSquadBuilder();
    console.log('✅ BENCH DROP COMPLETE');
}


function clearDragState() {
  console.log('🧹 CLEARING DRAG STATE');
  
  const draggingElements = document.querySelectorAll('.dragging, .drag-over');
  console.log('Found dragging elements:', draggingElements.length);
  
  draggingElements.forEach(el => {
    console.log('Removing classes from:', el.className);
    el.classList.remove('dragging', 'drag-over');
  });
  
  squadState.dragging = null;
  squadState.dragSource = null;
  
  console.log('✅ Drag state cleared');
}

// ============ RENDER LOGIC ============

function renderSquadBuilder() {

  console.log('🎨 RENDER SQUAD BUILDER CALLED');
  console.log('Current starters:', squadState.starters);
  console.log('Current bench:', squadState.bench);
  console.log('Current formation:', squadState.formationId);

  const nameEl = document.getElementById('squad-name-input');
  const ovrEl = document.getElementById('squad-ovr');
  const valueEl = document.getElementById('squad-value');
  const formationSelect = document.getElementById('formation-select');
  
  if (nameEl) {
    const currentName = (nameEl.value || '').trim();
    if (currentName) {
      squadState.name = currentName;
    }
    nameEl.value = squadState.name || 'My Squad';
  }
  if (formationSelect) formationSelect.value = squadState.formationId;
  if (ovrEl) ovrEl.textContent = getFinalTeamOVR() || 0;
  if (valueEl) valueEl.textContent = formatPrice(calculateValue() || 0);

  const field = document.getElementById('squad-field');
  if (!field) return;
  field.innerHTML = '';
  
  // Use global formations if local one is incomplete
  const currentFormation = (typeof getFormations()[squadState.formationId] !== 'undefined') 
    ? getFormations()[squadState.formationId] 
    : (window.formations ? window.getFormations()[squadState.formationId] : null);

  if (!currentFormation) return;

  currentFormation.slots.forEach(slot => {
    const el = renderSlot(slot);
    field.appendChild(el);
  });

  renderBench();
  renderPlayerPicker(); // This now calls the API-based renderer
}

function resolveSquadCardImages(player) {
    const playerId = resolveSquadPlayerId(player);
    const fallbackCard = playerId
        ? `https://cdn.futbin.com/content/fifa25/img/cards/e_${playerId}.png`
        : 'https://via.placeholder.com/300x400';
    const fallbackPlayer = playerId
        ? `https://cdn.futbin.com/content/fifa25/img/players/${playerId}.png`
        : 'https://via.placeholder.com/200x300';

    return {
        playerId,
        cardBg: player.cardbackground || player.card_background || player.cardBackground || fallbackCard,
        playerImg: player.playerimage || player.player_image || player.playerImage ||
            player.playerimg || player.playerImg || player.image || fallbackPlayer
    };
}

function buildSquadPreviewCardMarkup(player, slotLabel, slotId, options = {}) {
    if (!player) return '';

    const { cardBg, playerImg } = resolveSquadCardImages(player);
    const playerName = player.name || 'Unknown';
    const position = player.position || 'NA';
    const adjustedOVR = getPositionAdjustedOVR(player, slotLabel || '', { useSquadOverrides: true });
    const colorRating = player.colorrating || player.color_rating || player.colorRating || '#FFFFFF';
    const colorPosition = player.colorposition || player.color_position || player.colorPosition || '#FFFFFF';
    const colorName = player.colorname || player.color_name || player.colorName || '#FFFFFF';
    const crossOriginAttr = options.includeCrossOrigin ? ' crossorigin="anonymous"' : '';
    const includeRemoveButton = options.includeRemoveButton !== false;
    const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
    const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
    const untradableBadgeHTML = isUntradable
          ? `<div class="card-untradable-badge ${includeRemoveButton ? 'with-remove' : 'no-remove'}">
              <img src="assets/images/untradable_img.png" alt="Untradable">
            </div>`
          : '';


    return `
            <div class="preview-card-inner">
                <img src="${cardBg}"
                     alt="Card"
                     class="preview-card-bg"${crossOriginAttr}
                     onerror="this.style.background='linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'; this.style.opacity='0.3';">
                <img src="${playerImg}"
                     alt="${playerName}"
                     class="preview-card-player-img"${crossOriginAttr}
                     onerror="this.style.display='none';">
                <div class="preview-card-ovr" style="color: ${colorRating};">${adjustedOVR > 0 ? adjustedOVR : 'NA'}</div>
                <div class="preview-card-position" style="color: ${colorPosition}">${position}</div>
                <div class="preview-card-name" style="color: ${colorName}">${playerName}</div>
                <img src="${player.nationflag || ''}" alt="Nation" class="card-nation-flag ${getPlayerType(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}" onerror="this.style.display='none'">
                <img src="${player.clubflag || ''}" alt="Club" class="card-club-flag ${getPlayerType(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}" onerror="this.style.display='none'">
                ${getPlayerType(player) === 'normal' && player.league_image ? `
                    <img src="${player.league_image}" 
                         alt="League" 
                         class="card-league-flag normal-league-flag"
                         onerror="this.style.display='none'">
                ` : ''}
                ${untradableBadgeHTML}
                ${includeRemoveButton ? `<button class="preview-card-remove" onclick="event.stopPropagation(); delete squadState.starters['${slotId}']; renderSquadBuilder();">×</button>` : ''}
            </div>
        `;
}

function buildSquadBenchCardMarkup(player, benchIndex, options = {}) {
    if (!player) return '';

    const { cardBg, playerImg } = resolveSquadCardImages(player);
    const overall = getSquadPlayerBoostedOVR(player);
    const position = player.position || 'NA';
    const playerName = player.name || 'Unknown';
    const colorRating = player.colorrating || player.color_rating || player.colorRating || '#FFFFFF';
    const colorPosition = player.colorposition || player.color_position || player.colorPosition || '#FFFFFF';
    const colorName = player.colorname || player.color_name || player.colorName || '#FFFFFF';
    const crossOriginAttr = options.includeCrossOrigin ? ' crossorigin="anonymous"' : '';
    const includeRemoveButton = options.includeRemoveButton !== false;
    const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
    const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
    const untradableBadgeHTML = isUntradable
        ? `<div class="card-untradable-badge" style="right: ${includeRemoveButton ? '18px' : '-1px'}; pointer-events: none;">
               <img src="assets/images/untradable_img.png" alt="Untradable">
           </div>`
        : '';

    return `
                <div class="bench-card-inner">
                    <img src="${cardBg}"
                         alt="Card"
                         class="bench-card-bg"${crossOriginAttr}
                         onerror="this.style.background='linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'; this.style.opacity='0.3';">
                    <img src="${playerImg}"
                         alt="${playerName}"
                         class="bench-card-player-img"${crossOriginAttr}
                         onerror="this.style.display='none';">
                    <div class="bench-card-ovr" style="color: ${colorRating}">${overall > 0 ? overall : 'NA'}</div>
                    <div class="bench-card-position" style="color: ${colorPosition}">${position}</div>
                    <div class="bench-card-name" style="color: ${colorName}">${playerName}</div>
                    ${player.nation_flag || player.nation_flag ? `<img src="${player.nationflag || player.nationflag}" alt="Nation" class="bench-card-flag-nation ${getPlayerType(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}"${crossOriginAttr} onerror="this.style.display='none'">` : ''}
                    ${player.club_flag || player.club_flag ? `<img src="${player.clubflag || player.clubflag}" alt="Club" class="bench-card-flag-club ${getPlayerType(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}"${crossOriginAttr} onerror="this.style.display='none'">` : ''}

                    ${untradableBadgeHTML}
                    ${includeRemoveButton ? `<button class="bench-card-remove" onclick="event.stopPropagation(); squadState.bench.splice(${benchIndex}, 1); renderSquadBuilder();">×</button>` : ''}
                </div>
            `;
}

// ============ UPDATED: REDIRECT ON CLICK ============
function renderSlot(slot) {
    const container = document.createElement('div');
    container.className = 'squad-slot';
    container.style.left = slot.x + '%';
    container.style.top = slot.y + '%';
    container.dataset.slotId = slot.id;

    const assignedId = squadState.starters[slot.id] || null;
    const player = assignedId ? getPlayers().find(p => p.id === assignedId || p.playerid === assignedId || p.player_id === assignedId) : null;

    // ALWAYS CREATE THE POSITION DOT/CIRCLE (never remove it)
    const positionDot = document.createElement('div');
    positionDot.className = 'position-dot';
    positionDot.innerHTML = `<span class="position-label">${slot.label}</span>`;

    // Drag events on container
    container.addEventListener('dragover', handleSlotDragOver);
    container.addEventListener('dragleave', handleSlotDragLeave);
    container.addEventListener('drop', (e) => handleSlotDrop(e, slot.id));

    // ALWAYS append the position dot first (it stays in background)
    container.appendChild(positionDot);

    // If player assigned, create BIGGER preview card ON TOP
    if (player) {
        console.log('🎨 Rendering player card:', player);
        
        const playerId = resolveSquadPlayerId(player) || assignedId;

        const previewCard = document.createElement('div');
        previewCard.className = 'player-preview-card';
        previewCard.dataset.playerId = playerId || '';
        console.log('🎨 DEBUG: Creating preview card for slot:', slot.id, 'player:', assignedId);
        previewCard.setAttribute('draggable', 'true');

        previewCard.addEventListener('pointerdown', (e) => {
            queuePointerDrag(e, assignedId, 'slot', slot.id);
        });
        
        previewCard.addEventListener('dragstart', (e) => {
            handleCardDragStart(e, assignedId, 'slot', slot.id);
        });
        
        // ✅ CLICK HANDLER (moved OUTSIDE dragstart)
        previewCard.addEventListener('click', (e) => {
            e.stopPropagation(); // ✅ ADD THIS LINE
            console.log('🎯 DEBUG: Preview card clicked!');
            console.log('🎯 DEBUG: Event target:', e.target);
            console.log('🎯 DEBUG: Player ID:', assignedId);
            console.log('🎯 DEBUG: Slot ID:', slot.id);
            
            const isRemoveButton = e.target.closest('.preview-card-remove');
            console.log('🎯 DEBUG: Is remove button?', !!isRemoveButton);
            
            if (!isRemoveButton) {
                console.log('🎯 DEBUG: Attempting to open modal...');
                console.log('🎯 DEBUG: window.openPlayerCustomizationModal exists?', typeof window.openPlayerCustomizationModal);
                
                if (typeof window.openPlayerCustomizationModal === 'function') {
                    window.openPlayerCustomizationModal(assignedId, slot.id);
                    console.log('✅ DEBUG: Modal function called!');
                } else {
                    console.error('❌ DEBUG: Modal function NOT FOUND!');
                }
            }
        });
        
        console.log('✅ DEBUG: Click listener attached to preview card');

        previewCard.innerHTML = buildSquadPreviewCardMarkup(player, slot.label || '', slot.id);
        if (typeof applyRankOverlay === 'function') {
            const rankValue = getSquadPlayerSelectedRank(playerId, player);
            applyRankOverlay(previewCard.querySelector('.preview-card-inner'), rankValue, {
                scope: 'squad-builder',
                modifierClass: 'rank-overlay--squad-field'
            });
        }

        // Append preview card AFTER position dot (so it appears on top)
        container.appendChild(previewCard);
    }

    // Click handler for empty slots only
    if (!player) {
        container.addEventListener('click', () => {
            squadState.activeSlot = slot.id;
            squadState.pendingDatabaseAssign = true;
            if(state && state.filters) {
                state.filters.position = slot.label;
            }
            const filterDropdown = document.getElementById('filter-position');
            if(filterDropdown) filterDropdown.value = slot.label;
            
            closeSquadBuilderModal();
            if(typeof switchView === 'function') switchView('database');
            if(typeof loadDatabase === 'function') loadDatabase();
        });
    }

    return container;
}


// ============ END REDIRECT LOGIC ============

function renderBench() {
    const bench = document.getElementById('squad-bench');
    if (!bench) return;

    bench.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const pid = squadState.bench[i] || null;
        const player = pid ? getPlayers().find(p => p.id === pid || p.playerid === pid || p.player_id === pid) : null;

        const cell = document.createElement('div');
        cell.className = 'bench-cell' + (player ? ' filled' : '');
        cell.dataset.benchIndex = i;

        // Drag events
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (squadState.dragging) {
                cell.classList.add('drag-over');
            }
        });

        cell.addEventListener('dragleave', () => {
            cell.classList.remove('drag-over');
        });

        cell.addEventListener('drop', (e) => handleBenchDrop(e, i));

        // ALWAYS CREATE THE EMPTY SLOT (background layer)
        const emptySlot = document.createElement('div');
        emptySlot.className = 'bench-empty-slot'; 
        emptySlot.innerHTML = `<span class="bench-slot-label">SUB ${i + 1}</span>`;
        cell.appendChild(emptySlot);

        // If player assigned, create PREVIEW CARD ON TOP
        if (player) {
            const playerId = resolveSquadPlayerId(player) || pid;

            // Create bench preview card
            const benchCard = document.createElement('div');
            benchCard.className = 'bench-preview-card';
            benchCard.dataset.playerId = playerId || '';
            console.log('🪑 DEBUG: Creating bench card at index:', i, 'player:', playerId);
            benchCard.setAttribute('draggable', 'true');

            benchCard.addEventListener('pointerdown', (e) => {
                queuePointerDrag(e, playerId, 'bench', i);
            });

            benchCard.addEventListener('dragstart', (e) => {
                handleCardDragStart(e, playerId, 'bench', i);
            // ✅ ADD CLICK HANDLER TO BENCH CARDS
            // 🐛 DEBUG: Add click handler to bench card
            benchCard.addEventListener('click', (e) => {
                console.log('🪑 DEBUG: Bench card clicked!');
                console.log('🪑 DEBUG: Player ID:', playerId);
                console.log('🪑 DEBUG: Bench index:', i);
                
                const isRemoveButton = e.target.closest('.bench-card-remove');
                console.log('🪑 DEBUG: Is remove button?', !!isRemoveButton);
                
                if (!isRemoveButton) {
                    console.log('🪑 DEBUG: Attempting to open modal...');
                    
                    if (typeof window.openPlayerCustomizationModal === 'function') {
                        window.openPlayerCustomizationModal(playerId, `BENCH${i}`);
                        console.log('✅ DEBUG: Modal function called for bench!');
                    } else {
                        console.error('❌ DEBUG: Modal function NOT FOUND!');
                    }
                }
            });
            console.log('✅ DEBUG: Click listener attached to bench card');

            });

            benchCard.innerHTML = buildSquadBenchCardMarkup(player, i);
            if (typeof applyRankOverlay === 'function') {
                const rankValue = getSquadPlayerSelectedRank(playerId, player);
                applyRankOverlay(benchCard.querySelector('.bench-card-inner'), rankValue, {
                    scope: 'squad-builder',
                    modifierClass: 'rank-overlay--squad-field'
                });
            }

            cell.appendChild(benchCard);
        }

        // Click handler for empty bench slots
        if (!player) {
            cell.addEventListener('click', () => {
                squadState.activeSlot = `BENCH${i}`;
                squadState.pendingDatabaseAssign = true;
                closeSquadBuilderModal();
                if (typeof switchView === 'function') switchView('database');
            });
        }

        bench.appendChild(cell);
    }
}

// Helpers
function validateAssignment(player, slotId) {
    if (!player || !slotId) return false;

    const formations = getFormations();
    const formation = formations[squadState.formationId];
    if (!formation) return false;

    const slot = formation.slots.find(s => s.id === slotId);
    if (!slot) return false;

    const playerPos = (player.position || '').toUpperCase().trim();
    const slotLabel = (slot.label || '').toUpperCase().trim();

    console.log('🔍 Validating:', playerPos, '→', slotLabel);

    // ========================================
    // STRICT GK RULES (bidirectional)
    // ========================================
    
    // Rule 1: Only GK can go to GK position
    if (slotLabel === 'GK') {
        if (playerPos !== 'GK') {
            console.log('❌ BLOCKED: Non-GK trying to go to GK position');
            return false;
        }
        console.log('✅ GK player to GK position - ALLOWED');
        return true;
    }

    // Rule 2: GK can ONLY go to GK position (not CB, ST, CM, etc.)
    if (playerPos === 'GK') {
        console.log('❌ BLOCKED: GK trying to go to non-GK position');
        return false;
    }

    // ========================================
    // For all other positions: Allow any outfield player
    // ========================================
    console.log('✅ Position validation passed');
    return true;
}

function isPlayerAlreadyInSquad(playerId, targetSlot) {
  console.log('🔍 Checking if player already in squad:', playerId);
  
  for (const [slotId, pid] of Object.entries(squadState.starters)) {
    if (slotId !== targetSlot && pid === playerId) {
      console.log('❌ Found in starters:', slotId);
      return true;
    }
  }
  
  if (squadState.bench.includes(playerId)) {
    console.log('❌ Found in bench');
    return true;
  }
  
  console.log('✅ Player not in squad');
  return false;
}

function removeIfAssigned(playerId) {
  Object.keys(squadState.starters).forEach(k => {
    if (squadState.starters[k] === playerId) delete squadState.starters[k];
  });
  const idx = squadState.bench.indexOf(playerId);
  if (idx !== -1) squadState.bench.splice(idx, 1);
}



// ========================================
// BADGES SYSTEM
// ========================================

function openBadgesModal() {
    const modal = document.getElementById('badges-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Update visual state of badge cards
    updateBadgeCards();
}

function closeBadgesModal() {
    const modal = document.getElementById('badges-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function toggleBadge(badgeNumber) {
    const badgeKey = `badge${badgeNumber}`;
    
    // Toggle badge state
    squadState.badges[badgeKey] = !squadState.badges[badgeKey];
    
    console.log(`🏅 Badge ${badgeNumber} toggled:`, squadState.badges[badgeKey]);
    
    // Update visuals
    updateBadgeCards();
    
    // Update OVR display
    renderSquadBuilder();
    
    const status = squadState.badges[badgeKey] ? 'activated' : 'deactivated';
    console.log(`🏅 Badge ${badgeNumber} ${status}`);
}

function updateBadgeCards() {
    let activeCount = 0;
    
    // Update each badge card
    for (let i = 1; i <= 3; i++) {
        const card = document.getElementById(`badge-card-${i}`);
        const badgeKey = `badge${i}`;
        
        if (card) {
            if (squadState.badges[badgeKey]) {
                card.classList.add('active');
                activeCount++;
            } else {
                card.classList.remove('active');
            }
        }
    }
    
    // Update active count display
    const countEl = document.getElementById('active-badges-count');
    if (countEl) {
        countEl.textContent = activeCount;
    }
}



// ========================================
// SQUAD BUILDER FILTER PANEL FUNCTIONS
// ========================================

// Toggle filter panel visibility
// Toggle filter panel visibility
function toggleSquadFilterPanel() {
  const panel = document.getElementById('squad-filter-panel');
  const trigger = document.getElementById('squad-filter-trigger');
  
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    // Open panel - position it RIGHT BELOW the Filters button
    const triggerRect = trigger.getBoundingClientRect();
    const modalRect = document.getElementById('squad-builder-modal').getBoundingClientRect();
    
    // Calculate position relative to modal container
    const topPosition = triggerRect.bottom - modalRect.top + 5; // 5px gap below button
    const leftPosition = triggerRect.right - modalRect.left - 190; // Align right edge (320px = panel width)
    
    panel.style.display = 'block';
    panel.style.top = `${topPosition}px`;
    panel.style.left = `${leftPosition}px`;
    
    console.log('[FILTER PANEL] Opened below Filters button');
  } else {
    // Close panel
    panel.style.display = 'none';
    console.log('[FILTER PANEL] Closed');
  }
}

// Cancel filters - just close panel without applying
function cancelSquadFilters() {
  const panel = document.getElementById('squad-filter-panel');
  if (panel) {
    panel.style.display = 'none';
  }
  console.log('[FILTER PANEL] Cancelled');
}

// Apply filters - update state and fetch filtered players
function applySquadFilters() {
    console.log('🔵 [FILTER PANEL] Applying filters...');
    
    // DEBUG: Get input elements first
    const ratingMinInput = document.getElementById('squad-rating-min');
    const ratingMaxInput = document.getElementById('squad-rating-max');
    
    console.log('🔍 OVR DEBUG: Min input element:', ratingMinInput);
    console.log('🔍 OVR DEBUG: Max input element:', ratingMaxInput);
    console.log('🔍 OVR DEBUG: Min value:', ratingMinInput?.value);
    console.log('🔍 OVR DEBUG: Max value:', ratingMaxInput?.value);
    
    // Get filter values from UI
    const position = document.getElementById('squad-filter-position')?.value || '';
    const ratingMin = parseInt(ratingMinInput?.value || '40');
    const ratingMax = parseInt(ratingMaxInput?.value || '150');
    
    console.log('🔍 OVR DEBUG: Parsed ratingMin:', ratingMin);
    console.log('🔍 OVR DEBUG: Parsed ratingMax:', ratingMax);
    
    const event = document.getElementById('squad-filter-event')?.value || '';
    const league = document.getElementById('squad-filter-league')?.value || '';
    const club = document.getElementById('squad-filter-club')?.value || '';
    const nation = document.getElementById('squad-filter-nation')?.value || '';
    const skill = document.getElementById('squad-filter-skill')?.value || '';
    
    // Update global state filters (reuse existing filter state)
    if (window.state && window.state.filters) {
        window.state.filters.position = position;
        window.state.filters.ratingMin = ratingMin;
        window.state.filters.ratingMax = ratingMax;
        console.log('✅ OVR DEBUG: Global state updated:', { ratingMin, ratingMax });
        window.state.filters.event = event;
        window.state.filters.league = league;
        window.state.filters.club = club;
        window.state.filters.nation = nation;
        window.state.filters.skillMoves = skill;
        
        console.log('✅ ALL FILTERS DEBUG: Complete state:', window.state.filters);
    }
    
    // Trigger the picker fetch with new filters
    console.log('🚀 Calling fetchPlayersForPicker...');
    fetchPlayersForPicker();
    
    // Close the panel
    const panel = document.getElementById('squad-filter-panel');
    if (panel) panel.style.display = 'none';
    
    console.log('✅ [FILTER PANEL] Filters applied:', { position, ratingMin, ratingMax, event, league, club, nation, skill });
}



// Live update rating display
document.addEventListener('DOMContentLoaded', () => {
  const minInput = document.getElementById('squad-rating-min');
  const maxInput = document.getElementById('squad-rating-max');
  const display = document.getElementById('squad-rating-value');
  
  function updateRatingDisplay() {
    if (minInput && maxInput && display) {
      const min = minInput.value || 40;
      const max = maxInput.value || 150;
      display.textContent = `${min}-${max}`;
    }
  }
  
  if (minInput) minInput.addEventListener('input', updateRatingDisplay);
  if (maxInput) maxInput.addEventListener('input', updateRatingDisplay);
});



// ============================================
// SQUAD PLAYER CUSTOMIZATION FUNCTIONS
// ============================================

function getSquadRankOvrBonus(rankValue) {
    const normalizedRank = Math.min(Math.max(parseInt(rankValue || 0, 10), 0), 5);
    return normalizedRank;
}

function persistSquadCustomizationState(reason) {
    const playerKey = squadCustomizationState.playerId;
    if (!playerKey) return;

    const player = squadCustomizationState.player || getSquadPlayerById(playerKey);
    const snapshot = {
        selectedRank: getSquadRankOvrBonus(squadCustomizationState.selectedRank),
        trainingLevel: parseInt(squadCustomizationState.trainingLevel || 0, 10),
        selectedSkills: Array.isArray(squadCustomizationState.selectedSkills)
            ? [...squadCustomizationState.selectedSkills]
            : []
    };

    squadCustomizationState.savedByPlayer[playerKey] = snapshot;

    const rawBaseOvr = Number.isFinite(squadCustomizationState.baseOvr)
        ? parseInt(squadCustomizationState.baseOvr, 10)
        : parseInt(player?.ovr || player?.overall || 0, 10);
    const baseOvrValue = Number.isFinite(rawBaseOvr) ? rawBaseOvr : 0;
    const boostedOvr = baseOvrValue > 0 ? baseOvrValue + snapshot.selectedRank : baseOvrValue;
    const altPositions = getSquadPlayerAltPositions(player);

    const updates = {
        ...snapshot,
        baseOvr: baseOvrValue,
        boostedOvr
    };

    if (altPositions.length > 0) {
        updates.altPositions = altPositions;
    }

    setSquadPlayerCustomization(playerKey, updates, reason);
    console.log('SQUAD CUSTOM: Persisted customization state', {
        playerId: playerKey,
        reason,
        snapshot,
        boostedOvr
    });
}

window.verifySquadCustomizationOVR = function(baseOvr = 80) {
    const safeBase = parseInt(baseOvr || 0, 10);
    const results = [0, 1, 2, 3, 4, 5].map(rank => {
        const bonus = getSquadRankOvrBonus(rank);
        return { rank, bonus, ovr: safeBase > 0 ? safeBase + bonus : safeBase };
    });
    console.log('SQUAD CUSTOM TEST: OVR matrix', { baseOvr: safeBase, results });
    return results;
};

async function selectSquadRank(rankNumber, options = {}) {
    const normalizedRank = getSquadRankOvrBonus(rankNumber);
    console.log('SQUAD CUSTOM: Selecting rank:', normalizedRank);
    
    squadCustomizationState.selectedRank = normalizedRank;
    console.log('[RankOverlay] SquadBuilder:', squadCustomizationState.playerId, normalizedRank);
    if (!options.preserveSkills) {
        squadCustomizationState.selectedSkills = [];
    }

    updateSquadCustomizationMiniCard();
    updateSquadCardRankOverlay(squadCustomizationState.playerId, normalizedRank);
    
    document.querySelectorAll('.squad-rank-box').forEach(box => {
        const rank = parseInt(box.dataset.rank);
        if (rank === normalizedRank) {
            box.classList.add('selected');
            box.style.borderColor = normalizedRank === 1 ? 'rgba(59,214,113,0.6)' :
                                   normalizedRank === 2 ? 'rgba(99,102,241,0.6)' :
                                   normalizedRank === 3 ? 'rgba(139,92,246,0.6)' :
                                   normalizedRank === 4 ? 'rgba(255,184,107,0.6)' :
                                   'rgba(255,107,107,0.6)';
            box.style.boxShadow = `0 0 12px ${normalizedRank === 1 ? '#3BD671' : normalizedRank === 2 ? '#6366F1' : normalizedRank === 3 ? '#8B5CF6' : normalizedRank === 4 ? '#FFB86B' : '#FF6B6B'}50`;
        } else {
            box.classList.remove('selected');
            box.style.borderColor = 'rgba(255,255,255,0.1)';
            box.style.boxShadow = 'none';
        }
    });
    
    const skillPoints = normalizedRank;
    const pointsDisplay = document.getElementById('squad-skill-points-display');
    if (pointsDisplay) {
        pointsDisplay.textContent = `${skillPoints} Point${skillPoints !== 1 ? 's' : ''}`;
    }
    
    renderSquadSkillsMessage('Loading skills...');
    await renderSquadPlayerSkills();
    
    persistSquadCustomizationState('rank-change');
}


function resetSquadPlayerRank() {
    console.log('SQUAD CUSTOM: Resetting rank');
    
    squadCustomizationState.selectedRank = 0;
    squadCustomizationState.selectedSkills = [];
    squadCustomizationState.trainingLevel = 0;
    console.log('[RankOverlay] SquadBuilder:', squadCustomizationState.playerId, 0);
    
    document.querySelectorAll('.squad-rank-box').forEach(box => {
        box.classList.remove('selected');
        box.style.borderColor = 'rgba(255,255,255,0.1)';
        box.style.boxShadow = 'none';
    });
    
    const trainingSelect = document.getElementById('squad-training-level');
    if (trainingSelect) {
        trainingSelect.value = '0';
    }
    
    const pointsDisplay = document.getElementById('squad-skill-points-display');
    if (pointsDisplay) {
        pointsDisplay.textContent = '0 Points';
    }

    updateSquadCustomizationMiniCard();
    updateSquadCardRankOverlay(squadCustomizationState.playerId, 0);
    
    renderSquadSkillsMessage('Select a rank to view skills');
    
    persistSquadCustomizationState('rank-reset');
    if (squadCustomizationState.playerId) {
        setSquadPlayerCustomization(squadCustomizationState.playerId, {
            altPositionsUnlocked: []
        }, 'rank-reset');
    }

}


function updateSquadTraining(level) {
    console.log('SQUAD CUSTOM: Training level set to:', level);
    
    squadCustomizationState.trainingLevel = parseInt(level);

    persistSquadCustomizationState('training-change');
    
}



async function openSquadPlayerStatsView() {
    console.log('SQUAD CUSTOM: Opening stats view');
    const modal = document.getElementById('squad-player-customization-modal');
    const statsView = document.getElementById('squad-stats-view');
    const statsContent = document.getElementById('squad-stats-content');
    if (!modal || !statsView || !statsContent) return;

    modal.classList.add('stats-mode');
    statsView.style.display = 'block';
    statsContent.innerHTML = '<div style="color: #98A0A6; text-align: center; padding: 20px;">Loading stats...</div>';

    const playerId = squadCustomizationState.playerId;
    const rank = squadCustomizationState.selectedRank || 0;
    const trainingLevel = squadCustomizationState.trainingLevel || 0;

    if (!playerId || !rank || !window.apiClient) {
        statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Stats unavailable</div>';
        return;
    }

    try {
        const detailsResponse = await window.apiClient.getPlayerDetails(playerId, rank, { cache: false });
        const basePlayer = getPlayers().find(p => p.player_id === playerId || p.id === playerId) || {};
        const mergedPlayer = {
            ...basePlayer,
            ...(detailsResponse.player || {}),
            player_id: basePlayer.player_id || basePlayer.id || detailsResponse.player?.player_id || playerId,
            rank: rank,
            skills: detailsResponse.skills || [],
            available_skill_points: detailsResponse.available_skill_points
        };

        let userAllocations = [];
        const userId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;
        if (userId && typeof window.apiClient.getUserSkillAllocations === 'function') {
            const response = await window.apiClient.getUserSkillAllocations(userId, mergedPlayer.player_id, rank);
            userAllocations = response.allocations || [];
        }

        const skillBoosts = typeof calculateSkillBoosts === 'function'
            ? await calculateSkillBoosts(userAllocations)
            : {};

        const trainingBoosts = typeof getTrainingBoosts === 'function'
            ? await getTrainingBoosts(mergedPlayer.position, trainingLevel)
            : null;

        mergedPlayer.training_level = trainingLevel;
        mergedPlayer.training_boosts = typeof mergeBoosts === 'function'
            ? mergeBoosts(trainingBoosts, skillBoosts)
            : (trainingBoosts || {});

        console.log('SQUAD CUSTOM: Stats boosts', { trainingBoosts, skillBoosts });

        if (typeof window.renderPlayerStatsSection === 'function') {
            statsContent.innerHTML = window.renderPlayerStatsSection(mergedPlayer);
        } else {
            statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Stats renderer unavailable</div>';
        }
    } catch (error) {
        console.error('[SQUAD STATS] Error loading stats:', error);
        statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Failed to load stats</div>';
    }
}

function closeSquadPlayerStatsView() {
    console.log('SQUAD CUSTOM: Closing stats view');
    const modal = document.getElementById('squad-player-customization-modal');
    const statsView = document.getElementById('squad-stats-view');
    if (statsView) statsView.style.display = 'none';
    if (modal) modal.classList.remove('stats-mode');
}

function renderSquadSkillsMessage(message) {
    const container = document.getElementById('squad-custom-skills');
    if (!container) return;
    container.innerHTML = `<p style="color: #98A0A6; text-align: center;">${message}</p>`;
}

function ensureSquadSkillDetailModal() {
    const modal = document.getElementById('skill-detail-modal');
    if (!modal) return;
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
}

async function renderSquadPlayerSkills() {
    const container = document.getElementById('squad-custom-skills');
    if (!container) return;

    ensureSquadSkillDetailModal();

    const playerId = squadCustomizationState.playerId;
    const rank = squadCustomizationState.selectedRank || 0;

    if (!playerId || !rank) {
        renderSquadSkillsMessage('Select a rank to view skills');
        return;
    }

    if (!window.apiClient || typeof window.apiClient.getPlayerDetails !== 'function') {
        renderSquadSkillsMessage('Skills unavailable');
        return;
    }

    let detailsResponse;
    try {
        detailsResponse = await window.apiClient.getPlayerDetails(playerId, rank, { cache: false });
    } catch (error) {
        console.error('[SQUAD SKILLS] Error loading skills:', error);
        renderSquadSkillsMessage('Failed to load skills');
        return;
    }

    const basePlayer = getPlayers().find(p => p.player_id === playerId || p.id === playerId) || {};
    const mergedPlayer = {
        ...basePlayer,
        ...(detailsResponse.player || {}),
        player_id: basePlayer.player_id || basePlayer.id || detailsResponse.player?.player_id || playerId,
        rank: rank,
        skills: detailsResponse.skills || [],
        available_skill_points: detailsResponse.available_skill_points
    };

    squadCustomizationState.player = mergedPlayer;
    if (window.state) {
        window.state.selectedPlayer = mergedPlayer;
    }

    const availableSkills = mergedPlayer.skills || [];
    console.log("Available skills length:", availableSkills.length);

    const availablePoints = mergedPlayer.available_skill_points || rank || 0;
    const pointsDisplay = document.getElementById('squad-skill-points-display');
    if (pointsDisplay) {
        pointsDisplay.textContent = `${availablePoints} Point${availablePoints !== 1 ? 's' : ''}`;
    }

    if (availableSkills.length === 0) {
        renderSquadSkillsMessage('No skills available');
        return;
    }

    let userAllocations = [];
    const userId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;
    if (userId && typeof window.apiClient.getUserSkillAllocations === 'function') {
        try {
            const response = await window.apiClient.getUserSkillAllocations(
                userId,
                mergedPlayer.player_id,
                rank
            );
            userAllocations = response.allocations || [];
        } catch (error) {
            console.error('[SQUAD SKILLS] Error fetching allocations:', error);
        }
    }

    const allocationMap = {};
    userAllocations.forEach(a => {
      allocationMap[a.skill_id] = a.skill_level;
    });

    const playerKey = resolveSquadPlayerId(mergedPlayer);
    const altPositions = getSquadPlayerAltPositions(mergedPlayer);
    const hasAltUnlock = altPositions.length > 0 && Object.values(allocationMap).some(level => (level || 0) >= 2);
    const unlockedAltPositions = hasAltUnlock ? altPositions : [];
    if (playerKey) {
        setSquadPlayerCustomization(playerKey, {
            altPositions,
            altPositionsUnlocked: unlockedAltPositions
        }, 'alt-position-sync');
        console.log('[SQUAD ALT] Alt position unlock state', {
            playerId: playerKey,
            unlocked: unlockedAltPositions
        });
    }

    const pointsSpent = userAllocations.reduce((sum, a) => sum + a.skill_level, 0);
    const pointsRemaining = availablePoints - pointsSpent;

    const maxLevels = typeof calculateMaxLevels === 'function'
        ? calculateMaxLevels(availableSkills)
        : {};

    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    container.style.gap = '12px';
    container.innerHTML = '';
    availableSkills.forEach(skill => {
        const currentLevel = allocationMap[skill.skill_id] || 0;
        const isUnlocked = typeof checkIfSkillUnlocked === 'function'
            ? checkIfSkillUnlocked(skill, allocationMap, availableSkills)
            : true;

        if (typeof createSkillCard === 'function') {
            const card = createSkillCard(skill, currentLevel, isUnlocked, pointsRemaining, mergedPlayer, maxLevels);
            card.style.minHeight = '120px';
            card.style.pointerEvents = isUnlocked ? 'auto' : 'none';
            container.appendChild(card);
        } else {
            const fallbackCard = document.createElement('div');
            fallbackCard.className = `skill-card ${!isUnlocked ? 'locked' : ''}`;
            fallbackCard.textContent = skill.skill_name || 'Skill';
            container.appendChild(fallbackCard);
        }
    });
}




function removeSquadPlayer() {
    console.log('SQUAD CUSTOM: Removing player from slot:', squadCustomizationState.slotId);
    
    const slotId = squadCustomizationState.slotId;
    
    if (slotId) {
        if (slotId.startsWith('BENCH')) {
            const index = parseInt(slotId.split('BENCH')[1], 10);
            squadState.bench[index] = null;
        } else {
            delete squadState.starters[slotId];
        }
    }
    
    renderSquadBuilder();
    closePlayerCustomizationModal();
}



function applySquadPlayerCustomization() {
    console.log('SQUAD CUSTOM: Applying customization:', squadCustomizationState);
    
    const rank = squadCustomizationState.selectedRank || 0;
    const training = squadCustomizationState.trainingLevel || 0;
    const skills = squadCustomizationState.selectedSkills || [];

    closePlayerCustomizationModal();
}

function openPlayerCustomizationModal(playerId, slotId) {
  console.log('DEBUG: openPlayerCustomizationModal CALLED');
  console.log('DEBUG: playerId:', playerId);
  console.log('DEBUG: slotId:', slotId);

  const resolvedPlayerId = playerId || squadState.lastAssignedPlayerId || squadState.dragging || null;
  const player = getPlayers().find(p => p.player_id === resolvedPlayerId || p.id === resolvedPlayerId);
  const storedCustomization = resolvedPlayerId ? getSquadPlayerCustomization(resolvedPlayerId) : null;
  const savedCustomization = storedCustomization || (resolvedPlayerId ? squadCustomizationState.savedByPlayer?.[resolvedPlayerId] : null);
  const fallbackRank = getSquadRankOvrBonus(player?.rank);
  const restoredRank = savedCustomization ? getSquadRankOvrBonus(savedCustomization.selectedRank) : fallbackRank;
  const restoredTraining = savedCustomization ? parseInt(savedCustomization.trainingLevel || 0, 10) : 0;
  const restoredSkills = savedCustomization && Array.isArray(savedCustomization.selectedSkills)
      ? [...savedCustomization.selectedSkills]
      : [];

  squadCustomizationState.playerId = resolvedPlayerId;
  squadCustomizationState.slotId = slotId;
  squadCustomizationState.selectedRank = restoredRank;
  squadCustomizationState.trainingLevel = Number.isFinite(restoredTraining) ? restoredTraining : 0;
  squadCustomizationState.selectedSkills = restoredSkills;
  squadCustomizationState.player = null;

  if (savedCustomization) {
      console.log('SQUAD CUSTOM: Restored customization state', {
          playerId: resolvedPlayerId,
          selectedRank: squadCustomizationState.selectedRank,
          trainingLevel: squadCustomizationState.trainingLevel,
          selectedSkills: squadCustomizationState.selectedSkills
      });
  }

  const modal = document.getElementById('squad-player-customization-modal');

  if (!modal) {
    console.error('Modal not found!');
    return;
  }

  // Render mini card preview
  const storedBaseOvr = Number.isFinite(savedCustomization?.baseOvr)
      ? parseInt(savedCustomization.baseOvr, 10)
      : null;
  squadCustomizationState.baseOvr = Number.isFinite(storedBaseOvr)
      ? storedBaseOvr
      : (player?.ovr || player?.overall || 0);
  squadCustomizationState.basePosition = player?.position || 'N/A';
  squadCustomizationState.baseName = player?.name || 'Unknown Player';
  squadCustomizationState.baseColors = {
    color_rating: player?.color_rating || '#FFFFFF',
    color_position: player?.color_position || '#FFFFFF',
    color_name: player?.color_name || '#FFFFFF'
  };
  renderCustomizationMiniCard(player);

  ensureSquadSkillDetailModal();

  const trainingSelect = document.getElementById('squad-training-level');
  if (trainingSelect) {
      trainingSelect.value = `${squadCustomizationState.trainingLevel || 0}`;
  }

  if (squadCustomizationState.selectedRank > 0) {
      selectSquadRank(squadCustomizationState.selectedRank, {
          showToast: false,
          preserveSkills: !!savedCustomization
      });
  } else {
      document.querySelectorAll('.squad-rank-box').forEach(box => {
          box.classList.remove('selected');
          box.style.borderColor = 'rgba(255,255,255,0.1)';
          box.style.boxShadow = 'none';
      });
      const pointsDisplay = document.getElementById('squad-skill-points-display');
      if (pointsDisplay) {
          pointsDisplay.textContent = '0 Points';
      }
      updateSquadCustomizationMiniCard();
      renderSquadSkillsMessage('Select a rank to view skills');
  }

  closeSquadPlayerStatsView();

  modal.classList.remove('is-visible');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
      modal.classList.add('is-visible');
  });
}


function closePlayerCustomizationModal() {
    const modal = document.getElementById('squad-player-customization-modal');
    if (modal) {
        persistSquadCustomizationState('close');
        modal.classList.remove('is-visible');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (typeof closeSkillDetailModal === 'function') {
        closeSkillDetailModal();
    }
    closeSquadPlayerStatsView();
    if (typeof renderSquadBuilder === 'function') {
        renderSquadBuilder();
    }
}

// ==================== NATION FILTER AUTOCOMPLETE ====================
let allNations = []; // Cache for nations
let nationFilterTimeout = null;

// Fetch all nations from API on page load
async function loadNationsForSquadBuilder() {
    try {
        console.log('🌍 [SQUAD BUILDER] Fetching nations from API...');
        if (!window.apiClient || typeof window.apiClient.getNations !== 'function') {
            console.warn('âš ï¸ [SQUAD BUILDER] apiClient.getNations unavailable, falling back to COUNTRIES');
            if (typeof COUNTRIES !== 'undefined' && Array.isArray(COUNTRIES)) {
                allNations = COUNTRIES.slice();
                return;
            }
            allNations = [];
            return;
        }

        const response = await window.apiClient.getNations();
        
        // API returns {nations: Array(176)}
        allNations = response.nations || response || [];
        
        console.log('✅ [SQUAD BUILDER] Loaded', allNations.length, 'nations');
    } catch (error) {
        console.error('❌ [SQUAD BUILDER] Failed to load nations:', error);
        allNations = [];
    }
}

// Filter and display nations based on input
function filterNations(query) {
    const dropdown = document.getElementById('squad-filter-nation-list');
    if (!dropdown) return;

    // Clear previous results
    dropdown.innerHTML = '';

    if (!query || query.length < 1) {
        dropdown.style.display = 'none';
        return;
    }

    // If nations not loaded yet, show loading message
    if (allNations.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-item" style="color: #888; padding: 10px;">Loading countries...</div>';
        dropdown.style.display = 'block';
        loadNationsForSquadBuilder(); // Try loading again
        return;
    }

    // Filter nations (case-insensitive)
    const matches = allNations.filter(nation => 
        nation.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-item" style="color: #888; padding: 10px; cursor: default;">No countries found</div>';
        dropdown.style.display = 'block';
        return;
    }

    // Display up to 10 matches
    matches.slice(0, 10).forEach(nation => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = nation;
        item.style.cssText = 'cursor: pointer; padding: 10px 14px; color: #fff;';
        
        // Hover effect
        item.onmouseenter = () => item.style.background = 'rgba(99, 102, 241, 0.3)';
        item.onmouseleave = () => item.style.background = 'transparent';
        
        // Click handler - select nation
        item.onclick = () => {
            const input = document.getElementById('squad-filter-nation');
            if (input) input.value = nation;
            dropdown.style.display = 'none';
            
            // Update filter state
            state.filters.nation = nation;
            console.log('🌍 [SQUAD BUILDER] Nation selected:', nation);
            
            // Trigger filter update
            fetchPlayersForPicker();
        };
        
        dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
}

// Initialize nation autocomplete
function initSquadNationFilter() {
    const nationInput = document.getElementById('squad-filter-nation');
    
    if (!nationInput) {
        console.warn('⚠️ Nation input not found');
        return;
    }
    
    console.log('✅ [SQUAD BUILDER] Initializing nation filter');
    
    // Load nations from API
    loadNationsForSquadBuilder();
    
    // Listen for input changes (debounced)
    nationInput.addEventListener('input', (e) => {
        clearTimeout(nationFilterTimeout);
        nationFilterTimeout = setTimeout(() => {
            filterNations(e.target.value.trim());
        }, 200);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('squad-filter-nation-list');
        if (dropdown && !nationInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Call initialization when squad builder is opened
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSquadNationFilter);
} else {
    // If DOM already loaded, init immediately
    initSquadNationFilter();
}

// ==================== AUCTIONABLE TOGGLE ====================
function initSquadAuctionableToggle() {
    const toggle = document.getElementById('squad-auctionable-toggle');
    const statusText = document.getElementById('squad-auction-status-text');
    
    if (!toggle || !statusText) {
        console.warn('⚠️ [SQUAD FILTER] Auctionable toggle elements not found');
        return;
    }
    
    console.log('✅ [SQUAD FILTER] Initializing auctionable toggle');
    
    toggle.addEventListener('change', (e) => {
        console.log('🏷️ [SQUAD FILTER] Toggle changed:', e.target.checked);
        
        // Update status text
        if (e.target.checked) {
            statusText.textContent = 'Only With Prices';
        } else {
            statusText.textContent = 'All Players';
        }
        
        // Re-fetch players with new filter
        fetchPlayersForPicker();
    });
}

// Initialize when squad builder loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSquadAuctionableToggle);
} else {
    initSquadAuctionableToggle();
}


// ============================================
// RENDER MINI CARD IN CUSTOMIZATION MODAL
// ============================================
function renderCustomizationMiniCard(player) {
  const container = document.getElementById('squad-custom-player-card');
  if (!container) return;

  if (!player) {
    container.innerHTML = '<p style="color: #888;">Player not found</p>';
    return;
  }

  // Normalize player data
  const cardBg = player.card_background || player.cardBackground || player.cardbackground || 'https://via.placeholder.com/180x240';
  const playerImg = player.player_image || player.playerImage || player.playerimage || player.playerimg || 'https://via.placeholder.com/120x120';
  const playerName = player.name || 'Unknown Player';
  const overall = player.ovr || player.overall || 0;
  const position = player.position || 'N/A';
  const nationFlag = player.nation_flag || player.nationFlag || player.nationflag || '';
  const clubFlag = player.club_flag || player.clubFlag || player.clubflag || '';
  const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
  const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
  const untradableBadgeHTML = isUntradable
    ? `<div class="card-untradable-badge" style="pointer-events: none;">
         <img src="assets/images/untradable_img.png" alt="Untradable">
       </div>`
    : '';

  // OVR color based on rating
  let ovrColor = '#FFFFFF';
  if (overall >= 90) ovrColor = '#FFD700'; // Gold
  else if (overall >= 80) ovrColor = '#00C2A8'; // Teal
  else if (overall >= 70) ovrColor = '#FFB86B'; // Orange

  // Build the mini card HTML
  container.innerHTML = `
    <div class="squad-custom-mini-card">
      <img src="${cardBg}" alt="Card Background" class="squad-custom-card-bg" onerror="this.src='https://via.placeholder.com/180x240'">
      <img src="${playerImg}" alt="${playerName}" class="squad-custom-card-player-img" onerror="this.style.display='none'">
      <div class="squad-custom-card-ovr" style="color: ${player.color_rating || '#FFFFFF'}">${overall > 0 ? overall : 'N/A'}</div>
      <div class="squad-custom-card-position" style="color: ${player.color_position || '#FFFFFF'}">${position}</div>



      <div class="squad-custom-card-flags">
        ${nationFlag 
          ? `<img src="${nationFlag}" 
                alt="Nation" 
                class="squad-modal-custom-card-flag ${getPlayerType(player) === 'normal' 
                  ? 'normal-modal-nation-flag' 
                  : 'hero-icon-modal-nation-flag'}" 
                onerror="this.style.display='none'">` 
          : ''}
        ${clubFlag 
          ? `<img src="${clubFlag}" 
                alt="Club" 
                class="squad-modal-custom-card-club ${getPlayerType(player) === 'normal' 
                  ? 'normal-modal-club-flag' 
                  : 'hero-icon-modal-club-flag'}" 
                onerror="this.style.display='none'">` 
          : ''}
        

        ${getPlayerType(player) === 'normal' && player.league_image ? `
            <img src="${player.league_image}" 
                 alt="League" 
                 class="squad-modal-custom-card-league normal-modal-league-flag"
                 onerror="this.style.display='none'">
        ` : ''}
      </div>


      <div class="squad-custom-card-name" style="color: ${player.color_name || '#FFFFFF'}">${playerName}</div>
      ${untradableBadgeHTML}
    </div>
  `;
  if (typeof applyRankOverlay === 'function') {
    const rankValue = squadCustomizationState.selectedRank || player?.rank || 0;
    applyRankOverlay(container.querySelector('.squad-custom-mini-card'), rankValue, {
      scope: 'squad-builder',
      modifierClass: 'rank-overlay--squad-customization'
    });
  }
}

function updateSquadCustomizationMiniCard() {
  const container = document.getElementById('squad-custom-player-card');
  if (!container) return;

  const ovrEl = container.querySelector('.squad-custom-card-ovr');
  const positionEl = container.querySelector('.squad-custom-card-position');
  const nameEl = container.querySelector('.squad-custom-card-name');

  if (!ovrEl || !positionEl || !nameEl) return;

  const baseOvr = squadCustomizationState.baseOvr ?? 0;
  const basePosition = squadCustomizationState.basePosition || 'N/A';
  const baseName = squadCustomizationState.baseName || 'Unknown Player';
  const colors = squadCustomizationState.baseColors || {};

  const rankBonus = getSquadRankOvrBonus(squadCustomizationState.selectedRank);
  const updatedOvr = baseOvr > 0 ? baseOvr + rankBonus : baseOvr;
  console.log('SQUAD CUSTOM: OVR recalculated', { baseOvr, rankBonus, updatedOvr });

  ovrEl.textContent = updatedOvr > 0 ? updatedOvr : 'N/A';
  positionEl.textContent = basePosition;
  nameEl.textContent = baseName;

  if (colors.color_rating) ovrEl.style.color = colors.color_rating;
  if (colors.color_position) positionEl.style.color = colors.color_position;
  if (colors.color_name) nameEl.style.color = colors.color_name;
  if (typeof applyRankOverlay === 'function') {
    applyRankOverlay(container.querySelector('.squad-custom-mini-card'), squadCustomizationState.selectedRank || 0, {
      scope: 'squad-builder',
      modifierClass: 'rank-overlay--squad-customization'
    });
  }
}

/**
 * Calculate total squad value
 */
function calculateValue() {
    let total = 0;
    const parseOptionalBoolean = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const normalized = String(value).trim().toLowerCase();
        if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
        if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
        return null;
    };
    const shouldIncludePlayerValue = (player) => {
        const untradable = parseOptionalBoolean(player.is_untradable ?? player.isuntradable ?? player.untradable);
        const unauctionable = parseOptionalBoolean(player.is_unauctionable ?? player.unauctionable);
        const tradable = parseOptionalBoolean(player.tradable);
        const auctionable = parseOptionalBoolean(player.auctionable);
        const isTradable = tradable !== null ? tradable : (untradable !== null ? !untradable : true);
        const isAuctionable = auctionable !== null ? auctionable : (unauctionable !== null ? !unauctionable : (untradable !== null ? !untradable : true));
        return isTradable && isAuctionable;
    };
    
    // Sum starter values
    Object.values(squadState.starters).forEach(pid => {
        if (!pid) return;
        const player = getPlayers().find(p => 
            p.id === pid || p.playerid === pid || p.player_id === pid
        );
        if (player && shouldIncludePlayerValue(player)) {
            total += resolveSquadPlayerPrice(player);
        }
    });
    
    // Sum bench values
    squadState.bench.forEach(pid => {
        if (!pid) return;
        const player = getPlayers().find(p => 
            p.id === pid || p.playerid === pid || p.player_id === pid
        );
        if (player && shouldIncludePlayerValue(player)) {
            total += resolveSquadPlayerPrice(player);
        }
    });
    
    return total;
}

/**
 * Format price for display
 */
function formatPrice(price) {
    if (!price || price === 0) return '0';
    
    if (price >= 1000000) {
        return (price / 1000000).toFixed(2) + 'M';
    } else if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'K';
    }
    
    return price.toString();
}


// Global Exports
window.openSquadBuilderModal = openSquadBuilderModal;
window.closeSquadBuilderModal = closeSquadBuilderModal;
window.changeFormation = function(id) { squadState.formationId = id; renderSquadBuilder(); };
window.updatePickerSearch = updatePickerSearch;
window.clearSquadFilters = clearSquadFilters;
window.applyFiltersToPickerPlayers = applyFiltersToPickerPlayers;
// Export functions to global scope
window.openBadgesModal = openBadgesModal;
window.closeBadgesModal = closeBadgesModal;
window.toggleBadge = toggleBadge;
// Export to global scope
window.toggleSquadFilterPanel = toggleSquadFilterPanel;
window.resolveSquadPlayerPrice = resolveSquadPlayerPrice;
window.cancelSquadFilters = cancelSquadFilters;
window.applySquadFilters = applySquadFilters;
// Squad Customization Exports
window.selectSquadRank = selectSquadRank;
window.resetSquadPlayerRank = resetSquadPlayerRank;
window.updateSquadTraining = updateSquadTraining; 
window.openPlayerCustomizationModal = openPlayerCustomizationModal;
window.closePlayerCustomizationModal = closePlayerCustomizationModal;
window.removeSquadPlayer = removeSquadPlayer;
window.applySquadPlayerCustomization = applySquadPlayerCustomization;
window.openSquadPlayerStatsView = openSquadPlayerStatsView;
window.closeSquadPlayerStatsView = closeSquadPlayerStatsView;


// ============================================
// 🐛 DEBUG: Check if functions are loaded. that's all
// ============================================
console.log('🔍 DEBUG: squadBuilder.js loaded');
console.log('🔍 DEBUG: openPlayerCustomizationModal exists?', typeof window.openPlayerCustomizationModal);
console.log('🔍 DEBUG: closePlayerCustomizationModal exists?', typeof window.closePlayerCustomizationModal);
console.log('🔍 DEBUG: selectSquadRank exists?', typeof window.selectSquadRank);
console.log('🔍 DEBUG: Modal element exists?', !!document.getElementById('squad-player-customization-modal'));




/* ===== assets/js/views/squadBuilder-saveload.js ===== */

// ============================================
// SQUAD SAVE/LOAD SYSTEM
// ============================================
// This file contains save/load functionality for the Squad Builder
// Add this to your squadBuilder.js or include it as a separate script

/**
 * Calculate total squad value
 */
function calculateValue() {
    let total = 0;
    const missing = [];
    const parseOptionalBoolean = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const normalized = String(value).trim().toLowerCase();
        if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
        if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
        return null;
    };
    const shouldIncludePlayerValue = (player) => {
        const untradable = parseOptionalBoolean(player.is_untradable ?? player.isuntradable ?? player.untradable);
        const unauctionable = parseOptionalBoolean(player.is_unauctionable ?? player.unauctionable);
        const tradable = parseOptionalBoolean(player.tradable);
        const auctionable = parseOptionalBoolean(player.auctionable);
        const isTradable = tradable !== null ? tradable : (untradable !== null ? !untradable : true);
        const isAuctionable = auctionable !== null ? auctionable : (unauctionable !== null ? !unauctionable : (untradable !== null ? !untradable : true));
        return isTradable && isAuctionable;
    };
    
    // Sum starter values
    Object.values(squadState.starters).forEach(pid => {
        if (!pid) return;
        const player = getPlayers().find(p => 
            p.id === pid || p.playerid === pid || p.player_id === pid
        );
        if (player && shouldIncludePlayerValue(player)) {
            const price = typeof resolveSquadPlayerPrice === 'function'
                ? resolveSquadPlayerPrice(player)
                : (player.price || 0);
            total += price;
        } else {
            missing.push(pid);
        }
    });
    
    // Sum bench values
    squadState.bench.forEach(pid => {
        if (!pid) return;
        const player = getPlayers().find(p => 
            p.id === pid || p.playerid === pid || p.player_id === pid
        );
        if (player && shouldIncludePlayerValue(player)) {
            const price = typeof resolveSquadPlayerPrice === 'function'
                ? resolveSquadPlayerPrice(player)
                : (player.price || 0);
            total += price;
        } else {
            missing.push(pid);
        }
    });
    
    console.log('[SQUAD VALUE] Total:', total, 'Missing:', missing.length ? missing : 'none');
    return total;
}

/**
 * Format price for display
 */
function formatPrice(price) {
    if (!price || price === 0) return '0';
    
    if (price >= 1000000) {
        return (price / 1000000).toFixed(2) + 'M';
    } else if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'K';
    }
    
    return price.toString();
}

/**
 * Save current squad to localStorage
 */
function saveSquad() {
    try {
        // Prepare squad data object
        const squadData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            name: squadState.name || 'My Squad',
            formationId: squadState.formationId || '4-3-3',
            starters: { ...squadState.starters },
            bench: [...squadState.bench],
            badges: { ...squadState.badges },
            playerCustomizations: { ...(squadState.playerCustomizations || {}) },
            teamOVR: getFinalTeamOVR(),
            teamValue: calculateValue(),
            fieldTheme: localStorage.getItem('selectedFieldTheme') || 'stadium-blue'
        };

        // Save to localStorage
        localStorage.setItem('savedSquad_main', JSON.stringify(squadData));
        
        console.log('✅ Squad saved successfully:', squadData);
        
        return true;
    } catch (error) {
        console.error('❌ Error saving squad:', error);
        return false;
    }
}

/**
 * Load squad from localStorage
 */
function loadSquad() {
    try {
        // Get saved data
        const savedData = localStorage.getItem('savedSquad_main');
        
        if (!savedData) {
            return false;
        }

        // Parse saved data
        const squadData = JSON.parse(savedData);
        
        console.log('📥 Loading squad:', squadData);

        // Restore squad state
        squadState.name = squadData.name || 'My Squad';
        squadState.formationId = squadData.formationId || '4-3-3';
        squadState.starters = squadData.starters || {};
        squadState.bench = squadData.bench || [];
        squadState.badges = squadData.badges || { badge1: false, badge2: false, badge3: false };
        squadState.playerCustomizations = squadData.playerCustomizations || {};

        if (window.squadCustomizationState) {
            window.squadCustomizationState.savedByPlayer = { ...squadState.playerCustomizations };
        }

        // Restore field theme if saved
        if (squadData.fieldTheme) {
            localStorage.setItem('selectedFieldTheme', squadData.fieldTheme);
            if (typeof applyTheme === 'function') {
                applyTheme(squadData.fieldTheme);
            }
        }

        // Re-render the squad builder
        renderSquadBuilder();
        
        console.log('✅ Squad loaded successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Error loading squad:', error);
        return false;
    }
}

/**
 * Check if a saved squad exists
 */
function hasSavedSquad() {
    return localStorage.getItem('savedSquad_main') !== null;
}

/**
 * Delete saved squad
 */
function deleteSavedSquad() {
    try {
        localStorage.removeItem('savedSquad_main');
        console.log('🗑️ Saved squad deleted');
        return true;
    } catch (error) {
        console.error('❌ Error deleting saved squad:', error);
        return false;
    }
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateValue,
        formatPrice,
        saveSquad,
        loadSquad,
        hasSavedSquad,
        deleteSavedSquad
    };
}




/* ===== assets/js/views/squadBuilder-export.js ===== */

// ============================================
// SQUAD EXPORT SYSTEM (Screenshot to Image)
// ============================================
// Capture squad formation as image and download to PC

/**
 * Export squad as image using html2canvas
 * Captures the squad field and downloads as PNG
 */
async function exportSquad() {
    let exportRoot = null;
    try {
        exportLiveImageDataUrlCache.clear();
        console.info('[EXPORT] Pipeline version', '2026-02-20-cors-hangfix-v2');
        console.info('EXPORT_START', { formationId: squadState?.formationId });
        console.log('📸 Starting squad export...');
        
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded. Please include the library.');
        }

        const squadField = document.getElementById('squad-field');
        if (!squadField) {
            throw new Error('Squad field not found');
        }

        // Sync squad name from input
        const nameInput = document.getElementById('squad-name-input');
        if (nameInput) {
            squadState.name = (nameInput.value || '').trim() || squadState.name || 'My Squad';
        }

        const currentFormation = typeof getFormations === 'function' ? getFormations()[squadState.formationId] : null;
        if (!currentFormation) {
            throw new Error('Formation data not found');
        }

        const loadState = await waitForExportLoadState();
        const playersLoaded = loadState.playersLoaded;
        const subsLoaded = loadState.subsLoaded;

        if (!playersLoaded || !subsLoaded) {
            console.warn('[EXPORT] Export blocked: squad data not ready', loadState);
            return;
        }

        console.info('EXPORT_PLAYERS_LOADED', { starters: loadState.starterCount });
        console.info('EXPORT_SUBS_LOADED', { subs: loadState.benchCount });

        const exportPayload = buildExportSquadLayout(currentFormation);
        exportRoot = exportPayload.root;
        const backgroundUrl = exportPayload.backgroundUrl;

        document.body.appendChild(exportRoot);

        await waitForExportRenderCycle();
        const [mediaAudit] = await Promise.all([
            ensureExportImagesReady(exportRoot),
            preloadBackgroundImage(backgroundUrl)
        ]);
        if (mediaAudit?.missingRequired?.length) {
            console.warn('[EXPORT] Required media unresolved before capture', mediaAudit.missingRequired);
        }

        const renderedCardCount = countExportCards(exportRoot);
        console.info('EXPORT_RENDER_COMPLETE', { cards: renderedCardCount });

        const captureWidth = exportRoot.scrollWidth || exportRoot.offsetWidth;
        const captureHeight = exportRoot.scrollHeight || exportRoot.offsetHeight;
        const captureOptions = {
            backgroundColor: '#0a1628',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: false,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            width: captureWidth,
            height: captureHeight,
            x: 0,
            y: 0
        };

        console.log('📸 Capturing with options:', captureOptions);

        const canvas = await html2canvas(exportRoot, captureOptions);
        console.log('✅ Canvas captured:', canvas.width, 'x', canvas.height);
        const blob = await canvasToBlob(canvas, 'image/png');

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const squadName = squadState.name || 'My Squad';
        const filename = `${squadName.replace(/\s+/g, '_')}_${timestamp}.png`;

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log('✅ Squad exported:', filename);
        
    } catch (error) {
        console.error('❌ Error exporting squad:', error);
        console.error('[EXPORT][ROOT_CAUSE]', {
            message: error?.message || String(error),
            hint: 'Cross-origin media without CORS headers can block canvas export; rewritten URLs are logged as [EXPORT][CORS_REWRITE]'
        });
    } finally {
        if (exportRoot && exportRoot.isConnected) {
            exportRoot.remove();
        }
    }
}

function getExportLoadState() {
    const starters = Object.entries(squadState?.starters || {});
    const bench = Array.isArray(squadState?.bench) ? squadState.bench : [];
    const missingStarters = [];
    const missingBench = [];
    let starterCount = 0;
    let benchCount = 0;

    starters.forEach(([, pid]) => {
        if (!pid) return;
        starterCount += 1;
        const player = typeof getSquadPlayerById === 'function'
            ? getSquadPlayerById(pid)
            : getPlayers().find(p => p.id === pid || p.playerid === pid || p.player_id === pid);
        if (!player) missingStarters.push(pid);
    });

    bench.forEach(pid => {
        if (!pid) return;
        benchCount += 1;
        const player = typeof getSquadPlayerById === 'function'
            ? getSquadPlayerById(pid)
            : getPlayers().find(p => p.id === pid || p.playerid === pid || p.player_id === pid);
        if (!player) missingBench.push(pid);
    });

    return {
        playersLoaded: missingStarters.length === 0,
        subsLoaded: missingBench.length === 0,
        missingStarters,
        missingBench,
        starterCount,
        benchCount
    };
}

async function waitForExportLoadState(options = {}) {
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 2000;
    const intervalMs = Number.isFinite(options.intervalMs) ? options.intervalMs : 120;
    const start = Date.now();
    let state = getExportLoadState();

    while ((!state.playersLoaded || !state.subsLoaded) && (Date.now() - start < timeoutMs)) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        state = getExportLoadState();
    }

    return state;
}

function waitForExportRenderCycle() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

function canvasToBlob(canvas, mimeType = 'image/png') {
    return new Promise((resolve, reject) => {
        if (!canvas) {
            reject(new Error('Canvas is required'));
            return;
        }
        try {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create image blob (canvas may be tainted by CORS-restricted media)'));
                    return;
                }
                resolve(blob);
            }, mimeType);
        } catch (error) {
            reject(error);
        }
    });
}

function buildExportSquadLayout(currentFormation) {
    const exportRoot = document.createElement('div');
    exportRoot.id = 'squad-export-root';

    const wrapper = document.createElement('div');
    wrapper.className = 'squad-export-card';

    const header = document.createElement('div');
    header.className = 'squad-export-header';
    header.innerHTML = `
        <div class="squad-export-title">ZENITH</div>
        <div class="squad-export-subtitle">Football Squad Builder</div>
    `;

    const metaRow = document.createElement('div');
    metaRow.className = 'squad-export-meta';
    metaRow.innerHTML = `
        <div class="squad-export-team">TEAM: ${escapeHtml(squadState.name || 'My Squad')}</div>
        <div class="squad-export-ovr">OVR: ${getFinalTeamOVR() || 0}</div>
    `;

    const grid = document.createElement('div');
    grid.className = 'squad-export-grid';

    const leftCol = document.createElement('div');
    leftCol.className = 'squad-export-left';

    const pitchCard = document.createElement('div');
    pitchCard.className = 'squad-export-pitch-card';
    const backgroundUrl = applyExportThemeBackground(pitchCard);

    const pitchField = document.createElement('div');
    pitchField.className = 'squad-export-field';

    const pitchSlots = document.createElement('div');
    pitchSlots.className = 'squad-export-slots';

    currentFormation.slots.forEach(slot => {
        pitchSlots.appendChild(buildExportSlot(slot));
    });

    const bench = buildExportBench();

    pitchCard.appendChild(pitchField);
    pitchCard.appendChild(pitchSlots);
    leftCol.appendChild(pitchCard);
    leftCol.appendChild(bench);

    const rightCol = document.createElement('div');
    rightCol.className = 'squad-export-right';
    const rawValue = calculateValue() || 0;
    const squadValue = Number.isFinite(rawValue) ? rawValue : 0;
    console.info('EXPORT_VALUE_CALCULATED', { value: squadValue });
    rightCol.innerHTML = `
        <div class="squad-export-card-section">
            <div class="squad-export-card-title">Squad Value</div>
            <div class="squad-export-card-value">${formatPrice(squadValue)} Coins</div>
        </div>
        <div class="squad-export-card-section">
            <div class="squad-export-card-title">OVR</div>
            <div class="squad-export-card-value">${getFinalTeamOVR() || 0}</div>
        </div>
        <div class="squad-export-card-section">
            <div class="squad-export-card-title">Formation</div>
            <div class="squad-export-card-value">${formatFormationLabel(squadState.formationId)}</div>
        </div>
        <div class="squad-export-card-section">
            <div class="squad-export-card-title">Badges</div>
            <div class="squad-export-badges">${renderBadgeStars()}</div>
        </div>
        <div class="squad-export-card-section squad-export-qr-card">
            <div class="squad-export-card-title">QR Access</div>
            <img class="squad-export-qr" src="${getQrImageUrl()}" alt="QR code linking to zenithfcm.com" crossorigin="anonymous">
            <div class="squad-export-qr-text">CHECK SQUAD</div>
        </div>
        <div class="squad-export-card-section">
            <div class="squad-export-card-title">Zenith Engine</div>
            <div class="squad-export-card-subtitle">Squad Analytics</div>
        </div>
    `;

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);

    wrapper.appendChild(header);
    wrapper.appendChild(metaRow);
    wrapper.appendChild(grid);
    exportRoot.appendChild(wrapper);

    return { root: exportRoot, backgroundUrl };
}

function renderBadgeStars() {
    const activeBadges = Object.values(squadState.badges || {}).filter(Boolean).length;
    const starCount = Math.min(Math.max(activeBadges, 0), 3);
    if (starCount === 0) {
        return '<div class="squad-export-badge">No Stars</div>';
    }
    return `<div class="squad-export-stars">${'★'.repeat(starCount)}</div>`;
}

const EXPORT_CORS_SAFE_HOST = 'images.zenithfcm.com';
const exportAssetRewriteLog = new Set();
const exportAssetSkipLog = new Set();
const EXPORT_REWRITEABLE_RENDERZ_PATH = /^(flags_|club_|league_|bg_23_|player_)/i;
const EXPORT_FALLBACK_CARD_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect width="300" height="400" rx="26" fill="url(#g)"/><rect x="18" y="18" width="264" height="364" rx="20" fill="none" stroke="#64748B" stroke-opacity="0.45" stroke-width="3"/><text x="150" y="208" text-anchor="middle" fill="#CBD5E1" font-size="24" font-family="Segoe UI, Arial">ZENITH</text></svg>'
)}`;
const EXPORT_FALLBACK_PLAYER_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A5B4FC"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient></defs><rect width="200" height="300" fill="none"/><circle cx="100" cy="88" r="42" fill="url(#p)" opacity="0.92"/><rect x="48" y="136" width="104" height="122" rx="52" fill="url(#p)" opacity="0.92"/></svg>'
)}`;
const EXPORT_FALLBACK_FLAG_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" rx="2" fill="#0F172A"/><rect x="1" y="1" width="22" height="14" rx="1.5" fill="#1E293B"/><rect x="1" y="1" width="7.3" height="14" fill="#1D4ED8"/><rect x="8.3" y="1" width="7.3" height="14" fill="#E2E8F0"/><rect x="15.6" y="1" width="7.4" height="14" fill="#DC2626"/></svg>'
)}`;
const exportLiveImageDataUrlCache = new Map();

function getGuaranteedExportFallbackByRole(role) {
    if (role === 'card-bg') return EXPORT_FALLBACK_CARD_URL;
    if (role === 'player-img') return EXPORT_FALLBACK_PLAYER_URL;
    if (role === 'nation-flag' || role === 'club-flag' || role === 'league-flag') return EXPORT_FALLBACK_FLAG_URL;
    return '';
}

function normalizeExportAssetUrl(url) {
    if (!url) return '';
    const raw = String(url).trim();
    if (!raw) return '';
    if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    try {
        const parsed = new URL(raw, window.location.href);
        if (/renderz\.app$/i.test(parsed.hostname)) {
            const assetPath = parsed.pathname.replace(/^\/+/, '');
            if (assetPath) {
                if (!EXPORT_REWRITEABLE_RENDERZ_PATH.test(assetPath)) {
                    const skipKey = `${parsed.hostname}${parsed.pathname}`;
                    if (!exportAssetSkipLog.has(skipKey)) {
                        exportAssetSkipLog.add(skipKey);
                        console.warn('[EXPORT][CORS_SKIP]', {
                            host: parsed.hostname,
                            path: parsed.pathname,
                            reason: 'renderz asset is not export-safe for canvas'
                        });
                    }
                    return '';
                }
                const rewrittenUrl = `https://${EXPORT_CORS_SAFE_HOST}/${assetPath}${parsed.search || ''}`;
                const rewriteKey = `${parsed.hostname}${parsed.pathname}`;
                if (!exportAssetRewriteLog.has(rewriteKey)) {
                    exportAssetRewriteLog.add(rewriteKey);
                    console.warn('[EXPORT][CORS_REWRITE]', {
                        fromHost: parsed.hostname,
                        toHost: EXPORT_CORS_SAFE_HOST,
                        path: parsed.pathname
                    });
                }
                return rewrittenUrl;
            }
        }
        return parsed.href;
    } catch (_) {
        return raw;
    }
}

function extractLoadedImageAsDataUrl(imgElement) {
    if (!imgElement) return '';
    const src = imgElement.currentSrc || imgElement.getAttribute('src') || '';
    if (!src) return '';
    if (src.startsWith('data:')) return src;
    if (!imgElement.complete || imgElement.naturalWidth <= 0 || imgElement.naturalHeight <= 0) {
        return '';
    }
    try {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl || !dataUrl.startsWith('data:image/')) return '';
        return dataUrl;
    } catch (error) {
        console.warn('[EXPORT][LIVE_IMG_EXTRACT_FAIL]', {
            src,
            message: error?.message || String(error)
        });
        return '';
    }
}

function getLiveCardImage(playerId, selector) {
    if (!playerId || !selector) return '';
    const cacheKey = `${playerId}::${selector}`;
    if (exportLiveImageDataUrlCache.has(cacheKey)) {
        return exportLiveImageDataUrlCache.get(cacheKey);
    }

    const targetId = String(playerId);
    let cardElement = Array.from(document.querySelectorAll('.player-preview-card[data-player-id]'))
        .find(card => String(card.dataset.playerId || '') === targetId);
    if (!cardElement) {
        cardElement = Array.from(document.querySelectorAll('.bench-preview-card[data-player-id]'))
            .find(card => String(card.dataset.playerId || '') === targetId);
    }
    if (!cardElement) {
        exportLiveImageDataUrlCache.set(cacheKey, '');
        return '';
    }

    const imgElement = cardElement.querySelector(selector);
    if (!imgElement) {
        exportLiveImageDataUrlCache.set(cacheKey, '');
        return '';
    }

    const dataUrl = extractLoadedImageAsDataUrl(imgElement);
    if (dataUrl) {
        exportLiveImageDataUrlCache.set(cacheKey, dataUrl);
        console.info('[EXPORT][LIVE_IMG_EXTRACT_OK]', { playerId: targetId, selector });
        return dataUrl;
    }

    const normalizedLiveSrc = normalizeExportAssetUrl(imgElement.currentSrc || imgElement.getAttribute('src') || '');
    exportLiveImageDataUrlCache.set(cacheKey, normalizedLiveSrc || '');
    if (normalizedLiveSrc) {
        console.info('[EXPORT][LIVE_IMG_SOURCE_FALLBACK]', { playerId: targetId, selector });
    }
    return normalizedLiveSrc;
}

function findExportPlayerById(collection, playerId) {
    if (!Array.isArray(collection) || !playerId) return null;
    const target = String(playerId);
    return collection.find(item => String(item?.player_id || item?.id || item?.playerid || '') === target) || null;
}

function collectExportPlayerCandidates(playerId, fallbackPlayer) {
    const candidates = [];
    const pushCandidate = (candidate) => {
        if (candidate && typeof candidate === 'object') {
            candidates.push(candidate);
        }
    };

    pushCandidate(fallbackPlayer);

    if (typeof getSquadPlayerById === 'function') {
        pushCandidate(getSquadPlayerById(playerId));
    }

    if (typeof getPlayers === 'function') {
        pushCandidate(findExportPlayerById(getPlayers(), playerId));
    }

    if (window.state?.allPlayers) {
        pushCandidate(findExportPlayerById(window.state.allPlayers, playerId));
    }

    return candidates;
}

function pickFirstAssetUrl(candidates, keys) {
    for (const candidate of candidates) {
        for (const key of keys) {
            const value = candidate?.[key];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                const normalized = normalizeExportAssetUrl(value);
                if (normalized) {
                    return normalized;
                }
            }
        }
    }
    return '';
}

function collectExportPlayerAssetSources(playerId, fallbackPlayer) {
    const resolvedPlayerId = playerId || fallbackPlayer?.player_id || fallbackPlayer?.id || fallbackPlayer?.playerid || null;
    const candidates = collectExportPlayerCandidates(resolvedPlayerId, fallbackPlayer);
    const liveCardBg = resolvedPlayerId
        ? (getLiveCardImage(resolvedPlayerId, '.preview-card-bg') || getLiveCardImage(resolvedPlayerId, '.bench-card-bg'))
        : '';
    const livePlayerImg = resolvedPlayerId
        ? (getLiveCardImage(resolvedPlayerId, '.preview-card-player-img') || getLiveCardImage(resolvedPlayerId, '.bench-card-player-img'))
        : '';
    const fallbackCard = EXPORT_FALLBACK_CARD_URL;
    const fallbackPlayerImg = (resolvedPlayerId
        ? normalizeExportAssetUrl(`https://cdn.futbin.com/content/fifa25/img/players/${resolvedPlayerId}.png`)
        : '') || EXPORT_FALLBACK_PLAYER_URL;

    const sources = {
        playerId: resolvedPlayerId,
        cardBg: liveCardBg || pickFirstAssetUrl(candidates, [
            'card_background', 'cardbackground', 'cardBackground', 'card_bg', 'cardBg',
            'card_image', 'cardImage', 'cardimg', 'card',
            'card_background_url', 'cardBackgroundUrl', 'card_image_url', 'cardImageUrl'
        ]) || fallbackCard,
        playerImg: livePlayerImg || pickFirstAssetUrl(candidates, [
            'player_image', 'playerimage', 'playerImage', 'playerimg', 'playerImg', 'player_img',
            'image', 'image_url', 'imageUrl', 'imageurl', 'player_face', 'playerFace',
            'player_image_url', 'playerImageUrl'
        ]) || fallbackPlayerImg,
        nationFlag: pickFirstAssetUrl(candidates, [
            'nation_flag', 'nationflag', 'nationFlag', 'country_flag', 'countryFlag', 'national_flag',
            'nationflagurl', 'nationFlagUrl', 'flag_nation', 'flagNation'
        ]),
        clubFlag: pickFirstAssetUrl(candidates, [
            'club_flag', 'clubflag', 'clubFlag', 'team_flag', 'teamFlag', 'club_logo', 'clubLogo', 'team_logo',
            'clublogourl', 'clubLogoUrl', 'club_image', 'clubImage'
        ]),
        leagueFlag: pickFirstAssetUrl(candidates, [
            'league_flag', 'leagueflag', 'leagueFlag', 'league_logo', 'leagueLogo', 'league_image', 'leagueimg',
            'leagueflagurl', 'leagueFlagUrl', 'league_logo_url', 'leagueLogoUrl'
        ])
    };

    console.info('[EXPORT][ASSETS] Resolved media sources', {
        playerId: sources.playerId,
        hasLiveCardBg: Boolean(liveCardBg),
        hasLivePlayerImg: Boolean(livePlayerImg),
        hasCardBg: Boolean(sources.cardBg),
        hasPlayerImg: Boolean(sources.playerImg),
        hasNationFlag: Boolean(sources.nationFlag),
        hasClubFlag: Boolean(sources.clubFlag),
        hasLeagueFlag: Boolean(sources.leagueFlag)
    });

    return sources;
}

function setExportImageSource(imageElement, sourceUrl, role, playerId) {
    if (!imageElement) return;
    if (role) imageElement.dataset.imageRole = role;
    if (playerId) imageElement.dataset.playerId = String(playerId);
    const guaranteedFallback = getGuaranteedExportFallbackByRole(role);

    if (!sourceUrl) {
        if (guaranteedFallback) {
            sourceUrl = guaranteedFallback;
            console.warn('[EXPORT][SOURCE_MISSING_FALLBACK]', { role, playerId });
        } else {
            imageElement.removeAttribute('src');
            imageElement.dataset.missingSource = 'true';
            imageElement.style.display = 'none';
            return;
        }
    }

    imageElement.dataset.missingSource = 'false';
    imageElement.dataset.fallbackApplied = sourceUrl === guaranteedFallback ? 'true' : 'false';
    if (guaranteedFallback) {
        imageElement.onerror = function () {
            const failedSrc = this.getAttribute('src') || '';
            if (failedSrc === guaranteedFallback || this.dataset.fallbackApplied === 'true') {
                console.warn('[EXPORT][IMG_FAIL_NO_FALLBACK]', {
                    role,
                    playerId,
                    src: failedSrc
                });
                this.style.display = '';
                return;
            }
            console.warn('[EXPORT][IMG_FAIL_FALLBACK]', {
                role,
                playerId,
                failedSrc
            });
            this.dataset.fallbackApplied = 'true';
            setExportImageSource(this, guaranteedFallback, role, playerId);
        };
    } else {
        imageElement.onerror = null;
    }
    imageElement.setAttribute('crossorigin', 'anonymous');
    imageElement.setAttribute('referrerpolicy', 'no-referrer');
    imageElement.loading = 'eager';
    imageElement.decoding = 'sync';
    imageElement.src = sourceUrl;
    imageElement.style.display = '';
}

function ensureExportFlagImage(cardInner, className, sourceUrl, role, playerId, inlineStyle) {
    if (!cardInner) return;
    let flagImage = cardInner.querySelector(`.${className}`);

    if (!sourceUrl) {
        if (flagImage) flagImage.remove();
        return;
    }

    if (!flagImage) {
        flagImage = document.createElement('img');
        flagImage.className = className;
        flagImage.alt = role;
        if (inlineStyle) {
            flagImage.style.cssText = inlineStyle;
        }
        flagImage.onerror = function () {
            this.style.display = 'none';
        };
        cardInner.appendChild(flagImage);
    }

    setExportImageSource(flagImage, sourceUrl, role, playerId);
}

function hydrateExportCardMedia(cardElement, playerId, fallbackPlayer, cardType) {
    if (!cardElement) return;
    const sources = collectExportPlayerAssetSources(playerId, fallbackPlayer);
    const resolvedPlayerId = sources.playerId || playerId;
    if (resolvedPlayerId) {
        cardElement.dataset.playerId = String(resolvedPlayerId);
    }

    const isBenchCard = cardType === 'bench';
    const backgroundImage = cardElement.querySelector(isBenchCard ? '.bench-card-bg' : '.preview-card-bg');
    const playerImage = cardElement.querySelector(isBenchCard ? '.bench-card-player-img' : '.preview-card-player-img');
    const cardInner = cardElement.querySelector(isBenchCard ? '.bench-card-inner' : '.preview-card-inner');

    setExportImageSource(backgroundImage, sources.cardBg, 'card-bg', resolvedPlayerId);
    setExportImageSource(playerImage, sources.playerImg, 'player-img', resolvedPlayerId);

    if (cardInner) {
        ensureExportFlagImage(
            cardInner,
            isBenchCard ? 'bench-card-flag-nation' : 'preview-card-flag-nation',
            sources.nationFlag, 'nation-flag', resolvedPlayerId,
            null
        );
        ensureExportFlagImage(
            cardInner,
            isBenchCard ? 'bench-card-flag-club' : 'preview-card-flag-club',
            sources.clubFlag, 'club-flag', resolvedPlayerId,
            null
        );
        ensureExportFlagImage(
            cardInner,
            isBenchCard ? 'bench-card-flag-league' : 'preview-card-flag-league',
            sources.leagueFlag, 'league-flag', resolvedPlayerId,
            null
        );
    }


}

function cloneLiveSquadCard(cardClassName, playerId, exportClassName, cardType, fallbackPlayer) {
    if (!playerId) return null;

    const sourceCards = Array.from(document.querySelectorAll(`.${cardClassName}[data-player-id]`));
    const sourceCard = sourceCards.find(card => String(card.dataset.playerId || '') === String(playerId));
    if (!sourceCard) {
        console.warn('[EXPORT][CLONE_MISS] Live card not found', {
            cardClassName,
            playerId,
            availableIds: sourceCards.map(card => card.dataset.playerId || null)
        });
        return null;
    }

    const clonedCard = sourceCard.cloneNode(true);
    clonedCard.classList.add(exportClassName);
    clonedCard.removeAttribute('draggable');
    clonedCard.querySelectorAll('.preview-card-remove, .bench-card-remove').forEach(button => button.remove());

    // Strip all flag images from export cards
    clonedCard.querySelectorAll(
      '.preview-card-flag-nation, .preview-card-flag-club, .preview-card-flag-league, ' +
      '.bench-card-flag-nation, .bench-card-flag-club, .bench-card-flag-league, ' +
      '.card-nation-flag, .card-club-flag, .card-league-flag'
    ).forEach(flag => flag.remove());

    hydrateExportCardMedia(clonedCard, playerId, fallbackPlayer, cardType);
    return clonedCard;
}

function buildExportSlot(slot) {
    const container = document.createElement('div');
    container.className = 'squad-slot squad-export-slot';
    container.style.left = slot.x + '%';
    container.style.top = slot.y + '%';

    const positionDot = document.createElement('div');
    positionDot.className = 'position-dot';
    positionDot.innerHTML = `<span class="position-label">${slot.label}</span>`;
    positionDot.style.zIndex = '1';
    container.appendChild(positionDot);

    const assignedId = squadState.starters[slot.id] || null;
    if (!assignedId) {
        return container;
    }

    const player = typeof getSquadPlayerById === 'function'
        ? getSquadPlayerById(assignedId)
        : getPlayers().find(p => p.id === assignedId || p.playerid === assignedId || p.player_id === assignedId);
    if (!player) {
        return container;
    }

    // ── Determine card type class ──
    const isIcon = !!(player.isicon || player.is_icon || player.isIcon);
    const isHero = !!(player.ishero || player.is_hero || player.isHero);
    const cardTypeClass = isIcon ? 'card-type-icon' : isHero ? 'card-type-hero' : 'card-type-normal';

    const playerId = typeof resolveSquadPlayerId === 'function'
        ? (resolveSquadPlayerId(player) || assignedId)
        : (player.player_id || player.id || player.playerid || assignedId);

    const livePreviewCard = cloneLiveSquadCard('player-preview-card', playerId, 'squad-export-player-card', 'starter', player);
    if (livePreviewCard) {
        livePreviewCard.classList.add(cardTypeClass);
        livePreviewCard.style.zIndex = '2';
        container.appendChild(livePreviewCard);
        return container;
    }

    const previewCard = document.createElement('div');
    previewCard.className = `player-preview-card squad-export-player-card ${cardTypeClass}`;
    previewCard.style.zIndex = '2';
    previewCard.dataset.playerId = String(playerId);
    previewCard.innerHTML = buildSquadPreviewCardMarkup(player, slot.label || '', slot.id, {
        includeCrossOrigin: true,
        includeRemoveButton: false
    });
    hydrateExportCardMedia(previewCard, playerId, player, 'starter');

    container.appendChild(previewCard);
    return container;
}


function buildExportBench() {
    const benchContainer = document.createElement('div');
    benchContainer.className = 'squad-export-bench';

    const benchGrid = document.createElement('div');
    benchGrid.className = 'squad-bench squad-export-bench-grid';

    const benchSlots = Array.from({ length: 7 }, (_, i) => squadState.bench?.[i] || null);

    for (let i = 0; i < 7; i++) {
        const pid = benchSlots[i];
        const player = pid
            ? (typeof getSquadPlayerById === 'function'
                ? getSquadPlayerById(pid)
                : getPlayers().find(p => p.id === pid || p.playerid === pid || p.player_id === pid))
            : null;
        const playerId = player
            ? (typeof resolveSquadPlayerId === 'function'
                ? (resolveSquadPlayerId(player) || pid)
                : (player.player_id || player.id || player.playerid || pid))
            : pid;

        const cell = document.createElement('div');
        cell.className = 'bench-cell';

        const emptySlot = document.createElement('div');
        emptySlot.className = 'bench-empty-slot';
        emptySlot.innerHTML = `<span class="bench-slot-label">SUB ${i + 1}</span>`;
        cell.appendChild(emptySlot);

        if (player) {
            // ── Determine card type class ──
            const isIcon = !!(player.isicon || player.is_icon || player.isIcon);
            const isHero = !!(player.ishero || player.is_hero || player.isHero);
            const cardTypeClass = isIcon ? 'bench-type-icon' : isHero ? 'bench-type-hero' : 'bench-type-normal';

            const liveBenchCard = cloneLiveSquadCard('bench-preview-card', playerId, 'squad-export-bench-card', 'bench', player);
            if (liveBenchCard) {
                liveBenchCard.classList.add(cardTypeClass);
                liveBenchCard.style.zIndex = '2';
                cell.appendChild(liveBenchCard);
            } else {
                const benchCard = document.createElement('div');
                benchCard.className = `bench-preview-card squad-export-bench-card ${cardTypeClass}`;
                benchCard.style.zIndex = '2';
                benchCard.dataset.playerId = String(playerId);
                benchCard.innerHTML = buildSquadBenchCardMarkup(player, i, {
                    includeCrossOrigin: true,
                    includeRemoveButton: false
                });
                hydrateExportCardMedia(benchCard, playerId, player, 'bench');
                cell.appendChild(benchCard);
            }
        }

        benchGrid.appendChild(cell);
    }

    benchContainer.appendChild(benchGrid);
    return benchContainer;
}


function formatFormationLabel(formationId) {
    const select = document.getElementById('formation-select');
    if (select) {
        const option = select.querySelector(`option[value="${formationId}"]`);
        if (option) {
            return option.textContent.trim();
        }
    }

    return formationId || 'Formation';
}

function getQrImageUrl() {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fzenithfcm.com';
}

function applyExportThemeBackground(target) {
    const themeBackground = getSelectedThemeBackground();
    if (themeBackground) {
        target.style.background = themeBackground;
    }
    const backgroundUrl = extractBackgroundUrl(themeBackground);
    console.log('🎨 Export background:', themeBackground || 'none');
    return backgroundUrl;
}

function getSelectedThemeBackground() {
    const themeId = localStorage.getItem('selectedFieldTheme') || 'camp-nou';
    const themeMap = {
        'stadium-blue': 'url(assets/images/background/squad_builder_1.webp) center/cover no-repeat',
        'camp-nou': 'url(assets/images/background/squad_builder_2.webp) center/cover no-repeat',
        'old-trafford': 'url(assets/images/background/squad_builder_3.webp) center/cover no-repeat',
        'santiago-bernabeu': 'url(assets/images/background/squad_builder_4.webp) center/cover no-repeat',
        'anfield': 'url(assets/images/background/squad_builder_5.webp) center/cover no-repeat'
    };

    return themeMap[themeId] || themeMap['camp-nou'];
}

function extractBackgroundUrl(backgroundValue) {
    if (!backgroundValue) return null;
    const match = backgroundValue.match(/url\((['"]?)(.+?)\1\)/);
    return match ? match[2] : null;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function countExportCards(container) {
    return container.querySelectorAll('.squad-export-player-card, .squad-export-bench-card').length;
}

function getExportCardRoleStatus(card, selector, role, required = false) {
    const image = card.querySelector(selector);
    const src = image?.getAttribute('src') || '';
    const loaded = Boolean(image && src && image.complete && image.naturalWidth > 0);
    let host = null;
    if (src) {
        try {
            host = new URL(src, window.location.href).hostname;
        } catch (_) {
            host = null;
        }
    }
    return {
        role,
        required,
        hasSource: Boolean(src),
        loaded,
        src: src || null,
        host
    };
}

function logExportMediaAudit(container) {
    const cards = Array.from(container.querySelectorAll('.squad-export-player-card, .squad-export-bench-card'));
    const cardSummaries = [];
    const missingRequired = [];
    const missingOptional = [];

    cards.forEach(card => {
        const isBenchCard = card.classList.contains('squad-export-bench-card');
        const playerId = card.dataset.playerId || null;
        const roleStatuses = [
            getExportCardRoleStatus(card, isBenchCard ? '.bench-card-bg' : '.preview-card-bg', 'card-bg', true),
            getExportCardRoleStatus(card, isBenchCard ? '.bench-card-player-img' : '.preview-card-player-img', 'player-img', true),
            getExportCardRoleStatus(card, isBenchCard ? '.bench-card-flag-nation' : '.preview-card-flag-nation', 'nation-flag'),
            getExportCardRoleStatus(card, isBenchCard ? '.bench-card-flag-club' : '.preview-card-flag-club', 'club-flag'),
            getExportCardRoleStatus(card, isBenchCard ? '.bench-card-flag-league' : '.preview-card-flag-league', 'league-flag')
        ];
        cardSummaries.push({
            playerId,
            cardType: isBenchCard ? 'bench' : 'starter',
            roles: roleStatuses.map(status => ({
                role: status.role,
                required: status.required,
                hasSource: status.hasSource,
                loaded: status.loaded,
                host: status.host
            }))
        });

        roleStatuses.forEach(status => {
            if (status.hasSource && status.loaded) return;
            const issue = {
                playerId,
                role: status.role,
                hasSource: status.hasSource,
                loaded: status.loaded,
                src: status.src,
                host: status.host
            };
            if (status.required) {
                missingRequired.push(issue);
            } else if (status.hasSource) {
                missingOptional.push(issue);
            }
        });
    });

    console.info('[EXPORT][MEDIA_AUDIT]', {
        cardCount: cards.length,
        requiredMissing: missingRequired.length,
        optionalMissing: missingOptional.length,
        cards: cardSummaries
    });
    if (missingRequired.length) {
        console.warn('[EXPORT][MEDIA_AUDIT] Required media missing', missingRequired);
    } else {
        console.info('[EXPORT][MEDIA_AUDIT] Required media ready for all cards');
    }
    if (missingOptional.length) {
        console.warn('[EXPORT][MEDIA_AUDIT] Optional media missing', missingOptional);
    }

    return { missingRequired, missingOptional };
}

function getExportCardImages(container) {
    return Array.from(container.querySelectorAll(
        '.preview-card-bg, .preview-card-player-img, .preview-card-flag-nation, .preview-card-flag-club, .preview-card-flag-league, .bench-card-bg, .bench-card-player-img, .bench-card-flag-nation, .bench-card-flag-club, .bench-card-flag-league'
    ));
}

function getMissingImages(images) {
    return images.filter(img => {
        const role = img.dataset.imageRole || '';
        const isRequiredRole = role === 'card-bg' || role === 'player-img';
        const src = img.getAttribute('src');
        if (!src || img.style.display === 'none') return isRequiredRole;
        return !(img.complete && img.naturalWidth > 0);
    });
}

async function retryMissingImages(images) {
    if (!images.length) return;
    const retryStamp = Date.now();

    await Promise.all(images.map(img => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) return Promise.resolve();
        try {
            const host = new URL(src, window.location.href).hostname;
            if (/renderz\.app$/i.test(host)) {
                console.warn('[EXPORT][RETRY_SKIP_CORS]', {
                    role: img.dataset.imageRole || 'unknown',
                    playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
                    host
                });
                return Promise.resolve();
            }
        } catch (_) {
            // ignore invalid URLs and let retry proceed
        }
        return new Promise(resolve => {
            let settled = false;
            const onDone = (status) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                if (status === 'timeout') {
                    console.warn('[EXPORT][RETRY_TIMEOUT]', {
                        role: img.dataset.imageRole || 'unknown',
                        playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
                        src
                    });
                }
                resolve();
            };
            const onLoad = () => onDone('load');
            const onError = () => onDone('error');
            const timeoutId = setTimeout(() => onDone('timeout'), 4000);
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            const separator = src.includes('?') ? '&' : '?';
            img.src = `${src}${separator}retry=${retryStamp}`;
        });
    }));
}

function repairMissingExportImages(images) {
    let repairedCount = 0;
    const guaranteedFallbackByRole = {
        'card-bg': EXPORT_FALLBACK_CARD_URL,
        'player-img': EXPORT_FALLBACK_PLAYER_URL,
        'nation-flag': EXPORT_FALLBACK_FLAG_URL,
        'club-flag': EXPORT_FALLBACK_FLAG_URL,
        'league-flag': EXPORT_FALLBACK_FLAG_URL
    };

    images.forEach(img => {
        const role = img.dataset.imageRole || '';
        const playerId = img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null;
        if (!playerId || !role) return;

        const sources = collectExportPlayerAssetSources(playerId, null);
        const replacementByRole = {
            'card-bg': sources.cardBg,
            'player-img': sources.playerImg,
            'nation-flag': sources.nationFlag,
            'club-flag': sources.clubFlag,
            'league-flag': sources.leagueFlag
        };
        const replacement = replacementByRole[role];
        const currentSrc = img.getAttribute('src') || '';
        if (replacement && currentSrc !== replacement) {
            setExportImageSource(img, replacement, role, playerId);
            repairedCount += 1;
            console.warn('[EXPORT][REPAIR] Replaced missing media', {
                playerId,
                role,
                replacement
            });
            return;
        }

        const guaranteedFallback = guaranteedFallbackByRole[role];
        if (!guaranteedFallback || currentSrc === guaranteedFallback) return;

        setExportImageSource(img, guaranteedFallback, role, playerId);
        repairedCount += 1;
        console.warn('[EXPORT][REPAIR] Applied guaranteed fallback media', {
            playerId,
            role
        });

    });

    return repairedCount;
}

async function ensureExportImagesReady(container) {
    await waitForImages(container);
    let cardImages = getExportCardImages(container);
    let missing = getMissingImages(cardImages);

    if (missing.length) {
        console.warn('[EXPORT] Missing media before retry', missing.map(img => ({
            role: img.dataset.imageRole || 'unknown',
            playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
            src: img.getAttribute('src')
        })));
    }

    if (missing.length) {
        await retryMissingImages(missing);
        await waitForImages(container);
        cardImages = getExportCardImages(container);
        missing = getMissingImages(cardImages);
    }

    if (missing.length) {
        const repairedCount = repairMissingExportImages(missing);
        if (repairedCount > 0) {
            await waitForImages(container);
            cardImages = getExportCardImages(container);
            missing = getMissingImages(cardImages);
        }
    }

    if (missing.length) {
        console.warn('[EXPORT] Media still missing after repair pipeline', missing.map(img => ({
            role: img.dataset.imageRole || 'unknown',
            playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
            src: img.getAttribute('src')
        })));
    } else {
        console.info('[EXPORT] All export media ready for capture');
    }

    return logExportMediaAudit(container);
}

function waitForImages(container, options = {}) {
    const images = Array.from(container.querySelectorAll('img'));
    if (!images.length) return Promise.resolve();
    const perImageTimeoutMs = Number.isFinite(options.perImageTimeoutMs) ? options.perImageTimeoutMs : 5000;

    return Promise.all(images.map(img => {
        if (img.complete) {
            if (img.naturalWidth <= 0 && img.getAttribute('src')) {
                console.warn('[EXPORT][IMG_COMPLETE_ERROR]', {
                    role: img.dataset.imageRole || 'unknown',
                    playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
                    src: img.getAttribute('src')
                });
            }
            return Promise.resolve();
        }
        return new Promise(resolve => {
            let settled = false;
            const onDone = (status) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                if (status === 'timeout') {
                    console.warn('[EXPORT][IMG_WAIT_TIMEOUT]', {
                        role: img.dataset.imageRole || 'unknown',
                        playerId: img.dataset.playerId || img.closest('[data-player-id]')?.dataset.playerId || null,
                        src: img.getAttribute('src')
                    });
                }
                resolve();
            };
            const onLoad = () => onDone('load');
            const onError = () => onDone('error');
            const timeoutId = setTimeout(() => onDone('timeout'), perImageTimeoutMs);
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
        });
    }));
}

function preloadBackgroundImage(url) {
    if (!url) return Promise.resolve();
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
    });
}

/**
 * Export squad with overlay information (OVR, Formation, etc.)
 * Advanced version with metadata overlay
 */
async function exportSquadWithInfo() {
    let overlay = null;
    try {
        console.log('📸 Starting advanced squad export...');
        
        const squadField = document.getElementById('squad-field');
        
        if (!squadField) {
            throw new Error('Squad field not found');
        }
        
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }
        
        // Create temporary overlay with squad info
        overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Segoe UI', sans-serif;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                ${squadState.name || 'My Squad'}
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                Formation: ${squadState.formationId} | OVR: ${getFinalTeamOVR()}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                Created with Zenith FCM
            </div>
        `;
        
        squadField.appendChild(overlay);
        
        // Capture
        const canvas = await html2canvas(squadField, {
            backgroundColor: '#0a1628',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: false
        });
        
        // Remove overlay
        squadField.removeChild(overlay);
        overlay = null;
        
        // Download
        const blob = await canvasToBlob(canvas, 'image/png');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `${(squadState.name || 'My_Squad').replace(/\s+/g, '_')}_${timestamp}.png`;
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('❌ Error exporting squad:', error);
    } finally {
        if (overlay && overlay.isConnected) {
            overlay.remove();
        }
    }
}

/**
 * Check if html2canvas library is loaded
 */
function isExportAvailable() {
    return typeof html2canvas !== 'undefined';
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportSquad,
        exportSquadWithInfo,
        isExportAvailable
    };
}




/* ===== assets/js/views/eventGuide.js ===== */

// FC Market Pro - Event Guide (Redesigned)
// Professional multi-section guide with proper styling and navigation

// ========================================
// INITIALIZATION FUNCTION
// ========================================
window.initEventGuide = function() {
    console.log('[EVENT GUIDE] Initializing...');
    
    const container = document.getElementById('event-guide-view');
    if (!container) {
        console.error('[EVENT GUIDE] Container #event-guide-view not found');
        return;
    }
    
    // Create the main container for event guide
    container.innerHTML = `
        <div id="event-guide-container" style="padding: 24px; max-width: 1400px; margin: 0 auto;">
            <!-- Events will be loaded here -->
        </div>
    `;
    
    // Load the event grid
    loadEventGuide();
    
    console.log('[EVENT GUIDE] Loaded successfully');
};


// ========================================
// EVENT DATA
// ========================================
const fcEvents = [
  {
    id: 1,
    title: "A Nation's Story: Japan Event Guide",
    image: "https://via.placeholder.com/400x250/8B5CF6/ffffff?text=Japan+Event",
    description: "FC Mobile 26 A Nation's Story: Japan event is live now. This event highlight Japanese football and give players the chance to earn tokens, shards...",
    duration: "14 Days",
    color: "#8B5CF6"
  },
  {
    id: 2,
    title: "Footyverse Event Guide",
    image: "https://via.placeholder.com/400x250/3B82F6/ffffff?text=Footyverse+Event",
    description: "The Footyverse event is now live in EA Sports FC Mobile! Inspired by the idea of parallel football worlds, this event introduces unique versions of...",
    duration: "28 Days",
    color: "#3B82F6",
    sections: [
      {
        id: "overview",
        title: "🌌 Overview",
        type: "text",
        content: "Footyverse introduces the concept of alternate football realities — versions of well-known players performing roles or positions that differ from their real-world reputation. Throughout the event, you will collect Footyverse Tickets, Tokens, and Shards to unlock players, complete evolution paths, and explore a variety of themed universes ('Verses')."
      },
      {
        id: "main-chapter",
        title: "📖 Main Chapter Overview",
        type: "text",
        content: "Each day, claim your Footyverse Ticket and choose one of three Navigators: Ruud Gullit, Eden Hazard, or Bastian Schweinsteiger. After selecting a Navigator, you may play one match/skill game among the daily options. Completing the activity grants 100 Footyverse Tokens and unlocks that Navigator's personal universe chapter for the day."
      },
      {
        id: "navigators",
        title: "🎮 Navigators",
        type: "tabs",
        tabs: [
          {
            name: "Ruud Gullit",
            rows: [
              { match: "G-988", objective: "Assist with Dutch players (2x)", reward: "100 Tokens" },
              { match: "G-990", objective: "Complete 10 tackles", reward: "200 Tokens + Hidden Ticket" },
              { match: "G-992", objective: "Score using any Footyverse player (Skill)", reward: "100 Gems + Ticket" }
            ]
          },
          {
            name: "Eden Hazard",
            rows: [
              { match: "H-015", objective: "Complete 15 dribbles + Score with Chelsea players", reward: "Gems + Tokens + Hidden Ticket" },
              { match: "H-016", objective: "Assist 3 Goals with Footyverse Players", reward: "100 Tokens + Ticket" },
              { match: "H-0205", objective: "Complete 10 dribbles (Skill)", reward: "100 Gems + Ticket" }
            ]
          },
          {
            name: "Bastian Schweinsteiger",
            rows: [
              { match: "SCH-212", objective: "Score with Bayern + Win Match", reward: "Tokens, Gems, Hidden Ticket, Curve Magic Key" },
              { match: "SCH-206", objective: "Pass completion & German scoring", reward: "Tokens, Ticket, Gems, Rank Ups" },
              { match: "SCH-208", objective: "German scoring + match victory", reward: "Tokens, Gems, Rank Ups" }
            ]
          }
        ]
      },
      {
        id: "daily-strategy",
        title: "💡 Daily Strategy",
        type: "highlight",
        content: "Best daily grind options:",
        items: [
          "H-0205 (Hazard Skill Game) - Yields 1 Curve Magic Key + 100 Rank Ups",
          "SCH-212 (Schweinsteiger Match 1) - Yields 1 Curve Magic Key + 100 Rank Ups",
          "Consistent rewards: Tokens, Gems, Keys"
        ]
      },
      {
        id: "main-quests",
        title: "✅ Main Quests",
        type: "table",
        table: {
          headers: ["Objective", "Reward"],
          rows: [
            ["Travel with Gullit 5 times", "60 Footyverse Shards"],
            ["Travel with Hazard 5 times", "109–113 OVR Footyverse Player"],
            ["Travel with Schweinsteiger 5 times", "7,500 Gems"],
            ["Obtain 3 Curve Magic Keys", "108 OVR CM Beckham + 5,000,000 Coins"]
          ]
        }
      },
      {
        id: "verses",
        title: "🌍 Verses Guide",
        type: "accordion",
        items: [
          {
            title: "Becks' Verse",
            content: "Progress Beckham from 87 OVR → 113 OVR",
            table: {
              headers: ["Step", "Requirement", "Reward"],
              rows: [
                ["1", "500 Tokens", "87 Beckham"],
                ["2", "300 Tokens + 1 Curve Magic", "108 Beckham"],
                ["3", "50 Shards + 2 Curve Magic", "110 Beckham"],
                ["4", "300 Shards + 3 Curve Magic", "111 Beckham"],
                ["5", "1,100 Shards + 4 Curve Magic", "113 Beckham"]
              ]
            }
          },
          {
            title: "Treasure Verse",
            content: "Spend 5,300 Tokens to clear a linear reward path."
          },
          {
            title: "Swap Verse (Rarest)",
            content: "Exchange a Footyverse player for a different one of the same OVR. Result card becomes untradeable."
          },
          {
            title: "Shapeshifter Verse",
            content: "Players appear in unusual positions. Exchanges require Footyverse players + Shards."
          },
          {
            title: "Gemini Verse",
            content: "Player look-alike conversion system; swap between paired cards using Tokens/Shards."
          },
          {
            title: "Kinverse",
            content: "Focus on football siblings (Timbers, Højlunds, Kluiverts, Zidanes)."
          },
          {
            title: "Morphoverse",
            content: "Switch between alternative card art versions. Cost: 500 Tokens per appearance swap."
          },
          {
            title: "Claw Machine Verse",
            content: "Unlocks October 30, 2025 - Gamble-style reward grabs with slipping chance."
          }
        ]
      },
      {
        id: "supply",
        title: "🏪 Supply Depot & Gallery",
        type: "text",
        content: "Spend Tokens for resources and untradeable Footyverse players. Clearing full rows unlocks further tiers and a final 111 OVR reward. Exchange unwanted Footyverse players to obtain Shards, then redeem weekly player rotations."
      },
      {
        id: "star-pass",
        title: "⭐ Star Pass",
        type: "text",
        content: "Progress the Footyverse Pass through gameplay to earn Shards and a final reward of 111 OVR CM Lampard (Rank 4)."
      },
      {
        id: "featured",
        title: "🔄 Featured Players",
        type: "text",
        content: "Players rotate with market refreshes every 2 hours. Refresh time determines when their listing values update in the market."
      }
    ]
  },
  {
    id: 3,
    title: "Trivia Time: LaLiga Guide",
    image: "https://via.placeholder.com/400x250/EF4444/ffffff?text=LaLiga+Trivia",
    description: "FC Mobile 26 Trivia Time: Laliga is out now! Dive into this exciting new feature on Extra Time...",
    duration: "21 Days",
    color: "#EF4444"
  },
  {
    id: 4,
    title: "CONMEBOL Libertadores Event",
    image: "https://via.placeholder.com/400x250/F59E0B/ffffff?text=Libertadores",
    description: "Experience the glory of CONMEBOL Libertadores in EA Sports FC Mobile...",
    duration: "30 Days",
    color: "#F59E0B"
  },
  {
    id: 5,
    title: "Ballon d'Or Event Guide",
    image: "https://via.placeholder.com/400x250/FCD34D/ffffff?text=Ballon+Or",
    description: "Participate in the prestigious Ballon d'Or event and showcase your elite players...",
    duration: "14 Days",
    color: "#FCD34D"
  },
  {
    id: 6,
    title: "2nd Anniversary Event",
    image: "https://via.placeholder.com/400x250/10B981/ffffff?text=2nd+Anniversary",
    description: "Celebrate 2 years of FC Mobile! This milestone event brings incredible rewards...",
    duration: "35 Days",
    color: "#10B981"
  }
];


// ========================================
// LOAD EVENT GUIDE VIEW (MAIN GRID)
// ========================================
function loadEventGuide() {
  const container = document.getElementById('event-guide-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'events-grid-premium';
  
  // Loop through events and create cards
  fcEvents.forEach(event => {
    const eventCard = createPremiumEventCard(event);
    gridContainer.appendChild(eventCard);
  });
  
  container.appendChild(gridContainer);
}


// ========================================
// CREATE PREMIUM EVENT CARD
// ========================================
function createPremiumEventCard(event) {
  const card = document.createElement('div');
  card.className = 'event-card-premium';
  card.style.borderTopColor = event.color;
  
  card.innerHTML = `
    <div class="event-card-image-wrapper">
      <img src="${event.image}" alt="${event.title}" class="event-card-image">
      <div class="event-duration-badge">${event.duration}</div>
    </div>
    <div class="event-card-content-premium">
      <h3 class="event-card-title">${event.title}</h3>
      <p class="event-card-description">${event.description}</p>
      <button class="event-learn-btn-premium" onclick="displayEventDetail(${event.id})">
        Learn More →
      </button>
    </div>
  `;
  
  return card;
}


// ========================================
// DISPLAY DETAILED EVENT VIEW
// ========================================
function displayEventDetail(eventId) {
  const event = fcEvents.find(e => e.id === eventId);
  if (!event) return;
  
  const container = document.getElementById('event-guide-container');
  if (!container) return;
  
  // Check if event has sections
  if (!event.sections) {
    container.innerHTML = `
      <div class="event-detail-view">
        <button class="event-back-btn" onclick="loadEventGuide()">← Back to Events</button>
        <div class="event-simple-detail">
          <img src="${event.image}" alt="${event.title}">
          <h2>${event.title}</h2>
          <p>${event.description}</p>
          <p><em>Detailed guide coming soon...</em></p>
        </div>
      </div>
    `;
    return;
  }
  
  // Build detail view with sidebar and content
  const detailHTML = `
    <div class="event-detail-view">
      <div class="event-detail-header">
        <button class="event-back-btn" onclick="loadEventGuide()">← Back to Events</button>
        <div class="event-header-content">
          <img src="${event.image}" alt="${event.title}" class="event-detail-hero">
          <div class="event-header-info">
            <h1>${event.title}</h1>
            <span class="event-header-duration">📅 ${event.duration}</span>
          </div>
        </div>
      </div>
      
      <div class="event-detail-body">
        <aside class="event-detail-sidebar">
          <h3 class="sidebar-title">Contents</h3>
          <nav class="event-toc">
            ${event.sections.map((section, idx) => `
              <a href="#section-${idx}" class="toc-link" onclick="scrollToSection('section-${idx}', event)">${section.title}</a>
            `).join('')}
          </nav>
        </aside>
        
        <main class="event-detail-content">
          ${event.sections.map((section, idx) => renderEventSection(section, idx)).join('')}
        </main>
      </div>
    </div>
  `;
  
  container.innerHTML = detailHTML;
  
  // Add click handlers for accordion
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      this.classList.toggle('active');
      this.nextElementSibling.classList.toggle('active');
    });
  });
}


// ========================================
// RENDER INDIVIDUAL EVENT SECTION
// ========================================
function renderEventSection(section, index) {
  let html = `<section class="event-detail-section" id="section-${index}">
    <h2 class="section-title">${section.title}</h2>`;
  
  switch(section.type) {
    case 'text':
      html += `<p class="section-text">${section.content}</p>`;
      break;
      
    case 'highlight':
      html += `
        <div class="highlight-box">
          <p>${section.content}</p>
          <ul class="highlight-list">
            ${section.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
      break;
      
    case 'table':
      html += `
        <div class="table-wrapper">
          <table class="detail-table">
            <thead>
              <tr>
                ${section.table.headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${section.table.rows.map((row, idx) => `
                <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      break;
      
    case 'tabs':
      html += `
        <div class="tabs-container">
          <div class="tab-buttons">
            ${section.tabs.map((tab, idx) => `
              <button class="tab-btn ${idx === 0 ? 'active' : ''}" onclick="switchTab(this)">
                ${tab.name}
              </button>
            `).join('')}
          </div>
          <div class="tab-contents">
            ${section.tabs.map((tab, idx) => `
              <div class="tab-content ${idx === 0 ? 'active' : ''}">
                <div class="table-wrapper">
                  <table class="detail-table">
                    <thead>
                      <tr>
                        <th>Match</th>
                        <th>Objective</th>
                        <th>Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tab.rows.map((row, ridx) => `
                        <tr class="${ridx % 2 === 0 ? 'even' : 'odd'}">
                          <td><strong>${row.match}</strong></td>
                          <td>${row.objective}</td>
                          <td class="reward-cell">${row.reward}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;
      
    case 'accordion':
      html += `
        <div class="accordion-container">
          ${section.items.map((item, idx) => `
            <div class="accordion-item">
              <button class="accordion-header">
                <span>${item.title}</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <p>${item.content}</p>
                ${item.table ? `
                  <div class="table-wrapper">
                    <table class="detail-table">
                      <thead>
                        <tr>
                          ${item.table.headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody>
                        ${item.table.rows.map((row, ridx) => `
                          <tr class="${ridx % 2 === 0 ? 'even' : 'odd'}">
                            ${row.map(cell => `<td>${cell}</td>`).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      break;
  }
  
  html += '</section>';
  return html;
}


// ========================================
// TAB SWITCHING FUNCTION
// ========================================
function switchTab(button) {
  const container = button.parentElement.parentElement;
  
  // Remove active class from all buttons and contents
  container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked button and corresponding content
  button.classList.add('active');
  const tabIndex = Array.from(button.parentElement.children).indexOf(button);
  container.querySelectorAll('.tab-content')[tabIndex].classList.add('active');
}


// ========================================
// SCROLL TO SECTION FUNCTION
// ========================================
function scrollToSection(sectionId, event) {
  event.preventDefault();
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

console.log('[EVENT GUIDE] Script loaded successfully');




/* ===== assets/js/views/shardCalculator.js ===== */

// FC Market Pro - Shard Calculator (ULTRA-SIMPLE WORKING VERSION)

// ===== GLOBAL STATE =====
window.shardCalcState = {
  mode: 'counter',
  counterShards: {
    105: 0, 106: 0, 107: 0, 108: 0, 109: 0,
    110: 0, 111: 0, 112: 0, 113: 0
  },
  shardCosts: {
    105: 5, 106: 10, 107: 10, 108: 10, 109: 30,
    110: 60, 111: 120, 112: 180, 113: 250
  }
};

// ===== INITIALIZE =====
window.initShardCalculator = function () {

  const view = document.getElementById('shard-calculator-view');
  if (view) {
    view.style.display = 'block';
    view.style.opacity = '1';
    view.classList.add('active');
  }
  window.loadSavedState();
  window.updateShardCounterDisplay();
};

// ===== SWITCH MODE =====
window.switchShardMode = function (mode) {

  window.shardCalcState.mode = mode;

  const costSection = document.getElementById('shard-cost-section');
  const counterSection = document.getElementById('shard-counter-section');

  // Update buttons
  document.querySelectorAll('.shard-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  // Show/hide sections
  if (mode === 'cost') {
    if (counterSection) counterSection.style.display = 'none';
    if (costSection) costSection.style.display = 'block';
  } else {
    if (costSection) costSection.style.display = 'none';
    if (counterSection) counterSection.style.display = 'block';
  }

  localStorage.setItem('shardCalcMode', mode);
};

// ===== INCREMENT/DECREMENT =====
window.incrementShardLevel = function (ovr) {

  window.shardCalcState.counterShards[ovr]++;
  window.updateShardCounterDisplay();
};

window.decrementShardLevel = function (ovr) {

  if (window.shardCalcState.counterShards[ovr] > 0) {
    window.shardCalcState.counterShards[ovr]--;
    window.updateShardCounterDisplay();
  }
};

// ===== RESET =====
window.resetShardCounter = function () {
  {

    window.shardCalcState.counterShards = {
      105: 0, 106: 0, 107: 0, 108: 0, 109: 0,
      110: 0, 111: 0, 112: 0, 113: 0
    };
    window.updateShardCounterDisplay();
  }
};

// ===== UPDATE DISPLAY =====
window.updateShardCounterDisplay = function () {
  // Calculate TOTAL SHARDS (not just player count)
  const total = Object.entries(window.shardCalcState.counterShards)
    .reduce((sum, [ovr, count]) => {
      const shardCost = window.shardCalcState.shardCosts[ovr];
      return sum + (count * shardCost);
    }, 0);

  // Count total PLAYERS
  const players = Object.values(window.shardCalcState.counterShards).reduce((a, b) => a + b, 0);

  const shardEl = document.getElementById('shard-count-display');
  const playerEl = document.getElementById('player-count-display');

  if (shardEl) shardEl.textContent = total;
  if (playerEl) playerEl.textContent = players;

  for (let ovr = 105; ovr <= 113; ovr++) {
    const el = document.getElementById(`counter-${ovr}`);
    if (el) el.textContent = window.shardCalcState.counterShards[ovr] || 0;
  }
  window.saveState();
};


// ===== COST MODE FUNCTIONS =====
window.setShardValue = function (amount) {
  const input = document.getElementById('shard-required-input');
  if (input) {
    input.value = amount;
    window.calculateShardCost();
  }
};

window.calculateShardCost = function () {
  const input = document.getElementById('shard-required-input');
  const ovrSelect = document.getElementById('shard-player-ovr');

  if (!input || !ovrSelect) return;

  const shards = parseInt(input.value) || 0;
  const ovr = parseInt(ovrSelect.value) || 105;
  const costPerPlayer = window.shardCalcState.shardCosts[ovr] || 5;
  const playersNeeded = Math.ceil(shards / costPerPlayer);
  const totalCost = playersNeeded * 1000000;

  const playersEl = document.getElementById('shard-cost-players-result');
  const costEl = document.getElementById('shard-cost-total-result');

  if (playersEl) playersEl.textContent = playersNeeded;
  if (costEl) {
    if (totalCost >= 1000000) {
      costEl.textContent = (totalCost / 1000000).toFixed(1) + 'M';
    } else {
      costEl.textContent = (totalCost / 1000).toFixed(0) + 'K';
    }
  }
};

window.handleShardInput = function (e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  window.calculateShardCost();
};

// ===== STORAGE =====
window.saveState = function () {
  try {
    localStorage.setItem('shardCalcState', JSON.stringify(window.shardCalcState));
  } catch (e) { }
};

window.loadSavedState = function () {
  try {
    const saved = localStorage.getItem('shardCalcState');
    if (saved) {
      const data = JSON.parse(saved);
      window.shardCalcState = { ...window.shardCalcState, ...data };
    }
  } catch (e) { }
};

// ===== AUTO INITIALIZE =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {

  });
} else {

}

// ===== RESET COST CALCULATOR (Works like Reset Counter) =====
// ===== RESET COST CALCULATOR =====
window.resetShardCost = function () {
  {
    // Reset input field to empty
    const input = document.getElementById('shard-required-input');
    if (input) {
      input.value = '';

    }

    // Reset OVR dropdown to OVR 105
    const ovrSelect = document.getElementById('shard-player-ovr');
    if (ovrSelect) {
      ovrSelect.value = '105';

    }

    // Reset results to 0
    const playersEl = document.getElementById('shard-cost-players-result');
    const costEl = document.getElementById('shard-cost-total-result');

    if (playersEl) {
      playersEl.textContent = '0';

    }
    if (costEl) {
      costEl.textContent = '0.0M';

    }

    // Recalculate
    window.calculateShardCost();


  }
};



/* ===== assets/js/watchlist-professional.js ===== */

// ==========================================
// WATCHLIST PROFESSIONAL - COMPLETE & DEBUGGED
// ==========================================

// Add after the existing variables
let watchlistFilters = {
  position: '',
  league: '',
  team: '',
  nation: '',
  event: '',
  skill_moves: '',
  minOvr: 40,
  maxOvr: 150,
  searchQuery: '' // Track search query
};


console.log('🔥 WATCHLIST JS LOADED - v3.1 FINAL - ' + new Date().toISOString());

let watchlistData = [];
let filteredWatchlist = [];


function populateWatchlistFilters() {
    console.log('[WATCHLIST] Populating filters from', watchlistData.length, 'players');

    // Get unique values from watchlist players
    const positions = [...new Set(watchlistData.map(p => p.position).filter(Boolean))].sort();
    const leagues = [...new Set(watchlistData.map(p => p.league).filter(Boolean))].sort();
    const teams = [...new Set(watchlistData.map(p => p.team).filter(Boolean))].sort();
    const nations = [...new Set(watchlistData.map(p => p.nation).filter(Boolean))].sort();
    const events = [...new Set(watchlistData.map(p => p.event).filter(Boolean))].sort();

    // Populate Desktop Position dropdown
    const positionSelect = document.getElementById('watchlist-filter-position');
    if (positionSelect) {
        positionSelect.innerHTML = '<option value="">All Positions</option>' +
            positions.map(pos => `<option value="${pos}">${pos}</option>`).join('');
    }

    // Populate Desktop League dropdown
    const leagueSelect = document.getElementById('watchlist-filter-league');
    if (leagueSelect) {
        leagueSelect.innerHTML = '<option value="">All Leagues</option>' +
            leagues.map(league => `<option value="${league}">${league}</option>`).join('');
    }

    // Populate Desktop Team dropdown
    const teamSelect = document.getElementById('watchlist-filter-team');
    if (teamSelect) {
        teamSelect.innerHTML = '<option value="">All Clubs</option>' +
            teams.map(team => `<option value="${team}">${team}</option>`).join('');
    }

    // Populate Desktop Nation dropdown
    const nationSelect = document.getElementById('watchlist-filter-nation');
    if (nationSelect) {
        nationSelect.innerHTML = '<option value="">All Nations</option>' +
            nations.map(nation => `<option value="${nation}">${nation}</option>`).join('');
    }

    // Populate Desktop Event dropdown
    const eventSelect = document.getElementById('watchlist-filter-event');
    if (eventSelect) {
        eventSelect.innerHTML = '<option value="">All Events</option>' +
            events.map(event => `<option value="${event}">${event}</option>`).join('');
    }

    // ✅ FIX: Populate Mobile Position dropdown
    const mobilePositionSelect = document.getElementById('mobile-filter-position');
    if (mobilePositionSelect) {
        mobilePositionSelect.innerHTML = '<option value="">All Positions</option>' +
            positions.map(pos => `<option value="${pos}">${pos}</option>`).join('');
    }

    // ✅ FIX: Populate Mobile League dropdown
    const mobileLeagueSelect = document.getElementById('mobile-filter-league');
    if (mobileLeagueSelect) {
        mobileLeagueSelect.innerHTML = '<option value="">All Leagues</option>' +
            leagues.map(league => `<option value="${league}">${league}</option>`).join('');
    }

    // ✅ FIX: Populate Mobile Team dropdown
    const mobileTeamSelect = document.getElementById('mobile-filter-team');
    if (mobileTeamSelect) {
        mobileTeamSelect.innerHTML = '<option value="">All Clubs</option>' +
            teams.map(team => `<option value="${team}">${team}</option>`).join('');
    }

    // ✅ FIX: Populate Mobile Nation dropdown (note: this is an input, not select)
    // Since mobile nation is an autocomplete input, we'll handle it differently
    // We'll set a data attribute so the autocomplete knows which nations to show
    const mobileNationInput = document.getElementById('mobile-filter-nation');
    if (mobileNationInput) {
        mobileNationInput.setAttribute('data-watchlist-nations', JSON.stringify(nations));
    }

    // ✅ FIX: Populate Mobile Event dropdown
    const mobileEventSelect = document.getElementById('mobile-filter-event');
    if (mobileEventSelect) {
        mobileEventSelect.innerHTML = '<option value="">All Events</option>' +
            events.map(event => `<option value="${event}">${event}</option>`).join('');
    }

    console.log('[WATCHLIST] Filters populated:', {
        positions: positions.length,
        leagues: leagues.length,
        teams: teams.length,
        nations: nations.length,
        events: events.length
    });
}
// ==================== SETUP CLEAR ALL BUTTON (WITH DEBUG) ====================
function setupClearAllButton() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 [DEBUG] setupClearAllButton() called');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // ✅ FIX: Correct ID selector
  const clearBtn = document.querySelector('#clear-watchlist-filters'); // Changed from #watchlist-clear-filters
  
  if (!clearBtn) {
    console.error('❌ [DEBUG] Clear button NOT FOUND (#clear-watchlist-filters)');
    
    // Debug: show all available buttons
    const allButtons = document.querySelectorAll('#watchlist-view button');
    console.log(`🔍 [DEBUG] Available buttons: ${allButtons.length}`);
    allButtons.forEach((btn, i) => {
      console.log(`   Button ${i + 1}:`, {
        id: btn.id,
        className: btn.className,
        text: btn.textContent?.trim().substring(0, 50)
      });
    });
    return;
  }
  
  console.log('✅ [DEBUG] Clear button found!', clearBtn);
  
  // Remove any existing listeners by cloning
  const newBtn = clearBtn.cloneNode(true);
  clearBtn.parentNode.replaceChild(newBtn, clearBtn);
  console.log('🔄 [DEBUG] Cloned button to remove old listeners');
  
  // Add new listener
  newBtn.addEventListener('click', function(e) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [DEBUG] CLEAR BUTTON CLICKED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📞 [DEBUG] Calling clearWatchlistFilters()...');
    clearWatchlistFilters();
    
    console.log('🎉 [DEBUG] Filters cleared');
  });
  
  console.log('✅ [DEBUG] Event listener attached successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}


// ==================== CLEAR FILTERS (WITH DEBUG) ====================
function clearWatchlistFilters() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧹 [DEBUG] clearWatchlistFilters() STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📊 [DEBUG] BEFORE clearing:');
  console.log('   watchlistFilters:', JSON.stringify(watchlistFilters, null, 2));
  console.log('   filteredWatchlist.length:', filteredWatchlist.length);
  console.log('   watchlistData.length:', watchlistData.length);
  
  // Reset filter state
  watchlistFilters = {
    position: '',
    league: '',
    team: '',
    nation: '',
    event: '',
    skill_moves: '',
    minOvr: 40,
    maxOvr: 150,
    searchQuery: ''
  };
  
  console.log('✅ [DEBUG] Filter state reset');
  console.log('📊 [DEBUG] AFTER reset:');
  console.log('   watchlistFilters:', JSON.stringify(watchlistFilters, null, 2));
  
  // Reset Desktop UI
  console.log('🖥️ [DEBUG] Resetting desktop UI...');
  const desktopElements = {
    'watchlist-filter-position': '',
    'watchlist-filter-league': '',
    'watchlist-filter-team': '',
    'watchlist-filter-nation': '',
    'watchlist-filter-event': '',
    'watchlist-filter-skill': '',
    'watchlist-rating-min': 40,
    'watchlist-rating-max': 150,
    'watchlist-search-input': '' // Clear search input (FIXED: correct ID)
  };

  let resetCount = 0;
  Object.keys(desktopElements).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const oldValue = element.value;
      element.value = desktopElements[id];
      console.log(`   ✅ ${id}: "${oldValue}" → "${desktopElements[id]}"`);
      resetCount++;
    } else {
      console.warn(`   ❌ ${id}: NOT FOUND`);
    }
  });
  console.log(`🖥️ [DEBUG] Reset ${resetCount}/${Object.keys(desktopElements).length} desktop elements`);

  // Reset Mobile UI
  console.log('📱 [DEBUG] Resetting mobile UI...');
  const mobileElements = {
    'mobile-filter-position': '',
    'mobile-filter-league': '',
    'mobile-filter-team': '',
    'mobile-filter-nation': '',
    'mobile-filter-event': '',
    'mobile-filter-skill': '',
    'mobile-rating-min': 40,
    'mobile-rating-max': 150
  };

  let mobileResetCount = 0;
  Object.keys(mobileElements).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = mobileElements[id];
      console.log(`   ✅ ${id}: reset`);
      mobileResetCount++;
    }
  });
  console.log(`📱 [DEBUG] Reset ${mobileResetCount}/${Object.keys(mobileElements).length} mobile elements`);

  // Clear mobile search input (FIXED: use correct ID)
  const mobileSearchInput = document.querySelector('#watchlist-mobile-search');
  if (mobileSearchInput) {
    mobileSearchInput.value = '';
    console.log('📱 [DEBUG] Reset mobile search input');
  }

  // Apply filters
  console.log('🔄 [DEBUG] Calling applyWatchlistFilters()...');
  applyWatchlistFilters();
  console.log('✅ [DEBUG] applyWatchlistFilters() completed');
  
  // Update filter chips
  console.log('🏷️ [DEBUG] Calling updateActiveFilterChips()...');
  updateActiveFilterChips();
  console.log('✅ [DEBUG] updateActiveFilterChips() completed');
  
  // Sync filters
  console.log('🔄 [DEBUG] Calling syncDesktopFilters()...');
  syncDesktopFilters();
  console.log('✅ [DEBUG] syncDesktopFilters() completed');
  
  console.log('📊 [DEBUG] FINAL STATE:');
  console.log('   filteredWatchlist.length:', filteredWatchlist.length);
  console.log('   Active filter chips:', document.querySelectorAll('.filter-chip').length);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [DEBUG] clearWatchlistFilters() COMPLETED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}


function applyWatchlistFilters() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [APPLY FILTERS] Starting filter application');
    console.log('📊 [APPLY FILTERS] Total players:', watchlistData.length);
    console.log('🔍 [APPLY FILTERS] Current filters:', watchlistFilters);
    console.log('[WATCHLIST] Applying filters:', watchlistFilters);

    // Start with all watchlist data
    filteredWatchlist = watchlistData.filter(player => {
        // Search query filter - MUST BE FIRST
        if (watchlistFilters.searchQuery) {
            const query = watchlistFilters.searchQuery.toLowerCase();
            const name = (player.name || '').toLowerCase();
            const club = (player.team || '').toLowerCase();
            const league = (player.league || '').toLowerCase();
            const nation = (player.nation || '').toLowerCase();
            const position = (player.position || '').toLowerCase();

            const matchesSearch = name.includes(query) ||
                                 club.includes(query) ||
                                 league.includes(query) ||
                                 nation.includes(query) ||
                                 position.includes(query);

            if (!matchesSearch) return false;
        }

        // Position filter
        if (watchlistFilters.position && player.position !== watchlistFilters.position) {
            return false;
        }

        // League filter
        if (watchlistFilters.league && player.league !== watchlistFilters.league) {
            return false;
        }

        // Team filter
        if (watchlistFilters.team && player.team !== watchlistFilters.team) {
            return false;
        }

        // Nation filter
        if (watchlistFilters.nation && player.nation !== watchlistFilters.nation) {
            return false;
        }

        // Event filter
        if (watchlistFilters.event && player.event !== watchlistFilters.event) {
            return false;
        }


        // Skill Moves
        if (watchlistFilters.skill_moves &&
            String(player.skill_moves) !== String(watchlistFilters.skill_moves)) {
          return false;
        }

        // OVR range filter
        const ovr = player.overallrating || 0;
        if (ovr < watchlistFilters.minOvr || ovr > watchlistFilters.maxOvr) {
            return false;
        }

        return true;
    });

    console.log('[WATCHLIST] Filtered results:', filteredWatchlist.length, 'of', watchlistData.length);
    console.log('✅ [APPLY FILTERS] Filtered results:', filteredWatchlist.length, 'of', watchlistData.length);
    console.log('📋 [APPLY FILTERS] Sample filtered player:', filteredWatchlist[0]);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Re-render with filtered results
    renderWatchlist();

    // Update active filter chips
    updateActiveFilterChips();

    syncDesktopFilters();

    if (typeof updateWatchlistFilterBadge === 'function') {
        updateWatchlistFilterBadge();
    }
}


function setupWatchlistFilterListeners() {

    const bind = (elementId, callback) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener('change', callback);
        }
    };

    // POSITION
    bind('watchlist-filter-position', e => {
        watchlistFilters.position = e.target.value;
        applyWatchlistFilters();
    });

    bind('mobile-filter-position', e => {
        watchlistFilters.position = e.target.value;
        applyWatchlistFilters();
    });

    // LEAGUE
    bind('watchlist-filter-league', e => {
        watchlistFilters.league = e.target.value;
        applyWatchlistFilters();
    });

    bind('mobile-filter-league', e => {
        watchlistFilters.league = e.target.value;
        applyWatchlistFilters();
    });

    // TEAM
    bind('watchlist-filter-team', e => {
        watchlistFilters.team = e.target.value;
        applyWatchlistFilters();
    });

    bind('mobile-filter-team', e => {
        watchlistFilters.team = e.target.value;
        applyWatchlistFilters();
    });

    // NATION
    bind('watchlist-filter-nation', e => {
        watchlistFilters.nation = e.target.value;
        applyWatchlistFilters();
    });

    bind('mobile-filter-nation', e => {
        watchlistFilters.nation = e.target.value;
        applyWatchlistFilters();
    });

    // EVENT
    bind('watchlist-filter-event', e => {
        watchlistFilters.event = e.target.value;
        applyWatchlistFilters();
    });

    bind('mobile-filter-event', e => {
        watchlistFilters.event = e.target.value;
        applyWatchlistFilters();
    });

    // Skill Moves
    const skillSelect = document.getElementById('watchlist-filter-skill');
    if (skillSelect) {
      skillSelect.addEventListener('change', e => {
        watchlistFilters.skill_moves = e.target.value;
        applyWatchlistFilters();
      });
    }

    // OVR MIN
    bind('watchlist-rating-min', e => {
        watchlistFilters.minOvr = parseInt(e.target.value) || 40;
        applyWatchlistFilters();
    });

    bind('mobile-rating-min', e => {
        watchlistFilters.minOvr = parseInt(e.target.value) || 40;
        applyWatchlistFilters();
    });

    // OVR MAX
    bind('watchlist-rating-max', e => {
        watchlistFilters.maxOvr = parseInt(e.target.value) || 150;
        applyWatchlistFilters();
    });

    bind('mobile-rating-max', e => {
        watchlistFilters.maxOvr = parseInt(e.target.value) || 150;
        applyWatchlistFilters();
    });
}


function clearWatchlistFilters() {
  console.log('[WATCHLIST] Clearing all filters');

  // ✅ FIX: Reset filter state (including skill_moves and searchQuery)
  watchlistFilters = {
    position: '',
    league: '',
    team: '',
    nation: '',
    event: '',
    skill_moves: '', // ✅ FIXED: Was missing
    minOvr: 40,
    maxOvr: 150,
    searchQuery: '' // Reset search query
  };

  // ✅ FIX: Reset Desktop UI with null checks
  const desktopElements = {
    'watchlist-filter-position': '',
    'watchlist-filter-league': '',
    'watchlist-filter-team': '',
    'watchlist-filter-nation': '',
    'watchlist-filter-event': '',
    'watchlist-filter-skill': '', // ✅ FIXED: Was missing
    'watchlist-rating-min': 40,
    'watchlist-rating-max': 150,
    'watchlist-search-input': '' // Clear search input (FIXED: correct ID)
  };

  Object.keys(desktopElements).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = desktopElements[id];
      console.log(`[WATCHLIST] Reset ${id} to "${desktopElements[id]}"`);
    } else {
      console.warn(`[WATCHLIST] Element ${id} not found`);
    }
  });

  // ✅ FIX: Reset Mobile UI with null checks
  const mobileElements = {
    'mobile-filter-position': '',
    'mobile-filter-league': '',
    'mobile-filter-team': '',
    'mobile-filter-nation': '',
    'mobile-filter-event': '',
    'mobile-filter-skill': '', // If you have mobile skill filter
    'mobile-rating-min': 40,
    'mobile-rating-max': 150
  };

  Object.keys(mobileElements).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = mobileElements[id];
      console.log(`[WATCHLIST] Reset mobile ${id} to "${mobileElements[id]}"`);
    }
  });

  // Clear mobile search input (FIXED: use correct ID)
  const mobileSearchInput = document.querySelector('#watchlist-mobile-search');
  if (mobileSearchInput) {
    mobileSearchInput.value = '';
    console.log('[WATCHLIST] Reset mobile search input');
  }

  // ✅ FIX: Apply filters to show all players
  applyWatchlistFilters();
  
  // ✅ CRITICAL: Update filter chips (was missing!)
  updateActiveFilterChips();
  
  // ✅ FIX: Sync both desktop and mobile filters
  syncDesktopFilters();
  
  console.log('[WATCHLIST] All filters cleared successfully');
}

function updateActiveFilterChips() {
  const container = document.getElementById('watchlist-active-filters');
  if (!container) {
    console.warn('[WATCHLIST] Active filters container not found');
    return;
  }

  const chips = [];

  if (watchlistFilters.position) {
    chips.push(`<div class="filter-chip">Position: ${watchlistFilters.position} <button onclick="removeFilter('position')">×</button></div>`);
  }

  if (watchlistFilters.league) {
    chips.push(`<div class="filter-chip">League: ${watchlistFilters.league} <button onclick="removeFilter('league')">×</button></div>`);
  }

  if (watchlistFilters.team) {
    chips.push(`<div class="filter-chip">Team: ${watchlistFilters.team} <button onclick="removeFilter('team')">×</button></div>`);
  }

  if (watchlistFilters.nation) {
    chips.push(`<div class="filter-chip">Nation: ${watchlistFilters.nation} <button onclick="removeFilter('nation')">×</button></div>`);
  }

  if (watchlistFilters.event) {
    chips.push(`<div class="filter-chip">Event: ${watchlistFilters.event} <button onclick="removeFilter('event')">×</button></div>`);
  }

  // ✅ FIX: Include skill_moves filter chip
  if (watchlistFilters.skill_moves) {
    chips.push(`<div class="filter-chip">Skill Moves: ${watchlistFilters.skill_moves}★ <button onclick="removeFilter('skill_moves')">×</button></div>`);
  }

  if (watchlistFilters.minOvr !== 40 || watchlistFilters.maxOvr !== 150) {
    chips.push(`<div class="filter-chip">OVR: ${watchlistFilters.minOvr}-${watchlistFilters.maxOvr} <button onclick="removeFilter('ovr')">×</button></div>`);
  }

  // ✅ FIX: Clear container properly
  container.innerHTML = chips.length > 0 ? chips.join('') : '';
  
  console.log(`[WATCHLIST] Updated filter chips: ${chips.length} active filters`);
}

function removeFilter(filterName) {
  console.log(`[WATCHLIST] Removing filter: ${filterName}`);
  
  if (filterName === 'position') {
    watchlistFilters.position = '';
    const el = document.getElementById('watchlist-filter-position');
    if (el) el.value = '';
  } else if (filterName === 'league') {
    watchlistFilters.league = '';
    const el = document.getElementById('watchlist-filter-league');
    if (el) el.value = '';
  } else if (filterName === 'team') {
    watchlistFilters.team = '';
    const el = document.getElementById('watchlist-filter-team');
    if (el) el.value = '';
  } else if (filterName === 'nation') {
    watchlistFilters.nation = '';
    const el = document.getElementById('watchlist-filter-nation');
    if (el) el.value = '';
  } else if (filterName === 'event') {
    watchlistFilters.event = '';
    const el = document.getElementById('watchlist-filter-event');
    if (el) el.value = '';
  } else if (filterName === 'skill_moves') { // ✅ NEW
    watchlistFilters.skill_moves = '';
    const el = document.getElementById('watchlist-filter-skill');
    if (el) el.value = '';
  } else if (filterName === 'ovr') {
    watchlistFilters.minOvr = 40;
    watchlistFilters.maxOvr = 150;
    const minEl = document.getElementById('watchlist-rating-min');
    const maxEl = document.getElementById('watchlist-rating-max');
    if (minEl) minEl.value = 40;
    if (maxEl) maxEl.value = 150;
  }

  applyWatchlistFilters();
}


// Initialize watchlist when view is shown
function initProfessionalWatchlist() {
  console.log('[WATCHLIST] Initializing Professional Watchlist');
  
  const watchlistView = document.getElementById('watchlist-view');
  if (!watchlistView) {
    console.error('[WATCHLIST] Watchlist view not found');
    return;
  }

  // Load watchlist data
  loadWatchlistData();
  
  // Populate filter dropdowns
  console.log('[DEBUG] About to populate filters...');
  populateWatchlistFilters();
  
  // Setup filter listeners
  console.log('[DEBUG] About to setup filter listeners...');
  setupWatchlistFilterListeners();
  
  // ✅ CRITICAL: Setup event listeners (including clear button)
  console.log('[DEBUG] About to setup watchlist events...');
  setupWatchlistEvents();
  
  console.log('✅ [DEBUG] initProfessionalWatchlist() completed');
}




// Load watchlist data from localStorage
function loadWatchlistData() {
  console.log('[WATCHLIST] Loading data from localStorage');
  
  try {
    const raw = localStorage.getItem('watchlistPlayers');
    console.log('[WATCHLIST] Raw localStorage data:', raw);
    
    if (raw) {
      const parsed = JSON.parse(raw);
      console.log('[WATCHLIST] Parsed player count:', parsed.length);
      
      if (parsed.length > 0) {
        console.log('[WATCHLIST] First player sample:', parsed[0]);
        console.log('[WATCHLIST] First player keys:', Object.keys(parsed[0]));
      }

      // ✅ FIX: Map the data with correct player_id AND nation_region priority
      watchlistData = parsed.map(player => {
        // Use correct priority: player_id > playerid > id
        const actualPlayerId = player.player_id || player.playerid || player.id;
        
        // ✅ CRITICAL FIX: Get nation from correct field
        const nation = player.nation_region || player.nationregion || player.nation || player.nationality || 'NA';
        
        console.log(`[WATCHLIST] Player ${player.name} nation:`, nation, '(from:', 
                    player.nation_region ? 'nation_region' : 
                    player.nationregion ? 'nationregion' : 
                    player.nation ? 'nation' : 
                    player.nationality ? 'nationality' : 'default NA', ')');
        
        return {
          // CRITICAL: Store as player_id for API compatibility
          player_id: actualPlayerId,
          id: actualPlayerId,
          playerid: actualPlayerId,
          
          name: player.name || 'Unknown',
          position: player.position || 'NA',
          team: player.team || player.club || 'NA',
          league: player.league || 'NA',
          
          // ✅ FIX: Use correct nation field with proper fallbacks
          nation: nation,
          nation_region: nation, // Also store with API field name
          nationregion: nation,   // Also store with snake_case
          
          overallrating: player.ovr || player.overallrating || player.rating || 0,
          ovr: player.ovr || player.overallrating || player.rating || 0,
          rank: player.rank || 0,
          skillmoves: player.skillmoves || player.skills || player.sm || 0,
          
          // Stats
          pace: player.pace || 0,
          shooting: player.shooting || 0,
          passing: player.passing || 0,
          dribbling: player.dribbling || 0,
          defending: player.defending || 0,
          physical: player.physical || 0,
          
          // Images - support both naming conventions
          playerimage: player.playerimage || player.player_image || player.imageurl || '',
          cardbackground: player.cardbackground || player.card_background || '',
          nationflag: player.nationflag || player.nation_flag || player.nationflagurl || '',
          clubflag: player.clubflag || player.club_flag || player.clublogourl || '',
          
          // Colors
          colorname: player.colorname || player.color_name || '#FFFFFF',
          colorrating: player.colorrating || player.color_rating || '#FFB86B',
          colorposition: player.colorposition || player.color_position || '#FFFFFF',
          
          // Price
          price: player.price || 0,
          
          // Keep original data
          ...player
        };
      });

      filteredWatchlist = [...watchlistData];
      console.log('[WATCHLIST] Loaded', watchlistData.length, 'players');
      console.log('[WATCHLIST] Sample nations:', watchlistData.slice(0, 3).map(p => p.nation));
      
    } else {
      watchlistData = [];
      filteredWatchlist = [];
      console.log('[WATCHLIST] No saved players found in localStorage');
    }

    console.log('[DEBUG] Data loaded, populating filters...');
    populateWatchlistFilters();
    
    console.log('[DEBUG] Setting up filter listeners...');
    setupWatchlistFilterListeners();
    
    console.log('[DEBUG] loadWatchlistData completed');
    
    // Render after loading
    renderWatchlist();

  } catch (error) {
    console.error('[WATCHLIST] Error loading data:', error);
    watchlistData = [];
    filteredWatchlist = [];
    renderWatchlist();
  }
}



// Render the complete watchlist
function renderWatchlist() {
  console.log('🎨 [WATCHLIST] === RENDER START ===');

  const watchlistView = document.getElementById('watchlist-view');
  if (!watchlistView) {
    console.error('❌ [WATCHLIST] Watchlist view not found');
    return;
  }

  const count = filteredWatchlist.length;
  console.log('📊 [WATCHLIST] Player count:', count);

  // Update count badge
  updateWatchlistCountBadge(count);

  // Render grid - look for multiple possible container classes
  const gridContainer = watchlistView.querySelector('.watchlist-grid') || 
                       watchlistView.querySelector('.players-grid') || 
                       watchlistView.querySelector('#watchlist-players-grid');

  console.log('🎯 [WATCHLIST] Grid container found:', !!gridContainer);
  console.log('🏷️ [WATCHLIST] Grid container class:', gridContainer?.className);

  if (!gridContainer) {
    console.error('❌ [WATCHLIST] Grid container not found');
    return;
  }

  if (count === 0) {
    console.log('📭 [WATCHLIST] No players, showing empty state');
    showEmptyState();
    gridContainer.innerHTML = '';
  } else {
    console.log('✨ [WATCHLIST] Rendering', count, 'players');
    hideEmptyState();

    // Create all cards as HTML strings
    const allCardsHTML = filteredWatchlist.map((player, index) => {
      console.log(`🃏 [WATCHLIST] Creating card ${index + 1}/${count} for ${player.name}`);
      return createPlayerCardHTML(player);
    }).join('');

    console.log('📝 [WATCHLIST] Total HTML length:', allCardsHTML.length);
    console.log('🔍 [WATCHLIST] First 100 chars:', allCardsHTML.substring(0, 100));

    // Set innerHTML once
    gridContainer.innerHTML = allCardsHTML;

    // ✅ ATTACH EVENT LISTENERS AFTER RENDER
    attachWatchlistEventListeners();

    console.log('✅ [WATCHLIST] Cards rendered successfully');
  }

  console.log('🎨 [WATCHLIST] === RENDER END ===');
}

// Create player row HTML - EXACT MATCH TO DATABASE VIEW
function createPlayerCardHTML(player) {
  const initials = getPlayerInitials(player.name || 'Unknown');
  const hasImage = player.imageurl && player.imageurl !== '';
  const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
  const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
  const untradableBadgeHTML = isUntradable
    ? `<div class="card-untradable-badge" style="pointer-events: none;">
         <img src="assets/images/untradable_img.png" alt="Untradable">
       </div>`
    : '';
  
  // Process alternate positions
  const alternatePosition = player.alternate_position || player.alternateposition || '';
  const altPositionsArray = alternatePosition ? alternatePosition.split(',').map(p => p.trim()) : [];
  const hasAltPositions = altPositionsArray.filter(pos => pos && pos !== '0' && pos !== 0).length > 0;

  // Create a container div to set CSS custom properties
  const playerRow = document.createElement('div');
  playerRow.className = 'player-row';
  
  // ✅ FIX: Use player_id (the actual database ID) instead of just id
  const actualPlayerId = player.player_id || player.playerid || player.id;
  playerRow.dataset.playerId = actualPlayerId;
  
  // ✅ FIX: Also store the full player object as JSON for fallback
  playerRow.dataset.playerData = JSON.stringify({
    player_id: actualPlayerId,
    name: player.name,
    position: player.position,
    rank: player.rank || 0
  });
  
  // Set CSS custom properties for dynamic colors
  playerRow.style.setProperty('--player-name-color', player.colorname || player.color_name || '#FFFFFF');
  playerRow.style.setProperty('--player-ovr-color', player.colorrating || player.color_rating || '#FFB86B');
  playerRow.style.setProperty('--player-position-color', player.colorposition || player.color_position || '#FFFFFF');

  playerRow.innerHTML = `
    <!-- Player Card Left Section -->
    <div class="player-row-card">
      <div class="player-card-badge"></div>
      <div class="player-card-image-placeholder">

        <!-- Card Background -->
        ${player.cardbackground || player.card_background ? `
          <img src="${player.cardbackground || player.card_background}" 
               alt="Card Background" 
               class="player-row-card-bg"
               onerror="this.style.display='none'">
        ` : ''}

        <!-- Player Image -->
        ${player.playerimage || player.player_image ? `
          <img src="${player.playerimage || player.player_image}" 
               alt="${player.name}"
               class="player-row-main-img"
               onerror="this.style.display='none'; this.nextElementSibling.classList.remove('player-initials-hidden')">
          <span class="player-initials player-initials-hidden">${getInitials(player.name)}</span>
        ` : `
          <span class="player-initials">${getInitials(player.name)}</span>
        `}

        <!-- Player Name Overlay -->
        <div class="player-row-name">
          ${player.name}
        </div>

        <!-- OVR Rating -->
        <div class="player-row-ovr">
          ${player.ovr && player.ovr > 0 ? player.ovr : '?'}
        </div>

        <!-- Position Badge -->
        <div class="player-row-position">
          ${player.position || '?'}
        </div>

        <img src="${player.nationflag}" 
             alt="Nation" 
             class="player-card-nation-flag ${getPlayerType(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}"
             onerror="this.style.display='none'">
        
        <img src="${player.clubflag}" 
             alt="Club" 
             class="player-card-club-flag ${getPlayerType(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}"
             onerror="this.style.display='none'">
        
        ${getPlayerType(player) === 'normal' && player.league_image ? `
            <img src="${player.league_image}" 
                 alt="League" 
                 class="player-card-league-watchlist-flag normal-league-watchlist-flag" 
                 onerror="this.style.display='none'">
        ` : ''}
        ${untradableBadgeHTML}

      </div>
    </div>

    <!-- Player Info Middle Section -->
    <div class="player-row-info">
      <div class="player-info-name">${player.name || 'Unknown'}</div>
      <div class="player-info-meta">${player.team || 'NA'} • ${player.league || 'NA'}</div>
      ${hasAltPositions 
        ? `<div class="player-info-secondary">
            ${altPositionsArray.filter(pos => pos && pos !== '0' && pos !== 0).map(pos => `<span class="secondary-position-badge">${pos}</span>`).join('')}
          </div>`
        : ''
      }
    </div>

    <!-- Stats Grid Right Section -->
    <div class="player-row-stats">
      <div class="stat-pill">
        <div class="stat-pill-value">${player.pace || 0}</div>
        <div class="stat-pill-label">PAC</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-value">${player.shooting || 0}</div>
        <div class="stat-pill-label">SHO</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-value">${player.passing || 0}</div>
        <div class="stat-pill-label">PAS</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-value">${player.dribbling || 0}</div>
        <div class="stat-pill-label">DRI</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-value">${player.defending || 0}</div>
        <div class="stat-pill-label">DEF</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-value">${player.physical || 0}</div>
        <div class="stat-pill-label">PHY</div>
      </div>
    </div>

    <!-- Watchlist Button -->
    <button class="player-row-watchlist active" 
            data-player-id="${actualPlayerId}" 
            title="Remove from watchlist">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  `;

  return playerRow.outerHTML;
}





// ✅ ATTACH EVENT LISTENERS TO ALL WATCHLIST BUTTONS
function attachWatchlistEventListeners() {
  console.log('[WATCHLIST] Attaching event listeners to player rows and buttons');

  // PLAYER ROW CLICK - Open Detail
  const playerRows = document.querySelectorAll('#watchlist-view .player-row');
  console.log('[WATCHLIST] Found', playerRows.length, 'player rows');

  playerRows.forEach((row, index) => {
    const playerId = row.dataset.playerId;
    
    // ✅ FIX: Get full player data for fallback
    let fallbackPlayer = null;
    try {
      if (row.dataset.playerData) {
        fallbackPlayer = JSON.parse(row.dataset.playerData);
      }
    } catch (e) {
      console.error('[WATCHLIST] Error parsing player data:', e);
    }
    
    // ✅ ALSO: Try to find full player object from watchlistData
    const fullPlayer = watchlistData.find(p => 
      (p.player_id || p.playerid || p.id) === playerId
    );
    
    console.log('[WATCHLIST] Attaching row click listener', index + 1, 'for player ID:', playerId);

    row.addEventListener('click', function(e) {
        if (e.target.closest('.player-row-watchlist')) return;
        console.log('[WATCHLIST] Row clicked! Opening player detail for ID:', playerId);
        const pid = playerId;
        if (!pid || pid === 'undefined') {
            console.error('[WATCHLIST] Invalid player ID', pid);
            return;
        }
        if (window.ZRouter) {
            ZRouter.navigate(`/player/${pid}`);
        } else if (typeof viewPlayerDetail === 'function') {
            viewPlayerDetail(pid, fullPlayer || fallbackPlayer);
        } else {
            console.error('[WATCHLIST] Neither ZRouter nor viewPlayerDetail found!');
        }
    });
    row.style.cursor = 'pointer';
  });

  // HEART BUTTON CLICK - Remove from Watchlist
  const buttons = document.querySelectorAll('#watchlist-view .player-row-watchlist');
  console.log('[WATCHLIST] Found', buttons.length, 'watchlist buttons');

  buttons.forEach((btn, index) => {
    const playerId = btn.dataset.playerId;
    console.log('[WATCHLIST] Attaching button listener', index + 1, 'for player ID:', playerId);

    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent row click
      e.preventDefault();
      console.log('[WATCHLIST] Heart clicked! Removing player:', playerId);
      removePlayerFromWatchlist(playerId);
    });
  });

  console.log('[WATCHLIST] All event listeners attached successfully');
}



// Setup event listeners for search and sort
function setupWatchlistEvents() {
  console.log('[WATCHLIST] Setting up event listeners');

  // Search input - desktop (FIXED: correct ID)
  const searchInput = document.querySelector('#watchlist-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleWatchlistSearch, 300));
    console.log('[WATCHLIST] Desktop search listener attached to #watchlist-search-input');
  } else {
    console.error('[WATCHLIST] Desktop search input NOT FOUND (#watchlist-search-input)');
  }

  // Search input - mobile
  const mobileSearchInput = document.querySelector('#watchlist-mobile-search');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', debounce(handleWatchlistSearch, 300));
    console.log('[WATCHLIST] Mobile search listener attached to #watchlist-mobile-search');
  } else {
    console.error('[WATCHLIST] Mobile search input NOT FOUND (#watchlist-mobile-search)');
  }

  // Sort select (FIXED: correct ID)
  const sortSelect = document.querySelector('#watchlist-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleWatchlistSort);
    console.log('[WATCHLIST] Sort listener attached to #watchlist-sort-select');
  } else {
    console.error('[WATCHLIST] Sort select NOT FOUND (#watchlist-sort-select)');
  }

  // ✅ CRITICAL: Call setupClearAllButton
  console.log('[WATCHLIST] About to setup clear button...');
  setupClearAllButton();
  console.log('[WATCHLIST] Clear button setup completed');
}


// Handle search
function handleWatchlistSearch(event) {
  const query = (event.target ? event.target.value : event).trim();
  console.log('🔍 [WATCHLIST] Search query:', query);

  // Update filter state
  watchlistFilters.searchQuery = query;

  // Apply all filters (including search)
  applyWatchlistFilters();
}

// Handle sort
function handleWatchlistSort(e) {
  const value = e.target.value;

  if (!value) return;

  const [field, direction] = value.split('_');

  filteredWatchlist.sort((a, b) => {
    if (direction === 'asc') {
      return (a[field] || 0) - (b[field] || 0);
    } else {
      return (b[field] || 0) - (a[field] || 0);
    }
  });

  renderWatchlist();
}

// Remove player from watchlist
function removePlayerFromWatchlist(playerId) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️ [REMOVE] Starting removal for player ID:', playerId);
    
    // Remove from localStorage
    let watchlistIds = JSON.parse(localStorage.getItem('watchlist') || '[]');
    let savedPlayers = JSON.parse(localStorage.getItem('watchlistPlayers') || '[]');
    
    console.log('📦 [REMOVE] watchlistIds BEFORE:', watchlistIds);
    
    // ✅ FIX: Filter by checking if ID starts with playerId (handles _0_1 format)
    watchlistIds = watchlistIds.filter(id => {
      const idStr = String(id);
      const playerIdStr = String(playerId);
      // Check if id starts with playerId (e.g., "30907110" matches "30907110_0_1")
      return !idStr.startsWith(playerIdStr + '_') && idStr !== playerIdStr;
    });
    
    savedPlayers = savedPlayers.filter(p => {
      const pId = String(p.playerid || p.player_id || p.id);
      const playerIdStr = String(playerId);
      return pId !== playerIdStr;
    });
    
    console.log('📦 [REMOVE] watchlistIds AFTER:', watchlistIds);
    
    localStorage.setItem('watchlist', JSON.stringify(watchlistIds));
    localStorage.setItem('watchlistPlayers', JSON.stringify(savedPlayers));
    console.log('💾 [REMOVE] Saved to localStorage');
    
    // ✅ FIX: Update window.state.watchlist (now it should exist)
    if (window.state && window.state.watchlist) {
      console.log('📋 [REMOVE] window.state.watchlist BEFORE:', window.state.watchlist);
      
      // Filter using same logic
      window.state.watchlist = window.state.watchlist.filter(id => {
        const idStr = String(id);
        const playerIdStr = String(playerId);
        return !idStr.startsWith(playerIdStr + '_') && idStr !== playerIdStr;
      });
      
      console.log('📋 [REMOVE] window.state.watchlist AFTER:', window.state.watchlist);
    } else {
      console.warn('⚠️ [REMOVE] window.state.watchlist does not exist, creating it...');
      // Create it if it doesn't exist
      if (!window.state) window.state = {};
      window.state.watchlist = watchlistIds;
    }
    
    // ✅ UPDATE: Call global function to update database view hearts
    if (typeof updateAllWatchlistButtons === 'function') {
      console.log('🔄 [REMOVE] Calling updateAllWatchlistButtons...');
      updateAllWatchlistButtons();
      console.log('✅ [REMOVE] Database view hearts updated');
    }
    
    // Reload watchlist view
    loadWatchlistData();
    
    // Update specific button
    updateWatchlistButton(playerId, false);
    
    console.log('✅ [REMOVE] Removal complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ [REMOVE] Error:', error);
  }
}




// Update watchlist count badge
function updateWatchlistCountBadge(count) {
  // Update results info text
  const resultsInfo = document.querySelector('#watchlist-results-count');
  if (resultsInfo) {
    resultsInfo.textContent = `${count} player${count !== 1 ? 's' : ''} in watchlist`;
  }

  // Update badge in header if it exists
  const countBadge = document.querySelector('.watchlist-count-badge');
  if (countBadge) {
    countBadge.textContent = `${count} Player${count !== 1 ? 's' : ''}`;
  }
}

// Show empty state
function showEmptyState() {
  const emptyState = document.querySelector('.watchlist-empty-state') || 
                    document.querySelector('.watchlist-empty') || 
                    document.querySelector('#watchlist-empty-state');
  if (emptyState) {
    emptyState.style.display = 'flex';
  }
}

// Hide empty state
function hideEmptyState() {
  const emptyState = document.querySelector('.watchlist-empty-state') || 
                    document.querySelector('.watchlist-empty') || 
                    document.querySelector('#watchlist-empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

// Update watchlist button state in database view
function updateWatchlistButton(playerId, isInWatchlist) {
  const button = document.querySelector(`[data-player-id="${playerId}"] .btn-icon`);
  if (button) {
    if (isInWatchlist) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Get player initials
function getPlayerInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Format price
function formatPrice(price) {
  if (!price || price === 0) return 'NA';

  if (price >= 1000000000) {
    return (price / 1000000000).toFixed(2) + 'B';
  } else if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(1) + 'K';
  }
  return price.toString();
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// INITIALIZATION
// INITIALIZATION
// Just log DOM readiness. The main app (app.js) will call
// initProfessionalWatchlist() whenever the watchlist view is shown.

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[WATCHLIST] DOM loaded for Professional Watchlist');
    });
} else {
    console.log('[WATCHLIST] DOM already loaded for Professional Watchlist');
}


function syncDesktopFilters() {
    if (document.getElementById('watchlist-filter-position'))
        document.getElementById('watchlist-filter-position').value = watchlistFilters.position;

    if (document.getElementById('watchlist-filter-league'))
        document.getElementById('watchlist-filter-league').value = watchlistFilters.league;

    if (document.getElementById('watchlist-filter-team'))
        document.getElementById('watchlist-filter-team').value = watchlistFilters.team;

    if (document.getElementById('watchlist-filter-nation'))
        document.getElementById('watchlist-filter-nation').value = watchlistFilters.nation;

    if (document.getElementById('watchlist-filter-event'))
        document.getElementById('watchlist-filter-event').value = watchlistFilters.event;
}

// ==========================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ==========================================

window.initProfessionalWatchlist = initProfessionalWatchlist;
window.loadWatchlistData = loadWatchlistData;
window.removePlayerFromWatchlist = removePlayerFromWatchlist;

console.log("✅ WATCHLIST: Watchlist Professional JS loaded successfully - v3.1");


// ==================== DEBUG ON LOAD ====================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 [DEBUG] watchlist-professional.js LOADED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ clearWatchlistFilters:', typeof clearWatchlistFilters);
console.log('✅ setupClearAllButton:', typeof setupClearAllButton);
console.log('✅ applyWatchlistFilters:', typeof applyWatchlistFilters);
console.log('✅ updateActiveFilterChips:', typeof updateActiveFilterChips);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');




/* ===== assets/js/refresh-time.js ===== */

/**
 * ============================================================================
 * REFRESH TIME DISPLAY MODULE - FULLY OPTIMIZED & CORRECTED
 * ============================================================================
 * Handles player refresh time calculations with automatic timezone detection
 * and real-time countdown updates
 */

// ============================================================================
// 1. TIMEZONE AUTO-DETECTION
// ============================================================================
async function getUserTimezone() {
  try {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[REFRESH] Browser timezone:', browserTz);
    return browserTz;
  } catch (error) {
    console.error('[REFRESH] Error detecting timezone:', error);
    return 'UTC'; // Fallback
  }
}

// ============================================================================
// 2. PARSE REFRESH TIME FROM STRING
// ============================================================================
function parseRefreshTime(timeStr) {
  if (!timeStr) return null;

  try {
    // Parse 12-hour format: "1:24:25 PM" or "01:30:45 AM"
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]);
      const meridiem = timeMatch[4].toUpperCase();

      // Convert to 24-hour format
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }

      // Create UTC date object
      const now = new Date();
      const dt = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        seconds
      ));

      console.log('[REFRESH] Parsed time:', timeStr, '->', dt.toISOString());
      return dt;
    }

    // Try 24-hour format: "HH:MM:SS"
    const time24Match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (time24Match) {
      const hours = parseInt(time24Match[1]);
      const minutes = parseInt(time24Match[2]);
      const seconds = parseInt(time24Match[3]);

      const now = new Date();
      const dt = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        seconds
      ));

      console.log('[REFRESH] Parsed 24h time:', timeStr, '->', dt.toISOString());
      return dt;
    }

    console.error('[REFRESH] Could not parse time format:', timeStr);
    return null;
  } catch (error) {
    console.error('[REFRESH] Error parsing time:', error);
    return null;
  }
}

// ============================================================================
// 3. GET ALL REFRESH TIMES (for given base time)
// ============================================================================
function getAllRefreshTimes(baseTime) {
  const now = new Date();
  const refreshTimes = [];

  // Create base datetime from base time
  const baseHours = baseTime.getUTCHours();
  const baseMinutes = baseTime.getUTCMinutes();
  const baseSeconds = baseTime.getUTCSeconds();

  // Generate refresh times for yesterday, today, tomorrow
  for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    baseDate.setUTCHours(baseHours, baseMinutes, baseSeconds, 0);

    // Generate times (every 2 hours for 12 hours from base)
    for (let i = -6; i <= 6; i++) {
      const refreshTime = new Date(baseDate);
      refreshTime.setHours(refreshTime.getHours() + i * 2);
      refreshTimes.push(refreshTime);
    }
  }

  // Remove duplicates and sort
  const uniqueTimes = [...new Set(refreshTimes.map(t => t.getTime()))];
  return uniqueTimes.map(t => new Date(t)).sort((a, b) => a - b);
}

// ============================================================================
// 4. GET NEXT REFRESH TIME
// ============================================================================
// ============================================================================
// 4. GET NEXT REFRESH TIME
// ============================================================================
function getNextRefresh(baseTime) {
  const now = new Date();
  const allRefreshes = getAllRefreshTimes(baseTime);

  // Filter to get only future refresh times
  let futureRefreshes = allRefreshes.filter(r => r > now);

  // If no future times, generate more for tomorrow
  if (futureRefreshes.length === 0) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setUTCHours(baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds(), 0);

    for (let i = 0; i < 12; i++) {
      const refreshTime = new Date(tomorrow);
      refreshTime.setHours(refreshTime.getHours() + i * 2);
      futureRefreshes.push(refreshTime);
    }

    // Sort again after adding new times
    futureRefreshes.sort((a, b) => a - b);
  }

  return futureRefreshes[0] || null;
}

// ============================================================================
// 4B. GET UPCOMING REFRESHES (after the next one)
// ============================================================================
function getUpcomingRefreshes(baseTime, count = 2) {
  const now = new Date();
  const allRefreshes = getAllRefreshTimes(baseTime);

  // Filter to get only future refresh times
  let futureRefreshes = allRefreshes.filter(r => r > now);

  // If not enough future times, generate more
  if (futureRefreshes.length < count + 1) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setUTCHours(baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds(), 0);

    for (let i = 0; i < 12; i++) {
      const refreshTime = new Date(tomorrow);
      refreshTime.setHours(refreshTime.getHours() + i * 2);
      futureRefreshes.push(refreshTime);
    }

    // Sort again after adding new times
    futureRefreshes.sort((a, b) => a - b);
  }

  // Return the next 'count' refreshes (skip the first one, which is the "next" refresh)
  return futureRefreshes.slice(1, count + 1);
}


// ============================================================================
// 5. FORMAT TIME UNTIL REFRESH
// ============================================================================
function formatTimeUntil(targetTime) {
  const now = new Date();
  const delta = targetTime - now;

  if (delta <= 0) {
    return 'Refreshing...';
  }

  const hours = Math.floor(delta / (1000 * 60 * 60));
  const minutes = Math.floor((delta / (1000 * 60)) % 60);

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  } else {
    return `in ${minutes}m`;
  }
}

// ============================================================================
// 6. FETCH REFRESH DATA FROM SUPABASE
// ============================================================================
async function fetchPlayerRefreshData(playerId) {
  console.log('[REFRESH-DEBUG] fetchPlayerRefreshData called with playerId =', playerId);

  try {
    if (!window.supabaseClient) {
      console.error('[REFRESH-DEBUG] window.supabaseClient is NOT defined');
      return null;
    }

    console.log('[REFRESH-DEBUG] Querying table: player_refresh_data');

    const { data, error } = await window.supabaseClient
      .from('player_refresh_data')        // ✅ FIXED
      .select('player_id, refresh_time, name, ovr')  // ✅ FIXED
      .eq('player_id', playerId)          // ✅ FIXED
      .maybeSingle();

    console.log('[REFRESH-DEBUG] Supabase response -> data:', data, 'error:', error);

    if (error) {
      console.error('[REFRESH-DEBUG] Supabase error:', error);
      return null;
    }

    if (!data) {
      console.warn('[REFRESH-DEBUG] No row found for player_id =', playerId);
      return null;
    }

    if (!data.refresh_time) {  // ✅ FIXED
      console.warn('[REFRESH-DEBUG] Row found but refresh_time is NULL/empty for player_id =', playerId, 'row =', data);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[REFRESH-DEBUG] Exception in fetchPlayerRefreshData:', err);
    return null;
  }
}



// ============================================================================
// 7. BUILD REFRESH TIME CONTAINER (MAIN FUNCTION)
// ============================================================================
async function buildRefreshTimeContainer(player) {
  try {
    // Fetch refresh data from Supabase
    const refreshData = await fetchPlayerRefreshData(player.player_id);  // ✅ CORRECT

    console.log('[REFRESH] Raw refresh data:', refreshData);
    console.log('[REFRESH] Raw refreshtime value:', refreshData?.refreshtime);

    // Validate data
    if (!refreshData) {
      console.warn('[REFRESH-DEBUG] buildRefreshTimeContainer: refreshData is null for player', player.player_id);
      return '';
    }


    if (!refreshData.refresh_time) {
      console.warn('[REFRESH-DEBUG] buildRefreshTimeContainer: refreshtime is missing for player', player.playerid, 'data =', refreshData);
      return `<div class="player-refresh-container" style="background: var(--color-graphite-800); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px; text-align: center;">
        <div style="font-size: 14px; color: var(--color-text-muted); font-weight: 600;">No refreshtime value for this player</div>
      </div>`;
    }



    // Parse refresh time
    const baseTime = parseRefreshTime(refreshData.refresh_time);
    if (!baseTime) {
      return `<div class="player-refresh-container" style="background: var(--color-graphite-800); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px; text-align: center;">
        <div style="font-size: 14px; color: var(--color-text-muted); font-weight: 600;">Invalid refresh time format</div>
      </div>`;
    }

    // Get user timezone
    const userTz = await getUserTimezone();

    // Get next refresh time (SINGLE DECLARATION - NO REDECLARATION)
    const nextRefreshTime = getNextRefresh(baseTime);
    if (!nextRefreshTime) {
      return `<div class="player-refresh-container" style="background: var(--color-graphite-800); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px; text-align: center;">
        <div style="font-size: 14px; color: var(--color-text-muted); font-weight: 600;">Unable to calculate next refresh</div>
      </div>`;
    }

    // Format time
    let timeStr = 'N/A';
    let countdown = 'Calculating...';

    try {
      timeStr = nextRefreshTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: userTz
      });

      countdown = formatTimeUntil(nextRefreshTime);
      console.log('[REFRESH] Next refresh:', nextRefreshTime.toISOString());
      console.log('[REFRESH] User timezone:', userTz);
      console.log('[REFRESH] Formatted time:', timeStr);
    } catch (error) {
      console.error('[REFRESH] Error formatting time:', error);
      timeStr = 'Error';
      countdown = 'N/A';
    }

    // Get timezone abbreviation
    const tzAbbr = userTz.split('/').pop().replace(/_/g, ' ');
    const containerId = `refresh-container-${player.player_id}`;  // ✅ CORRECT

    // Get next 2 upcoming refreshes
    const upcomingRefreshes = getUpcomingRefreshes(baseTime, 2);

    // Format upcoming refreshes HTML
    let upcomingHtml = '';
    if (upcomingRefreshes.length > 0) {
      upcomingHtml = upcomingRefreshes.map(refresh => {
        const upcomingTimeStr = refresh.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: userTz
        });
        return `<div style="font-size: 13px; color: var(--color-text-muted); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">• ${upcomingTimeStr}</div>`;
      }).join('');
    }


    // Start countdown timer
    setTimeout(() => startRefreshCountdown(containerId, nextRefreshTime), 100);

    // Return HTML
    return `<div id="${containerId}" class="player-refresh-container" style="background: var(--color-graphite-800); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px;">
      <!-- Title -->
      <div style="font-size: 16px; font-weight: 800; color: var(--color-text-primary); margin: 0 0 18px 0; text-transform: uppercase; font-family: var(--font-family-base); letter-spacing: 0.5px; display: flex; align-items: center; gap: 10px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Market Refresh
      </div>

      <!-- Next Refresh Time -->
      <div style="background: rgba(0, 194, 168, 0.08); border: 1px solid rgba(0, 194, 168, 0.25); border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--color-text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px;">Next Refresh</div>
        
        <!-- Time and Countdown on same line -->
        <div class="player-refresh-time-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div class="player-refresh-time" style="font-size: 20px; font-weight: 900; color: var(--color-teal-500); font-family: var(--font-family-base);">${timeStr}</div>
          <div class="player-refresh-countdown" style="font-size: 14px; font-weight: 700; color: var(--color-teal-500); background: rgba(0,194,168,0.15); padding: 6px 12px; border-radius: 6px;">
            <span id="refresh-countdown-${player.player_id}">${countdown}</span>
          </div>
        </div>
        
        <div style="font-size: 12px; color: var(--color-text-muted); font-weight: 600;">${tzAbbr}</div>
      </div>

      <!-- Upcoming Refreshes -->
      ${upcomingRefreshes.length > 0 ? `
        <div style="margin-top: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px;">Upcoming Refreshes</div>
          <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 8px 12px;">
            ${upcomingHtml}
          </div>
        </div>
      ` : ''}
    </div>`;
  } catch (error) {
    console.error('[REFRESH] Error building refresh container:', error);
    return `<div class="player-refresh-container" style="background: var(--color-graphite-800); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px; text-align: center;">
      <div style="font-size: 14px; color: var(--color-text-muted); font-weight: 600;">Error loading refresh time</div>
    </div>`;
  }
}

// ============================================================================
// 8. COUNTDOWN TIMER UPDATER
// ============================================================================
function startRefreshCountdown(containerId, targetTime) {
  const countdownId = containerId.replace('refresh-container-', 'refresh-countdown-');
  const countdownEl = document.getElementById(countdownId);

  if (!countdownEl) return;

  // Update countdown text
  const updateCountdown = () => {
    const countdown = formatTimeUntil(targetTime);
    countdownEl.textContent = countdown;

    // Stop timer if time has passed
    if (countdown === 'Refreshing...') {
      clearInterval(interval);
    }
  };

  // Update immediately
  updateCountdown();

  // Update every second
  const interval = setInterval(updateCountdown, 1000);

  // Store interval for cleanup
  if (!window.refreshTimerIntervals) {
    window.refreshTimerIntervals = {};
  }
  window.refreshTimerIntervals[containerId] = interval;
}

// ============================================================================
// 9. CLEANUP FUNCTION
// ============================================================================
function cleanupRefreshTimers() {
  if (window.refreshTimerIntervals) {
    Object.values(window.refreshTimerIntervals).forEach(interval => {
      clearInterval(interval);
    });
    window.refreshTimerIntervals = {};
  }
}

// ============================================================================
// 10. EXPORT TO WINDOW
// ============================================================================
window.buildRefreshTimeContainer = buildRefreshTimeContainer;
window.cleanupRefreshTimers = cleanupRefreshTimers;

console.log('[REFRESH] Module loaded successfully');




/* ===== assets/js/router.js ===== */

/* ============================================================
   ZENITH FCM - Client-Side Router
   File: assets/js/router.js

   Handles all SPA URL routing using HTML5 History API.
   Routes:
     /                    → Dashboard
     /players             → Player Database
     /player/:id          → Player Detail  (?rank=0)
     /watchlist           → Watchlist
     /market              → Market
     /squad-builder       → Squad Builder
     /compare             → Compare Tool
     /404                 → Not Found
   ============================================================ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────
     LOGGER — safe wrapper, won't crash if console
     is unavailable in some environments
  ────────────────────────────────────────────── */
  const ZRouter = {
    DEBUG: true, // set false in production to silence logs

    log(msg, data) {
      if (!this.DEBUG) return;
      data !== undefined
        ? console.log(`%c[ZRouter] ${msg}`, "color:#6366F1;font-weight:600", data)
        : console.log(`%c[ZRouter] ${msg}`, "color:#6366F1;font-weight:600");
    },

    warn(msg, data) {
      data !== undefined
        ? console.warn(`%c[ZRouter] ⚠️ ${msg}`, "color:#F59E0B;font-weight:600", data)
        : console.warn(`%c[ZRouter] ⚠️ ${msg}`, "color:#F59E0B;font-weight:600");
    },

    error(msg, err) {
      err !== undefined
        ? console.error(`%c[ZRouter] ❌ ${msg}`, "color:#EF4444;font-weight:600", err)
        : console.error(`%c[ZRouter] ❌ ${msg}`, "color:#EF4444;font-weight:600");
    },

    /* ──────────────────────────────────────────────
       ROUTE DEFINITIONS
       Each route has:
         - handler(params, query) → called when route matches
         - title                  → document.title
    ────────────────────────────────────────────── */
    routes: {
      "/": {
        title: "Zenith FCM - Home",
        handler(params, query) {
          ZRouter.log("Rendering → Dashboard");
          if (typeof switchView === "function") {
            switchView("dashboard");
          } else {
            ZRouter.error("switchView() not found. Is app.js loaded?");
          }
        },
      },

      "/players": {
        title: "Player Database - Zenith FCM",
        handler(params, query) {
          ZRouter.log("Rendering → Player Database", { query });
          if (typeof switchView === "function") {
            switchView("database");
            // If URL has filter params, apply them
            // e.g. /players?pos=ST&event=TOTY+25
            if (query.pos && typeof applyPositionFilter === "function") {
              ZRouter.log("Applying position filter from URL", query.pos);
              applyPositionFilter(query.pos);
            }
          } else {
            ZRouter.error("switchView() not found.");
          }
        },
      },

      "/player/:id": {
        title: "Player Details - Zenith FCM",
        handler(params, query) {
          const playerId = params.id;
          const rank = query.rank ? parseInt(query.rank, 10) : 0;

          ZRouter.log("Rendering → Player Detail", { playerId, rank });

          if (!playerId) {
            ZRouter.error("No player ID in route params!", params);
            ZRouter.navigate("/404");
            return;
          }

          if (isNaN(rank) || rank < 0 || rank > 5) {
            ZRouter.warn("Invalid rank in query param, defaulting to 0", query.rank);
          }

          if (typeof viewPlayerDetail === "function") {
            viewPlayerDetail(playerId, isNaN(rank) ? 0 : rank);
          } else {
            ZRouter.error("viewPlayerDetail() not found. Is app.js loaded?");
          }
        },
      },

      "/watchlist": {
        title: "My Watchlist - Zenith FCM",
        handler(params, query) {
          ZRouter.log("Rendering → Watchlist");
          if (typeof switchView === "function") {
            switchView("watchlist");
          } else {
            ZRouter.error("switchView() not found.");
          }
        },
      },

      "/market": {
        title: "Market Tracker - Zenith FCM",
        handler(params, query) {
          ZRouter.log("Rendering → Market (Under Construction)");
          // Show under construction modal, stay on current view
          if (typeof openMarketModal === "function") {
            openMarketModal();
          }
          // Replace URL back so it doesn't stay on /market
          window.history.replaceState(null, "", window.location.pathname === "/market" ? "/players" : window.location.pathname);
        },
      },

      "/squad-builder": {
        title: "Squad Builder - Zenith FCM",
        handler(params, query) {
          ZRouter.log("Rendering → Squad Builder");
          if (typeof openSquadBuilderModal === "function") {
            setTimeout(openSquadBuilderModal, 100);
          }
        },
      },

      "/compare": {
        title: "Player Comparison - Zenith FCM",
        handler(params, query) {
          ZRouter.log("Rendering → Compare Tool");
          if (typeof openCompareModal === "function") {
            setTimeout(openCompareModal, 100);
          }
        },
      },

      "/404": {
        title: "Page Not Found - Zenith FCM",
        handler(params, query) {
          ZRouter.warn("Rendering → 404 Page");
          // You can render a custom 404 view here or just redirect home
          if (typeof switchView === "function") {
            switchView("dashboard");
          }
        },
      },
    },

    /* ──────────────────────────────────────────────
       PARSE ROUTE
       Matches a pathname against all defined routes.
       Supports dynamic segments like /player/:id
       Returns { route, params } or null.
    ────────────────────────────────────────────── */
    parseRoute(pathname) {
      ZRouter.log("Parsing pathname", pathname);

      for (const pattern in this.routes) {
        // Convert route pattern to regex
        // /player/:id  →  ^\/player\/([^/]+)$
        const paramNames = [];
        const regexString = pattern
          .replace(/\//g, "\\/")
          .replace(/:(\w+)/g, (_, key) => {
            paramNames.push(key);
            return "([^\\/]+)";
          });

        const regex = new RegExp(`^${regexString}$`);
        const match = pathname.match(regex);

        if (match) {
          // Build params object from captured groups
          const params = {};
          paramNames.forEach((name, i) => {
            params[name] = decodeURIComponent(match[i + 1]);
          });

          ZRouter.log(`Matched route "${pattern}"`, { params });
          return { route: this.routes[pattern], params };
        }
      }

      ZRouter.warn(`No route matched for "${pathname}", falling back to /404`);
      return { route: this.routes["/404"], params: {} };
    },

    /* ──────────────────────────────────────────────
       PARSE QUERY PARAMS
       Converts "?rank=3&pos=ST" into { rank: "3", pos: "ST" }
    ────────────────────────────────────────────── */
    parseQuery(search) {
      const query = {};
      if (!search || search.length <= 1) return query;
      try {
        const params = new URLSearchParams(search);
        params.forEach((value, key) => {
          query[key] = value;
        });
      } catch (e) {
        ZRouter.error("Failed to parse query string", e);
      }
      return query;
    },

    /* ──────────────────────────────────────────────
       HANDLE ROUTE
       Main dispatcher. Called on every navigation.
    ────────────────────────────────────────────── */
    handleRoute() {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const fullUrl = window.location.href;

      ZRouter.log("─".repeat(40));
      ZRouter.log("handleRoute() called", { pathname, search, fullUrl });

      try {
        const { route, params } = this.parseRoute(pathname);
        const query = this.parseQuery(search);

        // Update page title
        if (route.title) {
          document.title = route.title;
          ZRouter.log("Title updated", route.title);
        }

        // Call route handler
        route.handler(params, query);

        // Update active nav link
        this.updateActiveNav(pathname);

        ZRouter.log("Route handled successfully ✅");
      } catch (err) {
        ZRouter.error("Route handler threw an error", err);
        // Safety fallback: go home
        try {
          if (typeof switchView === "function") switchView("dashboard");
        } catch (fallbackErr) {
          ZRouter.error("Even fallback failed", fallbackErr);
        }
      }
    },

    /* ──────────────────────────────────────────────
       NAVIGATE
       Programmatic navigation. Updates URL + renders.
       Use this everywhere in app.js instead of switchView().

       Usage:
         ZRouter.navigate('/players')
         ZRouter.navigate('/player/23076')
         ZRouter.navigate('/player/23076?rank=3')
    ────────────────────────────────────────────── */
    navigate(path) {
      if (!path) {
        ZRouter.error("navigate() called with empty path");
        return;
      }

      const currentPath = window.location.pathname + window.location.search;

      // Don't push duplicate history entries
      if (path === currentPath) {
        ZRouter.warn("navigate() called with same path, re-handling route", path);
        this.handleRoute();
        return;
      }

      ZRouter.log("navigate() →", path);

      try {
        window.history.pushState({ path }, "", path);
        this.handleRoute();
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        ZRouter.error("pushState failed (are you on file:// protocol?)", err);
        ZRouter.warn("Hint: Use a local server (Live Server, nginx) not file://");
      }
    },

    /* ──────────────────────────────────────────────
       REPLACE
       Like navigate() but replaces history entry
       (no new entry in browser history stack).
       Use when redirecting, e.g. on errors.
    ────────────────────────────────────────────── */
    replace(path) {
      ZRouter.log("replace() →", path);
      try {
        window.history.replaceState({ path }, "", path);
        this.handleRoute();
      } catch (err) {
        ZRouter.error("replaceState failed", err);
      }
    },

    /* ──────────────────────────────────────────────
       UPDATE ACTIVE NAV
       Adds .active class to the matching nav link.
    ────────────────────────────────────────────── */
    updateActiveNav(pathname) {
      try {
        document.querySelectorAll("[data-nav-link]").forEach((el) => {
          el.classList.remove("active");
          const href = el.getAttribute("href") || el.getAttribute("data-nav-path");
          if (href && (pathname === href || (href !== "/" && pathname.startsWith(href)))) {
            el.classList.add("active");
            ZRouter.log("Active nav updated", href);
          }
        });
      } catch (err) {
        ZRouter.error("updateActiveNav() failed", err);
      }
    },

    /* ──────────────────────────────────────────────
       INIT
       Bootstrap the router. Call once on DOMContentLoaded.
    ────────────────────────────────────────────── */
    init() {
      ZRouter.log("Initializing Zenith Router...");
      ZRouter.log("Environment", {
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname,
      });

      // Safety: pushState doesn't work on file:// protocol
      if (window.location.protocol === "file:") {
        ZRouter.warn(
          "You are running on file:// protocol. URL routing won't work properly."
        );
        ZRouter.warn(
          "Use VS Code Live Server or nginx. Routing is disabled for safety."
        );
        return; // Exit early, don't break the app
      }

      // Handle back/forward browser buttons
      window.addEventListener("popstate", (e) => {
        ZRouter.log("popstate fired (back/forward button)", e.state);
        this.handleRoute();
      });

      // Intercept all clicks on [data-link] elements
      document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-link]");
        if (!target) return;

        e.preventDefault();
        const href = target.getAttribute("href");

        if (!href) {
          ZRouter.warn("data-link element has no href attribute", target);
          return;
        }

        ZRouter.log("data-link clicked", href);
        this.navigate(href);
      });

      // Handle initial route (page load / direct URL)
      ZRouter.log("Handling initial route on page load...");
      this.handleRoute();

      ZRouter.log("Router initialized ✅");
    },
  };

  // Expose globally so app.js can call ZRouter.navigate()
  window.ZRouter = ZRouter;
  ZRouter.log("ZRouter attached to window ✅");

})();




/* ===== assets/js/app.js ===== */

// FC Market Pro - Main Application
// Handles app initialization, routing, and event listeners

// ========== VIEW PLAYER DETAIL ==========
// ========== VIEW PLAYER DETAIL (FULL DETAILS) ==========
// ==================== USER SESSION ====================
// Simple user ID system (use real auth in production)
function getUserId() {
  let userId = localStorage.getItem('zenith_user_id');
  if (!userId) {
    // Generate numeric user ID from timestamp
    userId = Date.now().toString();
    localStorage.setItem('zenith_user_id', userId);
    console.log('[USER] Generated new user ID:', userId);
  }
  return parseInt(userId);  // Return as integer
}

const CURRENT_USER_ID = getUserId();
console.log('[USER] User ID:', CURRENT_USER_ID);


async function viewPlayerDetail(playerId, fallbackPlayer = null) {
    try {
        // Switch view first
        switchView('player-detail');

        const container = document.getElementById('player-detail-view');
        if (container) {
            container.innerHTML = `
                <div style="
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-family-base);
                ">
                    Loading player details...
                </div>
            `;
        }

        // Use existing data only for basic info while loading
        const allAvailable = [
            ...(state.allPlayers || []),
            ...(state.filteredPlayers || []),
            ...(state.searchResults || [])
        ];
        let lightweight = allAvailable.find(p => String(p.player_id) === String(playerId));
        if (!lightweight && fallbackPlayer) {
            console.warn('[DETAIL] Using fallback player from dashboard');
            lightweight = fallbackPlayer;
        }

        // Make sure apiClient exists
        if (!window.apiClient) {
            throw new Error('API client not available');
        }

        console.log('[DETAIL] Fetching full details for player', playerId);

        // 🔥 CALL BACKEND DETAIL ENDPOINT
        const resp = await window.apiClient.getPlayerDetails(playerId, lightweight?.rank ?? 0);
        const fullPlayer = resp.player;

        // ✅ Merge skills data from response root level
        const mergedPlayer = {
          ...lightweight,
          ...fullPlayer,
          skills: resp.skills,  // ← Add this
          available_skill_points: resp.available_skill_points  // ← Add this
        };

        // Save to state for debugging / re-render
        state.selectedPlayer = mergedPlayer;

        // Finally render using your big renderPlayerDetail()
        renderPlayerDetail(mergedPlayer);

    } catch (error) {
        console.error('[DETAIL] Error loading player details', error);
        const container = document.getElementById('player-detail-view');
        if (container) {
            container.innerHTML = `
                <div style="
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 8px;
                    color: #FF6B6B;
                    font-family: var(--font-family-base);
                ">
                    <div style="font-weight: 700; font-size: 16px;">Failed to load player details</div>
                    <div style="font-size: 13px; opacity: 0.8;">${error.message}</div>
                </div>
            `;
        }
    }
}

// ====================================
// STAT MAPPING FOR CUSTOM STATS DISPLAY
// ====================================
// ====================================
// STAT MAPPING - CORRECT COLUMN NAMES FROM API
// ====================================
const STAT_MAPPING = {
    // Pace
    'acceleration': { key: 'acceleration', label: 'ACC' },
    'sprint_speed': { key: 'sprint_speed', label: 'SPD' },
    'sprint-speed': { key: 'sprint_speed', label: 'SPD' },

    // Shooting
    'finishing': { key: 'finishing', label: 'FIN' },
    'long_shot': { key: 'long_shot', label: 'LSH' },
    'long-shot': { key: 'long_shot', label: 'LSH' },
    'shot_power': { key: 'shot_power', label: 'POW' },
    'shot-power': { key: 'shot_power', label: 'POW' },
    'positioning': { key: 'positioning', label: 'POS' },
    'volley': { key: 'volley', label: 'VOL' },
    'penalties': { key: 'penalties', label: 'PEN' },

    // Passing
    'short_passing': { key: 'short_passing', label: 'SPA' },
    'short-passing': { key: 'short_passing', label: 'SPA' },
    'long_passing': { key: 'long_passing', label: 'LPA' },
    'long-passing': { key: 'long_passing', label: 'LPA' },
    'crossing': { key: 'crossing', label: 'CRO' },
    'vision': { key: 'vision', label: 'VIS' },
    'curve': { key: 'curve', label: 'CUR' },
    'free_kick': { key: 'free_kick', label: 'FK' },
    'free-kick': { key: 'free_kick', label: 'FK' },

    // Dribbling
    'dribbling': { key: 'dribbling', label: 'DRI' },
    'ball_control': { key: 'ball_control', label: 'B.CON' },
    'ball-control': { key: 'ball_control', label: 'B.CON' },
    'agility': { key: 'agility', label: 'AGI' },
    'balance': { key: 'balance', label: 'BAL' },
    'reactions': { key: 'reactions', label: 'REA' },

    // Defending
    'marking': { key: 'marking', label: 'MAR' },
    'standing_tackle': { key: 'standing_tackle', label: 'STA' },
    'standing-tackle': { key: 'standing_tackle', label: 'STA' },
    'sliding_tackle': { key: 'sliding_tackle', label: 'SLD' },
    'sliding-tackle': { key: 'sliding_tackle', label: 'SLD' },
    'interceptions': { key: 'interceptions', label: 'INT' },
    'heading': { key: 'heading', label: 'HEA' },

    // Physical
    'strength': { key: 'strength', label: 'STR' },
    'jumping': { key: 'jumping', label: 'JUM' },
    'stamina': { key: 'stamina_stat', label: 'STA' },
    'aggression': { key: 'aggression', label: 'AGG' },
    'awareness': { key: 'awareness', label: 'AWR' },

    // Goalkeeper
    'gk_diving': { key: 'gk_diving', label: 'DIV' },
    'gk-diving': { key: 'gk_diving', label: 'DIV' },
    'gk_handling': { key: 'gk_handling', label: 'HAN' },
    'gk-handling': { key: 'gk_handling', label: 'HAN' },
    'gk_kicking': { key: 'gk_kicking', label: 'KIC' },
    'gk-kicking': { key: 'gk_kicking', label: 'KIC' },
    'gk_positioning': { key: 'gk_positioning', label: 'GPO' },
    'gk-positioning': { key: 'gk_positioning', label: 'GPO' },
    'gk_reflexes': { key: 'gk_reflexes', label: 'REF' },
    'gk-reflexes': { key: 'gk_reflexes', label: 'REF' }
};



// ========== ANIMATED RANK ICON SYSTEM ==========
const RANK_CONFIG = {
    frameCount: 36,     // ✅ 36 frames total
    fps: 18,            // 36 FPS
    frameWidth: 32,     // ✅ 192px ÷ 6 = 32px per frame
    frameHeight: 32,    // ✅ 192px ÷ 6 = 32px per frame
    columns: 6,         // ✅ 6 columns per row
    rows: 6,            // ✅ 6 rows total
    ranks: {
        1: 'assets/images/ranks/green_rank_enhanced_main.webp',
        2: 'assets/images/ranks/blue_rank_enhanced_main.webp',
        3: 'assets/images/ranks/purple_rank_enhanced_main.webp',
        4: 'assets/images/ranks/red_rank_enhanced_main.webp',
        5: 'assets/images/ranks/gold_rank_enhanced_main.webp',
    },
    skillPoints: {
        0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5
    },
    rankNames: {
        0: 'Base', 1: 'Green', 2: 'Blue', 3: 'Purple', 4: 'Red', 5: 'Gold'
    },
    rankColors: {
        0: '#98A0A6', 1: '#3BD671', 2: '#6366F1', 3: '#8B5CF6', 4: '#FF6B6B', 5: '#FFB86B'
    }
};

// Helper to convert hex color to rgba
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,255,255';
}

// Store active animations for cleanup
const activeRankAnimations = new Map();

function createAnimatedRankIcon(rank, size = 48) {
    if (!rank || rank < 1 || rank > 5) return '';

    const spriteUrl = RANK_CONFIG.ranks[rank];
    if (!spriteUrl) return '';

    const uniqueId = `rank-icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return `
        <div class="animated-rank-icon"
             id="${uniqueId}"
             data-rank="${rank}"
             style="
                width: ${size}px;
                height: ${size}px;
                background-image: url('${spriteUrl}');
                background-size: auto ${size}px;
                background-position: 0 0;
                background-repeat: no-repeat;
                display: inline-block;
             ">
        </div>
    `;
}

function toggleToolsDropdown() {
    const menu = document.getElementById('tools-dropdown-menu');
    const btn  = document.getElementById('tools-dropdown-btn');

    if (!menu) {
        console.error('[Zenith] tools-dropdown-menu not found');
        return;
    }

    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('active', !isOpen);

    console.log(`%c[Zenith] Tools dropdown ${isOpen ? 'closed' : 'opened'}`, 'color:#6366F1;font-weight:600');
}

// Close dropdown when clicking anywhere outside it
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.tools-dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const menu = document.getElementById('tools-dropdown-menu');
        const btn  = document.getElementById('tools-dropdown-btn');
        if (menu) menu.style.display = 'none';
        if (btn)  btn.classList.remove('active');
    }
});



function startRankAnimation(element) {
    if (!element) return;

    const rank = element.dataset.rank;
    if (!rank) return;

    // ✅ ROBUST: Get ACTUAL rendered size multiple ways
    const computedStyle = window.getComputedStyle(element);
    const actualWidth = parseFloat(computedStyle.width);
    const actualHeight = parseFloat(computedStyle.height);
    
    // Use actual rendered size, fallback to dataset, then default
    const iconSize = Math.round(actualWidth || parseInt(element.dataset.iconSize) || 70);
    
    console.log(`[RANK ANIMATION] Element size: ${actualWidth}px, Using: ${iconSize}px`); // Debug log
    
    const scaleFactor = iconSize / RANK_CONFIG.frameWidth;
    
    const scaledFrameWidth = RANK_CONFIG.frameWidth * scaleFactor;
    const scaledFrameHeight = RANK_CONFIG.frameHeight * scaleFactor;
    
    // ✅ Update background-size to match actual icon size
    const spriteSheetSize = Math.round(192 * scaleFactor);
    element.style.backgroundSize = `${spriteSheetSize}px ${spriteSheetSize}px`;
    
    console.log(`[RANK ANIMATION] Background size set to: ${spriteSheetSize}px`); // Debug log
    
    let currentFrame = 0;
    const columns = RANK_CONFIG.columns; // 6
    const interval = 1000 / RANK_CONFIG.fps; // ~27.78ms

    // Clear any existing animation
    if (activeRankAnimations.has(element.id)) {
        clearInterval(activeRankAnimations.get(element.id));
    }

    const animationId = setInterval(() => {
        currentFrame = (currentFrame + 1) % RANK_CONFIG.frameCount; // 0-35
        
        // Calculate 6x6 grid position
        const col = currentFrame % columns;  // 0-5
        const row = Math.floor(currentFrame / columns); // 0-5
        
        // Calculate exact position with scaling
        const xOffset = -(col * scaledFrameWidth);
        const yOffset = -(row * scaledFrameHeight);
        
        element.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
    }, interval);

    activeRankAnimations.set(element.id, animationId);
}





function stopRankAnimation(elementId) {
    if (activeRankAnimations.has(elementId)) {
        clearInterval(activeRankAnimations.get(elementId));
        activeRankAnimations.delete(elementId);
    }
}

function initAllRankAnimations() {
    document.querySelectorAll('.animated-rank-icon').forEach(el => {
        startRankAnimation(el);
    });
    
    // Also initialize rank selector animations specifically
    document.querySelectorAll('.rank-selector-icon').forEach(el => {
        startRankAnimation(el);
    });
}


function cleanupRankAnimations() {
    activeRankAnimations.forEach((intervalId, elementId) => {
        clearInterval(intervalId);
    });
    activeRankAnimations.clear();
}
// ========== GLOBAL STAT TAB FUNCTIONS ==========
window.switchStatTab = function(statId) {
    // Update tabs
    const tabs = document.querySelectorAll('.stat-tab');
    tabs.forEach(tab => {
        const isActive = tab.dataset.statId === statId;
        tab.classList.toggle('active', isActive);
        tab.style.background = isActive ? 'var(--color-teal-500, #00C2A8)' : 'transparent';
        tab.style.borderColor = isActive ? 'var(--color-teal-500, #00C2A8)' : 'rgba(255,255,255,0.1)';
        tab.style.color = isActive ? 'var(--color-graphite-900, #0E1114)' : 'var(--color-text-muted, #98A0A6)';
    });

    // Update content panels
    const panels = document.querySelectorAll('.stat-content-panel');
    panels.forEach(panel => {
        const isActive = panel.dataset.statContent === statId;
        panel.classList.toggle('active', isActive);
        panel.style.display = isActive ? 'block' : 'none';
    });
};

window.togglePlayerWatchlist = function(uniqueId) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 [TOGGLE PLAYER] Called with uniqueId:', uniqueId);
    console.log('🔵 [TOGGLE PLAYER] Current view:', state.currentView);
    
    if (typeof window.toggleWatchlist === 'function') {
        console.log('✅ [TOGGLE PLAYER] window.toggleWatchlist EXISTS');
        
        // Check before state
        const wasInWatchlist = state.watchlist.includes(uniqueId);
        console.log('📋 [TOGGLE PLAYER] Was in watchlist BEFORE:', wasInWatchlist);
        console.log('📋 [TOGGLE PLAYER] Watchlist count BEFORE:', state.watchlist.length);
        
        // Call the toggle function
        window.toggleWatchlist(uniqueId);
        
        // Check after state
        const isInWatchlist = state.watchlist.includes(uniqueId);
        console.log('📋 [TOGGLE PLAYER] Is in watchlist AFTER:', isInWatchlist);
        console.log('📋 [TOGGLE PLAYER] Watchlist count AFTER:', state.watchlist.length);
        
        // Re-render player detail if viewing a player
        if (state && state.selectedPlayer) {
            console.log('🔄 [TOGGLE PLAYER] Re-rendering player detail...');
            renderPlayerDetail(state.selectedPlayer);
        }
        
        // ✅ NEW: If we're in watchlist view, reload it
        if (state.currentView === 'watchlist') {
            console.log('🔄 [TOGGLE PLAYER] Currently in watchlist view - reloading...');
            
            if (typeof window.loadWatchlistData === 'function') {
                setTimeout(() => {
                    window.loadWatchlistData();
                    console.log('✅ [TOGGLE PLAYER] Watchlist view reloaded');
                }, 100);
            } else if (typeof window.initProfessionalWatchlist === 'function') {
                setTimeout(() => {
                    window.initProfessionalWatchlist();
                    console.log('✅ [TOGGLE PLAYER] Watchlist view re-initialized');
                }, 100);
            } else {
                console.warn('⚠️ [TOGGLE PLAYER] No watchlist reload function found');
            }
        }
        
        console.log('✅ [TOGGLE PLAYER] Complete');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } else {
        console.error('❌ [TOGGLE PLAYER] window.toggleWatchlist NOT FOUND!');
        console.log('   Available toggle functions:', Object.keys(window).filter(k => k.includes('toggle')));
    }
};

const getStat = (obj, ...names) => {
    for (const n of names) {
        if (obj?.[n] !== undefined && obj?.[n] !== null) return obj[n];
    }
    return 0;
};

window.getStat = getStat;

window.renderPlayerStatsSection = function(player) {
    if (!player) return '';

    console.log('[STATS] Rendering stats for player:', player.player_id, 'Boosts:', {
        training: player.training_boosts,
        skills: player.skill_boosts
    });

    const isGoalkeeper = player.position === 'GK';
    const trainingBoosts = player.training_boosts || null;
    const skillBoosts = player.skill_boosts || null;
    const hasSkillBoosts = skillBoosts && Object.keys(skillBoosts).length > 0;

    const getBaseColor = (value) => {
        if (value >= 90) return '#3BD671';
        if (value >= 80) return '#00C2A8';
        if (value >= 70) return '#FFB86B';
        return '#98A0A6';
    };

    const normalizeStatKey = (value) => String(value || '').toLowerCase().replace(/_/g, '');

    const getBoostValue = (boosts, ...names) => {
        if (!boosts) return 0;
        const entries = Object.entries(boosts);
        for (const name of names) {
            const normalizedName = normalizeStatKey(name);
            const match = entries.find(([boostKey]) => normalizeStatKey(boostKey) === normalizedName);
            if (match) {
                const boost = parseInt(match[1], 10) || 0;
                return boost;
            }
        }
        return 0;
    };

    const getStatWithBoost = (stats, boosts, ...names) => {
        const baseStat = getStat(stats, ...names);
        if (!boosts) return baseStat;
        const boost = getBoostValue(boosts, ...names);
        if (boost) {
            console.log(`[TRAINING] Applying boost to ${names[0]}: ${baseStat} + ${boost} = ${baseStat + boost}`);
        }
        return baseStat + boost;
    };

    const getBoostedStat = (...names) => getStatWithBoost(player, trainingBoosts, ...names);
    const getFinalStat = (...names) => {
        const boostedStat = getBoostedStat(...names);
        if (!hasSkillBoosts) return boostedStat;
        const skillBoost = getBoostValue(skillBoosts, ...names);
        return boostedStat + skillBoost;
    };

    if (typeof window.devLog === 'function') {
        const statSnapshots = [
            ['acceleration'],
            ['sprint_speed'],
            ['finishing'],
            ['long_shot', 'long_shots'],
            ['shot_power'],
            ['positioning'],
            ['volley', 'volleys'],
            ['penalties'],
            ['short_passing'],
            ['long_passing'],
            ['vision'],
            ['crossing'],
            ['curve'],
            ['free_kick', 'fk_accuracy'],
            ['dribbling'],
            ['balance'],
            ['agility'],
            ['reactions'],
            ['ball_control'],
            ['marking'],
            ['standing_tackle'],
            ['sliding_tackle'],
            ['awareness', 'interceptions'],
            ['heading'],
            ['strength'],
            ['aggression'],
            ['jumping'],
            ['stamina_stat', 'stamina'],
            ['gk_diving', 'diving'],
            ['gk_positioning', 'positioning'],
            ['gk_handling', 'handling'],
            ['gk_reflexes', 'reflexes'],
            ['gk_kicking', 'kicking']
        ];
        const baseStats = {};
        const boostedStats = {};
        const finalStats = {};
        statSnapshots.forEach((names) => {
            const key = names[0];
            const baseStat = getStat(player, ...names);
            const boostedStat = baseStat + getBoostValue(trainingBoosts, ...names);
            const finalStat = boostedStat + (hasSkillBoosts ? getBoostValue(skillBoosts, ...names) : 0);
            baseStats[key] = baseStat;
            boostedStats[key] = boostedStat;
            finalStats[key] = finalStat;
        });
        window.devLog('[STATS PIPELINE]', { baseStats, boostedStats, finalStats });
    }

    const roundHalfUp = (val) => Math.floor(val + 0.5);

    const calculatePaceWithBoosts = (player, boosts) => {
        const acceleration = getFinalStat('acceleration');
        const sprint_speed = getFinalStat('sprint_speed');
        const val = (
            0.49299585008602 * acceleration +
            0.50528383239125 * sprint_speed +
            -0.13701200270336
        );
        return roundHalfUp(val);
    };

    const calculateShootingWithBoosts = (player, boosts) => {
        const finishing = getFinalStat('finishing');
        const long_shot = getFinalStat('long_shot', 'longshots');
        const shot_power = getFinalStat('shot_power');
        const positioning = getFinalStat('positioning');
        const volley = getFinalStat('volley', 'volleys');
        const penalties = getFinalStat('penalties');
        const val = (
            0.35066661652365 * finishing +
            0.20012280256486 * long_shot +
            0.19946956407192 * shot_power +
            0.15019769557113 * positioning +
            0.04977322484935 * volley +
            0.04962618730771 * penalties +
            -0.46621901229077
        );
        return roundHalfUp(val);
    };

    const calculatePassingWithBoosts = (player, boosts) => {
        const short_passing = getFinalStat('short_passing');
        const long_passing = getFinalStat('long_passing');
        const vision = getFinalStat('vision');
        const crossing = getFinalStat('crossing');
        const curve = getFinalStat('curve');
        const free_kick = getFinalStat('free_kick', 'fk_accuracy');
        const val = (
            0.30073301682698 * short_passing +
            0.19979430277541 * long_passing +
            0.24897437527999 * vision +
            0.15031023108744 * crossing +
            0.05004649307871 * curve +
            0.05012756181062 * free_kick +
            -0.48084074176376
        );
        return roundHalfUp(val);
    };

    const calculateDribblingWithBoosts = (player, boosts) => {
        const dribbling = getFinalStat('dribbling');
        const balance = getFinalStat('balance');
        const agility = getFinalStat('agility');
        const reactions = getFinalStat('reactions');
        const ball_control = getFinalStat('ball_control');
        const val = (
            0.25044329239850 * dribbling +
            0.10001066600723 * balance +
            0.25025392646353 * agility +
            0.15074674532686 * reactions +
            0.24872793523704 * ball_control +
            -0.48832284057254
        );
        return roundHalfUp(val);
    };

    const calculateDefendingWithBoosts = (player, boosts) => {
        const marking = getFinalStat('marking');
        const standing_tackle = getFinalStat('standing_tackle');
        const sliding_tackle = getFinalStat('sliding_tackle');
        const awareness = getFinalStat('awareness', 'interceptions');
        const heading = getFinalStat('heading');
        const val = (
            0.25029448767320 * marking +
            0.20107682619015 * standing_tackle +
            0.19924427638513 * sliding_tackle +
            0.19952899013166 * awareness +
            0.15010172584902 * heading +
            -0.49709228500345
        );
        return roundHalfUp(val);
    };

    const calculatePhysicalWithBoosts = (player, boosts) => {
        const strength = getFinalStat('strength');
        const aggression = getFinalStat('aggression');
        const jumping = getFinalStat('jumping');
        const stamina = getFinalStat('stamina_stat', 'stamina');
        const val = (
            0.44955969076149 * strength +
            0.29976663944687 * aggression +
            0.25058507302003 * jumping +
            0.00061181921524 * stamina +
            -0.50936016832054
        );
        return roundHalfUp(val);
    };

    const calculateGKPhysicalWithBoosts = (player, boosts) => {
        const reactions = getFinalStat('reactions');
        const agility = getFinalStat('agility');
        const sprint_speed = getFinalStat('sprint_speed');
        const strength = getFinalStat('strength');
        const val = (
            0.64960512284621 * reactions +
            0.15093757174982 * agility +
            0.09981357061375 * sprint_speed +
            0.09995255942967 * strength +
            -0.48764601442207
        );
        return roundHalfUp(val);
    };

    let statCategories;
    if (isGoalkeeper) {
        statCategories = [
            {
                name: 'Diving',
                key: 'diving',
                mainValue: getFinalStat('diving'),
                substats: [
                    { label: 'GK Diving', value: getFinalStat('gk_diving', 'diving') }
                ]
            },
            {
                name: 'Positioning',
                key: 'gk_positioning',
                mainValue: getFinalStat('gk_positioning', 'positioning'),
                substats: [
                    { label: 'GK Positioning', value: getFinalStat('gk_positioning', 'positioning') }
                ]
            },
            {
                name: 'Handling',
                key: 'handling',
                mainValue: getFinalStat('handling'),
                substats: [
                    { label: 'GK Handling', value: getFinalStat('gk_handling', 'handling') }
                ]
            },
            {
                name: 'Reflexes',
                key: 'reflexes',
                mainValue: getFinalStat('reflexes'),
                substats: [
                    { label: 'GK Reflexes', value: getFinalStat('gk_reflexes', 'reflexes') },
                    { label: 'Jumping', value: getFinalStat('jumping') }
                ]
            },
            {
                name: 'Kicking',
                key: 'kicking',
                mainValue: getFinalStat('kicking'),
                substats: [
                    { label: 'GK Kicking', value: getFinalStat('gk_kicking', 'kicking') },
                    { label: 'Long Passing', value: getFinalStat('long_passing') }
                ]
            },
            {
                name: 'Physical',
                key: 'physical',
                mainValue: calculateGKPhysicalWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Reactions', value: getFinalStat('reactions') },
                    { label: 'Agility', value: getFinalStat('agility') },
                    { label: 'Sprint Speed', value: getFinalStat('sprint_speed') },
                    { label: 'Strength', value: getFinalStat('strength') }
                ]
            }
        ];
    } else {
        statCategories = [
            {
                name: 'Pace',
                key: 'pace',
                mainValue: calculatePaceWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Acceleration', value: getFinalStat('acceleration') },
                    { label: 'Sprint Speed', value: getFinalStat('sprint_speed') }
                ]
            },
            {
                name: 'Shooting',
                key: 'shooting',
                mainValue: calculateShootingWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Finishing', value: getFinalStat('finishing') },
                    { label: 'Long Shot', value: getFinalStat('long_shot', 'long_shots') },
                    { label: 'Shot Power', value: getFinalStat('shot_power') },
                    { label: 'Positioning', value: getFinalStat('positioning') },
                    { label: 'Volley', value: getFinalStat('volley', 'volleys') },
                    { label: 'Penalties', value: getFinalStat('penalties') }
                ]
            },
            {
                name: 'Passing',
                key: 'passing',
                mainValue: calculatePassingWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Short Passing', value: getFinalStat('short_passing') },
                    { label: 'Long Passing', value: getFinalStat('long_passing') },
                    { label: 'Vision', value: getFinalStat('vision') },
                    { label: 'Crossing', value: getFinalStat('crossing') },
                    { label: 'Curve', value: getFinalStat('curve') },
                    { label: 'Free Kick', value: getFinalStat('free_kick', 'fk_accuracy') }
                ]
            },
            {
                name: 'Dribbling',
                key: 'dribbling',
                mainValue: calculateDribblingWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Dribbling', value: getFinalStat('dribbling') },
                    { label: 'Balance', value: getFinalStat('balance') },
                    { label: 'Agility', value: getFinalStat('agility') },
                    { label: 'Reactions', value: getFinalStat('reactions') },
                    { label: 'Ball Control', value: getFinalStat('ball_control') }
                ]
            },
            {
                name: 'Defending',
                key: 'defending',
                mainValue: calculateDefendingWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Marking', value: getFinalStat('marking') },
                    { label: 'Standing Tackle', value: getFinalStat('standing_tackle') },
                    { label: 'Sliding Tackle', value: getFinalStat('sliding_tackle') },
                    { label: 'Awareness', value: getFinalStat('awareness', 'interceptions') },
                    { label: 'Heading', value: getFinalStat('heading') }
                ]
            },
            {
                name: 'Physical',
                key: 'physical',
                mainValue: calculatePhysicalWithBoosts(player, player.training_boosts),
                substats: [
                    { label: 'Strength', value: getFinalStat('strength') },
                    { label: 'Aggression', value: getFinalStat('aggression') },
                    { label: 'Jumping', value: getFinalStat('jumping') },
                    { label: 'Stamina', value: getFinalStat('stamina_stat', 'stamina') }
                ]
            }
        ];
    }

    const sorted = [...statCategories]
        .map(c => ({ key: c.key, value: c.mainValue }))
        .sort((a, b) => b.value - a.value);

    const majorColors = {};
    sorted.forEach((item, idx) => {
        if (idx <= 2) majorColors[item.key] = '#3BD671';
        else if (idx <= 4) majorColors[item.key] = '#FFB86B';
        else majorColors[item.key] = '#FF6B6B';
    });

    const getMajorColor = (cat) => majorColors[cat.key] || getBaseColor(cat.mainValue);

    const MAX_BAR = 280;
    const clampBarWidth = (value) => {
        const v = Math.max(0, Math.min(Number(value) || 0, MAX_BAR));
        return (v / MAX_BAR) * 100;
    };

    return `
        <div class="player-stats-section" style="
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px 32px 24px;
        ">
            <h2 style="
                font-size: 22px;
                font-weight: 800;
                color: var(--color-text-primary, #E6EEF2);
                margin: 0 0 20px 0;
                font-family: var(--font-family-base);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">${isGoalkeeper ? 'Goalkeeper Statistics' : 'Player Statistics'}</h2>

            <div class="stats-grid-container">
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                ">
                    ${statCategories.map(cat => {
                        const majorColor = getMajorColor(cat);
                        const mainBarWidth = clampBarWidth(cat.mainValue);
                        return `
                            <div style="
                                background: var(--color-graphite-800, #14181C);
                                border: 1px solid rgba(255,255,255,0.08);
                                border-left: 4px solid ${majorColor};
                                border-radius: var(--radius-lg, 12px);
                                padding: 24px;
                                box-shadow: var(--shadow-md);
                            ">
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 20px;
                                    padding-bottom: 16px;
                                    border-bottom: 1px solid rgba(255,255,255,0.08);
                                ">
                                    <h3 style="
                                        font-size: 16px;
                                        font-weight: 700;
                                        color: var(--color-text-primary, #E6EEF2);
                                        margin: 0;
                                        font-family: var(--font-family-base);
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">${cat.name}</h3>
                                    <div style="
                                        font-size: 36px;
                                        font-weight: 900;
                                        color: ${majorColor};
                                        font-family: var(--font-family-base);
                                        line-height: 1;
                                    ">${cat.mainValue}</div>
                                </div>

                                <div style="
                                    width: 100%;
                                    height: 10px;
                                    background: rgba(255,255,255,0.08);
                                    border-radius: 5px;
                                    overflow: hidden;
                                    margin-bottom: 20px;
                                ">
                                    <div style="
                                        width: ${mainBarWidth}%;
                                        height: 100%;
                                        background: ${majorColor};
                                        border-radius: 5px;
                                        box-shadow: 0 0 10px ${majorColor}60;
                                        transition: width 0.6s ease;
                                    "></div>
                                </div>

                                <div style="display: grid; gap: 12px;">
                                    ${cat.substats.map(sub => {
                                        const subColor = getBaseColor(sub.value);
                                        const subWidth = clampBarWidth(sub.value);
                                        return `
                                            <div>
                                                <div style="
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                    margin-bottom: 6px;
                                                ">
                                                    <span style="
                                                        font-size: 13px;
                                                        color: var(--color-text-muted, #98A0A6);
                                                        font-weight: 600;
                                                        font-family: var(--font-family-base);
                                                    ">${sub.label}</span>
                                                    <span style="
                                                        font-size: 17px;
                                                        font-weight: 800;
                                                        color: ${subColor};
                                                        font-family: var(--font-family-base);
                                                    ">${sub.value}</span>
                                                </div>
                                                <div style="
                                                    width: 100%;
                                                    height: 6px;
                                                    background: rgba(255,255,255,0.08);
                                                    border-radius: 3px;
                                                    overflow: hidden;
                                                ">
                                                    <div style="
                                                        width: ${subWidth}%;
                                                        height: 100%;
                                                        background: ${subColor};
                                                        border-radius: 3px;
                                                        transition: width 0.5s ease;
                                                    "></div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
};




async function renderPlayerDetail(player) {
    const container = document.getElementById('player-detail-view');
    if (!container) return;

    cleanupRankAnimations();

    // 🔁 Refresh market price based on current rank
    if (window.supabaseProvider && typeof window.supabaseProvider.syncPrices === 'function') {
      await window.supabaseProvider.syncPrices([player]);
    }

    const uniqueId = `${player.player_id}_${player.rank || 0}_${player.is_untradable ? 1 : 0}`;
    const isWatchlisted = state.watchlist && state.watchlist.includes(uniqueId);
    const canShowPriceHistory = canShowPlayerPriceHistory(player);

    const nationField = player.nation_region || player.nation || '';
    const flagUrl = typeof getCountryFlagUrl === 'function' ? getCountryFlagUrl(nationField) : '';

    const rankIconHtml = '';  // Disable blinking rank icon


    const statsMarkup = window.renderPlayerStatsSection(player);

    container.innerHTML = `
        <div style="background: rgba(20, 24, 28, 0.5); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.15); min-height: 100vh; padding: 0; border-radius: 16px;">
            <!-- Top Section: Player Card + Rank/Training -->
            <div style="
                max-width: 1400px;
                margin: 0 auto;
                padding: 24px 24px 0 24px;
            ">
                <!-- Back Button -->
                <button onclick="window.ZRouter ? ZRouter.navigate('players') : switchView('database')" style="
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--color-text-muted, #98A0A6);
                    padding: 12px 20px;
                    border-radius: var(--radius-base, 8px);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: var(--font-family-base);
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 20px;
                " onmouseover="this.style.borderColor='rgba(0,194,168,0.4)'; this.style.color='#E6EEF2'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#98A0A6'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Players
                </button>

                <div class="player-top-section" style="
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 28px;
                    margin-bottom: 32px;
                ">
                    <!-- LEFT: Player Card -->
                    <div>
                        <div style="
                            background: var(--color-graphite-800, #14181C);
                            border: 1px solid rgba(0,194,168,0.15);
                            border-radius: var(--radius-lg, 12px);
                            padding: 32px;
                            box-shadow: var(--shadow-lg);
                            position: relative;
                            overflow: hidden;
                        ">
                       

                            <div class="player-detail-mini-card" style="
                                width: 260px;
                                height: 260px;
                                margin: 0 auto 24px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                                overflow: hidden;
                            ">
                                
                                <img src="${player.card_background || 'https://via.placeholder.com/300x400'}"
                                                alt="Card Background"
                                                class="card-background-img-inside"
                                                onerror="this.src='https://via.placeholder.com/300x400'">

                                            <img src="${player.player_image || 'https://via.placeholder.com/200x300'}"
                                                alt="${player.name}"
                                                class="player-image-img-inside"
                                                onerror="this.src='https://via.placeholder.com/200x300'">

                                            <div class="card-ovr-inside" style="color: ${player.color_rating || '#FFFFFF'}">
                                                ${player.ovr && player.ovr > 0 ? player.ovr : 'N/A'}
                                            </div>

                                            <div class="card-position-inside" style="color: ${player.color_position || '#FFFFFF'}">
                                                ${player.position || 'N/A'}
                                            </div>

                                            <div class="card-player-name-inside" style="color: ${player.color_name || '#FFFFFF'}">
                                                ${player.name}
                                            </div>
                                            
                                                                                        
                                            ${player.nation_flag ? `
                                                <img src="${player.nation_flag}" 
                                                     alt="Nation" 
                                                     class="card-nation-flag-inside-detail ${
                                                        getPlayerType(player) === 'normal' 
                                                            ? 'normal-nation-flag-detail' 
                                                            : 'hero-icon-nation-flag-detail'
                                                     }"
                                                     onerror="this.style.display='none'">
                                            ` : ''}
                                            
                                            ${player.club_flag ? `
                                                <img src="${player.club_flag}" 
                                                     alt="Club" 
                                                     class="card-club-flag-inside-detail ${
                                                        getPlayerType(player) === 'normal' 
                                                            ? 'normal-club-flag-detail' 
                                                            : 'hero-icon-club-flag-detail'
                                                     }"
                                                     onerror="this.style.display='none'">
                                            ` : ''}
                                            
                                            ${player.league_image && getPlayerType(player) === 'normal' ? `
                                                <img src="${player.league_image}" 
                                                     alt="League" 
                                                     class="card-league-flag-inside normal-league-flag"
                                                     onerror="this.style.display='none'">
                                            ` : ''}
                            </div>
                            <h1 style="
                                font-size: 28px;
                                font-weight: 800;
                                color: var(--color-text-primary, #E6EEF2);
                                margin: 0 0 12px 0;
                                text-align: center;
                                font-family: var(--font-family-base);
                                line-height: 1.2;
                            ">${player.name}</h1>

                            <div style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 14px;
                                margin-bottom: 24px;
                                flex-wrap: wrap;
                            ">
                                <span style="
                                    color: var(--color-text-muted, #98A0A6);
                                    font-size: 15px;
                                    font-weight: 600;
                                    font-family: var(--font-family-base);
                                ">${player.team || 'N/A'}</span>
                                ${flagUrl ? `
                                    <img src="${flagUrl}" alt="${nationField}" style="
                                        width: 32px;
                                        height: 22px;
                                        object-fit: cover;
                                        border-radius: 4px;
                                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                                    ">
                                ` : ''}
                            </div>

                            <div style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 14px;
                                margin-bottom: 20px;
                            ">
                                <div style="
                                    background: rgba(255,255,255,0.03);
                                    border: 1px solid rgba(255,255,255,0.08);
                                    border-radius: var(--radius-base, 8px);
                                    padding: 14px;
                                    text-align: center;
                                ">
                                    <div style="
                                        font-size: 11px;
                                        color: var(--color-text-muted, #98A0A6);
                                        font-weight: 600;
                                        margin-bottom: 8px;
                                        text-transform: uppercase;
                                        font-family: var(--font-family-base);
                                        letter-spacing: 0.5px;
                                    ">Skill Moves</div>
                                    <div style="font-size: 18px; color: #FFB86B; letter-spacing: 2px;">
                                        ${'★'.repeat(getStat(player, 'skill_moves_stars', 'skill_moves') || 0)}${'☆'.repeat(5 - (getStat(player, 'skill_moves_stars', 'skill_moves') || 0))}
                                    </div>
                                </div>
                                <div style="
                                    background: rgba(255,255,255,0.03);
                                    border: 1px solid rgba(255,255,255,0.08);
                                    border-radius: var(--radius-base, 8px);
                                    padding: 14px;
                                    text-align: center;
                                ">
                                    <div style="
                                        font-size: 11px;
                                        color: var(--color-text-muted, #98A0A6);
                                        font-weight: 600;
                                        margin-bottom: 8px;
                                        text-transform: uppercase;
                                        font-family: var(--font-family-base);
                                        letter-spacing: 0.5px;
                                    ">Weak Foot</div>
                                    <div style="font-size: 18px; color: #FFB86B; letter-spacing: 2px;">
                                        ${'★'.repeat(getStat(player, 'weak_foot_stars', 'weak_foot') || 0)}${'☆'.repeat(5 - (getStat(player, 'weak_foot_stars', 'weak_foot') || 0))}
                                    </div>
                                </div>
                            </div>

                            <div style="
                                background: rgba(255,255,255,0.03);
                                border: 1px solid rgba(255,255,255,0.08);
                                border-radius: var(--radius-base, 8px);
                                padding: 16px;
                                margin-bottom: 20px;
                            ">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="font-size: 13px; color: var(--color-text-muted, #98A0A6); font-weight: 600; font-family: var(--font-family-base);">League</span>
                                    <span style="font-size: 13px; color: var(--color-text-primary, #E6EEF2); font-weight: 700; font-family: var(--font-family-base);">${player.league || 'N/A'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-size: 13px; color: var(--color-text-muted, #98A0A6); font-weight: 600; font-family: var(--font-family-base);">Nation</span>
                                    <span style="font-size: 13px; color: var(--color-text-primary, #E6EEF2); font-weight: 700; font-family: var(--font-family-base);">${nationField || 'N/A'}</span>
                                </div>
                            </div>

                            <div style="
                                background: rgba(0,194,168,0.08);
                                border: 1px solid rgba(0,194,168,0.25);
                                border-radius: var(--radius-base, 8px);
                                padding: 18px;
                                text-align: center;
                            ">
                                <div style="
                                    font-size: 12px;
                                    color: var(--color-text-muted, #98A0A6);
                                    font-weight: 600;
                                    margin-bottom: 8px;
                                    text-transform: uppercase;
                                    font-family: var(--font-family-base);
                                    letter-spacing: 0.5px;
                                ">Market Value</div>
                                <div style="
                                    font-size: 26px;
                                    font-weight: 900;
                                    color: var(--color-teal-500, #00C2A8);
                                    font-family: var(--font-family-base);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 10px;
                                ">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10"/>
                                    </svg>
                                    ${player.price ? (typeof formatPrice === 'function' ? formatPrice(player.price) : player.price.toLocaleString()) : 'Non-Auctionable'}
                                </div>
                            </div>
                        </div>

                        <button onclick="window.togglePlayerWatchlist('${uniqueId}')" style="
                            width: 100%;
                            background: ${isWatchlisted ? 'rgba(0,194,168,0.15)' : 'transparent'};
                            border: 1px solid ${isWatchlisted ? 'var(--color-teal-500, #00C2A8)' : 'rgba(255,255,255,0.15)'};
                            color: ${isWatchlisted ? 'var(--color-teal-500, #00C2A8)' : 'var(--color-text-muted, #98A0A6)'};
                            padding: 16px 24px;
                            border-radius: var(--radius-base, 8px);
                            cursor: pointer;
                            font-size: 15px;
                            font-weight: 700;
                            font-family: var(--font-family-base);
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            margin-top: 16px;
                        " onmouseover="this.style.borderColor='var(--color-teal-500, #00C2A8)'; this.style.color='var(--color-teal-500, #00C2A8)'" onmouseout="this.style.borderColor='${isWatchlisted ? '#00C2A8' : 'rgba(255,255,255,0.15)'}'; this.style.color='${isWatchlisted ? '#00C2A8' : '#98A0A6'}'">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWatchlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            ${isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                    </div>

                    <!-- RIGHT: Rank / Training area + Skills -->
                    <div>
                        ${await buildRankSelectionSection(player)}
                        
                        <!-- ⚡ SKILLS SECTION - Now below rank box -->
                        <div class="player-skills-section" style="margin-top: 24px;">
                          <div class="skills-header">
                            <h3>⚡ Skills & Abilities</h3>
                            <button class="reset-skills-btn" onclick="resetPlayerSkills(${player.player_id}, ${player.rank || 0})">
                              🔄 Reset Skills
                            </button>
                          </div>
                          
                          <!-- Skills Grid -->
                          <div class="skills-grid" id="player-skills-grid">
                            <!-- Skill cards rendered by JavaScript -->
                          </div>
                          
                          <!-- Skill Details Modal (for viewing stat boosts) -->
                          <div class="skill-detail-modal" id="skill-detail-modal" style="display: none;">
                            <div class="skill-modal-content">
                              <!-- Populated dynamically -->
                            </div>
                          </div>
                        </div>

                        <!-- 📈 PRICE HISTORY SECTION -->
                        <div class="player-price-history-section" data-auctionable="${canShowPriceHistory ? 'true' : 'false'}">
                          <div class="price-history-header">
                            <div>
                              <h3>📈 Price History</h3>
                              <span class="price-history-subtitle">Track market movement over time</span>
                            </div>
                            <div class="price-history-ranges" role="tablist" aria-label="Price history ranges">
                              ${['1D','3D','7D','15D','30D','Custom'].map((label) => {
                                const isActive = label === '7D';
                                return `<button class="price-range-btn ${isActive ? 'active' : ''}" data-range="${label}" type="button">${label}</button>`;
                              }).join('')}
                            </div>
                          </div>
                          <div class="price-history-custom">
                            <div class="price-history-custom-label">
                              Custom range: <span id="price-history-custom-days">7</span> days
                            </div>
                            <input class="price-history-slider" id="price-history-slider" type="range" min="1" max="30" value="7">
                          </div>
                          <div class="price-history-body">
                            <div class="price-history-loading" id="price-history-loading">
                              <div class="price-history-skeleton"></div>
                              <div class="price-history-skeleton"></div>
                              <div class="price-history-skeleton"></div>
                            </div>
                            <div class="price-history-empty" id="price-history-empty">
                              No price data available for this range.
                            </div>
                            <div class="price-history-chart">
                              <canvas id="player-price-history-chart"></canvas>
                            </div>
                          </div>
                        </div>
                    </div>

                </div>
            </div>

            ${statsMarkup}
        </div>

        <style>
            * {
                box-sizing: border-box;
            }
            
            /* Tablet and below - Stack player card vertically */
            @media (max-width: 1200px) {
                .player-top-section {
                    grid-template-columns: 1fr !important;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }
            }
            
            /* Medium tablets - 2 column stats grid */
            @media (max-width: 900px) {
                .stats-grid-container > div {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 16px !important;
                }
            }
            
            /* Mobile devices - Perfect 2x2 grid */
            @media (max-width: 640px) {
                /* Reduce outer container padding */
                #player-detail-view > div > div {
                    padding: 16px 12px !important;
                }
                
                /* Stats grid - 2 columns with tighter spacing */
                .stats-grid-container > div {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 10px !important;
                }
                
                /* Reduce stat card padding */
                .stats-grid-container > div > div {
                    padding: 16px 12px !important;
                }
                
                /* Scale down stat category headers */
                .stats-grid-container h3 {
                    font-size: 13px !important;
                }
                
                /* Scale down main stat number */
                .stats-grid-container > div > div > div:first-child > div:last-child {
                    font-size: 28px !important;
                }
                
                /* Reduce substat font sizes */
                .stats-grid-container span {
                    font-size: 11px !important;
                }
                
                /* Reduce substat values */
                .stats-grid-container > div > div > div:last-child span:last-child {
                    font-size: 14px !important;
                }
                
                /* Reduce progress bar heights */
                .stats-grid-container > div > div > div:nth-child(2) {
                    height: 8px !important;
                }
                
                .stats-grid-container > div > div > div:last-child > div > div:last-child {
                    height: 5px !important;
                }
                
                /* Reduce spacing in substats */
                .stats-grid-container > div > div > div:last-child {
                    gap: 10px !important;
                }
                
                /* Player card adjustments */
                .player-top-section > div:first-child > div:first-child {
                    padding: 20px 16px !important;
                }
            }
            
            /* Small mobile devices - Extra tight 2x2 */
            @media (max-width: 480px) {
                /* Even tighter outer padding */
                #player-detail-view > div > div {
                    padding: 12px 8px !important;
                }
                
                /* Minimal gap between stat cards */
                .stats-grid-container > div {
                    gap: 8px !important;
                }
                
                /* Compact stat card padding */
                .stats-grid-container > div > div {
                    padding: 12px 10px !important;
                }
                
                /* Further reduce headers */
                .stats-grid-container h3 {
                    font-size: 12px !important;
                }
                
                /* Smaller main stat */
                .stats-grid-container > div > div > div:first-child > div:last-child {
                    font-size: 24px !important;
                }
                
                /* Smaller substat labels */
                .stats-grid-container span {
                    font-size: 10px !important;
                }
                
                /* Smaller substat values */
                .stats-grid-container > div > div > div:last-child span:last-child {
                    font-size: 13px !important;
                }
                
                /* Reduce OVR badge */
                .player-top-section > div:first-child > div:first-child > div:first-child > div:first-child {
                    width: 54px !important;
                    height: 54px !important;
                }
                
                .player-top-section > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child {
                    font-size: 26px !important;
                }
                
                /* Back button adjustment */
                button[onclick="switchView('database')"] {
                    padding: 10px 16px !important;
                    font-size: 13px !important;
                }
                
                /* Title adjustments */
                h1 {
                    font-size: 22px !important;
                }
                
                h2 {
                    font-size: 18px !important;
                    margin-bottom: 12px !important;
                }
            }
            
            /* Extra small devices - Ensure no overflow */
            @media (max-width: 360px) {
                .stats-grid-container > div {
                    gap: 6px !important;
                }
                
                .stats-grid-container > div > div {
                    padding: 10px 8px !important;
                }
                
                .stats-grid-container h3 {
                    font-size: 11px !important;
                }
                
                .stats-grid-container > div > div > div:first-child > div:last-child {
                    font-size: 22px !important;
                }
            }

            /* Tablet (768px - 1020px) */
            @media (max-width: 1020px) {
                .rank-cards-grid {
                    gap: 16px !important; /* ✅ Keep good spacing */
                    max-width: 550px !important;
                }
                
                .rank-card {
                    min-width: 75px !important; /* ✅ Smaller card */
                    min-height: 100px !important;
                    padding: 14px 10px !important;
                    gap: 8px !important;
                }
                
                .rank-selector-icon {
                    width: 56px !important; /* ✅ Smaller icon */
                    height: 56px !important;
                    background-repeat: no-repeat !important;
                    image-rendering: pixelated !important;
                }
                
                .rank-selector-icon[data-icon-size] {
                    background-size: 336px 336px !important; /* 56/32 * 192 */
                }
                
                .rank-card div:first-child {
                    font-size: 14px !important;
                }
            }

            /* Mobile (480px - 768px) */
            @media (max-width: 768px) {
                .rank-cards-grid {
                    gap: 14px !important; /* ✅ Maintain good spacing */
                    max-width: 100% !important;
                    padding: 0 10px !important;
                }
                
                .rank-card {
                    min-width: 60px !important; /* ✅ Even smaller card */
                    min-height: 85px !important;
                    padding: 12px 8px !important;
                    gap: 6px !important;
                }
                
                .rank-selector-icon {
                    width: 48px !important; /* ✅ Smaller icon */
                    height: 48px !important;
                    background-repeat: no-repeat !important;
                    image-rendering: pixelated !important;
                }
                
                .rank-selector-icon[data-icon-size] {
                    background-size: 288px 288px !important; /* 48/32 * 192 */
                }
                
                .rank-card div:first-child {
                    font-size: 13px !important;
                }
            }

            /* Small Mobile (< 480px) */
            @media (max-width: 480px) {
                .rank-cards-grid {
                    gap: 12px !important; /* ✅ Still good spacing */
                    padding: 0 8px !important;
                }
                
                .rank-card {
                    min-width: 50px !important; /* ✅ Compact card */
                    min-height: 72px !important;
                    padding: 10px 6px !important;
                    gap: 4px !important;
                }
                
                .rank-selector-icon {
                    width: 40px !important; /* ✅ Compact icon */
                    height: 40px !important;
                    background-repeat: no-repeat !important;
                    image-rendering: pixelated !important;
                }
                
                .rank-selector-icon[data-icon-size] {
                    background-size: 240px 240px !important; /* 40/32 * 192 */
                }
                
                .rank-card div:first-child {
                    font-size: 12px !important;
                }
            }

            /* Extra Small Mobile (< 360px) */
            @media (max-width: 360px) {
                .rank-cards-grid {
                    gap: 12px !important; /* ✅ Minimum breathing room */
                    padding: 0 6px !important;
                }
                
                .rank-card {
                    min-width: 42px !important; /* ✅ Very compact */
                    min-height: 65px !important;
                    padding: 8px 4px !important;
                    gap: 5px !important;
                }
                
                .rank-selector-icon {
                    width: 36px !important; /* ✅ Tiny icon */
                    height: 36px !important;
                    background-repeat: no-repeat !important;
                    image-rendering: pixelated !important;
                }
                
                .rank-selector-icon[data-icon-size] {
                    background-size: 216px 216px !important; /* 36/32 * 192 */
                }
                
                .rank-card div:first-child {
                    font-size: 11px !important;
                }
            }

            /* Training Dropdown Styles */
            select#training-level-${player.player_id}:hover {
                border-color: var(--color-teal-500, #00C2A8) !important;
            }

            select option {
                background: var(--color-graphite-900, #0E1114);
                color: var(--color-text-primary, #E6EEF2);
                padding: 12px;
                font-weight: 600;
            }

            select option:checked {
                background: var(--color-teal-500, #00C2A8);
                color: var(--color-graphite-900, #0E1114);
            }

            /* Responsive Training Dropdown */
            @media (max-width: 640px) {
                select[id^="training-level"] {
                    font-size: 13px !important;
                    padding: 10px 14px !important;
                }
            }

        </style>
    `;

    const detailCard = container.querySelector('.player-detail-mini-card');
    if (typeof applyRankOverlay === 'function') {
        applyRankOverlay(detailCard, player.rank || 0, {
            scope: 'player-detail',
            modifierClass: 'rank-overlay--player-detail'
        });
    }

    setTimeout(() => {
        renderPlayerSkills(player);
        initAllRankAnimations();
        if (typeof window.initPlayerPriceHistory === 'function') {
          window.initPlayerPriceHistory(player);
        }
    }, 100);
}

window.updatePlayerStatsSection = function(player) {
    const container = document.getElementById('player-detail-view');
    if (!container) {
        console.warn('[STATS] Player detail container not found - skipping stats update.');
        return;
    }

    const statsSection = container.querySelector('.player-stats-section');
    if (!statsSection) {
        console.warn('[STATS] Stats section not found - skipping stats update.');
        return;
    }

    console.log('[STATS] Re-rendering player detail stats section for:', player.player_id);
    statsSection.outerHTML = window.renderPlayerStatsSection(player);
};

// ==================== PRICE HISTORY (PLAYER DETAIL) ====================
function canShowPlayerPriceHistory(player) {
  const isUntradableText = String(player?.is_untradable ?? player?.isuntradable ?? '').toLowerCase();
  const isUntradable =
    isUntradableText === 'true' ||
    isUntradableText === '1' ||
    isUntradableText === 'yes';
  return !isUntradable && !!player?.price;
}

window.initPlayerPriceHistory = function(player) {
  const container = document.querySelector('.player-price-history-section');
  if (!container || !player) return;

  const isAuctionable = canShowPlayerPriceHistory(player);
  container.style.display = isAuctionable ? '' : 'none';
  console.log('[PRICE HISTORY] Auctionable:', isAuctionable);
  if (!isAuctionable) {
    if (window.state.priceHistoryChart) {
      window.state.priceHistoryChart.destroy();
      window.state.priceHistoryChart = null;
    }
    return;
  }

  const buttons = container.querySelectorAll('.price-range-btn');
  const slider = document.getElementById('price-history-slider');
  const sliderValue = document.getElementById('price-history-custom-days');

  if (slider && sliderValue) {
    slider.value = window.state?.priceHistory?.customDays ?? 7;
    sliderValue.textContent = slider.value;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.dataset.range || '7D';
      window.state.priceHistory.range = range;
      container.setAttribute('data-range', range);
      console.log('[PRICE HISTORY] Range changed:', range);

      if (range !== 'Custom') {
        window.refreshPlayerPriceHistory(player, { range });
      } else {
        window.refreshPlayerPriceHistory(player, { range, customDays: window.state.priceHistory.customDays });
      }
    });
  });

  if (slider) {
    slider.addEventListener('input', () => {
      const days = parseInt(slider.value, 10);
      window.state.priceHistory.customDays = days;
      if (sliderValue) sliderValue.textContent = days;
      console.log('[PRICE HISTORY] Custom range days changed:', days);

      if (window.state.priceHistory.range === 'Custom') {
        window.refreshPlayerPriceHistory(player, { range: 'Custom', customDays: days });
      }
    });
  }

  const activeRange = window.state?.priceHistory?.range || '7D';
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === activeRange);
  });
  container.setAttribute('data-range', activeRange);

  window.refreshPlayerPriceHistory(player, { range: activeRange, customDays: window.state?.priceHistory?.customDays });
};

window.refreshPlayerPriceHistory = async function(player, { range = '7D', customDays } = {}) {
  if (!player) return;

  if (!canShowPlayerPriceHistory(player)) {
    console.log('[PRICE HISTORY] Skipping fetch for non-auctionable player.');
    return;
  }

  const chartEl = document.getElementById('player-price-history-chart');
  const loadingEl = document.getElementById('price-history-loading');
  const emptyEl = document.getElementById('price-history-empty');
  if (!chartEl) return;

  const ctx = chartEl.getContext('2d');
  if (!ctx) return;

  const chartContainer = chartEl.parentElement;
  if (chartContainer) {
    chartEl.height = chartContainer.clientHeight || chartEl.height || 320;
    chartEl.width = chartContainer.clientWidth || chartEl.width;
  }

  const rangeDays = window.getPriceHistoryRangeDays(range, customDays);

  const startTime = new Date();
  startTime.setDate(startTime.getDate() - rangeDays);
  const endTime = new Date();

  const rankValue = player.rank || 0;
  const priceColumn = window.getPriceHistoryColumn(rankValue);

  console.log('[PRICE HISTORY] Fetching data:', {
    playerId: player.player_id,
    range,
    rangeDays,
    rankValue,
    priceColumn
  });

  if (loadingEl) loadingEl.style.display = 'flex';
  if (emptyEl) emptyEl.style.display = 'none';

  try {
    if (!window.supabaseProvider || typeof window.supabaseProvider.fetchPriceHistory !== 'function') {
      throw new Error('Supabase provider not available');
    }

    const history = await window.supabaseProvider.fetchPriceHistory({
      playerId: player.player_id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      priceColumn
    });

    console.log('[PRICE HISTORY] Supabase data received:', history);

    const normalized = history
      .filter(entry => entry && entry[priceColumn] != null && entry.captured_at)
      .map(entry => ({
        date: new Date(entry.captured_at),
        price: Number(entry[priceColumn])
      }))
      .sort((a, b) => a.date - b.date);

    const downsampled = window.downsampleHistory(normalized, 200);

    if (!downsampled.length) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (window.state.priceHistoryChart) {
        window.state.priceHistoryChart.destroy();
        window.state.priceHistoryChart = null;
      }
      return;
    }

    if (window.state.priceHistoryChart) {
      window.state.priceHistoryChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, (chartEl.parentElement?.clientHeight || chartEl.height || 200));
    gradient.addColorStop(0, 'rgba(0, 194, 168, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 194, 168, 0.02)');

    window.state.priceHistoryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: downsampled.map(point => point.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })),
        datasets: [{
          data: downsampled.map(point => point.price),
          borderColor: '#00C2A8',
          backgroundColor: gradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#E6EEF2',
          pointHoverBorderColor: '#00C2A8',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 80,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#11161B',
            borderColor: 'rgba(0, 194, 168, 0.6)',
            borderWidth: 1,
            titleColor: '#E6EEF2',
            bodyColor: '#9CA3AF',
            padding: 12,
            displayColors: false,
            callbacks: {
              title: function(context) {
                const idx = context?.[0]?.dataIndex ?? 0;
                const date = downsampled[idx]?.date;
                return date ? date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }) : '';
              },
              label: function(context) {
                const value = context.parsed.y;
                return `Price: ${typeof formatPrice === 'function' ? formatPrice(value) : value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#7E8A94',
              maxTicksLimit: 8
            }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#7E8A94',
              callback: function(value) {
                return typeof formatPrice === 'function' ? formatPrice(value) : value;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animation: {
          duration: 600,
          easing: 'easeOutQuart'
        },
        onResize: function(chartInstance, size) {
          console.log('[PRICE HISTORY] Chart resized:', size);
        }
      }
    });

    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
  } catch (error) {
    console.error('[PRICE HISTORY] Error fetching history:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.textContent = 'Unable to load price data.';
      emptyEl.style.display = 'flex';
    }
  }
};

window.getPriceHistoryRangeDays = function(range, customDays) {
  switch (range) {
    case '1D':
      return 1;
    case '3D':
      return 3;
    case '7D':
      return 7;
    case '15D':
      return 15;
    case '30D':
      return 30;
    case 'Custom':
      return Math.min(Math.max(parseInt(customDays || 7, 10), 1), 30);
    default:
      return 7;
  }
};

window.getPriceHistoryColumn = function(rank) {
  const safeRank = Math.min(Math.max(parseInt(rank || 0, 10), 0), 5);
  return `price${safeRank}`;
};

window.downsampleHistory = function(points, maxPoints) {
  if (!Array.isArray(points) || points.length <= maxPoints) return points || [];
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, index) => index % step === 0);
  const lastPoint = points[points.length - 1];
  if (sampled[sampled.length - 1] !== lastPoint) {
    sampled.push(lastPoint);
  }
  return sampled;
};

// Add this function after renderPlayerDetail()
// ==================== RENDER PLAYER SKILLS ====================
// ==================== CALCULATE MAX LEVELS ====================
function calculateMaxLevels(skills) {
  const maxLevels = {};
  
  // Default: all skills have max level 1
  skills.forEach(skill => {
    maxLevels[skill.skill_id] = 1;
  });
  
  // Find skills that appear as prerequisites and update their max levels
  skills.forEach(skill => {
    if (skill.unlock_requirement_skillname && skill.unlock_requirement_level) {
      // Find the skill_id of the prerequisite by matching name
      const prereqSkill = skills.find(s => 
        s.skill_name && skill.unlock_requirement_skillname &&
        s.skill_name.toUpperCase() === skill.unlock_requirement_skillname.toUpperCase()
      );
      
      if (prereqSkill) {
        // Update max level to the highest requirement level seen
        const currentMax = maxLevels[prereqSkill.skill_id] || 1;
        const requiredLevel = skill.unlock_requirement_level || 1;
        maxLevels[prereqSkill.skill_id] = Math.max(currentMax, requiredLevel);
      }
    }
  });
  
  console.log('[SKILLS] Calculated max levels:', maxLevels);
  return maxLevels;
}

const SKILL_ALLOCATIONS_STORAGE_KEY = 'zenith_skill_allocations_cache';
let skillAllocationsCache = null;

function loadSkillAllocationsCache() {
  if (skillAllocationsCache) return;
  skillAllocationsCache = {};
  try {
    const raw = localStorage.getItem(SKILL_ALLOCATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        skillAllocationsCache = parsed;
      }
    }
  } catch (error) {
    console.warn('[SKILLS] Failed to load skill cache:', error);
    skillAllocationsCache = {};
  }
}

function persistSkillAllocationsCache() {
  if (!skillAllocationsCache) return;
  try {
    localStorage.setItem(SKILL_ALLOCATIONS_STORAGE_KEY, JSON.stringify(skillAllocationsCache));
  } catch (error) {
    console.warn('[SKILLS] Failed to save skill cache:', error);
  }
}

function getSkillAllocationsCacheKey(userId, playerId, rank) {
  return `${String(userId)}:${String(playerId)}:${String(rank || 0)}`;
}

function getSkillAllocationsCacheEntry(userId, playerId, rank) {
  loadSkillAllocationsCache();
  const key = getSkillAllocationsCacheKey(userId, playerId, rank);
  return skillAllocationsCache[key] || null;
}

function setSkillAllocationsCacheEntry(userId, playerId, rank, allocations, source = 'local') {
  loadSkillAllocationsCache();
  const key = getSkillAllocationsCacheKey(userId, playerId, rank);
  skillAllocationsCache[key] = {
    allocations: Array.isArray(allocations) ? allocations : [],
    source,
    updatedAt: Date.now()
  };
  persistSkillAllocationsCache();
  return skillAllocationsCache[key];
}

window.getSkillAllocationsCacheEntry = getSkillAllocationsCacheEntry;
window.setSkillAllocationsCacheEntry = setSkillAllocationsCacheEntry;


// ==================== RENDER PLAYER SKILLS ====================
async function renderPlayerSkills(player, options = {}) {
  console.log('[SKILLS] Rendering skills for player:', player.player_id, 'Rank:', player.rank);
  
  const skillsGrid = document.getElementById('player-skills-grid');
  if (!skillsGrid) {
    return;
  }

  const skills = player.skills || [];
  const availablePoints = player.available_skill_points || player.rank || 0;
  const currentRank = player.rank || 0;

  if (skills.length === 0) {
    skillsGrid.innerHTML = '<p style="color: #98A0A6; text-align: center;">No skills available</p>';
    return;
  }

  // Calculate max levels for each skill
  const maxLevels = calculateMaxLevels(skills);

  // Fetch user's current allocations
  const hasProvidedAllocations = Array.isArray(options.allocations);
  let userAllocations = hasProvidedAllocations ? options.allocations : [];
  if (!hasProvidedAllocations) {
    try {
      const response = await window.apiClient.getUserSkillAllocations(
        CURRENT_USER_ID, 
        player.player_id, 
        currentRank
      );
      userAllocations = response.allocations || [];
      if (typeof window.setSkillAllocationsCacheEntry === 'function') {
        window.setSkillAllocationsCacheEntry(CURRENT_USER_ID, player.player_id, currentRank, userAllocations, response.source || 'server');
      }
      console.log('[SKILLS] User allocations:', userAllocations);
    } catch (error) {
      console.error('[SKILLS] Error fetching allocations:', error);
    }
  } else if (typeof window.setSkillAllocationsCacheEntry === 'function') {
    window.setSkillAllocationsCacheEntry(CURRENT_USER_ID, player.player_id, currentRank, userAllocations, options.source || 'local');
  }

  // Build a map of skill_id -> current level
  const allocationMap = {};
  userAllocations.forEach(a => {
    allocationMap[a.skill_id] = a.skill_level;
  });

  // Calculate points spent
  const pointsSpent = userAllocations.reduce((sum, a) => sum + a.skill_level, 0);
  const pointsRemaining = availablePoints - pointsSpent;

  console.log('[SKILLS] Points - Available:', availablePoints, 'Spent:', pointsSpent, 'Remaining:', pointsRemaining);

  // Render skill cards
  skillsGrid.innerHTML = '';
  
  skills.forEach(skill => {
    const currentLevel = allocationMap[skill.skill_id] || 0;
    const isUnlocked = checkIfSkillUnlocked(skill, allocationMap, skills);
    
    const card = createSkillCard(skill, currentLevel, isUnlocked, pointsRemaining, player, maxLevels);
    skillsGrid.appendChild(card);
  });
}


// ==================== CHECK IF SKILL UNLOCKED ====================
function checkIfSkillUnlocked(skill, allocationMap, allSkills) {
  // Check if skill has unlock requirements
  const hasUnlockRequirement = skill.unlock_requirement_type && 
                                skill.unlock_requirement_type === 'skill_level' &&
                                skill.unlock_requirement_skillname && 
                                skill.unlock_requirement_level;
  
  // If no unlock requirement, skill is unlocked
  if (!hasUnlockRequirement) {
    return true;
  }
  
  const requiredSkillName = skill.unlock_requirement_skillname.toUpperCase();
  const requiredLevel = skill.unlock_requirement_level;
  
  // Try using prerequisite_skill_id first (most reliable)
  if (skill.prerequisite_skill_id && skill.prerequisite_skill_id !== 0) {
    const prereqLevel = allocationMap[skill.prerequisite_skill_id] || 0;
    return prereqLevel >= requiredLevel;
  }
  
  // Fallback: Find by skill name
  const prereqSkill = allSkills.find(s => 
    s.skill_name && s.skill_name.toUpperCase() === requiredSkillName
  );
  
  if (prereqSkill) {
    const prereqLevel = allocationMap[prereqSkill.skill_id] || 0;
    return prereqLevel >= requiredLevel;
  }
  
  // Can't find prerequisite = assume locked
  return false;
}

function getSkillUnlockMessage(skill) {
  if (!skill) return 'Skill locked';
  if (skill.unlock_requirement_text) return skill.unlock_requirement_text;
  if (skill.unlock_requirement_type === 'skill_level' &&
      skill.unlock_requirement_skillname &&
      skill.unlock_requirement_level) {
    return `Requires ${skill.unlock_requirement_skillname} Level ${skill.unlock_requirement_level}`;
  }
  return 'Skill locked';
}


// ==================== CREATE SKILL CARD ====================
// ==================== CREATE SKILL CARD (UPDATED) ====================
function createSkillCard(skill, currentLevel, isUnlocked, pointsRemaining, player, maxLevels) {
  const card = document.createElement('div');
  card.className = `skill-card ${!isUnlocked ? 'locked' : ''}`;
  
  // Get max level from calculated map
  const maxLevel = maxLevels[skill.skill_id] || 1;
  
  // ✅ Make entire card clickable to open modal
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    openSkillDetailModal(skill.skill_id, skill.skill_name);
  });
  
  card.innerHTML = `
    <div class="skill-card-inner">
      <!-- Skill Icon -->
      <div class="skill-icon">
        <img src="${skill.skill_image}" alt="${skill.skill_name}" 
             onerror="this.src='https://via.placeholder.com/80?text=SKILL'">
        ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
      </div>
      
      <!-- Skill Name -->
      <div class="skill-name">${skill.skill_name}</div>
      
      <!-- Current Level -->
      <div class="skill-level">
        Level: <span class="level-number">${currentLevel}</span>/${maxLevel}
      </div>
      
      <!-- Unlock Requirement or Status -->
      ${!isUnlocked ? `
        <div class="unlock-requirement">
          <small>${skill.unlock_requirement_text || 'Locked'}</small>
        </div>
      ` : `
        <div class="skill-actions">
          ${currentLevel >= maxLevel ? `
            <div class="max-level-badge">MAX LEVEL</div>
          ` : ''}
          ${currentLevel < maxLevel && pointsRemaining === 0 ? `
            <small style="color: #FF6B6B;">No points remaining</small>
          ` : ''}
        </div>
      `}
    </div>
  `;
  
  return card;
}



// ==================== SKILL BOOST HELPERS ====================

/**
 * Calculate skill boosts from user's allocated skills
 * @param {Array} userAllocations - Array of skill allocations with skill_id and skill_level
 * @returns {Object} Accumulated skill boosts (e.g., { finishing: 3, shot_power: 2 })
 */
async function calculateSkillBoosts(userAllocations) {
  const skillBoosts = {};
  
  for (const allocation of userAllocations) {
    if (allocation.skill_level > 0) {
      try {
        const boostData = await window.apiClient.getSkillBoosts(allocation.skill_id);
        
        if (boostData && boostData.boosts) {
          const levelBoost = boostData.boosts.find(b => b.level_number === allocation.skill_level);
          
          if (levelBoost) {
            for (const [key, value] of Object.entries(levelBoost)) {
              if (key.startsWith('boost_') && value != null && value !== 0) {
                const statName = key.replace('boost_', '');
                skillBoosts[statName] = (skillBoosts[statName] || 0) + value;
              }
            }
          }
        }
      } catch (error) {
        console.error(`[SKILLS] Error fetching boosts for skill ${allocation.skill_id}:`, error);
      }
    }
  }
  
  return skillBoosts;
}

/**
 * Merge training boosts and skill boosts
 * @param {Object} trainingBoosts - Boosts from position training
 * @param {Object} skillBoosts - Boosts from allocated skills
 * @returns {Object} Combined boosts
 */
function mergeBoosts(trainingBoosts, skillBoosts) {
  const merged = { ...(trainingBoosts || {}) };
  
  for (const [stat, value] of Object.entries(skillBoosts || {})) {
    merged[stat] = (merged[stat] || 0) + value;
  }
  
  return merged;
}

// ==================== UPGRADE SKILL ====================
window.upgradeSkillLevel = async function(skillId, newLevel, playerId, rank) {
  console.log('[SKILLS] Upgrading skill:', skillId, 'to level', newLevel);
  
  try {
    const result = await window.apiClient.upgradeSkill(
      CURRENT_USER_ID,
      playerId,
      rank,
      skillId,
      newLevel
    );
    
    console.log('[SKILLS] Upgrade success:', result);
    
    // Re-fetch player data and re-render
    if (state.selectedPlayer) {
      const resp = await window.apiClient.getPlayerDetails(playerId, rank);
      
      // Fetch user's skill allocations
      const allocationsResp = await window.apiClient.getUserSkillAllocations(
        CURRENT_USER_ID,
        playerId,
        rank,
        { allowLocalOverride: false }
      );
      
      // Calculate skill boosts from allocations
      const skillBoosts = await calculateSkillBoosts(allocationsResp.allocations || []);
      
      const trainingBoosts = state.selectedPlayer?.training_boosts || null;
      
      const updatedPlayer = {
        ...state.selectedPlayer,
        ...resp.player,
        skills: resp.skills,
        available_skill_points: resp.available_skill_points,
        training_boosts: trainingBoosts,
        skill_boosts: skillBoosts
      };
      
      state.selectedPlayer = updatedPlayer;
      console.log('[SKILLS] Updated player boosts after upgrade:', {
        training: updatedPlayer.training_boosts,
        skills: updatedPlayer.skill_boosts
      });
      
      // Re-render skills section only
      await renderPlayerSkills(updatedPlayer);

      // Re-render stats section to show updated skill boosts
      if (typeof window.updatePlayerStatsSection === 'function') {
        window.updatePlayerStatsSection(updatedPlayer);
      } else {
        renderPlayerDetail(updatedPlayer);
        cleanupRankAnimations();
      }
    }
    
  } catch (error) {
    console.error('[SKILLS] Upgrade error:', error);
    return;
  }
};

// ==================== RESET SKILLS BUTTON ====================
window.resetPlayerSkills = async function(playerId, rank) {
  console.log('[SKILLS] Resetting all skills for player', playerId, 'at rank', rank);
  
  try {
    const isSelectedPlayer = state.selectedPlayer &&
      String(state.selectedPlayer.player_id) === String(playerId);
    if (isSelectedPlayer) {
      console.log('[SKILLS] Pre-reset skills:', state.selectedPlayer.skill_boosts);
      console.log('[SKILLS] Pre-reset stats snapshot:', {
        pace: state.selectedPlayer.pace,
        shooting: state.selectedPlayer.shooting,
        passing: state.selectedPlayer.passing,
        dribbling: state.selectedPlayer.dribbling,
        defending: state.selectedPlayer.defending,
        physical: state.selectedPlayer.physical
      });
    }

    // Call API to reset skills
    const result = await window.apiClient.resetSkills(CURRENT_USER_ID, playerId, rank);
    
    console.log('[SKILLS] Reset successful:', result);
    
    // Re-fetch player data and re-render
    if (isSelectedPlayer) {
      const resp = await window.apiClient.getPlayerDetails(playerId, rank);
      const allocationsResp = await window.apiClient.getUserSkillAllocations(
        CURRENT_USER_ID,
        playerId,
        rank,
        { allowLocalOverride: false }
      );
      const skillBoosts = await calculateSkillBoosts(allocationsResp.allocations || []);
      const trainingBoosts = state.selectedPlayer?.training_boosts || null;

      const updatedPlayer = {
        ...state.selectedPlayer,
        ...resp.player,
        skills: resp.skills,
        available_skill_points: resp.available_skill_points,
        training_boosts: trainingBoosts,
        skill_boosts: skillBoosts
      };
      
      state.selectedPlayer = updatedPlayer;
      console.log('[SKILLS] Post-reset skills:', updatedPlayer.skill_boosts);
      console.log('[SKILLS] Post-reset stats snapshot:', {
        pace: updatedPlayer.pace,
        shooting: updatedPlayer.shooting,
        passing: updatedPlayer.passing,
        dribbling: updatedPlayer.dribbling,
        defending: updatedPlayer.defending,
        physical: updatedPlayer.physical
      });
      
      // Re-render both skills section and player detail
      await renderPlayerSkills(updatedPlayer);
      if (typeof window.updatePlayerStatsSection === 'function') {
        window.updatePlayerStatsSection(updatedPlayer);
      } else {
        renderPlayerDetail(updatedPlayer);
      }
    }
    
  } catch (error) {
    console.error('[SKILLS] Reset error:', error);
    return;
  }
};

window.resetSquadCustomizationSkills = async function() {
  const isCompare = compareCustomizationContext?.active;
  const playerId = isCompare
    ? compareCustomizationState.playerId
    : window.squadCustomizationState?.playerId;
  const rank = isCompare
    ? compareCustomizationState.selectedRank
    : window.squadCustomizationState?.selectedRank;

  console.log("[Skills] Reset triggered from Squad Customization modal");

  if (!playerId) {
    console.warn('[SKILLS] Reset skipped: no player selected');
    return;
  }

  const resolvedRank = Number.isFinite(Number(rank)) ? Number(rank) : 0;
  await resetPlayerSkills(playerId, resolvedRank);

  if (isCompare) {
    await renderComparePlayerSkills();
    handleCompareCustomizationChange('skill-reset');
    return;
  }

  if (window.squadCustomizationState &&
      String(window.squadCustomizationState.playerId) === String(playerId) &&
      typeof renderSquadPlayerSkills === 'function') {
    await renderSquadPlayerSkills();
  }
};



// ==================== SKILL DETAIL MODAL ====================
function getSkillModalPlayerContext() {
  if (compareCustomizationContext?.active && compareCustomizationState?.player) {
    return { player: compareCustomizationState.player, mode: 'compare' };
  }
  return { player: state.selectedPlayer, mode: 'default' };
}

window.openSkillDetailModal = async function(skillId, skillName) {
  console.log('[SKILLS] Opening modal for skill:', skillId);
  
  let modal = document.getElementById('skill-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'skill-detail-modal';
    modal.className = 'skill-detail-modal';
    modal.style.display = 'none';
    modal.innerHTML = '<div class="skill-modal-content"></div>';
    document.body.appendChild(modal);
  }
  
  // Store skill info in modal dataset for re-opening
  modal.dataset.skillId = skillId;
  modal.dataset.skillName = skillName;
  
  // Show loading state
  modal.innerHTML = `
    <div class="skill-modal-content">
      <h3>Loading ${skillName}...</h3>
    </div>
  `;
  modal.style.display = 'flex';
  
  try {
    // Get current player data
    const context = getSkillModalPlayerContext();
    if (!context.player) {
      throw new Error('No player selected');
    }

    const playerRank = Number.isFinite(context.player.rank)
      ? context.player.rank
      : (compareCustomizationContext?.active ? compareCustomizationState.selectedRank : 0);
    const player = { ...context.player, rank: playerRank };
    
    // Fetch skill boosts
    const boostsData = await window.apiClient.getSkillBoosts(skillId);
    const boosts = boostsData.boosts || [];
    
    // Fetch user's skill allocations to determine current level
    const allocationsResp = await window.apiClient.getUserSkillAllocations(
      CURRENT_USER_ID,
      player.player_id,
      playerRank
    );
    const userAllocations = allocationsResp.allocations || [];
    
    // Find current level for this skill
    const allocation = userAllocations.find(a => a.skill_id === skillId);
    const currentLevel = allocation ? allocation.skill_level : 0;

    // Determine unlock state
    const allocationMap = {};
    userAllocations.forEach(a => {
      allocationMap[a.skill_id] = a.skill_level;
    });
    const allSkills = player.skills || [];
    const skillEntry = allSkills.find(s => s.skill_id === skillId);
    const isUnlocked = skillEntry ? checkIfSkillUnlocked(skillEntry, allocationMap, allSkills) : true;
    const unlockMessage = isUnlocked ? '' : getSkillUnlockMessage(skillEntry);
    if (!isUnlocked) {
      modal.innerHTML = `
        <div class="skill-modal-content" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeSkillDetailModal()">✕</button>
          <h2>${skillName}</h2>
          <div style="margin-top: 8px; color: #FFB86B; font-weight: 600;">${unlockMessage}</div>
          <button class="modal-action-btn" onclick="closeSkillDetailModal()">Close</button>
        </div>
      `;
      return;
    }
    
    // Calculate points remaining
    const availablePoints = player.available_skill_points || playerRank || 0;
    const pointsSpent = userAllocations.reduce((sum, a) => sum + a.skill_level, 0);
    const pointsRemaining = availablePoints - pointsSpent;
    
    console.log('[SKILLS] Current level:', currentLevel, 'Points remaining:', pointsRemaining);
    
    // Render modal content
    renderSkillDetailModal(skillName, boosts, currentLevel, pointsRemaining, skillId, player, {
      isUnlocked,
      unlockMessage
    });
    
  } catch (error) {
    console.error('[SKILLS] Error loading skill details:', error);
    modal.innerHTML = `
      <div class="skill-modal-content">
        <h3>Error Loading Skill</h3>
        <p style="color: #FF6B6B;">${error.message}</p>
        <button onclick="closeSkillDetailModal()" style="margin-top: 15px; padding: 10px 20px; background: #00C2A8; border: none; border-radius: 8px; cursor: pointer;">Close</button>
      </div>
    `;
  }
};

function renderSkillDetailModal(skillName, boosts, currentLevel, pointsRemaining, skillId, player, options = {}) {
  const modal = document.getElementById('skill-detail-modal');
  const isUnlocked = options.isUnlocked !== false;
  const unlockMessage = options.unlockMessage || '';
  
  let boostsHTML = '';
  
  boosts.forEach(boost => {
    const levelNum = boost.level_number;
    // FIX: Only mark as selected if this exact level is currently active
    const isSelected = currentLevel === levelNum;
    // FIX: Calculate points needed for upgrade (negative means downgrade - always allowed)
    const pointsNeeded = levelNum - currentLevel;
    const canAfford = pointsNeeded <= pointsRemaining;
    // Only disable if NOT selected AND requires MORE points than available
    const isDisabled = !isSelected && !canAfford;
    const isLocked = !isUnlocked;
    
    // FIX: Allow clicking any affordable level (including lower levels for downgrade)
    // Add event.stopPropagation() to prevent modal from closing
    const onclickAttr = (isDisabled || isLocked) ? '' : `onclick="event.stopPropagation(); selectSkillLevel(${skillId}, ${levelNum}, ${currentLevel}, ${player.player_id}, ${player.rank})"`;
    const cursorStyle = (isDisabled || isLocked) ? 'cursor: not-allowed;' : 'cursor: pointer;';
    
    boostsHTML += `
      <div class="boost-level-section ${isSelected ? 'selected' : ''} ${currentLevel >= levelNum && !isSelected ? 'unlocked' : ''} ${(isDisabled || isLocked) ? 'disabled' : ''}" 
           ${onclickAttr}
           style="${cursorStyle}">
        <div class="level-checkbox ${isSelected ? 'checked' : ''} ${currentLevel >= levelNum && !isSelected ? 'partial' : ''} ${isDisabled ? 'disabled' : ''}">
          ${isSelected ? '✓' : (currentLevel >= levelNum ? '○' : '')}
        </div>
        <h4>Level ${levelNum}</h4>
        ${isDisabled && pointsNeeded > 0 ? `<div class="insufficient-points">Need ${pointsNeeded} more point${pointsNeeded > 1 ? 's' : ''}</div>` : ''}
        <div class="boost-stats">
    `;
    
    // Show all non-zero boosts
    for (const [key, value] of Object.entries(boost)) {
      if (key.startsWith('boost_') && value && value !== 0) {
        const statName = key.replace('boost_', '').replace(/_/g, ' ').toUpperCase();
        boostsHTML += `<div class="boost-stat">+${value} ${statName}</div>`;
      }
    }
    // ✅ ADD: Show alternate positions for Level 2 only
    if (levelNum === 2 && player.alternate_position) {
        const altPositions = player.alternate_position
            .split(',')
            .map(pos => pos.trim())
            .filter(pos => pos.length > 0 && pos !== '0');
        
        if (altPositions.length > 0) {
            boostsHTML += `<div class="boost-stat" style="color: #00C2A8; font-weight: 700;">Alt Positions: ${altPositions.join(', ')}</div>`;
        }
    }
    
    boostsHTML += `
        </div>
      </div>
    `;
  });
  
  // FIX: Add event.stopPropagation() to modal content to prevent closing
  modal.innerHTML = `
    <div class="skill-modal-content" onclick="event.stopPropagation()">
      <button class="modal-close-btn" onclick="closeSkillDetailModal()">✕</button>
      <h2>${skillName}</h2>
      ${!isUnlocked ? `<div style="margin-top: 8px; color: #FFB86B; font-weight: 600;">${unlockMessage}</div>` : ''}
      <div class="points-info">
        <div class="current-level-badge">Current Level: ${currentLevel}</div>
        <div class="points-remaining-badge">${pointsRemaining} point${pointsRemaining !== 1 ? 's' : ''} available</div>
      </div>
      <div class="boosts-container">
        ${boostsHTML || '<p>No boost data available</p>'}
      </div>
      <button class="modal-action-btn" onclick="closeSkillDetailModal()">Close</button>
    </div>
  `;
}

// ==================== SELECT SKILL LEVEL ====================
window.selectSkillLevel = async function(skillId, targetLevel, currentLevel, playerId, rank) {
  console.log('[SKILLS] Selecting level:', targetLevel, 'Current:', currentLevel);
  
  try {
    const normalizedCurrent = Number(currentLevel) || 0;
    const normalizedTarget = Number(targetLevel) || 0;
    const isToggleOff = normalizedTarget === normalizedCurrent && normalizedCurrent > 0;
    const isSwitch = normalizedCurrent > 0 && normalizedTarget > 0 && normalizedTarget !== normalizedCurrent;
    const isApplied = normalizedCurrent === 0 && normalizedTarget > 0;
    const newLevel = isToggleOff ? 0 : normalizedTarget;
    const logEvent = isToggleOff
      ? 'SKILL_LEVEL_REMOVED'
      : (isSwitch ? 'SKILL_LEVEL_SWITCHED' : (isApplied ? 'SKILL_LEVEL_APPLIED' : ''));
    console.log("[Skills] Skill toggled:", skillId, "New Level:", newLevel);
    const isDeselect = newLevel === 0 && normalizedCurrent > 0;
    
    // If same as current, no change needed
    if (newLevel === normalizedCurrent) {
      console.log('[SKILLS] No change needed');
      return;
    }

    const isCompare = compareCustomizationContext.active &&
      String(compareCustomizationContext.playerId) === String(playerId);
    const basePlayer = isCompare
      ? (compareCustomizationState.player ||
        compareState.selectedPlayers.find(p => resolveComparePlayerId(p) === resolveComparePlayerId(playerId)) || {})
      : state.selectedPlayer;

    if (!basePlayer) {
      console.warn('[SKILLS] No player context found for skill update');
      return;
    }

    const cachedEntry = typeof window.getSkillAllocationsCacheEntry === 'function'
      ? window.getSkillAllocationsCacheEntry(CURRENT_USER_ID, playerId, rank)
      : null;
    const hasLocalOverride = cachedEntry && cachedEntry.source === 'local';
    let serverSkillLevel = normalizedCurrent;
    if (newLevel > normalizedCurrent && hasLocalOverride) {
      try {
        const serverAllocationsResp = await window.apiClient.getUserSkillAllocations(
          CURRENT_USER_ID,
          playerId,
          rank,
          { allowLocalOverride: false, updateCache: false }
        );
        const serverAllocation = (serverAllocationsResp.allocations || []).find(a => String(a.skill_id) === String(skillId));
        serverSkillLevel = Number(serverAllocation?.skill_level) || 0;
        console.log('[SKILLS] Server level check:', {
          skillId,
          serverSkillLevel,
          localLevel: normalizedCurrent,
          targetLevel: newLevel
        });
      } catch (error) {
        console.warn('[SKILLS] Server level check failed, using local level', error);
      }
    }

    if (hasLocalOverride && newLevel > normalizedCurrent) {
      console.log('[SKILLS] Local overrides active - applying upgrade locally', {
        skillId,
        fromLevel: normalizedCurrent,
        toLevel: newLevel,
        playerId,
        rank
      });
    }

    const isUpgrade = newLevel > serverSkillLevel && !hasLocalOverride;
    
    if (logEvent && typeof window.devLog === 'function') {
      window.devLog(logEvent, {
        skillId,
        fromLevel: normalizedCurrent,
        toLevel: newLevel,
        playerId,
        rank
      });
    }
    
    const trainingBoosts = basePlayer?.training_boosts || null;
    let allocations = [];
    let allocationsSource = 'local';
    let resp = null;

    if (isUpgrade) {
      const result = await window.apiClient.upgradeSkill(
        CURRENT_USER_ID,
        playerId,
        rank,
        skillId,
        newLevel
      );
      console.log('[SKILLS] Level change success:', result);

      resp = await window.apiClient.getPlayerDetails(playerId, rank);

      const allocationsResp = await window.apiClient.getUserSkillAllocations(
        CURRENT_USER_ID,
        playerId,
        rank,
        { allowLocalOverride: false }
      );
      allocations = allocationsResp.allocations || [];
      allocationsSource = 'server';
    } else {
      const localActionLabel = isDeselect
        ? '[SKILLS] Deselected skill locally'
        : (newLevel < normalizedCurrent ? '[SKILLS] Downgraded skill locally' : '[SKILLS] Applied skill locally');
      console.log(localActionLabel, {
        skillId,
        fromLevel: normalizedCurrent,
        toLevel: newLevel,
        playerId,
        rank
      });

      const hasCachedAllocations = cachedEntry && Array.isArray(cachedEntry.allocations);
      allocations = hasCachedAllocations ? [...cachedEntry.allocations] : [];

      if (!hasCachedAllocations) {
        const allocationsResp = await window.apiClient.getUserSkillAllocations(
          CURRENT_USER_ID,
          playerId,
          rank
        );
        allocations = allocationsResp.allocations || [];
      }

      const normalizedSkillId = Number(skillId);
      const updatedAllocations = allocations.filter(a => String(a.skill_id) !== String(normalizedSkillId));
      if (newLevel > 0) {
        const existing = allocations.find(a => String(a.skill_id) === String(normalizedSkillId)) || {};
        updatedAllocations.push({
          ...existing,
          skill_id: normalizedSkillId,
          skill_level: newLevel
        });
      }
      allocations = updatedAllocations;
      allocationsSource = 'local';

      if (typeof window.setSkillAllocationsCacheEntry === 'function') {
        window.setSkillAllocationsCacheEntry(CURRENT_USER_ID, playerId, rank, allocations, 'local');
      }
    }

    const skillBoosts = await calculateSkillBoosts(allocations || []);
    const combinedBoosts = isCompare ? mergeBoosts(trainingBoosts, skillBoosts) : trainingBoosts;

    const updatedPlayer = {
      ...basePlayer,
      ...(resp?.player || {}),
      rank,
      skills: resp?.skills || basePlayer.skills || [],
      available_skill_points: resp?.available_skill_points ?? basePlayer.available_skill_points,
      training_boosts: combinedBoosts,
      skill_boosts: skillBoosts
    };

    console.log('[SKILLS] Updated player boosts after level change:', {
      training: updatedPlayer.training_boosts,
      skills: updatedPlayer.skill_boosts
    });

    const selectedSkills = (allocations || []).map(a => ({
      skill_id: a.skill_id,
      skill_level: a.skill_level
    }));

    if (isCompare) {
      compareCustomizationState.player = updatedPlayer;
      compareCustomizationState.selectedSkills = selectedSkills;
      compareSkillBoost = skillBoosts || {};
      await renderComparePlayerSkills({ player: updatedPlayer, allocations, source: allocationsSource });
    } else if (state.selectedPlayer) {
      state.selectedPlayer = updatedPlayer;
      if (window.squadCustomizationState &&
          String(window.squadCustomizationState.playerId) === String(playerId)) {
        window.squadCustomizationState.selectedSkills = selectedSkills;
      }

      // Re-render skills grid
      await renderPlayerSkills(updatedPlayer, { allocations, source: allocationsSource });

      // Re-render stats section to show updated skill boosts
      if (typeof window.updatePlayerStatsSection === 'function') {
        window.updatePlayerStatsSection(updatedPlayer);
      } else {
        renderPlayerDetail(updatedPlayer);
      }
    }

    // FIX: Update modal content in-place (keep modal open, no flicker)
    const modal = document.getElementById('skill-detail-modal');
    if (modal && modal.style.display !== 'none') {
      // Get updated allocation info
      const allocationRows = allocations || [];
      const allocationMap = {};
      allocationRows.forEach(a => {
        allocationMap[a.skill_id] = a.skill_level;
      });

      // Calculate updated points remaining
      const totalPoints = updatedPlayer.available_skill_points || updatedPlayer.rank || 0;
      const usedPoints = allocationRows.reduce((sum, a) => sum + (a.skill_level || 0), 0);
      const pointsRemaining = totalPoints - usedPoints;

      // Get current skill's updated level
      const updatedCurrentLevel = allocationMap[skillId] || 0;

      // Fetch boosts data (should be cached)
      const boostsData = await window.apiClient.getSkillBoosts(skillId);
      const boosts = boostsData.boosts || [];

      // Re-render modal content directly (no loading state, no flicker)
      const updatedAllocMap = {};
      allocationRows.forEach(a => {
        updatedAllocMap[a.skill_id] = a.skill_level;
      });
      const updatedSkills = updatedPlayer.skills || [];
      const updatedSkillEntry = updatedSkills.find(s => s.skill_id === skillId);
      const updatedUnlocked = updatedSkillEntry ? checkIfSkillUnlocked(updatedSkillEntry, updatedAllocMap, updatedSkills) : true;
      const updatedUnlockMessage = updatedUnlocked ? '' : getSkillUnlockMessage(updatedSkillEntry);

      renderSkillDetailModal(
        modal.dataset.skillName,
        boosts,
        updatedCurrentLevel,
        pointsRemaining,
        skillId,
        updatedPlayer,
        {
          isUnlocked: updatedUnlocked,
          unlockMessage: updatedUnlockMessage
        }
      );

      // FIX: Ensure modal stays visible
      modal.style.display = 'flex';
    }

    // Update squad builder skills if customization modal is open
    if (!isCompare &&
        typeof renderSquadPlayerSkills === 'function' &&
        window.squadCustomizationState &&
        String(window.squadCustomizationState.playerId) === String(playerId)) {
      window.squadCustomizationState.selectedRank = rank;
      await renderSquadPlayerSkills();
    }

    if (isCompare) {
      handleCompareCustomizationChange('skill-change');
    }
    
  } catch (error) {
    console.error('[SKILLS] Level change error:', error);
    return;
  }
};

window.closeSkillDetailModal = function() {
  const modal = document.getElementById('skill-detail-modal');
  if (modal) modal.style.display = 'none';
};

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('skill-detail-modal');
  if (e.target === modal) {
    closeSkillDetailModal();
  }
});


// ==================== END OF SKILLS SECTION ====================





// ========== TRAINING SECTION ==========
// ========== TRAINING SECTION ==========
// ========== TRAINING SECTION ==========
// ========== TRAINING SECTION ==========
// ========== TRAINING SECTION ==========
function buildTrainingSection(player) {
    const hasTraining = player.training || player.trained_stats || player.training_level;

    if (!hasTraining && !player.rank) {
        return '';
    }

    const trainingLevels = [
        { level: 1, xp: 100, boost: '+1' },
        { level: 2, xp: 250, boost: '+2' },
        { level: 3, xp: 500, boost: '+3' },
        { level: 4, xp: 1000, boost: '+4' },
        { level: 5, xp: 2000, boost: '+5' },
    ];

    const currentLevel = player.training_level || 0;
    const currentXP = player.training_xp || 0;
    const maxLevel = 5;

    const nextLevel = trainingLevels[currentLevel] || trainingLevels[trainingLevels.length - 1];
    const progressPercent = currentLevel >= maxLevel ? 100 : Math.min((currentXP / nextLevel.xp) * 100, 100);

    return `
        <div style="
            background: var(--color-graphite-800, #ab1111);
            border: 1px solid rgba(0,194,168,0.2);
            border-radius: var(--radius-lg, 12px);
            padding: 24px;
            box-shadow: var(--shadow-md);
        ">
            <h3 style="
                font-size: 16px;
                font-weight: 800;
                color: var(--color-text-primary, #E6EEF2);
                margin: 0 0 20px 0;
                text-transform: uppercase;
                font-family: var(--font-family-base);
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Training Progress
            </h3>

            <div style="
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: var(--radius-base, 8px);
                padding: 18px;
                margin-bottom: 16px;
            ">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 14px;">
                    <div style="
                        background: var(--color-teal-500, #00C2A8);
                        color: var(--color-graphite-900, #0E1114);
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 14px rgba(0,194,168,0.4);
                        font-family: var(--font-family-base);
                    ">
                        <span style="font-size: 26px; font-weight: 900; line-height: 1;">${currentLevel}</span>
                        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.8;">LVL</span>
                    </div>
                    <div style="flex: 1;">
                        <div style="
                            background: rgba(255,255,255,0.08);
                            height: 10px;
                            border-radius: 5px;
                            overflow: hidden;
                            margin-bottom: 8px;
                        ">
                            <div style="
                                background: var(--color-teal-500, #00C2A8);
                                width: ${progressPercent}%;
                                height: 100%;
                                border-radius: 5px;
                                transition: width 0.5s ease;
                                box-shadow: 0 0 10px rgba(0,194,168,0.6);
                            "></div>
                        </div>
                        <div style="
                            font-size: 13px;
                            color: var(--color-text-muted, #98A0A6);
                            font-weight: 600;
                            font-family: var(--font-family-base);
                        ">
                            ${currentLevel >= maxLevel ?
                                '<span style="color: var(--color-status-success, #3BD671); font-weight: 800;">MAX LEVEL</span>' :
                                `${currentXP} / ${nextLevel.xp} XP`
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 18px;">
                ${trainingLevels.map((lvl, idx) => `
                    <div style="
                        flex: 1;
                        height: 8px;
                        background: ${idx < currentLevel ? 'var(--color-status-success, #3BD671)' : idx === currentLevel ? 'var(--color-teal-500, #00C2A8)' : 'rgba(255,255,255,0.08)'};
                        border-radius: 4px;
                        transition: all 0.3s;
                        box-shadow: ${idx === currentLevel ? '0 0 10px rgba(0,194,168,0.6)' : 'none'};
                    "></div>
                `).join('')}
            </div>

            ${player.trained_stats ? `
                <div style="
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: var(--radius-base, 8px);
                    padding: 16px;
                ">
                    <h4 style="
                        font-size: 12px;
                        font-weight: 700;
                        color: var(--color-text-muted, #98A0A6);
                        margin: 0 0 12px 0;
                        text-transform: uppercase;
                        font-family: var(--font-family-base);
                        letter-spacing: 0.5px;
                    ">Stat Boosts</h4>
                    <div style="display: grid; gap: 10px;">
                        ${Object.entries(player.trained_stats).map(([stat, boost]) => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 10px 14px;
                                background: rgba(0,194,168,0.05);
                                border-radius: 7px;
                                border-left: 3px solid var(--color-teal-500, #00C2A8);
                            ">
                                <span style="
                                    font-size: 13px;
                                    color: var(--color-text-primary, #E6EEF2);
                                    font-weight: 600;
                                    font-family: var(--font-family-base);
                                    text-transform: capitalize;
                                ">${stat.replace(/_/g, ' ')}</span>
                                <span style="
                                    background: var(--color-teal-500, #00C2A8);
                                    color: var(--color-graphite-900, #0E1114);
                                    padding: 5px 12px;
                                    border-radius: 6px;
                                    font-size: 14px;
                                    font-weight: 800;
                                    font-family: var(--font-family-base);
                                    box-shadow: 0 2px 8px rgba(0,194,168,0.3);
                                ">+${boost}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ========== RANK SELECTION SECTION ==========
// ==================== RANK SELECTION SECTION ====================
async function buildRankSelectionSection(player) {
    const currentRank = player.rank || 0;
    const skillPoints = RANK_CONFIG.skillPoints[currentRank] || 0;
    
    const rankCardsHtml = [1, 2, 3, 4, 5].map(rankNum => {
        const isSelected = currentRank === rankNum;
        const spriteUrl = RANK_CONFIG.ranks[rankNum];
        const rankColor = RANK_CONFIG.rankColors[rankNum];
        const uniqueId = `rank-selector-${rankNum}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        const iconSize = 56;
        const spriteSheetSize = 192 * (iconSize / 32); // 420px
        
        return `
            <div class="rank-card ${isSelected ? 'selected' : ''}" 
                 data-rank="${rankNum}" 
                 onclick="window.selectPlayerRank(${player.player_id}, ${rankNum})"
                 style="
                     position: relative;
                     background: rgba(255,255,255,0.03);
                     border: 2px solid ${isSelected ? 
                         (rankNum === 1 ? 'rgba(59,214,113,0.4)' :
                          rankNum === 2 ? 'rgba(99,102,241,0.4)' :
                          rankNum === 3 ? 'rgba(139,92,246,0.4)' :
                          rankNum === 4 ? 'rgba(255,184,107,0.4)' :
                          'rgba(255,107,107,0.4)') : 
                         'rgba(255,255,255,0.08)'};
                     border-radius: 14px;
                     padding: 16px 12px;
                     cursor: pointer;
                     transition: border-color 0.2s ease, box-shadow 0.2s ease;
                     text-align: center;
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
                     gap: 8px;
                     box-shadow: ${isSelected ? `0 0 20px ${rankColor}50` : 'none'};
                     min-width: 40px;
                     min-height: 70px;
                 ">
                <div style="font-size: 16px; font-weight: 800; color: ${rankColor}; font-family: var(--font-family-base); line-height: 1;">
                    ${rankNum}
                </div>
                
                <div class="rank-selector-icon animated-rank-icon" 
                     id="${uniqueId}" 
                     data-rank="${rankNum}"
                     data-icon-size="${iconSize}"
                     style="
                         width: ${iconSize}px;
                         height: ${iconSize}px;
                         background-image: url('${spriteUrl}');
                         background-size: ${spriteSheetSize}px ${spriteSheetSize}px;
                         background-position: 0px 0px;
                         background-repeat: no-repeat;
                         display: block;
                         flex-shrink: 0;
                         image-rendering: pixelated;
                         filter: ${isSelected ? `drop-shadow(0 0 8px ${rankColor})` : 'none'};
                     ">
                </div>
                
                ${isSelected ? `
                    <div style="
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        background: ${rankColor};
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 900;
                        color: #0E1114;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    ">✓</div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Build refresh time container
    const refreshTimeHtml = await window.buildRefreshTimeContainer(player);
    
    return `
        <div class="player-rank-refresh-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- LEFT: Rank Selection -->
            <div style="
                background: var(--color-graphite-800);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: var(--radius-lg);
                padding: 6px;
            ">
                <div style="
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin: 0 0 18px 0;
                    text-transform: uppercase;
                    font-family: var(--font-family-base);
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>Select Rank</span>
                    <button class="reset-rank-btn" onclick="window.resetPlayerRank(${player.player_id})" type="button">
                      Reset Rank
                    </button>
                </div>
                
                <div class="rank-cards-grid" style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 14px;
                    margin-bottom: 16px;
                    justify-items: center;
                ">
                    ${rankCardsHtml}
                </div>
                
                <!-- Training Level Selector -->
                <div style="
                    background: rgba(20,24,28);
                    border: 1px solid rgba(0,194,168,0.12);
                    border-radius: 10px;
                    padding: 16px;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    ">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-500)" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            <span style="
                                font-size: 13px;
                                font-weight: 700;
                                color: var(--color-text-primary);
                                text-transform: uppercase;
                                letter-spacing: 0.3px;
                            ">Training Level</span>
                        </div>
                        
                        <div style="
                            background: rgba(0,194,168,0.15);
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 700;
                            color: var(--color-teal-500);
                        ">
                            ${skillPoints} Points
                        </div>
                    </div>
                    
                    <div style="position: relative;">
                        <select id="training-level-${player.player_id}" 
                                onchange="window.setPlayerTrainingLevel(${player.player_id}, this.value)"
                                style="
                                    width: 100%;
                                    background: var(--color-graphite-800);
                                    border: 2px solid rgba(0,194,168,0.2);
                                    border-radius: 8px;
                                    padding: 12px 16px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: var(--color-text-primary);
                                    font-family: var(--font-family-base);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    appearance: none;
                                    background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M1 1.5L6 6.5L11 1.5%27 stroke=%27%2300C2A8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3c/svg%3e');
                                    background-repeat: no-repeat;
                                    background-position: right 16px center;
                                    padding-right: 40px;
                                "
                                onfocus="this.style.borderColor='var(--color-teal-500)'; this.style.boxShadow='0 0 0 3px rgba(0,194,168,0.1)';"
                                onblur="this.style.borderColor='rgba(0,194,168,0.2)'; this.style.boxShadow='none';">
                            <option value="0" ${(player.training_level || 0) === 0 ? 'selected' : ''}>No Training</option>
                            ${Array.from({length: 30}, (_, i) => i + 1).map(level => `
                                <option value="${level}" ${(player.training_level || 0) === level ? 'selected' : ''}>
                                    Level ${level}${level === 30 ? ' (MAX)' : ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    ${(player.training_level || 0) > 0 ? `
                        <div style="
                            margin-top: 12px;
                            padding: 10px;
                            background: rgba(59,214,113,0.08);
                            border: 1px solid rgba(59,214,113,0.15);
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3BD671" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span style="font-size: 12px; color: #3BD671; font-weight: 600;">
                                Training Level ${player.training_level || 0} Active
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- RIGHT: Refresh Time -->
            ${refreshTimeHtml}
        </div>
    `;
}





// ========== RANK SELECTION HANDLER ==========
// ==================== TRACK VISITED RANKS ====================
const visitedRanks = new Set();

window.selectPlayerRank = async function(playerId, rankNumber) {
  console.log('[RANK] Selecting rank', rankNumber, 'for player', playerId);
  console.log('[RankOverlay] PlayerDetail:', rankNumber);
  
  if (state.selectedPlayer && String(state.selectedPlayer.player_id) === String(playerId)) {
    const previousRank = state.selectedPlayer.rank || 0;
    const rankKey = `${playerId}_${rankNumber}`;
    
    // Check if this is a new rank selection
    const isNewRankSelection = previousRank !== rankNumber;
    const isFirstVisit = !visitedRanks.has(rankKey);
    
    if (!isNewRankSelection) {
      console.log('[RANK] Same rank selected, no action needed');
      return;
    }
    
    cleanupRankAnimations();
    
    try {
      // ✅ Only reset if switching to a NEW rank for the first time
      if (isNewRankSelection && isFirstVisit) {
        console.log('[RANK] First visit to rank', rankNumber, '- Resetting skills');
        
        try {
          await window.apiClient.resetSkills(CURRENT_USER_ID, playerId, rankNumber);
          visitedRanks.add(rankKey); // Mark as visited
          console.log('[RANK] Skills reset for rank', rankNumber);
        } catch (resetError) {
          console.warn('[RANK] Reset failed (might be empty):', resetError);
        }
      } else {
        console.log('[RANK] Returning to rank', rankNumber, '- Loading saved allocations');
      }
      
      // Fetch player data for new rank
      const resp = await window.apiClient.getPlayerDetails(playerId, rankNumber);
      
      const preservedColors = {
        color_rating: state.selectedPlayer?.color_rating,
        color_position: state.selectedPlayer?.color_position,
        color_name: state.selectedPlayer?.color_name
      };

      const updatedPlayer = {
        ...state.selectedPlayer,
        ...resp.player,
        rank: rankNumber,
        skills: resp.skills,
        available_skill_points: resp.available_skill_points,
        color_rating: resp.player?.color_rating || preservedColors.color_rating,
        color_position: resp.player?.color_position || preservedColors.color_position,
        color_name: resp.player?.color_name || preservedColors.color_name
      };
      
      state.selectedPlayer = updatedPlayer;
      renderPlayerDetail(updatedPlayer);
      
        console.log('[RANK] Switched from rank', previousRank, 'to rank', rankNumber);

        if (typeof window.refreshPlayerPriceHistory === 'function') {
          window.refreshPlayerPriceHistory(updatedPlayer, { range: window.state?.priceHistory?.range });
        }
      
    } catch (error) {
      console.error('[RANK] Error switching rank:', error);
      state.selectedPlayer.rank = rankNumber;
      renderPlayerDetail(state.selectedPlayer);

      if (typeof window.refreshPlayerPriceHistory === 'function') {
        window.refreshPlayerPriceHistory(state.selectedPlayer, { range: window.state?.priceHistory?.range });
      }
      
    }
  } else {
    console.error('[RANK] Player ID mismatch or no selected player');
  }
};

window.resetPlayerRank = async function(playerId) {
  console.log('[RANK] Resetting rank to base for player', playerId);
  console.log('[RankOverlay] PlayerDetail:', 0);

  if (!state.selectedPlayer || String(state.selectedPlayer.player_id) !== String(playerId)) {
    console.warn('[RANK] Reset rank aborted - player mismatch.');
    return;
  }

  try {
    const resp = await window.apiClient.getPlayerDetails(playerId, 0);
    const allocationsResp = await window.apiClient.getUserSkillAllocations(
      CURRENT_USER_ID,
      playerId,
      0,
      { allowLocalOverride: false }
    );
    const skillBoosts = await calculateSkillBoosts(allocationsResp.allocations || []);
    const trainingBoosts = state.selectedPlayer?.training_boosts || null;

    const updatedPlayer = {
      ...state.selectedPlayer,
      ...resp.player,
      rank: 0,
      skills: resp.skills,
      available_skill_points: resp.available_skill_points,
      training_boosts: trainingBoosts,
      skill_boosts: skillBoosts,
      color_rating: resp.player?.color_rating || state.selectedPlayer?.color_rating,
      color_position: resp.player?.color_position || state.selectedPlayer?.color_position,
      color_name: resp.player?.color_name || state.selectedPlayer?.color_name
    };

    state.selectedPlayer = updatedPlayer;
    renderPlayerDetail(updatedPlayer);

    console.log('[RANK] Rank reset complete.');
  } catch (error) {
    console.error('[RANK] Rank reset error:', error);
  }
};





// ========== FETCH TRAINING BOOSTS FROM VPS DATABASE ==========
async function getTrainingBoosts(position, trainingLevel) {
    if (!window.apiClient || trainingLevel === 0) {
        return null; // No boosts at level 0
    }
    
    try {
        console.log('[TRAINING] Fetching boosts for', position, 'at level', trainingLevel);
        
        // Call backend API which queries VPS PostgreSQL
        const response = await window.apiClient.getTrainingBoosts(position, trainingLevel);
        
        if (!response || response.error) {
            console.error('[TRAINING] Error from API:', response?.error);
            return null;
        }
        
        console.log('[TRAINING] Total boosts calculated:', response.boosts);
        return response.boosts;
        
    } catch (err) {
        console.error('[TRAINING] Exception fetching boosts:', err);
        return null;
    }
}





// ========== TRAINING LEVEL HANDLER ==========
// TRAINING LEVEL HANDLER (Enhanced with stat calculation)
window.setPlayerTrainingLevel = async function(playerId, level) {
    const trainingLevel = parseInt(level);
    console.log('[TRAINING] Setting level', trainingLevel, 'for player', playerId);
    
    // Update state
    if (state.selectedPlayer && String(state.selectedPlayer.player_id) === String(playerId)) {
        
        // Fetch training boosts from database
        const boosts = await getTrainingBoosts(state.selectedPlayer.position, trainingLevel);
        
        // Update player's training level
        state.selectedPlayer.training_level = trainingLevel;
        
        // Store the boosts in the player object for rendering
        if (boosts) {
            state.selectedPlayer.training_boosts = boosts;
            console.log('[TRAINING] Applied boosts:', boosts);
        } else {
            state.selectedPlayer.training_boosts = null;
        }
        
        // Clean up old animations
        cleanupRankAnimations();
        
        // Re-render player detail with updated stats
        renderPlayerDetail(state.selectedPlayer);
        
        console.log('[TRAINING] Updated to level', trainingLevel);
        
        // Optional: Save to backend
        if (window.apiClient && typeof window.apiClient.updatePlayerTraining === 'function') {
            window.apiClient.updatePlayerTraining(playerId, trainingLevel);
        }
        
    } else {
        console.error('[TRAINING] Player ID mismatch or no selected player');
    }
};




// Application State
// Application State
window.state = {
    currentView: localStorage.getItem('currentView') || 'dashboard',
    watchlist: (function() {
        try {
            const val = localStorage.getItem('watchlist');
            if (!val || val === "[object Object]") return [];
            return JSON.parse(val);
        } catch(e) { return []; }
    })(),
    selectedPlayer: null,
    filters: {
        position: '',
        ratingMin: 40,
        ratingMax: 150,
        priceMin: null,
        priceMax: null,
        league: '',
        club: '',
        nation: '',
        skillMoves: '',
        event: '',
        auctionable: ''
    },
    searchQuery: '',
    sortBy: 'ovr',  // Changed default to 'ovr'
    sortDirection: 'desc',
    previousSortBy: null,
    // ========== API Integration Properties ==========
    allPlayers: [],
    filteredPlayers: [],
    isLoadingAPI: false,
    isLoadingDatabase: false,
    apiRank: 0,
    // ========== PAGINATION ==========
    currentOffset: 0,
    limitPerPage: 20,
    totalPlayers: 0,
    hasMorePlayers: false,
    // ========== SEARCH STATE ==========
    searchResults: [],
    searchDisplayed: 0,
    currentSearchQuery: '',
    searchTotalResults: 0,
    priceHistory: {
        range: '7D',
        customDays: 7
    }
};



// ================== COUNTRY LIST ==================
const COUNTRIES = [
  "Bangladesh","Indonesia","Venezuela","Cameroon","Czech Republic","Sweden","Montenegro","Uganda","Jordan",
  "Dominican Republic","Singapore","Sri Lanka","Korea DPR","Uzbekistan","Finland","Portugal","Malta","Colombia",
  "Albania","Wales","Cayman Islands","Grenada","Ukraine","Saudi Arabia","Cuba","Latvia","Northern Ireland","Algeria",
  "France","Slovakia","Israel","Syria","Malaysia","Kenya","Ghana","Senegal","Zambia","Central African Rep.","Iceland",
  "Madagascar","Hong Kong","Sierra Leone","Liberia","Philippines","Antigua & Barbuda","Benin","United States",
  "Cyprus","Guinea","Korea Republic","Nigeria","Rwanda","Bosnia Herzegovina","Tajikistan","Zimbabwe","Comoros",
  "New Caledonia","Belarus","Armenia","Qatar","Scotland","Netherlands","Gabon","Paraguay","Australia","Dominica",
  "Serbia","Angola","Libya","Vanuatu","Bahrain","Netherlands Antilles","Spain","Congo","United Arab Emirates",
  "Georgia","Malawi","Belgium","Burundi","Montserrat","Thailand","DR Congo","Togo","Burkina Faso","El Salvador",
  "Faroe Islands","Italy","Uruguay","Fiji","Germany","Canada","Barbados","Bermuda","Namibia","Argentina",
  "Liechtenstein","England","Azerbaijan","Slovenia","Greece","Egypt","Afghanistan","Republic of Ireland","Chad",
  "Puerto Rico","India","International","Iran","Chile","Gambia","Estonia","Suriname","South Africa","Peru",
  "Kazakhstan","British Virgin Isles","St Kitts Nevis","Kosovo","Japan","Denmark","Ivory Coast","Jamaica","Iraq",
  "China PR","Mauritania","Mozambique","Switzerland","Guinea Bissau","Ecuador","New Zealand","Hungary","Russia",
  "Belize","Honduras","Norway","Pakistan","Romania","Brazil","Chinese Taipei","Trinidad & Tobago","Austria",
  "Luxemburg","Guatemala","Bolivia","São Tomé & Príncipe","Niger","Panama","South Sudan","Yemen","Lithuania",
  "Bulgaria","Croatia","Cape Verde Islands","Tunisia","Sudan","Mali","North Macedonia","Morocco","Moldova",
  "Türkiye","Mexico","Nepal","Guyana","Palestine","Tanzania","Poland","Lebanon","Costa Rica","St Lucia",
  "Gibraltar","Haiti","Equatorial Guinea","Andorra","Somalia"
];

function enableKeyboardNavigation({
  input,
  list,
  onSelect
}) {
  let activeIndex = -1;

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      update();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      update();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        onSelect(items[activeIndex]);
      }
    }

    if (e.key === 'Escape') {
      list.innerHTML = '';
      activeIndex = -1;
    }
  });

  function update() {
    itemsClear();
    const items = list.querySelectorAll('.autocomplete-item');
    if (items[activeIndex]) {
      items[activeIndex].classList.add('active');
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function itemsClear() {
    list.querySelectorAll('.autocomplete-item')
      .forEach(i => i.classList.remove('active'));
  }
}


// View Switching

// View Switching
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
    view.style.display = '';
    view.style.opacity = '';
  });

  // ADDED: Close all modals when switching views
  const squadModal = document.getElementById('squad-builder-modal');
  if (squadModal) {
    squadModal.style.display = 'none';
  }

  const toolsModal = document.getElementById('tools-modal');
  if (toolsModal) {
    toolsModal.classList.remove('active');
  }

  const toolsSheet = document.getElementById('tools-sheet');
  if (toolsSheet) {
    toolsSheet.classList.remove('active');
  }

  // Reset body overflow
  document.body.style.overflow = 'auto';

  // Make setSortBy globally accessible
  window.setSortBy = function (stat) {
    // Toggle sort direction if clicking the same stat
    if (state.previousSortBy === stat) {
      state.sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      state.sortDirection = 'desc';
      state.previousSortBy = stat;
    }

    state.sortBy = stat;

    if (state.currentView === 'database') {
      loadDatabase();
    }
    if (state.currentView === 'watchlist') {
      loadWatchlist();
    }

  };

  // Show selected view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) targetView.classList.add('active');

  // Update nav links
  document.querySelectorAll('.nav-link, .mobile-nav-btn').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll(`[data-view="${viewName}"]`).forEach(link => {
    link.classList.add('active');
  });

  state.currentView = viewName;
  localStorage.setItem('currentView', viewName);

  // ===== SLIDER VISIBILITY CONTROL =====
  const slider = document.querySelector('.slider');
  if (slider) {
    if (viewName === 'dashboard') {
      slider.style.display = 'block';
    } else {
      slider.style.display = 'none';
    }
  }
  // ===== END SLIDER CONTROL =====

  // Load view-specific content
  if (viewName === 'dashboard') {
    loadDashboard();
  } else if (viewName === 'database') {
    loadDatabase();
  } else if (viewName === 'market') {
    // loadMarket(); // Uncomment when ready
  } else if (viewName === 'watchlist') {
    // Use new professional watchlist
    if (typeof window.initProfessionalWatchlist === 'function') {
        window.initProfessionalWatchlist();
    } else {
        setTimeout(() => {
            if (typeof window.initProfessionalWatchlist === 'function') {
                window.initProfessionalWatchlist();
            } else {
                console.error('❌ initProfessionalWatchlist not found');
            }
        }, 300);
    }
  } else if (viewName === 'event-guide') {
        if (typeof initEventGuide === 'function') {
            setTimeout(initEventGuide, 100);
        } else {
            console.error('initEventGuide not found - make sure eventGuide.js is loaded');
        }
    }


  // Scroll to top
  window.scrollTo(0, 0);
}

function getCountryFlagUrl(country) {
  const map = {
    "Afghanistan": "af",
    "Albania": "al",
    "Algeria": "dz",
    "Andorra": "ad",
    "Angola": "ao",
    "Antigua & Barbuda": "ag",
    "Argentina": "ar",
    "Armenia": "am",
    "Australia": "au",
    "Austria": "at",
    "Azerbaijan": "az",

    "Bangladesh": "bd",
    "Barbados": "bb",
    "Belarus": "by",
    "Belgium": "be",
    "Belize": "bz",
    "Benin": "bj",
    "Bermuda": "bm",
    "Bolivia": "bo",
    "Bosnia Herzegovina": "ba",
    "Brazil": "br",
    "British Virgin Isles": "vg",
    "Bulgaria": "bg",
    "Burkina Faso": "bf",
    "Burundi": "bi",

    "Cameroon": "cm",
    "Canada": "ca",
    "Cape Verde Islands": "cv",
    "Cayman Islands": "ky",
    "Central African Rep.": "cf",
    "Chad": "td",
    "Chile": "cl",
    "China PR": "cn",
    "Chinese Taipei": "tw",
    "Colombia": "co",
    "Comoros": "km",
    "Congo": "cg",
    "Costa Rica": "cr",
    "Croatia": "hr",
    "Cuba": "cu",
    "Cyprus": "cy",
    "Czech Republic": "cz",

    "Denmark": "dk",
    "Dominica": "dm",
    "Dominican Republic": "do",
    "DR Congo": "cd",

    "Ecuador": "ec",
    "Egypt": "eg",
    "El Salvador": "sv",
    "England": "gb-eng",
    "Equatorial Guinea": "gq",
    "Estonia": "ee",

    "Faroe Islands": "fo",
    "Fiji": "fj",
    "Finland": "fi",
    "France": "fr",

    "Gabon": "ga",
    "Gambia": "gm",
    "Georgia": "ge",
    "Germany": "de",
    "Ghana": "gh",
    "Gibraltar": "gi",
    "Greece": "gr",
    "Grenada": "gd",
    "Guatemala": "gt",
    "Guinea": "gn",
    "Guinea Bissau": "gw",
    "Guyana": "gy",

    "Haiti": "ht",
    "Honduras": "hn",
    "Hong Kong": "hk",
    "Hungary": "hu",

    "Iceland": "is",
    "India": "in",
    "Indonesia": "id",
    "International": "",
    "Iran": "ir",
    "Iraq": "iq",
    "Israel": "il",
    "Italy": "it",
    "Ivory Coast": "ci",

    "Jamaica": "jm",
    "Japan": "jp",
    "Jordan": "jo",

    "Kazakhstan": "kz",
    "Kenya": "ke",
    "Korea DPR": "kp",
    "Korea Republic": "kr",
    "Kosovo": "xk",

    "Latvia": "lv",
    "Lebanon": "lb",
    "Liberia": "lr",
    "Libya": "ly",
    "Liechtenstein": "li",
    "Lithuania": "lt",
    "Luxemburg": "lu",

    "Madagascar": "mg",
    "Malawi": "mw",
    "Malaysia": "my",
    "Mali": "ml",
    "Malta": "mt",
    "Mauritania": "mr",
    "Mexico": "mx",
    "Moldova": "md",
    "Montenegro": "me",
    "Morocco": "ma",
    "Mozambique": "mz",

    "Namibia": "na",
    "Nepal": "np",
    "Netherlands": "nl",
    "Netherlands Antilles": "an",
    "New Caledonia": "nc",
    "New Zealand": "nz",
    "Niger": "ne",
    "Nigeria": "ng",
    "North Macedonia": "mk",
    "Northern Ireland": "gb-nir",
    "Norway": "no",

    "Pakistan": "pk",
    "Palestine": "ps",
    "Panama": "pa",
    "Paraguay": "py",
    "Peru": "pe",
    "Philippines": "ph",
    "Poland": "pl",
    "Portugal": "pt",
    "Puerto Rico": "pr",

    "Qatar": "qa",

    "Republic of Ireland": "ie",
    "Romania": "ro",
    "Russia": "ru",
    "Rwanda": "rw",

    "Saudi Arabia": "sa",
    "Scotland": "gb-sct",
    "Senegal": "sn",
    "Serbia": "rs",
    "Sierra Leone": "sl",
    "Singapore": "sg",
    "Slovakia": "sk",
    "Slovenia": "si",
    "Somalia": "so",
    "South Africa": "za",
    "South Sudan": "ss",
    "Spain": "es",
    "Sri Lanka": "lk",
    "St Kitts Nevis": "kn",
    "St Lucia": "lc",
    "Sudan": "sd",
    "Suriname": "sr",
    "Sweden": "se",
    "Switzerland": "ch",
    "Syria": "sy",

    "Tajikistan": "tj",
    "Tanzania": "tz",
    "Thailand": "th",
    "Togo": "tg",
    "Trinidad & Tobago": "tt",
    "Tunisia": "tn",
    "Türkiye": "tr",

    "Uganda": "ug",
    "Ukraine": "ua",
    "United Arab Emirates": "ae",
    "United States": "us",
    "Uruguay": "uy",
    "Uzbekistan": "uz",

    "Vanuatu": "vu",
    "Venezuela": "ve",
    "Vietnam": "vn",

    "Wales": "gb-wls",

    "Yemen": "ye",
    "Zambia": "zm",
    "Zimbabwe": "zw"
  };


  const code = map[country];
  if (!code) return "";

  return `https://flagcdn.com/w20/${code}.png`;
}




function initCountryAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const flagImg = inputId.includes('mobile')
  ? document.getElementById('mobile-filter-nation-flag')
  : document.getElementById('filter-nation-flag');


  if (!input || !list) {
    console.warn("[NATION] Missing input or list for autocomplete");
    return;
  }

  if (!flagImg) {
    console.warn("[NATION] Flag image not found, continuing without flag support");
  }

  const getWatchlistNations = () => {
    const raw = input.getAttribute('data-watchlist-nations');
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (e) {
      console.warn("[NATION] Failed to parse watchlist nations data:", e);
    }
    return [];
  };

  const getAutocompleteSource = () => {
    const isWatchlist = (typeof state !== 'undefined' && state.currentView === 'watchlist');
    if (isWatchlist) {
      const watchlistNations = getWatchlistNations();
      if (watchlistNations !== null) return watchlistNations;
    }
    return COUNTRIES;
  };

  function render(items) {
    list.innerHTML = '';
    items.forEach(country => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';

      const flagUrl = getCountryFlagUrl(country);

      div.innerHTML = `
        ${flagUrl ? `<img src="${flagUrl}" class="autocomplete-flag" />` : `<span class="autocomplete-flag placeholder"></span>`}
        <span class="autocomplete-text">${country}</span>
      `;


      div.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 🔥 IMPORTANT

        input.value = country;
        list.innerHTML = '';

        // ✅ update filter state explicitly
        const isWatchlist = (typeof state !== 'undefined' && state.currentView === 'watchlist');
        if (isWatchlist && typeof watchlistFilters !== 'undefined') {
          watchlistFilters.nation = country;

          const watchlistNation = document.getElementById('watchlist-filter-nation');
          if (watchlistNation) watchlistNation.value = country;

          if (typeof applyWatchlistFilters === 'function') {
            applyWatchlistFilters();
          }

          if (typeof updateActiveFilterChips === 'function') {
            updateActiveFilterChips();
          }

          if (typeof updateWatchlistFilterBadge === 'function') {
            updateWatchlistFilterBadge();
          }
        } else if (typeof state !== 'undefined') {
          // update filter state explicitly (database)
          state.filters.nation = country;
        }

        // ✅ set flag
        const flagUrl = getCountryFlagUrl(country);
        if (flagImg && flagUrl) {
          flagImg.src = flagUrl;
          flagImg.style.display = 'block';
        } else if (flagImg) {
          flagImg.style.display = 'none';
        }

        // ✅ reload database deterministically
        if (typeof state !== 'undefined') {
          state.currentOffset = 0;
          if (state.currentView === 'database') {
            loadDatabase();
          }
          if (state.currentView === 'watchlist' && typeof applyWatchlistFilters !== 'function') {
            loadWatchlist();
          }
        }

      });


      list.appendChild(div);
    });
  }

  function selectCountry(country) {
    input.value = country;
    list.innerHTML = '';

    const isWatchlist = (typeof state !== 'undefined' && state.currentView === 'watchlist');
    if (isWatchlist && typeof watchlistFilters !== 'undefined') {
      watchlistFilters.nation = country;

      const watchlistNation = document.getElementById('watchlist-filter-nation');
      if (watchlistNation) watchlistNation.value = country;

      if (typeof applyWatchlistFilters === 'function') {
        applyWatchlistFilters();
      }

      if (typeof updateActiveFilterChips === 'function') {
        updateActiveFilterChips();
      }

      if (typeof updateWatchlistFilterBadge === 'function') {
        updateWatchlistFilterBadge();
      }
    } else if (typeof state !== 'undefined') {
      // update filter state
      state.filters.nation = country;
    }

    // set flag
    const flagUrl = getCountryFlagUrl(country);
    if (flagImg && flagUrl) {
      flagImg.src = flagUrl;
      flagImg.style.display = 'block';
    } else if (flagImg) {
      flagImg.style.display = 'none';
    }

    // reload database
    if (typeof state !== 'undefined') {
      state.currentOffset = 0;
      if (state.currentView === 'database') {
        loadDatabase();
      }
      if (state.currentView === 'watchlist' && typeof applyWatchlistFilters !== 'function') {
        loadWatchlist();
      }
    }

  }


  const updateSuggestions = () => {
    const q = input.value.trim().toLowerCase();

    if (!q && flagImg) {
      flagImg.style.display = 'none';
      flagImg.src = '';
    }

    const source = getAutocompleteSource();
    const matches = q
      ? source.filter(c => c.toLowerCase().includes(q)).slice(0, 40)
      : source.slice(0, 30);

    render(matches);
  };

  input.addEventListener('input', updateSuggestions);
  input.addEventListener('focus', updateSuggestions);

  enableKeyboardNavigation({
    input,
    list,
    onSelect: (item) => {
      const country = item.querySelector('.autocomplete-text').innerText;
      selectCountry(country);
    }
  });


  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.innerHTML = '';
    }
  });
}




// ========== LOAD DASHBOARD FROM API ==========
async function loadDashboard() {
    console.log('[DASHBOARD] Loading dashboard...');

    // Initialize banner
    if (typeof initBannerSlider === 'function') {
        initBannerSlider();
    }

    // Load stats
    if (window.apiClient) {
        try {
            const health = await window.apiClient.checkHealth();
            const totalEl = document.getElementById('total-players');
            if (totalEl && health.total_players) {
                animateNumber('total-players', health.total_players);
            }
        } catch (error) {
            console.error('[DASHBOARD] Error loading stats:', error);
        }
    }


    // Load Latest and Trending
    const latestPromise = loadLatestPlayers();
    const trendingPromise = loadTrendingPlayers();
    const recentEventsPromise = latestPromise.then(() => loadRecentEvents());

    await Promise.all([
        latestPromise,
        trendingPromise,
        recentEventsPromise
    ]);

    // Search initialization moved to DOMContentLoaded (dropdown version)
    console.log('[DASHBOARD] Search initialized');

}


// ========== CREATE DASHBOARD PLAYER CARD (Vertical Style) ==========
// ========== DASHBOARD CARD CREATOR ==========
function createDashboardPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'dashboard-player-card';

    card.addEventListener('click', () => {
        const pid = player.playerid || player.player_id;
        if (!pid) {
            console.error('[Zenith] Dashboard card click: missing player_id', player);
            return;
        }
        if (window.ZRouter) {
            ZRouter.navigate(`/player/${pid}`);
        } else if (typeof viewPlayerDetail === 'function') {
            viewPlayerDetail(pid, player); // fallback if router not loaded
        }
    });


    // Normalize untradable value to a boolean
    const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
    const isUntradable =
        isUntradableText === 'true' ||
        isUntradableText === '1' ||
        isUntradableText === 'yes';

    card.innerHTML = `
        <div class="card-container">
            <!-- Card background -->
            <img src="${player.card_background || player.cardbackground || 'https://via.placeholder.com/300x400'}"
                 alt="Card Background"
                 class="card-background-img"
                 onerror="this.src='https://via.placeholder.com/300x400'">

            <!-- Player image -->
            <img src="${player.player_image || player.playerimage || 'https://via.placeholder.com/200x300'}"
                 alt="${player.name}"
                 class="player-image-img"
                 onerror="this.src='https://via.placeholder.com/200x300'">

            <!-- OVR -->
            <div class="card-ovr" style="color: ${player.color_rating || player.colorrating || '#FFFFFF'}">
                ${player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
            </div>

            <!-- Position -->
            <div class="card-position" style="color: ${player.color_position || player.colorposition || '#FFFFFF'}">
                ${player.position || 'NA'}
            </div>

            <!-- Name -->
            <div class="card-player-name" style="color: ${player.color_name || player.colorname || '#FFFFFF'}">
                ${player.name}
            </div>


            <img src="${player.nation_flag || ''}" alt="Nation" class="card-nation-flag-home ${getPlayerType(player) === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'}" onerror="this.style.display='none'">
            <img src="${player.club_flag || ''}" alt="Club" class="card-club-flag-home ${getPlayerType(player) === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'}" onerror="this.style.display='none'">
            ${getPlayerType(player) === 'normal' && player.league_image ? `
                <img src="${player.league_image}" 
                     alt="League" 
                     class="card-league-flag-home normal-league-flag-home" 
                     onerror="this.style.display='none'">
            ` : ''}

            <!-- ✅ Untradable badge -->
            ${
                isUntradable
                    ? `<div class="card-untradable-badge">
                           <img src="assets/images/untradable_img.png" alt="Untradable">
                       </div>`
                    : ''
            }
        </div>
    `;

    return card;
}


let latestPlayersCache = [];
const recentEventPlayersCache = new Map();
const recentEventSortCache = new Map();

function getEventNameFromPlayer(player) {
    const raw = player?.event || player?.event_name || player?.eventName || '';
    const name = String(raw || '').trim();
    return name && name !== '0' ? name : '';
}

function getEventTitleFirstWord(eventName) {
    const normalized = String(eventName || '').trim();
    if (!normalized) return '';
    return normalized.split(/\s+/)[0].toLowerCase();
}

function getGridColumnCount(element) {
    if (!element) return 0;
    const columns = getComputedStyle(element).gridTemplateColumns || '';
    const minmaxMatches = columns.match(/minmax\([^)]*\)/g);
    if (minmaxMatches?.length) return minmaxMatches.length;
    return columns.split(' ').filter(token => token.trim().length > 0).length;
}

function getRecentEventNames(players, limit = 3) {
    const names = [];
    const seenEvents = new Set();
    const seenFirstWords = new Set();
    (players || []).forEach(player => {
        const eventName = getEventNameFromPlayer(player);
        if (!eventName) return;
        const trimmedName = eventName.trim();
        const eventKey = trimmedName.toLowerCase();
        if (!eventKey || seenEvents.has(eventKey)) return;
        const firstWord = getEventTitleFirstWord(trimmedName);
        if (!firstWord || seenFirstWords.has(firstWord)) return;
        seenEvents.add(eventKey);
        seenFirstWords.add(firstWord);
        names.push(trimmedName);
    });
    return names.slice(0, limit);
}

function getPrice0Value(price) {
    if (price === null || price === undefined) return 0;
    const normalized = typeof price === 'string' ? price.replace(/,/g, '') : price;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
}

function getEventSortCacheKey(eventName, players) {
    const sample = (players || []).slice(0, 5)
        .map(p => `${p.player_id || p.id || 'na'}:${getPrice0Value(p.price0)}`)
        .join('|');
    return `${eventName}|${players?.length || 0}|${sample}`;
}

function getTopPlayersByPrice(players, eventName, limit = 7) {
    const cacheKey = `${getEventSortCacheKey(eventName, players)}|${limit}`;
    const cached = recentEventSortCache.get(cacheKey);
    if (cached) return cached;
    const topPlayers = (players || []).slice(0, limit);
    recentEventSortCache.set(cacheKey, topPlayers);
    return topPlayers;
}

async function fetchRecentEventPlayers(eventName) {
    if (!eventName) return [];
    const cacheKey = eventName.toLowerCase();
    if (recentEventPlayersCache.has(cacheKey)) {
        return recentEventPlayersCache.get(cacheKey);
    }
    const players = await loadPlayersFromAPI({
        limit: 200,
        rank: 0,
        event: eventName
    });
    recentEventPlayersCache.set(cacheKey, players);
    return players;
}

async function loadRecentEvents() {
    const container = document.getElementById('recent-events-container');
    if (!container) {
        console.error('[EVENTS] Container #recent-events-container not found in DOM');
        return;
    }

    const sourcePlayers = latestPlayersCache.length > 0
        ? latestPlayersCache
        : await loadPlayersFromAPI({ limit: 200, rank: 0 });
    const sortedSource = [...(sourcePlayers || [])].sort((a, b) => {
        const dateA = new Date(a.date_added || 0);
        const dateB = new Date(b.date_added || 0);
        return dateB - dateA;
    });
    let recentEvents = getRecentEventNames(sortedSource, 3);
    if (recentEvents.length < 3) {
        console.warn('[EVENTS] Insufficient unique event groups, expanding search', {
            eventCount: recentEvents.length
        });
        const expandedPlayers = await loadPlayersFromAPI({ limit: 400, rank: 0 });
        const expandedSorted = [...(expandedPlayers || [])].sort((a, b) => {
            const dateA = new Date(a.date_added || 0);
            const dateB = new Date(b.date_added || 0);
            return dateB - dateA;
        });
        recentEvents = getRecentEventNames(expandedSorted, 3);
    }
    const recentFirstWords = recentEvents.map(getEventTitleFirstWord).filter(Boolean);
    const uniqueFirstWords = new Set(recentFirstWords);

    console.log('[EVENTS] Loading recent events', {
        recentEvents,
        expectedGroups: 3,
        uniqueFirstWordCount: uniqueFirstWords.size
    });
    if (recentEvents.length !== 3 || uniqueFirstWords.size !== recentEvents.length) {
        console.warn('[EVENTS] Recent event group validation failed', {
            eventCount: recentEvents.length,
            uniqueFirstWordCount: uniqueFirstWords.size
        });
    }

    if (recentEvents.length === 0) {
        container.innerHTML = '<div class="recent-events-empty">No recent events available</div>';
        return;
    }

    container.innerHTML = '';

    for (const eventName of recentEvents) {
        const eventBlock = document.createElement('div');
        eventBlock.className = 'recent-event-block';

        const title = document.createElement('div');
        title.className = 'recent-event-title';
        title.textContent = eventName;

        const row = document.createElement('div');
        row.className = 'recent-event-row';

        eventBlock.appendChild(title);
        eventBlock.appendChild(row);
        container.appendChild(eventBlock);

        const eventPlayers = await fetchRecentEventPlayers(eventName);
        if (!eventPlayers.length) {
            row.innerHTML = '<div class="recent-events-empty">No players found for this event</div>';
            console.log('[EVENTS] Event render count', { eventName, playerCount: 0, maxPlayers: 7 });
            continue;
        }

        const topPlayers = getTopPlayersByPrice(eventPlayers, eventName, 7);
        console.log('[EVENTS] Event render count', {
            eventName,
            playerCount: topPlayers.length,
            maxPlayers: 7
        });
        topPlayers.forEach(player => {
            const card = createDashboardPlayerCard(player);
            row.appendChild(card);
        });

        if (window.matchMedia('(min-width: 1201px)').matches) {
            const columns = getGridColumnCount(row);
            console.log('[EVENTS] Recent event row columns', { eventName, columns });
            if (columns !== 7) {
                console.warn('[EVENTS] Recent event row columns mismatch', {
                    eventName,
                    expected: 7,
                    actual: columns
                });
            }
        }
    }

    console.log('[EVENTS] Recent events loaded', {
        count: recentEvents.length,
        uniqueFirstWordCount: uniqueFirstWords.size
    });
}


// ========== LATEST PLAYERS ==========
async function loadLatestPlayers() {
    console.log('[LATEST] Loading latest players...');

    const players = await loadPlayersFromAPI({
        limit: 100,  // Increased from 50
        rank: 0
    });

    if (players.length === 0) {
        console.warn('[LATEST] No players received from API');
        return;
    }

    console.log(`[LATEST] Received ${players.length} players from API`);

    // Sort by date_added (newest first)
    const sortedPlayers = players.sort((a, b) => {
        const dateA = new Date(a.date_added || 0);
        const dateB = new Date(b.date_added || 0);
        return dateB - dateA;
    });

    latestPlayersCache = sortedPlayers;

    // Don't filter by OVR - show all latest players
    const validPlayers = sortedPlayers.filter(p => p.name && p.ovr && p.ovr > 0);

    const container = document.getElementById('latest-players-grid');
    if (!container) {
        console.error('[LATEST] Container #latest-players-grid not found in DOM');
        return;
    }

    container.innerHTML = '';

    // Show up to 12 latest players
    validPlayers.slice(0, 12).forEach(player => {
        const card = createDashboardPlayerCard(player);
        container.appendChild(card);
    });

    console.log(`[LATEST] Successfully displayed ${Math.min(validPlayers.length, 12)} latest players`);
}


// ========== TRENDING PLAYERS ==========
async function loadTrendingPlayers() {
    console.log('[TRENDING] Loading trending players...');

    const players = await loadPlayersFromAPI({
        limit: 50,
        min_ovr: 100,
        rank: 0
    });

    if (players.length === 0) {
        console.warn('[TRENDING] No players received');
        return;
    }

    // Sort by OVR (highest first)
    const sortedPlayers = players.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

    const container = document.getElementById('trending-players-grid');
    if (!container) {
        console.error('[TRENDING] Container not found');
        return;
    }

    container.innerHTML = '';

    sortedPlayers.slice(0, 12).forEach(player => {
        const card = createDashboardPlayerCard(player);
        container.appendChild(card);
    });

    console.log(`[TRENDING] Loaded ${sortedPlayers.length} trending players`);
}

// ========== SEARCH FUNCTIONALITY ==========

// ========== DASHBOARD SEARCH FUNCTIONALITY (WITH BATCHING) ==========

// ========== DASHBOARD SEARCH FUNCTIONALITY ==========

let searchTimeout = null;

async function searchDashboardPlayers(query) {
    const searchTerm = query.trim().toLowerCase();

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (!searchTerm) {
        showNormalDashboard();
        return;
    }

    const searchSection = document.getElementById('dashboard-search-results');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsCount = document.getElementById('search-results-count');

    if (searchSection && resultsContainer) {
        searchSection.style.display = 'block';
        resultsContainer.innerHTML = '<div class="search-loading">🔍 Searching...</div>';
        if (resultsCount) resultsCount.textContent = 'Searching...';

        const latestSection = document.querySelector('.dashboard-section:has(#latest-players-grid)');
        const trendingSection = document.querySelector('.dashboard-section:has(#trending-players-grid)');
        const recentSection = document.getElementById('recent-events-section');
        if (latestSection) latestSection.style.display = 'none';
        if (trendingSection) trendingSection.style.display = 'none';
        if (recentSection) recentSection.style.display = 'none';
    }

    searchTimeout = setTimeout(async () => {
        console.log(`[SEARCH] ========== SEARCHING FOR: "${searchTerm}" ==========`);

        try {
            // ✅ USE NEW FAST API - Load only 20 results
            const response = await window.apiClient.searchPlayers({
                q: searchTerm,
                limit: 20,
                offset: 0,
                rank: 0
            });

            const results = response.results || [];
            const total = response.total || 0;

            console.log(`[SEARCH] ✓ Got ${results.length} results (${total} total)`);

            // Store for pagination
            state.currentSearchQuery = searchTerm;
            state.searchTotalResults = total;

            showSearchResults(results, searchTerm, total);

        } catch (error) {
            console.error('[SEARCH] ✗ ERROR:', error);
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="no-results">
                        <p>❌ Search error: ${error.message}</p>
                    </div>
                `;
            }
        }
    }, 300);
}

function createSearchResultRow(player) {
    const row = document.createElement('div');
    row.className = 'search-result-row';

    // ===== DEBUG OVR ISSUE =====
    if (!player.ovr || player.ovr === 0) {
        console.warn(`[OVR DEBUG] Player has no OVR:`, {
            name: player.name,
            ovr: player.ovr,
            ovr_type: typeof player.ovr,
            player_id: player.player_id
        });
    }

    const isUntradableText = String(player.is_untradable || '').toLowerCase();
    const isNonAuctionable = isUntradableText === 'true' || isUntradableText === '1';

    const tradableIcon = isNonAuctionable ?
        `<span class="tradable-badge non-tradable">🔴 Non-auctionable</span>` :
        `<span class="tradable-badge tradable">✅ Auctionable</span>`;

    row.innerHTML = `
        <div class="search-result-card">
            <div class="search-card-image">
                <img src="${player.card_background || 'https://via.placeholder.com/100x140'}"
                     alt="${player.name}"
                     class="search-card-bg"
                     onerror="this.src='https://via.placeholder.com/100x140'">
                <img src="${player.player_image || ''}"
                     alt="${player.name}"
                     class="search-player-img"
                     onerror="this.style.display='none'">
            </div>

            <div class="search-player-info">
                <div class="search-player-name">${player.name || 'Unknown'}</div>
                ${tradableIcon}
            </div>

            <div class="search-player-stats">
                <div class="search-ovr">${player.ovr && player.ovr > 0 ? player.ovr : 'N/A'}</div>
                <div class="search-position">${player.position || 'N/A'}</div>
            </div>
        </div>
    `;

    row.addEventListener('click', () => {
        console.log('Clicked:', player);
    });

    return row;
}

function showSearchResults(players, query, total, append = false) {
    const searchSection = document.getElementById('dashboard-search-results');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsCount = document.getElementById('search-results-count');

    if (!searchSection || !resultsContainer || !resultsCount) return;

    searchSection.style.display = 'block';

    // Clear container if not appending
    if (!append) {
        state.searchResults = players;
        state.searchDisplayed = players.length;
        resultsContainer.innerHTML = '';
        resultsCount.textContent = `${total} Result${total !== 1 ? 's' : ''}`;
    } else {
        state.searchResults = state.searchResults.concat(players);
        state.searchDisplayed += players.length;
    }

    if (total === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No players found starting with "${query}"</p>
                <p style="color: var(--text-tertiary); font-size: 0.9rem;">Try a different search term</p>
            </div>
        `;
        return;
    }

    // Add player cards
    players.forEach(player => {
        const card = createPlayerCard(player);
        container.appendChild(card);
    });

    // ✅ ADD THIS LINE - Sync heart icons with watchlist state
    updateAllWatchlistButtons();

    console.log(`[DATABASE] Rendered ${players.length} players`);




    // Remove old load more button if exists
    const oldLoadMore = document.getElementById('search-load-more-btn');
    if (oldLoadMore) oldLoadMore.remove();

    // Add "Load More" button if there are more results
    if (state.searchDisplayed < total) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'search-load-more-btn';
        loadMoreBtn.className = 'search-load-more-btn';
        loadMoreBtn.innerHTML = `
            <span>Load More</span>
            <span class="load-more-count">(${total - state.searchDisplayed} remaining)</span>
        `;
        loadMoreBtn.addEventListener('click', async () => {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<span>Loading...</span>';

            try {
                // Load next 20 results
                const response = await window.apiClient.searchPlayers({
                    q: state.currentSearchQuery,
                    limit: 20,
                    offset: state.searchDisplayed,
                    rank: 0
                });

                const moreResults = response.results || [];
                console.log(`[SEARCH] Loaded ${moreResults.length} more results`);

                showSearchResults(moreResults, state.currentSearchQuery, total, true);

            } catch (error) {
                console.error('[SEARCH] Load more error:', error);
                loadMoreBtn.innerHTML = '<span>Error - Try Again</span>';
                loadMoreBtn.disabled = false;
            }
        });
        resultsContainer.appendChild(loadMoreBtn);
    }

    console.log(`[SEARCH] Displayed ${state.searchDisplayed}/${total} results`);
}

// Show Normal Dashboard (Hide Search Results)
function showNormalDashboard() {
    // Show Latest and Trending sections
    const latestSection = document.querySelector('.dashboard-section:has(#latest-players-grid)');
    const trendingSection = document.querySelector('.dashboard-section:has(#trending-players-grid)');
    const recentSection = document.getElementById('recent-events-section');

    if (latestSection) latestSection.style.display = 'block';
    if (trendingSection) trendingSection.style.display = 'block';
    if (recentSection) recentSection.style.display = 'block';

    // Hide search results
    const searchSection = document.getElementById('dashboard-search-results');
    if (searchSection) searchSection.style.display = 'none';
}

function updateAllWatchlistButtons() {
  document.querySelectorAll('.player-row-watchlist').forEach(btn => {
    const uniqueId = btn.dataset.uniqueId;
    if (!uniqueId) return;

    const isActive = state.watchlist.includes(uniqueId);

    btn.classList.toggle('active', isActive);

    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', isActive ? 'currentColor' : 'none');
    }
  });
}


// ========== WATCHLIST TOGGLE (REACTIVE) ==========
// In assets/js/app.js

// Helper function to get unique ID from player object
function getPlayerUniqueId(player) {
  const playerId = player?.player_id ?? player?.playerid ?? player?.id ?? 'unknown';
  const isUntradable = String(player?.is_untradable ?? player?.isuntradable ?? '').toLowerCase();
  const untradableFlag = isUntradable === 'true' || isUntradable === '1' || player?.is_untradable === 1 ? 1 : 0;
  return `${playerId}_${player?.rank || 0}_${untradableFlag}`;
}

window.toggleWatchlist = function(uniqueId) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[TOGGLE] START');
  console.log('[TOGGLE] Unique ID:', uniqueId);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!uniqueId) {
    console.error('[TOGGLE] uniqueId is empty/null');
    return;
  }

  const index = state.watchlist.indexOf(uniqueId);
  let savedPlayers = JSON.parse(localStorage.getItem('watchlistPlayers') || '[]');
  
  if (index === -1) {
    // ADDING
    console.log('[TOGGLE] ADDING to watchlist...');
    state.watchlist.push(uniqueId);
    
    // Find player object
    let allAvailable = [
      ...state.allPlayers,
      ...state.searchResults,
      ...state.filteredPlayers,
      ...(state.selectedPlayer ? [state.selectedPlayer] : [])
    ];
    
    // Remove duplicates
    const uniquePlayers = [];
    const seenIds = new Set();
    allAvailable.forEach(p => {
      const pId = getPlayerUniqueId(p);
      if (!seenIds.has(pId)) {
        seenIds.add(pId);
        uniquePlayers.push(p);
      }
    });
    
    const playerObj = uniquePlayers.find(p => getPlayerUniqueId(p) === uniqueId);
    
    if (playerObj) {
      console.log('[TOGGLE] Player found:', playerObj.name);
      
      // ✅ FIX: Ensure nation_region is saved
      const resolvedPlayerId = playerObj.player_id || playerObj.playerid || playerObj.id;
      const playerToSave = {
        ...playerObj,
        player_id: resolvedPlayerId,
        playerid: resolvedPlayerId,
        id: resolvedPlayerId,
        // Make sure nation_region is included
        nation_region: playerObj.nation_region || playerObj.nationregion || playerObj.nation || playerObj.nationality || 'NA',
        nationregion: playerObj.nation_region || playerObj.nationregion || playerObj.nation || playerObj.nationality || 'NA',
        nation: playerObj.nation_region || playerObj.nationregion || playerObj.nation || playerObj.nationality || 'NA'
      };
      
      console.log('[TOGGLE] Saving with nation:', playerToSave.nation_region);
      
      const alreadyExists = savedPlayers.some(p => getPlayerUniqueId(p) === uniqueId);
      if (!alreadyExists) {
        savedPlayers.push(playerToSave);
        console.log('[TOGGLE] Player added to savedPlayers');
      }
      
    } else {
      console.error('[TOGGLE] Could not find player object for:', uniqueId);
    }
    
  } else {
    // REMOVING
    console.log('[TOGGLE] REMOVING from watchlist...');
    state.watchlist.splice(index, 1);
    savedPlayers = savedPlayers.filter(p => getPlayerUniqueId(p) !== uniqueId);
    
  }

  // Save to localStorage
  localStorage.setItem('watchlist', JSON.stringify(state.watchlist));
  localStorage.setItem('watchlistPlayers', JSON.stringify(savedPlayers));
  
  // Update UI
  updateAllWatchlistButtons();
  
  // Reload watchlist view if active
  if (state.currentView === 'watchlist') {
    if (typeof window.loadWatchlistData === 'function') {
      setTimeout(() => window.loadWatchlistData(), 100);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[TOGGLE] COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};



// Helper: Format Price
function formatPrice(price) {
    if (!price || price === 0) return 'Free';

    // Billion
    if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(2)}B`;
    }
    // Million
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(2)}M`;
    }
    // Thousand
    if (price >= 1000) {
        return `${(price / 1000).toFixed(2)}K`;
    }

    return price.toLocaleString();
}


// ========== API HELPER FUNCTIONS ==========

function showLoadingIndicator(show = true) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = show ? 'flex' : 'none';
    }
}

// Load Players from API (with better error handling)
async function loadPlayersFromAPI(options = {}) {
    if (!window.apiClient) {
        console.warn('[API] API client not available');
        return [];
    }

    try {
        state.isLoadingAPI = true;

        const params = {
            limit: options.limit || 50,
            offset: options.offset || 0,
            rank: options.rank !== undefined ? options.rank : 0
        };

        // Only add filters if they exist
        if (options.position) params.position = options.position;
        if (options.min_ovr) params.min_ovr = options.min_ovr;
        if (options.max_ovr) params.max_ovr = options.max_ovr;
        if (options.league) params.league = options.league;
        if (options.nation) params.nation = options.nation;
        if (options.event) params.event = options.event;

        console.log('[API] Requesting players with params:', params);

        const response = await window.apiClient.getPlayers(params);

        const players = response.players || [];
        console.log(`[API] Received ${players.length} players from database`);

        // Debug: Log first player to see structure
        if (players.length > 0) {
            console.log('[API] Sample player data:', players[0]);
        }

        return players;
    } catch (error) {
        console.error('[API] Error loading players:', error);
        return [];
    } finally {
        state.isLoadingAPI = false;
    }
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Render additional custom stats selected by user
 * @param {Object} player - Player data object
 * @returns {String} HTML string of additional stat pills
 */
function renderCustomStats(player) {
    // Get selected stats from global variable or localStorage
    let selectedStats = window.customSelectedStats || [];
    
    if (!selectedStats || selectedStats.length === 0) {
        // Fallback to localStorage
        const saved = localStorage.getItem('customSelectedStats');
        if (saved) {
            try {
                selectedStats = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse custom stats from localStorage:', e);
            }
        }
    }
    
    if (!selectedStats || selectedStats.length === 0) {
        return ''; // No custom stats selected
    }
    
    console.log('🎯 Rendering custom stats for player:', player.name, 'Selected stats:', selectedStats);
    
    // Build HTML for each selected stat
    const customStatsHTML = selectedStats.map(statId => {
        const statConfig = STAT_MAPPING[statId];
        
        if (!statConfig) {
            console.warn(`⚠️ Unknown stat ID: ${statId}`);
            return '';
        }
        
        // Get the stat value from player object (fallback to 0)
        let statValue = player[statConfig.key];
        if (!statValue || statValue === 0) {
            statValue = '-';
        }

        
        console.log(`📊 ${statConfig.label}: ${statValue} (${statConfig.key})`);
        
        return `
            <div class="stat-pill stat-pill-custom">
                <div class="stat-pill-value">${statValue}</div>
                <div class="stat-pill-label">${statConfig.label}</div>
            </div>
        `;

    }).filter(html => html !== '').join('');
    
    console.log('🎨 Generated custom stats HTML:', customStatsHTML);
    
    return customStatsHTML;
}

// Locate the createPlayerCard function in your app.js and replace it with this:

/**
 * Create a player row element for the Database/Watchlist views
 * Handles Supabase price integration with image fallbacks and 2-decimal formatting.
 * @param {Object} player - The player data object
 * @returns {HTMLElement} - The rendered player row
 */
function createPlayerCard(player) {

    console.log('🎯 createPlayerCard called with player:', player.name);
    console.log('🎯 Player keys:', Object.keys(player));
    console.log('🎯 Player acceleration:', player.acceleration);
    console.log('🎯 Custom stats:', window.customSelectedStats);
    const card = document.createElement('div');
    card.className = 'player-row';

    // 1. Metadata for filtering and sorting
    card.dataset.name = player.name;
    card.dataset.position = player.position || 'N/A';
    card.dataset.rating = player.ovr || 0;

    // 2. Create Unique ID for Watchlist (handles ranks and tradability)
    const uniqueId = getPlayerUniqueId(player);
    const isWatchlisted = state.watchlist && state.watchlist.includes(uniqueId);
    const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
    const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
    const untradableBadgeHTML = isUntradable
        ? `<div class="card-untradable-badge" style="pointer-events: none;">
               <img src="assets/images/untradable_img.png" alt="Untradable">
           </div>`
        : '';

    // 3. Handle Secondary Positions mapping
    // ✅ NEW: Parse alternate_position from API (supports multiple positions)
    let altPositionsArray = [];
    if (player.alternate_position) {
        // Parse comma-separated string or handle single position
        altPositionsArray = player.alternate_position
            .split(',')
            .map(pos => pos.trim())
            .filter(pos => pos.length > 0);
    }

    // Log for debugging
    console.log('[ALT POS]', player.name, '| Primary:', player.position, '| Alternates:', altPositionsArray);



    // 4. ROBUST PRICE & IMAGE LOGIC
    let displayPriceHTML = '';

    if (isUntradable) {
        displayPriceHTML = `
            <img src="assets/images/untradable-red-flag.png"
                alt="Non-auctionable"
                style="height: 18px; width: auto; vertical-align: middle; opacity: 0.95; margin-left: 6px;"
                title="Non-auctionable">
        `;
    } else if (player.price !== undefined && player.price !== null) {
        const formattedPrice = typeof formatPrice === 'function'
            ? formatPrice(player.price)
            : player.price.toLocaleString();

      displayPriceHTML = `
          <span class="price-inline">
              <img src="assets/images/background/fc coin img.webp" alt="coin" class="price-icon">
              <span class="price-text">${formattedPrice}</span>
          </span>
      `;

    } else {
        displayPriceHTML = `
            <img src="https://images.zenithfcm.com/unauctionable.png"
                alt="Non-auctionable"
                style="height: 18px; width: auto; vertical-align: middle; opacity: 0.9; margin-left: 6px;"
                title="Non-auctionable">
        `;
    }



    // 5. Build HTML Structure
    card.innerHTML = `
        <div class="player-card-scale">
            <div class="player-row-card">
                <div class="player-card-image-container">
                    
                    ${player.card_background ? `
                        <img src="${player.card_background}" 
                        alt="Card Background" 
                        class="player-card-bg-image"
                        onerror="this.style.display='none'">
                    ` : ''}

                    ${player.player_image ? `
                        <img src="${player.player_image}" 
                            alt="${player.name}"
                            class="player-card-main-image"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <span class="player-initials" style="display:none">${getInitials(player.name)}</span>
                    ` : ` 
                        <span class="player-initials">${getInitials(player.name)}</span>
                    `}

                    <div class="player-card-name" style="color:${player.color_name || '#FFFFFF'};">
                        ${player.name}
                    </div>

                    <div class="player-card-ovr" style="color:${player.color_rating || '#FFB86B'};">
                        ${(() => {
                            // Define slotPosition based on player's own position
                            const slotPosition = (player.position || 'ST').toLowerCase();
                            const adjustedOVR = getPositionAdjustedOVR(player, slotPosition);
                            return adjustedOVR > 0 ? adjustedOVR : '?';
                        })()}
                    </div>


                    <div class="player-card-position" style="color:${player.color_position || '#FFFFFF'};">
                        ${player.position || '?'}
                    </div>


                    ${player.nation_flag 
                      ? `<img src="${player.nation_flag}" 
                              alt="Nation" 
                              class="player-view-card-nation-flag ${getPlayerType(player) === 'normal' 
                                ? 'normal-players-nation-flag' 
                                : 'hero-icon-players-nation-flag'}">` 
                      : ''}

                    ${player.club_flag 
                      ? `<img src="${player.club_flag}" 
                              alt="Club" 
                              class="player-view-card-club-flag ${getPlayerType(player) === 'normal' 
                                ? 'normal-club-players-flag' 
                                : 'hero-icon-club-players-flag'}">` 
                      : ''}
                    
                    
                    ${player.league_image && getPlayerType(player) === 'normal'
                      ? `<img src="${player.league_image}" 
                              alt="League" 
                              class="player-view-card-league-flag normal-league-players-flag">`
                      : ''}

                    ${untradableBadgeHTML}

                </div>
            </div>
        </div>

        <div class="player-row-info">
            <div class="player-info-name">${player.name}</div>
            <div class="player-info-meta">${player.ovr || 'N/A'} • ${player.position || 'N/A'}</div>

            <div class="player-price" style="color:#fbbf24; font-weight:500; font-size:0.9rem; margin-top:4px; min-height:20px; display:flex; align-items:center;">
                ${displayPriceHTML}
            </div>

            ${altPositionsArray.filter(pos => pos && pos !== '0' && pos !== 0).length > 0 ? `
                <div class="player-info-secondary">
                    ${altPositionsArray.filter(pos => pos && pos !== '0' && pos !== 0).map(pos => `<span class="secondary-position-badge">${pos}</span>`).join('')}
                </div>
            ` : ''}
        </div>

        <div class="player-row-stats player-card-stats-row">
            <div class="stat-pill"><div class="stat-pill-value">${player.pace && player.pace > 0 ? player.pace : '-'}</div><div class="stat-pill-label">PAC</div></div>
            <div class="stat-pill"><div class="stat-pill-value">${player.shooting && player.shooting > 0 ? player.shooting : '-'}</div><div class="stat-pill-label">SHO</div></div>
            <div class="stat-pill"><div class="stat-pill-value">${player.passing && player.passing > 0 ? player.passing : '-'}</div><div class="stat-pill-label">PAS</div></div>
            <div class="stat-pill"><div class="stat-pill-value">${player.dribbling && player.dribbling > 0 ? player.dribbling : '-'}</div><div class="stat-pill-label">DRI</div></div>
            <div class="stat-pill"><div class="stat-pill-value">${player.defending && player.defending > 0 ? player.defending : '-'}</div><div class="stat-pill-label">DEF</div></div>
            <div class="stat-pill"><div class="stat-pill-value">${player.physical && player.physical > 0 ? player.physical : '-'}</div><div class="stat-pill-label">PHY</div></div>
            ${renderCustomStats(player)}
        </div>



        <button class="player-row-watchlist ${isWatchlisted ? 'active' : ''}"
                data-unique-id="${uniqueId}"
                aria-label="Toggle watchlist for ${player.name}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWatchlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
    `;

    // 6. Event Listeners

    // Main card click (View Details or assign to squad)
    card.addEventListener('click', function(e) {
        if (e.target.closest('.player-row-watchlist')) return;

        if (window.squadState && window.squadState.pendingDatabaseAssign && window.squadState.activeSlot) {
            const slotId = window.squadState.activeSlot;
            const playerId = player.player_id || player.id;
            const overall = player.ovr || player.overall || 0;

            if (typeof ensurePlayerInGlobalList === 'function') {
                ensurePlayerInGlobalList(player, playerId, overall);
            } else if (typeof addPlayerToCache === 'function') {
                addPlayerToCache({
                    ...player,
                    id: playerId,
                    player_id: playerId,
                    overall,
                    ovr: overall,
                    team: player.club || player.team,
                    club: player.club || player.team,
                    price: player.price || 0
                });
            }

            if (slotId.startsWith('BENCH')) {
                const index = parseInt(slotId.replace('BENCH', ''), 10);
                if (!Number.isNaN(index)) {
                    if (typeof isPlayerAlreadyInSquad === 'function' && isPlayerAlreadyInSquad(playerId, null)) {
                        return;
                    }
                    if (typeof removeIfAssigned === 'function') removeIfAssigned(playerId);
                    window.squadState.bench[index] = playerId;
                    if (typeof renderSquadBuilder === 'function') renderSquadBuilder();
                }
            } else {
                if (typeof validateAssignment === 'function' && !validateAssignment(player, slotId)) {
                    return;
                }
                if (typeof isPlayerAlreadyInSquad === 'function' && isPlayerAlreadyInSquad(playerId, slotId)) {
                    return;
                }
                if (typeof removeIfAssigned === 'function') removeIfAssigned(playerId);
                window.squadState.starters[slotId] = playerId;
                if (typeof renderSquadBuilder === 'function') renderSquadBuilder();
            }

            if (window.squadState) {
                window.squadState.lastAssignedPlayerId = playerId;
            }

            window.squadState.pendingDatabaseAssign = false;
            window.squadState.activeSlot = null;

            if (typeof switchView === 'function') switchView('squadbuilder');
            if (typeof openSquadBuilderModal === 'function') openSquadBuilderModal();
            return;
        }

        const pid = player.playerid || player.player_id;
        if (!pid) { console.warn('[Zenith] No player ID found', player); return; }
        if (window.ZRouter) {
            ZRouter.navigate(`/player/${pid}`);
        } else if (typeof viewPlayerDetail === 'function') {
            viewPlayerDetail(pid);
        } else {
            console.log('[Zenith] No router or viewPlayerDetail found', pid);
        }
    });

    // Watchlist button click
    // Watchlist button click
    const watchBtn = card.querySelector('.player-row-watchlist');
    if (watchBtn) {
      watchBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();

        // Get ID from data attribute OR closure variable
        const id = this.dataset.uniqueId || uniqueId;
        console.log('❤️ Watchlist clicked! ID:', id);

        if (typeof window.toggleWatchlist === 'function') {
          window.toggleWatchlist(id);

          // ✅ ADD THIS - Force update UI after toggle
          setTimeout(() => {
            updateAllWatchlistButtons();
          }, 100);
        } else {
          console.error('window.toggleWatchlist not found!');
        }
      });
    }


    return card;
}


// ========== LOAD DATABASE FROM API ==========
// ========== LOAD DATABASE WITH FILTERS & PAGINATION ==========
// ========== LOAD WATCHLIST ==========
/*function applyWatchlistFilters(players) {
  return players.filter(player => {
    // Position
    if (state.filters.position && player.position !== state.filters.position) {
      return false;
    }

    // OVR
    if (player.ovr < state.filters.ratingMin || player.ovr > state.filters.ratingMax) {
      return false;
    }

    // League
    if (state.filters.league && player.league !== state.filters.league) {
      return false;
    }

    // Club
    if (state.filters.club && player.team !== state.filters.club) {
      return false;
    }

    // Nation
    if (state.filters.nation && player.nation !== state.filters.nation) {
      return false;
    }

    // Skill moves
    if (state.filters.skillMoves && String(player.skill_moves) !== String(state.filters.skillMoves)) {
      return false;
    }


    // Event
    if (state.filters.event && player.event !== state.filters.event) return false;

    return true;
  });
}
*/

function loadWatchlist() {
  const container = document.getElementById('watchlist-players-grid');
  if (!container) {
    console.warn('[WATCHLIST] Container not found');
    return;
  }

  container.innerHTML = '';

  // 1. Empty state check (if no IDs are in the watchlist at all)
  if (!state.watchlist || state.watchlist.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>No players in watchlist</h3>
        <p>Add players from the database</p>
      </div>
    `;
    return;
  }

  // ============================================================
  // 🔥 FIX: Load full player objects from storage first
  // ============================================================
  let resolvedPlayers = JSON.parse(localStorage.getItem('watchlistPlayers')) || [];

  // Fallback: If storage is missing players (e.g., from old data), try to find them in current memory
  if (resolvedPlayers.length < state.watchlist.length) {
    const allMemoryPlayers = [
      ...(state.filteredPlayers || []),
      ...(state.allPlayers || []),
      ...(state.searchResults || [])
    ];

    state.watchlist.forEach(uniqueId => {
      // Check if we already have this player resolved
      const alreadyResolved = resolvedPlayers.some(p => {
        const pId = `${p.player_id}_${p.rank || 0}_${p.is_untradable ? 1 : 0}`;
        return pId === uniqueId;
      });

      if (!alreadyResolved) {
        const [playerId, rank, untradable] = uniqueId.split('_');
        const found = allMemoryPlayers.find(p =>
          String(p.player_id) === String(playerId) &&
          String(p.rank || 0) === String(rank) &&
          String(p.is_untradable ? 1 : 0) === String(untradable)
        );
        if (found) resolvedPlayers.push(found);
      }
    });
  }

  // Final Sync: Ensure we ONLY show players that are actually in the active ID list
  resolvedPlayers = resolvedPlayers.filter(p => {
    const uniqueId = `${p.player_id}_${p.rank || 0}_${p.is_untradable ? 1 : 0}`;
    return state.watchlist.includes(uniqueId);
  });

  // ============================================================
  // APPLY FILTERS & RENDER
  // ============================================================

  // Use your existing filter function
  const filteredWatchlist = applyWatchlistFilters(resolvedPlayers);

  // Case: Watchlist has players, but filters hide them all
  if (filteredWatchlist.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No players match filters</h3>
        <p>Try adjusting filters</p>
      </div>
    `;
    return;
  }

  // Render the cards
  filteredWatchlist.forEach(player => {
    // Uses your existing card creator (which handles the hearts)
    const card = createPlayerCard(player);
    container.appendChild(card);
  });

  // Sync heart icons across the app
  updateAllWatchlistButtons();

  console.log('[WATCHLIST] Loaded', filteredWatchlist.length, 'players');
}


// ========== LOAD DATABASE FROM API ==========
async function loadDatabase() {
    const activeSearchTerm = (state.searchQuery || '').trim();
    if (activeSearchTerm.length >= 2 && typeof window.runDatabaseSearch === 'function') {
        window.runDatabaseSearch(activeSearchTerm, false);
        return;
    }

    if (state.isLoadingDatabase) {
        console.log('[DATABASE] Already loading...');
        return;
    }

    const container = document.getElementById('players-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const resultsInfo = document.querySelector('.results-info');

    if (!container) return;

    // Show loading state
    if (state.currentOffset === 0) {
        container.innerHTML = '<div class="loading-spinner">Loading players...</div>';
    }

    state.isLoadingDatabase = true;

    try {
        // Build filter object from state
        const filters = {
            limit: state.limitPerPage,
            offset: state.currentOffset,
            rank: state.apiRank
        };

        // Add position filters
        if (state.filters.position) {
            filters.position = state.filters.position;
        }

        // Add OVR range filter
        if (state.filters.ratingMin > 40) {
            filters.min_ovr = state.filters.ratingMin;
        }
        if (state.filters.ratingMax < 150) {
            filters.max_ovr = state.filters.ratingMax;
        }

        // league filter
        if (state.filters.league) {
            filters.league = state.filters.league;
        }

        // club filter
        if (state.filters.club) {
            filters.team = state.filters.club;
        }

        // nation filter
        if (state.filters.nation) {
            filters.nation = state.filters.nation;
        }

        // Add skill moves filter
        if (state.filters.skillMoves) {
            filters.skill_moves = state.filters.skillMoves;
        }

        // Add event filter
        if (state.filters.event) {
            filters.event = state.filters.event;
        }

        // ========== FIXED: Add Price Range filter ==========
        if (state.filters.priceMin !== null && state.filters.priceMin !== '' && !isNaN(state.filters.priceMin)) {
            filters.min_price = parseInt(state.filters.priceMin);
        }
        if (state.filters.priceMax !== null && state.filters.priceMax !== '' && !isNaN(state.filters.priceMax)) {
            filters.max_price = parseInt(state.filters.priceMax);
        }

        // ========== ✅ NEW: Add Auctionable filter ==========
        const auctionableToggle = document.getElementById('auctionable-toggle');
        const mobileAuctionable = document.getElementById('mobile-filter-auctionable')?.value || '';
        console.log('[DEBUG] Auctionable toggle element:', auctionableToggle);
        console.log('[DEBUG] Toggle checked state:', auctionableToggle?.checked);
        const auctionableFilter = auctionableToggle?.checked
            ? 'auctionable'
            : ((state.filters && state.filters.auctionable) || mobileAuctionable || '');
        if (auctionableFilter === 'auctionable') {
            // Only show tradable players (is_untradable = 0)
            filters.is_untradable = 0;
            console.log('[DEBUG] Auctionable filter: Auctionable only (is_untradable = 0)');
        } else if (auctionableFilter === 'unauctionable') {
            // Only show non-tradable players (is_untradable = 1)
            filters.is_untradable = 1;
            console.log('[DEBUG] Auctionable filter: Non-auctionable only (is_untradable = 1)');
        } else {
            console.log('[DEBUG] Auctionable filter: All players (no is_untradable filter)');
        }
        // When toggle is OFF, don't send filter = show all players


        console.log('[DATABASE] Fetching with filters:', filters);
        console.log('[DEBUG] Full filter object:', JSON.stringify(filters, null, 2));
        console.log('[DEBUG] is_untradable in filters?', 'is_untradable' in filters, '- Value:', filters.is_untradable);


        // 1. Fetch from Metadata API
        const response = await apiClient.getPlayers(filters);

        if (!response || !response.players) {
            throw new Error('Invalid API response');
        }

        let players = response.players;

        // ========== DEBUG: Check what we received ==========
        console.log('[DEBUG] API returned total players:', players.length);
        console.log('[DEBUG] First 3 players sample:', players.slice(0, 3).map(p => ({
            name: p.name,
            is_untradable: p.is_untradable,
            price: p.price
        })));
        console.log('[DEBUG] Players with is_untradable=0:', players.filter(p => p.is_untradable === 0 || p.is_untradable === '0').length);
        console.log('[DEBUG] Players with is_untradable=1:', players.filter(p => p.is_untradable === 1 || p.is_untradable === '1').length);
      

        // 🔥 2. Sync Metadata with Supabase Prices (matches p.id to asset_id)
        if (typeof supabaseProvider !== 'undefined') {
            console.log('[SUPABASE] Syncing prices for', players.length, 'players...');
            players = await supabaseProvider.syncPrices(players);
        }

        // 3. Cache globally for watchlist
        state.allPlayers = [
          ...new Map(
            [...state.allPlayers, ...players].map(p => [`${p.player_id}_${p.rank || 0}_${p.is_untradable ? 1 : 0}`, p])
          ).values()
        ];

        state.totalPlayers = response.total || players.length;
        state.hasMorePlayers = players.length === state.limitPerPage;

        // If first load, replace content
        if (state.currentOffset === 0) {
            container.innerHTML = '';
        }

        if (state.sortBy !== 'price') {
            if (state.currentOffset === 0) {
                state.filteredPlayers = players;
            } else {
                // Append to existing
                state.filteredPlayers = [...state.filteredPlayers, ...players];
            }
        }

        // 4. Render player cards
        if (players.length === 0 && state.currentOffset === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No players found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {

        // ✅ SORT PLAYERS BEFORE RENDERING
            let sortedPlayers = [...players]; // Create copy
            
            if (state.sortBy === 'name') {
                // Sort A-Z alphabetically
                sortedPlayers.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                console.log('[SORT] Sorted by name (A-Z)');
            } 
            else if (state.sortBy === 'rating') {
                // Sort by OVR highest to lowest
                sortedPlayers.sort((a, b) => {
                    return (b.ovr || 0) - (a.ovr || 0);
                });
                console.log('[SORT] Sorted by rating (high to low)');
            } else if (state.sortBy === 'price') {
                try {
                    const rank = state.apiRank || 0;
                    const priceCol = `price${rank}`;
                    console.log('[PRICE SORT] Querying latest_prices view...');

                    const { data, error } = await window.supabaseClient
                        .from('latest_prices')
                        .select(`asset_id, ${priceCol}`)
                        .not(priceCol, 'is', null)
                        .gt(priceCol, 0)
                        .order(priceCol, { ascending: state.sortDirection === 'asc' })
                        .range(state.currentOffset, state.currentOffset + state.limitPerPage - 1);

                    if (error) throw error;

                    console.log('[PRICE SORT] Supabase returned:', data.length, 'unique players');

                    const ids = data.map(p => p.asset_id).join(',');
                    const byIds = await window.apiClient.fetchWithCache(
                        `/players/by-ids?ids=${ids}&rank=${rank}`,
                        { cache: false }
                    );
                    const fetched = byIds.players || [];

                    // Attach price to each player
                    fetched.forEach(p => {
                        const entry = data.find(r => String(r.asset_id) === String(p.player_id));
                        if (entry) p.price = entry[priceCol];
                    });

                    // Re-sort to match Supabase order
                    fetched.sort((a, b) =>
                        state.sortDirection === 'asc'
                            ? (a.price || 0) - (b.price || 0)
                            : (b.price || 0) - (a.price || 0)
                    );

                    sortedPlayers = fetched;
                    console.log('[PRICE SORT] Done. Players on screen:', sortedPlayers.length);

                } catch (e) {
                    console.error('[PRICE SORT] Failed:', e);
                    sortedPlayers.sort((a, b) => (b.price || 0) - (a.price || 0));
                }
            }

            if (state.sortBy === 'price') {
                if (state.currentOffset === 0) {
                    state.filteredPlayers = [...sortedPlayers];
                } else {
                    const mergedPricePlayers = [...(state.filteredPlayers || []), ...sortedPlayers];
                    const seenPriceIds = new Set();
                    state.filteredPlayers = mergedPricePlayers.filter(player => {
                        const key = getPlayerUniqueId(player);
                        if (seenPriceIds.has(key)) return false;
                        seenPriceIds.add(key);
                        return true;
                    });
                }
            }

            
            // Render sorted players
            sortedPlayers.forEach(player => {
                const card = createPlayerCard(player);
                container.appendChild(card);
            });

            updateAllWatchlistButtons();
            // ========== HORIZONTAL SCROLL SYNC ==========
            initDatabaseScrollSync();


            // Show/hide Load More button
            if (loadMoreBtn) {
                if (state.hasMorePlayers && players.length === state.limitPerPage) {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.textContent = 'Load More';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }
        }

        // Update results info
        if (resultsInfo) {
            const displayedCount = state.filteredPlayers.length;
            resultsInfo.textContent = `Showing ${displayedCount} of ${state.totalPlayers} players`;
        }

        console.log(`[DATABASE] Loaded ${players.length} players (offset: ${state.currentOffset})`);

    } catch (error) {
        console.error('[DATABASE] Error loading players:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Error loading players</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadDatabase()">Retry</button>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } finally {
        state.isLoadingDatabase = false;
    }
}


// ========== LOAD MORE PLAYERS ==========
window.loadMorePlayers = function() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
    }

    state.currentOffset += state.limitPerPage;
    loadDatabase();
};

// ========== INITIALIZE FILTERS ==========
// Price filter constants (limits)
const PRICE_FILTER_LIMITS = {
    min: 0,
    max: 999999999999  // 999B max
};

function initFilters() {
    // Position filter
    const positionFilter = document.getElementById('filter-position');
    if (positionFilter) {
        positionFilter.addEventListener('change', (e) => {
            state.filters.position = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') {
                loadDatabase();
            }
            if (state.currentView === 'watchlist') {
              loadWatchlist();
            }
        });
    }

    // Rating Min filter with proper limits
    // Around line 3800-3900 in your initFilters function
    // Replace the Rating Min filter section with:

    // Replace the Rating Min filter section in initFilters():
    // Rating Min filter - FIXED VERSION
    const ratingMin = document.getElementById('rating-min');
    if (ratingMin) {
        ratingMin.setAttribute('min', '40');
        ratingMin.setAttribute('max', '150');
        
        let ratingMinTimeout;
        
        // Input event - just update display, don't modify the input
        ratingMin.addEventListener('input', (e) => {
            console.log('🔵 MIN INPUT - Raw value:', e.target.value);
            
            let value = parseInt(e.target.value);
            
            // Allow incomplete input while typing
            if (isNaN(value) || e.target.value === '') {
                console.log('  Incomplete input, skipping');
                return;
            }
            
            // DON'T modify e.target.value here - let user finish typing
            // Just update state and display
            state.filters.ratingMin = value;
            updateRatingDisplay();
            
            console.log('  Updated state to:', value);
        });
        
        // Blur event - validate and clamp when user leaves the field
        ratingMin.addEventListener('blur', (e) => {
            console.log('🔵 MIN BLUR - Validating');
            
            let value = parseInt(e.target.value);
            
            if (isNaN(value) || e.target.value === '') {
                value = 40; // Default to min
            }
            
            // NOW enforce limits
            value = Math.max(40, Math.min(150, value));
            
            // Ensure min <= max
            if (value > state.filters.ratingMax) {
                value = state.filters.ratingMax;
            }
            
            // Update both input and state
            e.target.value = value;
            state.filters.ratingMin = value;
            updateRatingDisplay();
            
            console.log('  Final validated value:', value);
            
            // Reload data
            state.currentOffset = 0;
            if (state.currentView === 'database') loadDatabase();
            if (state.currentView === 'watchlist') loadWatchlist();
        });
    }

    // Rating Max filter - FIXED VERSION
    const ratingMax = document.getElementById('rating-max');
    if (ratingMax) {
        ratingMax.setAttribute('min', '40');
        ratingMax.setAttribute('max', '150');
        
        let ratingMaxTimeout;
        
        // Input event - just update display, don't modify the input
        ratingMax.addEventListener('input', (e) => {
            console.log('🟢 MAX INPUT - Raw value:', e.target.value);
            
            let value = parseInt(e.target.value);
            
            // Allow incomplete input while typing
            if (isNaN(value) || e.target.value === '') {
                console.log('  Incomplete input, skipping');
                return;
            }
            
            // DON'T modify e.target.value here
            state.filters.ratingMax = value;
            updateRatingDisplay();
            
            console.log('  Updated state to:', value);
        });
        
        // Blur event - validate and clamp when user leaves the field
        ratingMax.addEventListener('blur', (e) => {
            console.log('🟢 MAX BLUR - Validating');
            
            let value = parseInt(e.target.value);
            
            if (isNaN(value) || e.target.value === '') {
                value = 150; // Default to max
            }
            
            // NOW enforce limits
            value = Math.max(40, Math.min(150, value));
            
            // Ensure max >= min
            if (value < state.filters.ratingMin) {
                value = state.filters.ratingMin;
            }
            
            // Update both input and state
            e.target.value = value;
            state.filters.ratingMax = value;
            updateRatingDisplay();
            
            console.log('  Final validated value:', value);
            
            // Reload data
            state.currentOffset = 0;
            if (state.currentView === 'database') loadDatabase();
            if (state.currentView === 'watchlist') loadWatchlist();
        });
    }



    // ========== FIXED: Price Min filter with proper handling ==========
    const priceMin = document.getElementById('price-min');
    if (priceMin) {
        priceMin.setAttribute('min', '0');
        priceMin.setAttribute('max', String(PRICE_FILTER_LIMITS.max));
        priceMin.setAttribute('placeholder', 'Min (0)');

        priceMin.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
            if (value === '') {
                state.filters.priceMin = null;
            } else {
                let numValue = parseInt(value);
                // Enforce limits
                numValue = Math.max(PRICE_FILTER_LIMITS.min, Math.min(PRICE_FILTER_LIMITS.max, numValue));
                state.filters.priceMin = numValue;
                e.target.value = numValue;
            }
            updatePriceDisplay();
        });

        priceMin.addEventListener('change', (e) => {
            // Validate: min should not be greater than max
            if (state.filters.priceMin !== null && state.filters.priceMax !== null) {
                if (state.filters.priceMin > state.filters.priceMax) {
                    state.filters.priceMin = state.filters.priceMax;
                    e.target.value = state.filters.priceMin;
                }
            }
            state.currentOffset = 0;
            if (state.currentView === 'database') {
                loadDatabase();
            }
            if (state.currentView === 'watchlist') {
                loadWatchlist();
            }
        });
    }

    // ========== FIXED: Price Max filter with proper handling ==========
    const priceMax = document.getElementById('price-max');
    if (priceMax) {
        priceMax.setAttribute('min', '0');
        priceMax.setAttribute('max', String(PRICE_FILTER_LIMITS.max));
        priceMax.setAttribute('placeholder', 'Max');

        priceMax.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
            if (value === '') {
                state.filters.priceMax = null;
            } else {
                let numValue = parseInt(value);
                // Enforce limits
                numValue = Math.max(PRICE_FILTER_LIMITS.min, Math.min(PRICE_FILTER_LIMITS.max, numValue));
                state.filters.priceMax = numValue;
                e.target.value = numValue;
            }
            updatePriceDisplay();
        });

        priceMax.addEventListener('change', (e) => {
            // Validate: max should not be less than min
            if (state.filters.priceMin !== null && state.filters.priceMax !== null) {
                if (state.filters.priceMax < state.filters.priceMin) {
                    state.filters.priceMax = state.filters.priceMin;
                    e.target.value = state.filters.priceMax;
                }
            }
            state.currentOffset = 0;
            if (state.currentView === 'database') {
                loadDatabase();
            }
            if (state.currentView === 'watchlist') {
                loadWatchlist();
            }
        });
    }

    // League filter
    const leagueFilter = document.getElementById('filter-league');
    if (leagueFilter) {
        leagueFilter.addEventListener('change', (e) => {
            state.filters.league = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') {
              loadDatabase();
            }
            if (state.currentView === 'watchlist') {
              loadWatchlist();
            }
        });
    }

    // Nation filter (autocomplete)
    const nationFilter = document.getElementById('filter-nation');
    if (nationFilter) {
        nationFilter.addEventListener('change', (e) => {
            state.filters.nation = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') {
              loadDatabase();
            }
            if (state.currentView === 'watchlist') {
              loadWatchlist();
            }
        });
    }

    // Club filter
    const clubFilter = document.getElementById('filter-club');
    if (clubFilter) {
        clubFilter.addEventListener('change', (e) => {
            state.filters.club = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') {
              loadDatabase();
            }
            if (state.currentView === 'watchlist') {
              loadWatchlist();
            }
        });
    }

    // Skill Moves filter
    const skillFilter = document.getElementById('filter-skill');
    if (skillFilter) {
        skillFilter.addEventListener('change', (e) => {
            state.filters.skillMoves = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') {
              loadDatabase();
            }
            if (state.currentView === 'watchlist') {
              loadWatchlist();
            }
        });
    }

    // Event filter
    const eventFilter = document.getElementById('filter-event');
    if (eventFilter) {
        eventFilter.addEventListener('change', (e) => {
            state.filters.event = e.target.value;
            state.currentOffset = 0;
            if (state.currentView === 'database') loadDatabase();
            if (state.currentView === 'watchlist') loadWatchlist();
        });
    }

    // Clear All Filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

        // Auctionable Toggle Handler
        const auctionableToggle = document.getElementById('auctionable-toggle');
        const auctionStatusText = document.getElementById('auction-status-text');

        console.log('[DEBUG INIT] Auctionable toggle found:', !!auctionableToggle);
        console.log('[DEBUG INIT] Status text element found:', !!auctionStatusText);

        if (auctionableToggle && auctionStatusText) {
            auctionableToggle.addEventListener('change', (e) => {
                console.log('[DEBUG EVENT] Toggle changed! New state:', e.target.checked);
                // Update text
                if (e.target.checked) {
                    auctionStatusText.textContent = 'Only With Prices';
                    console.log('[DEBUG EVENT] Text updated to: Only With Prices');
                } else {
                    auctionStatusText.textContent = 'All Players';
                    console.log('[DEBUG EVENT] Text updated to: All Players');
                }
                if (state && state.filters) {
                    state.filters.auctionable = e.target.checked ? 'auctionable' : '';
                }
                
                // Re-apply filters
                state.currentOffset = 0;
                console.log('[DEBUG EVENT] Reloading database...');
                if (state.currentView === 'database') loadDatabase();
                if (state.currentView === 'watchlist') loadWatchlist();
            });
        }


    console.log('[FILTERS] Initialized');
}

// ========== FIXED: Update price display ==========
function updatePriceDisplay() {
    const priceValue = document.getElementById('price-value');
    if (priceValue) {
        const min = state.filters.priceMin;
        const max = state.filters.priceMax;

        if (min === null && max === null) {
            priceValue.textContent = 'Any';
        } else if (min !== null && max !== null) {
            priceValue.textContent = `${formatPrice(min)} - ${formatPrice(max)}`;
        } else if (min !== null) {
            priceValue.textContent = `${formatPrice(min)}+`;
        } else if (max !== null) {
            priceValue.textContent = `Up to ${formatPrice(max)}`;
        }
    }
}

// Update rating display
function updateRatingDisplay() {
    const ratingValue = document.getElementById('rating-value');
    if (ratingValue) {
        ratingValue.textContent = `${state.filters.ratingMin}-${state.filters.ratingMax}`;
    }
}

// Clear all filters
function clearAllFilters() {
    // 1. Reset State Object
    state.filters = {
        position: '',
        ratingMin: 40,
        ratingMax: 120,
        priceMin: null,
        priceMax: null,
        league: '',
        nation: '',
        club: '',
        skillMoves: '',
        event: '',
        auctionable: ''
    };

    // 2. Reset UI Elements
    const positionFilter = document.getElementById('filter-position');
    if (positionFilter) positionFilter.value = '';

    const ratingMin = document.getElementById('rating-min');
    if (ratingMin) ratingMin.value = 40;

    const ratingMax = document.getElementById('rating-max');
    if (ratingMax) ratingMax.value = 150;

    // ✅ FIXED: Reset Price Filters
    const priceMin = document.getElementById('price-min');
    if (priceMin) priceMin.value = '';

    const priceMax = document.getElementById('price-max');
    if (priceMax) priceMax.value = '';

    const leagueFilter = document.getElementById('filter-league');
    if (leagueFilter) leagueFilter.value = '';

    const clubFilter = document.getElementById('filter-club');
    if (clubFilter) clubFilter.value = '';

    const nationFilter = document.getElementById('filter-nation');
    if (nationFilter) nationFilter.value = '';

    const skillFilter = document.getElementById('filter-skill');
    if (skillFilter) skillFilter.value = '';

    const eventFilter = document.getElementById('filter-event');
    if (eventFilter) eventFilter.value = '';

    const auctionableToggle = document.getElementById('auctionable-toggle');
    const auctionStatusText = document.getElementById('auction-status-text');
    if (auctionableToggle) {
        auctionableToggle.checked = false;
        if (auctionStatusText) auctionStatusText.textContent = 'All Players';
    }

    // Reset nation flag
    const nationFlag = document.getElementById('filter-nation-flag');
    if (nationFlag) {
        nationFlag.style.display = 'none';
        nationFlag.src = '';
    }

    // 3. Update Visuals
    updateRatingDisplay();
    updatePriceDisplay();

    // 4. Reload Database
    state.currentOffset = 0;
    if (state.currentView === 'database') {
        loadDatabase();
    }
    if (state.currentView === 'watchlist') {
        loadWatchlist();
    }
}



// Initialize Application
document.addEventListener('DOMContentLoaded', async function () {
  // ----------------------------
  // Core startup
  // ----------------------------
  initCountryAutocomplete('filter-nation', 'filter-nation-list');
  initCountryAutocomplete('mobile-filter-nation', 'mobile-filter-nation-list');

  console.log('[APP] Initializing Zenith App...');

  const logoImg = document.querySelector('.logo-image');
  if (logoImg) {
    const logoPath = logoImg.getAttribute('src');
    const logLogoLoaded = () => console.info('[LOGO] Logo loaded successfully:', logoPath);
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      logLogoLoaded();
    } else {
      logoImg.addEventListener('load', logLogoLoaded, { once: true });
    }
  }

  // ===== API INITIALIZATION =====
  if (typeof apiClient !== 'undefined') {
    window.apiClient = apiClient;
    console.log('[APP] ✓ API client connected');

    try {
      const health = await window.apiClient.checkHealth();
      console.log('[APP] ✓ API Health:', health);
    } catch (error) {
      console.error('[APP] ✗ API check failed:', error);
    }
  } else {
    console.warn('[APP] ⚠ API client not found');
  }
  // ===== END API INITIALIZATION =====

  // ----------------------------
  // Ensure core UI systems are initialized
  // ----------------------------
  // Initialize filters (attaches base filter event listeners)
  if (typeof initFilters === 'function') {
    initFilters();
  }


  // Initialize tools menu (modal / sheet)
  if (typeof initializeToolsMenu === 'function') {
    initializeToolsMenu();
  }

  // ----------------------------
  // Navigation & basic UI listeners
  // ----------------------------
  document.querySelectorAll('[data-view]').forEach(button => {
    // prevent duplicate handlers if this gets called twice
    button.removeEventListener('click', button._zenithViewHandler);
    const handler = function () {
      const view = this.getAttribute('data-view');
      if (view) switchView(view);
    };
    button._zenithViewHandler = handler;
    button.addEventListener('click', handler);
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
      backBtn.removeEventListener('click', backBtn.zenithBackHandler);
      backBtn.zenithBackHandler = () => {
          console.log('%c[Zenith] Back button clicked', 'color:#6366F1;font-weight:600', {
              historyLength: window.history.length
          });
          if (window.ZRouter && window.history.length > 1) {
              window.history.back();
          } else {
              ZRouter ? ZRouter.navigate('/players') : switchView('database');
          }
      };
      backBtn.addEventListener('click', backBtn.zenithBackHandler);
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.removeEventListener('click', loadMoreBtn._zenithLoadMoreHandler);
    loadMoreBtn._zenithLoadMoreHandler = loadMorePlayers;
    loadMoreBtn.addEventListener('click', loadMoreBtn._zenithLoadMoreHandler);
  }

  // ----------------------------
  // Players page search with filters
  // (search triggered from #player-search input on players page)
  // ----------------------------
  let playerSearchTimeout = null;
  let currentPlayerSearchQuery = '';
  let playerSearchOffset = 0;
  let playerSearchTotal = 0;
  let playerSearchRequestId = 0;

  const playerSearch = document.getElementById('player-search');
  if (playerSearch) {
    playerSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim();
      state.searchQuery = searchTerm;
      state.currentOffset = 0;

      clearTimeout(playerSearchTimeout);

      // If empty, restore normal DB view
      if (searchTerm.length === 0) {
        currentPlayerSearchQuery = '';
        playerSearchOffset = 0;
        playerSearchTotal = 0;
        if (typeof loadDatabase === 'function') loadDatabase();
        return;
      }

      if (searchTerm.length < 2) {
        return;
      }

      showPlayerSearchLoading();

      playerSearchTimeout = setTimeout(() => {
        runDatabaseSearch(searchTerm, false);
      }, 300);
    });
  }

  function showPlayerSearchLoading() {
    const container = document.getElementById('database-players-container') ||
      document.querySelector('#database-view .players-grid') ||
      document.querySelector('#database-view');

    if (container) {
      container.innerHTML = `
        <div class="search-loading" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div class="dropdown-spinner" style="margin: 0 auto 16px;"></div>
            <p style="color: var(--text-tertiary); font-size: 14px;">Searching...</p>
        </div>
      `;
    }
  }

  function runDatabaseSearch(query, append = false) {
    const normalizedQuery = (query || '').trim();
    if (normalizedQuery.length < 2) {
      return;
    }

    if (!append) {
      currentPlayerSearchQuery = normalizedQuery;
      playerSearchOffset = 0;
    }

    searchPlayersInDatabase(normalizedQuery, append);
  }

  window.runDatabaseSearch = runDatabaseSearch;

  function getActiveDatabaseFilters() {
    const filters = state.filters || {};
    const activeFilters = {};

    if (filters.position) activeFilters.position = filters.position;
    if (filters.league) activeFilters.league = filters.league;
    if (filters.club) activeFilters.club = filters.club;
    if (filters.nation) activeFilters.nation = filters.nation;
    if (filters.skillMoves) activeFilters.skillMoves = filters.skillMoves;
    if (filters.event) activeFilters.event = filters.event;
    if (filters.auctionable) activeFilters.auctionable = filters.auctionable;

    const ratingMin = Number.isFinite(filters.ratingMin) ? filters.ratingMin : 40;
    const ratingMax = Number.isFinite(filters.ratingMax) ? filters.ratingMax : 150;
    if (ratingMin !== 40 || ratingMax !== 150) {
      activeFilters.rating = { min: ratingMin, max: ratingMax };
    }

    if (filters.priceMin !== null && filters.priceMin !== '' && !Number.isNaN(filters.priceMin)) {
      activeFilters.priceMin = Number(filters.priceMin);
    }

    if (filters.priceMax !== null && filters.priceMax !== '' && !Number.isNaN(filters.priceMax)) {
      activeFilters.priceMax = Number(filters.priceMax);
    }

    return activeFilters;
  }

  function normalizeDatabasePositionValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim().toUpperCase();
  }

  function getDatabasePlayerPrimaryPosition(player) {
    return normalizeDatabasePositionValue(player.primary_position || player.position);
  }

  function getDatabasePlayerAltPositions(player) {
    const rawAltPositions = player.alt_positions ?? player.alternate_positions ?? player.alternate_position ?? '';
    const altPositionsArray = Array.isArray(rawAltPositions)
      ? rawAltPositions
      : String(rawAltPositions).split(',');

    return altPositionsArray
      .map(position => normalizeDatabasePositionValue(position))
      .filter(Boolean);
  }

  function matchesDatabasePositionFilter(player, selectedPosition) {
    const normalizedSelectedPosition = normalizeDatabasePositionValue(selectedPosition);
    if (!normalizedSelectedPosition) return true;
    if (getDatabasePlayerPrimaryPosition(player) === normalizedSelectedPosition) return true;
    return getDatabasePlayerAltPositions(player).includes(normalizedSelectedPosition);
  }

  function normalizeDatabaseEventValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function getDatabasePlayerEventValue(player) {
    return normalizeDatabaseEventValue(player.event || player.event_name || player.eventName);
  }

  function matchesDatabaseEventFilter(player, selectedEvent) {
    const normalizedSelectedEvent = normalizeDatabaseEventValue(selectedEvent);
    if (!normalizedSelectedEvent) return true;
    const playerEventValue = getDatabasePlayerEventValue(player);
    if (!playerEventValue) return false;
    const selectedEventKey = normalizedSelectedEvent.replace(/[^a-z0-9]/g, '');
    const playerEventKey = playerEventValue.replace(/[^a-z0-9]/g, '');
    if (selectedEventKey && playerEventKey) {
      return playerEventKey === selectedEventKey || playerEventKey.startsWith(selectedEventKey);
    }
    return playerEventValue === normalizedSelectedEvent;
  }

  function applyDatabaseSearchAndFilters(players, query) {
    const normalizeDatabaseSearchValue = (value) => String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const normalizedQuery = normalizeDatabaseSearchValue((query || '').trim());
    const filters = state.filters || {};
    const ratingMin = Number.isFinite(filters.ratingMin) ? filters.ratingMin : 40;
    const ratingMax = Number.isFinite(filters.ratingMax) ? filters.ratingMax : 150;
    const shouldFilterRating = ratingMin !== 40 || ratingMax !== 150;
    const shouldFilterPriceMin = filters.priceMin !== null && filters.priceMin !== '' && !Number.isNaN(filters.priceMin);
    const shouldFilterPriceMax = filters.priceMax !== null && filters.priceMax !== '' && !Number.isNaN(filters.priceMax);
    const selectedPosition = normalizeDatabasePositionValue(filters.position);
    const selectedEvent = normalizeDatabaseEventValue(filters.event);
    const selectedSkillMoves = Number.parseInt(filters.skillMoves, 10);

    const filteredPlayers = players.filter(player => {
      if (selectedEvent && !matchesDatabaseEventFilter(player, selectedEvent)) return false;
      if (selectedPosition && !matchesDatabasePositionFilter(player, selectedPosition)) return false;

      if (shouldFilterRating) {
        const rating = Number.parseInt(player.ovr || player.overall || player.overall_rating || 0, 10) || 0;
        if (rating < ratingMin || rating > ratingMax) return false;
      }

      if (filters.league && player.league !== filters.league) return false;

      if (filters.club) {
        const clubValue = player.team || player.club || '';
        if (clubValue !== filters.club) return false;
      }

      if (filters.nation) {
        const nationValue = player.nation || player.nation_region || player.nationality || '';
        if (nationValue !== filters.nation) return false;
      }

      if (Number.isFinite(selectedSkillMoves)) {
        const skillValue = Number.parseInt(
          player.skill_moves ?? player.skillMoves ?? player.skillmoves ?? player.skill_moves_stars ?? 0,
          10
        ) || 0;
        if (skillValue !== selectedSkillMoves) return false;
      }

      if (shouldFilterPriceMin || shouldFilterPriceMax) {
        const priceValue = Number(player.price);
        if (!Number.isFinite(priceValue)) return false;
        if (shouldFilterPriceMin && priceValue < Number(filters.priceMin)) return false;
        if (shouldFilterPriceMax && priceValue > Number(filters.priceMax)) return false;
      }

      if (filters.auctionable) {
        const isUntradable = String(player.is_untradable || '').toLowerCase() === 'true' ||
          player.is_untradable === 1 ||
          player.is_untradable === '1';
        if (filters.auctionable === 'auctionable' && isUntradable) return false;
        if (filters.auctionable === 'unauctionable' && !isUntradable) return false;
      }

      return true;
    });

    if (!normalizedQuery) {
      return filteredPlayers;
    }

    const searchedPlayers = filteredPlayers.filter(player => {
      const name = normalizeDatabaseSearchValue(player.name);
      const position = normalizeDatabaseSearchValue(player.position);
      const club = normalizeDatabaseSearchValue(player.team || player.club || '');
      const league = normalizeDatabaseSearchValue(player.league);
      const nation = normalizeDatabaseSearchValue(player.nation || player.nation_region || player.nationality || '');
      return name.includes(normalizedQuery) ||
        position.includes(normalizedQuery) ||
        club.includes(normalizedQuery) ||
        league.includes(normalizedQuery) ||
        nation.includes(normalizedQuery);
    });

    return searchedPlayers;
  }

  async function searchPlayersInDatabase(query, append = false) {
    if (!window.apiClient) {
      console.error('[SEARCH] API client not available');
      return;
    }

    try {
      const requestId = ++playerSearchRequestId;
      console.log('[SEARCH] Searching players:', query, 'with filters');

      const activeFilters = getActiveDatabaseFilters();
      const hasActiveFilters = Object.keys(activeFilters).length > 0;

      const applyFilterParams = (params) => {
        const apiRatingMax = 120;
        const ratingMin = Number(state.filters.ratingMin);
        const ratingMax = Number(state.filters.ratingMax);
        if (state.filters.position) params.position = state.filters.position;
        if (Number.isFinite(ratingMin) && ratingMin > 40) params.min_ovr = Math.min(ratingMin, apiRatingMax);
        if (Number.isFinite(ratingMax) && ratingMax < 150) params.max_ovr = Math.min(ratingMax, apiRatingMax);
        if (state.filters.league) params.league = state.filters.league;
        if (state.filters.nation) params.nation = state.filters.nation;
        if (state.filters.skillMoves) params.skill_moves = state.filters.skillMoves;
        if (state.filters.event) params.event = state.filters.event;
        if (state.filters.club) params.team = state.filters.club;
        if (state.filters.priceMin) params.min_price = state.filters.priceMin;
        if (state.filters.priceMax) params.max_price = state.filters.priceMax;
        if (state.filters.auctionable === 'auctionable') params.is_untradable = 0;
        if (state.filters.auctionable === 'unauctionable') params.is_untradable = 1;
      };

      let players = [];
      let total = 0;
      if (hasActiveFilters) {
        const params = {
          limit: 1000,
          offset: 0,
          rank: 0
        };
        applyFilterParams(params);

        const response = await window.apiClient.getPlayers(params);
        players = response.players || [];
        total = response.total || players.length;
      } else {
        const params = {
          q: query,
          limit: 20,
          offset: append ? playerSearchOffset : 0,
          rank: 0
        };
        applyFilterParams(params);

        const response = await window.apiClient.searchPlayers(params);
        players = response.results || [];
        total = response.total || 0;
      }

      players = players.map(player => {
        const resolvedPlayerId = player.player_id || player.playerid || player.id;
        if (!resolvedPlayerId) return player;
        return {
          ...player,
          player_id: resolvedPlayerId,
          playerid: resolvedPlayerId,
          id: resolvedPlayerId
        };
      });
      console.log('[SEARCH] Identifier normalization sample:', players.slice(0, 3).map(p => p.player_id));

      if (requestId !== playerSearchRequestId || query !== currentPlayerSearchQuery) {
        return;
      }

      console.log('[SEARCH] Found', players.length, 'players, total:', total);

      // 🔥 Sync prices with Supabase (same as regular database view)
      if (window.supabaseProvider && typeof window.supabaseProvider.syncPrices === 'function') {
        console.log('[SEARCH] Syncing prices for search results...');
        players = await window.supabaseProvider.syncPrices(players);
      }

      const filteredPlayers = applyDatabaseSearchAndFilters(players, query);
      let playersToDisplay = filteredPlayers;
      if (hasActiveFilters) {
        const pageSize = state.limitPerPage || 20;
        const pageOffset = append ? playerSearchOffset : 0;
        playersToDisplay = filteredPlayers.slice(pageOffset, pageOffset + pageSize);
        total = filteredPlayers.length;
      }

      if (!append) {
        playerSearchOffset = 0;
        playerSearchTotal = total;
      }
      playerSearchOffset += playersToDisplay.length;

      displayPlayerSearchResults(playersToDisplay, query, total, append, activeFilters);

    } catch (error) {
      console.error('[SEARCH] Error:', error);
      showPlayerSearchError(query);
    }
  }

  function displayPlayerSearchResults(players, query, total, append = false, activeFilters = {}) {
    const container = document.getElementById('database-players-container') ||
      document.querySelector('#database-view .players-grid') ||
      document.querySelector('#database-view');

    if (!container) {
      console.error('[SEARCH] Container not found');
      return;
    }

    if (!append) {
      state.searchResults = [...players];
    } else {
      const merged = [...(state.searchResults || []), ...players];
      const seen = new Set();
      state.searchResults = merged.filter(player => {
        const key = getPlayerUniqueId(player);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    console.log('[SEARCH] Cached results for watchlist lookup:', state.searchResults.length);

    if (!append) {
      container.innerHTML = '';

      const resultHeader = document.createElement('div');
      resultHeader.className = 'search-result-header';
      resultHeader.style.cssText = 'grid-column: 1/-1; margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;';
      resultHeader.innerHTML = `
          <p>Found <strong>${total}</strong> player${total !== 1 ? 's' : ''} matching "<strong>${query}</strong>"</p>
      `;
      container.appendChild(resultHeader);
    }

    if (!append && players.length === 0) {
      const hasActiveFilters = Object.keys(activeFilters || {}).length > 0;
      const emptyState = document.createElement('div');
      emptyState.className = 'no-results';
      emptyState.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 60px 20px;';
      emptyState.innerHTML = `
        <svg style="width: 64px; height: 64px; margin: 0 auto 16px; opacity: 0.3;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p style="color: var(--text-primary); font-size: 16px; margin-bottom: 8px;">No players found matching "${query}"</p>
        <p style="color: var(--text-tertiary); font-size: 14px;">${hasActiveFilters ? 'Try adjusting your filters' : 'Try adjusting your search'}</p>
      `;
      container.appendChild(emptyState);
    } else {
      players.forEach(player => {
        const card = createPlayerCard(player);
        container.appendChild(card);
      });
    }

    updateAllWatchlistButtons();

    const oldLoadMore = document.getElementById('player-search-load-more');
    if (oldLoadMore) oldLoadMore.remove();

    if (playerSearchOffset < total) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.id = 'player-search-load-more';
      loadMoreBtn.className = 'search-load-more-btn';
      loadMoreBtn.style.cssText = 'grid-column: 1/-1; margin-top: 20px;';
      loadMoreBtn.innerHTML = `
          <span>Load More</span>
          <span class="load-more-count">${total - playerSearchOffset} remaining</span>
      `;

      loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<span>Loading...</span>';

        try {
          await searchPlayersInDatabase(currentPlayerSearchQuery, true);
        } catch (error) {
          loadMoreBtn.innerHTML = '<span>Error - Try Again</span>';
          loadMoreBtn.disabled = false;
        }
      });

      container.appendChild(loadMoreBtn);
    }
  }

  function showPlayerSearchError(query) {
    const container = document.getElementById('database-players-container') ||
      document.querySelector('#database-view .players-grid') ||
      document.querySelector('#database-view');

    if (container) {
      container.innerHTML = `
        <div class="search-error" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <p style="color: var(--color-status-error); font-size: 16px; margin-bottom: 8px;">Search error</p>
            <p style="color: var(--text-tertiary); font-size: 14px;">Please try again</p>
        </div>
      `;
    }
  }

  // ----------------------------
  // Home Search dropdown (top search box)
  // ----------------------------
  const homeSearch = document.getElementById('home-search');

  // Keyboard navigation for dropdown
  let selectedDropdownIndex = -1;

  if (homeSearch) {
    homeSearch.addEventListener('keydown', (e) => {
      const dropdown = document.getElementById('search-dropdown');
      const resultsContainer = document.getElementById('search-results-dropdown');

      if (!dropdown || !dropdown.classList.contains('active')) return;
      if (!resultsContainer) return;

      const playerRows = resultsContainer.querySelectorAll('.dropdown-player-row');
      if (playerRows.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedDropdownIndex = Math.min(selectedDropdownIndex + 1, playerRows.length - 1);
          updateDropdownHighlight(playerRows);
          break;

        case 'ArrowUp':
          e.preventDefault();
          selectedDropdownIndex = Math.max(selectedDropdownIndex - 1, -1);
          updateDropdownHighlight(playerRows);
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedDropdownIndex >= 0 && selectedDropdownIndex < playerRows.length) {
            playerRows[selectedDropdownIndex].click();
          }
          break;

        case 'Escape':
          dropdown.classList.remove('active');
          homeSearch.blur();
          selectedDropdownIndex = -1;
          break;
      }
    });

    homeSearch.addEventListener('input', () => {
      selectedDropdownIndex = -1;
    });
  }

  function updateDropdownHighlight(playerRows) {
    playerRows.forEach(row => row.classList.remove('dropdown-row-selected'));
    if (selectedDropdownIndex >= 0 && selectedDropdownIndex < playerRows.length) {
      const selectedRow = playerRows[selectedDropdownIndex];
      selectedRow.classList.add('dropdown-row-selected');
      selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  const searchDropdown = document.getElementById('search-dropdown');
  const searchResultsDropdown = document.getElementById('search-results-dropdown');
  let dropdownSearchTimeout;

  if (homeSearch && searchDropdown && searchResultsDropdown) {
    homeSearch.addEventListener('input', async (e) => {
      const searchTerm = e.target.value.trim();

      clearTimeout(dropdownSearchTimeout);

      if (searchTerm.length === 0) {
        searchDropdown.classList.remove('active');
        return;
      }

      if (searchTerm.length < 2) return;

      searchResultsDropdown.innerHTML = `
        <div class="dropdown-loading">
            <div class="dropdown-spinner"></div>
            <p style="color: var(--color-text-muted); font-size: 13px;">Searching...</p>
        </div>
      `;
      searchDropdown.classList.add('active');

      dropdownSearchTimeout = setTimeout(async () => {
        try {
          console.log('[SEARCH] Searching for:', searchTerm);

          const results = await window.apiClient.searchPlayers({
            q: searchTerm,
            limit: 20,
            rank: 0
          });

          const totalFound = results.total || 0;
          console.log('[SEARCH] Found', totalFound, 'players');

          if (totalFound === 0) {
            searchResultsDropdown.innerHTML = `
              <div class="dropdown-no-results">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <p>No players found for "${searchTerm}"</p>
              </div>
            `;
            return;
          }

          searchResultsDropdown.innerHTML = '';

          if (!window.dropdownSearchState) {
            window.dropdownSearchState = { currentQuery: '', displayedCount: 0, totalCount: 0, allResults: [] };
          }

          window.dropdownSearchState.currentQuery = searchTerm;
          window.dropdownSearchState.totalCount = totalFound;
          window.dropdownSearchState.displayedCount = (results.results || []).length;
          window.dropdownSearchState.allResults = results.results || [];

          (results.results || []).forEach(player => {
            const row = createDropdownPlayerRow(player);
            searchResultsDropdown.appendChild(row);
          });

          updateAllWatchlistButtons();

          if (totalFound > 20) {
            addLoadMoreButton(searchResultsDropdown, searchTerm);
          }

        } catch (error) {
          console.error('[SEARCH] Error:', error);
          searchResultsDropdown.innerHTML = `
            <div class="dropdown-no-results">
                <p style="color: var(--color-status-error);">Search error. Please try again.</p>
            </div>
          `;
        }
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!homeSearch.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (searchDropdown) searchDropdown.classList.remove('active');
        if (homeSearch) homeSearch.blur();
      }
    });
  }

  function addLoadMoreButton(container, query) {
    const remaining = window.dropdownSearchState.totalCount - window.dropdownSearchState.displayedCount;
    if (remaining <= 0) return;

    const loadMoreBtn = document.createElement('div');
    loadMoreBtn.className = 'dropdown-load-more';
    loadMoreBtn.id = 'dropdown-load-more-section';
    loadMoreBtn.innerHTML = `
      <button class="dropdown-load-more-btn">
          <span>Load More</span>
          <span class="load-more-count">(${remaining} remaining)</span>
      </button>
    `;

    loadMoreBtn.querySelector('button').addEventListener('click', async function (e) {
      e.stopPropagation();
      const btn = this;
      btn.disabled = true;
      btn.innerHTML = '<span>Loading...</span>';

      try {
        const nextBatch = await window.apiClient.searchPlayers({
          q: query,
          limit: 20,
          offset: window.dropdownSearchState.displayedCount,
          rank: 0
        });

        console.log('[SEARCH] Loaded', (nextBatch.results || []).length, 'more results');
        loadMoreBtn.remove();

        (nextBatch.results || []).forEach(player => {
          const row = createDropdownPlayerRow(player);
          container.appendChild(row);
        });

        window.dropdownSearchState.displayedCount += (nextBatch.results || []).length;
        window.dropdownSearchState.allResults = window.dropdownSearchState.allResults.concat(nextBatch.results || []);

        addLoadMoreButton(container, query);

      } catch (error) {
        console.error('[SEARCH] Load more error:', error);
        btn.innerHTML = '<span>❌ Error - Try Again</span>';
        btn.disabled = false;
      }
    });

    container.appendChild(loadMoreBtn);
  }

  function createDropdownPlayerRow(player) {
    const row = document.createElement('div');
    row.className = 'dropdown-player-row';

    const isAuctionable = player.is_untradable !== 'True' && player.is_untradable !== true;
    const cardBackground = player.card_background || player.cardBackground || player.cardbackground || 'https://via.placeholder.com/120x160';
    const playerImage = player.player_image || player.playerImage || player.playerimage || player.playerimg || '';
    const playerName = player.name || 'Unknown Player';
    const playerOvr = player.ovr || 'N/A';
    const playerPosition = player.position || 'N/A';

    // ========== FIXED: Show price for auctionable cards in search ==========
    const priceDisplay = isAuctionable && player.price
        ? `<div class="dropdown-player-price" style="color: #fbbf24; font-size: 12px; font-weight: 600;">${formatPrice(player.price)}</div>`
        : '';

    row.innerHTML = `
      <div class="dropdown-player-card">
          <div class="squad-custom-mini-card dropdown-mini-card">
            <img src="${cardBackground}" alt="Card Background" class="squad-custom-card-bg" onerror="this.src='https://via.placeholder.com/120x160'">
            ${playerImage ?
              `<img src="${playerImage}" alt="${playerName}" class="squad-custom-card-player-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
               <span class="player-initials" style="display: none;">${getInitials(playerName)}</span>` :
              `<span class="player-initials">${getInitials(playerName)}</span>`
            }
            <div class="squad-custom-card-ovr" style="color: ${player.color_rating || '#FFFFFF'}">${playerOvr}</div>
            <div class="squad-custom-card-position" style="color: ${player.color_position || '#FFFFFF'}">${playerPosition}</div>
            <div class="squad-custom-card-name" style="color: ${player.color_name || '#FFFFFF'}">${playerName}</div>
          </div>
      </div>

      <div class="dropdown-player-info">
          <div class="dropdown-player-name">${playerName}</div>
          <span class="dropdown-player-badge ${isAuctionable ? 'auctionable' : 'non-auctionable'}">
              ${isAuctionable ? '✅ Auctionable' : '🔴 Non-auctionable'}
          </span>
          ${priceDisplay}
      </div>

      <div class="dropdown-player-stats">
          <div class="dropdown-player-ovr">${playerOvr}</div>
          <div class="dropdown-player-position">${playerPosition}</div>
      </div>
    `;

    row.addEventListener('click', () => {
      console.log('[SEARCH] Selected player:', player.name);
      // Store in search results for detail view
      if (!state.searchResults.some(p => p.player_id === player.player_id)) {
          state.searchResults.push(player);
      }
      if (searchDropdown) searchDropdown.classList.remove('active');
      if (homeSearch) homeSearch.value = '';
      // Navigate to player detail
      const pid = player.playerid || player.player_id;
      if (!pid) { console.error('[SEARCH] Missing player ID', player); return; }
      if (window.ZRouter) {
          ZRouter.navigate(`/player/${pid}`);
      } else if (typeof viewPlayerDetail === 'function') {
          viewPlayerDetail(pid);
      }
    });

    return row;

  }

  // Sort dropdown
  const sortBy = document.getElementById('sort-by');
  if (sortBy) {
      sortBy.addEventListener('change', (e) => {
          state.sortBy = e.target.value;
          console.log('[SORT] Changed to:', state.sortBy);
          
          // Reset offset and reload database with new sort
          state.currentOffset = 0;
          
          if (state.currentView === 'database') {
              loadDatabase();
          }
          if (state.currentView === 'watchlist') {
              loadWatchlist();
          }
      });
  }

  // Time filters (market)
  document.querySelectorAll('.time-btn').forEach(btn => {
    // remove previously attached handler (if any)
    btn.removeEventListener('click', btn._zenithTimeHandler);
    btn._zenithTimeHandler = function () {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    };
    btn.addEventListener('click', btn._zenithTimeHandler);
  });

  // ----------------------------
  // Home search (global search input) initialization (small search box)
  // If you also have a `#search-input` small input elsewhere, keep both behaviours
  // ----------------------------
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          if (typeof searchPlayers === 'function') {
            // if you have a separate searchPlayers function, use it
            searchPlayers(query);
          } else if (window.apiClient) {
            // fallback: use dropdown / searchPlayersInDatabase for quick behaviour
            searchPlayersInDatabase(query, false);
          }
        } else {
          // hide or clear UI for small search input
          const dropdown = document.getElementById('search-dropdown');
          if (dropdown) dropdown.classList.remove('active');
        }
      }, 300);
    });
  }

  // -------------------------------
  // Resolve initial view on page load → now handled by ZRouter
  // ZRouter.init() below will read the URL and call switchView correctly
  // -------------------------------

  console.log('%c[Zenith] View init delegated to ZRouter', 'color:#10B981;font-weight:600');

  // ----------------------------
  // Real-time simulation (safe guard: use state.filteredPlayers)
  // ----------------------------
  setInterval(() => {
    if (state.currentView === 'dashboard' && Array.isArray(state.filteredPlayers) && state.filteredPlayers.length > 0) {
      const idx = Math.floor(Math.random() * state.filteredPlayers.length);
      const randomPlayer = state.filteredPlayers[idx];
      const change = (Math.random() - 0.5) * 2;
      randomPlayer.priceChange = parseFloat(((randomPlayer.priceChange || 0) + change).toFixed(1));
    }
  }, 5000);

  console.log('%c[Zenith] APP Initialization complete', 'color:#10B981;font-weight:600');
  updateAllWatchlistButtons();

  // ── ROUTER: Must be LAST (all functions defined above) ──────────
  if (window.ZRouter) {
    console.log('%c[Zenith] Starting ZRouter...', 'color:#10B981;font-weight:600');
    ZRouter.init();
  } else {
    console.error('[Zenith] ZRouter not found on window! Did router.js load before app.js in index.html?');
    // Safe fallback: load dashboard manually
    switchView(localStorage.getItem('currentView') || 'dashboard');
  }
});




// MOBILE FILTER FUNCTIONS
function getActiveViewName() {
  const activeView = document.querySelector('.view.active');
  if (activeView && activeView.id) {
    return activeView.id.replace('-view', '');
  }
  if (typeof state !== 'undefined' && state.currentView) {
    return state.currentView;
  }
  return '';
}

function toggleMobileFilters() {
  const modal = document.getElementById('mobile-filter-modal');
  if (modal) {
    modal.classList.toggle('active');

    if (modal.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      const activeView = getActiveViewName();
      if (activeView === 'database') {
        syncMobileClubFilterOptions();
      }
    } else {
      document.body.style.overflow = '';
    }
  }
}

function syncMobileClubFilterOptions() {
  const source = document.getElementById('filter-club');
  const target = document.getElementById('mobile-filter-team');
  if (!source || !target) return;
  if (target.dataset.synced === 'true') return;
  if (target.options.length > 1) {
    target.dataset.synced = 'true';
    return;
  }

  const fragment = document.createDocumentFragment();
  Array.from(source.options).forEach(option => {
    const cloned = option.cloneNode(true);
    fragment.appendChild(cloned);
  });

  target.innerHTML = '';
  target.appendChild(fragment);
  target.dataset.synced = 'true';
}

function applyMobileFilters() {
  const position = document.getElementById('mobile-filter-position')?.value || '';
  const ratingMin = parseInt(document.getElementById('mobile-rating-min')?.value, 10) || 40;
  const ratingMax = parseInt(document.getElementById('mobile-rating-max')?.value, 10) || 150;
  const priceMin = document.getElementById('mobile-price-min')?.value || '';
  const priceMax = document.getElementById('mobile-price-max')?.value || '';
  const league = document.getElementById('mobile-filter-league')?.value || '';
  const nation = document.getElementById('mobile-filter-nation')?.value || '';
  const skill = document.getElementById('mobile-filter-skill')?.value || '';
  const event = document.getElementById('mobile-filter-event')?.value || '';
  const sortBy = document.getElementById('mobile-sort-by')?.value || '';
  const teamElement = document.getElementById('mobile-filter-team');
  const team = teamElement ? teamElement.value : null;
  const auctionableStatus = document.getElementById('mobile-filter-auctionable')?.value || '';

  const activeView = getActiveViewName();
  if (activeView === 'watchlist') {
    if (typeof watchlistFilters !== 'undefined') {
      watchlistFilters.position = position;
      watchlistFilters.league = league;
      if (team !== null) {
        watchlistFilters.team = team;
      }
      watchlistFilters.nation = nation;
      watchlistFilters.event = event;
      watchlistFilters.skill_moves = skill;
      watchlistFilters.minOvr = ratingMin;
      watchlistFilters.maxOvr = ratingMax;
    }

    const watchlistMap = {
      'watchlist-filter-position': position,
      'watchlist-filter-league': league,
      'watchlist-filter-team': team,
      'watchlist-filter-nation': nation,
      'watchlist-filter-event': event,
      'watchlist-rating-min': ratingMin,
      'watchlist-rating-max': ratingMax
    };

    Object.keys(watchlistMap).forEach(id => {
      if (watchlistMap[id] === null) return;
      const el = document.getElementById(id);
      if (el !== null && el !== undefined) {
        el.value = watchlistMap[id];
      }
    });

    if (typeof applyWatchlistFilters === 'function') {
      applyWatchlistFilters();
    }

    if (sortBy) {
      const watchlistSort = document.getElementById('watchlist-sort-select');
      if (watchlistSort) {
        const sortMap = { name: 'Name', rating: 'Rating', price: 'Price' };
        watchlistSort.value = sortMap[sortBy] || sortBy;
        watchlistSort.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (typeof updateWatchlistFilterBadge === 'function') {
      updateWatchlistFilterBadge();
    }

    toggleMobileFilters();
    return;
  }

  if (typeof state !== 'undefined') {
    state.filters.position = position;
    state.filters.ratingMin = ratingMin;
    state.filters.ratingMax = ratingMax;
    state.filters.priceMin = priceMin === '' ? null : parseInt(priceMin, 10);
    state.filters.priceMax = priceMax === '' ? null : parseInt(priceMax, 10);
    state.filters.league = league;
    state.filters.club = team || '';
    state.filters.nation = nation;
    state.filters.skillMoves = skill;
    state.filters.event = event;
    state.filters.auctionable = auctionableStatus;
    if (sortBy) {
      state.sortBy = sortBy;
    }
    state.currentOffset = 0;
  }

  if (document.getElementById('filter-position'))
    document.getElementById('filter-position').value = position;
  if (document.getElementById('rating-min'))
    document.getElementById('rating-min').value = ratingMin;
  if (document.getElementById('rating-max'))
    document.getElementById('rating-max').value = ratingMax;
  if (document.getElementById('price-min'))
    document.getElementById('price-min').value = priceMin;
  if (document.getElementById('price-max'))
    document.getElementById('price-max').value = priceMax;
  if (document.getElementById('filter-league'))
    document.getElementById('filter-league').value = league;
  if (document.getElementById('filter-club'))
    document.getElementById('filter-club').value = team;
  if (document.getElementById('filter-nation'))
    document.getElementById('filter-nation').value = nation;
  if (document.getElementById('filter-skill'))
    document.getElementById('filter-skill').value = skill;

  if (document.getElementById('filter-event')) document.getElementById('filter-event').value = event;

  if (document.getElementById('sort-by'))
    document.getElementById('sort-by').value = sortBy;

  const auctionableToggle = document.getElementById('auctionable-toggle');
  const auctionStatusText = document.getElementById('auction-status-text');
  if (auctionableToggle) {
    if (auctionableStatus === 'auctionable') {
      auctionableToggle.checked = true;
      if (auctionStatusText) auctionStatusText.textContent = 'Only With Prices';
    } else {
      auctionableToggle.checked = false;
      if (auctionStatusText) {
        auctionStatusText.textContent = auctionableStatus === 'unauctionable'
          ? 'Non-auctionable Only'
          : 'All Players';
      }
    }
  }

  updateRatingDisplay();
  updatePriceDisplay();
  updateFilterBadge();
  toggleMobileFilters();

  if (typeof loadDatabase === 'function') {
    loadDatabase();
  }
}

function clearMobileFilters() {
  const activeView = getActiveViewName();
  if (activeView === 'watchlist') {
    if (typeof clearWatchlistFilters === 'function') {
      clearWatchlistFilters();
    }

    if (typeof updateWatchlistFilterBadge === 'function') {
      updateWatchlistFilterBadge();
    }

    return;
  }

  if (document.getElementById('mobile-filter-position'))
    document.getElementById('mobile-filter-position').value = '';
  if (document.getElementById('mobile-rating-min'))
    document.getElementById('mobile-rating-min').value = 40;
  if (document.getElementById('mobile-rating-max'))
    document.getElementById('mobile-rating-max').value = 150;
  if (document.getElementById('mobile-price-min'))
    document.getElementById('mobile-price-min').value = '';
  if (document.getElementById('mobile-price-max'))
    document.getElementById('mobile-price-max').value = '';
  if (document.getElementById('mobile-filter-league'))
    document.getElementById('mobile-filter-league').value = '';
  if (document.getElementById('mobile-filter-team'))
    document.getElementById('mobile-filter-team').value = '';
  if (document.getElementById('mobile-filter-nation'))
    document.getElementById('mobile-filter-nation').value = '';
  if (document.getElementById('mobile-filter-skill'))
    document.getElementById('mobile-filter-skill').value = '';

  if (document.getElementById('mobile-filter-event')) document.getElementById('mobile-filter-event').value = '';

  if (document.getElementById('mobile-filter-auctionable'))
    document.getElementById('mobile-filter-auctionable').value = '';

  if (document.getElementById('mobile-sort-by'))
    document.getElementById('mobile-sort-by').value = 'name';

  if (document.getElementById('filter-position'))
    document.getElementById('filter-position').value = '';
  if (document.getElementById('rating-min'))
    document.getElementById('rating-min').value = 40;
  if (document.getElementById('rating-max'))
    document.getElementById('rating-max').value = 150;
  if (document.getElementById('price-min'))
    document.getElementById('price-min').value = '';
  if (document.getElementById('price-max'))
    document.getElementById('price-max').value = '';
  if (document.getElementById('filter-league'))
    document.getElementById('filter-league').value = '';
  if (document.getElementById('filter-club'))
    document.getElementById('filter-club').value = '';
  if (document.getElementById('filter-nation'))
    document.getElementById('filter-nation').value = '';
  if (document.getElementById('filter-skill'))
    document.getElementById('filter-skill').value = '';
  if (document.getElementById('sort-by'))
    document.getElementById('sort-by').value = 'name';

  const auctionableToggle = document.getElementById('auctionable-toggle');
  const auctionStatusText = document.getElementById('auction-status-text');
  if (auctionableToggle) {
    auctionableToggle.checked = false;
    if (auctionStatusText) auctionStatusText.textContent = 'All Players';
  }

  if (typeof state !== 'undefined') {
    state.filters.position = '';
    state.filters.ratingMin = 40;
    state.filters.ratingMax = 150;
    state.filters.priceMin = null;
    state.filters.priceMax = null;
    state.filters.league = '';
    state.filters.club = '';
    state.filters.nation = '';
    state.filters.skillMoves = '';
    state.filters.event = '';
    state.filters.auctionable = '';
    state.sortBy = 'name';
    state.currentOffset = 0;
  }

  updateRatingDisplay();
  updatePriceDisplay();
  updateFilterBadge();

  if (typeof loadDatabase === 'function') {
    loadDatabase();
  }
}

function updateFilterBadge() {
  const badge = document.getElementById('filter-badge');
  if (!badge) return;

  const position = document.getElementById('mobile-filter-position')?.value || '';
  const ratingMin = document.getElementById('mobile-rating-min')?.value || 40;
  const ratingMax = document.getElementById('mobile-rating-max')?.value || 150;
  const priceMin = document.getElementById('mobile-price-min')?.value || '';
  const priceMax = document.getElementById('mobile-price-max')?.value || '';
  const league = document.getElementById('mobile-filter-league')?.value || '';
  const team = document.getElementById('mobile-filter-team')?.value || '';
  const nation = document.getElementById('mobile-filter-nation')?.value || '';
  const skill = document.getElementById('mobile-filter-skill')?.value || '';
  const event = document.getElementById('mobile-filter-event')?.value || '';
  const auctionableStatus = document.getElementById('mobile-filter-auctionable')?.value || '';

  const hasActiveFilters = position ||
    ratingMin != 40 ||
    ratingMax != 150 ||
    priceMin ||
    priceMax ||
    league ||
    team ||
    nation ||
    skill ||
    event ||
    auctionableStatus;

  badge.style.display = hasActiveFilters ? 'block' : 'none';
}

function updateWatchlistFilterBadge() {
  const badge = document.getElementById('watchlist-filter-badge');
  if (!badge) return;

  const wl = (typeof watchlistFilters !== 'undefined') ? watchlistFilters : null;

  const position = wl ? wl.position : (document.getElementById('mobile-filter-position')?.value || '');
  const league = wl ? wl.league : (document.getElementById('mobile-filter-league')?.value || '');
  const team = wl ? wl.team : (document.getElementById('mobile-filter-team')?.value || '');
  const nation = wl ? wl.nation : (document.getElementById('mobile-filter-nation')?.value || '');
  const event = wl ? wl.event : (document.getElementById('mobile-filter-event')?.value || '');
  const skill = wl ? wl.skill_moves : (document.getElementById('mobile-filter-skill')?.value || '');
  const minOvr = wl ? wl.minOvr : (parseInt(document.getElementById('mobile-rating-min')?.value, 10) || 40);
  const maxOvr = wl ? wl.maxOvr : (parseInt(document.getElementById('mobile-rating-max')?.value, 10) || 150);

  const hasActiveFilters = position ||
    league ||
    team ||
    nation ||
    event ||
    skill ||
    minOvr !== 40 ||
    maxOvr !== 150;

  badge.style.display = hasActiveFilters ? 'block' : 'none';
}

function handleSearch(value) {
  const searchTerm = (value || '').trim();
  state.searchQuery = searchTerm;
  state.currentOffset = 0;
  if (typeof loadDatabase === 'function') {
    loadDatabase();
  }
}



// ==================== PLAYER COMPARISON TOOL ====================

// Comparison State
const ComparePlayersCustomizationState = {
  byPlayer: {},
  recalcTokens: {}
};

const compareState = {
  selectedPlayers: [],
  currentSlot: null,
  isBasicView: true,
  positionMode: null, // 'outfield' or 'gk'
  customizations: ComparePlayersCustomizationState.byPlayer,
  recalcTokens: ComparePlayersCustomizationState.recalcTokens
};

const compareDebugEnabled = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.search.includes('debug=true')
);

const compareLog = (message, payload) => {
  if (!compareDebugEnabled) return;
  if (payload !== undefined) {
    console.log(`[COMPARE] ${message}`, payload);
  } else {
    console.log(`[COMPARE] ${message}`);
  }
};

const compareCustomizationContext = {
  active: false,
  playerId: null,
  index: null,
  backup: null,
  requestId: 0,
  modalLabels: {},
  applied: false,
  hasPreview: false,
  skipRestore: false,
  initialPlayer: null,
  lastSnapshot: null
};

let compareSelectedRank = 0;
let compareTrainingLevel = 0;
let compareSkillBoost = {};

const compareCustomizationState = {
  playerId: null,
  selectedRank: 0,
  trainingLevel: 0,
  selectedSkills: [],
  baseOvr: null,
  basePosition: null,
  baseName: null,
  baseColors: null,
  player: null
};

function resetCompareCustomizationState() {
  ComparePlayersCustomizationState.byPlayer = {};
  ComparePlayersCustomizationState.recalcTokens = {};
  compareState.customizations = ComparePlayersCustomizationState.byPlayer;
  compareState.recalcTokens = ComparePlayersCustomizationState.recalcTokens;
  compareCustomizationState.playerId = null;
  compareCustomizationState.selectedRank = 0;
  compareCustomizationState.trainingLevel = 0;
  compareCustomizationState.selectedSkills = [];
  compareCustomizationState.baseOvr = null;
  compareCustomizationState.basePosition = null;
  compareCustomizationState.baseName = null;
  compareCustomizationState.baseColors = null;
  compareCustomizationState.player = null;
  compareSelectedRank = 0;
  compareTrainingLevel = 0;
  compareSkillBoost = {};
}

function ensureCompareCustomizationModalRoot() {
  const modal = document.getElementById('squad-player-customization-modal');
  if (!modal) return;
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
}

const resolveComparePlayerId = (playerOrId) => {
  if (!playerOrId) return null;
  if (typeof playerOrId === 'object') {
    return playerOrId.player_id || playerOrId.id || playerOrId.playerid || null;
  }
  return playerOrId;
};

const resolveComparePlayerLabel = (player, index) => {
  const name = player?.name || player?.player_name || '';
  return name ? name : `Player ${index + 1}`;
};

// Stats Configuration
const STATS_CONFIG = {
  outfield: {
    basic: [
      { name: 'Pace', apiField: 'pace' },
      { name: 'Shooting', apiField: 'shooting' },
      { name: 'Passing', apiField: 'passing' },
      { name: 'Dribbling', apiField: 'dribbling' },
      { name: 'Defending', apiField: 'defending' },
      { name: 'Physical', apiField: 'physical' },
    ],
    advanced: {
      'Pace': [
        { name: 'Acceleration', apiField: 'acceleration' },
        { name: 'Sprint Speed', apiField: 'sprint_speed' },
      ],
      'Shooting': [
        { name: 'Finishing', apiField: 'finishing' },
        { name: 'Long Shot', apiField: 'long_shot' },
        { name: 'Shot Power', apiField: 'shot_power' },
        { name: 'Positioning', apiField: 'positioning' },
        { name: 'Volley', apiField: 'volley' },
        { name: 'Penalties', apiField: 'penalties' },
      ],
      'Passing': [
        { name: 'Short Passing', apiField: 'short_passing' },
        { name: 'Long Passing', apiField: 'long_passing' },
        { name: 'Vision', apiField: 'vision' },
        { name: 'Crossing', apiField: 'crossing' },
        { name: 'Curve', apiField: 'curve' },
        { name: 'Free Kick', apiField: 'free_kick' },
      ],
      'Dribbling': [
        { name: 'Dribbling', apiField: 'dribbling' },
        { name: 'Balance', apiField: 'balance' },
        { name: 'Agility', apiField: 'agility' },
        { name: 'Reactions', apiField: 'reactions' },
        { name: 'Ball Control', apiField: 'ball_control' },
      ],
      'Defending': [
        { name: 'Marking', apiField: 'marking' },
        { name: 'Standing Tackle', apiField: 'standing_tackle' },
        { name: 'Sliding Tackle', apiField: 'sliding_tackle' },
        { name: 'Awareness', apiField: 'awareness' },
        { name: 'Heading', apiField: 'heading' },
      ],
      'Physical': [
        { name: 'Strength', apiField: 'strength' },
        { name: 'Aggression', apiField: 'aggression' },
        { name: 'Jumping', apiField: 'jumping' },
        { name: 'Stamina', apiField: 'stamina_stat' },
      ],
    }
  },
  gk: {
    basic: [
      { name: 'Diving', apiField: 'gk_diving' },
      { name: 'Positioning', apiField: 'gk_positioning' },
      { name: 'Handling', apiField: 'gk_handling' },
      { name: 'Reflexes', apiField: 'gk_reflexes' },
      { name: 'Kicking', apiField: 'gk_kicking' },
      { name: 'Physical', apiField: 'physical' },
    ],
    advanced: {
      'Diving': [
        { name: 'GK Diving', apiField: 'gk_diving' },
      ],
      'Positioning': [
        { name: 'GK Positioning', apiField: 'gk_positioning' },
      ],
      'Handling': [
        { name: 'GK Handling', apiField: 'gk_handling' },
      ],
      'Reflexes': [
        { name: 'GK Reflexes', apiField: 'gk_reflexes' },
        { name: 'Jumping', apiField: 'jumping' },
      ],
      'Kicking': [
        { name: 'GK Kicking', apiField: 'gk_kicking' },
        { name: 'Long Passing', apiField: 'long_passing' },
      ],
      'Physical': [
        { name: 'Reactions', apiField: 'reactions' },
        { name: 'Agility', apiField: 'agility' },
        { name: 'Sprint Speed', apiField: 'sprint_speed' },
        { name: 'Strength', apiField: 'strength' },
      ],
    }
  }
};

const normalizeCompareKey = (value) => String(value || '').toLowerCase().replace(/_/g, '');

const getCompareCustomization = (playerId) => {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return null;
  return compareState.customizations[resolvedId] || null;
};

const setCompareCustomization = (playerId, updates = {}) => {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const current = compareState.customizations[resolvedId] || {};
  compareState.customizations[resolvedId] = { ...current, ...updates };
};

const clearCompareCustomization = (playerId) => {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  delete compareState.customizations[resolvedId];
  delete compareState.recalcTokens[resolvedId];
};

const getCompareBaseStat = (player, ...names) => {
  if (typeof window.getStat === 'function') {
    return window.getStat(player, ...names);
  }
  for (const name of names) {
    if (player?.[name] !== undefined && player?.[name] !== null) return player[name];
  }
  return 0;
};

const getCompareBoostValue = (boosts, ...names) => {
  if (!boosts) return 0;
  const entries = Object.entries(boosts);
  for (const name of names) {
    const normalized = normalizeCompareKey(name);
    const match = entries.find(([key]) => normalizeCompareKey(key) === normalized);
    if (match) {
      const value = Number(match[1]);
      return Number.isFinite(value) ? value : 0;
    }
  }
  return 0;
};

const getCompareBoostedStat = (player, boosts, ...names) => {
  const base = Number(getCompareBaseStat(player, ...names)) || 0;
  const boost = getCompareBoostValue(boosts, ...names);
  const value = base + boost;
  return Number.isFinite(value) ? value : 0;
};

const roundCompareValue = (val) => Math.floor(val + 0.5);

const calculateComparePace = (player, boosts) => {
  const acceleration = getCompareBoostedStat(player, boosts, 'acceleration');
  const sprintSpeed = getCompareBoostedStat(player, boosts, 'sprint_speed');
  const val = (
    0.49299585008602 * acceleration +
    0.50528383239125 * sprintSpeed +
    -0.13701200270336
  );
  return roundCompareValue(val);
};

const calculateCompareShooting = (player, boosts) => {
  const finishing = getCompareBoostedStat(player, boosts, 'finishing');
  const longShot = getCompareBoostedStat(player, boosts, 'long_shot', 'long_shots');
  const shotPower = getCompareBoostedStat(player, boosts, 'shot_power');
  const positioning = getCompareBoostedStat(player, boosts, 'positioning');
  const volley = getCompareBoostedStat(player, boosts, 'volley', 'volleys');
  const penalties = getCompareBoostedStat(player, boosts, 'penalties');
  const val = (
    0.35066661652365 * finishing +
    0.20012280256486 * longShot +
    0.19946956407192 * shotPower +
    0.15019769557113 * positioning +
    0.04977322484935 * volley +
    0.04962618730771 * penalties +
    -0.46621901229077
  );
  return roundCompareValue(val);
};

const calculateComparePassing = (player, boosts) => {
  const shortPassing = getCompareBoostedStat(player, boosts, 'short_passing');
  const longPassing = getCompareBoostedStat(player, boosts, 'long_passing');
  const vision = getCompareBoostedStat(player, boosts, 'vision');
  const crossing = getCompareBoostedStat(player, boosts, 'crossing');
  const curve = getCompareBoostedStat(player, boosts, 'curve');
  const freeKick = getCompareBoostedStat(player, boosts, 'free_kick', 'fk_accuracy');
  const val = (
    0.30073301682698 * shortPassing +
    0.19979430277541 * longPassing +
    0.24897437527999 * vision +
    0.15031023108744 * crossing +
    0.05004649307871 * curve +
    0.05012756181062 * freeKick +
    -0.48084074176376
  );
  return roundCompareValue(val);
};

const calculateCompareDribbling = (player, boosts) => {
  const dribbling = getCompareBoostedStat(player, boosts, 'dribbling');
  const balance = getCompareBoostedStat(player, boosts, 'balance');
  const agility = getCompareBoostedStat(player, boosts, 'agility');
  const reactions = getCompareBoostedStat(player, boosts, 'reactions');
  const ballControl = getCompareBoostedStat(player, boosts, 'ball_control');
  const val = (
    0.25044329239850 * dribbling +
    0.10001066600723 * balance +
    0.25025392646353 * agility +
    0.15074674532686 * reactions +
    0.24872793523704 * ballControl +
    -0.48832284057254
  );
  return roundCompareValue(val);
};

const calculateCompareDefending = (player, boosts) => {
  const marking = getCompareBoostedStat(player, boosts, 'marking');
  const standingTackle = getCompareBoostedStat(player, boosts, 'standing_tackle');
  const slidingTackle = getCompareBoostedStat(player, boosts, 'sliding_tackle');
  const awareness = getCompareBoostedStat(player, boosts, 'awareness', 'interceptions');
  const heading = getCompareBoostedStat(player, boosts, 'heading');
  const val = (
    0.25029448767320 * marking +
    0.20107682619015 * standingTackle +
    0.19924427638513 * slidingTackle +
    0.19952899013166 * awareness +
    0.15010172584902 * heading +
    -0.49709228500345
  );
  return roundCompareValue(val);
};

const calculateComparePhysical = (player, boosts) => {
  const strength = getCompareBoostedStat(player, boosts, 'strength');
  const aggression = getCompareBoostedStat(player, boosts, 'aggression');
  const jumping = getCompareBoostedStat(player, boosts, 'jumping');
  const stamina = getCompareBoostedStat(player, boosts, 'stamina_stat', 'stamina');
  const val = (
    0.44955969076149 * strength +
    0.29976663944687 * aggression +
    0.25058507302003 * jumping +
    0.00061181921524 * stamina +
    -0.50936016832054
  );
  return roundCompareValue(val);
};

const calculateCompareGKPhysical = (player, boosts) => {
  const reactions = getCompareBoostedStat(player, boosts, 'reactions');
  const agility = getCompareBoostedStat(player, boosts, 'agility');
  const sprintSpeed = getCompareBoostedStat(player, boosts, 'sprint_speed');
  const strength = getCompareBoostedStat(player, boosts, 'strength');
  const val = (
    0.64960512284621 * reactions +
    0.15093757174982 * agility +
    0.09981357061375 * sprintSpeed +
    0.09995255942967 * strength +
    -0.48764601442207
  );
  return roundCompareValue(val);
};

const getCompareStatValue = (player, stat) => {
  if (!player || !stat) return 0;
  const boosts = player.compare_boosts || player.training_boosts || null;
  switch (stat.apiField) {
    case 'pace':
      return calculateComparePace(player, boosts);
    case 'shooting':
      return calculateCompareShooting(player, boosts);
    case 'passing':
      return calculateComparePassing(player, boosts);
    case 'dribbling':
      return calculateCompareDribbling(player, boosts);
    case 'defending':
      return calculateCompareDefending(player, boosts);
    case 'physical':
      return compareState.positionMode === 'gk' || player.position === 'GK'
        ? calculateCompareGKPhysical(player, boosts)
        : calculateComparePhysical(player, boosts);
    case 'gk_diving':
      return getCompareBoostedStat(player, boosts, 'gk_diving', 'diving');
    case 'gk_positioning':
      return getCompareBoostedStat(player, boosts, 'gk_positioning', 'positioning');
    case 'gk_handling':
      return getCompareBoostedStat(player, boosts, 'gk_handling', 'handling');
    case 'gk_reflexes':
      return getCompareBoostedStat(player, boosts, 'gk_reflexes', 'reflexes');
    case 'gk_kicking':
      return getCompareBoostedStat(player, boosts, 'gk_kicking', 'kicking');
    case 'long_shot':
      return Math.round(getCompareBoostedStat(player, boosts, 'long_shot', 'long_shots'));
    case 'free_kick':
      return Math.round(getCompareBoostedStat(player, boosts, 'free_kick', 'fk_accuracy'));
    case 'stamina_stat':
      return Math.round(getCompareBoostedStat(player, boosts, 'stamina_stat', 'stamina'));
    case 'awareness':
      return Math.round(getCompareBoostedStat(player, boosts, 'awareness', 'interceptions'));
    default:
      return Math.round(getCompareBoostedStat(player, boosts, stat.apiField));
  }
};

// Open Compare Modal
function openCompareModal() {
  const modal = document.getElementById('compare-players-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    compareState.selectedPlayers = [];
    compareState.isBasicView = true;
    compareState.positionMode = null;
    resetCompareCustomizationState();
    compareState.currentSlot = null;
    compareCustomizationContext.active = false;
    compareCustomizationContext.playerId = null;
    compareCustomizationContext.index = null;
    compareCustomizationContext.backup = null;
    compareCustomizationContext.modalLabels = {};
    compareCustomizationContext.applied = false;
    compareCustomizationContext.hasPreview = false;
    compareCustomizationContext.skipRestore = false;
    compareCustomizationContext.initialPlayer = null;
    compareCustomizationContext.lastSnapshot = null;

    document.getElementById('basic-stats-btn')?.classList.add('active');
    document.getElementById('advanced-stats-btn')?.classList.remove('active');

    renderCompareCards();
    updateCompareCountBadge();
    generateCompareStatsGrid();
    compareLog('Modal opened');
  }
}

// Close Compare Modal
function closeCompareModal() {
  const modal = document.getElementById('compare-players-modal');
  if (!modal) return;
  if (compareCustomizationContext.active && typeof window.closePlayerCustomizationModal === 'function') {
    window.closePlayerCustomizationModal();
  }
  const content = modal.querySelector('.compare-modal');
  if (content) content.classList.add('closing');
  setTimeout(() => {
    modal.style.display = 'none';
    if (content) content.classList.remove('closing');
    document.body.style.overflow = 'auto';
  }, 300);
}

// Render Player Cards
function renderCompareCards() {
  const grid = document.getElementById('compare-cards-grid');
  if (!grid) return;

  grid.innerHTML = '';

  compareState.selectedPlayers.forEach((player) => {
    const card = createFilledPlayerCard(player);
    grid.appendChild(card);
  });

  if (compareState.selectedPlayers.length < 5) {
    const emptyCard = createEmptyPlayerCard(compareState.selectedPlayers.length);
    grid.appendChild(emptyCard);
  }
}

function refreshCompareEmptyCard() {
  const grid = document.getElementById('compare-cards-grid');
  if (!grid) return;

  grid.querySelectorAll('.compare-player-card.empty-state').forEach(card => card.remove());

  if (compareState.selectedPlayers.length < 5) {
    const emptyCard = createEmptyPlayerCard(compareState.selectedPlayers.length);
    grid.appendChild(emptyCard);
  }
}

function appendComparePlayerCard(player) {
  const grid = document.getElementById('compare-cards-grid');
  if (!grid) return;

  const card = createFilledPlayerCard(player);
  grid.appendChild(card);
  refreshCompareEmptyCard();

  const playerId = resolveComparePlayerId(player);
  console.log("[ComparePlayers] Rendering card:", playerId);
  console.log("[ComparePlayers] Existing cards unchanged");
}

function updateCompareCardForPlayer(playerId) {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index < 0) return;
  const player = compareState.selectedPlayers[index];
  const card = document.querySelector(
    `.compare-player-card.filled-state[data-player-id="${resolvedId}"]`
  );
  if (!card) {
    renderCompareCards();
    return;
  }
  const ovrEl = card.querySelector('.compare-card-ovr');
  if (ovrEl) {
    const customization = getCompareCustomization(resolvedId);
    const baseColor = customization?.baseColors?.color_rating || player.color_rating || '#FFB86B';
    const customizationBaseOvr = Number.parseInt(customization?.baseOvr, 10);
    const fallbackBaseOvr = Number.parseInt(player.base_ovr, 10);
    const baseOvr = Number.isFinite(customizationBaseOvr)
      ? customizationBaseOvr
      : (Number.isFinite(fallbackBaseOvr) ? fallbackBaseOvr : Number.parseInt(player.ovr, 10) || 0);
    const parsedRank = Number.parseInt(customization?.selectedRank, 10);
    const fallbackRank = Number.parseInt(player.rank || 0, 10);
    const rawRank = Number.isFinite(parsedRank) ? parsedRank : (Number.isFinite(fallbackRank) ? fallbackRank : 0);
    const rankBonus = typeof getSquadRankOvrBonus === 'function'
      ? getSquadRankOvrBonus(rawRank)
      : rawRank;
    const finalOvr = Number(player.ovr || player.overall || 0);
    console.log('[ComparePlayers] Base OVR:', baseOvr);
    console.log('[ComparePlayers] Rank Bonus:', rankBonus);
    console.log('[ComparePlayers] Final OVR Rendered:', finalOvr);
    ovrEl.textContent = finalOvr > 0 ? finalOvr : 'NA';
    ovrEl.style.color = baseColor;
    console.log('[ComparePlayers] OVR color locked to base card color');
  }
}

function updateCompareCardRankOverlay(playerId, rankValue) {
  if (typeof applyRankOverlay !== 'function') return;
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const card = document.querySelector(
    `.compare-player-card.filled-state[data-player-id="${resolvedId}"]`
  );
  if (!card) return;
  applyRankOverlay(card, rankValue, {
    scope: 'compare',
    modifierClass: 'rank-overlay--compare-applied'
  });
}

function createEmptyPlayerCard(slotIndex) {
  const card = document.createElement('div');
  card.className = 'compare-player-card empty-state';
  card.onclick = () => openCompareSearch(slotIndex);
  card.innerHTML = `
    <div class="empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    </div>
    <p class="empty-text">Add Player ${slotIndex + 1}</p>
  `;
  return card;
}

function openCompareCustomizationById(playerId) {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index < 0) return;
  openCompareCustomization(compareState.selectedPlayers[index], index);
}

function createFilledPlayerCard(player) {
  const card = document.createElement('div');
  card.className = 'compare-player-card filled-state new-card';
  const playerId = resolveComparePlayerId(player);
  const customization = getCompareCustomization(playerId);
  const baseOvrColor = customization?.baseColors?.color_rating || player.color_rating || '#FFB86B';
  const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
  const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
  const untradableBadgeHTML = isUntradable
    ? `<div class="card-untradable-badge" style="right: 40px; pointer-events: none;">
         <img src="assets/images/untradable_img.png" alt="Untradable">
       </div>`
    : '';
  card.dataset.playerId = playerId || '';
  card.addEventListener('click', () => openCompareCustomizationById(playerId));

  const playerName = player?.name || 'Unknown Player';
  card.innerHTML = `
    <!-- Remove Button (X) -->
    <button class="player-remove-btn" type="button">×</button>
    
    <!-- FIFA Card Container -->
    ${player.card_background ? `
    <img src="${player.card_background}" 
        alt="Card Background" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
        onerror="this.style.display='none'">
    ` : ''}
      
    <!-- Player Image -->
    ${player.player_image ? `
        <img src="${player.player_image}" 
            alt="${playerName}"
            style="position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); width: 110%; height: 110%; object-fit: contain;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <span class="player-initials" style="display:none">${getInitials(playerName)}</span>
    ` : `
        <span class="player-initials">${getInitials(playerName)}</span>
    `}
      
    <!-- OVR -->
    <div class="compare-card-ovr" style="color: ${baseOvrColor}">
      ${player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
    </div>
      
    <!-- Position -->
    <div class="compare-card-pos" style="color: ${player.color_position || '#FFFFFF'}">
      ${player.position || 'NA'}
    </div>
      
    <!-- Player Name -->
    <div class="compare-card-name" style="color: ${player.color_name || '#FFFFFF'}">
      ${playerName}
    </div>
      
    ${player.nation_flag 
      ? `<img class="compare-nation-flag ${getPlayerType(player) === 'normal' 
          ? 'normal-nation-flag' 
          : 'hero-icon-nation-flag'}" 
          src="${player.nation_flag}" 
          alt="Nation" 
          onerror="this.style.display='none'">` 
      : ''}

    ${player.club_flag 
      ? `<img class="compare-club-flag ${getPlayerType(player) === 'normal' 
          ? 'normal-club-flag' 
          : 'hero-icon-club-flag'}" 
          src="${player.club_flag}" 
          alt="Club" 
          onerror="this.style.display='none'">` 
      : ''}
    
    ${player.league_image && getPlayerType(player) === 'normal'
      ? `<img class="compare-league-flag normal-league-flag"
              src="${player.league_image}"
              alt="League"
              onerror="this.style.display='none'">`
      : ''}

    ${untradableBadgeHTML}

    <!-- Team Name Below -->
    <p class="compare-team-text">${player.team || 'N/A'}</p>
  `;

  const removeBtn = card.querySelector('.player-remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      removeComparePlayerById(playerId);
    });
  }
  if (typeof applyRankOverlay === 'function') {
    const customization = getCompareCustomization(playerId);
    const rankValue = customization?.selectedRank ?? player?.rank ?? 0;
    applyRankOverlay(card, rankValue, {
      scope: 'compare',
      modifierClass: 'rank-overlay--compare-applied'
    });
  }
  return card;
}

function removeComparePlayer(index) {
  const removedPlayer = compareState.selectedPlayers[index];
  const removedId = resolveComparePlayerId(removedPlayer);
  if (removedId) {
    clearCompareCustomization(removedId);
  }
  const removedCard = removedId
    ? document.querySelector(`.compare-player-card.filled-state[data-player-id="${removedId}"]`)
    : document.querySelectorAll('.compare-player-card.filled-state')[index];
  if (removedCard) {
    removedCard.classList.add('removing');
  }
  setTimeout(() => {
    compareState.selectedPlayers.splice(index, 1);
    if (compareState.selectedPlayers.length === 0) {
      compareState.positionMode = null;
    }
    if (removedId && compareCustomizationContext.active && compareCustomizationContext.playerId === removedId) {
      window.closePlayerCustomizationModal?.();
    }
    if (removedCard && removedCard.parentElement) {
      removedCard.remove();
    }
    refreshCompareEmptyCard();
    updateCompareCountBadge();
    generateCompareStatsGrid();
  }, 300);
}

function backupSquadCustomizationState() {
  if (!window.squadCustomizationState) return null;
  return {
    playerId: window.squadCustomizationState.playerId,
    slotId: window.squadCustomizationState.slotId,
    selectedRank: window.squadCustomizationState.selectedRank,
    trainingLevel: window.squadCustomizationState.trainingLevel,
    selectedSkills: Array.isArray(window.squadCustomizationState.selectedSkills)
      ? [...window.squadCustomizationState.selectedSkills]
      : [],
    baseOvr: window.squadCustomizationState.baseOvr,
    basePosition: window.squadCustomizationState.basePosition,
    baseName: window.squadCustomizationState.baseName,
    baseColors: window.squadCustomizationState.baseColors
      ? { ...window.squadCustomizationState.baseColors }
      : null,
    savedByPlayer: window.squadCustomizationState.savedByPlayer
      ? { ...window.squadCustomizationState.savedByPlayer }
      : {}
  };
}

function restoreSquadCustomizationState(snapshot) {
  if (!window.squadCustomizationState || !snapshot) return;
  Object.assign(window.squadCustomizationState, snapshot);
  if (snapshot.savedByPlayer) {
    window.squadCustomizationState.savedByPlayer = { ...snapshot.savedByPlayer };
  }
}

function updateCompareCustomizationModalLabels(isCompare) {
  const removeBtn = document.getElementById('squad-remove-btn');
  const applyBtn = document.getElementById('squad-apply-btn');
  if (isCompare) {
    compareCustomizationContext.modalLabels = compareCustomizationContext.modalLabels || {};
    if (removeBtn && !compareCustomizationContext.modalLabels.remove) {
      compareCustomizationContext.modalLabels.remove = removeBtn.innerHTML;
    }
    if (applyBtn && !compareCustomizationContext.modalLabels.apply) {
      compareCustomizationContext.modalLabels.apply = applyBtn.innerHTML;
    }
    if (removeBtn) {
      removeBtn.innerHTML = '<span>🗑️</span><span>Remove from Compare</span>';
    }
    if (applyBtn) {
      applyBtn.innerHTML = '<span>✓</span><span>Apply to Compare</span>';
    }
  } else {
    if (removeBtn && compareCustomizationContext.modalLabels?.remove) {
      removeBtn.innerHTML = compareCustomizationContext.modalLabels.remove;
    }
    if (applyBtn && compareCustomizationContext.modalLabels?.apply) {
      applyBtn.innerHTML = compareCustomizationContext.modalLabels.apply;
    }
  }
}

function persistCompareCustomizationState(reason = 'update') {
  const playerId = compareCustomizationState.playerId;
  if (!playerId) return null;
  const resolvedId = resolveComparePlayerId(playerId);
  const stillSelected = compareState.selectedPlayers.some(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (!stillSelected) return null;
  const snapshot = getCompareCustomizationSnapshot();
  setCompareCustomization(playerId, snapshot);
  compareCustomizationContext.lastSnapshot = snapshot;
  compareLog('Customization persisted', { playerId, reason, snapshot });
  return snapshot;
}

function updateCompareRankBoxes(selectedRank) {
  document.querySelectorAll('.squad-rank-box').forEach(box => {
    const rank = parseInt(box.dataset.rank, 10);
    if (rank === selectedRank) {
      box.classList.add('selected');
      box.style.borderColor = selectedRank === 1 ? 'rgba(59,214,113,0.6)' :
                             selectedRank === 2 ? 'rgba(99,102,241,0.6)' :
                             selectedRank === 3 ? 'rgba(139,92,246,0.6)' :
                             selectedRank === 4 ? 'rgba(255,184,107,0.6)' :
                             'rgba(255,107,107,0.6)';
      box.style.boxShadow = `0 0 12px ${selectedRank === 1 ? '#3BD671' : selectedRank === 2 ? '#6366F1' : selectedRank === 3 ? '#8B5CF6' : selectedRank === 4 ? '#FFB86B' : '#FF6B6B'}50`;
    } else {
      box.classList.remove('selected');
      box.style.borderColor = 'rgba(255,255,255,0.1)';
      box.style.boxShadow = 'none';
    }
  });
}

function renderCompareSkillsMessage(message) {
  const container = document.getElementById('squad-custom-skills');
  if (!container) return;
  container.innerHTML = `<p style="color: #98A0A6; text-align: center;">${message}</p>`;
}

function renderCompareCustomizationMiniCard(player) {
  const container = document.getElementById('squad-custom-player-card');
  if (!container) return;

  if (!player) {
    container.innerHTML = '<p style="color: #888;">Player not found</p>';
    return;
  }

  const cardBg = player.card_background || player.cardBackground || player.cardbackground || 'https://via.placeholder.com/180x240';
  const playerImg = player.player_image || player.playerImage || player.playerimage || player.playerimg || 'https://via.placeholder.com/120x120';
  const playerName = player.name || 'Unknown Player';
  const position = player.position || 'N/A';
  const nationFlag = player.nation_flag || player.nationFlag || player.nationflag || '';
  const clubFlag = player.club_flag || player.clubFlag || player.clubflag || '';
  const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
  const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
  const untradableBadgeHTML = isUntradable
    ? `<div class="card-untradable-badge" style="pointer-events: none;">
         <img src="assets/images/untradable_img.png" alt="Untradable">
       </div>`
    : '';

  container.innerHTML = `
    <div class="squad-custom-mini-card">
      <img src="${cardBg}" alt="Card Background" class="squad-custom-card-bg" onerror="this.src='https://via.placeholder.com/180x240'">
      <img src="${playerImg}" alt="${playerName}" class="squad-custom-card-player-img" onerror="this.style.display='none'">
      <div class="squad-custom-card-ovr" style="color: ${player.color_rating || '#FFFFFF'}">${player.ovr && player.ovr > 0 ? player.ovr : 'N/A'}</div>
      <div class="squad-custom-card-position" style="color: ${player.color_position || '#FFFFFF'}">${position}</div>
      <div class="squad-custom-card-flags">
        <img src="${nationFlag}" alt="Nation" class="squad-custom-card-flag ${getPlayerType(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}" onerror="this.style.display='none'">
        <img src="${clubFlag}" alt="Club" class="squad-custom-card-club ${getPlayerType(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}" onerror="this.style.display='none'">
      </div>
      <div class="squad-custom-card-name" style="color: ${player.color_name || '#FFFFFF'}">${playerName}</div>
      ${untradableBadgeHTML}
    </div>
  `;
  if (typeof applyRankOverlay === 'function') {
    const rankValue = compareCustomizationState.selectedRank || player?.rank || 0;
    applyRankOverlay(container.querySelector('.squad-custom-mini-card'), rankValue, {
      scope: 'compare',
      modifierClass: 'rank-overlay--compare-modal'
    });
  }
}

function updateCompareCustomizationMiniCard() {
  const container = document.getElementById('squad-custom-player-card');
  if (!container) return;

  const ovrEl = container.querySelector('.squad-custom-card-ovr');
  const positionEl = container.querySelector('.squad-custom-card-position');
  const nameEl = container.querySelector('.squad-custom-card-name');

  if (!ovrEl || !positionEl || !nameEl) return;

  const baseOvr = compareCustomizationState.baseOvr ?? 0;
  const basePosition = compareCustomizationState.basePosition || 'N/A';
  const baseName = compareCustomizationState.baseName || 'Unknown Player';
  const colors = compareCustomizationState.baseColors || {};

  const rankBonus = typeof getSquadRankOvrBonus === 'function'
    ? getSquadRankOvrBonus(compareCustomizationState.selectedRank)
    : compareCustomizationState.selectedRank;
  const updatedOvr = baseOvr > 0 ? baseOvr + rankBonus : baseOvr;
  compareLog('Customization OVR recalculated', { baseOvr, rankBonus, updatedOvr });

  ovrEl.textContent = updatedOvr > 0 ? updatedOvr : 'N/A';
  positionEl.textContent = basePosition;
  nameEl.textContent = baseName;

  if (colors.color_rating) ovrEl.style.color = colors.color_rating;
  if (colors.color_position) positionEl.style.color = colors.color_position;
  if (colors.color_name) nameEl.style.color = colors.color_name;
  if (typeof applyRankOverlay === 'function') {
    applyRankOverlay(container.querySelector('.squad-custom-mini-card'), compareCustomizationState.selectedRank || 0, {
      scope: 'compare',
      modifierClass: 'rank-overlay--compare-modal'
    });
  }
}

async function renderComparePlayerSkills(options = {}) {
  const container = document.getElementById('squad-custom-skills');
  if (!container) return;

  const resolvedPlayerId = options.player ? resolveComparePlayerId(options.player) : null;
  const playerId = compareCustomizationState.playerId || resolvedPlayerId;
  const rank = compareCustomizationState.selectedRank || options.player?.rank || 0;

  if (!playerId || !rank) {
    renderCompareSkillsMessage('Select a rank to view skills');
    return;
  }

  if (!window.apiClient || typeof window.apiClient.getPlayerDetails !== 'function') {
    renderCompareSkillsMessage('Skills unavailable');
    return;
  }

  const basePlayer = options.player ||
    compareCustomizationState.player ||
    compareState.selectedPlayers.find(p => resolveComparePlayerId(p) === resolveComparePlayerId(playerId)) || {};

  let mergedPlayer = null;
  if (options.player) {
    mergedPlayer = {
      ...basePlayer,
      ...options.player,
      player_id: basePlayer.player_id || basePlayer.id || options.player?.player_id || playerId,
      rank: rank,
      skills: options.player?.skills || basePlayer.skills || [],
      available_skill_points: options.player?.available_skill_points ?? basePlayer.available_skill_points
    };
  } else {
    let detailsResponse;
    try {
      detailsResponse = await window.apiClient.getPlayerDetails(playerId, rank, { cache: false });
    } catch (error) {
      console.error('[COMPARE SKILLS] Error loading skills:', error);
      renderCompareSkillsMessage('Failed to load skills');
      return;
    }

    mergedPlayer = {
      ...basePlayer,
      ...(detailsResponse.player || {}),
      player_id: basePlayer.player_id || basePlayer.id || detailsResponse.player?.player_id || playerId,
      rank: rank,
      skills: detailsResponse.skills || [],
      available_skill_points: detailsResponse.available_skill_points
    };
  }

  compareCustomizationState.player = mergedPlayer;

  const availableSkills = mergedPlayer.skills || [];
  compareCustomizationState.selectedSkills = [];

  const availablePoints = mergedPlayer.available_skill_points || rank || 0;
  const pointsDisplay = document.getElementById('squad-skill-points-display');
  if (pointsDisplay) {
    pointsDisplay.textContent = `${availablePoints} Point${availablePoints !== 1 ? 's' : ''}`;
  }

  if (availableSkills.length === 0) {
    renderCompareSkillsMessage('No skills available');
    return;
  }

  const hasProvidedAllocations = Array.isArray(options.allocations);
  let userAllocations = hasProvidedAllocations ? options.allocations : [];
  const userId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;
  if (!hasProvidedAllocations && userId && typeof window.apiClient.getUserSkillAllocations === 'function') {
    try {
      const response = await window.apiClient.getUserSkillAllocations(
        userId,
        mergedPlayer.player_id,
        rank
      );
      userAllocations = response.allocations || [];
    } catch (error) {
      console.error('[COMPARE SKILLS] Error fetching allocations:', error);
    }
  } else if (userId && typeof window.setSkillAllocationsCacheEntry === 'function') {
    window.setSkillAllocationsCacheEntry(userId, mergedPlayer.player_id, rank, userAllocations, options.source || 'local');
  }

  const allocationMap = {};
  userAllocations.forEach(a => {
    allocationMap[a.skill_id] = a.skill_level;
  });

  compareCustomizationState.selectedSkills = userAllocations.map(a => ({
    skill_id: a.skill_id,
    skill_level: a.skill_level
  }));

  const pointsSpent = userAllocations.reduce((sum, a) => sum + a.skill_level, 0);
  const pointsRemaining = availablePoints - pointsSpent;

  const maxLevels = typeof calculateMaxLevels === 'function'
    ? calculateMaxLevels(availableSkills)
    : {};

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
  container.style.gap = '12px';
  container.innerHTML = '';
  availableSkills.forEach(skill => {
    const currentLevel = allocationMap[skill.skill_id] || 0;
    const isUnlocked = typeof checkIfSkillUnlocked === 'function'
      ? checkIfSkillUnlocked(skill, allocationMap, availableSkills)
      : true;
    if (typeof createSkillCard === 'function') {
      const card = createSkillCard(skill, currentLevel, isUnlocked, pointsRemaining, mergedPlayer, maxLevels);
      card.style.minHeight = '120px';
      card.style.pointerEvents = isUnlocked ? 'auto' : 'none';
      container.appendChild(card);
    } else {
      const fallbackCard = document.createElement('div');
      fallbackCard.className = `skill-card ${!isUnlocked ? 'locked' : ''}`;
      fallbackCard.textContent = skill.skill_name || 'Skill';
      container.appendChild(fallbackCard);
    }
  });
}

async function compareSelectRank(rankNumber, options = {}) {
  const normalizedRank = typeof getSquadRankOvrBonus === 'function'
    ? getSquadRankOvrBonus(rankNumber)
    : Math.min(Math.max(parseInt(rankNumber || 0, 10), 0), 5);
  compareCustomizationState.selectedRank = normalizedRank;
  compareSelectedRank = normalizedRank;
  console.log('[RankOverlay] ComparePlayers:', compareCustomizationState.playerId, normalizedRank);
  compareLog('Rank selected', {
    playerId: compareCustomizationState.playerId,
    rank: normalizedRank
  });
  if (!options.preserveSkills) {
    compareCustomizationState.selectedSkills = [];
  }

  updateCompareCustomizationMiniCard();
  updateCompareRankBoxes(normalizedRank);
  updateCompareCardRankOverlay(compareCustomizationState.playerId, normalizedRank);

  const skillPoints = normalizedRank;
  const pointsDisplay = document.getElementById('squad-skill-points-display');
  if (pointsDisplay) {
    pointsDisplay.textContent = `${skillPoints} Point${skillPoints !== 1 ? 's' : ''}`;
  }

  if (!options.skipSkillRender) {
    renderCompareSkillsMessage('Loading skills...');
    await renderComparePlayerSkills();
  } else if (!normalizedRank) {
    renderCompareSkillsMessage('Select a rank to view skills');
  }

  if (!options.skipPersist) {
    persistCompareCustomizationState('rank-change');
  }

  if (!options.skipRecalc) {
    handleCompareCustomizationChange('rank-change');
  }
}

function compareUpdateTraining(level) {
  const parsedLevel = parseInt(level, 10);
  compareCustomizationState.trainingLevel = Number.isFinite(parsedLevel) ? parsedLevel : 0;
  compareTrainingLevel = compareCustomizationState.trainingLevel;
  compareLog('Training updated', {
    playerId: compareCustomizationState.playerId,
    trainingLevel: compareCustomizationState.trainingLevel
  });
  persistCompareCustomizationState('training-change');
  handleCompareCustomizationChange('training-change');
}

function compareResetRank() {
  compareCustomizationState.selectedRank = 0;
  compareCustomizationState.selectedSkills = [];
  compareCustomizationState.trainingLevel = 0;
  compareSelectedRank = 0;
  compareTrainingLevel = 0;
  compareSkillBoost = {};
  console.log('[RankOverlay] ComparePlayers:', compareCustomizationState.playerId, 0);
  compareLog('Rank reset', { playerId: compareCustomizationState.playerId });

  updateCompareRankBoxes(0);

  const trainingSelect = document.getElementById('squad-training-level');
  if (trainingSelect) {
    trainingSelect.value = '0';
  }

  const pointsDisplay = document.getElementById('squad-skill-points-display');
  if (pointsDisplay) {
    pointsDisplay.textContent = '0 Points';
  }

  updateCompareCustomizationMiniCard();
  updateCompareCardRankOverlay(compareCustomizationState.playerId, 0);
  renderCompareSkillsMessage('Select a rank to view skills');

  persistCompareCustomizationState('rank-reset');
  handleCompareCustomizationChange('rank-reset');
}

async function openComparePlayerStatsView() {
  const modal = document.getElementById('squad-player-customization-modal');
  const statsView = document.getElementById('squad-stats-view');
  const statsContent = document.getElementById('squad-stats-content');
  if (!modal || !statsView || !statsContent) return;

  modal.classList.add('stats-mode');
  statsView.style.display = 'block';
  statsContent.innerHTML = '<div style="color: #98A0A6; text-align: center; padding: 20px;">Loading stats...</div>';

  const playerId = compareCustomizationState.playerId;
  const rank = compareCustomizationState.selectedRank || 0;
  const trainingLevel = compareCustomizationState.trainingLevel || 0;

  if (!playerId || !rank || !window.apiClient) {
    statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Stats unavailable</div>';
    return;
  }

  try {
    const detailsResponse = await window.apiClient.getPlayerDetails(playerId, rank, { cache: false });
    const basePlayer = compareCustomizationState.player ||
      compareState.selectedPlayers.find(p => resolveComparePlayerId(p) === resolveComparePlayerId(playerId)) || {};
    const mergedPlayer = {
      ...basePlayer,
      ...(detailsResponse.player || {}),
      player_id: basePlayer.player_id || basePlayer.id || detailsResponse.player?.player_id || playerId,
      rank: rank,
      skills: detailsResponse.skills || [],
      available_skill_points: detailsResponse.available_skill_points
    };

    let userAllocations = [];
    const userId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;
    if (userId && typeof window.apiClient.getUserSkillAllocations === 'function') {
      const response = await window.apiClient.getUserSkillAllocations(userId, mergedPlayer.player_id, rank);
      userAllocations = response.allocations || [];
    }

    const skillBoosts = typeof calculateSkillBoosts === 'function'
      ? await calculateSkillBoosts(userAllocations)
      : {};

    const trainingBoosts = typeof getTrainingBoosts === 'function'
      ? await getTrainingBoosts(mergedPlayer.position, trainingLevel)
      : null;

    mergedPlayer.training_level = trainingLevel;
    mergedPlayer.training_boosts = typeof mergeBoosts === 'function'
      ? mergeBoosts(trainingBoosts, skillBoosts)
      : (trainingBoosts || {});

    compareCustomizationState.player = mergedPlayer;

    if (typeof window.renderPlayerStatsSection === 'function') {
      statsContent.innerHTML = window.renderPlayerStatsSection(mergedPlayer);
    } else {
      statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Stats renderer unavailable</div>';
    }
  } catch (error) {
    console.error('[COMPARE STATS] Error loading stats:', error);
    statsContent.innerHTML = '<div style="color: #FF6B6B; text-align: center;">Failed to load stats</div>';
  }
}

function closeComparePlayerStatsView() {
  const modal = document.getElementById('squad-player-customization-modal');
  const statsView = document.getElementById('squad-stats-view');
  if (statsView) statsView.style.display = 'none';
  if (modal) modal.classList.remove('stats-mode');
}

async function openCompareCustomization(player, index) {
  const playerId = resolveComparePlayerId(player);
  if (!playerId) {
    return;
  }

  const modal = document.getElementById('squad-player-customization-modal');
  if (!modal) {
    return;
  }

  ensureCompareCustomizationModalRoot();

  if (compareCustomizationContext.active) {
    finalizeCompareCustomization();
  }

  if (typeof addPlayerToCache === 'function') {
    addPlayerToCache(player);
  }

  const storedCustomization = getCompareCustomization(playerId);
  const fallbackRank = typeof getSquadRankOvrBonus === 'function'
    ? getSquadRankOvrBonus(player?.rank)
    : Math.min(Math.max(parseInt(player?.rank || 0, 10), 0), 5);
  const restoredRank = storedCustomization
    ? (typeof getSquadRankOvrBonus === 'function'
      ? getSquadRankOvrBonus(storedCustomization.selectedRank)
      : Math.min(Math.max(parseInt(storedCustomization.selectedRank || 0, 10), 0), 5))
    : fallbackRank;
  const restoredTraining = storedCustomization
    ? parseInt(storedCustomization.trainingLevel || 0, 10)
    : parseInt(player?.training_level || 0, 10);
  const restoredSkills = storedCustomization && Array.isArray(storedCustomization.selectedSkills)
    ? [...storedCustomization.selectedSkills]
    : [];

  compareCustomizationState.playerId = playerId;
  compareCustomizationState.selectedRank = Number.isFinite(restoredRank) ? restoredRank : 0;
  compareCustomizationState.trainingLevel = Number.isFinite(restoredTraining) ? restoredTraining : 0;
  compareCustomizationState.selectedSkills = restoredSkills;
  compareCustomizationState.player = player || null;

  const storedBaseOvr = Number.isFinite(parseInt(storedCustomization?.baseOvr, 10))
    ? parseInt(storedCustomization.baseOvr, 10)
    : null;
  const baseRankBonus = typeof getSquadRankOvrBonus === 'function'
    ? getSquadRankOvrBonus(compareCustomizationState.selectedRank)
    : compareCustomizationState.selectedRank;
  const rawBaseOvr = Number.isFinite(parseInt(player?.base_ovr, 10))
    ? parseInt(player.base_ovr, 10)
    : (Number.isFinite(storedBaseOvr)
      ? storedBaseOvr
      : parseInt(player?.ovr || player?.overall || 0, 10) - baseRankBonus);
  const normalizedBaseOvr = Number.isFinite(rawBaseOvr) ? Math.max(rawBaseOvr, 0) : 0;
  compareCustomizationState.baseOvr = normalizedBaseOvr;
  compareCustomizationState.basePosition = player?.position || 'N/A';
  compareCustomizationState.baseName = player?.name || 'Unknown Player';
  compareCustomizationState.baseColors = storedCustomization?.baseColors
    ? { ...storedCustomization.baseColors }
    : {
        color_rating: player?.color_rating || '#FFFFFF',
        color_position: player?.color_position || '#FFFFFF',
        color_name: player?.color_name || '#FFFFFF'
      };

  compareSelectedRank = compareCustomizationState.selectedRank;
  compareTrainingLevel = compareCustomizationState.trainingLevel;

  compareCustomizationContext.active = true;
  compareCustomizationContext.playerId = playerId;
  compareCustomizationContext.index = index;
  compareCustomizationContext.applied = false;
  compareCustomizationContext.hasPreview = false;
  compareCustomizationContext.skipRestore = false;
  compareCustomizationContext.initialPlayer = compareState.selectedPlayers[index] || null;
  compareCustomizationContext.lastSnapshot = null;
  compareCustomizationContext.backup = null;
  updateCompareCustomizationModalLabels(true);
  compareLog('Customization modal opened', {
    playerId,
    index,
    snapshot: storedCustomization
  });

  renderCompareCustomizationMiniCard(player);
  updateCompareCustomizationMiniCard();

  const trainingSelect = document.getElementById('squad-training-level');
  if (trainingSelect) {
    trainingSelect.value = `${compareCustomizationState.trainingLevel || 0}`;
  }

  closeComparePlayerStatsView();

  modal.classList.remove('is-visible');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.classList.add('is-visible');
  });

  updateCompareRankBoxes(compareCustomizationState.selectedRank);
  if (compareCustomizationState.selectedRank > 0) {
    renderCompareSkillsMessage('Loading skills...');
    renderComparePlayerSkills();
  } else {
    const pointsDisplay = document.getElementById('squad-skill-points-display');
    if (pointsDisplay) {
      pointsDisplay.textContent = '0 Points';
    }
    renderCompareSkillsMessage('Select a rank to view skills');
  }

  persistCompareCustomizationState('open');
}

function getCompareCustomizationSnapshot() {
  const rawRank = compareCustomizationState.selectedRank || 0;
  const normalizedRank = typeof getSquadRankOvrBonus === 'function'
    ? getSquadRankOvrBonus(rawRank)
    : Math.min(Math.max(parseInt(rawRank || 0, 10), 0), 5);
  return {
    selectedRank: normalizedRank,
    trainingLevel: parseInt(compareCustomizationState.trainingLevel || 0, 10),
    selectedSkills: Array.isArray(compareCustomizationState.selectedSkills)
      ? [...compareCustomizationState.selectedSkills]
      : [],
    baseOvr: Number.isFinite(compareCustomizationState.baseOvr)
      ? compareCustomizationState.baseOvr
      : 0,
    baseColors: compareCustomizationState.baseColors
      ? { ...compareCustomizationState.baseColors }
      : null
  };
}

function handleCompareCustomizationChange(reason = 'change') {
  if (!compareCustomizationContext.active) return;
  const playerId = compareCustomizationContext.playerId;
  if (!playerId) return;
  if (!compareCustomizationContext.initialPlayer && compareCustomizationContext.index !== null) {
    compareCustomizationContext.initialPlayer = compareState.selectedPlayers[compareCustomizationContext.index] || null;
  }
  const snapshot = persistCompareCustomizationState(reason) || getCompareCustomizationSnapshot();
  compareCustomizationContext.hasPreview = true;
  compareCustomizationContext.lastSnapshot = snapshot;
  compareLog('Customization change detected', { playerId, reason, snapshot });
  recalculateComparePlayerStats(playerId, snapshot, { reason, preview: false });
}

function removeComparePlayerById(playerId) {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index >= 0) {
    removeComparePlayer(index);
  }
}

async function recalculateComparePlayerStats(playerId, customization, options = {}) {
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const { reason = 'update', preview = false } = options;
  const token = `${Date.now()}-${Math.random()}`;
  compareState.recalcTokens[resolvedId] = token;

  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index < 0) return;

  const currentPlayer = compareState.selectedPlayers[index];
  const previousOvr = Number(currentPlayer?.ovr || currentPlayer?.overall || 0);
  const rank = Number(customization?.selectedRank || 0);
  const trainingLevel = Number(customization?.trainingLevel || 0);

  compareLog('Stat recalculation triggered', {
    playerId: resolvedId,
    rank,
    trainingLevel,
    reason,
    preview
  });

  let detailsPlayer = {};
  let skills = [];
  let availableSkillPoints = null;
  if (window.apiClient && typeof window.apiClient.getPlayerDetails === 'function') {
    try {
      const resp = await window.apiClient.getPlayerDetails(resolvedId, rank, { cache: false });
      detailsPlayer = resp.player || {};
      skills = resp.skills || [];
      availableSkillPoints = resp.available_skill_points ?? null;
    } catch (error) {
      compareLog('Player details refresh failed', error);
    }
  }

  if (compareState.recalcTokens[resolvedId] !== token) return;

  const mergedPlayer = {
    ...currentPlayer,
    ...detailsPlayer,
    player_id: resolvedId,
    rank,
    skills: skills.length ? skills : currentPlayer.skills || [],
    available_skill_points: availableSkillPoints ?? currentPlayer.available_skill_points
  };
  mergedPlayer.training_level = trainingLevel;

  let skillBoosts = {};
  const userId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;
  if (userId && window.apiClient?.getUserSkillAllocations && typeof calculateSkillBoosts === 'function') {
    try {
      const allocationsResp = await window.apiClient.getUserSkillAllocations(userId, resolvedId, rank);
      skillBoosts = await calculateSkillBoosts(allocationsResp.allocations || []);
    } catch (error) {
      compareLog('Skill boosts refresh failed', error);
    }
  }

  if (compareState.recalcTokens[resolvedId] !== token) return;

  let trainingBoosts = null;
  if (typeof getTrainingBoosts === 'function') {
    try {
      trainingBoosts = await getTrainingBoosts(mergedPlayer.position, trainingLevel);
    } catch (error) {
      compareLog('Training boosts refresh failed', error);
    }
  }

  if (compareState.recalcTokens[resolvedId] !== token) return;

  const combinedBoosts = typeof mergeBoosts === 'function'
    ? mergeBoosts(trainingBoosts, skillBoosts)
    : { ...(trainingBoosts || {}), ...(skillBoosts || {}) };

  mergedPlayer.compare_boosts = combinedBoosts;
  mergedPlayer.training_boosts = combinedBoosts;
  mergedPlayer.skill_boosts = skillBoosts;

  const customizationBaseOvr = Number.parseInt(customization?.baseOvr, 10);
  const playerBaseOvr = Number.parseInt(mergedPlayer.base_ovr || currentPlayer.base_ovr, 10);
  const fallbackOvr = Number.parseInt(
    mergedPlayer.ovr ||
    mergedPlayer.overall ||
    currentPlayer.ovr ||
    currentPlayer.overall ||
    0,
    10
  );
  const baseOvr = Number.isFinite(customizationBaseOvr)
    ? customizationBaseOvr
    : (Number.isFinite(playerBaseOvr) ? playerBaseOvr : (Number.isFinite(fallbackOvr) ? fallbackOvr : 0));
  const rankBonus = typeof getSquadRankOvrBonus === 'function' ? getSquadRankOvrBonus(rank) : rank;
  const boostedOvr = baseOvr > 0 ? baseOvr + rankBonus : baseOvr;
  if (Number.isFinite(baseOvr)) {
    mergedPlayer.base_ovr = baseOvr;
  }
  mergedPlayer.ovr = boostedOvr;
  mergedPlayer.overall = boostedOvr;

  if (compareDebugEnabled) {
    const ovrDelta = boostedOvr - previousOvr;
    compareLog('OVR delta check', {
      playerId: resolvedId,
      previousOvr,
      boostedOvr,
      delta: ovrDelta
    });
    if (rank === 0 && trainingLevel === 0 && (!skillBoosts || !Object.keys(skillBoosts).length) && baseOvr > 0 && boostedOvr !== baseOvr) {
      compareLog('Reset check failed', { playerId: resolvedId, expected: baseOvr, actual: boostedOvr });
    }
  }

  if (compareState.recalcTokens[resolvedId] !== token) return;

  compareSkillBoost = skillBoosts || {};
  if (compareCustomizationContext.active && String(compareCustomizationContext.playerId) === String(resolvedId)) {
    compareCustomizationState.player = mergedPlayer;
  }

  compareState.selectedPlayers[index] = mergedPlayer;
  compareLog('Stat recalculation complete', {
    playerId: resolvedId,
    rank,
    trainingLevel,
    ovr: boostedOvr,
    boosts: combinedBoosts
  });
  updateCompareCardForPlayer(resolvedId);
  updateCompareStatsGridForPlayer(resolvedId);
}

async function applyCompareCustomization() {
  const playerId = compareCustomizationContext.playerId;
  if (!playerId) {
    window.closePlayerCustomizationModal?.();
    return;
  }
  const snapshot = persistCompareCustomizationState('apply') || getCompareCustomizationSnapshot();
  compareCustomizationContext.applied = true;
  compareCustomizationContext.lastSnapshot = snapshot;
  compareLog('Customization applied', { playerId, snapshot });

  window.closePlayerCustomizationModal?.();
  await recalculateComparePlayerStats(playerId, snapshot, { reason: 'apply' });
}

function closeCompareCustomizationModal() {
  const modal = document.getElementById('squad-player-customization-modal');
  if (modal) {
    modal.classList.remove('is-visible');
    modal.style.display = 'none';
  }
  if (typeof closeSkillDetailModal === 'function') {
    closeSkillDetailModal();
  }
  closeComparePlayerStatsView();
  finalizeCompareCustomization();
  const compareModal = document.getElementById('compare-players-modal');
  document.body.style.overflow = compareModal && compareModal.style.display !== 'none' ? 'hidden' : 'auto';
}

function finalizeCompareCustomization() {
  updateCompareCustomizationModalLabels(false);
  const resolvedId = resolveComparePlayerId(compareCustomizationContext.playerId);
  if (resolvedId) {
    delete compareState.recalcTokens[resolvedId];
  }
  if (compareCustomizationContext.active) {
    persistCompareCustomizationState('finalize');
  }
  compareCustomizationContext.active = false;
  compareCustomizationContext.playerId = null;
  compareCustomizationContext.index = null;
  compareCustomizationContext.backup = null;
  compareCustomizationContext.applied = false;
  compareCustomizationContext.hasPreview = false;
  compareCustomizationContext.skipRestore = false;
  compareCustomizationContext.initialPlayer = null;
  compareCustomizationContext.lastSnapshot = null;
  compareCustomizationState.playerId = null;
  compareCustomizationState.selectedRank = 0;
  compareCustomizationState.trainingLevel = 0;
  compareCustomizationState.selectedSkills = [];
  compareCustomizationState.baseOvr = null;
  compareCustomizationState.basePosition = null;
  compareCustomizationState.baseName = null;
  compareCustomizationState.baseColors = null;
  compareCustomizationState.player = null;
  compareSelectedRank = 0;
  compareTrainingLevel = 0;
  compareSkillBoost = {};
  const compareModal = document.getElementById('compare-players-modal');
  if (compareModal && compareModal.style.display !== 'none') {
    document.body.style.overflow = 'hidden';
  }
}

function updateCompareCountBadge() {
  const badge = document.getElementById('compare-count-badge');
  if (!badge) return;
  badge.textContent = `${compareState.selectedPlayers.length}/5`;
}

// Search modal
function openCompareSearch(slotIndex) {
  compareState.currentSlot = slotIndex;
  const modal = document.getElementById('compare-search-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  const input = document.getElementById('compare-search-input');
  const results = document.getElementById('compare-search-results');
  if (input) {
    input.value = '';
    input.focus();
  }
  if (results) {
    results.innerHTML = `<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">Start typing to search players...</p>`;
  }
}

function closeCompareSearch() {
  const modal = document.getElementById('compare-search-modal');
  if (modal) modal.style.display = 'none';
}

// Search input handler
let compareSearchTimeout = null;
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('compare-search-input');
  if (!searchInput) return;
  searchInput.addEventListener('input', e => {
    clearTimeout(compareSearchTimeout);
    const q = e.target.value.trim();
    const resultsDiv = document.getElementById('compare-search-results');
    if (!q || q.length < 2) {
      if (resultsDiv) {
        resultsDiv.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">Type at least 2 characters...</p>';
      }
      return;
    }
    compareSearchTimeout = setTimeout(() => {
      searchComparePlayers(q);
    }, 300);
  });
});

async function searchComparePlayers(query) {
  const resultsDiv = document.getElementById('compare-search-results');
  if (!resultsDiv) return;
  resultsDiv.innerHTML = '<p style="color:var(--color-teal-500);text-align:center;padding:20px;">Searching...</p>';

  try {
    if (!window.apiClient) {
      resultsDiv.innerHTML = '<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">Search unavailable.</p>';
      return;
    }
    const resp = await window.apiClient.searchPlayers({ q: query, limit: 50, rank: 0 });
    const players = resp.results || resp.players || [];
    if (!players.length) {
      resultsDiv.innerHTML = `<p style="color:var(--color-text-secondary);text-align:center;padding:20px;">No players found for "${query}"</p>`;
      return;
    }
    resultsDiv.innerHTML = '';
    players.forEach(p => resultsDiv.appendChild(createCompareSearchResultItem(p)));
  } catch (err) {
    compareLog('Search error', err);
    resultsDiv.innerHTML = '<p style="color:var(--color-status-error);text-align:center;padding:20px;">Search error. Please try again.</p>';
  }
}

function createCompareSearchResultItem(player) {
  const item = document.createElement('div');
  item.className = 'compare-search-result-item';
  item.onclick = () => selectPlayerForComparison(player);
  const cardBackground = player.card_background || player.cardBackground || player.cardbackground || 'https://via.placeholder.com/120x160';
  const playerImage = player.player_image || player.playerImage || player.playerimage || player.playerimg || '';
  const playerName = player.name || 'Unknown Player';
  const playerOvr = player.ovr && player.ovr > 0 ? player.ovr : 'NA';
  const playerPosition = player.position || 'NA';
  const nationFlag = player.nation_flag || player.nationflag || player.nationFlag || '';
  const clubFlag = player.club_flag || player.clubflag || player.clubFlag || '';
  const isUntradableText = String(player.is_untradable ?? player.isuntradable ?? '').toLowerCase();
  const isUntradable = isUntradableText === 'true' || isUntradableText === '1' || isUntradableText === 'yes';
  const untradableBadgeHTML = isUntradable
    ? `<div class="card-untradable-badge" style="pointer-events: none;">
         <img src="assets/images/untradable_img.png" alt="Untradable">
       </div>`
    : '';
  item.innerHTML = `
    <div class="compare-search-result-image">
      <div class="picker-card-mini">
        <img src="${cardBackground}" alt="Card Background" class="picker-card-bg" onerror="this.src='https://via.placeholder.com/120x160'">
        ${playerImage ? `
          <img src="${playerImage}" alt="${playerName}" class="picker-card-player-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
          <span class="player-initials" style="display: none;">${getInitials(playerName)}</span>
        ` : `
          <span class="player-initials">${getInitials(playerName)}</span>
        `}
        <div class="picker-card-ovr" style="color: ${player.color_rating || '#FFB86B'}">${playerOvr}</div>
        <div class="picker-card-position" style="color: ${player.color_position || '#FFFFFF'}">${playerPosition}</div>
        <div class="picker-card-name" style="color: ${player.color_name || '#FFFFFF'}">${playerName}</div>
        <img src="${nationFlag}" alt="Nation" class="picker-card-flag-nation ${getPlayerType(player) === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}" onerror="this.style.display='none'">
        <img src="${clubFlag}" alt="Club" class="picker-card-flag-club ${getPlayerType(player) === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}" onerror="this.style.display='none'">
        
        ${getPlayerType(player) === 'normal' && player.league_image ? `
            <img src="${player.league_image}" 
                 alt="League" 
                 class="picker-card-flag-league-compare normal-league-flag-compare"
                 onerror="this.style.display='none'">
        ` : ''}
        
        ${untradableBadgeHTML}
      </div>
    </div>
    <div class="compare-search-result-info">
      <h4>${playerName}</h4>
      <p>${playerPosition} • ${player.team || 'N/A'}</p>
    </div>
    <div class="compare-search-result-ovr">${playerOvr}</div>
  `;
  return item;
}

function selectPlayerForComparison(player) {
  const playerId = resolveComparePlayerId(player);
  if (!playerId) {
    return;
  }
  if (compareState.selectedPlayers.some(p => resolveComparePlayerId(p) === playerId)) {
    return;
  }
  const isGK = player.position === 'GK';
  if (compareState.positionMode === null) {
    compareState.positionMode = isGK ? 'gk' : 'outfield';
  } else {
    if (compareState.positionMode === 'gk' && !isGK) {
      return;
    }
    if (compareState.positionMode === 'outfield' && isGK) {
      return;
    }
  }
  compareState.selectedPlayers.push({ ...player, player_id: playerId });
  closeCompareSearch();
  appendComparePlayerCard(player);
  updateCompareCountBadge();
  generateCompareStatsGrid();
}

// Switch stats view
function switchCompareStatsView(view) {
  compareState.isBasicView = (view === 'basic');
  document.getElementById('basic-stats-btn')?.classList.toggle('active', view === 'basic');
  document.getElementById('advanced-stats-btn')?.classList.toggle('active', view === 'advanced');

  const title = document.getElementById('compare-stats-view-title');
  if (title) {
    title.textContent = view === 'basic' ? 'Major Stats Comparison' : 'Advanced Stats Breakdown';
  }
  generateCompareStatsGrid();
}

// Generate stats grid
function generateCompareStatsGrid() {
  const grid = document.getElementById('compare-stats-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const subtitle = document.getElementById('compare-stats-subtitle');
  if (compareState.selectedPlayers.length === 0) {
    if (subtitle) subtitle.textContent = 'Add at least 2 players to see comparison';
    return;
  }
  if (compareState.selectedPlayers.length === 1) {
    if (subtitle) subtitle.textContent = 'Add one more player to enable comparison';
  } else {
    if (subtitle) subtitle.textContent = `Comparing ${compareState.selectedPlayers.length} players`;
  }

  const mode = compareState.positionMode || 'outfield';
  const config = STATS_CONFIG[mode];

  if (compareState.isBasicView) {
    config.basic.forEach((stat, idx) => {
      const row = createStatRow(stat, false, idx);
      grid.appendChild(row);
    });
  } else {
    config.basic.forEach((mainStat, idx) => {
      const mainRow = createStatRow(mainStat, false, idx);
      grid.appendChild(mainRow);
      const subcats = config.advanced[mainStat.name];
      if (subcats) {
        subcats.forEach(sub => {
          const subRow = createStatRow(sub, true, idx);
          grid.appendChild(subRow);
        });
      }
    });
  }

  if (compareState.selectedPlayers.length >= 2) {
    const totalRow = createTotalStatsRow();
    grid.appendChild(totalRow);
  }
}

function createStatRow(stat, isSub, idx) {
  const row = document.createElement('div');
  row.className = 'stat-row' + (isSub ? ' subcategory-row' : '');
  row.style.animationDelay = `${idx * 30}ms`;
  row.dataset.statField = stat.apiField;

  const nameCell = document.createElement('div');
  nameCell.className = 'stat-name-cell';
  nameCell.textContent = isSub ? `↳ ${stat.name}` : stat.name;
  row.appendChild(nameCell);

  const values = compareState.selectedPlayers.map(player => getCompareStatValue(player, stat));
  const colors = assignStatColors(values);

  compareState.selectedPlayers.forEach((player, i) => {
    const cell = document.createElement('div');
    cell.className = 'stat-value-cell';
    cell.dataset.playerLabel = resolveComparePlayerLabel(player, i);
    cell.dataset.playerId = resolveComparePlayerId(player) || '';
    const span = document.createElement('span');
    span.className = `stat-value ${colors[i]}`;
    const value = Number.isFinite(values[i]) ? values[i] : 0;
    span.textContent = value;
    cell.appendChild(span);
    row.appendChild(cell);
  });

  return row;
}

function createTotalStatsRow() {
  const row = document.createElement('div');
  row.className = 'stat-row total-row';
  row.dataset.totalRow = 'true';

  const nameCell = document.createElement('div');
  nameCell.className = 'stat-name-cell';
  nameCell.textContent = '🏆 TOTAL STATS';
  row.appendChild(nameCell);

  const totals = compareState.selectedPlayers.map(player => {
    const mode = compareState.positionMode || 'outfield';
    const config = STATS_CONFIG[mode];
    const stats = compareState.isBasicView ? config.basic : getAllStats(config);
    return stats.reduce((sum, s) => sum + getCompareStatValue(player, s), 0);
  });

  const colors = assignStatColors(totals);
  totals.forEach((total, i) => {
    const cell = document.createElement('div');
    cell.className = 'stat-value-cell total-cell';
    cell.dataset.playerLabel = resolveComparePlayerLabel(compareState.selectedPlayers[i], i);
    cell.dataset.playerId = resolveComparePlayerId(compareState.selectedPlayers[i]) || '';
    const span = document.createElement('span');
    span.className = `total-stats-value ${colors[i]}`;
    span.textContent = Number.isFinite(total) ? total : 0;
    cell.appendChild(span);
    row.appendChild(cell);
  });

  return row;
}

function getAllStats(config) {
  const all = [...config.basic];
  Object.values(config.advanced).forEach(group => {
    group.forEach(stat => {
      if (!all.some(s => s.apiField === stat.apiField)) {
        all.push(stat);
      }
    });
  });
  return all;
}

function assignStatColors(values) {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (!valid.length) return values.map(() => 'neutral');
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  const range = max - min;
  if (range === 0) return values.map(() => 'neutral');
  return values.map(v => {
    if (v === max) return 'green';
    if (v === min) return 'red';
    return 'yellow';
  });
}

function updateCompareStatsGridForPlayer(playerId) {
  const grid = document.getElementById('compare-stats-grid');
  if (!grid) return;
  const resolvedId = resolveComparePlayerId(playerId);
  if (!resolvedId) return;
  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index < 0) return;

  const rows = grid.querySelectorAll('.stat-row');
  if (!rows.length) {
    generateCompareStatsGrid();
    return;
  }

  const expectedCells = compareState.selectedPlayers.length;
  const needsRebuild = Array.from(rows).some(
    row => row.querySelectorAll('.stat-value-cell').length !== expectedCells
  );
  if (needsRebuild) {
    generateCompareStatsGrid();
    return;
  }

  const mode = compareState.positionMode || 'outfield';
  const config = STATS_CONFIG[mode];
  const totalStats = compareState.isBasicView ? config.basic : getAllStats(config);
  const colorClasses = ['green', 'red', 'yellow', 'neutral'];

  rows.forEach(row => {
    let values = [];
    if (row.dataset.totalRow === 'true') {
      values = compareState.selectedPlayers.map(player => {
        return totalStats.reduce((sum, stat) => sum + getCompareStatValue(player, stat), 0);
      });
    } else {
      const statField = row.dataset.statField;
      if (!statField) return;
      values = compareState.selectedPlayers.map(player =>
        getCompareStatValue(player, { apiField: statField })
      );
    }
    const colors = assignStatColors(values);
    const cells = row.querySelectorAll('.stat-value-cell');
    cells.forEach((cell, i) => {
      const span = cell.querySelector('span');
      if (!span) return;
      const value = Number.isFinite(values[i]) ? values[i] : 0;
      if (i === index) {
        span.textContent = value;
      }
      colorClasses.forEach(cls => span.classList.remove(cls));
      span.classList.add(colors[i] || 'neutral');
    });
  });

  compareLog('Stats grid updated', { playerId: resolvedId, index });
}

function restoreComparePreviewState() {
  const playerId = compareCustomizationContext.playerId;
  const initialPlayer = compareCustomizationContext.initialPlayer;
  if (!playerId || !initialPlayer) return;
  const resolvedId = resolveComparePlayerId(playerId);
  const index = compareState.selectedPlayers.findIndex(
    player => resolveComparePlayerId(player) === resolvedId
  );
  if (index < 0) return;
  compareState.selectedPlayers[index] = initialPlayer;
  compareLog('Customization preview reverted', { playerId: resolvedId });
  updateCompareCardForPlayer(resolvedId);
  updateCompareStatsGridForPlayer(resolvedId);
}

let compareCustomizationHooksInitialized = false;

function initializeCompareCustomizationHooks() {
  if (compareCustomizationHooksInitialized) return;
  compareCustomizationHooksInitialized = true;

  const originalGetSquadPlayerCustomization = window.getSquadPlayerCustomization;
  if (typeof originalGetSquadPlayerCustomization === 'function') {
    window.getSquadPlayerCustomization = function(playerId) {
      if (compareCustomizationContext.active) {
        return getCompareCustomization(playerId) || {};
      }
      return originalGetSquadPlayerCustomization(playerId);
    };
  }

  const originalSetSquadPlayerCustomization = window.setSquadPlayerCustomization;
  if (typeof originalSetSquadPlayerCustomization === 'function') {
    window.setSquadPlayerCustomization = function(playerId, updates = {}, reason = 'update') {
      if (compareCustomizationContext.active) {
        return;
      }
      return originalSetSquadPlayerCustomization(playerId, updates, reason);
    };
  }

  const originalApplySquadPlayerCustomization = window.applySquadPlayerCustomization;
  if (typeof originalApplySquadPlayerCustomization === 'function') {
    window.applySquadPlayerCustomization = function() {
      if (compareCustomizationContext.active) {
        applyCompareCustomization();
        return;
      }
      return originalApplySquadPlayerCustomization();
    };
  }

  const originalOpenSquadPlayerStatsView = window.openSquadPlayerStatsView;
  if (typeof originalOpenSquadPlayerStatsView === 'function') {
    window.openSquadPlayerStatsView = function() {
      if (compareCustomizationContext.active) {
        openComparePlayerStatsView();
        return;
      }
      return originalOpenSquadPlayerStatsView();
    };
  }

  const originalCloseSquadPlayerStatsView = window.closeSquadPlayerStatsView;
  if (typeof originalCloseSquadPlayerStatsView === 'function') {
    window.closeSquadPlayerStatsView = function() {
      if (compareCustomizationContext.active) {
        closeComparePlayerStatsView();
        return;
      }
      return originalCloseSquadPlayerStatsView();
    };
  }

  const originalRemoveSquadPlayer = window.removeSquadPlayer;
  if (typeof originalRemoveSquadPlayer === 'function') {
    window.removeSquadPlayer = function() {
      if (compareCustomizationContext.active) {
        removeComparePlayerById(compareCustomizationContext.playerId);
        if (compareCustomizationContext.active) {
          window.closePlayerCustomizationModal?.();
        }
        return;
      }
      return originalRemoveSquadPlayer();
    };
  }

  const originalClosePlayerCustomizationModal = window.closePlayerCustomizationModal;
  if (typeof originalClosePlayerCustomizationModal === 'function') {
    window.closePlayerCustomizationModal = function() {
      if (compareCustomizationContext.active) {
        closeCompareCustomizationModal();
        return;
      }
      return originalClosePlayerCustomizationModal();
    };
  }

  const originalSelectSquadRank = window.selectSquadRank;
  if (typeof originalSelectSquadRank === 'function') {
    window.selectSquadRank = async function(rankNumber, options = {}) {
      if (compareCustomizationContext.active) {
        return compareSelectRank(rankNumber, options);
      }
      return originalSelectSquadRank.call(this, rankNumber, options);
    };
  }

  const originalUpdateSquadTraining = window.updateSquadTraining;
  if (typeof originalUpdateSquadTraining === 'function') {
    window.updateSquadTraining = function(level) {
      if (compareCustomizationContext.active) {
        return compareUpdateTraining(level);
      }
      return originalUpdateSquadTraining.call(this, level);
    };
  }

  const originalResetSquadPlayerRank = window.resetSquadPlayerRank;
  if (typeof originalResetSquadPlayerRank === 'function') {
    window.resetSquadPlayerRank = function() {
      if (compareCustomizationContext.active) {
        return compareResetRank();
      }
      return originalResetSquadPlayerRank.call(this);
    };
  }
}

initializeCompareCustomizationHooks();
compareLog('Player Comparison Tool initialized');



// ============================================
// TOOLS MENU SYSTEM
// ============================================

function openToolsModal() {
  const modal = document.getElementById('tools-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeToolsModal() {
  const modal = document.getElementById('tools-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function openToolsSheet() {
  const sheet = document.getElementById('tools-sheet');
  if (sheet) {
    sheet.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}



function closeToolsSheet() {
  const sheet = document.getElementById('tools-sheet');
  if (sheet) {
    sheet.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function openTool(toolName) {
  closeToolsModal();
  closeToolsSheet();

  switch (toolName) {
    case 'squadbuilder':
        if (window.ZRouter) ZRouter.navigate('/squad-builder');
        else { switchView('squadbuilder'); openSquadBuilderModal(); }
        closeToolsModal(); closeToolsSheet();
        break;
    case 'compare':
        if (window.ZRouter) ZRouter.navigate('/compare');
        else openCompareModal();
        closeToolsModal(); closeToolsSheet();
        break;
    case 'cardgen':
      break;
    case 'programs':
      break;
    case 'pricetracker':
      break;
    case 'sync':
      break;
    case 'watchlist':
      switchView('watchlist');
      closeToolsModal();
      closeToolsSheet();
      break;
    case 'calculator':
      openROIModal();
      closeToolsModal();
      closeToolsSheet();
      break;

    case 'shardcalculator':
      switchView('shard-calculator');
      closeToolsModal();
      closeToolsSheet();
      setTimeout(() => initShardCalculator(), 100);
      break;

    case 'eventguide':
      switchView('event-guide');
      closeToolsModal();
      closeToolsSheet();
      break;
  }
}

document.addEventListener('click', function (event) {
  const modal = document.getElementById('tools-modal');
  const modalContent = document.querySelector('.tools-modal-content');

  if (modal && modal.classList.contains('active')) {
    if (modalContent && !modalContent.contains(event.target)) {
      closeToolsModal();
    }
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeToolsModal();
    closeToolsSheet();
  }
});

function initializeToolsMenu() {
  const toolsBtn = document.querySelector('.tools-btn');

  if (!toolsBtn) return;

  toolsBtn.addEventListener('click', function (e) {
    e.stopPropagation();

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      openToolsSheet();
    } else {
      openToolsModal();
    }
  });
}

let resizeTimeout;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    closeToolsModal();
    closeToolsSheet();
  }, 250);
});

if (document.getElementById('tools-sheet')) {
  const sheet = document.getElementById('tools-sheet');

  sheet.addEventListener('touchmove', function (e) {
    // Allow scrolling within the sheet
  }, { passive: true });
}






// ======== WATCHLIST FEATURE ========

// Extend state object with watchlist filters
state.watchlistFilters = {
  position: '',
  ratingMin: 40,
  ratingMax: 150,
  priceMin: null,
  priceMax: null,
  league: '',
  club: '',
  nation: '',
  skillMoves: ''
};

state.watchlistSearchQuery = '';
state.watchlistFilteredPlayers = [];
state.watchlistSortBy = 'ovr';
state.watchlistSortDirection = 'desc';

// Load watchlist when view is switched
async function loadWatchlist() {
  console.log('[WATCHLIST] Loading watchlist...');

  // Load saved filters
  const savedFilters = localStorage.getItem('watchlistFilters');
  if (savedFilters) {
    state.watchlistFilters = JSON.parse(savedFilters);
  }

  // Restore filter UI
  restoreWatchlistFilterUI();

  // Filter and render
  filterWatchlistPlayers();
  renderWatchlistPlayers();

  // Initialize event listeners
  initWatchlistEventListeners();

  console.log('[WATCHLIST] Watchlist loaded with', state.watchlist.length, 'players');
}

function restoreWatchlistFilterUI() {
  // Position
  const positionSelect = document.getElementById('watchlist-filter-position');
  if (positionSelect) {
    positionSelect.value = state.watchlistFilters.position || '';
  }

  // Rating
  const ratingMin = document.getElementById('watchlist-rating-min');
  const ratingMax = document.getElementById('watchlist-rating-max');
  if (ratingMin && ratingMax) {
    ratingMin.value = state.watchlistFilters.ratingMin || 40;
    ratingMax.value = state.watchlistFilters.ratingMax || 150;
    updateWatchlistRatingValue();
  }

  // Price
  const priceMin = document.getElementById('watchlist-price-min');
  const priceMax = document.getElementById('watchlist-price-max');
  if (priceMin && priceMax) {
    priceMin.value = state.watchlistFilters.priceMin || '';
    priceMax.value = state.watchlistFilters.priceMax || '';
    updateWatchlistPriceValue();
  }

  // League
  const leagueSelect = document.getElementById('watchlist-filter-league');
  if (leagueSelect) {
    leagueSelect.value = state.watchlistFilters.league || '';
  }

  // Club
  const clubSelect = document.getElementById('watchlist-filter-club');
  if (clubSelect) {
    clubSelect.value = state.watchlistFilters.club || '';
  }

  // Nation
  const nationInput = document.getElementById('watchlist-filter-nation-input');
  if (nationInput) {
    nationInput.value = state.watchlistFilters.nation || '';
    if (state.watchlistFilters.nation) {
      const flagUrl = getCountryFlagUrl(state.watchlistFilters.nation);
      const flagImg = document.getElementById('watchlist-filter-nation-flag');
      if (flagImg && flagUrl) {
        flagImg.src = flagUrl;
        flagImg.style.display = 'block';
      }
    }
  }

  // Skill Moves
  const skillMovesSelect = document.getElementById('watchlist-filter-skillmoves');
  if (skillMovesSelect) {
    skillMovesSelect.value = state.watchlistFilters.skillMoves || '';
  }
}

function initWatchlistEventListeners() {
  // Position filter
  const positionSelect = document.getElementById('watchlist-filter-position');
  if (positionSelect) {
    positionSelect.addEventListener('change', (e) => {
      state.watchlistFilters.position = e.target.value;
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Rating min
  const ratingMin = document.getElementById('watchlist-rating-min');
  if (ratingMin) {
    ratingMin.addEventListener('input', (e) => {
      state.watchlistFilters.ratingMin = parseInt(e.target.value) || 40;
      updateWatchlistRatingValue();
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Rating max
  const ratingMax = document.getElementById('watchlist-rating-max');
  if (ratingMax) {
    ratingMax.addEventListener('input', (e) => {
      state.watchlistFilters.ratingMax = parseInt(e.target.value) || 150;
      updateWatchlistRatingValue();
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Price min
  const priceMin = document.getElementById('watchlist-price-min');
  if (priceMin) {
    priceMin.addEventListener('input', (e) => {
      state.watchlistFilters.priceMin = e.target.value || null;
      updateWatchlistPriceValue();
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Price max
  const priceMax = document.getElementById('watchlist-price-max');
  if (priceMax) {
    priceMax.addEventListener('input', (e) => {
      state.watchlistFilters.priceMax = e.target.value || null;
      updateWatchlistPriceValue();
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // League filter
  const leagueSelect = document.getElementById('watchlist-filter-league');
  if (leagueSelect) {
    leagueSelect.addEventListener('change', (e) => {
      state.watchlistFilters.league = e.target.value;
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Club filter
  const clubSelect = document.getElementById('watchlist-filter-club');
  if (clubSelect) {
    clubSelect.addEventListener('change', (e) => {
      state.watchlistFilters.club = e.target.value;
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Skill Moves filter
  const skillMovesSelect = document.getElementById('watchlist-filter-skillmoves');
  if (skillMovesSelect) {
    skillMovesSelect.addEventListener('change', (e) => {
      state.watchlistFilters.skillMoves = e.target.value;
      saveWatchlistFilters();
      filterWatchlistPlayers();
      renderWatchlistPlayers();
      updateWatchlistFilterChips();
    });
  }

  // Search
  const searchInput = document.getElementById('watchlist-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.watchlistSearchQuery = e.target.value.toLowerCase();
      filterWatchlistPlayers();
      renderWatchlistPlayers();

      const clearBtn = document.getElementById('watchlist-search-clear');
      if (clearBtn) {
        clearBtn.style.display = state.watchlistSearchQuery ? 'block' : 'none';
      }
    });
  }

  // Search clear
  const searchClear = document.getElementById('watchlist-search-clear');
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      const searchInput = document.getElementById('watchlist-search-input');
      if (searchInput) {
        searchInput.value = '';
        state.watchlistSearchQuery = '';
        filterWatchlistPlayers();
        renderWatchlistPlayers();
        searchClear.style.display = 'none';
      }
    });
  }

  // Sort
  const sortSelect = document.getElementById('watchlist-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === 'ovr') {
        state.watchlistSortBy = 'overall_rating';
      } else if (value === 'price') {
        state.watchlistSortBy = 'price';
      } else if (value === 'name') {
        state.watchlistSortBy = 'name';
      } else if (value === 'position') {
        state.watchlistSortBy = 'position';
      }
      filterWatchlistPlayers();
      renderWatchlistPlayers();
    });
  }

  // Clear all filters
  const clearBtn = document.getElementById('watchlist-clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllWatchlistFilters);
  }

  // Browse Players button
  const browseBtn = document.getElementById('watchlist-browse-players-btn');
  if (browseBtn) {
    browseBtn.addEventListener('click', () => {
      switchView('database');
    });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('watchlist-filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', toggleWatchlistFiltersPanel);
  }

  // Nation autocomplete
  initWatchlistNationAutocomplete();
}

function initWatchlistNationAutocomplete() {
  const input = document.getElementById('watchlist-filter-nation-input');
  const list = document.getElementById('watchlist-filter-nation-list');
  const flagImg = document.getElementById('watchlist-filter-nation-flag');

  if (!input || !list) return;

  function render(items) {
    list.innerHTML = '';
    items.forEach(country => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      const flagUrl = getCountryFlagUrl(country);
      div.innerHTML = `
        ${flagUrl ? `<img src="${flagUrl}" alt="${country}" style="width: 16px; height: 16px; border-radius: 2px;">` : ''}
        <span class="autocomplete-text">${country}</span>
      `;
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectWatchlistNation(country);
      });
      list.appendChild(div);
    });
  }

  function selectWatchlistNation(country) {
    input.value = country;
    list.innerHTML = '';
    list.style.display = 'none';

    state.watchlistFilters.nation = country;

    const flagUrl = getCountryFlagUrl(country);
    if (flagUrl) {
      flagImg.src = flagUrl;
      flagImg.style.display = 'block';
    } else {
      flagImg.style.display = 'none';
    }

    saveWatchlistFilters();
    filterWatchlistPlayers();
    renderWatchlistPlayers();
    updateWatchlistFilterChips();
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      list.style.display = 'none';
      flagImg.style.display = 'none';
      flagImg.src = '';
      return;
    }

    const matches = COUNTRIES.filter(c => c.toLowerCase().includes(q)).slice(0, 40);
    render(matches);
    list.style.display = 'block';
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.innerHTML = '';
      list.style.display = 'none';
    }
  });
}

function updateWatchlistRatingValue() {
  const min = document.getElementById('watchlist-rating-min').value || 40;
  const max = document.getElementById('watchlist-rating-max').value || 150;
  const valueSpan = document.getElementById('watchlist-rating-value');
  if (valueSpan) {
    valueSpan.textContent = `${min}-${max}`;
  }
}

function updateWatchlistPriceValue() {
  const min = document.getElementById('watchlist-price-min').value;
  const max = document.getElementById('watchlist-price-max').value;
  const valueSpan = document.getElementById('watchlist-price-value');

  if (valueSpan) {
    if (!min && !max) {
      valueSpan.textContent = 'Any';
    } else if (min && max) {
      valueSpan.textContent = `${min}-${max}`;
    } else if (min) {
      valueSpan.textContent = `${min}+`;
    } else {
      valueSpan.textContent = `Up to ${max}`;
    }
  }
}

function filterWatchlistPlayers(playersSource) {
  // Use passed source or fall back to saved storage
  let filtered = playersSource || JSON.parse(localStorage.getItem('watchlistPlayers')) || [];

  // Apply position filter
  if (state.watchlistFilters.position) {
    filtered = filtered.filter(p => p.position === state.watchlistFilters.position);
  }

  // Apply rating range
  filtered = filtered.filter(p => {
    const rating = p.ovr || p.overall_rating || 0; // Handle both key names
    return rating >= state.watchlistFilters.ratingMin && rating <= state.watchlistFilters.ratingMax;
  });

  // Apply league filter
  if (state.watchlistFilters.league) {
    filtered = filtered.filter(p => p.league === state.watchlistFilters.league);
  }

  // Apply club filter
  if (state.watchlistFilters.club) {
    filtered = filtered.filter(p => p.team === state.watchlistFilters.club);
  }

  // Apply nation filter
  if (state.watchlistFilters.nation) {
    filtered = filtered.filter(p => p.nation === state.watchlistFilters.nation);
  }

  // Apply skill moves
  if (state.watchlistFilters.skillMoves) {
    const skillLevel = parseInt(state.watchlistFilters.skillMoves);
    filtered = filtered.filter(p => (p.skill_moves || 0) >= skillLevel);
  }

  // Apply search
  if (state.watchlistSearchQuery) {
    const q = state.watchlistSearchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.position && p.position.toLowerCase().includes(q)) ||
        (p.team && p.team.toLowerCase().includes(q))
      );
    });
  }

  // Apply sort
  filtered.sort((a, b) => {
    let aVal, bVal;

    // Normalize keys (API sometimes uses 'ovr', sometimes 'overall_rating')
    const getOvr = (p) => p.ovr || p.overall_rating || 0;

    if (state.watchlistSortBy === 'ovr' || state.watchlistSortBy === 'overall_rating') {
      aVal = getOvr(a);
      bVal = getOvr(b);
    } else if (state.watchlistSortBy === 'price') {
      aVal = a.price || 0;
      bVal = b.price || 0;
    } else if (state.watchlistSortBy === 'name') {
      aVal = (a.name || '').toLowerCase();
      bVal = (b.name || '').toLowerCase();
    } else if (state.watchlistSortBy === 'position') {
      aVal = (a.position || '').toLowerCase();
      bVal = (b.position || '').toLowerCase();
    }

    if (state.watchlistSortDirection === 'desc') {
      return typeof aVal === 'string' ? aVal.localeCompare(bVal) : bVal - aVal;
    } else {
      return typeof aVal === 'string' ? bVal.localeCompare(aVal) : aVal - bVal;
    }
  });

  state.watchlistFilteredPlayers = filtered;
}


function renderWatchlistPlayers() {
  const grid = document.getElementById('watchlist-grid');
  const emptyState = document.getElementById('watchlist-empty-state');
  const countBadge = document.getElementById('watchlist-count-badge');

  if (!grid || !emptyState) return;

  // Update count badge
  if (countBadge) {
    countBadge.textContent = `${state.watchlist.length} Player${state.watchlist.length !== 1 ? 's' : ''}`;
  }

  // CASE 1: Watchlist is completely empty (User has never added anyone)
  if (state.watchlist.length === 0) {
    grid.innerHTML = '';
    grid.style.display = 'none';
    emptyState.style.display = 'flex'; // Show "Browse Players" button
    return; // Stop here
  }

  // CASE 2: Watchlist has players, but filters match nothing
  if (state.watchlistFilteredPlayers.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <div style="font-size: 24px; margin-bottom: 10px;">🔍</div>
        <h3 style="color: var(--color-text-primary); margin-bottom: 5px;">No players match your filters</h3>
        <p style="color: var(--color-text-secondary);">Try clearing filters or search.</p>
      </div>
    `;
    grid.style.display = 'grid'; // Show the "No Results" message
    emptyState.style.display = 'none'; // Hide "Browse Players"
    return;
  }

  // CASE 3: Show Players
  grid.innerHTML = '';
  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  state.watchlistFilteredPlayers.forEach((player, index) => {
    const card = createWatchlistPlayerCard(player);
    // Add simple fade-in animation
    card.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
    grid.appendChild(card);
  });
}


function createWatchlistPlayerCard(player) {
  const card = document.createElement('div');
  card.className = 'player-card';
  card.dataset.playerId = player.player_id;

  const overallColor = getRatingColor(player.overall_rating);

  card.innerHTML = `
    <div class="player-card-header">
      <div class="player-card-rating" style="background: ${overallColor};">
        <span>${player.overall_rating || 'N/A'}</span>
      </div>
      <button class="player-card-watchlist-btn" data-player-id="${player.player_id}" title="Remove from watchlist">
        ❌
      </button>
    </div>
    <div class="player-card-body">
      <h3 class="player-card-name">${player.name || 'Unknown'}</h3>
      <p class="player-card-position">${player.position || 'N/A'} • ${player.team || 'N/A'}</p>
      <div class="player-card-info">
        <span class="player-info-item">
          <span class="info-label">Nation</span>
          ${getCountryFlagUrl(player.nation) ? `<img src="${getCountryFlagUrl(player.nation)}" alt="${player.nation}" style="width: 16px; height: 16px; border-radius: 2px;">` : ''}
          <span>${player.nation || 'N/A'}</span>
        </span>
      </div>
    </div>
  `;

  // Remove from watchlist button
  const removeBtn = card.querySelector('.player-card-watchlist-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromWatchlist(player.player_id);
    });
  }

  return card;
}

function removeFromWatchlist(playerId) {
  state.watchlist = state.watchlist.filter(p => p.player_id !== playerId);
  localStorage.setItem('watchlist', JSON.stringify(state.watchlist));

  filterWatchlistPlayers();
  renderWatchlistPlayers();
}

function clearAllWatchlistFilters() {
  state.watchlistFilters = {
    position: '',
    ratingMin: 40,
    ratingMax: 150,
    priceMin: null,
    priceMax: null,
    league: '',
    club: '',
    nation: '',
    skillMoves: ''
  };

  state.watchlistSearchQuery = '';

  // Reset UI
  document.getElementById('watchlist-filter-position').value = '';
  document.getElementById('watchlist-rating-min').value = 40;
  document.getElementById('watchlist-rating-max').value = 150;
  document.getElementById('watchlist-price-min').value = '';
  document.getElementById('watchlist-price-max').value = '';
  document.getElementById('watchlist-filter-league').value = '';
  document.getElementById('watchlist-filter-club').value = '';
  document.getElementById('watchlist-filter-nation-input').value = '';
  document.getElementById('watchlist-filter-skillmoves').value = '';
  document.getElementById('watchlist-search-input').value = '';

  const flagImg = document.getElementById('watchlist-filter-nation-flag');
  if (flagImg) {
    flagImg.style.display = 'none';
    flagImg.src = '';
  }

  updateWatchlistRatingValue();
  updateWatchlistPriceValue();

  saveWatchlistFilters();
  filterWatchlistPlayers();
  renderWatchlistPlayers();
  updateWatchlistFilterChips();
}

function updateWatchlistFilterChips() {
  const container = document.getElementById('watchlist-active-filters');
  if (!container) return;

  // FIX: Clear the container and do NOT render any chips.
  // This keeps the filters active in the background but hides the visual tags.
  container.innerHTML = '';
  container.style.display = 'none';


  const chips = [];

  if (state.watchlistFilters.position) {
    chips.push({ name: 'Position', value: state.watchlistFilters.position, type: 'position' });
  }
  if (state.watchlistFilters.ratingMin !== 40 || state.watchlistFilters.ratingMax !== 150) {
    chips.push({ name: 'Rating', value: `${state.watchlistFilters.ratingMin}-${state.watchlistFilters.ratingMax}`, type: 'rating' });
  }
  if (state.watchlistFilters.league) {
    chips.push({ name: 'League', value: state.watchlistFilters.league, type: 'league' });
  }
  if (state.watchlistFilters.club) {
    chips.push({ name: 'Club', value: state.watchlistFilters.club, type: 'club' });
  }
  if (state.watchlistFilters.nation) {
    chips.push({ name: 'Nation', value: state.watchlistFilters.nation, type: 'nation' });
  }
  if (state.watchlistFilters.skillMoves) {
    const skillLabels = { '1': '★', '2': '★★', '3': '★★★', '4': '★★★★', '5': '★★★★★' };
    chips.push({ name: 'Skill Moves', value: skillLabels[state.watchlistFilters.skillMoves] || state.watchlistFilters.skillMoves, type: 'skillMoves' });
  }

  container.innerHTML = '';
  chips.forEach(chip => {
    const el = document.createElement('div');
    el.className = 'filter-chip';
    el.innerHTML = `
      <span>${chip.name}: <strong>${chip.value}</strong></span>
      <button type="button" data-filter-type="${chip.type}">✕</button>
    `;
    el.querySelector('button').addEventListener('click', () => {
      removeWatchlistFilter(chip.type);
    });
    container.appendChild(el);
  });
}

function removeWatchlistFilter(filterType) {
  if (filterType === 'position') {
    state.watchlistFilters.position = '';
    document.getElementById('watchlist-filter-position').value = '';
  } else if (filterType === 'rating') {
    state.watchlistFilters.ratingMin = 40;
    state.watchlistFilters.ratingMax = 150;
    document.getElementById('watchlist-rating-min').value = 40;
    document.getElementById('watchlist-rating-max').value = 150;
    updateWatchlistRatingValue();
  } else if (filterType === 'league') {
    state.watchlistFilters.league = '';
    document.getElementById('watchlist-filter-league').value = '';
  } else if (filterType === 'club') {
    state.watchlistFilters.club = '';
    document.getElementById('watchlist-filter-club').value = '';
  } else if (filterType === 'nation') {
    state.watchlistFilters.nation = '';
    document.getElementById('watchlist-filter-nation-input').value = '';
    const flagImg = document.getElementById('watchlist-filter-nation-flag');
    if (flagImg) {
      flagImg.style.display = 'none';
      flagImg.src = '';
    }
  } else if (filterType === 'skillMoves') {
    state.watchlistFilters.skillMoves = '';
    document.getElementById('watchlist-filter-skillmoves').value = '';
  }

  saveWatchlistFilters();
  filterWatchlistPlayers();
  renderWatchlistPlayers();
  updateWatchlistFilterChips();
}

function toggleWatchlistFiltersPanel() {
  const sidebar = document.getElementById('watchlist-filters-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

function saveWatchlistFilters() {
  localStorage.setItem('watchlistFilters', JSON.stringify(state.watchlistFilters));
}

function getWatchlistCount() {
  return state.watchlist.length;
}

// Helper function to get color for rating
function getRatingColor(rating) {
  if (!rating) return '#666';
  if (rating >= 90) return '#FFD700';
  if (rating >= 80) return '#C0C0C0';
  if (rating >= 70) return '#CD7F32';
  return '#666';
}



/* ------------- from here filter and stats for squad builder -------------------------------*/
/* ------------- from here filter and stats for squad builder -------------------------------*/

// Listen for filter changes in squad builder
document.addEventListener('filterChanged', () => {
  // If squad builder is open, update filtered players
  if (squadState && typeof applyFiltersToPickerPlayers === 'function') {
    applyFiltersToPickerPlayers();
  }

});


// Market Under Construction Modal Functions
function openMarketModal() {
    const modal = document.getElementById('market-construction-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMarketModal() {
    const modal = document.getElementById('market-construction-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    // Redirect to homepage
    switchView('database');
}

// Intercept Market navigation clicks - UPDATED
document.addEventListener('DOMContentLoaded', () => {
    // Desktop Market button
    const desktopMarketBtns = document.querySelectorAll('.nav-link[data-view="market"]');
    desktopMarketBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMarketModal();
        });
    });
    
    // Mobile Market button
    const mobileMarketBtns = document.querySelectorAll('.mobile-nav-btn[data-view="market"]');
    mobileMarketBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMarketModal();
        });
    });
});


// ========== DATABASE HORIZONTAL SCROLL SYNC ==========
function initDatabaseScrollSync() {
    const playersGrid = document.getElementById('players-grid');
    if (!playersGrid) return;

    // Check if top scrollbar already exists
    let topScrollbar = document.getElementById('database-top-scrollbar');
    
    // Create top scrollbar if it doesn't exist
    if (!topScrollbar) {
        topScrollbar = document.createElement('div');
        topScrollbar.id = 'database-top-scrollbar';
        topScrollbar.className = 'database-top-scrollbar';
        topScrollbar.innerHTML = '<div class="database-scrollbar-content"></div>';
        
        // Insert before players grid
        playersGrid.parentNode.insertBefore(topScrollbar, playersGrid);
    }

    const scrollbarContent = topScrollbar.querySelector('.database-scrollbar-content');
    const statRows = playersGrid.querySelectorAll('.player-card-stats-row');

    if (statRows.length === 0) {
        topScrollbar.style.display = 'none';
        return;
    }

    // Show scrollbar
    topScrollbar.style.display = 'block';

    // Calculate max scroll width from all stat rows
    let maxScrollWidth = 0;
    statRows.forEach(row => {
        if (row.scrollWidth > maxScrollWidth) {
            maxScrollWidth = row.scrollWidth;
        }
    });

    // Set scrollbar content width
    scrollbarContent.style.width = `${maxScrollWidth}px`;

    // Remove old listeners to avoid duplicates
    topScrollbar.replaceWith(topScrollbar.cloneNode(true));
    topScrollbar = document.getElementById('database-top-scrollbar');

    // Top scrollbar controls all rows
    topScrollbar.addEventListener('scroll', () => {
        const scrollLeft = topScrollbar.scrollLeft;
        statRows.forEach(row => {
            row.scrollLeft = scrollLeft;
        });
    });

    // Any row scroll updates top scrollbar
    statRows.forEach(row => {
        row.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = row.scrollLeft;
        });
    });

    console.log('✅ Database scroll sync initialized:', statRows.length, 'rows');
}

// Expose inline HTML handler targets when running as an ES module bundle.
window.applyMobileFilters = applyMobileFilters;
window.calculateROIModal = calculateROIModal;
window.clearMobileFilters = clearMobileFilters;
window.closeCompareModal = closeCompareModal;
window.closeCompareSearch = closeCompareSearch;
window.closeMarketModal = closeMarketModal;
window.closeROIModal = closeROIModal;
window.closeToolsModal = closeToolsModal;
window.closeToolsSheet = closeToolsSheet;
window.exportSquad = exportSquad;
window.handleSearch = handleSearch;
window.handleWatchlistSearch = handleWatchlistSearch;
window.loadSquad = loadSquad;
window.openTool = openTool;
window.openToolsSheet = openToolsSheet;
window.resetROIModal = resetROIModal;
window.saveSquad = saveSquad;
window.switchCompareStatsView = switchCompareStatsView;
window.switchView = switchView;
window.toggleMobileFilters = toggleMobileFilters;
window.toggleToolsDropdown = toggleToolsDropdown;




/* ===== Run deferred DOMContentLoaded handlers ===== */
if (document.readyState !== 'loading') {
  document.addEventListener = __legacyOrigAddEventListener;
  if (__legacyDCLQueue.length) {
    console.log('[legacy-bundle] Document already loaded; running', __legacyDCLQueue.length, 'deferred DOMContentLoaded handlers.');
    const __dclEvent = new Event('DOMContentLoaded');
    for (const { handler: __handler } of __legacyDCLQueue) {
      try { __handler(__dclEvent); } catch (__e) { console.error('[legacy-bundle] DOMContentLoaded handler error:', __e); }
    }
  }
}
