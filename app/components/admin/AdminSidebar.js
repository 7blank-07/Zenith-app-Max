import Link from 'next/link';
import styles from './AdminShell.module.css';

const NAV_ITEMS = Object.freeze([
  { href: '/admin/blogs', label: 'All posts', countKey: 'total', exact: true },
  { href: '/admin/blogs/drafts', label: 'Drafts', countKey: 'draft', exact: true },
  { href: '/admin/blogs/pending', label: 'Pending review', countKey: 'pending', exact: true }
]);

function isActiveItem(item, currentPath) {
  if (item.exact) {
    return currentPath === item.href;
  }

  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

export default function AdminSidebar({ currentPath, counts }) {
  return (
    <aside className={styles.sidebar}>
      <div>
        <span className={styles.eyebrow}>Zenith CMS</span>
        <h2 className={styles.brandTitle}>Editorial dashboard</h2>
        <p className={styles.brandText}>
          Signed-cookie access for editors and admins, isolated from the public player and tools flows.
        </p>
      </div>

      <nav aria-label="Admin navigation" className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActiveItem(item, currentPath) ? styles.navLinkActive : ''}`.trim()}
          >
            <span>{item.label}</span>
            <span className={styles.navBadge}>{counts?.[item.countKey] ?? 0}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
