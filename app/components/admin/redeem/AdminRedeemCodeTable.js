import Link from 'next/link';
import styles from '../AdminShell.module.css';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function formatDate(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}

function buildPageHref({ basePath, page, searchValue, scopeValue, statusValue }) {
  const params = new URLSearchParams();

  if (searchValue) params.set('search', searchValue);
  if (scopeValue) params.set('scope', scopeValue);
  if (statusValue) params.set('status', statusValue);
  if (page > 1) params.set('page', String(page));

  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

function getStatusClass(status) {
  switch (status) {
    case 'active':
      return styles.statusPublished;
    case 'expired':
      return styles.statusRejected;
    default:
      return styles.statusDraft;
  }
}

export default function AdminRedeemCodeTable({
  title,
  description,
  basePath,
  createHref = '/admin/redeem-codes/new',
  entries = [],
  pagination,
  searchValue = '',
  scopeValue = '',
  statusValue = '',
  scopeOptions = [],
  emptyTitle = 'No redeem codes yet',
  emptyDescription = 'Create your first redeem code entry to start publishing.'
}) {
  const hasFilters = Boolean(searchValue || scopeValue || statusValue);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{title}</h2>
          <p className={styles.tableDescription}>{description}</p>
        </div>
        <div className={styles.tableHeaderActions}>
          <span className={styles.tableMeta}>{pagination?.totalItems ?? 0} total codes</span>
          <Link href={createHref} className={styles.buttonSecondary}>
            Publish code
          </Link>
        </div>
      </div>

      <form action={basePath} method="get" className={styles.filters}>
        <div className={styles.filterRow}>
          <label className={styles.field}>
            <span className={styles.label}>Search title or code value</span>
            <input className={styles.input} type="search" name="search" defaultValue={searchValue} placeholder="Search redeem codes" />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Scope</span>
            <select className={styles.select} name="scope" defaultValue={scopeValue}>
              <option value="">All scopes</option>
              {scopeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select className={styles.select} name="status" defaultValue={statusValue}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
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

      {entries.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Code</th>
                <th scope="col">Scope</th>
                <th scope="col">Status</th>
                <th scope="col">Published</th>
                <th scope="col">Expires</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.titleCell}>
                    <span className={styles.titleText}>{entry.title}</span>
                    <span className={styles.titleMeta}>Updated {formatDate(entry.updatedAt)}</span>
                  </td>
                  <td>
                    <code>{entry.codeValue}</code>
                  </td>
                  <td>{entry.scopeLabel}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(entry.status)}`}>
                      {toText(entry.status)}
                    </span>
                  </td>
                  <td>{formatDate(entry.publishedAt)}</td>
                  <td>{formatDate(entry.expiresAt)}</td>
                  <td>
                    <Link href={`/admin/redeem-codes/edit/${encodeURIComponent(entry.id)}`} className={styles.titleLink}>
                      Open editor
                    </Link>
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
                scopeValue,
                statusValue
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
                scopeValue,
                statusValue
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
