import Link from 'next/link';
import styles from './AdminShell.module.css';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function buildPageHref({ basePath, page, searchValue, categoryValue }) {
  const params = new URLSearchParams();

  if (searchValue) {
    params.set('search', searchValue);
  }

  if (categoryValue) {
    params.set('category', categoryValue);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params.size ? `${basePath}?${params.toString()}` : basePath;
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getStatusClass(status) {
  switch (status) {
    case 'draft':
      return styles.statusDraft;
    case 'pending':
      return styles.statusPending;
    case 'published':
      return styles.statusPublished;
    case 'rejected':
      return styles.statusRejected;
    default:
      return '';
  }
}

export default function AdminBlogTable({
  title,
  description,
  basePath,
  createHref = '/admin/blogs/new',
  posts = [],
  pagination,
  categories = [],
  searchValue = '',
  categoryValue = '',
  emptyTitle,
  emptyDescription
}) {
  const hasFilters = Boolean(searchValue || categoryValue);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableTitle}>{title}</h2>
          <p className={styles.tableDescription}>{description}</p>
        </div>
        <div className={styles.tableHeaderActions}>
          <span className={styles.tableMeta}>{pagination?.totalItems ?? 0} total articles</span>
          <Link href={createHref} className={styles.buttonSecondary}>
            Create article
          </Link>
        </div>
      </div>

      <form action={basePath} method="get" className={styles.filters}>
        <div className={styles.filterRow}>
          <label className={styles.field}>
            <span className={styles.label}>Search title or slug</span>
            <input
              className={styles.input}
              type="search"
              name="search"
              defaultValue={searchValue}
              placeholder="Search blog posts"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <select className={styles.select} name="category" defaultValue={categoryValue}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id || category.slug} value={category.slug}>
                  {category.name}
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

      {posts.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Article</th>
                <th scope="col">Status</th>
                <th scope="col">Category</th>
                <th scope="col">Author</th>
                <th scope="col">Updated</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const publicHref = post.category?.slug && post.slug
                  ? `/blogs/${encodeURIComponent(post.category.slug)}/${encodeURIComponent(post.slug)}`
                  : '';

                return (
                  <tr key={post.id}>
                    <td className={styles.titleCell}>
                      <span className={styles.titleText}>{post.title}</span>
                      <span className={styles.titleMeta}>{post.excerpt || post.slug}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(post.status)}`.trim()}>
                        {toText(post.status, 'unknown')}
                      </span>
                    </td>
                    <td>{post.category?.name || 'Unknown category'}</td>
                    <td>
                      {post.author?.name || 'Unknown author'}
                      <span className={styles.muted}>{post.author?.email || 'No author email'}</span>
                    </td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td>
                      <div className={styles.actionLinks}>
                        <Link href={`/admin/blogs/edit/${encodeURIComponent(post.id)}`} className={styles.titleLink}>
                          Open editor
                        </Link>
                        {post.status === 'published' && publicHref ? (
                          <Link href={publicHref} className={styles.titleLink} target="_blank" rel="noreferrer">
                            View live article
                          </Link>
                        ) : (
                          <span className={styles.muted}>Not live yet</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                categoryValue
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
                categoryValue
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
