import Link from 'next/link';
import styles from './AdminShell.module.css';
import { PARTNER_PLATFORM_VALUES } from '../../../src/lib/server/partners/constants.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function buildPageHref({ basePath, page, searchValue, platformValue }) {
  const params = new URLSearchParams();

  if (searchValue) {
    params.set('search', searchValue);
  }

  if (platformValue) {
    params.set('platform', platformValue);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export default function AdminPartnerTable({
  title,
  description,
  basePath,
  createHref = '/admin/partners/new',
  partners = [],
  pagination,
  searchValue = '',
  platformValue = '',
  emptyTitle,
  emptyDescription
}) {
  const hasFilters = Boolean(searchValue || platformValue);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{title}</h2>
          <p className={styles.tableDescription}>{description}</p>
        </div>
        <div className={styles.tableHeaderActions}>
          <span className={styles.tableMeta}>{pagination?.totalItems ?? 0} total partners</span>
          <Link href={createHref} className={styles.buttonSecondary}>
            Add partner
          </Link>
        </div>
      </div>

      <form action={basePath} method="get" className={styles.filters}>
        <div className={styles.filterRow}>
          <label className={styles.field}>
            <span className={styles.label}>Search name or username</span>
            <input
              className={styles.input}
              type="search"
              name="search"
              defaultValue={searchValue}
              placeholder="Search partners"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Platform</span>
            <select className={styles.select} name="platform" defaultValue={platformValue}>
              <option value="">All platforms</option>
              {PARTNER_PLATFORM_VALUES.map((platform) => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterActions}>
            <button type="submit" className={styles.button}>
              Apply filters
            </button>
            {hasFilters ? (
              <Link href={basePath} className={styles.buttonSecondary}>
                Clear filters
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      {partners.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Partner</th>
                <th scope="col">Platform</th>
                <th scope="col">Featured</th>
                <th scope="col">Verified</th>
                <th scope="col">Order</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td className={styles.titleCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {partner.avatarUrl ? (
                        <img 
                          src={partner.avatarUrl} 
                          alt={partner.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                          {partner.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className={styles.titleText}>{partner.name}</span>
                        <span className={styles.titleMeta}>{partner.username || partner.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{partner.platform.charAt(0).toUpperCase() + partner.platform.slice(1)}</td>
                  <td>{partner.featured ? '✅' : '—'}</td>
                  <td>{partner.verified ? '✅' : '—'}</td>
                  <td>{partner.displayOrder}</td>
                  <td>{formatDate(partner.createdAt)}</td>
                  <td>
                    <div className={styles.actionLinks}>
                      <Link href={`/admin/partners/edit/${encodeURIComponent(partner.id)}`} className={styles.titleLink}>
                        Edit
                      </Link>
                      <Link href={partner.socialUrl} className={styles.titleLink} target="_blank" rel="noreferrer">
                        Visit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3 className={styles.tableTitle}>{emptyTitle}</h3>
          <p className={styles.tableDescription}>{emptyDescription}</p>
        </div>
      )}

      {pagination?.totalPages > 1 ? (
        <div className={styles.pagination}>
          {pagination.hasPreviousPage ? (
            <Link
              href={buildPageHref({
                basePath,
                page: pagination.page - 1,
                searchValue,
                platformValue
              })}
              className={styles.paginationLink}
            >
              Previous page
            </Link>
          ) : (
            <span />
          )}
          <span className={styles.paginationCurrent}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.hasNextPage ? (
            <Link
              href={buildPageHref({
                basePath,
                page: pagination.page + 1,
                searchValue,
                platformValue
              })}
              className={styles.paginationLink}
            >
              Next page
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </section>
  );
}
