import SiteChrome from '../../components/SiteChrome';
import { getStreamBySlug, listPublicStreams } from '../../../src/lib/server/streams/repository.mjs';
import { YouTubeEmbed, StreamBadge, StreamCard } from '../../components/streaming/StreamComponents';
import styles from '../../components/streaming/Streaming.module.css';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({ params }) {
  const stream = await getStreamBySlug(params.slug);
  if (!stream) return {};

  return {
    title: stream.seoTitle || `${stream.title} | ZenithFCM Streaming`,
    description: stream.metaDescription || stream.description || `Watch ${stream.title} on ZenithFCM Streaming Hub.`,
  };
}

export default async function StreamDetailPage({ params }) {
  const stream = await getStreamBySlug(params.slug);
  
  if (!stream) {
    notFound();
  }

  const allStreams = await listPublicStreams({ limit: 10 });
  const relatedStreams = allStreams.filter(s => s.id !== stream.id).slice(0, 3);
  const dateStr = stream.matchDate ? new Date(stream.matchDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA';

  return (
    <SiteChrome activeView="streaming">
      <main className="main-content" style={{ backgroundColor: '#000', minHeight: '100vh' }}>
        <div className={styles.streamLayout}>
          
          <div className={styles.streamMain}>
            <div>
              <div style={{ marginBottom: '1rem' }}><StreamBadge status={stream.status} /></div>
              <h1 className={styles.heroTitle} style={{ fontSize: '2rem' }}>{stream.title}</h1>
            </div>
            
            <YouTubeEmbed youtubeId={stream.youtubeId} title={stream.title} />
            
            <div className={styles.ctas}>
              <a href={`https://www.youtube.com/watch?v=${stream.youtubeId}`} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                Watch on YouTube
              </a>
              {stream.discordLink && (
                <a href={stream.discordLink} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
                  Join Discord Community
                </a>
              )}
            </div>

            {stream.description && (
              <div className={styles.streamDetails}>
                <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', marginBottom: '1rem', border: 'none' }}>About this Event</h2>
                <p style={{ lineHeight: '1.6', color: '#d1d5db', whiteSpace: 'pre-wrap' }}>{stream.description}</p>
              </div>
            )}
          </div>

          <aside className={styles.streamSidebar}>
            <h3 className={styles.streamSidebarTitle}>Match Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {stream.tournamentName && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tournament</span>
                  <span className={styles.detailValue}>{stream.tournamentName}</span>
                </div>
              )}
              {stream.matchStage && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Stage</span>
                  <span className={styles.detailValue}>{stream.matchStage}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue} style={{ textAlign: 'right' }}>{dateStr}</span>
              </div>
              {stream.hostName && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Host</span>
                  <span className={styles.detailValue}>{stream.hostName}</span>
                </div>
              )}
              {stream.participants && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Participants</span>
                  <span className={styles.detailValue} style={{ textAlign: 'right' }}>{stream.participants}</span>
                </div>
              )}
            </div>

            {relatedStreams.length > 0 && (
              <>
                <h3 className={styles.streamSidebarTitle}>Related Streams</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {relatedStreams.map(s => (
                    <StreamCard key={s.id} stream={s} />
                  ))}
                </div>
              </>
            )}
          </aside>

        </div>
      </main>
    </SiteChrome>
  );
}
