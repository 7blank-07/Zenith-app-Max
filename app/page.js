import SiteChrome from './components/SiteChrome';
import RedeemCodeHomeWidget from './components/redeem/RedeemCodeHomeWidget.client';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { buildPlayerPath } from '../src/lib/player-slug.mjs';
import { getBlogIndexPageData } from '../src/lib/server/blog/public.mjs';
import { PLAYER_PAGE_REVALIDATE_SECONDS } from '../src/lib/server/player-seo-contract.mjs';
import { getHomeRedeemCodeWidgetData } from '../src/lib/server/redeem-codes/public.mjs';
import { fetchLatestPlayers } from '../src/lib/server/top-players.mjs';
import { getHomepageFeaturedStream } from '../src/lib/server/streams/repository.mjs';
import { YouTubeEmbed, StreamBadge } from './components/streaming/StreamComponents';
import { getOptimizedZenithUrl } from '../src/lib/image-optimization.mjs';
import { UNTRADABLE_CARD_BADGE_URL } from './components/image-asset-urls';
import AdsenseAd from './components/AdsenseAd';

const HomeLatestBlogsSection = dynamic(() => import('./components/HomeLatestBlogsSection.client'), {
  ssr: true
});

const HomeDashboardInteractions = dynamic(() => import('./components/HomeDashboardInteractions.client'), {
  ssr: false
});

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

const HOME_SECTION_LIMIT = 12;
const HOME_BLOG_LIMIT = 40;

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

function renderDashboardPlayerCard(player, key, index = 0) {
  const cardVariant = getHomeCardVariant(player);
  const cardBackground = player.cardBackground || 'https://via.placeholder.com/300x400';
  const cardImage = player.playerImage || 'https://via.placeholder.com/200x300';
  const playerPath = buildPlayerPath(player);
  const isPriority = index < 4;

  const optimizedBackground = getOptimizedZenithUrl(cardBackground, 1024);
  const optimizedPlayerImage = getOptimizedZenithUrl(cardImage, 256);

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
        <Image
          src={optimizedBackground}
          alt="Card Background"
          className="card-background-img"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={isPriority}
          loading={isPriority ? undefined : 'lazy'}
          fetchPriority={isPriority ? 'high' : 'auto'}
          unoptimized
        />
        <Image
          src={optimizedPlayerImage}
          alt={player.name || 'Player'}
          className="player-image-img"
          width={256}
          height={256}
          priority={isPriority}
          loading={isPriority ? undefined : 'lazy'}
          fetchPriority={isPriority ? 'high' : 'auto'}
          unoptimized
        />

        <div className="card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
          {player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
        </div>
        <div className="card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
          {player.position || 'NA'}
        </div>
        <div className="card-player-name" style={{ color: player.colorName || '#FFFFFF' }}>
          {player.name || 'Unknown'}
        </div>

        {player.nationFlag && (
          <img
            src={player.nationFlag}
            alt="Nation"
            className={`card-nation-flag-home ${
              cardVariant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
            }`}
            width={18}
            height={18}
            loading="lazy"
            fetchPriority="low"
          />
        )}
        {player.clubFlag && (
          <img
            src={player.clubFlag}
            alt="Club"
            className={`card-club-flag-home ${cardVariant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'}`}
            width={18}
            height={18}
            loading="lazy"
            fetchPriority="low"
          />
        )}
        {cardVariant === 'normal' && !!player.leagueImage && (
          <img
            src={player.leagueImage}
            alt="League"
            className="card-league-flag-home normal-league-flag-home"
            width={18}
            height={18}
            loading="lazy"
            fetchPriority="low"
          />
        )}

        {player.isUntradable && (
          <div className="card-untradable-badge">
            <img src={UNTRADABLE_CARD_BADGE_URL} alt="Untradable" width={16} height={16} loading="lazy" fetchPriority="low" />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const latestPlayersPromise = fetchLatestPlayers({
    rank: 0,
    limit: HOME_SECTION_LIMIT,
    candidateLimit: 240
  });
  const blogPageDataPromise = getBlogIndexPageData();
  const redeemCodeWidgetPromise = getHomeRedeemCodeWidgetData();
  const featuredStreamPromise = getHomepageFeaturedStream();
  const [latestPlayers, blogPageData, homeRedeemWidgetData, featuredStream] = await Promise.all([
    latestPlayersPromise,
    blogPageDataPromise,
    redeemCodeWidgetPromise,
    featuredStreamPromise
  ]);
  const latestBlogPosts = buildHomeLatestBlogPosts(blogPageData);
  const shouldRenderLatestBlogs = latestBlogPosts.length > 0 || blogPageData?.availability?.isConfigured === true;

  return (
    <>
      <div id="toast-container" />
      <SiteChrome activeView="home" showSlider={true}>
        <main className="main-content">
          <div id="dashboard-view" className="view active">
            <section className="home-utility-hero" aria-label="Hero utility hub">
              <div className="home-utility-card">
                <div className="home-utility-search">
                  <div className="search-container">
                    <div className="search-box">
                      <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        type="text"
                        id="home-search"
                        className="search-input"
                        placeholder="Search for players, clubs, or positions..."
                        autoComplete="off"
                      />
                    </div>
                    <div id="search-dropdown" className="search-dropdown">
                      <div className="search-dropdown-content" id="search-results-dropdown" />
                    </div>
                  </div>
                </div>

                <div className="home-utility-redeem-shell">
                  <RedeemCodeHomeWidget codeEntry={homeRedeemWidgetData?.code || null} />
                </div>
              </div>
            </section>

            <div id="dashboard-search-results" style={{ display: 'none' }}>
              <div className="search-results-header">
                <h3 id="search-results-count">0 Results</h3>
              </div>
              <div id="search-results-container" />
            </div>

            {featuredStream ? (
              <section className="dashboard-section" style={{ marginBottom: '3rem' }}>
                <div className="section-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#ff0000' }}>●</span> Zenith Live
                  </h2>
                  <Link href="/streaming" data-link="" data-nav-link="" className="view-all-btn">
                    Streaming Hub
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#111', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>{featuredStream.title}</h3>
                    <StreamBadge status={featuredStream.status} />
                  </div>
                  <YouTubeEmbed youtubeId={featuredStream.youtubeId} title={featuredStream.title} />
                </div>
              </section>
            ) : null}

            <section className="dashboard-section">
              <div className="section-header">
                <h2>⚡ Latest Players</h2>
                <Link href="/players" data-link="" data-nav-link="" className="view-all-btn">
                  View All
                </Link>
              </div>
              <div id="latest-players-grid">{latestPlayers.map((player, index) => renderDashboardPlayerCard(player, `latest-${player.playerId}`, index))}</div>
            </section>

            <AdsenseAd slot="9409697139" />

            {shouldRenderLatestBlogs ? (
              <HomeLatestBlogsSection
                posts={latestBlogPosts}
                categories={blogPageData?.categories || []}
                availability={blogPageData?.availability || null}
              />
            ) : null}

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
              <AdsenseAd 
                slot="3543266554" 
                format="fluid" 
                layoutKey="-fb+5w+4e-db+86" 
                style={{ margin: '32px 0' }} 
              />
            </div>

            <div style={{ maxWidth: '1400px', margin: '48px auto 0', padding: '0 24px' }}>
              <AdsenseAd slot="3122944241" format="autorelaxed" />
            </div>
          </div>
        </main>
        <HomeDashboardInteractions />
      </SiteChrome>
    </>
  );
}

