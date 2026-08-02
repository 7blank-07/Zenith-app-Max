import AdminShell from '../../../components/admin/AdminShell';
import AdminPageSeoForm from '../../../components/admin/AdminPageSeoForm.client';
import { getBlogDashboardCounts } from '../../../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { adminPageSeoAction } from '../../../actions/admin-page-seo';
import { getPageSeoDashboardCounts } from '../../../../src/lib/server/page-seo.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Page SEO | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function AdminNewPageSeoRoute() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/pages-seo/new' });

  const [blogCounts, seoCounts] = await Promise.all([
    getBlogDashboardCounts({}),
    getPageSeoDashboardCounts()
  ]);

  const allCounts = { ...blogCounts, ...seoCounts };

  return (
    <AdminShell
      title="Create Page SEO"
      description="Configure metadata overrides for a static route."
      currentPath="/admin/pages-seo"
      user={user}
      counts={allCounts}
    >
      <AdminPageSeoForm action={adminPageSeoAction} />
    </AdminShell>
  );
}
