import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';

export default function PlayerNotFound() {
  return (
    <SiteChrome activeView="players">
      <main style={{ padding: '60px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--color-text-primary, #E6EEF2)', marginBottom: '16px' }}>
          Player Not Found
        </h1>
        <p style={{ color: 'var(--color-text-muted, #98A0A6)', marginBottom: '32px', fontSize: '18px' }}>
          We couldn't find the player you're looking for. They may have been removed or the URL might be incorrect.
        </p>
        <Link 
          href="/players" 
          style={{ 
            background: '#00C2A8', 
            color: '#fff', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600' 
          }}
        >
          Back to Players Database
        </Link>
      </main>
    </SiteChrome>
  );
}
