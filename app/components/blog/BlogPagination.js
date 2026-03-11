import Link from 'next/link';
import styles from './BlogLayout.module.css';

function buildPageHref(basePath, page) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function getVisiblePages(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
}

export default function BlogPagination({ basePath, pagination }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);

  return (
    <div className={styles.pagination}>
      {pagination.hasPreviousPage ? (
        <Link href={buildPageHref(basePath, pagination.page - 1)} className={styles.paginationLink}>
          Prev
        </Link>
      ) : (
        <span className={styles.paginationDisabled}>Prev</span>
      )}

      {visiblePages.map((pageNumber) =>
        pageNumber === pagination.page ? (
          <span key={pageNumber} className={styles.paginationActive}>
            {pageNumber}
          </span>
        ) : (
          <Link key={pageNumber} href={buildPageHref(basePath, pageNumber)} className={styles.paginationLink}>
            {pageNumber}
          </Link>
        )
      )}

      {pagination.hasNextPage ? (
        <Link href={buildPageHref(basePath, pagination.page + 1)} className={styles.paginationLink}>
          Next
        </Link>
      ) : (
        <span className={styles.paginationDisabled}>Next</span>
      )}

      <span className={styles.paginationSummary}>
        Page {pagination.page} of {pagination.totalPages}
      </span>
    </div>
  );
}
