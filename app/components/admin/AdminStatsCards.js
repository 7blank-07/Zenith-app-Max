import Link from 'next/link';
import styles from './AdminShell.module.css';

const CARD_CONFIG = Object.freeze([
  {
    href: '/admin/blogs',
    label: 'All posts',
    key: 'total',
    description: 'Every draft, pending review, rejected, and published article in the CMS.'
  },
  {
    href: '/admin/blogs/drafts',
    label: 'Drafts',
    key: 'draft',
    description: 'Content still being shaped before it moves into the review queue.'
  },
  {
    href: '/admin/blogs/pending',
    label: 'Pending',
    key: 'pending',
    description: 'Articles that are waiting on editorial review or publishing approval.'
  },
  {
    href: '/admin/blogs',
    label: 'Published',
    key: 'published',
    description: 'Live articles currently available to the public `/blogs` routes.'
  }
]);

export default function AdminStatsCards({ counts }) {
  return (
    <div className={styles.statsGrid}>
      {CARD_CONFIG.map((card) => (
        <Link key={card.label} href={card.href} className={styles.statCard}>
          <span className={styles.statLabel}>{card.label}</span>
          <span className={styles.statValue}>{counts?.[card.key] ?? 0}</span>
          <span className={styles.statText}>{card.description}</span>
        </Link>
      ))}
    </div>
  );
}
