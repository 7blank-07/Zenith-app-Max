import AdminShell from '../../../components/admin/AdminShell';
import RedeemCodeEditor from '../../../components/admin/redeem/RedeemCodeEditor.client';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../src/lib/server/blog/repository.mjs';
import {
  REDEEM_CODE_SCOPE_OPTIONS
} from '../../../../src/lib/server/redeem-codes/constants.mjs';
import { getRedeemDashboardCounts } from '../../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Publish Redeem Code | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
};

function readNotice(searchParams) {
  const value = searchParams?.notice;
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }
  return String(value || '').trim();
}

export default async function NewRedeemCodePage({ searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redeem-codes/new', permission: 'edit-blogs' });
  const blogScope = user?.role === 'admin' ? {} : { authorId: user?.id };
  const [blogCounts, counts] = await Promise.all([getBlogDashboardCounts(blogScope), getRedeemDashboardCounts()]);

  return (
    <AdminShell
      title="Publish redeem code"
      description="Add a new code and choose whether it goes live immediately or enters the expired archive."
      currentPath="/admin/redeem-codes"
      user={user}
      counts={{ ...blogCounts, ...counts }}
      notice={readNotice(searchParams)}
    >
      <RedeemCodeEditor scopeOptions={REDEEM_CODE_SCOPE_OPTIONS} />
    </AdminShell>
  );
}
