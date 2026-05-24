import AdminShell from '../../components/admin/AdminShell';
import AdminBlogTable from '../../components/admin/AdminBlogTable';
import { getBlogDashboardCounts, listAdminBlogs, listBlogCategories } from '../../../src/lib/server/blog/repository.mjs';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../src/lib/server/streams/repository.mjs';
import { getPartnerDashboardCounts } from '../../../src/lib/server/partners/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog Dashboard | Zenith Admin',
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

export default async function AdminBlogsPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/blogs' });
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const category = readSearchParam(searchParams, 'category');
  const notice = readSearchParam(searchParams, 'notice');
  const scope = getAuthorScope(user);

  const [counts, redeemCounts, streamCounts, partnerCounts, categories, blogList] = await Promise.all([
    getBlogDashboardCounts(scope),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts(),
    listBlogCategories(),
    listAdminBlogs({
      ...scope,
      page,
      search,
      categorySlug: category
    })
  ]);

  const allCounts = {
    ...counts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Blog dashboard"
      description="Track every article, monitor editorial volume, and keep the public blog routes aligned with the CMS."
      currentPath="/admin/blogs"
      user={user}
      counts={allCounts}
      notice={notice}
    >
      <AdminBlogTable
        title="All blog posts"
        description="Review the latest activity across drafts, pending reviews, rejected submissions, and published articles."
        basePath="/admin/blogs"
        createHref="/admin/blogs/new"
        posts={blogList.items}
        pagination={blogList.pagination}
        categories={categories}
        searchValue={search}
        categoryValue={category}
        emptyTitle="No blog posts yet"
        emptyDescription="Create your first article to start filling the draft, review, and publish workflow."
      />
    </AdminShell>
  );
}
