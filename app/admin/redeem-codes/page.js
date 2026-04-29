import AdminShell from '../../components/admin/AdminShell';
import AdminRedeemCodeTable from '../../components/admin/redeem/AdminRedeemCodeTable';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import {
  REDEEM_CODE_SCOPE_OPTIONS
} from '../../../src/lib/server/redeem-codes/constants.mjs';
import {
  getRedeemDashboardCounts,
  listAdminRedeemCodes
} from '../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Redeem Codes | Zenith Admin',
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

export default async function AdminRedeemCodesPage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redeem-codes' });
  const blogScope = getAuthorScope(user);
  const page = parsePage(searchParams);
  const search = readSearchParam(searchParams, 'search');
  const scope = readSearchParam(searchParams, 'scope');
  const status = readSearchParam(searchParams, 'status');
  const notice = readSearchParam(searchParams, 'notice');

  const [blogCounts, counts, list] = await Promise.all([
    getBlogDashboardCounts(blogScope),
    getRedeemDashboardCounts(),
    listAdminRedeemCodes({
      page,
      search,
      scope,
      status
    })
  ]);

  return (
    <AdminShell
      title="Redeem code dashboard"
      description="Publish active FC Mobile redeem codes, archive expired entries, and keep regional pages fresh."
      currentPath="/admin/redeem-codes"
      user={user}
      counts={{ ...blogCounts, ...counts }}
      notice={notice}
    >
      <AdminRedeemCodeTable
        title="All redeem codes"
        description="Use filters to find any code by country scope, status, title, or exact code value."
        basePath="/admin/redeem-codes"
        createHref="/admin/redeem-codes/new"
        entries={list.items}
        pagination={list.pagination}
        searchValue={search}
        scopeValue={scope}
        statusValue={status}
        scopeOptions={REDEEM_CODE_SCOPE_OPTIONS}
      />
    </AdminShell>
  );
}
