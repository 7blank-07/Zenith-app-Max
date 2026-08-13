import Link from 'next/link';
import styles from './AdminShell.module.css';

export default function AdminRedirectTable({ redirects }) {
  if (!redirects || redirects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No redirects have been created yet.</p>
        <Link href="/admin/redirects/new" className={styles.button}>
          Create your first redirect
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Old URL</th>
            <th className={styles.th}>New URL</th>
            <th className={styles.th}>Updated At</th>
            <th className={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map((redirect) => (
            <tr key={redirect.id} className={styles.tr}>
              <td className={styles.td}>
                <code className={styles.codeSnippet}>{redirect.oldUrl}</code>
              </td>
              <td className={styles.td}>
                <code className={styles.codeSnippet}>{redirect.newUrl}</code>
              </td>
              <td className={styles.td}>
                {redirect.updatedAt ? new Date(redirect.updatedAt).toLocaleDateString() : 'N/A'}
              </td>
              <td className={styles.td}>
                <Link href={`/admin/redirects/edit/${redirect.id}`} className={styles.link}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
