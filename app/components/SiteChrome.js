import SiteChromeInteractions from './SiteChromeInteractions.client';
import MarketNavLink from './MarketNavLink.client';

function getNavClass(activeView, view) {
  return activeView === view ? 'nav-link active' : 'nav-link';
}

export default function SiteChrome({ activeView = '', showSlider = true, children }) {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <a href="/" data-link="" data-nav-link="" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src="/assets/images/zenith_logo_svg.svg" alt="Zenith logo" className="logo-image" />
              <span className="logo-text">Zenith</span>
            </a>
          </div>

          <nav className="nav-desktop">
            <a href="/" data-link="" data-nav-link="" className={getNavClass(activeView, 'home')}>
              Home
            </a>
            <a href="/players" data-link="" data-nav-link="" className={getNavClass(activeView, 'players')}>
              Players
            </a>
            <MarketNavLink href="/market" data-link="" data-nav-link="" className={getNavClass(activeView, 'market')}>
              Market
            </MarketNavLink>
            <a href="/watchlist" data-link="" data-nav-link="" className={getNavClass(activeView, 'watchlist')}>
              Watchlist
            </a>

            <div className="tools-dropdown-wrapper" style={{ alignSelf: 'center' }}>
              <button className="tools-btn" id="tools-dropdown-btn" type="button">
                Tools ▾
              </button>
              <div className="tools-dropdown-menu" id="tools-dropdown-menu" style={{ display: 'none' }}>
                <a href="/tools?tool=squadbuilder" data-link="" data-nav-link="" className="tools-dropdown-item">
                  🏟️ Squad Builder
                </a>
                <a href="/tools?tool=compare" data-link="" data-nav-link="" className="tools-dropdown-item">
                  ⚖️ Compare Players
                </a>
                <a href="/tools?tool=shard-calculator" data-link="" data-nav-link="" className="tools-dropdown-item">
                  💎 Shard Calculator
                </a>
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <div className="user-avatar">
              <div className="avatar-circle">FC</div>
            </div>
          </div>
        </div>
      </header>

      {showSlider && (
        <div className="slider" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
          <span>Trade, Build, Dominate – Massive Rewards Await on Zenith!</span>
        </div>
      )}

      {children}

      <footer className="zenith-footer">
        <div className="zenith-footer-inner">
          <div className="zenith-footer-left">
            <img src="/assets/images/zenith_logo_svg.svg" alt="Zenith logo" className="zenith-footer-logo" />
            <span className="zenith-footer-tag">FC Mobile Database Engine</span>
          </div>

          <div className="zenith-footer-center">
            <a href="/" data-link="" data-nav-link="">
              Home
            </a>
            <a href="/players" data-link="" data-nav-link="">
              Database
            </a>
            <MarketNavLink href="/market" data-link="" data-nav-link="">
              Market
            </MarketNavLink>
            <a href="/watchlist" data-link="" data-nav-link="">
              Watchlist
            </a>
          </div>

          <div className="zenith-footer-right">
            <span>v1.0</span>
            <span className="zenith-footer-dot">•</span>
            <span>Zenith Engine</span>
          </div>
        </div>
      </footer>

      <SiteChromeInteractions />
    </>
  );
}
