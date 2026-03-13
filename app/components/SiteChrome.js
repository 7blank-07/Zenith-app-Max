import SiteChromeInteractions from './SiteChromeInteractions.client';
import MarketNavLink from './MarketNavLink.client';
import MobileNavigation from './MobileNavigation.client';
import Image from 'next/image';
import Link from 'next/link';

function getNavClass(activeView, view) {
  return activeView === view ? 'nav-link active' : 'nav-link';
}

export default function SiteChrome({ activeView = '', showSlider = false, children }) {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Link href="/" data-link="" data-nav-link="" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Image
                src="/assets/images/zenith_logo_svg.svg"
                alt="Zenith logo"
                className="logo-image"
                width={1024}
                height={1024}
                sizes="64px"
              />
              <span className="logo-text">Zenith</span>
            </Link>
          </div>

          <nav className="nav-desktop">
            <Link href="/" data-link="" data-nav-link="" className={getNavClass(activeView, 'home')}>
              Home
            </Link>
            <Link href="/players" data-link="" data-nav-link="" className={getNavClass(activeView, 'players')}>
              Players
            </Link>
            <MarketNavLink href="/market" data-link="" data-nav-link="" className={getNavClass(activeView, 'market')}>
              Market
            </MarketNavLink>
            <Link href="/watchlist" data-link="" data-nav-link="" className={getNavClass(activeView, 'watchlist')}>
              Watchlist
            </Link>
            <Link href="/blogs" data-link="" data-nav-link="" className={getNavClass(activeView, 'blogs')}>
              Blogs
            </Link>

            <div className="tools-dropdown-wrapper" style={{ alignSelf: 'center' }}>
              <button
                className={`tools-btn${activeView === 'tools' ? ' active' : ''}`}
                id="tools-dropdown-btn"
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="tools-dropdown-menu"
              >
                Tools ▾
              </button>
              <div className="tools-dropdown-menu" id="tools-dropdown-menu" style={{ display: 'none' }}>
                <Link href="/tools?tool=squadbuilder" data-link="" data-nav-link="" className="tools-dropdown-item">
                  🏟️ Squad Builder
                </Link>
                <Link href="/tools?tool=compare" data-link="" data-nav-link="" className="tools-dropdown-item">
                  ⚖️ Compare Players
                </Link>
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

      <MobileNavigation activeView={activeView} />

      <footer className="zenith-footer">
        <div className="zenith-footer-inner">
          <div className="zenith-footer-left">
            <Image
              src="/assets/images/zenith_logo_svg.svg"
              alt="Zenith logo"
              className="zenith-footer-logo"
              width={1024}
              height={1024}
              sizes="26px"
            />
            <span className="zenith-footer-tag">FC Mobile Database Engine</span>
          </div>

          <div className="zenith-footer-center">
            <Link href="/" data-link="" data-nav-link="">
              Home
            </Link>
            <Link href="/players" data-link="" data-nav-link="">
              Database
            </Link>
            <MarketNavLink href="/market" data-link="" data-nav-link="">
              Market
            </MarketNavLink>
            <Link href="/watchlist" data-link="" data-nav-link="">
              Watchlist
            </Link>
            <Link href="/blogs" data-link="" data-nav-link="">
              Blogs
            </Link>
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
