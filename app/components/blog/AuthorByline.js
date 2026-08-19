import styles from './BlogLayout.module.css';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function getInitials(name) {
  const parts = toText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return 'ZE';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function formatDate(value) {
  if (!value) return 'Unscheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unscheduled';
  return DATE_FORMATTER.format(date);
}

export default function AuthorByline({ author, writerName, publishedAt, readingTime, compact = false }) {
  const authorName = toText(writerName) || 'ASTA';
  const details = [formatDate(publishedAt)];

  if (readingTime) {
    details.push(`${readingTime} min read`);
  }

  return (
    <div className={`${styles.authorLine} ${compact ? styles.authorLineCompact : ''}`.trim()}>
      <div className={`${styles.authorAvatar} ${compact ? styles.authorAvatarCompact : ''}`.trim()} aria-hidden="true">
        {getInitials(authorName)}
      </div>
      <div className={styles.authorText}>
        <span className={styles.authorName}>{authorName}</span>
        <span className={styles.authorMeta}>{details.join(' • ')}</span>
      </div>
    </div>
  );
}
