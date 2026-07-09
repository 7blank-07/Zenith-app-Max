'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      setResults(data.players || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search player name (e.g. totti 120)..." 
          style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#111', color: 'white' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {results.map(player => (
            <Link href={`/panel/players/${player.player_id}`} key={player.player_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#1A1D21', border: '1px solid #2A2D31', borderRadius: '12px', textDecoration: 'none', color: 'white' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#0A0A0A', borderRadius: '50%', overflow: 'hidden' }}>
                <img src={player.player_image} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{player.name}</h3>
                <span style={{ fontSize: '12px', padding: '2px 6px', backgroundColor: '#333', borderRadius: '4px', color: '#AAA' }}>{player.ovr} OVR | {player.position}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
