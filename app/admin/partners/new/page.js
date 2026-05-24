import AdminShell from '../../../components/admin/AdminShell';
import AdminPartnerForm from '../../../components/admin/AdminPartnerForm';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { submitPartnerEditorAction } from '../../../actions/partner-editor';
import { getPartnerDashboardCounts } from '../../../../src/lib/server/partners/repository.mjs';
import { getBlogDashboardCounts } from '../../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../../src/lib/server/streams/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add New Partner | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function NewPartnerPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/partners/new' });

  const [blogCounts, redeemCounts, streamCounts, partnerCounts] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts()
  ]);

  const allCounts = {
    ...blogCounts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Add new partner"
      description="Register a new official partner to the ZenithFCM ecosystem."
      currentPath="/admin/partners"
      user={user}
      counts={allCounts}
    >
      <AdminPartnerForm action={submitPartnerEditorAction} />
    </AdminShell>
  );
}
