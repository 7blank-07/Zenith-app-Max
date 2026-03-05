import WatchlistInteractions from '../components/WatchlistInteractions.client';
import SiteChrome from '../components/SiteChrome';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Watchlist | Zenith',
  description: 'Track your saved players with filters, sorting, and quick access to details.',
  alternates: { canonical: '/watchlist' },
  openGraph: {
    title: 'Watchlist | Zenith',
    description: 'Track your saved players with filters, sorting, and quick access to details.',
    url: `${siteUrl}/watchlist`,
    siteName: 'Zenith',
    type: 'website'
  }
};

export default function WatchlistPage() {
  return (
    <SiteChrome activeView="watchlist">
      <main className="main-content">
        <div id="watchlist-view" className="view active">
        <div className="mobile-search-container">
          <button className="mobile-filter-icon" id="watchlist-mobile-filter-toggle" aria-label="Open Filters" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2" fill="currentColor" />
              <circle cx="16" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
            <span className="filter-badge" id="watchlist-filter-badge" style={{ display: 'none' }} />
          </button>

          <input type="text" className="mobile-search-input" id="watchlist-mobile-search" placeholder="Search watchlist..." />

          <button className="mobile-search-icon" aria-label="Search" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        <div className="database-layout">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="btn btn-text btn-sm" id="clear-watchlist-filters" type="button">
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Position</label>
              <select id="watchlist-filter-position" className="filter-select">
                <option value="">All Positions</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                Overall Rating <span id="watchlist-rating-value">40-150</span>
              </label>
              <div className="range-inputs">
                <input type="number" id="watchlist-rating-min" defaultValue="40" min="40" max="150" className="range-input" />
                <span>-</span>
                <input type="number" id="watchlist-rating-max" defaultValue="150" min="40" max="150" className="range-input" />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">League</label>
              <select id="watchlist-filter-league" className="filter-select">
                <option value="">All Leagues</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Club</label>
              <select id="watchlist-filter-team" className="filter-select">
                <option value="">All Clubs</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Nation</label>
              <select id="watchlist-filter-nation" className="filter-select">
                <option value="">All Nations</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Event</label>
              <select id="watchlist-filter-event" className="filter-select">
                <option value="">All Events</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Skill Moves</label>
              <select id="watchlist-filter-skill" className="filter-select">
                <option value="">Any</option>
              </select>
            </div>
          </aside>

          <div className="database-content">
            <div className="database-toolbar">
              <div className="search-container">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" id="watchlist-search-input" className="search-input" placeholder="Search watchlist..." />
              </div>

              <select id="watchlist-sort-select" className="sort-select" defaultValue="Name">
                <option value="Name">Sort by Name</option>
                <option value="Rating">Sort by OVR</option>
                <option value="Price">Sort by Price</option>
              </select>
            </div>

            <div className="active-filters" id="watchlist-active-filters" />

            <div
              className="results-info"
              id="watchlist-results-count"
              style={{ marginBottom: '1rem', color: '#d4d4d4', fontSize: '1.1rem', marginLeft: '8px' }}
            >
              0 players in watchlist
            </div>

            <div className="watchlist-grid" id="watchlist-players-grid" />

            <div className="watchlist-empty-state" id="watchlist-empty-state" style={{ display: 'none' }}>
              <h3>Your watchlist is empty</h3>
              <p>Start adding players to track stats, prices, and updates.</p>
              <button className="btn btn-primary" id="browse-players-btn" type="button">
                Browse Players
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
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                Overall Rating <span id="mobile-watchlist-rating-value">40-150</span>
              </label>
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
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Club</label>
              <select id="mobile-filter-team" className="filter-select">
                <option value="">All Clubs</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Nation</label>
              <select id="mobile-filter-nation" className="filter-select">
                <option value="">All Nations</option>
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
        id="watchlist-preview-popup"
        style={{
          position: 'fixed',
          zIndex: 1200,
          display: 'none',
          pointerEvents: 'none',
          width: '120px'
        }}
      >
        <div id="watchlist-preview-content" />
      </div>

        <WatchlistInteractions />
      </main>
    </SiteChrome>
  );
}
