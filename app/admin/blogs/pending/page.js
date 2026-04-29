import AdminShell from '../../../components/admin/AdminShell';
import AdminBlogTable from '../../../components/admin/AdminBlogTable';
import { BLOG_STATUS } from '../../../../src/lib/server/blog/constants.mjs';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts, listAdminBlogs, listBlogCategories } from '../../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pending Review | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
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

function getAuthorScope(user) {
  return user?.role === 'admin' ? {} : { authorId: user?.id };
}

export default async function AdminPendingBlogsPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/blogs/pending' });
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const category = readSearchParam(searchParams, 'category');
  const notice = readSearchParam(searchParams, 'notice');
  const scope = getAuthorScope(user);

  const [counts, redeemCounts, categories, blogList] = await Promise.all([
    getBlogDashboardCounts(scope),
    getRedeemDashboardCounts(),
    listBlogCategories(),
    listAdminBlogs({
      ...scope,
      page,
      search,
      categorySlug: category,
      statuses: [BLOG_STATUS.PENDING]
    })
  ]);

  return (
    <AdminShell
      title="Pending review"
      description="Monitor submissions that are waiting on editorial review and publish decisions."
      currentPath="/admin/blogs/pending"
      user={user}
      counts={{ ...counts, ...redeemCounts }}
      notice={notice}
    >
      <AdminBlogTable
        title="Pending articles"
        description="Review-ready articles land here so admins can approve, reject, or publish them."
        basePath="/admin/blogs/pending"
        createHref="/admin/blogs/new"
        posts={blogList.items}
        pagination={blogList.pagination}
        categories={categories}
        searchValue={search}
        categoryValue={category}
        emptyTitle="No pending articles"
        emptyDescription="Submit a draft for review from the editor and it will appear here immediately."
      />
    </AdminShell>
  );
}
