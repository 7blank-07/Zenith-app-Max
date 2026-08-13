import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { listRedirects } from '../../../src/lib/server/redirects/repository.mjs';
import AdminShell from '../../components/admin/AdminShell';
import AdminRedirectTable from '../../components/admin/AdminRedirectTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'URL Redirects | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function AdminRedirectsPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redirects', permission: 'admin-access' });
  const [counts, redeemCounts, redirects] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    listRedirects()
  ]);

  return (
    <AdminShell
      title="URL Redirects"
      description="Manage global 301 redirects to ensure SEO authority is preserved when URLs change."
      currentPath="/admin/redirects"
      user={user}
      counts={{ ...counts, ...redeemCounts }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link 
          href="/admin/redirects/new" 
          style={{ background: 'var(--color-primary)', color: '#000', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}
        >
          + New Redirect
        </Link>
      </div>
      <AdminRedirectTable redirects={redirects} />
    </AdminShell>
  );
}
