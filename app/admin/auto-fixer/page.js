import { redirect } from 'next/navigation';
import { getBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import AdminShell from '../../components/admin/AdminShell';
import AdminAutoFixerTool from '../../components/admin/AdminAutoFixerTool.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bulk Auto-Fixer | Admin | Zenith',
  robots: { index: false, follow: false }
};

export default async function AdminAutoFixerPage() {
  const sessionUser = await getBlogSessionUser();
  if (!sessionUser) {
    redirect('/admin?next=/admin/auto-fixer');
  }

  return (
    <AdminShell currentPath="/admin/auto-fixer">
      <div style={{ padding: '24px' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '600' }}>Image Auto-Fixer</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary, #9ca3af)' }}>
            Automatically resolve missing or broken player images by scraping Renderz and uploading directly to Zenith CDNs.
          </p>
        </header>
        
        <AdminAutoFixerTool />
      </div>
    </AdminShell>
  );
}
