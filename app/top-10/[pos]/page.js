import React from 'react';
import SiteChrome from '../../components/SiteChrome';
import { getTopTenRankings } from '../../../src/lib/server/top-10/repository.mjs';
import { fetchPlayersByIds } from '../../../src/lib/server/top-players.mjs';
import PlayerPreviewMiniPlayerCard from '../../components/PlayerPreviewMiniPlayerCard';
import AdsenseAd from '../../components/AdsenseAd';
import styles from '../TopTen.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

const POSITIONS = ['ST', 'LW', 'RW', 'CAM', 'CDM', 'CM', 'CB', 'LB', 'RB', 'GK'];

export async function generateMetadata({ params }) {
  const pos = (params?.pos || 'st').toUpperCase();
  const defaultMetadata = {
    title: `Top 10 ${pos} Players - FC Mobile`,
    description: `Discover the best 10 ${pos} players in FC Mobile. Expert curated rankings to help you build the ultimate squad.`,
  };
  const { resolvePageSeo } = await import('../../../src/lib/server/page-seo-metadata.mjs');
  return resolvePageSeo(`/top-10/${pos.toLowerCase()}`, defaultMetadata);
}

export default async function TopTenPositionPage({ params }) {
  const currentPos = String(params?.pos || 'st').trim().toUpperCase();
  
  const dbRankings = await getTopTenRankings(currentPos, 'live');
  const playerIds = dbRankings.map(r => r.playerId);
  const players = playerIds.length > 0 ? await fetchPlayersByIds(playerIds) : [];

  const rankings = dbRankings.map(r => {
    const rId = String(r.playerId || '').trim();
    const player = players.find(p => String(p.playerId || '').trim() === rId);
    return { ...r, player };
  }).filter(r => r.player);

  const { getPageH1Override, PageSeoH1, getPageCustomJsonLd, PageSeoCustomJsonLd } = await import('../../../src/lib/server/page-seo-metadata.mjs');
  const h1Heading = await getPageH1Override(`/top-10/${currentPos.toLowerCase()}`);
  const customJsonLd = await getPageCustomJsonLd(`/top-10/${currentPos.toLowerCase()}`);

  return (
    <SiteChrome activeView="top-10">
      <PageSeoCustomJsonLd schema={customJsonLd} />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{h1Heading || `Top 10 ${currentPos} Rankings`}</h1>
          <p className={styles.subtitle}>
            The definitive guide to the best FC Mobile {currentPos} players, curated by experts.
          </p>
        </div>

        <nav className={styles.posTabs}>
          {POSITIONS.map(pos => (
            <Link
              key={pos}
              href={`/top-10/${pos.toLowerCase()}`}
              className={`${styles.tab} ${currentPos === pos ? styles.tabActive : ''}`}
            >
              {pos}
            </Link>
          ))}
        </nav>

        {rankings.length > 0 ? (
          <div className={styles.content}>
            <div className={styles.rankingsGrid}>
              {rankings.map((item, index) => (
                <React.Fragment key={item.playerId}>
                  <PlayerPreviewMiniPlayerCard
                    player={item.player}
                    rank={item.rank}
                    archetype={item.archetype}
                  />
                  {(index + 1) % 3 === 0 && (
                    <div style={{ gridColumn: '1 / -1', margin: '12px 0' }}>
                      <AdsenseAd 
                        slot="9548907329" 
                        format="fluid" 
                        layoutKey="-6t+ed+2i-1n-4w" 
                        style={{ margin: '0' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ maxWidth: '1240px', margin: '48px auto 0', width: '100%' }}>
              <AdsenseAd slot="4153110413" format="autorelaxed" />
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏆</div>
            <h3>Rankings Coming Soon</h3>
            <p>Our experts are currently analyzing the meta for {currentPos}. Check back shortly!</p>
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
