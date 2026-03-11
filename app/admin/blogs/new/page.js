import AdminShell from '../../../components/admin/AdminShell';
import BlogEditor from '../../../components/admin/blog/BlogEditor.client';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts, listBlogCategories } from '../../../../src/lib/server/blog/repository.mjs';
import { getBlogEditorCapabilities } from '../../../../src/lib/server/blog/workflow.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Blog Post | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
};

function getAuthorScope(user) {
  return user?.role === 'admin' ? {} : { authorId: user?.id };
}

export default async function NewBlogPostPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/blogs/new', permission: 'edit-blogs' });
  const scope = getAuthorScope(user);
  const [counts, categories] = await Promise.all([
    getBlogDashboardCounts(scope),
    listBlogCategories()
  ]);

  return (
    <AdminShell
      title="Create a new article"
      description="Write, save, and route new FC Mobile content through the editorial workflow."
      currentPath="/admin/blogs"
      user={user}
      counts={counts}
      notice={typeof searchParams?.notice === 'string' ? searchParams.notice : ''}
    >
      <BlogEditor
        user={user}
        categories={categories}
        capabilities={getBlogEditorCapabilities(user, null)}
      />
    </AdminShell>
  );
}

