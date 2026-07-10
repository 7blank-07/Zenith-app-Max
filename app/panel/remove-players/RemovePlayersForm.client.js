'use client';

import { useState } from 'react';
import { bulkDeletePlayersAction } from '../../actions/panel-actions';

export default function RemovePlayersForm({ events = [] }) {
  const [minOvr, setMinOvr] = useState('');
  const [maxOvr, setMaxOvr] = useState('');
  const [eventName, setEventName] = useState('');
  const [dateAdded, setDateAdded] = useState('');
  
  const [isSuperDelete, setIsSuperDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFilteredDelete = async (e) => {
    e.preventDefault();
    
    if (!minOvr && !maxOvr && !eventName && !dateAdded) {
      setError('Please provide at least one filter for deletion.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete players matching these filters? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const payload = {};
      if (minOvr) payload.min_ovr = parseInt(minOvr, 10);
      if (maxOvr) payload.max_ovr = parseInt(maxOvr, 10);
      if (eventName) payload.event_name = eventName;
      if (dateAdded) payload.date_added = dateAdded;
      
      const res = await bulkDeletePlayersAction(payload);
      setMessage(res.message);
    } catch (err) {
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperDelete = async (e) => {
    e.preventDefault();
    if (confirmText !== 'delete all players at ones') {
      setError('Confirmation text does not match.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const payload = { super_supreme: true };
      const res = await bulkDeletePlayersAction(payload);
      setMessage(res.message);
      setIsSuperDelete(false);
      setConfirmText('');
    } catch (err) {
      setError(err.message || 'An error occurred during super deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      {message && <div style={{ padding: '16px', backgroundColor: '#065F46', color: '#D1FAE5', borderRadius: '8px', marginBottom: '24px' }}>{message}</div>}
      {error && <div style={{ padding: '16px', backgroundColor: '#7F1D1D', color: '#FEE2E2', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

      <div style={{ backgroundColor: '#1A1D21', padding: '24px', borderRadius: '12px', border: '1px solid #2A2D31', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Filtered Deletion</h2>
        <form onSubmit={handleFilteredDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#98A0A6' }}>Min OVR</label>
              <input type="number" value={minOvr} onChange={e => setMinOvr(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: 'white' }} placeholder="e.g. 80" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#98A0A6' }}>Max OVR</label>
              <input type="number" value={maxOvr} onChange={e => setMaxOvr(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: 'white' }} placeholder="e.g. 90" />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#98A0A6' }}>Event Name</label>
            <select value={eventName} onChange={e => setEventName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: 'white', appearance: 'none' }}>
              <option value="">Select Event (Optional)</option>
              {events.map((evt) => (
                <option key={evt} value={evt}>{evt}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#98A0A6' }}>Date Added (YYYY-MM-DD)</label>
            <input type="date" value={dateAdded} onChange={e => setDateAdded(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: 'white' }} />
          </div>
          
          <button type="submit" disabled={loading} style={{ marginTop: '16px', padding: '12px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Delete Filtered Players'}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#2B1414', padding: '24px', borderRadius: '12px', border: '1px solid #5C1919' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#FCA5A5' }}>Super Supreme Delete</h2>
        <p style={{ color: '#F87171', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
          DANGER: This will delete ALL players in the database.
        </p>
        
        {!isSuperDelete ? (
          <button onClick={() => setIsSuperDelete(true)} style={{ padding: '12px 24px', backgroundColor: '#7F1D1D', color: '#FEE2E2', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Initiate Super Supreme Delete
          </button>
        ) : (
          <form onSubmit={handleSuperDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#FCA5A5' }}>
                Type <strong style={{ color: 'white' }}>delete all players at ones</strong> to confirm:
              </label>
              <input 
                type="text" 
                value={confirmText} 
                onChange={e => setConfirmText(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #7F1D1D', backgroundColor: '#450A0A', color: 'white' }} 
                placeholder="delete all players at ones"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading || confirmText !== 'delete all players at ones'} style={{ flex: 1, padding: '12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (confirmText !== 'delete all players at ones') ? 'not-allowed' : 'pointer', opacity: (confirmText !== 'delete all players at ones') ? 0.5 : 1 }}>
                {loading ? 'Processing...' : 'CONFIRM DELETE ALL'}
              </button>
              <button type="button" onClick={() => { setIsSuperDelete(false); setConfirmText(''); }} disabled={loading} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#FCA5A5', border: '1px solid #7F1D1D', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
