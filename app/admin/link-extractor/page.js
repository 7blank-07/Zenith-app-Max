import AdminShell from '../../components/admin/AdminShell';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../src/lib/server/streams/repository.mjs';
import { getPartnerDashboardCounts } from '../../../src/lib/server/partners/repository.mjs';
import LinkExtractorClient from '../../components/admin/LinkExtractorClient.client';

export const metadata = {
  title: 'Link Extractor | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function LinkExtractorPage() {
  const user = await requireBlogSessionUser();
  const scope = user?.role === 'admin' ? {} : { authorId: user?.id };
  const [counts, redeemCounts, streamCounts, partnerCounts] = await Promise.all([
    getBlogDashboardCounts(scope),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts()
  ]);

  const allCounts = {
    ...counts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Link Extractor"
      description="Extract player image, background, nation, league, and club images from a Zenith player URL."
      currentPath="/admin/link-extractor"
      user={user}
      counts={allCounts}
    >
      <LinkExtractorClient />
    </AdminShell>
  );
}
