import AdminShell from '../../components/admin/AdminShell';
import AdminStreamTable from '../../components/admin/streaming/AdminStreamTable';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getStreamDashboardCounts, listAdminStreams } from '../../../src/lib/server/streams/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Streaming Hub | Zenith Admin',
  robots: { index: false, follow: false }
};

function readSearchParam(searchParams, key) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
}

function parsePage(searchParams) {
  const parsed = Number.parseInt(readSearchParam(searchParams, 'page'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminStreamingPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/streaming' });
  const blogScope = user?.role === 'admin' ? {} : { authorId: user?.id };
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const status = readSearchParam(searchParams, 'status');
  const notice = readSearchParam(searchParams, 'notice');

  const [blogCounts, streamCounts, list] = await Promise.all([
    getBlogDashboardCounts(blogScope),
    getStreamDashboardCounts(),
    listAdminStreams({ page, search, status })
  ]);

  // Rename total to streamingTotal so the AdminSidebar can pick it up
  const counts = { ...blogCounts, ...streamCounts, streamingTotal: streamCounts.total };

  return (
    <AdminShell
      title="Streaming dashboard"
      description="Manage live streams, upcoming events, and tournament replays for the ZenithFC Live Hub."
      currentPath="/admin/streaming"
      user={user}
      counts={counts}
      notice={notice}
    >
      <AdminStreamTable
        title="All Streams"
        description="Filter streams by status, tournament name, or title."
        basePath="/admin/streaming"
        createHref="/admin/streaming/new"
        entries={list.items}
        pagination={list.pagination}
        searchValue={search}
        statusValue={status}
      />
    </AdminShell>
  );
}
