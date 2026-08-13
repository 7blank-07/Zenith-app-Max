import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../../src/lib/server/redeem-codes/repository.mjs';
import AdminShell from '../../../components/admin/AdminShell';
import AdminRedirectForm from '../../../components/admin/AdminRedirectForm.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Redirect | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function NewRedirectPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redirects/new', permission: 'admin-access' });
  const [counts, redeemCounts] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts()
  ]);

  return (
    <AdminShell
      title="Create New Redirect"
      description="Add a new 301 redirect to forward traffic from an old URL to a new URL."
      currentPath="/admin/redirects"
      user={user}
      counts={{ ...counts, ...redeemCounts }}
    >
      <AdminRedirectForm />
    </AdminShell>
  );
}
