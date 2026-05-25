import Link from 'next/link';
import CopyCodeButton from './CopyCodeButton.client';
import AdsenseAd from '../AdsenseAd';
import styles from './RedeemCodeHubPage.module.css';

const DEFAULT_COPY = Object.freeze({
  breadcrumbLabel: 'Breadcrumb',
  eyebrow: 'Redeem code hub',
  lastUpdatedLabel: 'Last updated:',
  browsePagesTitle: 'Select Region',
  searchLabel: 'Search codes',
  searchPlaceholder: 'Search for active codes...',
  sectionFilterLabel: 'Filter by status',
  sectionAll: 'All Codes',
  sectionActive: 'Active',
  sectionLatest: 'Latest',
  sectionExpired: 'Expired',
  applyButton: 'Apply Filters',
  activeTitle: 'Active Codes',
  activeCountSuffix: 'active',
  activeEmpty: 'No active redeem code currently.',
  latestTitle: 'Latest Codes',
  latestTodayTitle: 'Published Today',
  latestCountSuffix: 'listed',
  latestEmpty: 'No matching codes found.',
  expiredTitle: 'Expired Codes',
  expiredCountSuffix: 'archived',
  expiredEmpty: 'No expired codes archived.',
  faqTitle: 'Frequently Asked Questions',
  statusActive: 'Active',
  statusExpired: 'Expired',
  publishedLabel: 'Published',
  expiresLabel: 'Expires'
});

function formatDate(value, locale = 'en-US') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(date);
}

function renderCodeCard(entry, locale, copy) {
  return (
    <article key={entry.id} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${entry.status === 'active' ? styles.statusActive : styles.statusExpired}`}>
          {entry.status === 'active' ? copy.statusActive : copy.statusExpired}
        </span>
        <span className={styles.scope}>{entry.scopeLabel}</span>
      </div>

      <h3 className={styles.cardTitle}>{entry.title}</h3>
      <CopyCodeButton 
        codeValue={entry.codeValue} 
        className={styles.codeButton} 
        copiedLabel="COPIED!" 
        idleLabel={entry.codeValue} 
      />

      <div className={styles.cardFooter}>
        <span>
          <strong>{copy.publishedLabel}:</strong> {formatDate(entry.publishedAt, locale)}
        </span>
        <span>
          <strong>{copy.expiresLabel}:</strong> {formatDate(entry.expiresAt, locale)}
        </span>
      </div>
    </article>
  );
}

export default function RedeemCodeHubPage({ pageData }) {
  const route = pageData?.route || {};
  const section = pageData?.section || {};
  const activeCodes = Array.isArray(pageData?.activeCodes) ? pageData.activeCodes : [];
  const latestCodes = Array.isArray(pageData?.latestCodes) ? pageData.latestCodes : [];
  const expiredCodes = Array.isArray(pageData?.expiredCodes) ? pageData.expiredCodes : [];
  const availability = pageData?.availability || {};
  const links = Array.isArray(pageData?.links) ? pageData.links : [];
  const faqEntries = Array.isArray(pageData?.faq) ? pageData.faq : [];
  const updatedAt = pageData?.updatedAt || '';
  const locale = route.locale || 'en-US';
  const isRtl = route.textDirection === 'rtl';
  const copy = {
    ...DEFAULT_COPY,
    ...(route.copy || {})
  };

  return (
    <div className={`${styles.page} ${isRtl ? styles.rtl : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className={styles.breadcrumbs} aria-label={copy.breadcrumbLabel}>
        {(route.breadcrumb || []).map((entry, index) => (
          <span key={`${entry.path}-${index}`}>
            {index > 0 ? ' / ' : ''}
            <Link href={entry.path}>{entry.name}</Link>
          </span>
        ))}
      </nav>

      <header className={styles.header}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h1 className={styles.title}>{route.h1}</h1>
        <p className={styles.description}>{route.intro}</p>
        {route.globalCodeNote ? (
          <p className={styles.description} style={{ marginTop: '8px', opacity: 0.8 }}>
            {route.globalCodeNote}
          </p>
        ) : null}
        <div className={styles.updatedAt}>
          {copy.lastUpdatedLabel} {formatDate(updatedAt, locale)}
        </div>
      </header>

      <div className={styles.dashboard}>
        {links.length > 0 && (
          <section className={styles.linkPanel}>
            <h2 className={styles.linkPanelTitle}>{copy.browsePagesTitle}</h2>
            <div className={styles.links}>
              {links.map((entry) => (
                <Link key={entry.href} href={entry.href} className={route.path === entry.href ? styles.activeLink : ''}>
                  {entry.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <form className={styles.filters} action={route.path} method="get">
          <label className={styles.field}>
            <span className={styles.label}>{copy.searchLabel}</span>
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={pageData?.search || ''}
              placeholder={copy.searchPlaceholder}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{copy.sectionFilterLabel}</span>
            <select className={styles.select} name="section" defaultValue={section.value || 'all'}>
              <option value="all">{copy.sectionAll}</option>
              <option value="active">{copy.sectionActive}</option>
              <option value="latest">{copy.sectionLatest}</option>
              <option value="expired">{copy.sectionExpired}</option>
            </select>
          </label>

          <button className={styles.button} type="submit">
            {copy.applyButton}
          </button>
        </form>
      </div>

      {!availability.isConfigured ? (
        <section className={styles.availabilityCard}>
          <h2 className={styles.sectionTitle}>{availability.title}</h2>
          <p className={styles.empty}>{availability.description}</p>
        </section>
      ) : (
        <>
          {section.showActive && (
            <>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{copy.activeTitle}</h2>
                  <span className={styles.sectionMeta}>{`${activeCodes.length} ${copy.activeCountSuffix}`}</span>
                </div>
                {activeCodes.length ? (
                  <div className={styles.cards}>{activeCodes.map((entry) => renderCodeCard(entry, locale, copy))}</div>
                ) : (
                  <p className={styles.empty}>{copy.activeEmpty}</p>
                )}
              </section>
              <AdsenseAd slot="3323774708" style={{ margin: '20px 0 40px' }} />
            </>
          )}

          {section.showLatest && (
            <>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{route.todayOnly ? copy.latestTodayTitle : copy.latestTitle}</h2>
                  <span className={styles.sectionMeta}>{`${latestCodes.length} ${copy.latestCountSuffix}`}</span>
                </div>
                {latestCodes.length ? (
                  <div className={styles.cards}>{latestCodes.map((entry) => renderCodeCard(entry, locale, copy))}</div>
                ) : (
                  <p className={styles.empty}>{copy.latestEmpty}</p>
                )}
              </section>
              <AdsenseAd slot="2010693034" style={{ margin: '20px 0 40px' }} />
            </>
          )}

          {section.showExpired && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{copy.expiredTitle}</h2>
                <span className={styles.sectionMeta}>{`${expiredCodes.length} ${copy.expiredCountSuffix}`}</span>
              </div>
              {expiredCodes.length ? (
                <div className={styles.cards}>{expiredCodes.map((entry) => renderCodeCard(entry, locale, copy))}</div>
              ) : (
                <p className={styles.empty}>{copy.expiredEmpty}</p>
              )}
            </section>
          )}
        </>
      )}

      {faqEntries.length > 0 && (
        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>{copy.faqTitle}</h2>
          <div className={styles.faqList}>
            {faqEntries.map((entry) => (
              <details key={entry.question}>
                <summary>{entry.question}</summary>
                <p>{entry.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
