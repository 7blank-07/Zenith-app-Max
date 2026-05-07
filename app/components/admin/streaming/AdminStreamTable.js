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

function buildPageHref({ basePath, page, searchValue, statusValue }) {
  const params = new URLSearchParams();

  if (searchValue) params.set('search', searchValue);
  if (statusValue) params.set('status', statusValue);
  if (page > 1) params.set('page', String(page));

  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

function getStatusClass(status) {
  switch (status) {
    case 'live':
      return styles.statusPublished;
    case 'upcoming':
      return styles.statusDraft;
    case 'replay':
      return styles.statusRejected;
    default:
      return styles.statusDraft;
  }
}

export default function AdminStreamTable({
  title,
  description,
  basePath,
  createHref = '/admin/streaming/new',
  entries = [],
  pagination,
  searchValue = '',
  statusValue = '',
  emptyTitle = 'No streams yet',
  emptyDescription = 'Create your first stream entry to start broadcasting.'
}) {
  const hasFilters = Boolean(searchValue || statusValue);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{title}</h2>
          <p className={styles.tableDescription}>{description}</p>
        </div>
        <div className={styles.tableHeaderActions}>
          <span className={styles.tableMeta}>{pagination?.totalItems ?? 0} total streams</span>
          <Link href={createHref} className={styles.buttonSecondary}>
            Create Stream
          </Link>
        </div>
      </div>

      <form action={basePath} method="get" className={styles.filters}>
        <div className={styles.filterRow}>
          <label className={styles.field}>
            <span className={styles.label}>Search title or tournament</span>
            <input className={styles.input} type="search" name="search" defaultValue={searchValue} placeholder="Search streams" />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select className={styles.select} name="status" defaultValue={statusValue}>
              <option value="">All statuses</option>
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="replay">Replay</option>
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
                <th scope="col">Match Date</th>
                <th scope="col">Tournament</th>
                <th scope="col">Status</th>
                <th scope="col">Featured</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.titleCell}>
                    <span className={styles.titleText}>{entry.title}</span>
                    <span className={styles.titleMeta}>YouTube ID: {entry.youtubeId}</span>
                  </td>
                  <td>{formatDate(entry.matchDate)}</td>
                  <td>{entry.tournamentName || '—'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(entry.status)}`}>
                      {toText(entry.status)}
                    </span>
                  </td>
                  <td>{entry.featured ? 'Yes' : 'No'}</td>
                  <td>
                    <Link href={`/admin/streaming/edit/${encodeURIComponent(entry.id)}`} className={styles.titleLink}>
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
