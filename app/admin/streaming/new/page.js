import AdminShell from '../../../components/admin/AdminShell';
import StreamEditor from '../../../components/admin/streaming/StreamEditor.client';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../src/lib/server/blog/repository.mjs';
import { getStreamDashboardCounts } from '../../../../src/lib/server/streams/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Stream | Zenith Admin',
  robots: { index: false, follow: false }
};

function readNotice(searchParams) {
  const value = searchParams?.notice;
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
}

export default async function NewStreamPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/streaming/new', permission: 'edit-blogs' });
  const blogScope = user?.role === 'admin' ? {} : { authorId: user?.id };
  const [blogCounts, streamCounts] = await Promise.all([
    getBlogDashboardCounts(blogScope),
    getStreamDashboardCounts()
  ]);

  const counts = { ...blogCounts, ...streamCounts, streamingTotal: streamCounts.total };

  return (
    <AdminShell
      title="Create stream"
      description="Add a new live stream, upcoming event, or replay to the Streaming Hub."
      currentPath="/admin/streaming"
      user={user}
      counts={counts}
      notice={readNotice(searchParams)}
    >
      <StreamEditor />
    </AdminShell>
  );
}
