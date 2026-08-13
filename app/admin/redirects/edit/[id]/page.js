import { notFound } from 'next/navigation';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../../../src/lib/server/redeem-codes/repository.mjs';
import { getRedirectById } from '../../../../../src/lib/server/redirects/repository.mjs';
import AdminShell from '../../../../components/admin/AdminShell';
import AdminRedirectForm from '../../../../components/admin/AdminRedirectForm.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Redirect | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function EditRedirectPage({ params }) {
  const user = await requireBlogSessionUser({ nextPath: `/admin/redirects/edit/${params.id}`, permission: 'admin-access' });
  
  const [counts, redeemCounts, redirect] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    getRedirectById(params.id)
  ]);

  if (!redirect) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit Redirect"
      description="Modify or delete an existing URL redirect."
      currentPath="/admin/redirects"
      user={user}
      counts={{ ...counts, ...redeemCounts }}
    >
      <AdminRedirectForm redirectData={redirect} />
    </AdminShell>
  );
}
