import { logoutAdminAction } from '../../actions/admin-auth';
import { getBlogRoleDescription } from '../../../src/lib/server/blog/permissions.mjs';
import AdminSidebar from './AdminSidebar';
import AdminStatsCards from './AdminStatsCards';
import styles from './AdminShell.module.css';

function formatRoleLabel(role) {
  const normalized = String(role || '').trim().toLowerCase();
  return normalized ? `${normalized[0].toUpperCase()}${normalized.slice(1)}` : 'Editor';
}

export default function AdminShell({
  title,
  description,
  currentPath,
  user,
  counts,
  notice,
  children
}) {
  return (
    <div className={styles.shell}>
      <AdminSidebar currentPath={currentPath} counts={counts} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>Zenith CMS</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.userPanel}>
            <span className={styles.rolePill}>{formatRoleLabel(user?.role)}</span>
            <p className={styles.userName}>{user?.name || 'Editorial user'}</p>
            <p className={styles.userEmail}>{user?.email || 'No email address available'}</p>
            <p className={styles.userDescription}>{getBlogRoleDescription(user?.role)}</p>

            <form action={logoutAdminAction} className={styles.logoutForm}>
              <button type="submit" className={styles.logoutButton}>
                Log out
              </button>
            </form>
          </div>
        </header>

        {notice ? <div className={styles.noticeBanner}>{notice}</div> : null}
        <AdminStatsCards counts={counts} />
        {children}
      </div>
    </div>
  );
}
