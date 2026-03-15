import HomeDashboardInteractions from './components/HomeDashboardInteractions.client';
import HomeLatestBlogsSection from './components/HomeLatestBlogsSection.client';
import MarketNavLink from './components/MarketNavLink.client';
import MobileNavigation from './components/MobileNavigation.client';
import SiteChromeInteractions from './components/SiteChromeInteractions.client';
import Image from 'next/image';
import Link from 'next/link';
import { buildPlayerPath } from '../src/lib/player-slug.mjs';
import { getBlogIndexPageData } from '../src/lib/server/blog/public.mjs';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../src/lib/server/player-seo-contract.mjs';
import { fetchPlayersByIds, readTopPlayerIds } from '../src/lib/server/top-players.mjs';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const HOME_PLAYER_LIMIT = 48;
const HOME_SECTION_LIMIT = 12;
const HOME_BLOG_LIMIT = 8;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export const metadata = {
  title: 'Zenith - FC Mobile Database',
  description: 'Zenith FC Mobile tools and database',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Zenith - FC Mobile Database',
    description: 'Zenith FC Mobile tools and database',
    url: siteUrl,
    siteName: 'Zenith',
    type: 'website'
  }
};

function getHomeCardVariant(player) {
  return player.leagueImage ? 'normal' : 'hero';
}

function getLatestBlogTimestamp(post) {
  const timestamp = [post?.publishedAt, post?.updatedAt, post?.createdAt]
    .map((value) => new Date(value || '').getTime())
    .find((value) => Number.isFinite(value) && value > 0);

  return timestamp || 0;
}

function buildHomeLatestBlogPosts(pageData) {
  const candidates = [...(pageData?.featuredPosts || []), ...(pageData?.posts || [])];
  const deduped = [];
  const seen = new Set();

  candidates.forEach((post) => {
    const key = String(post?.id || post?.slug || '').trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(post);
  });

  return deduped.sort((left, right) => getLatestBlogTimestamp(right) - getLatestBlogTimestamp(left)).slice(0, HOME_BLOG_LIMIT);
}

function renderDashboardPlayerCard(player, key) {
  const cardVariant = getHomeCardVariant(player);
  const cardBackground = player.cardBackground || 'https://via.placeholder.com/300x400';
  const cardImage = player.playerImage || 'https://via.placeholder.com/200x300';
  const playerPath = buildPlayerPath(player);

  return (
    <div
      key={key}
      className="dashboard-player-card"
      data-player-id={player.playerId}
      data-player-link={playerPath}
      data-player-ovr={player.ovr || 0}
      data-record-id={player.recordId || ''}
      data-player-name={player.name || ''}
      data-player-position={player.position || ''}
      data-player-club={player.club || ''}
      data-player-nation={player.nation || ''}
    >
      <div className="card-container">
        <img src={cardBackground} alt="Card Background" className="card-background-img" />
        <img src={cardImage} alt={player.name || 'Player'} className="player-image-img" />

        <div className="card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
          {player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
        </div>
        <div className="card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
          {player.position || 'NA'}
        </div>
        <div className="card-player-name" style={{ color: player.colorName || '#FFFFFF' }}>
          {player.name || 'Unknown'}
        </div>

        <img
          src={player.nationFlag || ''}
          alt="Nation"
          className={`card-nation-flag-home ${
            cardVariant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
          }`}
        />
        <img
          src={player.clubFlag || ''}
          alt="Club"
          className={`card-club-flag-home ${cardVariant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'}`}
        />
        {cardVariant === 'normal' && !!player.leagueImage && (
          <img src={player.leagueImage} alt="League" className="card-league-flag-home normal-league-flag-home" />
        )}

        {player.isUntradable && (
          <div className="card-untradable-badge">
            <img src="/assets/images/untradable_img.png" alt="Untradable" />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const startedAt = Date.now();
  const topIdsPromise = readTopPlayerIds(HOME_PLAYER_LIMIT);
  const blogPageDataPromise = getBlogIndexPageData();
  const topIds = await topIdsPromise;
  const [players, blogPageData] = await Promise.all([fetchPlayersByIds(topIds, { rank: 0 }), blogPageDataPromise]);
  const latestPlayers = players.slice(0, HOME_SECTION_LIMIT);
  const latestBlogPosts = buildHomeLatestBlogPosts(blogPageData);
  const shouldRenderLatestBlogs = latestBlogPosts.length > 0 || blogPageData?.availability?.isConfigured === true;

  console.info('[metrics] / render', {
    elapsedMs: Date.now() - startedAt,
    cardCount: players.length,
    latestCount: latestPlayers.length,
    latestBlogsCount: latestBlogPosts.length
  });

  return (
    <>
      <div id="toast-container" />

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
            <Link href="/" data-link="" data-nav-link="" className="nav-link active">
              Home
            </Link>
            <Link href="/players" data-link="" data-nav-link="" className="nav-link">
              Players
            </Link>
            <MarketNavLink href="/market" data-link="" data-nav-link="" className="nav-link">
              Market
            </MarketNavLink>
            <Link href="/watchlist" data-link="" data-nav-link="" className="nav-link">
              Watchlist
            </Link>
            <Link href="/blogs" data-link="" data-nav-link="" className="nav-link">
              Blogs
            </Link>

            <div className="tools-dropdown-wrapper" style={{ alignSelf: 'center' }}>
              <button className="tools-btn" id="tools-dropdown-btn" type="button">
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

      <div className="slider" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
        <span>Trade, Build, Dominate – Massive Rewards Await on Zenith!</span>
      </div>

      <main className="main-content">
        <div id="dashboard-view" className="view active">
          <section className="search-section">
            <div className="search-container">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" id="home-search" className="search-input" placeholder="Search for players..." autoComplete="off" />
              </div>
              <div id="search-dropdown" className="search-dropdown">
                <div className="search-dropdown-content" id="search-results-dropdown" />
              </div>
            </div>
          </section>

          <section className="hero-banner-section">
            <div className="hero-banner-slider">
              <div className="banner-slide active" data-redirect="view" data-target="database">
                <Image
                  src="/assets/images/banner2.webp"
                  alt="Market Update"
                  className="banner-image"
                  width={1600}
                  height={400}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  priority
                  fetchPriority="high"
                />
                <div className="banner-overlay">
                  <div className="banner-content">
                    <h2 className="banner-title">Explore Players</h2>
                    <p className="banner-subtitle">Analyze all players</p>
                  </div>
                </div>
              </div>

              <div className="banner-slide" data-redirect="tool" data-target="compare">
                <Image
                  src="/assets/images/banner1.webp"
                  alt="FC Mobile Event"
                  className="banner-image"
                  width={1600}
                  height={400}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  loading="lazy"
                  fetchPriority="low"
                />
                <div className="banner-overlay">
                  <div className="banner-content">
                    <h2 className="banner-title">Compare Players</h2>
                    <p className="banner-subtitle">Compare at once</p>
                  </div>
                </div>
              </div>

              <div className="banner-slide" data-redirect="tool" data-target="squadbuilder">
                <Image
                  src="/assets/images/squad-build-bg.jpeg"
                  alt="Squad Building"
                  className="banner-image"
                  width={1600}
                  height={400}
                  sizes="(max-width: 1400px) 100vw, 1400px"
                  loading="lazy"
                  fetchPriority="low"
                />
                <div className="banner-overlay">
                  <div className="banner-content">
                    <h2 className="banner-title">Build Your Squad</h2>
                    <p className="banner-subtitle">Create the perfect team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="banner-dots">
              <span className="banner-dot active" data-slide="0" />
              <span className="banner-dot" data-slide="1" />
              <span className="banner-dot" data-slide="2" />
            </div>

            <button className="banner-arrow banner-prev" aria-label="Previous banner" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="banner-arrow banner-next" aria-label="Next banner" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </section>

          <div id="dashboard-search-results" style={{ display: 'none' }}>
            <div className="search-results-header">
              <h3 id="search-results-count">0 Results</h3>
            </div>
            <div id="search-results-container" />
          </div>

          <section className="dashboard-section">
            <div className="section-header">
              <h2>⚡ Latest Players</h2>
              <Link href="/players" data-link="" data-nav-link="" className="view-all-btn">
                View All
              </Link>
            </div>
            <div id="latest-players-grid">{latestPlayers.map((player) => renderDashboardPlayerCard(player, `latest-${player.playerId}`))}</div>
          </section>

          {shouldRenderLatestBlogs ? (
            <HomeLatestBlogsSection
              posts={latestBlogPosts}
              categories={blogPageData?.categories || []}
              availability={blogPageData?.availability || null}
            />
          ) : null}
        </div>
      </main>

      <MobileNavigation activeView="home" />

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

      <HomeDashboardInteractions />
      <SiteChromeInteractions />
    </>
  );
}
