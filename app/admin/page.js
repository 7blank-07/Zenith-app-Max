import { redirect } from 'next/navigation';
import { loginAdminAction } from '../actions/admin-auth';
import AdminLoginForm from '../components/admin/AdminLoginForm.client';
import styles from '../components/admin/AdminShell.module.css';
import { getBlogAuthAvailability, getBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import { normalizeAdminNextPath } from '../../src/lib/server/blog/session.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Login | Zenith',
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage({ searchParams = {} }) {
  const nextPath = normalizeAdminNextPath(searchParams.next, '/admin/blogs');
  const sessionUser = await getBlogSessionUser();

  if (sessionUser) {
    redirect(nextPath);
  }

  const availability = getBlogAuthAvailability();

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <span className={styles.eyebrow}>Zenith CMS</span>
        <h1 className={styles.title}>Admin access</h1>
        <p className={styles.description}>
          Sign in with the seeded editor or admin user to reach the protected blog dashboard.
        </p>

        {availability.isConfigured ? (
          <>
            <AdminLoginForm action={loginAdminAction} nextPath={nextPath} />
            <div className={styles.helperCard}>
              <p className={styles.description}>
                Phase 3 ships the signed-cookie auth gateway and dashboard. Phase 4 adds the article editor and
                editorial workflow actions.
              </p>
            </div>
          </>
        ) : (
          <div className={styles.helperCard}>
            <h2 className={styles.tableTitle}>Admin auth is not configured yet</h2>
            <p className={styles.tableDescription}>
              Set the missing environment variables, run the migrations, and seed the initial users before signing in.
            </p>
            <ul className={styles.hintList}>
              {availability.missing.map((entry) => (
                <li key={entry}>
                  Set <code>{entry}</code> in your environment.
                </li>
              ))}
              <li>
                Run <code>npm run db:migrate:blog</code> to create the PostgreSQL schema.
              </li>
              <li>
                Run <code>npm run db:seed:blog-users</code> after defining the bootstrap user env vars.
              </li>
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
