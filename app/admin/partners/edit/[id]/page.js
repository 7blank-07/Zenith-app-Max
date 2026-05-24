import { notFound } from 'next/navigation';
import AdminShell from '../../../../components/admin/AdminShell';
import AdminPartnerForm from '../../../../components/admin/AdminPartnerForm';
import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { submitPartnerEditorAction } from '../../../../actions/partner-editor';
import { getPartnerById, getPartnerDashboardCounts } from '../../../../../src/lib/server/partners/repository.mjs';
import { getBlogDashboardCounts } from '../../../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../../../src/lib/server/streams/repository.mjs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Partner | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function EditPartnerPage({ params, searchParams }) {
  const { id } = params;
  const user = await requireBlogSessionUser({ nextPath: `/admin/partners/edit/${id}` });

  const [partner, blogCounts, redeemCounts, streamCounts, partnerCounts] = await Promise.all([
    getPartnerById(id),
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts()
  ]);

  if (!partner) {
    notFound();
  }

  const allCounts = {
    ...blogCounts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  const notice = searchParams?.notice;

  return (
    <AdminShell
      title={`Edit ${partner.name}`}
      description="Update partner details, platform information, or ecosystem visibility."
      currentPath="/admin/partners"
      user={user}
      counts={allCounts}
      notice={notice}
    >
      <AdminPartnerForm action={submitPartnerEditorAction} partner={partner} />
    </AdminShell>
  );
}
