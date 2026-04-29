import Link from 'next/link';
import styles from './AdminShell.module.css';

const BLOG_CARD_CONFIG = Object.freeze([
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

const REDEEM_CARD_CONFIG = Object.freeze([
  {
    href: '/admin/redeem-codes',
    label: 'Redeem total',
    key: 'redeemTotal',
    description: 'Every redeem code entry across global and country scopes.'
  },
  {
    href: '/admin/redeem-codes?status=active',
    label: 'Redeem active',
    key: 'redeemActive',
    description: 'Codes currently live and shown first across public hub pages.'
  },
  {
    href: '/admin/redeem-codes?status=expired',
    label: 'Redeem expired',
    key: 'redeemExpired',
    description: 'Archived codes kept for history and search context.'
  }
]);

export default function AdminStatsCards({ counts }) {
  const allCards = [...BLOG_CARD_CONFIG, ...REDEEM_CARD_CONFIG];
  const visibleCards = allCards.filter((card) => Object.prototype.hasOwnProperty.call(counts || {}, card.key));
  const cards = visibleCards.length ? visibleCards : BLOG_CARD_CONFIG;

  return (
    <div className={styles.statsGrid}>
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className={styles.statCard}>
          <span className={styles.statLabel}>{card.label}</span>
          <span className={styles.statValue}>{counts?.[card.key] ?? 0}</span>
          <span className={styles.statText}>{card.description}</span>
        </Link>
      ))}
    </div>
  );
}
