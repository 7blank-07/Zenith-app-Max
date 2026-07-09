import { fetchTraitsAction } from '../../actions/panel-actions';
import TraitEditor from './TraitEditor.client';

export const dynamic = 'force-dynamic';

export default async function TraitsPage() {
  const data = await fetchTraitsAction();
  const traits = data?.traits || [];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Traits Dictionary</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Manage trait names and upload icons globally. Changes will cascade to all players.
      </p>

      <TraitEditor initialTraits={traits} />
    </div>
  );
}
