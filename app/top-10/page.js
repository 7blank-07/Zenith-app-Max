import SiteChrome from '../components/SiteChrome';
import { getTopTenRankings } from '../../src/lib/server/top-10/repository.mjs';
import { fetchPlayersByIds } from '../../src/lib/server/top-players.mjs';
import PlayerPreviewMiniPlayerCard from '../components/PlayerPreviewMiniPlayerCard';
import styles from './TopTen.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

const POSITIONS = ['ST', 'LW', 'RW', 'LM', 'RM', 'CAM', 'CDM', 'CM', 'CB', 'LB', 'RB', 'GK'];

export default async function TopTenPage({ searchParams = {} }) {
  const currentPos = String(searchParams.pos || 'ST').trim().toUpperCase();
  
  const dbRankings = await getTopTenRankings(currentPos, 'live');
  const playerIds = dbRankings.map(r => r.playerId);
  const players = playerIds.length > 0 ? await fetchPlayersByIds(playerIds) : [];

  const rankings = dbRankings.map(r => {
    const player = players.find(p => p.playerId === r.playerId);
    return { ...r, player };
  }).filter(r => r.player);

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <SiteChrome activeView="top-10">
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Top 10 Rankings</h1>
          <p className={styles.subtitle}>
            The definitive guide to the best FC Mobile players by position, curated by experts.
          </p>
        </div>

        <nav className={styles.posTabs}>
          {POSITIONS.map(pos => (
            <Link
              key={pos}
              href={`/top-10?pos=${pos}`}
              className={`${styles.tab} ${currentPos === pos ? styles.tabActive : ''}`}
            >
              {pos}
            </Link>
          ))}
        </nav>

        {rankings.length > 0 ? (
          <div className={styles.content}>
            <section className={styles.topThreeGrid}>
              {topThree.map((item, idx) => (
                <div key={item.playerId} className={styles[`rank${idx + 1}`]}>
                  <PlayerPreviewMiniPlayerCard
                    player={item.player}
                    rank={item.rank}
                    archetype={item.archetype}
                    isFeatured={true}
                  />
                </div>
              ))}
            </section>

            <section className={styles.remainingGrid}>
              {remaining.map((item) => (
                <PlayerPreviewMiniPlayerCard
                  key={item.playerId}
                  player={item.player}
                  rank={item.rank}
                  archetype={item.archetype}
                />
              ))}
            </section>
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
