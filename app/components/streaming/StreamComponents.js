import Link from 'next/link';
import Image from 'next/image';
import styles from './Streaming.module.css';

export function YouTubeEmbed({ youtubeId, title }) {
  if (!youtubeId) return null;
  return (
    <div className={styles.videoWrapper}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
        title={title || 'YouTube video player'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export function StreamBadge({ status }) {
  if (status === 'live') {
    return (
      <div className={styles.liveBadge}>
        <span className={styles.liveDot}></span>
        LIVE NOW
      </div>
    );
  }
  if (status === 'upcoming') {
    return <div className={styles.upcomingBadge}>Upcoming</div>;
  }
  return <div className={styles.replayBadge}>Replay</div>;
}

export function StreamCard({ stream }) {
  const thumbnailUrl = stream.thumbnail || (stream.youtubeId ? `https://img.youtube.com/vi/${stream.youtubeId}/hqdefault.jpg` : '');
  const dateStr = stream.matchDate ? new Date(stream.matchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <Link href={`/streaming/${stream.slug}`} className={styles.card}>
      <div className={styles.cardThumbnail}>
        {thumbnailUrl && (
          <Image src={thumbnailUrl} alt={stream.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" />
        )}
        <div className={styles.cardBadge}>
          <StreamBadge status={stream.status} />
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{stream.title}</h3>
        <div className={styles.cardMeta}>
          {stream.tournamentName && <div>🏆 {stream.tournamentName}</div>}
          {dateStr && <div>📅 {dateStr}</div>}
        </div>
        <div className={styles.cardFooter}>
          {stream.status === 'live' ? 'Watch Now' : stream.status === 'upcoming' ? 'Set Reminder' : 'Watch Replay'}
        </div>
      </div>
    </Link>
  );
}
