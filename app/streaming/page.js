import SiteChrome from '../components/SiteChrome';
import { listPublicStreams } from '../../src/lib/server/streams/repository.mjs';
import { YouTubeEmbed, StreamBadge, StreamCard } from '../components/streaming/StreamComponents';
import styles from '../components/streaming/Streaming.module.css';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: 'ZenithFCM Streaming Hub | Live Tournaments & Replays',
  description: 'Watch live FC Mobile tournaments, upcoming community events, and catch up on replays in the ZenithFCM Streaming Hub.',
};

export default async function StreamingHubPage({ searchParams }) {
  const filter = searchParams?.filter || 'all';
  
  const allStreams = await listPublicStreams({ limit: 100 });
  
  // Find hero stream (live or closest upcoming)
  const heroStream = allStreams.find(s => s.status === 'live') || 
                     allStreams.find(s => s.featured) || 
                     allStreams[0];

  // Filter streams for the grid based on active filter tab
  const gridStreams = allStreams.filter(s => {
    if (s.id === heroStream?.id) return false; // Don't show hero stream in grid
    if (filter === 'live') return s.status === 'live';
    if (filter === 'upcoming') return s.status === 'upcoming';
    if (filter === 'replay') return s.status === 'replay';
    return true; // 'all' filter
  });

  return (
    <SiteChrome activeView="streaming">
      <main className="main-content" style={{ backgroundColor: 'var(--color-background, #000)', minHeight: '100vh', paddingTop: '2rem' }}>
        <div className={styles.hubContainer}>
          
          {heroStream ? (
            <section className={styles.heroSection}>
              <div className={styles.heroContent}>
                <StreamBadge status={heroStream.status} />
                <h1 className={styles.heroTitle}>{heroStream.title}</h1>
                <div className={styles.heroMeta}>
                  {heroStream.tournamentName && <span>🏆 {heroStream.tournamentName} </span>}
                  {heroStream.hostName && <span> • 🎙️ {heroStream.hostName}</span>}
                </div>
              </div>
              <YouTubeEmbed youtubeId={heroStream.youtubeId} title={heroStream.title} />
              <div className={styles.ctas}>
                <a href={`https://www.youtube.com/watch?v=${heroStream.youtubeId}`} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                  Watch on YouTube
                </a>
                <Link href={`/streaming/${heroStream.slug}`} className={styles.btnSecondary}>
                  View Details
                </Link>
                {heroStream.discordLink && (
                  <a href={heroStream.discordLink} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                    Join Discord
                  </a>
                )}
              </div>
            </section>
          ) : (
            <section className={styles.heroSection}>
              <h1 className={styles.heroTitle}>Streaming Hub</h1>
              <p className={styles.heroMeta}>No streams available at the moment. Check back later!</p>
            </section>
          )}

          {allStreams.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', overflowX: 'auto' }}>
                <Link href="/streaming?filter=all" style={{ color: filter === 'all' ? '#fff' : '#a1a1aa', textDecoration: 'none', fontWeight: 'bold' }}>All Streams</Link>
                <Link href="/streaming?filter=live" style={{ color: filter === 'live' ? '#fff' : '#a1a1aa', textDecoration: 'none', fontWeight: 'bold' }}>Live</Link>
                <Link href="/streaming?filter=upcoming" style={{ color: filter === 'upcoming' ? '#fff' : '#a1a1aa', textDecoration: 'none', fontWeight: 'bold' }}>Upcoming</Link>
                <Link href="/streaming?filter=replay" style={{ color: filter === 'replay' ? '#fff' : '#a1a1aa', textDecoration: 'none', fontWeight: 'bold' }}>Replays</Link>
              </div>

              <div className={styles.grid}>
                {gridStreams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
              {gridStreams.length === 0 && <p style={{ color: '#a1a1aa' }}>No streams found for this filter.</p>}
            </>
          )}
        </div>
      </main>
    </SiteChrome>
  );
}
