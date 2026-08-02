import Link from 'next/link';
import styles from './AdminShell.module.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function buildPageHref({ basePath, page }) {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set('page', String(page));
  }
  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

export default function AdminPageSeoTable({
  title,
  description,
  basePath,
  createHref = '/admin/pages-seo/new',
  pages = [],
  pagination,
  emptyTitle,
  emptyDescription
}) {
  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{title}</h2>
          <p className={styles.tableDescription}>{description}</p>
        </div>
        <div className={styles.tableHeaderActions}>
          <span className={styles.tableMeta}>{pagination?.total ?? 0} total configurations</span>
          <Link href={createHref} className={styles.buttonSecondary}>
            Add configuration
          </Link>
        </div>
      </div>

      {pages.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Page Path</th>
                <th scope="col">Title</th>
                <th scope="col">Last Updated</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className={styles.titleCell}>
                    <span className={styles.titleText}>{page.pagePath}</span>
                  </td>
                  <td>{page.title || '—'}</td>
                  <td>{formatDate(page.updatedAt)}</td>
                  <td>
                    <div className={styles.actionLinks}>
                      <Link href={`/admin/pages-seo/edit/${encodeURIComponent(page.id)}`} className={styles.titleLink}>
                        Edit
                      </Link>
                      <Link href={page.pagePath} className={styles.titleLink} target="_blank" rel="noreferrer">
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
          {pagination.page > 1 ? (
            <Link
              href={buildPageHref({
                basePath,
                page: pagination.page - 1
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
          {pagination.page < pagination.totalPages ? (
            <Link
              href={buildPageHref({
                basePath,
                page: pagination.page + 1
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
