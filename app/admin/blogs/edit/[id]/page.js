import { notFound, redirect } from 'next/navigation';
import AdminShell from '../../../../components/admin/AdminShell';
import BlogEditor from '../../../../components/admin/blog/BlogEditor.client';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { getBlogById, getBlogDashboardCounts, listBlogCategories } from '../../../../../src/lib/server/blog/repository.mjs';
import { canEditBlogPost, getBlogEditorCapabilities } from '../../../../../src/lib/server/blog/workflow.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Blog Post | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
};

function getAuthorScope(user) {
  return user?.role === 'admin' ? {} : { authorId: user?.id };
}

function readNotice(searchParams) {
  const raw = searchParams?.notice;
  if (Array.isArray(raw)) {
    return String(raw[0] || '').trim();
  }

  return String(raw || '').trim();
}

export default async function EditBlogPostPage({ params, searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: `/admin/blogs/edit/${params.id}`, permission: 'edit-blogs' });
  const scope = getAuthorScope(user);

  const [counts, categories, post] = await Promise.all([
    getBlogDashboardCounts(scope),
    listBlogCategories(),
    getBlogById(params.id)
  ]);

  if (!post) {
    notFound();
  }

  if (!canEditBlogPost(user, post)) {
    redirect('/admin/blogs?notice=You%20are%20not%20allowed%20to%20edit%20that%20article.');
  }

  return (
    <AdminShell
      title="Edit article"
      description="Update content, adjust metadata, and move this article through the editorial workflow."
      currentPath="/admin/blogs"
      user={user}
      counts={counts}
      notice={readNotice(searchParams)}
    >
      <BlogEditor
        user={user}
        post={post}
        categories={categories}
        capabilities={getBlogEditorCapabilities(user, post)}
      />
    </AdminShell>
  );
}

