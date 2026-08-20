import { redirect } from 'next/navigation';
import { getBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import AdminShell from '../../components/admin/AdminShell';
import AdminAssetIdTool from '../../components/admin/AdminAssetIdTool.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Asset ID Tool | Admin | Zenith',
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminAssetIdPage() {
  const sessionUser = await getBlogSessionUser();
  if (!sessionUser) {
    redirect('/admin?next=/admin/asset-id');
  }

  return (
    <AdminShell currentPath="/admin/asset-id">
      <div style={{ padding: '24px' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '600' }}>Asset ID Fetcher</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary, #9ca3af)' }}>
            Extract and fetch internal player Asset IDs by pasting their profile URLs.
          </p>
        </header>
        
        <AdminAssetIdTool />
      </div>
    </AdminShell>
  );
}
