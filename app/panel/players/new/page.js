import { getBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import { redirect } from 'next/navigation';
import PlayerDetailEditor from '../[id]/PlayerDetailEditor.client';

export const dynamic = 'force-dynamic';

export default async function NewPlayerPage() {
  const user = await getBlogSessionUser();
  if (!user) redirect('/admin');

  // Empty player template
  const newPlayer = {};

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Create New Player</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Fill out the details below to add a new player to the database.
      </p>

      <PlayerDetailEditor player={newPlayer} />
    </div>
  );
}
