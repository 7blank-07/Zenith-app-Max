import AdminShell from '../../components/admin/AdminShell';
import AdminPartnerTable from '../../components/admin/AdminPartnerTable';
import { getPartnerDashboardCounts, listAdminPartners } from '../../../src/lib/server/partners/repository.mjs';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../src/lib/server/streams/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Partners Dashboard | Zenith Admin',
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

export default async function AdminPartnersPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/partners' });
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const platform = readSearchParam(searchParams, 'platform');
  const notice = readSearchParam(searchParams, 'notice');

  const [blogCounts, redeemCounts, streamCounts, partnerCounts, partnerList] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts(),
    listAdminPartners({
      page,
      search,
      platform
    })
  ]);

  const allCounts = {
    ...blogCounts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Partners dashboard"
      description="Manage ZenithFCM official partners, creators, and community supporters."
      currentPath="/admin/partners"
      user={user}
      counts={allCounts}
      notice={notice}
    >
      <AdminPartnerTable
        title="All partners"
        description="Review and manage the list of creators, streamers, and communities."
        basePath="/admin/partners"
        createHref="/admin/partners/new"
        partners={partnerList.items}
        pagination={partnerList.pagination}
        searchValue={search}
        platformValue={platform}
        emptyTitle="No partners yet"
        emptyDescription="Add your first official partner to start building the ecosystem page."
      />
    </AdminShell>
  );
}
