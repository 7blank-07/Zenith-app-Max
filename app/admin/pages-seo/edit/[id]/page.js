import { notFound } from 'next/navigation';
import AdminShell from '../../../../components/admin/AdminShell';
import AdminPageSeoForm from '../../../../components/admin/AdminPageSeoForm.client';
import { getBlogDashboardCounts } from '../../../../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { adminPageSeoAction } from '../../../../actions/admin-page-seo';
import { getPageSeoById, getPageSeoDashboardCounts } from '../../../../../src/lib/server/page-seo.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Page SEO | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function AdminEditPageSeoRoute({ params }) {
  const id = params?.id;
  const user = await requireBlogSessionUser({ nextPath: `/admin/pages-seo/edit/${id}` });

  const [blogCounts, seoCounts, pageSeo] = await Promise.all([
    getBlogDashboardCounts({}),
    getPageSeoDashboardCounts(),
    getPageSeoById(id)
  ]);

  if (!pageSeo) {
    notFound();
  }

  const allCounts = { ...blogCounts, ...seoCounts };

  return (
    <AdminShell
      title="Edit Page SEO"
      description={`Update configuration for ${pageSeo.pagePath}`}
      currentPath="/admin/pages-seo"
      user={user}
      counts={allCounts}
    >
      <AdminPageSeoForm action={adminPageSeoAction} pageSeo={pageSeo} />
    </AdminShell>
  );
}
