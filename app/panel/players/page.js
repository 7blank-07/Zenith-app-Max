import PlayerSearch from './PlayerSearch.client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function PlayersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Players Editor</h1>
          <p style={{ color: '#98A0A6', margin: 0 }}>
            Search for any player in the database to override their OCR-extracted data, stats, traits, or playstyles.
          </p>
        </div>
        <Link href="/panel/players/new" style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Add New Player
        </Link>
      </div>
      
      <PlayerSearch />
    </div>
  );
}
