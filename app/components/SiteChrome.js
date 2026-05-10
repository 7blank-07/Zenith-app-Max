import MarketNavLink from './MarketNavLink.client';
import SiteFooter from './SiteFooter';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getTopTickerConfig } from '../../src/lib/server/top-ticker-config.mjs';

const MobileNavigation = dynamic(() => import('./MobileNavigation.client'), {
  ssr: true
});

const SiteChromeInteractions = dynamic(() => import('./SiteChromeInteractions.client'), {
  ssr: false
});

function getNavClass(activeView, view) {
  return activeView === view ? 'nav-link active' : 'nav-link';
}

export default function SiteChrome({ activeView = '', showSlider = false, children }) {
  const topTicker = getTopTickerConfig();

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Link href="/" data-link="" data-nav-link="" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Image
                src="/assets/images/zenith_logo_main.png"
                alt="Zenith logo"
                className="logo-image"
                width={48}
                height={48}
                sizes="(max-width: 768px) 34px, 48px"
                priority
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
            <Link href="/fc-mobile-redeem-codes" data-link="" data-nav-link="" className={getNavClass(activeView, 'redeem')}>
              Redeem
            </Link>
            <Link href="/blogs" data-link="" data-nav-link="" className={getNavClass(activeView, 'blogs')}>
              Blogs
            </Link>
            <Link href="/streaming" data-link="" data-nav-link="" className={getNavClass(activeView, 'streaming')}>
              Streaming
            </Link>

            <div className="tools-dropdown-wrapper" style={{ alignSelf: 'center' }}>
              <button
                className={`tools-btn${activeView === 'tools' || activeView === 'market' ? ' active' : ''}`}
                id="tools-dropdown-btn"
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="tools-dropdown-menu"
              >
                Tools ▾
              </button>
              <div className="tools-dropdown-menu" id="tools-dropdown-menu" style={{ display: 'none' }}>
                <Link href="/tools/squad-builder" data-link="" data-nav-link="" className="tools-dropdown-item">
                  🏟️ Squad Builder
                </Link>
                <Link href="/tools/player-compare" data-link="" data-nav-link="" className="tools-dropdown-item">
                  ⚖️ Compare Players
                </Link>
                <Link href="/tools/watchlist" data-link="" data-nav-link="" className="tools-dropdown-item">
                  ❤️ Watchlist
                </Link>
                <MarketNavLink href="/market" data-link="" data-nav-link="" className="tools-dropdown-item">
                  📈 Market
                </MarketNavLink>
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

      {showSlider && topTicker.enabled ? (
        <div className="slider" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
          <span>{topTicker.text}</span>
        </div>
      ) : null}

      {children}

      <MobileNavigation activeView={activeView} />

      <SiteFooter />

      <SiteChromeInteractions />
    </>
  );
}
