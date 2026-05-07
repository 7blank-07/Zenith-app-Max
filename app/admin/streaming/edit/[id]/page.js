import AdminShell from '../../../../components/admin/AdminShell';
import StreamEditor from '../../../../components/admin/streaming/StreamEditor.client';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../../src/lib/server/blog/repository.mjs';
import { getStreamById, getStreamDashboardCounts } from '../../../../../src/lib/server/streams/repository.mjs';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Stream | Zenith Admin',
  robots: { index: false, follow: false }
};

function readNotice(searchParams) {
  const value = searchParams?.notice;
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
}

export default async function EditStreamPage({ params, searchParams = {} }) {
  const streamId = params?.id;
  if (!streamId) {
    notFound();
  }

  const user = await requireBlogSessionUser({ nextPath: `/admin/streaming/edit/${streamId}`, permission: 'edit-blogs' });
  const blogScope = user?.role === 'admin' ? {} : { authorId: user?.id };
  
  const [stream, blogCounts, streamCounts] = await Promise.all([
    getStreamById(streamId),
    getBlogDashboardCounts(blogScope),
    getStreamDashboardCounts()
  ]);

  if (!stream) {
    notFound();
  }

  const counts = { ...blogCounts, ...streamCounts, streamingTotal: streamCounts.total };

  return (
    <AdminShell
      title="Edit stream"
      description="Update stream details, status, or YouTube IDs."
      currentPath="/admin/streaming"
      user={user}
      counts={counts}
      notice={readNotice(searchParams)}
    >
      <StreamEditor entry={stream} notice={readNotice(searchParams)} />
    </AdminShell>
  );
}
