import AdminShell from '../../components/admin/AdminShell';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../src/lib/server/streams/repository.mjs';
import { getPartnerDashboardCounts } from '../../../src/lib/server/partners/repository.mjs';
import ImageUploadWidget from '../../components/admin/ImageUploadWidget.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Upload Image | Zenith Admin',
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminUploadImagePage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/upload-image' });
  const scope = user?.role === 'admin' ? {} : { authorId: user?.id };
  
  const [counts, redeemCounts, streamCounts, partnerCounts] = await Promise.all([
    getBlogDashboardCounts(scope),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts(),
  ]);

  const allCounts = {
    ...counts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Image Uploader"
      description="Upload assets to the CDN (images.zenithfcm.com) for use in blog posts or other areas."
      currentPath="/admin/upload-image"
      user={user}
      counts={allCounts}
    >
      <ImageUploadWidget />
    </AdminShell>
  );
}
