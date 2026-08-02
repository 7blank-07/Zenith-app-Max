import AdminShell from '../../components/admin/AdminShell';
import AdminPageSeoTable from '../../components/admin/AdminPageSeoTable';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getPageSeoDashboardCounts, listPageSeoEntries } from '../../../src/lib/server/page-seo.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pages SEO | Zenith Admin',
  robots: { index: false, follow: false }
};

function readSearchParam(searchParams, key) {
  const value = searchParams?.[key];
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }
  return String(value || '').trim();
}

function parsePage(searchParams) {
  const parsed = Number.parseInt(readSearchParam(searchParams, 'page'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminPagesSeoList({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/pages-seo' });
  const page = parsePage(searchParams);
  const notice = readSearchParam(searchParams, 'notice');

  const [blogCounts, seoCounts, seoList] = await Promise.all([
    getBlogDashboardCounts({}),
    getPageSeoDashboardCounts(),
    listPageSeoEntries({ page, limit: 50 })
  ]);

  const allCounts = { ...blogCounts, ...seoCounts };

  return (
    <AdminShell
      title="Pages SEO"
      description="Manage custom SEO metadata and headings for the main static pages of the application."
      currentPath="/admin/pages-seo"
      user={user}
      counts={allCounts}
      notice={notice}
    >
      <AdminPageSeoTable
        title="SEO Configurations"
        description="List of all static pages with overridden SEO properties."
        basePath="/admin/pages-seo"
        createHref="/admin/pages-seo/new"
        pages={seoList.items}
        pagination={seoList.pagination}
        emptyTitle="No configurations found"
        emptyDescription="Add a new page SEO configuration to override default metadata."
      />
    </AdminShell>
  );
}
