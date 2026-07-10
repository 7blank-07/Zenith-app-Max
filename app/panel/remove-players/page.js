import { getBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { redirect } from 'next/navigation';
import RemovePlayersForm from './RemovePlayersForm.client';
import { fetchAllPlayerFilterMetadata } from '../../../src/lib/server/top-players.mjs';

export const dynamic = 'force-dynamic';

export default async function RemovePlayersPage() {
  const user = await getBlogSessionUser();
  if (!user) redirect('/admin');

  const filterMetadata = await fetchAllPlayerFilterMetadata({ rank: 0 });
  const events = filterMetadata.events || [];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#EF4444' }}>Remove Players</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Use filters below to bulk delete players, or proceed with extreme caution to delete all players at once.
      </p>

      <RemovePlayersForm events={events} />
    </div>
  );
}
