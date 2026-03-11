import AdminShell from '../../../components/admin/AdminShell';
import AdminBlogTable from '../../../components/admin/AdminBlogTable';
import { BLOG_STATUS } from '../../../../src/lib/server/blog/constants.mjs';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts, listAdminBlogs, listBlogCategories } from '../../../../src/lib/server/blog/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Draft Queue | Zenith Admin',
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

export default async function AdminDraftBlogsPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/blogs/drafts' });
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const category = readSearchParam(searchParams, 'category');
  const notice = readSearchParam(searchParams, 'notice');
  const scope = getAuthorScope(user);

  const [counts, categories, blogList] = await Promise.all([
    getBlogDashboardCounts(scope),
    listBlogCategories(),
    listAdminBlogs({
      ...scope,
      page,
      search,
      categorySlug: category,
      statuses: [BLOG_STATUS.DRAFT]
    })
  ]);

  return (
    <AdminShell
      title="Draft queue"
      description="See which stories are still being shaped before they move into the editorial review workflow."
      currentPath="/admin/blogs/drafts"
      user={user}
      counts={counts}
      notice={notice}
    >
      <AdminBlogTable
        title="Draft articles"
        description="Keep iterating on drafts here, then push them into the pending review queue when they are ready."
        basePath="/admin/blogs/drafts"
        createHref="/admin/blogs/new"
        posts={blogList.items}
        pagination={blogList.pagination}
        categories={categories}
        searchValue={search}
        categoryValue={category}
        emptyTitle="No drafts yet"
        emptyDescription="Save a draft from the new article editor to start building your editorial backlog."
      />
    </AdminShell>
  );
}
