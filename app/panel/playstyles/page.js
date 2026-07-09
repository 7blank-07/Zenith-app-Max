import { fetchPlaystylesAction } from '../../actions/panel-actions';
import PlaystyleEditor from './PlaystyleEditor.client';

export const dynamic = 'force-dynamic';

export default async function PlaystylesPage() {
  const data = await fetchPlaystylesAction();
  const playstyles = data?.playstyles || [];

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Playstyles Catalog</h1>
      <p style={{ color: '#98A0A6', marginBottom: '40px' }}>
        Manage playstyles globally. Changes here will immediately reflect on all players possessing these playstyles.
      </p>

      <PlaystyleEditor initialPlaystyles={playstyles} />
    </div>
  );
}
