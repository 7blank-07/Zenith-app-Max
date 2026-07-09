import { redirect } from 'next/navigation';
import { getBlogSessionUser } from '../../src/lib/server/blog/auth.mjs';
import Link from 'next/link';

export const metadata = {
  title: 'Zenith Super Mega Panel',
  robots: { index: false, follow: false }
};

export default async function PanelLayout({ children }) {
  const sessionUser = await getBlogSessionUser();

  if (!sessionUser) {
    redirect('/admin');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'var(--font-primary, sans-serif)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#111111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #333' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#FFD700' }}>MEGA PANEL</h2>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Logged in as {sessionUser.username || 'Admin'}</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link href="/panel" style={{ display: 'block', padding: '12px 24px', color: '#EEE', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/panel/players" style={{ display: 'block', padding: '12px 24px', color: '#EEE', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                Players Editor
              </Link>
            </li>
            <li>
              <Link href="/panel/playstyles" style={{ display: 'block', padding: '12px 24px', color: '#EEE', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                Playstyles Catalog
              </Link>
            </li>
            <li>
              <Link href="/panel/traits" style={{ display: 'block', padding: '12px 24px', color: '#EEE', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                Traits Dictionary
              </Link>
            </li>
            <li>
              <Link href="/panel/images" style={{ display: 'block', padding: '12px 24px', color: '#EEE', textDecoration: 'none', borderBottom: '1px solid #222' }}>
                Image Uploader
              </Link>
            </li>
          </ul>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #333' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>&larr; Back to Site</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#0A0A0A' }}>
        {children}
      </main>
    </div>
  );
}
