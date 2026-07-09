import { getBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { redirect } from 'next/navigation';
import PlayerDetailEditor from './PlayerDetailEditor.client';

export const dynamic = 'force-dynamic';

export default async function PlayerEditorPage({ params }) {
  const user = await getBlogSessionUser();
  if (!user) redirect('/admin');

  // Fetch the current player data via the public API route
  let player = null;
  try {
    const API_BASE = process.env.FASTAPI_URL ? process.env.FASTAPI_URL.replace('/panel', '') : 'http://127.0.0.1:8001/api';
    const res = await fetch(`${API_BASE}/players/${params.id}`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch player: ${res.status}`);
    }
    player = await res.json();
  } catch (err) {
    console.error('Error fetching player:', err);
    return (
      <div style={{ color: '#F87171' }}>
        <h2>Error loading player</h2>
        <p>Could not fetch data for ID: {params.id}</p>
        <p>Please ensure the backend API is running.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Edit Player: {player.name}</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Modify database entries directly.
      </p>

      <PlayerDetailEditor player={player} />
    </div>
  );
}
