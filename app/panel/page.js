import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function PanelDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Super Mega Panel Dashboard</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Welcome to the ultimate CMS for Zenith FC Mobile. Manage players, playstyles, and traits.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Module Card */}
        <div style={{ backgroundColor: '#1A1D21', padding: '24px', borderRadius: '12px', border: '1px solid #2A2D31' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Players Editor</h2>
          <p style={{ color: '#98A0A6', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
            Search for any player in the database and override their stats, core info, event tags, or assign them new traits and playstyles.
          </p>
          <Link href="/panel/players" style={{ display: 'inline-block', backgroundColor: '#3B82F6', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            Manage Players &rarr;
          </Link>
        </div>

        {/* Module Card */}
        <div style={{ backgroundColor: '#1A1D21', padding: '24px', borderRadius: '12px', border: '1px solid #2A2D31' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Playstyles Catalog</h2>
          <p style={{ color: '#98A0A6', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
            Edit playstyle descriptions and upload unique icons for Level 1 and Level 2. Changes apply globally to all players.
          </p>
          <Link href="/panel/playstyles" style={{ display: 'inline-block', backgroundColor: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            Manage Playstyles &rarr;
          </Link>
        </div>

        {/* Module Card */}
        <div style={{ backgroundColor: '#1A1D21', padding: '24px', borderRadius: '12px', border: '1px solid #2A2D31' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Traits Dictionary</h2>
          <p style={{ color: '#98A0A6', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
            Update global trait names and upload custom trait icons. Ensure database consistency across all player cards.
          </p>
          <Link href="/panel/traits" style={{ display: 'inline-block', backgroundColor: '#F59E0B', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            Manage Traits &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
