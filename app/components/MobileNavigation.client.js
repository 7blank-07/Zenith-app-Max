'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketUnderConstructionModal from './MarketUnderConstructionModal.client';

const MOBILE_TOOL_ITEMS = [
  {
    key: 'squadbuilder',
    label: 'Squad Builder',
    href: '/tools/squad-builder',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M9 20v-5h6v5" />
      </svg>
    )
  },
  {
    key: 'compare',
    label: 'Compare Players',
    href: '/tools/player-compare',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18" />
        <path d="M6 8h12" />
        <path d="m7 8-3 5h6l-3-5Z" />
        <path d="m17 16-3 5h6l-3-5Z" />
      </svg>
    )
  },
  {
    key: 'watchlist',
    label: 'Watchlist',
    href: '/tools/watchlist',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  },
  {
    key: 'market',
    label: 'Market',
    type: 'market',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    key: 'streaming',
    label: 'Streaming',
    href: '/streaming',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
        <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
      </svg>
    )
  }
];

const MOBILE_PREFETCH_ROUTES = Object.freeze([
  '/',
  '/players',
  '/fc-mobile-redeem-codes',
  '/tools',
  '/tools/squad-builder',
  '/tools/player-compare',
  '/tools/watchlist',
  '/market',
  '/blogs',
  '/streaming'
]);

function getButtonClassName(isActive, extraClassName = '') {
  return `${['mobile-nav-btn', extraClassName, isActive ? 'active' : ''].filter(Boolean).join(' ')}`;
}

export default function MobileNavigation({ activeView = '' }) {
  const router = useRouter();
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

  useEffect(() => {
    MOBILE_PREFETCH_ROUTES.forEach((route) => {
      Promise.resolve(router.prefetch(route)).catch(() => {});
    });
  }, [router]);

  useEffect(() => {
    if (!isToolsSheetOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleResize = (event) => {
      if (!event.matches) {
        setIsToolsSheetOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setIsToolsSheetOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleResize);
    } else {
      mediaQuery.addListener(handleResize);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleResize);
      } else {
        mediaQuery.removeListener(handleResize);
      }
    };
  }, [isToolsSheetOpen]);

  const navigateTo = (href) => {
    setIsToolsSheetOpen(false);
    router.push(href);
  };

  const openMarket = () => {
    setIsToolsSheetOpen(false);
    setIsMarketModalOpen(true);
  };

  const openToolsSheet = () => {
    setIsToolsSheetOpen((current) => !current);
  };

  const closeToolsSheet = () => {
    setIsToolsSheetOpen(false);
  };

  return (
    <>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button
          className={getButtonClassName(activeView === 'home')}
          data-view="dashboard"
          type="button"
          onClick={() => navigateTo('/')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>
        <button
          className={getButtonClassName(activeView === 'players')}
          data-view="database"
          type="button"
          onClick={() => navigateTo('/players')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Players</span>
        </button>
        <button
          className={getButtonClassName(activeView === 'redeem')}
          data-view="redeem"
          type="button"
          onClick={() => navigateTo('/fc-mobile-redeem-codes')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12h-2M4 12H2m10 10v-2m0-16V2m5 5-1.5 1.5M7 7l1.5 1.5m8 8-1.5-1.5M7 17l1.5-1.5" />
            <rect x="6" y="9" width="12" height="8" rx="2" />
          </svg>
          <span>Redeem</span>
        </button>
        <button
          className={getButtonClassName(activeView === 'blogs')}
          data-view="blogs"
          type="button"
          onClick={() => navigateTo('/blogs')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5V5a2 2 0 0 1 2-2h14v14" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
          </svg>
          <span>Blogs</span>
        </button>
        <button
          className={getButtonClassName(activeView === 'tools' || isToolsSheetOpen, 'tools-btn')}
          type="button"
          title="Tools"
          aria-controls="tools-sheet"
          aria-expanded={isToolsSheetOpen}
          onClick={openToolsSheet}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Tools</span>
        </button>
      </nav>

      <div
        className={`tools-sheet-backdrop${isToolsSheetOpen ? ' active' : ''}`}
        aria-hidden={isToolsSheetOpen ? 'false' : 'true'}
        onClick={closeToolsSheet}
      />
      <div
        id="tools-sheet"
        className={`tools-sheet${isToolsSheetOpen ? ' active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={isToolsSheetOpen ? 'false' : 'true'}
        aria-labelledby="mobile-tools-title"
      >
        <div className="tools-sheet-handle" />
        <div className="tools-sheet-content">
          <div className="tools-sheet-header">
            <h2 id="mobile-tools-title">Tools</h2>
            <button className="tools-sheet-close" type="button" onClick={closeToolsSheet} aria-label="Close tools menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="tools-sheet-grid">
            {MOBILE_TOOL_ITEMS.map((item) => (
              <button
                key={item.key}
                className="tool-item"
                type="button"
                onClick={() => (item.type === 'market' ? openMarket() : navigateTo(item.href))}
              >
                <div className="tool-item-icon">{item.icon}</div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <MarketUnderConstructionModal isOpen={isMarketModalOpen} onClose={() => setIsMarketModalOpen(false)} />
    </>
  );
}
