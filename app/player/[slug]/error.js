'use client';

import Link from 'next/link';
import SiteChrome from '../../components/SiteChrome';

export default function PlayerError({ error, reset }) {
  return (
    <SiteChrome activeView="players">
      <main style={{ padding: '60px 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '32px', color: '#FF6B6B', marginBottom: '16px' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--color-text-muted, #98A0A6)', marginBottom: '32px', fontSize: '18px' }}>
          An error occurred while trying to load this player's data.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => reset()}
            style={{ 
              background: '#333C44', 
              color: '#E6EEF2', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Try Again
          </button>
          <Link 
            href="/players" 
            style={{ 
              background: '#00C2A8', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Back to Database
          </Link>
        </div>
      </main>
    </SiteChrome>
  );
}
