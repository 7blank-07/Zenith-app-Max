import Link from 'next/link';
import CopyCodeButton from './CopyCodeButton.client';
import styles from './RedeemCodeHubPage.module.css';

function formatDate(value, locale = 'en-US') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  }).format(date);
}

function renderCodeCard(entry, locale) {
  return (
    <article key={entry.id} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${entry.status === 'active' ? styles.statusActive : styles.statusExpired}`}>
          {entry.status === 'active' ? 'Active' : 'Expired'}
        </span>
        <span className={styles.scope}>{entry.scopeLabel}</span>
      </div>

      <h3 className={styles.cardTitle}>{entry.title}</h3>
      <CopyCodeButton codeValue={entry.codeValue} className={styles.codeButton} copiedLabel="Copied" idleLabel={entry.codeValue} />

      <div className={styles.cardFooter}>
        <span>Published: {formatDate(entry.publishedAt, locale)}</span>
        <span>Expires: {formatDate(entry.expiresAt, locale)}</span>
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

  return (
    <div className={`${styles.page} ${isRtl ? styles.rtl : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {(route.breadcrumb || []).map((entry, index) => (
          <span key={`${entry.path}-${index}`}>
            {index > 0 ? ' / ' : ''}
            <Link href={entry.path}>{entry.name}</Link>
          </span>
        ))}
      </nav>

      <header className={styles.header}>
        <span className={styles.eyebrow}>Redeem code hub</span>
        <h1 className={styles.title}>{route.h1}</h1>
        <p className={styles.description}>{route.intro}</p>
        <p className={styles.updatedAt}>Last updated: {formatDate(updatedAt, locale)}</p>
      </header>

      <section className={styles.linkPanel}>
        <h2 className={styles.linkPanelTitle}>Browse current launch pages</h2>
        <div className={styles.links}>
          {links.map((entry) => (
            <Link key={entry.href} href={entry.href}>
              {entry.label}
            </Link>
          ))}
        </div>
      </section>

      <form className={styles.filters} action={route.path} method="get">
        <label className={styles.field}>
          <span className={styles.label}>Search codes or titles</span>
          <input className={styles.input} type="search" name="q" defaultValue={pageData?.search || ''} placeholder="Search redeem code list" />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Section filter</span>
          <select className={styles.select} name="section" defaultValue={section.value || 'all'}>
            <option value="all">All sections</option>
            <option value="active">Active only</option>
            <option value="latest">Latest only</option>
            <option value="expired">Expired only</option>
          </select>
        </label>

        <button className={styles.button} type="submit">
          Apply
        </button>
      </form>

      {!availability.isConfigured ? (
        <section className={styles.availabilityCard}>
          <h2 className={styles.sectionTitle}>{availability.title}</h2>
          <p className={styles.empty}>{availability.description}</p>
        </section>
      ) : (
        <>
          {section.showActive ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Active Codes</h2>
                <span className={styles.sectionMeta}>{activeCodes.length} active</span>
              </div>
              {activeCodes.length ? <div className={styles.cards}>{activeCodes.map((entry) => renderCodeCard(entry, locale))}</div> : <p className={styles.empty}>No active redeem code currently.</p>}
            </section>
          ) : null}

          {section.showLatest ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{route.todayOnly ? 'Latest Codes Published Today' : 'Latest Codes'}</h2>
                <span className={styles.sectionMeta}>{latestCodes.length} listed</span>
              </div>
              {latestCodes.length ? <div className={styles.cards}>{latestCodes.map((entry) => renderCodeCard(entry, locale))}</div> : <p className={styles.empty}>No matching latest codes were found.</p>}
            </section>
          ) : null}

          {section.showExpired ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Expired Codes</h2>
                <span className={styles.sectionMeta}>{expiredCodes.length} archived</span>
              </div>
              {expiredCodes.length ? <div className={styles.cards}>{expiredCodes.map((entry) => renderCodeCard(entry, locale))}</div> : <p className={styles.empty}>No expired codes are archived yet.</p>}
            </section>
          ) : null}
        </>
      )}

      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>FAQ</h2>
        {faqEntries.map((entry) => (
          <details key={entry.question}>
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
