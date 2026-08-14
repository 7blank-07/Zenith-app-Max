import Link from 'next/link';
import styles from './AdminShell.module.css';

const NAV_ITEMS = Object.freeze([
  { href: '/admin/blogs', label: 'All posts', countKey: 'total', exact: true },
  { href: '/admin/blogs/drafts', label: 'Drafts', countKey: 'draft', exact: true },
  { href: '/admin/blogs/pending', label: 'Pending review', countKey: 'pending', exact: true },
  { href: '/admin/top-10', label: 'Top 10 Rankings', countKey: 'topTenTotal', exact: true },
  { href: '/admin/redeem-codes', label: 'Redeem codes', countKey: 'redeemTotal', exact: true },
  { href: '/admin/streaming', label: 'Streaming', countKey: 'streamingTotal', exact: true },
  { href: '/admin/partners', label: 'Partners', countKey: 'partnersTotal', exact: true },
  { href: '/admin/pages-seo', label: 'Pages SEO', countKey: 'pagesSeoTotal', exact: false },
  { href: '/admin/upload-image', label: 'Upload Image', countKey: null, exact: false }
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
          Signed-cookie access for editors and admins, covering both blog publishing and redeem code management.
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
        <Link
          href="/admin/redirects"
          className={`${styles.navLink} ${currentPath.startsWith('/admin/redirects') ? styles.navLinkActive : ''}`}
        >
          <span>URL Redirects</span>
        </Link>
      </nav>
    </aside>
  );
}
