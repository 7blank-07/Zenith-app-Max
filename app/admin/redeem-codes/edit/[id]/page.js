import { notFound } from 'next/navigation';
import AdminShell from '../../../../components/admin/AdminShell';
import RedeemCodeEditor from '../../../../components/admin/redeem/RedeemCodeEditor.client';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../../../src/lib/server/blog/repository.mjs';
import {
  REDEEM_CODE_SCOPE_OPTIONS
} from '../../../../../src/lib/server/redeem-codes/constants.mjs';
import { getRedeemCodeById, getRedeemDashboardCounts } from '../../../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Redeem Code | Zenith Admin',
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

export default async function EditRedeemCodePage({ params, searchParams = {} }) {
  const user = await requireBlogSessionUser({ nextPath: `/admin/redeem-codes/edit/${params.id}`, permission: 'edit-blogs' });
  const blogScope = user?.role === 'admin' ? {} : { authorId: user?.id };
  const [blogCounts, counts, entry] = await Promise.all([
    getBlogDashboardCounts(blogScope),
    getRedeemDashboardCounts(),
    getRedeemCodeById(params.id)
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit redeem code"
      description="Update status, publish timing, and scope while preserving active-versus-expired automation."
      currentPath="/admin/redeem-codes"
      user={user}
      counts={{ ...blogCounts, ...counts }}
      notice={readNotice(searchParams)}
    >
      <RedeemCodeEditor entry={entry} scopeOptions={REDEEM_CODE_SCOPE_OPTIONS} />
    </AdminShell>
  );
}
