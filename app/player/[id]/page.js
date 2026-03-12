import { notFound } from 'next/navigation';
import PlayerDetailContent from '../../components/PlayerDetailContent.client';
import SiteChrome from '../../components/SiteChrome';
import {
  PLAYER_PAGE_REVALIDATE_SECONDS,
  resolvePlayerProfileContract,
  resolvePlayerSeoContract
} from '../../../src/lib/server/player-seo-contract.mjs';
import { getPlayerPrerenderLimit } from '../../../src/lib/server/prerender-rollout.mjs';
import { readTopPlayerIds } from '../../../src/lib/server/top-players.mjs';
import { getPlayerCardVariant, parseRank } from '../../components/player-detail-utils';

export const revalidate = PLAYER_PAGE_REVALIDATE_SECONDS;

function isNotFoundError(error) {
  return typeof error?.message === 'string' && error.message.includes('Player fetch failed (404)');
}

async function loadPlayerSeoContract(playerId, rank) {
  return resolvePlayerSeoContract(playerId, {
    rank,
    metadataOptions: {
      siteName: 'Zenith',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
  });
}

async function loadPlayerProfileContract(playerId, rank) {
  return resolvePlayerProfileContract(playerId, {
    rank,
    relatedLimit: 8,
    metadataOptions: {
      siteName: 'Zenith',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
  });
}

export async function generateStaticParams() {
  const prerenderLimit = getPlayerPrerenderLimit();
  const ids = await readTopPlayerIds();
  console.info('[rollout] /player static params', { prerenderLimit, totalIds: ids.length });
  return ids.slice(0, prerenderLimit).map((id) => ({ id }));
}

export async function generateMetadata({ params, searchParams }) {
  const rank = parseRank(searchParams?.rank);

  try {
    const { metadata } = await loadPlayerSeoContract(params.id, rank);
    return {
      title: metadata.title,
      description: metadata.description,
      alternates: { canonical: metadata.canonical },
      openGraph: metadata.openGraph,
      twitter: {
        card: 'summary_large_image',
        title: metadata.title,
        description: metadata.description,
        images: metadata.openGraph.images?.map((image) => image.url).filter(Boolean)
      }
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        title: 'Player not found | Zenith',
        description: 'This player could not be found in the Zenith database.'
      };
    }
    throw error;
  }
}

export default async function PlayerDetailPage({ params, searchParams }) {
  const startedAt = Date.now();
  const rank = parseRank(searchParams?.rank);

  let contract;
  try {
    contract = await loadPlayerProfileContract(params.id, rank);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const { record, metadata, attributeSections, relatedPlayers } = contract;
  console.info('[metrics] /player render', {
    playerId: record.playerId,
    rank,
    attributeSectionCount: attributeSections.length,
    relatedCount: relatedPlayers.length,
    elapsedMs: Date.now() - startedAt
  });

  return (
    <SiteChrome activeView="players">
      <main className="main-content player-detail-main-content">
      <div id="player-detail-view" className="view active">
        <div
          className="player-detail-shell"
          style={{
            width: '100%',
            maxWidth: 'none',
            margin: '0',
            padding: '0 0 32px',
            background: 'rgba(20, 24, 28, 0.5)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            minHeight: '100vh',
            borderRadius: '0'
          }}
        >
          <div className="player-detail-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 0 24px' }}>
            <PlayerDetailContent initialRecord={record} initialRank={rank} />
          </div>

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 24px 24px' }}>
            <section style={{ marginTop: '20px' }}>
              <h2 style={{ marginBottom: '10px' }}>Related Players</h2>
              {!relatedPlayers.length && <p style={{ marginTop: 0 }}>No related players available.</p>}
              {!!relatedPlayers.length && (
                <div id="latest-players-grid">
                  {relatedPlayers.map((player) => {
                    const relatedVariant = getPlayerCardVariant(player);
                    const relatedCardBackground = player.cardBackground || player.image || '/assets/images/zenith_logo_svg.svg';
                    const relatedCardImage = player.playerImage || player.image || '';

                    return (
                      <article key={player.playerId} style={{ display: 'grid', gap: '8px', justifyItems: 'center' }}>
                        <div className="dashboard-player-card">
                          <a
                            href={`/player/${player.playerId}`}
                            aria-label={`View ${player.name}`}
                            style={{ display: 'block', width: '100%', height: '100%' }}
                          >
                            <div className="card-container">
                              <img src={relatedCardBackground} alt="" className="card-background-img" />
                              {!!relatedCardImage && (
                                <img src={relatedCardImage} alt={`${player.name} card image`} className="player-image-img" />
                              )}
                              <div className="card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                                {player.ovr && player.ovr > 0 ? player.ovr : 'NA'}
                              </div>
                              <div className="card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                                {player.position || 'NA'}
                              </div>
                              <div className="card-player-name" style={{ color: player.colorName || '#FFFFFF' }}>
                                {player.name}
                              </div>
                              {!!player.nationFlag && (
                                <img
                                  src={player.nationFlag}
                                  alt="Nation"
                                  className={`card-nation-flag-home ${
                                    relatedVariant === 'normal' ? 'normal-nation-flag-home' : 'hero-icon-nation-flag-home'
                                  }`}
                                />
                              )}
                              {!!player.clubFlag && (
                                <img
                                  src={player.clubFlag}
                                  alt="Club"
                                  className={`card-club-flag-home ${
                                    relatedVariant === 'normal' ? 'normal-club-flag-home' : 'hero-icon-club-flag-home'
                                  }`}
                                />
                              )}
                              {relatedVariant === 'normal' && !!player.leagueImage && (
                                <img src={player.leagueImage} alt="League" className="card-league-flag-home normal-league-flag-home" />
                              )}
                              {player.isUntradable && (
                                <div className="card-untradable-badge">
                                  <img src="/assets/images/untradable_img.png" alt="Untradable" />
                                </div>
                              )}
                            </div>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata.jsonLd) }} />
      </div>
      </main>
    </SiteChrome>
  );
}
