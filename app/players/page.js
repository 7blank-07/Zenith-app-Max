import PlayersDatabaseInteractions from '../components/PlayersDatabaseInteractions.client';
import SiteChrome from '../components/SiteChrome';
import { getPlayerUniqueId } from '../../src/lib/legacy-parity-contract.mjs';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../../src/lib/server/player-seo-contract.mjs';
import { getPrerenderRolloutState } from '../../src/lib/server/prerender-rollout.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const LISTING_LIMIT = 120;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Player Database | Zenith',
  description: 'Player database with search, filters, stats controls, and watchlist interactions.',
  alternates: { canonical: '/players' },
  openGraph: {
    title: 'Player Database | Zenith',
    description: 'Player database with search, filters, stats controls, and watchlist interactions.',
    url: `${siteUrl}/players`,
    siteName: 'Zenith',
    type: 'website'
  }
};

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
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

function getPlayerType(player) {
  return player.leagueImage ? 'normal' : 'hero';
}

function readStat(player, statKey) {
  const value = Number(player?.attributes?.[statKey]);
  return Number.isFinite(value) ? value : 0;
}

function formatStat(value) {
  return value > 0 ? value : '-';
}

function formatPrice(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe) || safe <= 0) return '0';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${Math.round(safe / 1000)}K`;
  return String(Math.round(safe));
}

function parseAlternatePositions(player) {
  return String(player?.alternatePosition || '')
    .split(',')
    .map((position) => position.trim().toUpperCase())
    .filter((position) => position && position !== '0');
}

function buildPlayersJsonLd(players) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: players.map((player, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/player/${encodeURIComponent(player.playerId)}`,
      name: player.name
    }))
  };
}

function renderPlayerRow(player) {
  const uniqueId = getPlayerUniqueId({
    playerId: player.playerId,
    rank: 0,
    is_untradable: player.isUntradable
  });
  const playerType = getPlayerType(player);
  const alternatePositions = parseAlternatePositions(player);
  const pace = readStat(player, 'pace');
  const shooting = readStat(player, 'shooting');
  const passing = readStat(player, 'passing');
  const dribbling = readStat(player, 'dribbling');
  const defending = readStat(player, 'defending');
  const physical = readStat(player, 'physical');
  const price = Number(player.price);
  const hasPrice = Number.isFinite(price) && price > 0;

  return (
    <div
      key={player.playerId}
      className="player-row"
      data-player-id={player.playerId}
      data-unique-id={uniqueId}
      data-name={player.name || ''}
      data-position={player.position || ''}
      data-league={player.league || ''}
      data-club={player.club || ''}
      data-nation={player.nation || ''}
      data-event=""
      data-ovr={player.ovr || 0}
      data-skill={player.skillMoves || 0}
      data-pac={pace}
      data-sho={shooting}
      data-pas={passing}
      data-dri={dribbling}
      data-def={defending}
      data-phy={physical}
      data-price={hasPrice ? price : 0}
    >
      <div className="player-card-scale">
        <div className="player-row-card">
          <div className="player-card-image-container">
            <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card Background" className="player-card-bg-image" />
            <img src={player.playerImage || 'https://via.placeholder.com/200x300'} alt={player.name} className="player-card-main-image" />
            <span className="player-initials">{getInitials(player.name)}</span>

            <div className="player-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
              {player.name}
            </div>
            <div className="player-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
              {player.ovr || '?'}
            </div>
            <div className="player-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
              {player.position || '?'}
            </div>

            <img
              src={player.nationFlag || ''}
              alt="Nation"
              className={`player-view-card-nation-flag ${
                playerType === 'normal' ? 'normal-players-nation-flag' : 'hero-icon-players-nation-flag'
              }`}
            />
            <img
              src={player.clubFlag || ''}
              alt="Club"
              className={`player-view-card-club-flag ${playerType === 'normal' ? 'normal-club-players-flag' : 'hero-icon-club-players-flag'}`}
            />
            {playerType === 'normal' && !!player.leagueImage && (
              <img src={player.leagueImage} alt="League" className="player-view-card-league-flag normal-league-players-flag" />
            )}

            {player.isUntradable && (
              <div className="card-untradable-badge" style={{ pointerEvents: 'none' }}>
                <img src="/assets/images/untradable_img.png" alt="Untradable" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="player-row-info">
        <div className="player-info-name">{player.name}</div>
        <div className="player-info-meta">
          {player.ovr || 'N/A'} • {player.position || 'N/A'}
        </div>
        <div
          className="player-price"
          style={{ color: '#fbbf24', fontWeight: 500, fontSize: '0.9rem', marginTop: '4px', minHeight: '20px', display: 'flex', alignItems: 'center' }}
        >
          {player.isUntradable ? (
            <img
              src="/assets/images/untradable-red-flag.png"
              alt="Non-auctionable"
              style={{ height: '18px', width: 'auto', verticalAlign: 'middle', opacity: 0.95, marginLeft: '6px' }}
              title="Non-auctionable"
            />
          ) : (
            <span className="price-inline">
              <img src="/assets/images/background/fc coin img.webp" alt="coin" className="price-icon" />
              <span className="price-text">{hasPrice ? formatPrice(price) : 'No data'}</span>
            </span>
          )}
        </div>
        {!!alternatePositions.length && (
          <div className="player-info-secondary">
            {alternatePositions.map((position) => (
              <span key={`${player.playerId}-${position}`} className="secondary-position-badge">
                {position}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="player-row-stats player-card-stats-row">
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(pace)}</div>
          <div className="stat-pill-label">PAC</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(shooting)}</div>
          <div className="stat-pill-label">SHO</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(passing)}</div>
          <div className="stat-pill-label">PAS</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(dribbling)}</div>
          <div className="stat-pill-label">DRI</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(defending)}</div>
          <div className="stat-pill-label">DEF</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-value">{formatStat(physical)}</div>
          <div className="stat-pill-label">PHY</div>
        </div>
      </div>

      <button className="player-row-watchlist" data-unique-id={uniqueId} aria-label={`Toggle watchlist for ${player.name}`} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}

function renderSelectOptions(options) {
  return options.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ));
}

export default async function PlayersPage() {
  const startedAt = Date.now();
  const rollout = getPrerenderRolloutState();
  const topIds = await readTopPlayerIds(LISTING_LIMIT);
  const players = await fetchPlayersByIds(topIds, { rank: 0 });
  const jsonLd = buildPlayersJsonLd(players);

  const positions = uniqueSorted(players.map((player) => player.position));
  const leagues = uniqueSorted(players.map((player) => player.league));
  const clubs = uniqueSorted(players.map((player) => player.club));
  const nations = uniqueSorted(players.map((player) => player.nation));
  const skillMoves = uniqueSorted(players.map((player) => player.skillMoves).filter((value) => Number(value) > 0)).sort((a, b) => Number(b) - Number(a));

  console.info('[metrics] /players render', {
    elapsedMs: Date.now() - startedAt,
    listedPlayers: players.length,
    prerenderTier: rollout.tier,
    prerenderLimit: rollout.limit
  });

  return (
    <SiteChrome activeView="players">
      <main className="main-content">
        <div id="database-view" className="view active">
          <div className="mobile-search-container">
            <button className="mobile-filter-icon" id="mobile-filter-toggle" aria-label="Open Filters" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="8" cy="6" r="2" fill="currentColor" />
                <circle cx="16" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="18" r="2" fill="currentColor" />
              </svg>
            </button>
            <input type="text" id="mobile-player-search" className="mobile-search-input" placeholder="Search players..." />
            <button className="mobile-search-icon" aria-label="Search" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          <div className="database-layout" style={{ position: 'relative', zIndex: 2, minHeight: '100vh', padding: '2rem 0', background: 'transparent' }}>
            <aside
              className="filters-sidebar"
              style={{
                background: 'rgba(20,24,28,0.5)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255,255,255,0.15)',
                zIndex: 3
              }}
            >
              <div className="filters-header">
                <h3>Filters</h3>
                <button className="btn btn-text btn-sm" id="clear-filters" type="button">
                  Clear All
                </button>
              </div>

              <div className="filter-group">
                <label className="filter-label">Position</label>
                <select id="filter-position" className="filter-select">
                  <option value="">All Positions</option>
                  {renderSelectOptions(positions)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Overall Rating: <span id="rating-value">40-150</span>
                </label>
                <div className="range-inputs">
                  <input type="number" id="rating-min" defaultValue="40" min="40" max="150" className="range-input" />
                  <span>-</span>
                  <input type="number" id="rating-max" defaultValue="150" min="40" max="150" className="range-input" />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">League</label>
                <select id="filter-league" className="filter-select">
                  <option value="">All Leagues</option>
                  {renderSelectOptions(leagues)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Club</label>
                <select id="filter-club" className="filter-select">
                  <option value="">All Clubs</option>
                  {renderSelectOptions(clubs)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Nation</label>
                <select id="filter-nation" className="filter-select">
                  <option value="">All Nations</option>
                  {renderSelectOptions(nations)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Event</label>
                <select id="filter-event" className="filter-select">
                  <option value="">All Events</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Skill Moves</label>
                <select id="filter-skill" className="filter-select">
                  <option value="">Any</option>
                  {renderSelectOptions(skillMoves)}
                </select>
              </div>
            </aside>

            <div className="database-content" style={{ background: 'transparent', zIndex: 3 }}>
              <div className="database-toolbar">
                <div className="search-container">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input type="text" id="player-search" placeholder="Search by name..." className="search-input" />
                </div>

                <div className="toolbar-actions">
                  <button id="open-stats-modal" className="stats-btn" type="button">
                    <span className="stats-icon" />
                    Stats
                  </button>
                </div>

                <div className="toolbar-actions">
                  <select id="sort-by" className="sort-select">
                    <option value="name">Sort by Name</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>
              </div>

              <div className="active-filters" id="active-filters" />

              <div className="results-info" id="players-results-info" style={{ marginBottom: '1rem', color: '#d4d4d4', fontSize: '1.1rem', marginLeft: '8px' }}>
                {players.length} players shown
              </div>

              <div className="players-grid" id="players-grid" style={{ background: 'transparent', minHeight: '60vh' }}>
                {players.map(renderPlayerRow)}
              </div>

              <div className="load-more-wrapper">
                <button id="load-more-btn" className="btn btn-primary load-more-btn" style={{ display: 'none' }} type="button">
                  Load More Players
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="stats-modal-wrapper" id="custom-stats-modal">
        <div className="stats-modal-backdrop" id="stats-modal-backdrop" />
        <div className="stats-modal-container">
          <div className="stats-modal-header">
            <div className="stats-modal-title-group">
              <h2 className="stats-modal-title">Advanced Stats Filter</h2>
            </div>
            <button className="stats-modal-close" id="close-stats-modal" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="stats-modal-content">
            <div className="stats-section">
              <div className="section-header">
                <h3 className="section-title">Minimum Stat Thresholds</h3>
              </div>
              <div className="price-tiers-grid">
                <label className="price-tier-btn">
                  PAC
                  <input id="stats-filter-pac" type="number" min="0" max="200" defaultValue="0" />
                </label>
                <label className="price-tier-btn">
                  SHO
                  <input id="stats-filter-sho" type="number" min="0" max="200" defaultValue="0" />
                </label>
                <label className="price-tier-btn">
                  PAS
                  <input id="stats-filter-pas" type="number" min="0" max="200" defaultValue="0" />
                </label>
                <label className="price-tier-btn">
                  DRI
                  <input id="stats-filter-dri" type="number" min="0" max="200" defaultValue="0" />
                </label>
                <label className="price-tier-btn">
                  DEF
                  <input id="stats-filter-def" type="number" min="0" max="200" defaultValue="0" />
                </label>
                <label className="price-tier-btn">
                  PHY
                  <input id="stats-filter-phy" type="number" min="0" max="200" defaultValue="0" />
                </label>
              </div>
            </div>
          </div>

          <div className="stats-modal-footer">
            <div className="footer-actions">
              <button className="btn-secondary" id="reset-stats-filters" type="button">
                Reset
              </button>
              <button className="btn-primary" id="apply-stats-filters" type="button">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-filter-modal" id="mobile-filter-modal">
        <div className="mobile-filter-backdrop" id="mobile-filter-backdrop" />
        <div className="mobile-filter-drawer">
          <div className="mobile-filter-header">
            <h3>Filters</h3>
            <button className="mobile-filter-close" id="mobile-filter-close" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mobile-filter-content">
            <div className="filter-group">
              <label className="filter-label">Position</label>
              <select id="mobile-filter-position" className="filter-select">
                <option value="">All Positions</option>
                {renderSelectOptions(positions)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Overall Rating <span id="mobile-rating-value">40-150</span></label>
              <div className="range-inputs">
                <input type="number" id="mobile-rating-min" defaultValue="40" min="40" max="150" className="range-input" />
                <span>-</span>
                <input type="number" id="mobile-rating-max" defaultValue="150" min="40" max="150" className="range-input" />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">League</label>
              <select id="mobile-filter-league" className="filter-select">
                <option value="">All Leagues</option>
                {renderSelectOptions(leagues)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Club</label>
              <select id="mobile-filter-team" className="filter-select">
                <option value="">All Clubs</option>
                {renderSelectOptions(clubs)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Nation</label>
              <select id="mobile-filter-nation" className="filter-select">
                <option value="">All Nations</option>
                {renderSelectOptions(nations)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Event</label>
              <select id="mobile-filter-event" className="filter-select">
                <option value="">All Events</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Skill Moves</label>
              <select id="mobile-filter-skill" className="filter-select">
                <option value="">Any</option>
                {renderSelectOptions(skillMoves)}
              </select>
            </div>
          </div>

          <div className="mobile-filter-footer">
            <button className="btn-secondary" id="mobile-clear-filters" type="button">
              Clear All
            </button>
            <button className="btn-primary" id="mobile-apply-filters" type="button">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div
        id="player-preview-popup"
        style={{
          position: 'fixed',
          zIndex: 1200,
          display: 'none',
          pointerEvents: 'none',
          width: '120px'
        }}
      >
        <div id="player-preview-content" />
      </div>

      <PlayersDatabaseInteractions />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </SiteChrome>
  );
}
