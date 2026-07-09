'use client';

import { useState } from 'react';
import { updateTraitAction } from '../../actions/panel-actions';

export default function TraitEditor({ initialTraits }) {
  const [traits, setTraits] = useState(initialTraits);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({ ...t, old_name: t.name });
    setMessage('');
  };

  const handleSave = async (id) => {
    setLoading(true);
    setMessage('');
    try {
      await updateTraitAction({
        old_name: formData.old_name,
        name: formData.name,
        icon_url: formData.icon_url
      });
      setTraits(prev => prev.map(t => t.id === id ? { ...t, name: formData.name, icon_url: formData.icon_url, id: formData.name } : t));
      setEditingId(null);
      setMessage('Successfully updated trait and cascaded changes.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredTraits = traits.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {message && <div style={{ padding: '12px', backgroundColor: message.startsWith('Error') ? '#991B1B' : '#065F46', color: 'white', marginBottom: '24px', borderRadius: '6px' }}>{message}</div>}
      
      <div style={{ marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search traits..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px', backgroundColor: '#1A1D21', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '16px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {filteredTraits.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <div key={t.id} style={{ backgroundColor: '#1A1D21', border: '1px solid #2A2D31', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Icon URL</label>
                    <input 
                      type="text" 
                      value={formData.icon_url || ''} 
                      onChange={e => setFormData({...formData, icon_url: e.target.value})}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button onClick={() => handleSave(t.id)} disabled={loading} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} disabled={loading} style={{ backgroundColor: '#374151', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#222', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {t.icon_url ? <img src={t.icon_url} alt={t.name} style={{ maxWidth: '24px', maxHeight: '24px' }} /> : <span style={{ color: '#555', fontSize: '10px' }}>No Icon</span>}
                    </div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>{t.name}</h3>
                  </div>
                  <button onClick={() => handleEdit(t)} style={{ backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
