import Link from 'next/link';
import PartnerCard from './PartnerCard';
import styles from './Partners.module.css';

const PLATFORMS = [
  { label: 'All', value: '' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Discord', value: 'discord' },
  { label: 'Website', value: 'website' },
];

export default function PartnersIndexPage({
  partners = [],
  activePlatform = '',
  searchValue = ''
}) {
  const isFiltered = Boolean(activePlatform || searchValue);
  const featuredPartners = partners.filter(p => p.featured && !isFiltered);
  const regularPartners = partners.filter(p => !p.featured || isFiltered);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Ecosystem Partners</span>
        <h1 className={styles.title}>Official ZenithFCM Partners</h1>
        <p className={styles.description}>
          Creators, streamers, communities, and ecosystem partners supporting ZenithFCM.
        </p>
      </header>

      {featuredPartners.length > 0 && (
        <section className={styles.featuredSection}>
          <h2 className={styles.sectionTitle}>Featured Partners</h2>
          <div className={styles.featuredGrid}>
            {featuredPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {PLATFORMS.map(platform => (
            <Link
              key={platform.label}
              href={platform.value ? `/partners?platform=${platform.value}${searchValue ? `&search=${searchValue}` : ''}` : `/partners${searchValue ? `?search=${searchValue}` : ''}`}
              className={`${styles.tab} ${activePlatform === platform.value ? styles.tabActive : ''}`.trim()}
            >
              {platform.label}
            </Link>
          ))}
        </div>

        <form action="/partners" method="get" className={styles.searchWrapper}>
          <input
            type="search"
            name="search"
            defaultValue={searchValue}
            placeholder="Search creators..."
            className={styles.searchInput}
          />
          {activePlatform && <input type="hidden" name="platform" value={activePlatform} />}
        </form>
      </div>

      {regularPartners.length > 0 ? (
        <div className={styles.grid}>
          {regularPartners.map(partner => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyStateTitle}>No partners found</h3>
          <p className={styles.emptyStateText}>Try adjusting your filters or search query.</p>
        </div>
      )}

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Become a ZenithFCM Partner</h2>
        <p className={styles.ctaText}>
          Are you a creator or community leader? Join our official partner program and get exclusive benefits.
        </p>
        <Link href="/contact" className={styles.ctaButton}>
          Apply for Partnership
        </Link>
      </section>
    </div>
  );
}
